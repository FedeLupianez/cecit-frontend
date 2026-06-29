<script lang="ts">
    import { onMount } from "svelte";

    interface Partner {
        name: string;
        logo: string;
    }

    let partners: Partner[] = $state([]);

    async function load_partners() {
        const result = await fetch("/api/partners/all", {
            method: "GET",
            credentials: "include",
        });
        if (!result.ok) return;
        const data = await result.json();
        partners = [...data, ...data, ...data, ...data]; // Partners Repetidos
    }
    onMount(load_partners);
</script>

<section class="partners">
    <h2>Nuestros socios</h2>

    <div class="carousel">
        <div class="track">
            {#each partners as partner}
                <div class="partner-card">
                    <img
                        loading="lazy"
                        src={partner.logo}
                        alt={partner.name}
                        onerror={(e) =>
                            (e.target.src =
                                "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg")}
                    />
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

        animation: partners-scroll 24s linear infinite;
    }

    .carousel:hover .track {
        animation-play-state: paused;
    }

    .partner-card {
        width: 15rem;
        flex: 0 0 auto;

        text-align: center;
    }

    img {
        width: 10rem;
        height: 10rem;

        object-fit: cover;
        border-radius: 99%;

        background: white;

        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
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

        img {
            width: 104px;
            height: 104px;
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

        img {
            width: 92px;
            height: 92px;
        }
    }
</style>
