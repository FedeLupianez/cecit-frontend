<script lang="ts">
    import { onMount } from "svelte";
    import { Clock, X, Info, Wallet, Ticket, Users } from "lucide-svelte";
    import favicon from "$lib/assets/favicon.svg";
    import { profileStore } from "$lib/stores/profileStore";
    import { accessToken } from "$lib/stores/authStore";

    let {
        benefit_id,
        title,
        image,
        partner,
        methods,
        endDate,
        direction,
        logo,
        coupons,
        max_coupons,
        max_per_user,
    }: {
        benefit_id: string;
        title: string;
        image: string;
        partner: string;
        methods: string[];
        endDate: string;
        direction: string;
        logo: string;
        coupons: number;
        max_coupons: number;
        max_per_user: number;
    } = $props();

    const endDateFormated = $derived(
        new Date(endDate).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }),
    );

    let user_vouchers = $state<number>(0);
    let error = $state("");
    let voucherToken: string = $state("");
    let isExpanded = $state(false);
    let isLoading = $state(false);
    let isRedeemed = $state(false);

    const maxReached = $derived(user_vouchers >= max_per_user);

    function openExpanded() {
        isExpanded = true;
        getUserVouchers();
    }

    function closeExpanded() {
        isExpanded = false;
    }

    async function getCopoun() {
        if (isLoading) return;
        isLoading = true;
        try {
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
                if (result.status === 409) {
                    error =
                        "Alcanzaste el máximo de cupones para este beneficio";
                    user_vouchers = max_per_user;
                } else {
                    error = "Error al obtener el voucher";
                }
                voucherToken = "";
                return;
            }
            error = "";
            const data = await result.json();
            voucherToken = data.token;
            await getUserVouchers();
            await getFile();
            isRedeemed = true;
            setTimeout(() => {
                isRedeemed = false;
            }, 3000);
        } finally {
            isLoading = false;
        }
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

    async function getUserVouchers() {
        const tmpAccessToken = accessToken.getToken();
        const tmpProfile = profileStore.getProfile();
        if (!tmpAccessToken || !tmpProfile?.user_id) return;

        try {
            const params = new URLSearchParams({
                id_account: tmpProfile.user_id,
                id_benefit: benefit_id,
            });
            const res = await fetch(`/api/vouchers/userbenefit?${params}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    Authorization: `Bearer ${tmpAccessToken}`,
                },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            user_vouchers = data.coupons ?? 0;
            error = "";
        } catch (e) {
            console.error("Error fetching user vouchers:", e);
            user_vouchers = 0;
        }
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
                                <p class="expanded-data-var">
                                    {endDateFormated}
                                </p>
                            </div>
                        </div>

                        <!-- <div class="expanded-data-container"> -->
                        <!--     <HandCoins size={70} class="expanded-data-icon" -->
                        <!--     ></HandCoins> -->
                        <!--     <div class="refund-limit-info"> -->
                        <!--         <p class="expanded-data-title"> -->
                        <!--             TOPE DE REINTEGRO -->
                        <!--         </p> -->
                        <!--         <p class="expanded-data-var">{endDate}</p> -->
                        <!--     </div> -->
                        <!-- </div> -->

                        <div class="expanded-data-container">
                            <Wallet size={70} class="expanded-data-icon"
                            ></Wallet>
                            <div class="payment-method-info">
                                <p class="expanded-data-title">
                                    MÉTODO DE PAGO
                                </p>
                                <p class="expanded-data-var">
                                    {methods.concat(" ").slice(0, -1)}
                                </p>
                            </div>
                        </div>

                        <div class="expanded-data-container">
                            <Ticket size={70} class="expanded-data-icon"
                            ></Ticket>
                            <div class="coupons-info">
                                <p class="expanded-data-title">DISPONIBLES</p>
                                <p class="expanded-data-var">
                                    {max_coupons - coupons}
                                </p>
                            </div>
                        </div>

                        <div class="expanded-data-container">
                            <Users size={70} class="expanded-data-icon"></Users>
                            <div class="user-coupons-info">
                                <p class="expanded-data-title">TUS CUPONES</p>
                                <p class="expanded-data-var">
                                    {user_vouchers} / {max_per_user}
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

                <button
                    class="expanded-coupon-btn"
                    class:acquired={maxReached}
                    class:loading={isLoading}
                    class:redeemed={isRedeemed}
                    onclick={getCopoun}
                    disabled={maxReached || isLoading || isRedeemed}
                >
                    {#if isLoading}
                        <span class="spinner"></span>
                        <span>Canjeando…</span>
                    {:else if isRedeemed}
                        <span>Canjeado</span>
                    {:else if maxReached}
                        <span>Máximo alcanzado</span>
                    {:else}
                        <span>Adquirir Cupón</span>
                    {/if}
                </button>
                {#if error}
                    <p class="voucher-error">{error}</p>
                {/if}
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

        display: flex;
        flex-direction: column;
        height: 310px;
    }

    .compact-card > img {
        width: 100%;
        height: 174px;
        object-fit: cover;

        display: block;
        flex-shrink: 0;
    }

    .content {
        padding: 8px 10px 14px;

        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
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

        -webkit-line-clamp: 2;
        line-clamp: 2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .bottom {
        margin-top: 8px;

        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;

        margin-top: auto;
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
        gap: 1.5rem;
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

    .voucher-error {
        color: #c0392b;
        font-size: 1rem;
        margin-top: 0.5rem;
    }

    .expanded-coupon-btn:disabled {
        cursor: default;
        background: #4b4b4b;
        padding: 1.5rem 3rem;
    }

    .expanded-coupon-btn {
        transform: translateY(35%);
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

    .expanded-coupon-btn.loading {
        cursor: progress;
        opacity: 0.85;
    }

    .expanded-coupon-btn.redeemed {
        background: #2ecc71;
    }

    .spinner {
        display: inline-block;
        vertical-align: middle;
        width: 30px;
        height: 30px;
        border: 5px solid #e0e0e0;
        border-top-color: #151535;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .coupon-btn {
        background: #151535;
        color: white;
        padding: 0.5rem 1rem;
        font-size: 1rem;

        border-radius: 999px;
        cursor: pointer;
        flex-shrink: 0;
        white-space: nowrap;
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
            flex-direction: column;
            flex-wrap: nowrap;
            gap: 0;
        }

        .title-row {
            display: flex;
        }

        h2 {
            width: 100%;
            max-width: 100%;
            font-size: 20px;
            line-height: 1.05;
        }

        .bottom {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: auto;
        }

        .business {
            width: 100%;
        }

        p {
            font-size: 15px;
        }

        .coupon-btn {
            margin-left: auto;
        }

        .expanded-backdrop {
            display: none;
        }
    }
</style>
