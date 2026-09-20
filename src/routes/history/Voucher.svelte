<script lang="ts">
    import { Download } from "lucide-svelte";
    import favicon from "$lib/assets/favicon.svg";
    import { apiFetch } from "$lib/api";

    let {
        title,
        image,
        partner,
        endDate,
        methods,
        direction,
        logo,
        voucherToken,
        status,
    }: {
        title: string;
        image: string;
        partner: string;
        endDate: string;
        methods: string;
        direction: string;
        logo: string;
        voucherToken: string;
        status: "PENDING" | "DELIVERED" | "EXPIRED" | "REJECTED";
    } = $props();

    const isExpired = $derived(
        status !== "DELIVERED" &&
            status !== "REJECTED" &&
            new Date(endDate).getTime() < Date.now(),
    );

    const endDateFormated = $derived(
        new Date(endDate).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }),
    );

    let isLoading = $state(false);
    let error = $state("");

    async function downloadVoucher() {
        if (isLoading) return;
        isLoading = true;
        try {
            const res = await apiFetch(
                `/api/vouchers/file?token=${encodeURIComponent(voucherToken)}`,
                { method: "GET" },
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
                {#if status === "DELIVERED"}
                    <span class="redeemed-badge">CANJEADO</span>
                {:else if status === "REJECTED"}
                    <span class="redeemed-badge rejected">RECHAZADO</span>
                {/if}
            </div>

            <div class="voucher-data">
                <div class="validity-row">
                    <p class="data-label">VIGENTE HASTA</p>
                    {#if status === "DELIVERED"}
                        <span class="status-badge delivered">CANJEADO</span>
                    {:else if status === "REJECTED"}
                        <span class="status-badge rejected">RECHAZADO</span>
                    {:else if isExpired}
                        <span class="status-badge expired">EXPIRADO</span>
                    {:else}
                        <span class="status-badge">VIGENTE</span>
                    {/if}
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
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        overflow: hidden;

        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;

        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
        transition: box-shadow 0.2s ease, transform 0.2s ease;
    }

    .card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
        transform: translateY(-2px);
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
        padding: 14px 16px 16px;

        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .title-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
    }

    h2 {
        margin: 0;
        color: #111827;

        font-size: 20px;
        font-weight: 700;
        line-height: 1.2;
        letter-spacing: -0.2px;

        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        line-clamp: 2;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .redeemed-badge {
        min-width: max-content;

        padding: 4px 10px;

        border: none;
        border-radius: 999px;

        background: #dcfce7;
        color: #166534;

        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.3px;
        white-space: nowrap;
    }

    .redeemed-badge.rejected {
        background: #ffedd5;
        color: #9a3412;
    }

    .voucher-data {
        margin-top: 12px;

        display: flex;
        flex-direction: column;
        gap: 8px;
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
        padding: 3px 10px;

        border-radius: 999px;

        background: #dcfce7;
        color: #166534;

        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.3px;
        line-height: 1.4;
    }

    .status-badge.expired {
        background: #fee2e2;
        color: #991b1b;
    }

    .status-badge.delivered {
        background: #dcfce7;
        color: #166534;
    }

    .status-badge.rejected {
        background: #ffedd5;
        color: #9a3412;
    }

    .data-label {
        color: #9ca3af;

        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .data-var {
        color: #1f2937;

        font-size: 14px;
        font-weight: 600;
        line-height: 1.3;
    }

    .data-var.token {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #6b7280;
        font-family: monospace;
        font-size: 13px;
    }

    .bottom {
        margin-top: auto;
        padding-top: 12px;
        border-top: 1px solid #f3f4f6;

        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
    }

    .business {
        min-width: 0;

        display: flex;
        align-items: center;
        gap: 8px;
    }

    .business img {
        width: 22px;
        height: 22px;

        flex: 0 0 auto;
        object-fit: contain;
        border-radius: 4px;
    }

    .business p {
        margin: 0;

        color: #374151;

        font-size: 13px;
        font-weight: 600;
        line-height: 1;

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
        gap: 6px;

        background: #151535;
        color: white;
        padding: 8px 14px;
        font-size: 13px;
        font-weight: 600;

        border-radius: 10px;
        cursor: pointer;
        flex-shrink: 0;
        white-space: nowrap;
        transition: background 0.15s ease;
    }

    .download-btn:hover {
        background: #1e1e50;
    }

    .download-btn:disabled {
        cursor: progress;
        opacity: 0.7;
    }

    .spinner {
        display: inline-block;
        vertical-align: middle;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
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

        color: #dc2626;
        font-size: 13px;
        font-weight: 500;
    }

    @media (max-width: 640px) {
        .card {
            border-radius: 12px;
        }

        .compact-card > img {
            height: 145px;
        }

        .content {
            padding: 12px 14px 14px;
        }

        h2 {
            font-size: 18px;
        }

        .business p {
            font-size: 12px;
        }

        .download-btn {
            padding: 7px 12px;
            font-size: 12px;
        }
    }
</style>
