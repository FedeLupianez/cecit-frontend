<script lang="ts">
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { ArrowLeft, RefreshCw, Ticket } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import { accessToken } from "$lib/stores/authStore";
    import { profileStore } from "$lib/stores/profileStore";
    import { apiFetch } from "$lib/api";

    type VoucherStatus = "PENDING" | "DELIVERED" | "EXPIRED" | "REJECTED";

    interface Partner {
        id_partner: string;
        name: string;
        logo: string;
    }

    interface Benefit {
        id_benefit: string;
        id_partner: string;
        partner: string;
        title: string;
        description: string;
        image: string;
        logo: string;
        type: string;
        categories: string[];
        payment_methods: string[];
        directions: string[];
        start_date: string;
        end_date: string;
        coupons: number;
        max_coupons: number;
        max_per_user: number;
        refund_limit: number | null;
        status: "ACTIVE" | "INACTIVE" | "PENDING";
    }

    interface Redeemer {
        token: string;
        id_account: string;
        id_user: string;
        user_name: string;
        user_lastname: string;
        user_dni: string;
        user_email: string | null;
        application_date: string;
        delivery_date: string | null;
        limit_date: string;
        status: VoucherStatus;
    }

    const STATUS_LABEL: Record<VoucherStatus, string> = {
        PENDING: "Pendiente",
        DELIVERED: "Canjeado",
        EXPIRED: "Expirado",
        REJECTED: "Rechazado",
    };

    const STATUS_ORDER: VoucherStatus[] = [
        "PENDING",
        "DELIVERED",
        "EXPIRED",
        "REJECTED",
    ];

    const idBenefit = $derived(page.params.id_benefit ?? "");
    const partnerIdParam = $derived(
        page.url.searchParams.get("id_partner") ?? "",
    );

    let partner = $state<Partner | undefined>(undefined);
    let benefit = $state<Benefit | undefined>(undefined);
    let redeemers = $state<Redeemer[]>([]);
    let loading = $state(true);
    let redeemersLoading = $state(false);
    let error = $state("");

    let statusFilter = $state<VoucherStatus | "ALL">("ALL");
    let search = $state("");

    let lastLoadedId: string | null = null;

    const counts = $derived(
        redeemers.reduce<Record<string, number>>(
            (acc, r) => {
                acc[r.status] = (acc[r.status] ?? 0) + 1;
                return acc;
            },
            { ALL: redeemers.length },
        ),
    );

    const filtered = $derived(
        redeemers.filter((r) => {
            if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
            const term = search.trim().toLowerCase();
            if (!term) return true;
            return [
                r.user_name,
                r.user_lastname,
                r.user_dni,
                r.user_email ?? "",
                r.token,
            ]
                .join(" ")
                .toLowerCase()
                .includes(term);
        }),
    );

    $effect(() => {
        const profile = profileStore.getProfile();
        if (profile && profile.role !== "PARTNER_ADMIN")
            goto("/business-panel");
    });

    function formatDate(value: string | null | undefined) {
        if (!value) return "—";
        const parts = value.slice(0, 10).split("-").map(Number);
        let date: Date;
        if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
            date = new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
            date = new Date(value);
        }
        if (Number.isNaN(date.getTime())) return "—";
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    async function parseError(response: Response) {
        try {
            const data = await response.json();
            if (data?.message) {
                return Array.isArray(data.message)
                    ? data.message.join(", ")
                    : String(data.message);
            }
        } catch {
            /* sin cuerpo JSON */
        }
        return "Ocurrió un error.";
    }

    async function loadRedeemers(id_partner: string) {
        redeemersLoading = true;
        try {
            const response = await apiFetch(
                `/api/vouchers/redeemed?id_benefit=${encodeURIComponent(idBenefit)}&id_partner=${encodeURIComponent(id_partner)}`,
                { credentials: "include" },
            );
            if (!response.ok) {
                const message = await parseError(response);
                toast.error(message);
                redeemers = [];
                return;
            }
            const data = await response.json();
            redeemers = Array.isArray(data) ? data : [];
        } catch {
            toast.error("No se pudieron cargar los canjes del beneficio.");
            redeemers = [];
        } finally {
            redeemersLoading = false;
        }
    }

    async function load(id: string) {
        if (!id || lastLoadedId === id) return;
        lastLoadedId = id;
        loading = true;
        error = "";
        benefit = undefined;
        redeemers = [];
        partner = undefined;
        statusFilter = "ALL";
        search = "";

        if (!accessToken.getToken()) {
            error = "Tu sesión expiró. Volvé a iniciar sesión.";
            loading = false;
            return;
        }

        try {
            const partnersResponse = await apiFetch(
                "/api/partners-admins/me/all",
                { credentials: "include" },
            );
            if (partnersResponse.status === 401 || partnersResponse.status === 403) {
                error = "No tenés permiso para ver este beneficio.";
                loading = false;
                return;
            }
            if (!partnersResponse.ok) {
                error = "No se pudieron obtener tus negocios.";
                loading = false;
                return;
            }
            const partners: Partner[] = await partnersResponse.json();
            const found = partnerIdParam
                ? partners.find((p) => p.id_partner === partnerIdParam)
                : undefined;

            if (partnerIdParam && !found) {
                error = "No administrás el negocio de este beneficio.";
                loading = false;
                return;
            }
            if (!found && partners.length > 0) partner = partners[0];

            const benefitsResponse = await apiFetch(
                `/api/benefits/partner?id_partner=${encodeURIComponent(found?.id_partner ?? partnerIdParam)}`,
                { credentials: "include" },
            );
            if (!benefitsResponse.ok) {
                error = "No se pudo cargar el beneficio.";
                loading = false;
                return;
            }
            const benefits: Benefit[] = await benefitsResponse.json();
            const match = benefits.find((b) => b.id_benefit === id);
            if (!match) {
                error = "Este beneficio no pertenece a tu negocio.";
                loading = false;
                return;
            }
            benefit = match;
            if (!partner) {
                partner = {
                    id_partner: match.id_partner,
                    name: match.partner,
                    logo: match.logo ?? "",
                };
            }

            await loadRedeemers(match.id_partner);
        } catch (cause) {
            error =
                cause instanceof Error
                    ? cause.message
                    : "No se pudo cargar el beneficio.";
        } finally {
            loading = false;
        }
    }

    async function reload() {
        lastLoadedId = null;
        await load(idBenefit);
    }

    $effect(() => {
        if (idBenefit) load(idBenefit);
    });

    onMount(reload);
</script>

<svelte:head>
    <title>{benefit?.title ?? "Beneficio"} | CeCIT</title>
</svelte:head>

<section class="benefit-page">
    <div class="inner">
        <a class="back-link" href="/business-panel">
            <ArrowLeft size={16} />
            Volver al panel de negocio
        </a>

        {#if loading}
            <p class="state">Cargando beneficio...</p>
        {:else if error}
            <p class="state error">{error}</p>
        {:else if benefit}
            <header class="head">
                <img src={benefit.image} alt={benefit.title} />
                <div class="head-text">
                    <span class="partner-name">{benefit.partner}</span>
                    <h1>{benefit.title}</h1>
                    <div class="badges">
                        <span class="badge {benefit.status.toLowerCase()}">
                            {benefit.status === "ACTIVE"
                                ? "Activo"
                                : benefit.status === "INACTIVE"
                                  ? "Inactivo"
                                  : "Pendiente"}
                        </span>
                        <span class="badge plain">{benefit.type}</span>
                        {#each benefit.categories as category}
                            <span class="badge plain">{category}</span>
                        {/each}
                    </div>
                </div>
                <div class="coupon-track">
                    <strong>{benefit.coupons}</strong>
                    <span>/ {benefit.max_coupons} cupones<br />canjeados</span>
                </div>
            </header>

            <section class="card details">
                <h2>Detalle del beneficio</h2>
                {#if benefit.description}
                    <p class="description">{benefit.description}</p>
                {/if}
                <dl class="detail-grid">
                    <div>
                        <dt>Vigencia</dt>
                        <dd>
                            {formatDate(benefit.start_date)} — {formatDate(
                                benefit.end_date,
                            )}
                        </dd>
                    </div>
                    <div>
                        <dt>Métodos de pago</dt>
                        <dd>
                            {benefit.payment_methods.length > 0
                                ? benefit.payment_methods.join(", ")
                                : "—"}
                        </dd>
                    </div>
                    <div>
                        <dt>Cupones por usuario</dt>
                        <dd>{benefit.max_per_user}</dd>
                    </div>
                    <div>
                        <dt>Límite de reintegro</dt>
                        <dd>
                            {benefit.refund_limit ?? "—"}
                        </dd>
                    </div>
                    <div class="wide">
                        <dt>Direcciones</dt>
                        <dd>
                            {benefit.directions.length > 0
                                ? benefit.directions.join(" · ")
                                : "—"}
                        </dd>
                    </div>
                </dl>
            </section>

            <section class="card">
                <div class="card-head">
                    <h2><Ticket size={20} /> Usuarios que lo canjearon</h2>
                    <button
                        class="refresh-btn"
                        type="button"
                        onclick={reload}
                        disabled={redeemersLoading}
                        aria-label="Recargar canjes"
                    >
                        {#if redeemersLoading}<span class="spinner small"
                        ></span>{:else}<RefreshCw size={14} /> Recargar{/if}
                    </button>
                </div>

                <div class="filters">
                    <div class="status-filters" role="group" aria-label="Filtrar por estado">
                        <button
                            type="button"
                            class="status-btn"
                            class:on={statusFilter === "ALL"}
                            onclick={() => (statusFilter = "ALL")}
                        >
                            Todos ({counts.ALL ?? 0})
                        </button>
                        {#each STATUS_ORDER as status}
                            <button
                                type="button"
                                class="status-btn {status.toLowerCase()}"
                                class:on={statusFilter === status}
                                onclick={() => (statusFilter = status)}
                                disabled={(counts[status] ?? 0) === 0 &&
                                    statusFilter !== status}
                            >
                                {STATUS_LABEL[status]} ({counts[status] ?? 0})
                            </button>
                        {/each}
                    </div>
                    <input
                        type="search"
                        placeholder="Buscar por nombre, DNI, email o token"
                        bind:value={search}
                        aria-label="Buscar canjes"
                    />
                </div>

                {#if redeemersLoading}
                    <p class="state small">Cargando canjes...</p>
                {:else if filtered.length === 0}
                    <p class="state small">
                        {redeemers.length === 0
                            ? "Todavía nadie canjeó este beneficio."
                            : "No hay canjes que coincidan con el filtro."}
                    </p>
                {:else}
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>DNI</th>
                                    <th>Solicitado</th>
                                    <th>Entregado</th>
                                    <th>Vence</th>
                                    <th>Token</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each filtered as redeemer (redeemer.token)}
                                    <tr>
                                        <td>
                                            <strong>
                                                {redeemer.user_name}
                                                {redeemer.user_lastname}
                                            </strong>
                                            {#if redeemer.user_email}
                                                <span class="sub"
                                                    >{redeemer.user_email}</span
                                                >
                                            {:else}
                                                <span class="sub">Sin cuenta</span>
                                            {/if}
                                        </td>
                                        <td>{redeemer.user_dni}</td>
                                        <td>{formatDate(redeemer.application_date)}</td>
                                        <td>{formatDate(redeemer.delivery_date)}</td>
                                        <td>{formatDate(redeemer.limit_date)}</td>
                                        <td class="token">{redeemer.token}</td>
                                        <td>
                                            <span
                                                class="badge {redeemer.status.toLowerCase()}"
                                            >
                                                {STATUS_LABEL[redeemer.status]}
                                            </span>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
            </section>
        {/if}
    </div>
</section>

<style>
    .benefit-page {
        min-height: 70vh;
        padding: 40px 24px 88px;
        background: #fff;
        color: #111;
    }
    .inner {
        width: min(100%, 1160px);
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        width: fit-content;
        color: #151535;
        font-size: 14px;
        text-decoration: none;
    }
    .back-link:hover {
        text-decoration: underline;
    }
    .head {
        display: grid;
        grid-template-columns: 220px minmax(0, 1fr) auto;
        gap: 24px;
        align-items: center;
        border: 1px solid #969696;
        border-radius: 8px;
        padding: 22px 26px;
    }
    .head img {
        width: 100%;
        aspect-ratio: 16 / 10;
        border-radius: 6px;
        object-fit: cover;
        background: #eee;
    }
    .partner-name {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.6px;
        text-transform: uppercase;
        color: #6b7280;
    }
    h1 {
        margin: 4px 0 10px;
        font-size: 26px;
        font-weight: 600;
    }
    .badges {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }
    .coupon-track {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 20px;
        border: 1px solid #777;
        border-radius: 9px;
        text-align: center;
    }
    .coupon-track strong {
        font-size: 30px;
        font-weight: 500;
    }
    .coupon-track span {
        font-size: 12px;
        line-height: 1.25;
        color: #555;
    }
    .card {
        border: 1px solid #969696;
        border-radius: 8px;
        padding: 24px 26px;
    }
    .card > h2,
    .card-head h2 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 14px;
        font-size: 20px;
        font-weight: 600;
    }
    .card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
    }
    .card-head h2 {
        margin: 0;
    }
    .description {
        margin: 0 0 18px;
        color: #333;
        font-size: 15px;
        line-height: 1.5;
    }
    .detail-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px 24px;
        margin: 0;
    }
    .detail-grid .wide {
        grid-column: 1 / -1;
    }
    .detail-grid dt {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        color: #6b7280;
    }
    .detail-grid dd {
        margin: 4px 0 0;
        font-size: 15px;
    }
    .filters {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        margin: 16px 0;
    }
    .status-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    .status-btn {
        padding: 6px 12px;
        border: 1px solid #b8bcc9;
        border-radius: 999px;
        background: #fff;
        color: #6b7280;
        font: inherit;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
    }
    .status-btn.on {
        border-color: #151535;
        background: #151535;
        color: #fff;
    }
    .status-btn:disabled {
        opacity: 0.45;
        cursor: default;
    }
    .filters input {
        flex: 1;
        min-width: 220px;
        padding: 9px 12px;
        border: 1px solid #888;
        border-radius: 5px;
        font: inherit;
        font-size: 14px;
    }
    .filters input:focus-visible {
        outline: 2px solid #19194f;
        outline-offset: 1px;
    }
    .refresh-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        border: 1px solid #9a9a9a;
        border-radius: 999px;
        background: #fff;
        font: inherit;
        font-size: 13px;
        cursor: pointer;
    }
    .refresh-btn:disabled {
        opacity: 0.6;
        cursor: default;
    }
    .table-wrap {
        overflow-x: auto;
        border: 1px solid #d8d8d8;
        border-radius: 8px;
    }
    .data-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
    }
    .data-table th {
        text-align: left;
        padding: 12px 14px;
        background: #f2f3f5;
        color: #4b5468;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        white-space: nowrap;
    }
    .data-table td {
        padding: 12px 14px;
        border-top: 1px solid #eef0f6;
        vertical-align: middle;
    }
    .data-table tbody tr:hover {
        background: #fafbfe;
    }
    .sub {
        display: block;
        margin-top: 3px;
        color: #8a8d95;
        font-size: 12px;
    }
    .token {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 13px;
        letter-spacing: 0.2em;
        font-weight: 700;
        white-space: nowrap;
    }
    .badge {
        display: inline-block;
        width: fit-content;
        padding: 3px 10px;
        border-radius: 999px;
        background: #eef0f7;
        color: #4b5468;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.4px;
    }
    .badge.plain {
        background: #f7f7f7;
    }
    .badge.active,
    .badge.delivered {
        background: #effaf1;
        color: #137333;
    }
    .badge.pending {
        background: #fff8db;
        color: #7a5a00;
    }
    .badge.inactive,
    .badge.expired {
        background: #f0f0f0;
        color: #555;
    }
    .badge.rejected {
        background: #fbeaea;
        color: #a31818;
    }
    .state {
        padding: 24px;
        border: 1px solid #aaa;
        border-radius: 8px;
    }
    .state.small {
        padding: 16px;
        font-size: 14px;
    }
    .error {
        color: #a31818;
        border-color: #d8a0a0;
    }
    .spinner {
        display: inline-block;
        vertical-align: middle;
        width: 16px;
        height: 16px;
        border: 3px solid #e0e0e0;
        border-top-color: #151535;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
    .spinner.small {
        width: 14px;
        height: 14px;
        border-width: 2px;
    }
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
    @media (max-width: 900px) {
        .head {
            grid-template-columns: 1fr;
        }
        .coupon-track {
            justify-content: center;
        }
        .detail-grid {
            grid-template-columns: 1fr;
        }
    }
    @media (max-width: 460px) {
        .benefit-page {
            padding: 24px 14px 64px;
        }
        .filters input {
            min-width: 0;
        }
    }
</style>
