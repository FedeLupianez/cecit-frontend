<script>
    import "./Categories.css";

    import { ChevronRight, ChevronLeft } from "lucide-svelte";
    import * as iconMap from "lucide-svelte";
    import { getCategories } from "$lib/stores/categories.svelte";

    /** @param {string} name */
    function getIcon(name) {
        return (
            iconMap[/** @type {keyof typeof iconMap} */ (name)] ?? iconMap.Book
        );
    }

    const COPIES = 6;

    let categories = $derived(getCategories());

    const loopCategories = $derived(
        Array.from({ length: COPIES }, () => categories).flat(),
    );

    let paused = $state(false);
</script>

<section class="categories">
    <h2>Explorar cupones por categoría</h2>

    <div class="container">
        <button
            type="button"
            class="category-arrow"
            onmouseenter={() => (paused = true)}
            onmouseleave={() => (paused = false)}
            aria-label="Ver categorías anteriores"
        >
            <ChevronLeft size={24} />
        </button>

        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="category-carousel"
            onmouseenter={() => (paused = true)}
            onmouseleave={() => (paused = false)}
        >
            <div class="category-track" class:paused>
                {#each loopCategories as category}
                    {@const Icon = getIcon(category.icon)}
                    <a
                        class="category-wrapper"
                        href={`/benefits?category=${category.name}`}
                    >
                        <button class="category-btn">
                            <Icon size={28} />
                        </button>

                        <span class="category-name">
                            {category.name}
                        </span>
                    </a>
                {/each}
            </div>
        </div>

        <button
            type="button"
            class="category-arrow"
            onmouseenter={() => (paused = true)}
            onmouseleave={() => (paused = false)}
            aria-label="Ver más categorías"
        >
            <ChevronRight size={24} />
        </button>
    </div>
</section>
