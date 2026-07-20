<script lang="ts">
    import { page } from "$app/state";
    import BenefitCard from "$lib/components/BenefitCard.svelte";
    import { getFilters, loadCategories } from "$lib/stores/categories.svelte";
    import { onMount } from "svelte";

    interface Benefit {
        id_benefit: string;
        id_admin: string;
        id_partner: string;
        partner: string;
        type: string;
        categories: string[];
        payment_methods: string[];
        logo: string;
        direction: string;
        start_date: string;
        end_date: string;
        image: string;
        title: string;
        description: string;
        coupons: number;
        max_coupons: number;
    }

    let benefits: Benefit[] = $state([]);
    let paymentMethods: string[] = $state([]);
    let loading = $state(true);
    let categories = $derived(getFilters());

    async function load_benefits() {
        loading = true;
        await loadCategories();
        try {
            const response = await fetch("/api/benefits/all");
            if (!response.ok) {
                console.log("Response does not ok");
                return;
            }
            benefits = await response.json();
            console.log($state.snapshot(benefits));
        } catch (error) {
            console.log(error);
        } finally {
            loading = false;
        }
    }

    async function load_payment_methods() {
        try {
            const response = await fetch("/api/payment-methods/all");
            if (!response.ok) return;
            paymentMethods = await response.json();
            return;
        } catch (error) {
            console.log(error);
        }
    }

    const discounts = ["30% OFF", "40% OFF"];

    const initialCategory = page.url.searchParams.get("category");

    let selectedCategory = $derived(
        initialCategory && categories.includes(initialCategory)
            ? initialCategory
            : "Todo",
    );
    let selectedPayment = $state("Todo");
    let selectedDiscount = $state("Todo");

    let filteredBenefits = $derived(
        benefits.filter((benefit) => {
            const matchesCategory =
                selectedCategory === "Todo" ||
                benefit.categories.includes(selectedCategory);
            const matchesPayment =
                selectedPayment === "Todo" ||
                benefit.payment_methods.includes(selectedPayment);

            return matchesCategory && matchesPayment;
        }),
    );

    /**
     * @param {string} category
     */
    function selectCategory(category: string) {
        selectedCategory = selectedCategory === category ? "Todo" : category;
    }

    /**
     * @param {string} payment
     */
    function selectPayment(payment: string) {
        selectedPayment = selectedPayment === payment ? "Todo" : payment;
    }

    /**
     * @param {string} discount
     */
    function selectDiscount(discount: string) {
        return;
    }

    onMount(() => {
        load_payment_methods();
        load_benefits();
    });
</script>

<svelte:head>
    <title>Beneficios</title>
</svelte:head>

<section class="benefits-page">
    <div class="page-inner">
        <h1>Tipos de beneficios</h1>

        <div class="content-layout">
            <aside class="filters-panel" aria-label="Filtros de beneficios">
                <div class="filter-group">
                    <h2>Categorias</h2>

                    <div class="filter-buttons">
                        {#each categories as category}
                            <button
                                type="button"
                                class:active={selectedCategory === category}
                                onclick={() => selectCategory(category)}
                            >
                                {category}
                            </button>
                        {/each}
                    </div>
                </div>

                <div class="filter-group">
                    <h2>Metodo de Pago</h2>

                    <div class="filter-buttons">
                        {#each paymentMethods as payment}
                            <button
                                type="button"
                                class:active={selectedPayment === payment}
                                onclick={() => selectPayment(payment)}
                            >
                                {payment}
                            </button>
                        {/each}
                    </div>
                </div>

                <div class="filter-group">
                    <h2>Descuentos</h2>

                    <div class="filter-buttons">
                        {#each discounts as discount}
                            <button
                                type="button"
                                class:active={selectedDiscount === discount}
                                onclick={() => selectDiscount(discount)}
                            >
                                {discount}
                            </button>
                        {/each}
                    </div>
                </div>
            </aside>

            <div class="benefits-grid" aria-live="polite">
                {#if loading}
                    <div class="loading-container">
                        <div class="spinner"></div>
                        <p>Cargando beneficios...</p>
                    </div>
                {:else}
                    {#each filteredBenefits as benefit}
                        <div class="card-wrapper">
                            <BenefitCard
                                benefit_id={benefit.id_benefit}
                                title={benefit.title}
                                image={benefit.image}
                                partner={benefit.partner}
                                endDate={benefit.end_date}
                                methods={benefit.payment_methods}
                                logo={benefit.logo}
                                direction={benefit.direction}
                            />
                        </div>
                    {:else}
                        <p class="empty-state">
                            No hay beneficios para estos filtros.
                        </p>
                    {/each}
                {/if}
            </div>
        </div>
    </div>
</section>

<style>
    .benefits-page {
        min-height: 100vh;
        background: #eef2f8;
    }

    .page-inner {
        width: 100%;
        max-width: 1366px;
        margin: 0 auto;
        padding: 30px 32px 145px;
    }

    h1 {
        margin: 0;
        color: #151535;
        font-size: clamp(42px, 5vw, 58px);
        font-weight: 900;
        line-height: 1.05;
        letter-spacing: 0;
    }

    .content-layout {
        margin-top: 44px;
        display: grid;
        grid-template-columns: 180px minmax(0, 1fr);
        gap: 38px;
        align-items: start;
    }

    .filters-panel {
        position: sticky;
        top: 20px;
        display: flex;
        flex-direction: column;
        gap: 28px;
    }

    .filter-group h2 {
        margin: 0 0 24px;
        color: #151535;
        font-size: 32px;
        font-weight: 900;
        line-height: 1.2;
        letter-spacing: 0;
    }

    .filter-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 12px 10px;
    }

    .filter-buttons button {
        cursor: pointer;
        min-width: 78px;
        height: 24px;
        padding: 0 14px;
        border: 1px solid #bfc4cf;
        border-radius: 999px;
        background: #fff;
        color: #050505;
        font-family: inherit;
        font-size: 12px;
        font-weight: 800;
        line-height: 1;
        transition:
            transform 0.2s ease,
            background 0.2s ease,
            color 0.2s ease;
    }

    .filter-buttons button:hover {
        transform: translateY(-2px);
    }

    .filter-buttons button.active {
        border-color: #151535;
        background: #151535;
        color: #fff;
    }

    .benefits-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 38px 20px;
    }

    .card-wrapper {
        position: relative;
        z-index: 1;
        min-width: 0;
    }

    .card-wrapper:hover,
    .card-wrapper:focus-within {
        z-index: 100;
    }

    .empty-state {
        grid-column: 1 / -1;
        margin: 16px 0 0;
        color: #151535;
        font-size: 18px;
        font-weight: 800;
    }

    .loading-container {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 60px 0;
        color: #151535;
        font-size: 16px;
        font-weight: 600;
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

    @media (max-width: 1050px) {
        .content-layout {
            grid-template-columns: 1fr;
            gap: 28px;
        }

        .filters-panel {
            position: static;
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 22px;
        }

        .benefits-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }

    @media (max-width: 720px) {
        .page-inner {
            padding: 28px 14px 90px;
        }

        .content-layout {
            margin-top: 30px;
        }

        .filters-panel {
            grid-template-columns: 1fr;
        }

        .filter-group h2 {
            margin-bottom: 14px;
            font-size: 26px;
        }

        .benefits-grid {
            grid-template-columns: 1fr;
            gap: 22px;
        }
    }
</style>
