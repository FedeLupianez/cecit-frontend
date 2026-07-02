<script lang="ts">
    import { profileStore } from "$lib/stores/profileStore";
    import User24Icon from "@iconify-svelte/qlementine-icons/user-24";
    import { Menu } from "lucide-svelte";
    import type { Profile } from "$lib/stores/profileStore";
    import { onMount } from "svelte";

    const logo =
        "http://centrodecomercioag.com.ar/wp-content/uploads/2023/07/logonuevo.png";

    let profile: Profile | null | undefined = $state();
    let avatar = $state<string>("");

    onMount(() => {
        const unsub = profileStore.subscribe((p) => {
            profile = p;
        });
        console.log(profile);
        return unsub;
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
        <a href="#/home">Institucional</a>
        <span class="separator" aria-hidden="true">|</span>
        <a href="#/become-member">Hacete socio</a>
        <span class="separator" aria-hidden="true">|</span>
        <a href="#/contact">Contacto</a>

        <button class="user-btn">
            {#if !profile}
                <User24Icon height="3.0em" class="profile-icon" />
            {:else}
                <img src={avatar} alt="profileImage" class="profile-icon" />
            {/if}
        </button>
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
