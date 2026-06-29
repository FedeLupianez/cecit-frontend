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
    <title>CeCIT Home</title>
</svelte:head>

<section class="home-page">
    <HeroCarousel />

    <Categories />

    {#if BenefitsSection}
        <BenefitsSection title="Beneficios populares" />
        <BenefitsSection title="Nuevos beneficios" />
    {/if}

    {#if PartnersCarousel}
        <PartnersCarousel />
    {/if}

    {#if JoinSection}
        <JoinSection />
    {/if}
</section>

<style>
    .home-page {
        margin-top: 3rem;
        padding-bottom: 50px;
        background: linear-gradient(#f6f9ff, #feffff);
    }
</style>
