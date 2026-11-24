<script lang="ts">
    import "./Categories.css";

    import {
        ChevronRight,
        ChevronLeft,
        Tag,
        Car,
        Gift,
        ShoppingBag,
        UtensilsCrossed,
        Heart,
        Home,
        GraduationCap,
        Plane,
        Shirt,
        Smartphone,
        Briefcase,
        Dumbbell,
        Dog,
        Baby,
        BookOpen,
        Music,
        Palette,
        Wrench,
        Stethoscope,
        Gem,
        Banknote,
        Landmark,
    } from "lucide-svelte";
    import { base } from "$app/paths";

    interface Category {
        name: string;
        icon: string;
    }

    let { categories = [] } = $props<{ categories: Category[] }>();

    const iconMap: Record<string, typeof Tag> = {
        Car,
        Gift,
        ShoppingBag,
        UtensilsCrossed,
        Heart,
        Home,
        GraduationCap,
        Plane,
        Shirt,
        Smartphone,
        Briefcase,
        Dumbbell,
        Dog,
        Baby,
        BookOpen,
        Music,
        Palette,
        Wrench,
        Stethoscope,
        Gem,
        Banknote,
        Landmark,
    };

    function getIcon(name: string) {
        return iconMap[name] ?? Tag;
    }

    let isLoading = $derived(categories.length === 0);

    let carousel: HTMLElement | undefined;

    const SCROLL_STEP = 300;

    function scrollCarousel(direction: number) {
        if (!carousel) return;

        carousel.scrollBy({
            left: direction * SCROLL_STEP,
            behavior: "smooth",
        });

        setTimeout(() => {
            if (!carousel) return;

            const maxScroll = carousel.scrollWidth - carousel.clientWidth;

            if (direction > 0 && carousel.scrollLeft >= maxScroll - 5) {
                carousel.scrollLeft = 0;
            }

            if (direction < 0 && carousel.scrollLeft <= 5) {
                carousel.scrollLeft = maxScroll;
            }
        }, 350);
    }
</script>

<section class="categories">
    <h2>Explorar cupones por categoría</h2>

    <div class="container">
        <button
            type="button"
            class="category-arrow"
            onclick={() => scrollCarousel(-1)}
            aria-label="Ver categorías anteriores"
        >
            <ChevronLeft size={24} />
        </button>

        <div class="category-carousel" bind:this={carousel}>
            <div class="category-track" aria-busy={isLoading}>
                {#if isLoading}
                    {#each Array(SKELETON_COUNT) as _, i (i)}
                        <div
                            class="category-wrapper skeleton"
                            aria-hidden="true"
                        >
                            <div class="skeleton-circle"></div>
                            <div class="skeleton-pill"></div>
                        </div>
                    {/each}
                {:else}
                    {#each categories as category}
                        {@const Icon = getIcon(category.icon)}
                        <a
                            class="category-wrapper"
                            href={`${base}/benefits?category=${category.name}`}
                        >
                            <button class="category-btn">
                                <Icon size={28} />
                            </button>

                            <span class="category-name">
                                {category.name}
                            </span>
                        </a>
                    {/each}
                {/if}
            </div>
        </div>

        <button
            type="button"
            class="category-arrow"
            onclick={() => scrollCarousel(1)}
            aria-label="Ver más categorías"
        >
            <ChevronRight size={24} />
        </button>
    </div>
</section>
