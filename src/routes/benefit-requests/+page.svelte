<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { CheckCircle2, Loader2, Pencil, XCircle } from "lucide-svelte";
    import { toast } from "svelte-sonner";

    import { apiFetch } from "$lib/api";
    import { accessToken } from "$lib/stores/authStore";
    import { profileStore } from "$lib/stores/profileStore";
    import type { Benefit, BenefitStatus } from "$lib/types/Benefit";

    $effect(() => {
        const profile = profileStore.getProfile();
        if (profile && profile.role !== "CECIT_ADMIN") goto("/");
    });

    const STATUS_LABEL: Record<string, string> = {
        PENDING: "Pendiente",
        REJECTED: "Rechazada",
        ACTIVE: "Aceptada",
        INACTIVE: "Desactivada",
    };

    let requests = $state<Benefit[]>([]);
    let loading = $state(true);
    let error = $state("");
    let success = $state("");

    /** Clave `${id_benefit}:${accion}` para el spinner/deshabilitado por fila. */
    let busy = $state("");

    /** Errores por fila, igual que en admin-panel. */
    let rowErrors = $state<Record<string, string>>({});

    let statusFilter = $state<"ALL" | "PENDING" | "REJECTED">("PENDING");
    let search = $state("");

    let editingId = $state("");
    let draft = $state({
        title: "",
        description: "",
        image: "",
        start_date: "",
        end_date: "",
        max_coupons: 0,
        max_per_user: 0,
        refund_limit: null as number | null,
    });

    const counts = $derived(
        requests.reduce<Record<string, number>>(
            (acc, r) => {
                acc[r.status ?? "PENDING"] =
                    (acc[r.status ?? "PENDING"] ?? 0) + 1;
                acc.ALL = requests.length;
                return acc;
            },
            { ALL: 0 },
        ),
    );

    const filtered = $derived(
        requests.filter((r) => {
            if (statusFilter !== "ALL" && r.status !== statusFilter)
                return false;
            const term = search.trim().toLowerCase();
            if (!term) return true;
            return [r.title, r.partner, r.description]
                .join(" ")
                .toLowerCase()
                .includes(term);
        }),
    );

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

    function setError(message: string) {
        error = message;
        success = "";
        toast.error(message);
    }

    function setSuccess(message: string) {
        success = message;
        error = "";
        toast.success(message);
    }

    function authHeaders() {
        return { Authorization: `Bearer ${accessToken.getToken()}` };
    }

    async function loadRequests() {
        loading = true;
        error = "";
        try {
            const response = await apiFetch("/api/benefits/requests");
            if (response.status === 401 || response.status === 403) {
                error = "No tenés permiso para ver las solicitudes.";
                return;
            }
            if (!response.ok) throw new Error(await parseError(response));
            requests = await response.json();
        } catch (cause) {
            error =
                cause instanceof Error
                    ? cause.message
                    : "No se pudieron cargar las solicitudes.";
        } finally {
            loading = false;
        }
    }

    /** El backend responde 200 con la fila actualizada, pero si devuelve otro
     * cuerpo igual hay que patching local para no desincronizar la tabla. */
    function patchLocal(id_benefit: string, patch: Partial<Benefit>) {
        requests = requests.map((r) =>
            r.id_benefit === id_benefit ? { ...r, ...patch } : r,
        );
    }

    async function decide(
        benefitRequest: Benefit,
        action: "accept" | "reject",
    ) {
        if (busy) return;
        const key = `${benefitRequest.id_benefit}:${action}`;
        if (
            !confirm(
                action === "accept"
                    ? `¿Aceptar la solicitud "${benefitRequest.title}"? El beneficio pasa a estar activo.`
                    : `¿Rechazar la solicitud "${benefitRequest.title}"?`,
            )
        )
            return;

        busy = key;
        rowErrors[benefitRequest.id_benefit] = "";
        error = "";
        const endpoint = action == "accept" ? "activate" : "reject";
        try {
            console.log(benefitRequest);
            console.log(benefitRequest.id_benefit);
            const response = await apiFetch(`/api/benefits/${endpoint}`, {
                method: "PATCH",
                headers: {
                    ...authHeaders(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id_benefit: benefitRequest.id_benefit,
                }),
            });
            if (!response.ok) {
                rowErrors[benefitRequest.id_benefit] =
                    await parseError(response);
                toast.error(rowErrors[benefitRequest.id_benefit]);
                return;
            }

            const nextStatus: BenefitStatus =
                action === "accept" ? "ACTIVE" : "REJECTED";
            patchLocal(benefitRequest.id_benefit, { status: nextStatus });
            setSuccess(
                action === "accept"
                    ? "Solicitud aceptada. El beneficio ya está activo."
                    : "Solicitud rechazada.",
            );
        } catch (cause) {
            rowErrors[benefitRequest.id_benefit] =
                cause instanceof Error
                    ? cause.message
                    : "No se pudo completar la acción.";
        } finally {
            busy = "";
        }
    }

    /** El backend manda "YYYY-MM-DD HH:mm:ss"; <input type="datetime-local">
     * necesita "YYYY-MM-DDTHH:mm". */
    function toLocalInput(value: string) {
        return value ? value.replace(" ", "T").slice(0, 16) : "";
    }

    function toApiDate(value: string) {
        return value ? value.replace("T", " ") + ":00" : "";
    }

    function startEdit(request: Benefit) {
        draft = {
            title: request.title,
            description: request.description,
            image: request.image,
            start_date: toLocalInput(request.start_date),
            end_date: toLocalInput(request.end_date),
            max_coupons: request.max_coupons,
            max_per_user: request.max_per_user,
            refund_limit: request.refund_limit ?? null,
        };
        editingId = request.id_benefit;
        rowErrors[request.id_benefit] = "";
    }

    function cancelEdit() {
        editingId = "";
    }

    async function saveEdit(id_benefit: string) {
        if (!draft.title.trim()) {
            rowErrors[id_benefit] = "El título no puede quedar vacío.";
            return;
        }

        busy = `${id_benefit}:edit`;
        rowErrors[id_benefit] = "";
        try {
            const response = await apiFetch(
                `/api/benefits/requests/${id_benefit}`,
                {
                    method: "PATCH",
                    headers: {
                        ...authHeaders(),
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title: draft.title.trim(),
                        description:
                            draft.description.trim() || draft.title.trim(),
                        image: draft.image,
                        start_date: toApiDate(draft.start_date),
                        end_date: toApiDate(draft.end_date),
                        max_coupons: Number(draft.max_coupons) || 0,
                        max_per_user: Math.max(
                            Number(draft.max_per_user) || 1,
                            1,
                        ),
                        refund_limit:
                            draft.refund_limit === null ||
                            Number.isNaN(Number(draft.refund_limit))
                                ? null
                                : Number(draft.refund_limit),
                    }),
                },
            );
            if (!response.ok) {
                rowErrors[id_benefit] = await parseError(response);
                toast.error(rowErrors[id_benefit]);
                return;
            }

            patchLocal(id_benefit, {
                title: draft.title.trim(),
                description: draft.description.trim() || draft.title.trim(),
                image: draft.image,
                start_date: toApiDate(draft.start_date),
                end_date: toApiDate(draft.end_date),
                max_coupons: Number(draft.max_coupons) || 0,
                max_per_user: Math.max(Number(draft.max_per_user) || 1, 1),
                refund_limit: draft.refund_limit ?? 0,
            });
            editingId = "";
            setSuccess("Solicitud actualizada.");
        } catch (cause) {
            rowErrors[id_benefit] =
                cause instanceof Error
                    ? cause.message
                    : "No se pudo actualizar la solicitud.";
        } finally {
            busy = "";
        }
    }

    onMount(loadRequests);
</script>

<svelte:head><title>Solicitudes | CeCIT</title></svelte:head>

<section class="requests-page">
    <div class="inner">
        <div class="intro-row">
            <div>
                <h1>Solicitudes de creación</h1>
                <p>
                    Revisá los beneficios que propusieron los comercios. Podés
                    editarlos antes de aceptarlos o rechazarlos.
                </p>
            </div>
            <button
                class="refresh-btn"
                type="button"
                onclick={loadRequests}
                disabled={loading || !!busy}
            >
                {#if loading}<span class="mini-spinner" aria-hidden="true"
                    ></span>{/if}
                Actualizar
            </button>
        </div>

        {#if error}<p class="state error" role="alert">{error}</p>{/if}
        {#if success}<p class="state success" role="status">{success}</p>{/if}

        <div class="toolbar">
            <div
                class="status-filters"
                role="group"
                aria-label="Filtrar por estado"
            >
                {#each ["PENDING", "REJECTED"] as const as status}
                    <button
                        type="button"
                        class:selected={statusFilter === status}
                        onclick={() => (statusFilter = status)}
                    >
                        {STATUS_LABEL[status]}
                        <span class="count">{counts[status] ?? 0}</span>
                    </button>
                {/each}
            </div>
            <input
                class="search"
                type="search"
                bind:value={search}
                placeholder="Buscar por título, comercio o descripción"
                aria-label="Buscar solicitudes"
            />
        </div>

        {#if loading}
            <p class="muted">Cargando solicitudes…</p>
        {:else if filtered.length === 0}
            <p class="empty">
                {requests.length === 0
                    ? "Todavía no hay solicitudes de creación de beneficios."
                    : "Ninguna solicitud coincide con el filtro."}
            </p>
        {:else}
            <div class="cards-grid">
                {#each filtered as request (request.id_benefit)}
                    <article class="data-card">
                        <div class="card-top">
                            <img
                                class="benefit-img"
                                src={request.image}
                                alt=""
                            />
                            <div class="card-title">
                                <h3>{request.title}</h3>
                                <p class="desc">
                                    {request.partner} · {request.type}
                                </p>
                                <span
                                    class="badge {(
                                        request.status ?? 'PENDING'
                                    ).toLowerCase()}"
                                >
                                    {STATUS_LABEL[request.status ?? "PENDING"]}
                                </span>
                            </div>
                        </div>

                        {#if editingId === request.id_benefit}
                            <div class="edit-grid">
                                <label class="edit-field"
                                    ><span>Título</span><input
                                        bind:value={draft.title}
                                    /></label
                                >
                                <label class="edit-field"
                                    ><span>Descripción</span><textarea
                                        rows="2"
                                        bind:value={draft.description}
                                    ></textarea></label
                                >
                                <label class="edit-field"
                                    ><span>Imagen (URL)</span><input
                                        bind:value={draft.image}
                                    /></label
                                >
                                <label class="edit-field"
                                    ><span>Desde</span><input
                                        type="datetime-local"
                                        bind:value={draft.start_date}
                                    /></label
                                >
                                <label class="edit-field"
                                    ><span>Hasta</span><input
                                        type="datetime-local"
                                        bind:value={draft.end_date}
                                    /></label
                                >
                                <label class="edit-field"
                                    ><span>Cupones máx.</span><input
                                        type="number"
                                        min="1"
                                        bind:value={draft.max_coupons}
                                    /></label
                                >
                                <label class="edit-field"
                                    ><span>Límite por usuario</span><input
                                        type="number"
                                        min="1"
                                        bind:value={draft.max_per_user}
                                    /></label
                                >
                                <label class="edit-field"
                                    ><span>Tope de reintegro</span><input
                                        type="number"
                                        min="0"
                                        bind:value={draft.refund_limit}
                                    /></label
                                >
                            </div>
                        {:else}
                            <p class="desc">{request.description}</p>
                            <p class="sub">
                                {request.start_date} → {request.end_date} ·
                                {request.coupons ?? 0}/{request.max_coupons}
                                cupones · {request.max_per_user} por usuario
                            </p>
                        {/if}

                        {#if rowErrors[request.id_benefit]}
                            <p class="row-error" role="alert">
                                {rowErrors[request.id_benefit]}
                            </p>
                        {/if}

                        <div class="card-actions">
                            {#if editingId === request.id_benefit}
                                <button
                                    class="save-btn"
                                    type="button"
                                    onclick={() => saveEdit(request.id_benefit)}
                                    disabled={busy ===
                                        `${request.id_benefit}:edit`}
                                >
                                    {#if busy === `${request.id_benefit}:edit`}<span
                                            class="mini-spinner"
                                            aria-hidden="true"
                                        ></span>{/if}
                                    Guardar
                                </button>
                                <button
                                    class="cancel-btn"
                                    type="button"
                                    onclick={cancelEdit}
                                    disabled={!!busy}
                                >
                                    Cancelar
                                </button>
                            {:else}
                                <button
                                    class="ok-btn"
                                    type="button"
                                    onclick={() => decide(request, "accept")}
                                    disabled={request.status !== "PENDING" ||
                                        !!busy}
                                >
                                    {#if busy === `${request.id_benefit}:accept`}<span
                                            class="mini-spinner"
                                            aria-hidden="true"
                                        ></span>{:else}<CheckCircle2
                                            size={15}
                                        />{/if}
                                    Aceptar
                                </button>
                                <button
                                    class="bad-btn"
                                    type="button"
                                    onclick={() => decide(request, "reject")}
                                    disabled={request.status !== "PENDING" ||
                                        !!busy}
                                >
                                    {#if busy === `${request.id_benefit}:reject`}<span
                                            class="mini-spinner"
                                            aria-hidden="true"
                                        ></span>{:else}<XCircle
                                            size={15}
                                        />{/if}
                                    Rechazar
                                </button>
                                <button
                                    class="edit-btn"
                                    type="button"
                                    onclick={() => startEdit(request)}
                                    disabled={!!busy || !!editingId}
                                >
                                    <Pencil size={15} />
                                    Editar
                                </button>
                            {/if}
                            {#if busy === `${request.id_benefit}:edit`}<Loader2
                                    size={15}
                                    class="spin"
                                    aria-hidden="true"
                                />{/if}
                        </div>
                    </article>
                {/each}
            </div>
        {/if}
    </div>
</section>

<style>
    .requests-page {
        min-height: 70vh;
        padding: 50px 24px 88px;
        background: #f4f6fb;
        color: #1a1f36;
    }

    .inner {
        width: min(100%, 1160px);
        margin: 0 auto;
    }

    .intro-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        margin-bottom: 24px;
    }

    h1 {
        margin: 0;
        font-size: 30px;
        font-weight: 700;
        letter-spacing: -0.2px;
    }

    .intro-row p {
        max-width: 420px;
        margin: 6px 0 0;
        font-size: 16px;
        line-height: 1.35;
        color: #4b5468;
    }

    .refresh-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        border: 1px solid #cdd3e2;
        border-radius: 9px;
        background: #fff;
        font: inherit;
        font-size: 14px;
        font-weight: 600;
        color: #19194f;
        cursor: pointer;
    }

    .refresh-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 18px;
        flex-wrap: wrap;
    }

    .status-filters {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .status-filters button {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 14px;
        border: 1px solid #cdd3e2;
        border-radius: 999px;
        background: #fff;
        font: inherit;
        font-size: 14px;
        cursor: pointer;
        color: #1a1f36;
    }

    .status-filters button.selected {
        border-color: #19194f;
        background: #19194f;
        color: #fff;
    }

    .count {
        font-size: 12px;
        opacity: 0.75;
    }

    .search {
        min-width: 280px;
        padding: 10px 13px;
        border: 1px solid #cdd3e2;
        border-radius: 9px;
        font: inherit;
        font-size: 14px;
    }

    .state {
        margin: 0 0 18px;
        padding: 14px 18px;
        border: 1px solid #aaa;
        border-radius: 8px;
    }

    .error {
        color: #a31818;
    }

    .success {
        color: #137333;
    }

    .empty,
    .muted {
        color: #6b7280;
    }

    .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: 18px;
    }

    .data-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 18px;
        border: 1px solid #e2e5ef;
        border-radius: 12px;
        background: #fff;
    }

    .card-top {
        display: flex;
        align-items: center;
        gap: 14px;
    }

    .benefit-img {
        width: 74px;
        height: 74px;
        border-radius: 8px;
        object-fit: cover;
        background: #eee;
        flex-shrink: 0;
    }

    .card-title {
        min-width: 0;
    }

    .card-title h3 {
        margin: 0 0 6px;
        font-size: 16px;
        line-height: 1.25;
        overflow-wrap: anywhere;
    }

    .desc,
    .sub {
        margin: 0;
        color: #4b5468;
        font-size: 13px;
        line-height: 1.5;
        overflow-wrap: anywhere;
    }

    .sub {
        color: #6b7280;
        font-size: 12px;
    }

    .badge {
        display: inline-block;
        margin-top: 6px;
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        background: #eceffa;
        color: #19194f;
    }

    .badge.pending {
        background: #fff3d6;
        color: #8a5a00;
    }

    .badge.rejected {
        background: #fdecec;
        color: #a31818;
    }

    .badge.active {
        background: #e4f5e9;
        color: #137333;
    }

    .edit-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
    }

    .edit-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .edit-field > span {
        font-size: 12px;
        font-weight: 800;
        color: #4b5468;
        letter-spacing: 0.3px;
    }

    .edit-field input,
    .edit-field textarea {
        width: 100%;
        padding: 9px 11px;
        border: 1px solid #cdd3e2;
        border-radius: 8px;
        font: inherit;
        font-size: 14px;
    }

    .edit-field textarea {
        resize: vertical;
    }

    .row-error {
        margin: 0;
        color: #a31818;
        font-size: 13px;
    }

    .card-actions {
        display: flex;
        align-items: center;
        gap: 9px;
        margin-top: auto;
        flex-wrap: wrap;
    }

    .ok-btn,
    .bad-btn,
    .save-btn,
    .cancel-btn,
    .edit-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 9px 14px;
        border: 1px solid transparent;
        border-radius: 9px;
        font: inherit;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
    }

    .ok-btn {
        background: #137333;
        color: #fff;
    }

    .bad-btn {
        background: #a31818;
        color: #fff;
    }

    .save-btn {
        background: #19194f;
        color: #fff;
    }

    .cancel-btn,
    .edit-btn {
        border-color: #cdd3e2;
        background: #fff;
        color: #1a1f36;
    }

    .ok-btn:disabled,
    .bad-btn:disabled,
    .save-btn:disabled,
    .cancel-btn:disabled,
    .edit-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    :global(.spin) {
        animation: spin 0.8s linear infinite;
    }

    @media (max-width: 720px) {
        .requests-page {
            padding: 32px 16px 64px;
        }

        .intro-row {
            flex-direction: column;
            align-items: flex-start;
        }

        .search {
            min-width: 100%;
        }

        .edit-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
