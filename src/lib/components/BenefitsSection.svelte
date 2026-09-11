<script lang="ts">
    import { onMount } from "svelte";
    /*
  ==========================================
  IMPORTS
  ==========================================
  */

    import BenefitCard from "./BenefitCard.svelte";
    import { loadCategories, getFilters } from "$lib/stores/categories.svelte";
    import type { Benefit } from "$lib/types/Benefit";

    let { title = "Beneficios populares", endpoint = "/api/benefits/actives" } =
        $props();

    let benefits: Benefit[] = $state([]);
    let filters = $derived(getFilters());
    let loading: boolean = $state(true);

    async function load_benefits() {
        await loadCategories();
        loading = true;
        try {
            const response = await fetch(endpoint);
            if (!response.ok) {
                console.log("Response does not ok");
                return;
            }
            benefits = await response.json();
        } catch (error) {
            console.log(error);
        } finally {
            loading = false;
        }
    }

    onMount(() => load_benefits());

    import { ChevronLeft, ChevronRight, TicketX } from "lucide-svelte";

    /*
  ==========================================
  FILTROS
  ==========================================
  */

    // const filters = [
    //     "Todo",
    //     "Gastronomía",
    //     "Tecnología",
    //     "Salud",
    //     "Educación",
    //     "Construcción",
    //     "Automotriz",
    //     "Belleza y Estética",
    //     "Turismo",
    //     "Inmobiliaria",
    //     "Finanzas",
    //     "Deportes",
    //     "Moda y Accesorios",
    //     "Mascotas",
    //     "Hogar y Decoración",
    //     "Transporte y Logística",
    //     "Entretenimiento",
    //     "Servicios Profesionales",
    //     "Agricultura y Ganadería",
    //     "Industria y Manufactura",
    //     "Comercio Minorista"s
    // ];

    let activeFilter = $state("Todo");
    let filteredBenefits = $derived(
        activeFilter === "Todo" || !filters.includes(activeFilter)
            ? benefits
            : benefits.filter((benefit) =>
                  benefit.categories.includes(activeFilter),
              ),
    );

    /*
  ==========================================
  SCROLL DE FILTROS CON MOUSE (drag + Shift+rueda)
  ==========================================
  */

    let filtersEl: HTMLDivElement | null = $state(null);
    let draggingFilters = $state(false);
    let dragMoved = false;
    let dragStartX = 0;
    let dragStartScroll = 0;

    function onFiltersPointerDown(e: PointerEvent) {
        if (e.pointerType !== "mouse" || e.button !== 0 || !filtersEl) return;
        draggingFilters = true;
        dragMoved = false;
        dragStartX = e.clientX;
        dragStartScroll = filtersEl.scrollLeft;
    }

    function onFiltersPointerMove(e: PointerEvent) {
        if (!draggingFilters || !filtersEl || e.pointerType !== "mouse")
            return;
        const dx = e.clientX - dragStartX;
        if (Math.abs(dx) > 5) dragMoved = true;
        if (dragMoved) filtersEl.scrollLeft = dragStartScroll - dx;
    }

    function endFiltersDrag() {
        if (!draggingFilters) return;
        draggingFilters = false;
        // Suprime el click que sigue a un arrastre
        if (dragMoved) {
            setTimeout(() => {
                dragMoved = false;
            }, 0);
        }
    }

    function onFiltersWheel(e: WheelEvent) {
        if (!filtersEl) return;
        const maxScroll = filtersEl.scrollWidth - filtersEl.clientWidth;
        if (maxScroll <= 0) return;
        // Shift+rueda: traducir scroll vertical a horizontal
        if (e.shiftKey && e.deltaY !== 0) {
            e.preventDefault();
            filtersEl.scrollLeft += e.deltaY;
        }
    }

    function handleFilterClick(e: MouseEvent, filter: string) {
        if (dragMoved) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        selectFilter(filter);
    }

    /**
     * @param {string} filter
     */
    function selectFilter(filter: string) {
        activeFilter = activeFilter === filter ? "Todo" : filter;

        carousel?.scrollTo({
            left: 0,
            behavior: "smooth",
        });
    }

    /*
  ==========================================
  CARRUSEL
  ==========================================
  */

    let carousel: HTMLDivElement | null = $state(
        /** @type {HTMLDivElement | null} */ (null),
    );
    const SCROLL_AMOUNT = 480;

    function closeBenefitOverlays() {
        window.dispatchEvent(new CustomEvent("close-benefit-overlays"));
    }

    /**
     * @param {-1 | 1} direction
     */
    function moveCarousel(direction: number) {
        if (!carousel) return;

        closeBenefitOverlays();

        const maxScroll = carousel.scrollWidth - carousel.clientWidth;

        if (maxScroll <= 0) return;

        const nextPosition = carousel.scrollLeft + direction * SCROLL_AMOUNT;

        if (direction === 1 && nextPosition >= maxScroll - 10) {
            carousel.scrollTo({
                left: 0,
                behavior: "smooth",
            });

            return;
        }

        if (direction === -1 && nextPosition <= 10) {
            carousel.scrollTo({
                left: maxScroll,
                behavior: "smooth",
            });

            return;
        }

        carousel.scrollBy({
            left: direction * SCROLL_AMOUNT,
            behavior: "smooth",
        });
    }

    function next() {
        moveCarousel(1);
    }

    function prev() {
        moveCarousel(-1);
    }
</script>

<section class="section">
    <div class="top">
        <div class="title-group">
            <h2>{title}</h2>

            <a class="more-btn" href="/benefits">Ver más</a>
        </div>
    </div>

    <div
        class="filters"
        class:dragging={draggingFilters}
        bind:this={filtersEl}
        role="group"
        aria-label="Filtros por categoría"
        aria-busy={filters.length === 0}
        onpointerdown={onFiltersPointerDown}
        onpointermove={onFiltersPointerMove}
        onpointerup={endFiltersDrag}
        onpointercancel={endFiltersDrag}
        onpointerleave={endFiltersDrag}
        onwheel={onFiltersWheel}
    >
        {#if filters.length === 0}
            {#each Array(6) as _, i (i)}
                <div class="filter-skeleton" aria-hidden="true"></div>
            {/each}
        {:else}
            {#each filters as filter}
                <button
                    class:active={activeFilter === filter}
                    onclick={(e) => handleFilterClick(e, filter)}
                >
                    {filter}
                </button>
            {/each}
        {/if}
    </div>

    <div class="carousel-wrapper" aria-busy={loading}>
        {#if loading}
            <div class="loading-container" role="status" aria-label="Cargando beneficios">
                <div class="spinner"></div>
                <p>Cargando Beneficios</p>
            </div>
        {:else if filteredBenefits.length === 0}
            <div class="empty-state" role="status">
                <TicketX size={48} strokeWidth={1.5} />
                <p class="empty-title">No hay beneficios para mostrar</p>
                <p class="empty-subtitle">
                    Por el momento no hay beneficios en esta sección
                </p>
            </div>
        {:else}
            <button
                type="button"
                class="arrow left"
                onclick={prev}
                aria-label="Ver beneficios anteriores"
            >
                <ChevronLeft size={24} />
            </button>

            <div class="carousel" bind:this={carousel}>
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
                            max_coupons={benefit.max_coupons}
                            coupons={benefit.coupons}
                            max_per_user={benefit.max_per_user}
                            description={benefit.description}
                        />
                    </div>
                {/each}
            </div>

            <button
                type="button"
                class="arrow right"
                onclick={next}
                aria-label="Ver más beneficios"
            >
                <ChevronRight size={24} />
            </button>
        {/if}
    </div>
</section>

<style>
    /*
  ==========================================
  VARIABLES
  ==========================================
  */

    :root {
        --primary: #19194f;
        --primary-light: #2b2b88;

        --shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
    }

    /*
  ==========================================
  SECTION
  ==========================================
  */

    .section {
        width: 100%;
        max-width: 1205px;

        margin: auto;
        margin-top: 62px;
        padding: 0 12px;

        overflow: visible;
    }

    .top {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .title-group {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    /*
  ==========================================
  TITULOS
  ==========================================
  */

    h2 {
        margin: 0;

        font-size: 25px;
        font-weight: 800;
        line-height: 1;

        color: #050505;
    }

    .more-btn {
        padding: 0;

        border: none;
        background: transparent;
        color: #050505;

        font-size: 11px;
        font-weight: 800;
        line-height: 1;

        cursor: pointer;

        transition:
            transform 0.3s ease,
            color 0.3s ease;
    }

    .more-btn:hover {
        transform: translateX(4px);

        color: var(--primary);
    }

    /*
  ==========================================
  FILTROS
  ==========================================
  */

    .filters {
        margin-top: 11px;
        min-height: 32px;

        display: flex;
        gap: 9px;
        align-items: center;

        overflow-x: auto;
        overflow-y: hidden;
        padding-top: 0.5rem;

        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;

        cursor: grab;
    }

    .filters.dragging {
        cursor: grabbing;
        scroll-behavior: auto;
    }

    .filters.dragging button {
        user-select: none;
    }

    .filter-skeleton {
        flex: 0 0 auto;
        min-width: 111px;
        height: 32px;
        border-radius: 999px;
        background: #e1e3e8;
        animation: skeleton-pulse 1.4s ease-in-out infinite;
    }

    @keyframes skeleton-pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.45;
        }
    }

    .filters::-webkit-scrollbar {
        display: none;
    }

    .filters button {
        flex: 0 0 auto;
        min-width: 111px;
        height: 32px;

        padding: 0 18px;

        border-radius: 999px;

        border: 1px solid #c7c8cf;

        background: transparent;
        color: #050505;

        font-size: 15px;
        font-weight: 700;

        cursor: pointer;

        transition:
            background 0.3s ease,
            color 0.3s ease,
            transform 0.3s ease,
            box-shadow 0.3s ease;
    }

    .filters button:hover {
        transform: translateY(-2px);

        box-shadow: none;
    }

    .filters button.active {
        background: #151535;

        color: white;

        border-color: transparent;

        box-shadow: none;

        transform: translateY(-2px);
    }

    /*
  ==========================================
  CARRUSEL
  ==========================================
  */
    /*
==========================================
CARRUSEL
==========================================
*/

    .carousel-wrapper {
        margin-top: 26px;
        margin-left: -60px;

        position: relative;

        width: calc(100% + 120px);
        min-height: 20rem;
    }

    .carousel {
        display: flex;
        gap: 26px;

        overflow-x: hidden;
        overflow-y: visible;

        scroll-behavior: smooth;
        min-height: 20rem;

        margin: 0 60px;
        padding: 0 22px 8px 0;

        mask-image: none;
        -webkit-mask-image: none;
    }

    .card-wrapper {
        position: relative;

        min-width: 455px;
        max-width: 455px;

        flex-shrink: 0;

        transition: z-index 0.2s ease;
    }

    .card-wrapper:hover {
        z-index: 100;
    }

    .loading-container {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        min-height: 20rem;
        padding: 60px 0;
        color: #151535;
        font-size: 16px;
        font-weight: 600;
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 20rem;
        margin: 0 60px;
        padding: 40px 16px;
        text-align: center;
        color: #b8bcc4;
    }

    .empty-state :global(svg) {
        color: #c9ccd3;
    }

    .empty-state .empty-title {
        margin: 8px 0 0;
        font-size: 17px;
        font-weight: 700;
        color: #b8bcc4;
    }

    .empty-state .empty-subtitle {
        margin: 0;
        font-size: 14px;
        font-weight: 500;
        color: #c9ccd3;
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

    /*
  ==========================================
  FLECHAS
  ==========================================
  */

    .arrow {
        position: absolute;
        top: 50%;

        transform: translateY(-50%);

        width: 42px;
        height: 42px;

        border-radius: 50%;
        border: none;

        background: #e1e3e8;
        color: #4a4d55;

        box-shadow: none;

        display: flex;
        align-items: center;
        justify-content: center;

        cursor: pointer;

        z-index: 30;

        transition:
            transform 0.25s ease,
            background 0.25s ease;
    }

    .arrow:hover {
        transform: translateY(-50%) scale(1.08);

        background: #d6d9e0;
    }

    .left {
        left: 0;
    }

    .right {
        right: 0;
    }

    /*
  ==========================================
  RESPONSIVE
  ==========================================
  */

    @media (max-width: 768px) {
        .section {
            padding: 0 12px;
            margin-top: 48px;
        }

        .carousel-wrapper {
            margin-left: 0;
            width: 100%;
            min-height: 20rem;
        }

        .loading-container,
        .empty-state {
            min-height: 20rem;
        }

        .empty-state {
            margin: 0;
        }

        h2 {
            font-size: 24px;
        }

        .title-group {
            gap: 8px;
        }

        .more-btn {
            font-size: 13px;
        }

        .filters {
            gap: 8px;
            margin-left: -12px;
            margin-right: -12px;
            padding: 0 12px 10px;
        }

        .filters button {
            width: auto;
            min-width: 92px;
            height: 34px;

            padding: 0 18px;

            font-size: 15px;
        }

        .filter-skeleton {
            min-width: 92px;
            height: 34px;
        }

        .carousel {
            gap: 18px;
            margin: 0;
            padding-right: 0;
            overflow-x: auto;
            scrollbar-width: none;
            scroll-snap-type: x mandatory;
        }

        .carousel::-webkit-scrollbar {
            display: none;
        }

        .card-wrapper {
            min-width: min(86vw, 390px);
            max-width: min(86vw, 390px);
            scroll-snap-align: start;
        }

        .arrow {
            display: none;
        }
    }

    @media (max-width: 420px) {
        h2 {
            font-size: 28px;
            line-height: 1.05;
        }

        .title-group {
            align-items: baseline;
        }

        .filters button {
            min-width: 132px;
            height: 34px;
            font-size: 14px;
        }

        .card-wrapper {
            min-width: 88vw;
            max-width: 88vw;
        }
    }
</style>
