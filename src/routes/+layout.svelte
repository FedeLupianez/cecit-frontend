<script lang="ts">
    import { accessToken } from "$lib/stores/authStore";
    import "../app.css";

    import Navbar from "$lib/components/Navbar.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import { profileStore } from "$lib/stores/profileStore";

    let { children, data } = $props();

    $effect(() => {
        if (data?.accessToken) {
            accessToken.setToken(data.accessToken);
        }
        if (data?.profile) {
            profileStore.setProfile(data.profile);
        }
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
