<script lang="ts">
    import "../app.css";

    import Navbar from "$lib/components/Navbar.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import { profileStore } from "$lib/stores/profileStore.js";
    import { accessToken } from "$lib/stores/authStore.js";

    let { data, children } = $props();

    $effect(() => {
        profileStore.setProfile(data.profile);
        accessToken.setToken(data.access_token);
    });
</script>

<svelte:head>
    <link
        rel="icon"
        href="http://centrodecomercioag.com.ar/wp-content/uploads/2023/07/cecit2023.png"
    />
</svelte:head>

<Navbar />
<main>
    {@render children()}
</main>
<Footer />

<style>
    main {
        flex: 1;
        background-color: white;
    }
</style>
