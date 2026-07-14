<script lang="ts">
    import { onMount } from "svelte";
    import type { Component } from "svelte";
    import HeroCarousel from "$lib/components/HeroCarousel.svelte";
    import Categories from "$lib/components/Categories.svelte";

    let BenefitsSection: Component | undefined = $state();
    let PartnersCarousel: Component | undefined = $state();
    let JoinSection: Component | undefined = $state();

    onMount(async () => {
        BenefitsSection = (
            await import("$lib/components/BenefitsSection.svelte")
        ).default;
        PartnersCarousel = (
            await import("$lib/components/PartnersCarousel.svelte")
        ).default;
        JoinSection = (await import("$lib/components/JoinSection.svelte"))
            .default;
    });
</script>

<svelte:head>
    <title>Home</title>
</svelte:head>

<HeroCarousel />

<Categories />

{#if BenefitsSection}
    <BenefitsSection />
    <BenefitsSection title="Nuevos beneficios" />
{/if}

{#if PartnersCarousel}
    <PartnersCarousel />
{/if}

{#if JoinSection}
    <JoinSection />
{/if}
