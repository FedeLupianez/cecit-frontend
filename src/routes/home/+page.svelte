<script>
    import HeroCarousel from "$lib/components/HeroCarousel.svelte";
    import Categories from "$lib/components/Categories.svelte";
    import BenefitsSection from "$lib/components/BenefitsSection.svelte";
    import PartnersCarousel from "$lib/components/PartnersCarousel.svelte";
    import JoinSection from "$lib/components/JoinSection.svelte";
</script>

<svelte:head>
    <title>CeCIT Home</title>
</svelte:head>

<section class="home-page">
    <HeroCarousel />

    <Categories />

    <BenefitsSection title="Beneficios populares" />

    <BenefitsSection title="Nuevos beneficios" />

    <PartnersCarousel />

    <JoinSection />
</section>

<style>
    .home-page {
        padding-bottom: 50px;
    }
</style>
