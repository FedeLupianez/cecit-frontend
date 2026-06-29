<script lang="ts">
    import { accessToken } from "$lib/stores/authStore";
    import "../app.css";

    import Navbar from "$lib/components/Navbar.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { profileStore } from "$lib/stores/profileStore";

    let { children } = $props();
    let initialized = false;
    let currentToken = $state(accessToken.getToken());

    async function refreshProfile() {
        const token = accessToken.getToken();
        const res = await fetch("/api/auth/profile", {
            method: "GET",
            credentials: "include",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            profileStore.clear();
            return;
        }
        const data = await res.json();
        profileStore.setProfile(data);
    }

    async function refresh() {
        if (initialized) return;

        const res = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
        });

        if (res.ok) {
            const data = await res.json();
            accessToken.setToken(data.access_token);
            initialized = true;
            return;
        }
        profileStore.clear();
        accessToken.clear();

        goto("/login");
    }

    $effect(() => {
        if (currentToken) {
            refreshProfile();
        }
    });

    onMount(() => {
        const unsub = accessToken.subscribe((value) => {
            currentToken = value;
        });
        refresh();
        return unsub;
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
    }
</style>
