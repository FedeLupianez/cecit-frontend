<script lang="ts">
    import { accessToken } from "$lib/stores/authStore";
    import "../app.css";

    import Navbar from "$lib/components/Navbar.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import NavigationProgress from "$lib/components/NavigationProgress.svelte";
    import { profileStore } from "$lib/stores/profileStore";
    import { navigating, page } from "$app/stores";
    import { fade } from "svelte/transition";

    let { children, data } = $props();

    let isNavigating = $derived($navigating !== null);

    $effect(() => {
        if (data?.accessToken) {
            accessToken.setToken(data.accessToken);
        }
        if (data?.profile) {
            profileStore.setProfile(data.profile);
            console.log(profileStore.getProfile());
        }
    });

    // Cursor de carga global + aria-busy mientras navega
    $effect(() => {
        document.documentElement.classList.toggle(
            "is-navigating",
            isNavigating,
        );
    });
</script>

<svelte:head>
    <link
        rel="icon"
        href="http://centrodecomercioag.com.ar/wp-content/uploads/2023/07/cecit2023.png"
    />
</svelte:head>

<Navbar />
<NavigationProgress />
<main aria-busy={isNavigating}>
    {#key $page.url.pathname}
        <div class="page-enter" in:fade={{ duration: 160 }}>
            {@render children()}
        </div>
    {/key}
</main>
<Footer />

<style>
    main {
        flex: 1;
        background-color: white;
    }

    .page-enter {
        min-height: inherit;
    }
</style>
