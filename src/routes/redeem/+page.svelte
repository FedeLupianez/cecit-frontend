<script lang="ts">
    import { accessToken } from "$lib/stores/authStore";

    interface VoucherInfo {
        token: string;
        title: string;
        image: string;
        partner: string;
        endDate: string;
        direction: string;
        logo: string;
        user_name: string;
        user_dni: string;
        methods: string[];
    }

    type VoucherState = "PENDING" | "DELIVERED" | "REJECTED";

    let tokenInput = $state("");
    let voucher: VoucherInfo | undefined = $state();
    let voucherState: VoucherState | undefined = $state();
    let loading = $state(false);
    let acting = $state(false);
    let error = $state("");
    let message = $state("");

    const canAct = $derived(!!voucher && voucherState === "PENDING");

    const endDateFormated = $derived(
        voucher
            ? new Date(voucher.endDate).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
              })
            : "",
    );

    const isExpired = $derived(
        !!voucher && new Date(voucher.endDate).getTime() < Date.now(),
    );

    const methodsText = $derived(
        voucher?.methods?.length
            ? voucher.methods.join(", ")
            : "No especificados",
    );

    async function parseErrorMessage(response: Response) {
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

    async function searchVoucher() {
        const token = tokenInput.trim();
        if (!token) {
            error = "Ingresá el token del voucher.";
            return;
        }
        const authToken = accessToken.getToken();
        if (!authToken) {
            error = "Tu sesión expiró. Volvé a iniciar sesión.";
            return;
        }
        loading = true;
        error = "";
        message = "";
        try {
            const response = await fetch(
                `/api/vouchers/bytoken?token=${encodeURIComponent(token)}`,
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                    credentials: "include",
                },
            );
            if (response.status === 401 || response.status === 403) {
                error = "No tenés permiso para canjear beneficios.";
                voucher = undefined;
                voucherState = undefined;
                return;
            }
            if (!response.ok) {
                voucher = undefined;
                voucherState = undefined;
                error =
                    response.status === 404
                        ? "No se encontró ningún voucher con ese token."
                        : await parseErrorMessage(response);
                return;
            }
            const data = await response.json();
            voucher = data;
            voucherState = "PENDING";
        } catch (cause) {
            voucher = undefined;
            voucherState = undefined;
            error =
                cause instanceof Error
                    ? cause.message
                    : "No se pudo cargar el voucher.";
        } finally {
            loading = false;
        }
    }

    async function sendAction(action: "redeem" | "reject") {
        if (!voucher || acting) return;
        const authToken = accessToken.getToken();
        if (!authToken) {
            error = "Tu sesión expiró. Volvé a iniciar sesión.";
            return;
        }
        acting = true;
        error = "";
        message = "";
        try {
            const response = await fetch(
                `/api/vouchers?action=${action}&token=${encodeURIComponent(voucher.token)}`,
                {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${authToken}` },
                    credentials: "include",
                },
            );
            if (!response.ok) {
                error = await parseErrorMessage(response);
                return;
            }
            voucherState = action === "redeem" ? "DELIVERED" : "REJECTED";
            message =
                action === "redeem"
                    ? "Voucher canjeado correctamente."
                    : "Voucher rechazado correctamente.";
        } catch (cause) {
            error =
                cause instanceof Error
                    ? cause.message
                    : "Ocurrió un error al realizar la acción.";
        } finally {
            acting = false;
        }
    }

    function clearVoucher() {
        tokenInput = "";
        voucher = undefined;
        voucherState = undefined;
        error = "";
        message = "";
    }
</script>

<svelte:head><title>Canjear Beneficio | CeCIT</title></svelte:head>

<section class="redeem-page">
    <div class="inner">
        <div class="intro-row">
            <h1>Canjear Beneficio</h1>
            <p>
                Ingresá el token del voucher para ver su información y después
                decidí si lo canjeás, lo rechazás o quitás la consulta.
            </p>
        </div>

        <div class="search-box">
            <label for="voucher-token">TOKEN DEL VOUCHER</label>
            <div class="search-row">
                <input
                    id="voucher-token"
                    type="text"
                    maxlength="6"
                    placeholder="XXXXXX"
                    bind:value={tokenInput}
                    onkeydown={(e) => e.key === "Enter" && searchVoucher()}
                />
                <button
                    type="button"
                    onclick={searchVoucher}
                    disabled={loading}
                >
                    {#if loading}
                        <span class="spinner"></span>
                    {/if}
                    Buscar
                </button>
            </div>
        </div>

        {#if error}
            <p class="state error" role="alert">{error}</p>
        {/if}

        {#if voucher}
            <section class="voucher-card">
                <img class="photo" src={voucher.image} alt={voucher.title} />
                <div class="voucher-details">
                    <div class="title-row">
                        <h2>{voucher.title}</h2>
                        {#if voucherState === "PENDING"}
                            <span class="state-badge"
                                >{isExpired ? "VENCIDO" : "VIGENTE"}</span
                            >
                        {:else}
                            <span class="state-badge resolved"
                                >{voucherState === "DELIVERED"
                                    ? "CANJEADO"
                                    : "RECHAZADO"}</span
                            >
                        {/if}
                    </div>

                    <p class="business-name">
                        <img loading="lazy" src={voucher.logo} alt="" />
                        {voucher.partner}
                    </p>

                    <dl class="data-grid">
                        <div>
                            <dt>TOKEN</dt>
                            <dd class="token">{voucher.token}</dd>
                        </div>
                        <div>
                            <dt>CLIENTE</dt>
                            <dd>{voucher.user_name}</dd>
                        </div>
                        <div>
                            <dt>DNI</dt>
                            <dd>{voucher.user_dni}</dd>
                        </div>
                        <div>
                            <dt>VIGENTE HASTA</dt>
                            <dd>{endDateFormated}</dd>
                        </div>
                        <div>
                            <dt>MÉTODO DE PAGO</dt>
                            <dd>{methodsText}</dd>
                        </div>
                        <div>
                            <dt>UBICACIÓN</dt>
                            <dd>
                                {voucher.direction ||
                                    "Sin dirección registrada"}
                            </dd>
                        </div>
                    </dl>
                </div>
            </section>

            <div class="actions">
                <button
                    class="redeem-btn"
                    type="button"
                    onclick={() => sendAction("redeem")}
                    disabled={!canAct || acting}
                >
                    {#if acting}
                        <span class="spinner"></span>
                    {/if}
                    Canjear
                </button>
                <button
                    class="reject-btn"
                    type="button"
                    onclick={() => sendAction("reject")}
                    disabled={!canAct || acting}
                >
                    {#if acting}
                        <span class="spinner"></span>
                    {/if}
                    Rechazar
                </button>
                <button class="clear-btn" type="button" onclick={clearVoucher}>
                    Quitar
                </button>
            </div>

            {#if message}
                <p class="state success" role="status">{message}</p>
            {/if}
        {/if}
    </div>
</section>

<style>
    .redeem-page {
        min-height: 70vh;
        padding: 50px 24px 88px;
        background: #fff;
        color: #111;
    }
    .inner {
        width: min(100%, 1160px);
        margin: 0 auto;
    }
    .intro-row {
        margin-bottom: 28px;
    }
    h1 {
        margin: 0;
        font-size: 30px;
    }
    .intro-row > p {
        max-width: 520px;
        margin: 6px 0 0;
        font-size: 17px;
        line-height: 1.3;
    }

    .search-box {
        border: 1px solid #969696;
        border-radius: 8px;
        padding: 26px 28px;
    }
    .search-box label {
        display: block;
        margin-bottom: 10px;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.3px;
    }
    .search-row {
        display: flex;
        gap: 12px;
    }
    .search-row input {
        flex: 1;
        min-width: 0;
        padding: 12px 14px;
        border: 1px solid #888;
        border-radius: 5px;
        font: inherit;
        font-size: 18px;
        letter-spacing: 0.5em;
        text-transform: uppercase;
        color: #111;
    }
    .search-row input:focus-visible {
        outline: 2px solid #19194f;
        outline-offset: 1px;
    }
    .search-row button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 22px;
        border: 1px solid #151535;
        border-radius: 999px;
        background: #151535;
        color: #fff;
        font: inherit;
        font-size: 16px;
        cursor: pointer;
        flex-shrink: 0;
    }
    .search-row button:disabled {
        cursor: progress;
        opacity: 0.85;
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
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .state {
        margin-top: 24px;
        padding: 24px;
        border: 1px solid #aaa;
        border-radius: 8px;
    }
    .error {
        color: #a31818;
    }
    .success {
        color: #137333;
    }

    .voucher-card {
        display: grid;
        grid-template-columns: 220px minmax(0, 1fr);
        gap: 26px;
        align-items: start;
        margin-top: 28px;
        border: 1px solid #969696;
        border-radius: 8px;
        padding: 26px 28px;
    }
    .photo {
        width: 220px;
        height: 220px;
        border-radius: 6px;
        object-fit: cover;
        background: #eee;
    }
    .voucher-details h2 {
        margin: 4px 0 10px;
        font-size: 25px;
        font-weight: 500;
    }
    .title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }
    .state-badge {
        min-width: max-content;
        padding: 6px 13px;
        border-radius: 999px;
        background: #2ecc71;
        color: #fff;
        font-size: 14px;
        font-weight: 500;
    }
    .state-badge.resolved {
        background: #8a8d95;
    }
    .state-badge {
        text-transform: uppercase;
    }
    .business-name {
        display: flex;
        align-items: center;
        gap: 9px;
        margin: 0 0 18px;
        color: #555;
        font-size: 16px;
    }
    .business-name img {
        width: 24px;
        height: 24px;
        object-fit: contain;
    }

    .data-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px 26px;
        margin: 0;
    }
    .data-grid div {
        min-width: 0;
    }
    .data-grid dt {
        color: #8a8d95;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.3px;
        margin-bottom: 4px;
    }
    .data-grid dd {
        margin: 0;
        padding: 10px 12px;
        min-height: 20px;
        border: 1px solid #888;
        border-radius: 5px;
        font-size: 15px;
        overflow-wrap: anywhere;
    }
    .data-grid dd.token {
        letter-spacing: 0.4em;
        font-weight: 700;
    }

    .actions {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-top: 24px;
        flex-wrap: wrap;
    }
    .actions button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 26px;
        border-radius: 999px;
        font: inherit;
        font-size: 16px;
        cursor: pointer;
        flex-shrink: 0;
    }
    .actions button:disabled {
        cursor: default;
        opacity: 0.6;
    }
    .redeem-btn {
        border: 1px solid #137333;
        background: #137333;
        color: #fff;
    }
    .reject-btn {
        border: 1px solid #a31818;
        background: #a31818;
        color: #fff;
    }
    .clear-btn {
        border: 1px solid #9a9a9a;
        background: #fff;
        color: #111;
    }

    @media (max-width: 780px) {
        .redeem-page {
            padding: 30px 16px 64px;
        }
        .voucher-card {
            grid-template-columns: 1fr;
        }
        .data-grid {
            grid-template-columns: 1fr;
        }
    }
    @media (max-width: 460px) {
        .search-row {
            flex-direction: column;
        }
        .search-row button {
            width: 100%;
            justify-content: center;
        }
    }
</style>

