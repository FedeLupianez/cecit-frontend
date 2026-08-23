<script lang="ts">
    import { Download } from "lucide-svelte";
    import favicon from "$lib/assets/favicon.svg";
    import { accessToken } from "$lib/stores/authStore";

    let {
        title,
        image,
        partner,
        endDate,
        methods,
        direction,
        logo,
        voucherToken,
    }: {
        title: string;
        image: string;
        partner: string;
        endDate: string;
        methods: string;
        direction: string;
        logo: string;
        voucherToken: string;
    } = $props();

    const isExpired = $derived(new Date(endDate).getTime() < Date.now());

    const endDateFormated = $derived(
        new Date(endDate).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }),
    );

    let isLoading = $state(false);
    let error = $state("");

    async function downloadVoucher() {
        if (isLoading) return;
        isLoading = true;
        try {
            const tmpAccessToken = accessToken.getToken();
            const res = await fetch(
                `/api/vouchers/file?token=${voucherToken}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        Authorization: `Bearer ${tmpAccessToken}`,
                    },
                },
            );
            if (!res.ok) {
                error = "Error al descargar el voucher";
                return;
            }
            error = "";
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `cecit_voucher_${voucherToken}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="card">
    <div class="compact-card">
        <img loading="lazy" src={image} alt={title} />

        <div class="content">
            <div class="title-row">
                <h2>{title}</h2>
                <span class="redeemed-badge">CANJEADO</span>
            </div>

            <div class="voucher-data">
                <div class="validity-row">
                    <p class="data-label">VIGENTE HASTA</p>
                    <span class="status-badge" class:expired={isExpired}>
                        {isExpired ? "EXPIRADO" : "VIGENTE"}
                    </span>
                </div>
                <p class="data-var">{endDateFormated}</p>

                <p class="data-label">MÉTODO DE PAGO</p>
                <p class="data-var">{methods}</p>

                <p class="data-label">TOKEN</p>
                <p class="data-var token">{voucherToken}</p>
            </div>

            <div class="bottom">
                <div class="business">
                    <img loading="lazy" src={logo || favicon} alt="" />
                    <p>{partner}</p>
                </div>

                <button
                    class="download-btn"
                    onclick={downloadVoucher}
                    disabled={isLoading}
                >
                    {#if isLoading}
                        <span class="spinner"></span>
                        <span>Descargando…</span>
                    {:else}
                        <Download size={18} />
                        <span>Descargar</span>
                    {/if}
                </button>
            </div>

            {#if error}
                <p class="voucher-error">{error}</p>
            {/if}
        </div>
    </div>
</div>

<style>
    .card {
        background: #f4f5f7;
        border: 1px solid #2b2b2b;
        border-radius: 0;
        overflow: hidden;

        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;
    }

    .compact-card {
        display: flex;
        flex-direction: column;

        height: 100%;
        min-height: 0;
    }

    .compact-card > img {
        width: 100%;
        height: 174px;
        object-fit: cover;
        flex-shrink: 0;

        display: block;
    }

    .content {
        padding: 8px 10px 14px;

        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }

    h2 {
        margin: 0;
        color: #050505;

        font-size: 25px;
        font-weight: 800;
        line-height: 1.1;
        letter-spacing: 0;

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .redeemed-badge {
        min-width: max-content;

        padding: 6px 13px;

        border: none;
        border-radius: 999px;

        background: #2ecc71;
        color: white;

        font-size: 14px;
        font-weight: 500;
    }

    .voucher-data {
        margin-top: 10px;

        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .voucher-data p {
        margin: 0;
    }

    .validity-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .status-badge {
        padding: 2px 10px;

        border-radius: 999px;

        background: #2ecc71;
        color: white;

        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.3px;
        line-height: 1.4;
    }

    .status-badge.expired {
        background: #c0392b;
    }

    .data-label {
        color: #8a8d95;

        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.3px;
    }

    .data-var {
        color: #151535;

        font-size: 16px;
        font-weight: 800;
        line-height: 1.2;
        letter-spacing: 0.3px;
    }

    .data-var.token {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .bottom {
        margin-top: auto;
        padding-top: 12px;

        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
    }

    .business {
        min-width: 0;

        display: flex;
        align-items: center;
        gap: 9px;
    }

    .business img {
        width: 24px;
        height: 24px;

        flex: 0 0 auto;
        object-fit: contain;
    }

    .business p {
        margin: 0;

        color: #151535;

        font-size: 16px;
        font-weight: 800;
        line-height: 1;
        letter-spacing: 0.3px;

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    button {
        border: none;
        font-family: inherit;
        cursor: pointer;
    }

    .download-btn {
        display: flex;
        align-items: center;
        gap: 8px;

        background: #151535;
        color: white;
        padding: 0.5rem 1rem;
        font-size: 1rem;

        border-radius: 999px;
        cursor: pointer;
        flex-shrink: 0;
        white-space: nowrap;
    }

    .download-btn:disabled {
        cursor: progress;
        opacity: 0.85;
    }

    .spinner {
        display: inline-block;
        vertical-align: middle;
        width: 18px;
        height: 18px;
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

    .voucher-error {
        margin: 8px 0 0;

        color: #c0392b;
        font-size: 14px;
        font-weight: 600;
    }

    @media (max-width: 640px) {
        .card {
            background: #fff;
        }

        .compact-card > img {
            height: 145px;
        }

        .content {
            padding: 10px 12px 14px;
        }

        h2 {
            font-size: 20px;
            line-height: 1.05;
        }

        .business p {
            font-size: 15px;
        }

        .download-btn {
            padding: 8px 13px;
            font-size: 13px;
        }
    }
</style>
