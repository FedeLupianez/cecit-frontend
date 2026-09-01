<script lang="ts">
    import { accessToken } from "$lib/stores/authStore";
    import { profileStore } from "$lib/stores/profileStore";
    import Voucher from "./Voucher.svelte";

    interface Voucher {
        title: string;
        image: string;
        partner: string;
        endDate: string;
        methods: string;
        direction: string;
        logo: string;
        voucherToken: string;
        status: "PENDING" | "DELIVERED" | "EXPIRED" | "REJECTED";
    }

    let loading: boolean = $state(false);
    let vouchers: Voucher[] = $state([]);

    async function loadVouchers(idUser: string) {
        loading = true;
        try {
            const response = await fetch(
                `/api/vouchers/byuser?id_user=${encodeURIComponent(idUser)}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        Authorization: `Bearer ${accessToken.getToken()}`,
                    },
                },
            );
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            vouchers = await response.json();
        } catch (err) {
            console.error("Error al cargar vouchers:", err);
        } finally {
            loading = false;
        }
    }

    $effect(() => {
        const idUser = $profileStore?.user_id;
        if (idUser) loadVouchers(idUser);
    });
</script>

<svelte:head>
    <title>Historial</title>
</svelte:head>

<section class="history-page">
    <p class="title">Historial de Cupones:</p>
    {#if loading}
        <div class="spinner"></div>
    {:else}
        <div class="vouchers-container">
            {#each vouchers as voucher}
                <Voucher
                    title={voucher.title}
                    image={voucher.image}
                    partner={voucher.partner}
                    endDate={voucher.endDate}
                    methods={voucher.methods}
                    direction={voucher.direction}
                    logo={voucher.logo}
                    voucherToken={voucher.voucherToken}
                    status={voucher.status}
                ></Voucher>
            {/each}
        </div>
    {/if}
</section>

<style>
    .history-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 5rem;
        min-height: 90vh;
    }

    .title {
        font-size: 3rem;
        font-weight: bold;
        color: #151535;
        text-align: center;
    }

    .vouchers-container {
        display: grid;
        padding: 3rem;
        grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
        grid-auto-rows: 1fr;
        gap: 1rem;
        width: 100%;
    }

    @media (max-width: 640px) {
        .vouchers-container {
            grid-template-columns: 1fr;
        }
    }

    .spinner {
        width: 48px;
        height: 48px;
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
</style>
