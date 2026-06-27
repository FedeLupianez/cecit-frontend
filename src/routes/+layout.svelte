<script lang="ts">
    import { accessToken } from "$lib/stores/authStore";

    import Navbar from "$lib/components/Navbar.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import { onMount } from "svelte";

    let { children } = $props();
    let initialized = false;

    async function refresh() {
        if (initialized) return;
        initialized = true;

        const token = accessToken.getToken();
        if (token) return;

        const res = await fetch("http://localhost:3000/auth/refresh", {
            method: "POST",
            credentials: "include",
        });

        if (res.ok) {
            const data = await res.json();
            accessToken.setToken(data.access_token);
        }
    }

    onMount(refresh);
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
    }
    * {
        font-family: "Open Sauce One", sans-serif;
    }
</style>
