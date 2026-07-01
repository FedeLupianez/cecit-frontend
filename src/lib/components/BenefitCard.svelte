<script lang="ts">
    import { onMount } from "svelte";
    import { Clock, Download, X, HandCoins, Info, Wallet } from "lucide-svelte";
    import favicon from "$lib/assets/favicon.svg";
    import { profileStore } from "$lib/stores/profileStore";
    import { accessToken } from "$lib/stores/authStore";
    import { slide } from "svelte/transition";

    let {
        benefit_id,
        title,
        image,
        partner,
        methods,
        endDate,
        direction,
        logo,
    }: {
        benefit_id: string;
        title: string;
        image: string;
        partner: string;
        methods: string[];
        endDate: string;
        direction: string;
        logo: string;
    } = $props();

    let error = "";
    let voucherToken: string = $state("");

    let isExpanded = $state(false);

    function openExpanded() {
        isExpanded = true;
    }

    function closeExpanded() {
        isExpanded = false;
    }

    async function getCopoun() {
        const profile = profileStore.getProfile();
        const tmpAccessToken = accessToken.getToken();
        const result = await fetch("/api/vouchers/create", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tmpAccessToken}`,
            },
            body: JSON.stringify({
                id_user: profile?.user_id,
                id_benefit: benefit_id,
            }),
        });
        if (!result.ok) {
            error = "Error getting voucher";
            voucherToken = "";
            return;
        }
        error = "";
        const data = await result.json();
        voucherToken = data.token;
    }

    async function getFile() {
        const tmpAccessToken = accessToken.getToken();
        const res = await fetch(`/api/vouchers/file?token=${voucherToken}`, {
            method: "GET",
            credentials: "include",
            headers: {
                Authorization: `Bearer ${tmpAccessToken}`,
            },
        });
        if (!res.ok) {
            error = "error getting file";
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
    }

    onMount(() => {
        window.addEventListener("close-benefit-overlays", closeExpanded);

        return () => {
            window.removeEventListener("close-benefit-overlays", closeExpanded);
        };
    });
</script>

<div class="card">
    <div
        class="compact-card"
        onclick={openExpanded}
        onkeydown={(e) =>
            (e.key === "Enter" || e.key === " ") && openExpanded()}
        role="button"
        tabindex="0"
    >
        <img loading="lazy" src={image} alt={title} />

        <div class="content">
            <div class="title-row">
                <h2>{title}</h2>

                <button class="info-btn">Más información</button>
            </div>

            <div class="bottom">
                <div class="business">
                    <img loading="lazy" src={logo || favicon} alt="" />
                    <p>{partner}</p>
                </div>

                <button class="coupon-btn" onclick={openExpanded}
                    >Adquirir cupón</button
                >
            </div>
        </div>
    </div>

    <div
        class:visible={isExpanded}
        class="expanded-backdrop"
        role="presentation"
        onclick={closeExpanded}
        onkeydown={(event) => event.key === "Escape" && closeExpanded()}
    >
        <div
            onkeydown={(e) => {
                if (e.key === "Escape") closeExpanded();
            }}
            class="expanded-card"
            role="dialog"
            aria-label={title}
            tabindex="-1"
            onclick={(e) => e.stopPropagation()}
            style="background-image:url({image}) ;"
        >
            <button
                class="close-btn"
                type="button"
                aria-label="Cerrar"
                onclick={closeExpanded}
            >
                <X size={28} />
            </button>
            <h3 class="expanded-title">{title}</h3>
            <div class="expanded-info">
                <div class="expanded-data">
                    <div class="expanded-col-1">
                        <div class="expanded-data-container">
                            <Clock size={70} class="expanded-data-icon"></Clock>
                            <div class="end-date-info">
                                <p class="expanded-data-title">FECHA VIGENTE</p>
                                <p class="expanded-data-var">{endDate}</p>
                            </div>
                        </div>

                        <div class="expanded-data-container">
                            <HandCoins size={70} class="expanded-data-icon"
                            ></HandCoins>
                            <div class="refund-limit-info">
                                <p class="expanded-data-title">
                                    TOPE DE REINTEGRO
                                </p>
                                <p class="expanded-data-var">{endDate}</p>
                            </div>
                        </div>

                        <div class="expanded-data-container">
                            <Wallet size={70} class="expanded-data-icon"
                            ></Wallet>
                            <div class="payment-method-info">
                                <p class="expanded-data-title">
                                    MÉTODO DE PAGO
                                </p>
                                <p class="expanded-data-var">
                                    {methods.concat(" ")}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="expanded-col-2">
                        <div class="map-container">
                            <p>SUCURSALES</p>
                            <!-- <iframe -->
                            <!--     src={`https://www.google.com/maps?q=${encodeURIComponent(direction)}&output=embed`} -->
                            <!--     style="border:0;" -->
                            <!--     loading="lazy" -->
                            <!--     allowfullscreen -->
                            <!--     title="SUCURSALES" -->
                            <!-- ></iframe> -->
                            <div class="map"></div>
                        </div>
                        <div class="terms">
                            <div class="terms-header">
                                <Info size={28}></Info>
                                <p>TÉRMINOS Y CONDICIONES</p>
                            </div>
                            <p class="terms-text">
                                El cupón estará vigente durante siete días a
                                partir de la fecha canjeada. Si el cupón no ha
                                sido utilizado en ese periodo, perderá su
                                validez y volverá a reactivarse en el sistema.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="voucher-buttons">
                    <button
                        class="expanded-coupon-btn"
                        class:acquired={voucherToken}
                        onclick={getCopoun}
                    >
                        {#if voucherToken}
                            <span>Adquirido</span>
                        {:else}
                            <span>Adquirir Cupón</span>
                        {/if}
                    </button>
                    {#if voucherToken}
                        <button
                            class="download-btn"
                            onclick={getFile}
                            transition:slide
                        >
                            <Download size={28}></Download>
                        </button>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .card {
        position: relative;

        background: #f4f5f7;
        border: 1px solid #2b2b2b;
        border-radius: 0;
        overflow: visible;

        box-shadow: none;

        transition: box-shadow 0.25s ease;
    }

    .card:hover,
    .card:focus-within {
        z-index: 100;
    }

    .compact-card {
        overflow: hidden;
    }

    .compact-card > img {
        width: 100%;
        height: 174px;
        object-fit: cover;

        display: block;
    }

    .content {
        padding: 8px 10px 14px;
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

    .bottom {
        margin-top: 8px;

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

    p {
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

    .info-btn {
        min-width: max-content;

        padding: 6px 13px;

        border: 1px solid #c4c7cf;
        border-radius: 999px;

        background: transparent;
        color: #8a8d95;

        font-size: 14px;
        font-weight: 500;
    }

    .expanded-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1000;

        padding: 42px;

        background: rgba(238, 240, 243, 0.72);
        /* backdrop-filter: blur(8px); */
        /* -webkit-backdrop-filter: blur(8px); */

        display: flex;
        align-items: center;
        justify-content: center;

        opacity: 0;
        visibility: hidden;
        pointer-events: none;

        transition:
            opacity 0.18s ease,
            visibility 0.18s ease;
    }

    .expanded-backdrop.visible {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
    }

    .expanded-card {
        width: 72rem;
        height: 35rem;

        background: #f4f5f7;
        border: 1px solid #7f8188;
        border-radius: 16px;
        display: flex;
        flex-direction: row;
        align-items: stretch;

        transform: translateY(12px) scale(0.985);
        transition: transform 0.18s ease;

        position: relative;
    }

    .expanded-backdrop.visible .expanded-card {
        transform: translateY(0) scale(1);
        z-index: 1;
    }

    .expanded-title {
        color: white;
        font-size: 2rem;
        white-space: nowrap;
        z-index: 1;
        margin: 0;
        text-transform: uppercase;
        width: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(-90deg);
    }

    .close-btn {
        position: absolute;
        top: 12px;
        right: 10px;
        z-index: 2;

        border-radius: 50%;

        background: transparent;
        color: #151535;

        display: flex;
        align-items: center;
        justify-content: center;
    }

    .expanded-info {
        min-width: 0;
        flex: 1;
        height: 100%;
        border-radius: 16px;
        background: white;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
    }

    .expanded-data {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
    }

    .expanded-col-1 {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 5rem;
        overflow: hidden;
    }

    .expanded-data-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        transform: translateX(-1rem);
    }

    .expanded-data-title {
        font-size: 2.5rem;
    }
    .expanded-data-var {
        font-size: 2rem;
    }

    .voucher-buttons {
        transform: translateY(35%);
        display: flex;
        flex-direction: row;
        gap: 1rem;
    }

    .expanded-coupon-btn {
        background: #151535;
        color: white;
        padding: 1.5rem 4.5rem;
        font-size: 1.5rem;

        border-radius: 999px;
        cursor: pointer;
        transition:
            background 0.6s ease,
            padding 0.6s ease;
    }

    .coupon-btn {
        background: #151535;
        color: white;
        padding: 0.5rem 1rem;
        font-size: 1rem;

        border-radius: 999px;
        cursor: pointer;
    }

    .expanded-coupon-btn.acquired {
        background: #4b4b4b;
        padding: 1.5rem 3rem;
    }

    .download-btn {
        background: #151535;
        color: white;
        border-radius: 100%;
        cursor: pointer;
        padding: 1.5rem;
    }

    .expanded-info p {
        color: #050505;

        font-weight: 900;
    }

    .expanded-col-2 {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: center;
        gap: 2rem;
        height: 100%;
        padding-top: 3rem;
    }

    .map-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        width: 100%;
    }

    .map {
        display: flex;
        width: 100%;
        height: 18rem;
        background-color: red;
        border-radius: 16px;
    }

    .terms {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }

    .terms-header {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }

    .terms-text {
        display: flex;
        text-wrap: wrap;
        width: 32rem;
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
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .title-row {
            display: contents;
        }

        h2 {
            order: 1;
            width: 100%;
            max-width: 100%;
            font-size: 20px;
            line-height: 1.05;
            white-space: nowrap;
        }

        .bottom {
            display: contents;
        }

        .business {
            order: 2;
            width: 100%;
        }

        p {
            font-size: 15px;
        }

        .info-btn {
            order: 3;
        }

        .info-btn,
        .coupon-btn {
            width: auto;
            min-width: 0;
            padding: 8px 13px;
            font-size: 13px;
        }

        .coupon-btn {
            order: 4;
            margin-left: auto;
        }

        .expanded-backdrop {
            display: none;
        }
    }
</style>
