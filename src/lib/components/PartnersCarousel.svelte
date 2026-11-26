<script lang="ts">
    import { onMount } from "svelte";
    import { loadPartners, getPartners } from "$lib/stores/partners.svelte";
    import Avatar from "$lib/components/Avatar.svelte";

    let partners = $derived.by(() => {
        const p = getPartners();
        return [...p, ...p]; // duplicate for seamless carousel loop
    });

    onMount(() => {
        loadPartners();
    });
</script>

<section class="partners">
    <h2>Nuestros socios</h2>

    <div class="carousel">
        <div class="track">
            {#each partners as partner}
                <div class="partner-card">
                    <div
                        class="partner-logo"
                        role="img"
                        aria-label={partner.name}
                    >
                        {#if partner.logo && partner.logo.startsWith("https://ui-avatars.com/api")}
                            <Avatar
                                name={partner.name}
                                size={160}
                                class="logo-fallback"
                                alt={partner.name}
                            />
                        {:else if partner.logo}
                            <img
                                loading="lazy"
                                src={partner.logo}
                                alt=""
                                onerror={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                        {:else}
                            <Avatar
                                name={partner.name}
                                size={160}
                                class="logo-fallback"
                                alt={partner.name}
                            />
                        {/if}
                    </div>
                    <p>{partner.name}</p>
                </div>
            {/each}
        </div>
    </div>
</section>

<style>
    .partners {
        width: 90%;

        margin: auto;
        margin-top: 66px;

        overflow: hidden;
    }

    h2 {
        margin: 0;

        color: #050505;

        font-size: 2.5rem;
        font-weight: 800;
        line-height: 1;
    }

    .carousel {
        margin-top: 28px;
        width: 100%;

        overflow: hidden;
    }

    .track {
        width: max-content;

        display: flex;
        align-items: center;
        gap: 52px;

        animation: partners-scroll 70s linear infinite;
    }

    .carousel:hover .track {
        animation-play-state: paused;
    }

    .partner-card {
        width: 15rem;
        flex: 0 0 auto;

        text-align: center;
    }

    .partner-logo {
        width: 10rem;
        height: 10rem;
        margin: 0 auto;
        position: relative;
        border-radius: 50%;
        overflow: hidden;
        background: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    .partner-logo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
        transition: opacity 0.2s ease;
    }

    .partner-logo img:not([style*="display: none"]) + .logo-fallback {
        display: none;
    }

    .logo-fallback {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }

    p {
        margin: 10px 0 0;

        color: #151535;

        font-size: 1rem;
        font-weight: 800;
        line-height: 1.15;
        text-transform: uppercase;
    }

    @keyframes partners-scroll {
        from {
            transform: translateX(0);
        }

        to {
            transform: translateX(-50%);
        }
    }

    @media (max-width: 768px) {
        .partners {
            padding: 0 12px;
            margin-top: 58px;
        }

        h2 {
            font-size: 28px;
        }

        .track {
            gap: 34px;
            animation-duration: 18s;
        }

        .partner-card {
            width: 116px;
        }

        .partner-logo {
            width: 104px;
            height: 104px;
        }

        .logo-fallback {
            font-size: 28px;
        }

        p {
            font-size: 13px;
        }
    }

    @media (max-width: 420px) {
        .track {
            gap: 28px;
        }

        .partner-card {
            width: 104px;
        }

        .partner-logo {
            width: 92px;
            height: 92px;
        }

        .logo-fallback {
            font-size: 24px;
        }
    }
</style>
