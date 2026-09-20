<script lang="ts">
    import "../app.css";

    import Navbar from "$lib/components/Navbar.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import NavigationProgress from "$lib/components/NavigationProgress.svelte";
    import { navigating } from "$app/stores";

    let { children } = $props();

    let isNavigating = $derived($navigating !== null);

    $effect(() => {
        document.documentElement.classList.toggle(
            "is-navigating",
            isNavigating,
        );
    });
</script>

<svelte:head>
    <link rel="icon" href="/logo_sin_texto.png" />
</svelte:head>

<Navbar />
<NavigationProgress />
<main aria-busy={isNavigating}>
    {@render children()}
</main>
<Footer />

<style>
    main {
        flex: 1;
        background-color: white;
    }
</style>
