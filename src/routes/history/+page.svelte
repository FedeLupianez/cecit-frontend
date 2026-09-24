<script lang="ts">
    import { apiFetch } from "$lib/api";
    import { profileStore } from "$lib/stores/profileStore";
    import { toast } from "svelte-sonner";
    import Voucher from "./Voucher.svelte";

    interface Voucher {
        title: string;
        image: string;
        partner: string;
        endDate: string;
        methods: string;
        direction: string;
        logo: string;
        token: string;
        status: "PENDING" | "DELIVERED" | "EXPIRED" | "REJECTED";
    }

    let loading: boolean = $state(false);
    let vouchers: Voucher[] = $state([]);
    let fetchedUserId: string | null = null;

    async function loadVouchers(idUser: string) {
        if (fetchedUserId === idUser) return;
        fetchedUserId = idUser;
        loading = true;
        try {
            const response = await apiFetch(
                `/api/vouchers/byuser?id_user=${encodeURIComponent(idUser)}`,
                { method: "GET" },
            );
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            vouchers = await response.json();
        } catch (err) {
            console.error("Error al cargar vouchers:", err);
            toast.error("No se pudieron cargar los cupones");
        } finally {
            loading = false;
            console.log(vouchers);
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
    <div class="history-header">
        <h1 class="title">Historial de Cupones</h1>
        <p class="subtitle">Todos los cupones que canjeaste</p>
    </div>

    {#if loading}
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Cargando cupones…</p>
        </div>
    {:else if vouchers.length === 0}
        <div class="empty-state">
            <div class="empty-icon">🎫</div>
            <p class="empty-title">Sin cupones aún</p>
            <p class="empty-text">
                Cuando canjees un cupón, va a aparecer acá.
            </p>
        </div>
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
                    voucherToken={voucher.token}
                    status={voucher.status}
                />
            {/each}
        </div>
    {/if}
</section>

<style>
    .history-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 3rem 2rem 5rem;
        min-height: 90vh;
        background: #f8f9fa;
    }

    .history-header {
        text-align: center;
        margin-bottom: 2.5rem;
    }

    .title {
        font-size: 2.2rem;
        font-weight: 800;
        color: #151535;
        margin: 0 0 0.4rem;
        letter-spacing: -0.5px;
    }

    .subtitle {
        font-size: 1rem;
        color: #6b7280;
        margin: 0;
    }

    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 5rem 0;
        color: #6b7280;
        font-size: 1rem;
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e0e0e0;
        border-top-color: #151535;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 4rem 2rem;
        text-align: center;
    }

    .empty-icon {
        font-size: 3.5rem;
        margin-bottom: 1rem;
        opacity: 0.6;
    }

    .empty-title {
        font-size: 1.3rem;
        font-weight: 700;
        color: #151535;
        margin: 0 0 0.4rem;
    }

    .empty-text {
        font-size: 0.95rem;
        color: #9ca3af;
        margin: 0;
    }

    .vouchers-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
        gap: 1.5rem;
        width: 100%;
        max-width: 80rem;
    }

    @media (max-width: 640px) {
        .history-page {
            padding: 2rem 1rem 3rem;
        }

        .title {
            font-size: 1.6rem;
        }

        .vouchers-container {
            grid-template-columns: 1fr;
            gap: 1rem;
        }
    }
</style>
