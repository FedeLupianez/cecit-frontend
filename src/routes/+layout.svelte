<script lang="ts">
    import Navbar from "$lib/components/Navbar.svelte";
    import Footer from "$lib/components/Footer.svelte";

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href="http://centrodecomercioag.com.ar/wp-content/uploads/2023/07/cecit2023.png" />
</svelte:head>

<Navbar />

<main>
    {@render children()}
</main>

<Footer />

<style>
    main {
        flex: 1;
    }
    * {
        font-family: "Open Sauce One", sans-serif;
    }
</style>
