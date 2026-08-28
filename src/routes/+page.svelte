<script lang="ts">
    import HeroCarousel from "$lib/components/HeroCarousel.svelte";
    import Categories from "$lib/components/Categories.svelte";
    import BenefitsSection from "$lib/components/BenefitsSection.svelte";
    import PartnersCarousel from "$lib/components/PartnersCarousel.svelte";
    import JoinSection from "$lib/components/JoinSection.svelte";
</script>

<svelte:head>
    <title>Home</title>
</svelte:head>

<HeroCarousel />

<Categories />

<BenefitsSection
    title="Beneficios Populares"
    endpoint="/api/benefits/popular"
/>
<BenefitsSection title="Nuevos beneficios" endpoint="/api/benefits/news" />

<PartnersCarousel />

<JoinSection />
