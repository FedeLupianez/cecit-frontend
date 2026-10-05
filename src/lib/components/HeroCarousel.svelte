<script>
    import { goto } from "$app/navigation";
    import { Search } from "lucide-svelte";

    const banner =
        "https://www.fotorevista.com.ar/SFotos/16/10/22/161022142707g.jpg";
    let search_text = $state("");
    let searching = $state(false);

    async function to_search() {
        if (!search_text || searching) return;
        searching = true;
        try {
            await goto(`/benefits?search=${encodeURIComponent(search_text)}`);
        } finally {
            searching = false;
        }
    }
</script>

<section class="hero">
    <img loading="lazy" src={banner} alt="banner" />

    <div class="search-box">
        <input
            placeholder="Busca por palabra clave o marca"
            bind:value={search_text}
            onkeydown={(e) => e.key === "Enter" && to_search()}
            disabled={searching}
        />

        <button
            onclick={to_search}
            disabled={searching}
            class:is-pending={searching}
            aria-busy={searching || undefined}
            aria-label={searching ? "Buscando…" : "Buscar beneficios"}
        >
            {#if searching}
                <span class="mini-spinner light" aria-hidden="true"></span>
            {:else}
                <Search size={20} />
            {/if}
        </button>
    </div>
</section>

<style>
    .hero {
        width: 100%;
        max-width: 1200px;

        margin: auto;
        padding: 0 12px;
    }

    img {
        width: 100%;
        height: 350px;

        object-fit: cover;

        border-radius: 20px;
    }

    .search-box {
        width: 60%;

        margin: auto;
        margin-top: -30px;

        background: white;
        border-radius: 50px;

        display: flex;
        align-items: center;

        overflow: hidden;

        position: relative;
        z-index: 5;
    }

    input {
        min-width: 0;
        flex: 1;

        border: none;

        padding: 18px;

        outline: none;
    }

    button {
        width: 60px;
        height: 60px;

        border: none;

        background: #19194f;
        color: white;

        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    button:disabled {
        cursor: progress;
        opacity: 0.85;
    }

    .mini-spinner.light {
        border-color: rgba(255, 255, 255, 0.35);
        border-top-color: #fff;
        width: 20px;
        height: 20px;
    }

    @media (max-width: 768px) {
        .hero {
            margin-top: 16px;
        }

        .search-box {
            width: 90%;
        }

        img {
            height: 220px;
            border-radius: 14px;
        }
    }

    @media (max-width: 420px) {
        .search-box {
            width: calc(100% - 24px);
        }

        input {
            padding: 14px;
            font-size: 13px;
        }

        button {
            width: 52px;
            height: 52px;
            flex: 0 0 auto;
        }
    }
</style>
