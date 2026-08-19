<script lang="ts">
    import { goto } from "$app/navigation";
</script>

<svelte:head>
    <title>404 - Página no encontrada</title>
</svelte:head>

<section class="not-found-page">
    <div class="not-found-content">
        <span class="error-code">404</span>

        <h1>Página no encontrada</h1>

        <p>Parece que la página que estás buscando no existe o fue movida.</p>

        <button type="button" onclick={() => goto("/")}>
            Volver al inicio
        </button>
    </div>
</section>

<style>
    .not-found-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 32px;
        background: #eef2f8;
    }

    .not-found-content {
        width: 100%;
        max-width: 760px;
        text-align: center;
    }

    .error-code {
        display: block;
        margin-bottom: 8px;
        color: #151535;
        font-size: clamp(110px, 20vw, 220px);
        font-weight: 900;
        line-height: 0.85;
        letter-spacing: -8px;
    }

    h1 {
        margin: 28px 0 16px;
        color: #151535;
        font-size: clamp(36px, 5vw, 58px);
        font-weight: 900;
        line-height: 1.05;
    }

    p {
        max-width: 540px;
        margin: 0 auto;
        color: #555a68;
        font-size: 18px;
        font-weight: 600;
        line-height: 1.5;
    }

    button {
        margin-top: 32px;
        height: 46px;
        padding: 0 28px;
        border: 0;
        border-radius: 999px;
        background: #151535;
        color: #fff;
        cursor: pointer;
        font-family: inherit;
        font-size: 14px;
        font-weight: 800;
        transition:
            transform 0.2s ease,
            background 0.2s ease;
    }

    button:hover {
        transform: translateY(-2px);
        background: #25254d;
    }

    button:active {
        transform: translateY(0);
    }

    @media (max-width: 720px) {
        .not-found-page {
            padding: 28px 14px;
        }

        .error-code {
            font-size: clamp(90px, 28vw, 150px);
            letter-spacing: -5px;
        }

        h1 {
            margin-top: 22px;
            font-size: 36px;
        }

        p {
            font-size: 16px;
        }
    }
</style>
