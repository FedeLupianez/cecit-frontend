<script lang="ts">
    import { profileStore } from "$lib/stores/profileStore";
    import User24Icon from "@iconify-svelte/qlementine-icons/user-24";
    import { Menu } from "lucide-svelte";
    import type { Profile } from "$lib/stores/profileStore";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { accessToken } from "$lib/stores/authStore";
    import { getRoleAccess } from "$lib/access/roleAccess";
    import RoleCard from "$lib/components/RoleCard.svelte";

    const logo =
        "http://centrodecomercioag.com.ar/wp-content/uploads/2023/07/logonuevo.png";

    let profile: Profile | null | undefined = $state();
    let avatar = $state<string>("");
    let showRoleMenu = $state(false);
    let userMenu: HTMLDivElement | null = $state(null);
    let access = $derived(getRoleAccess(profile?.role));

    async function logout() {
        try {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        } finally {
            accessToken.clear();
            profileStore.clear();
            showRoleMenu = false;
            await goto("/login");
        }
    }

    function closeMenuOnOutsideClick(event: MouseEvent) {
        if (userMenu && !userMenu.contains(event.target as Node)) {
            showRoleMenu = false;
        }
    }

    function closeMenuOnEscape(event: KeyboardEvent) {
        if (event.key === "Escape") showRoleMenu = false;
    }

    onMount(() => {
        const unsub = profileStore.subscribe((p) => {
            profile = p;
        });
        console.log(profile);
        window.addEventListener("click", closeMenuOnOutsideClick);
        window.addEventListener("keydown", closeMenuOnEscape);
        return () => {
            unsub();
            window.removeEventListener("click", closeMenuOnOutsideClick);
            window.removeEventListener("keydown", closeMenuOnEscape);
        };
    });

    $effect(() => {
        if (!profile?.email) {
            avatar = "";
            return;
        }
        avatar = `https://ui-avatars.com/api/?background=random&name=${profile.email}`;
    });
</script>

<nav class="navbar">
    <div class="logo">
        <img loading="lazy" src={logo} alt="CeCIT Logo" />
    </div>

    <div class="links">
        <a href="http://centrodecomercioag.com.ar/">Institucional</a>
        <span class="separator" aria-hidden="true">|</span>
        <a href="http://centrodecomercioag.com.ar/hacete-socio/">Hacete socio</a>
        <span class="separator" aria-hidden="true">|</span>
        <a href="http://centrodecomercioag.com.ar/contacto/">Contacto</a>

        <div class="user-menu" bind:this={userMenu}>
        <button
            class="user-btn"
            type="button"
            aria-label="Abrir menú de usuario"
            aria-expanded={showRoleMenu}
            onclick={() => (showRoleMenu = !showRoleMenu)}
        >
            {#if !profile}
                <User24Icon height="3.0em" class="profile-icon" />
            {:else}
                <img src={avatar} alt="profileImage" class="profile-icon" />
            {/if}
        </button>

        {#if showRoleMenu}
            <div class="role-menu">
                {#if access}
                    <RoleCard {access} compact onLogout={logout} />
                {:else}
                    <p class="role-loading">Cargando perfil...</p>
                {/if}
            </div>
        {/if}
        </div>
    </div>

    <button class="menu-btn" type="button" aria-label="Abrir menú">
        <Menu size={34} strokeWidth={2.5} />
    </button>
</nav>

<style>
    .navbar {
        min-height: 92px;
        background: white;

        display: flex;
        justify-content: space-between;
        align-items: center;
        align-self: center;
        gap: 24px;
        padding: 16px clamp(16px, 6vw, 96px);
    }

    .links {
        display: flex;
        align-items: center;
        gap: clamp(12px, 2.3vw, 30px);
        min-width: 0;
    }

    .logo img {
        height: 78px;
        object-fit: contain;
    }

    a {
        text-decoration: none;
        color: #111;
        font-size: 20px;
    }

    .separator {
        color: #111;
        font-size: 20px;
    }

    .user-btn {
        border: none;
        background: transparent;
        flex: 0 0 auto;
        display: flex;
        color: inherit;
        cursor: pointer;
    }

    .user-menu { position: relative; flex: 0 0 auto; }

    .role-menu {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        z-index: 100;
    }

    .role-loading {
        width: 136px;
        margin: 0;
        padding: 12px;
        border: 1px solid #9a9a9a;
        border-radius: 5px;
        background: #fff;
        box-shadow: 0 4px 12px rgb(0 0 0 / 13%);
        font-size: 12px;
    }

    .menu-btn {
        display: none;
        border: none;
        background: transparent;
        color: #777;
        padding: 8px;
    }

    .profile-icon {
        border-radius: 100%;
    }

    @media (max-width: 768px) {
        .navbar {
            min-height: 92px;
            align-items: center;
            flex-direction: row;
            gap: 16px;
            padding: 18px 24px;
        }

        .links {
            display: none;
        }

        .logo img {
            height: 70px;
            max-width: 220px;
            width: auto;
        }

        .menu-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: auto;
        }
    }

    @media (max-width: 420px) {
        .navbar {
            padding: 16px 18px;
        }

        .logo img {
            height: 58px;
            max-width: 190px;
        }
    }
</style>
