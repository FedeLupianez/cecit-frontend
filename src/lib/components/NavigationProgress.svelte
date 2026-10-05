<script lang="ts">
    import { navigating } from "$app/stores";

    // $navigating es null cuando no hay navegación en curso.
    // Lo usamos para mostrar barra superior + velo con cursor de carga.
    let active = $derived($navigating !== null);
</script>

{#if active}
    <div class="nav-progress" role="progressbar" aria-label="Cargando página">
        <div class="nav-progress-bar"></div>
    </div>
    <span class="nav-live sr-only" role="status">Cargando página…</span>
{/if}

<style>
    .nav-progress {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 9999;
        height: 3px;
        background: rgba(25, 25, 79, 0.12);
        pointer-events: none;
    }

    .nav-progress-bar {
        height: 100%;
        width: 30%;
        background: linear-gradient(
            90deg,
            var(--primary-blue, #19194f),
            #3434a0
        );
        border-radius: 0 999px 999px 0;
        animation: nav-slide 0.9s ease-in-out infinite;
    }

    @keyframes nav-slide {
        0% {
            margin-left: -30%;
        }
        100% {
            margin-left: 100%;
        }
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    @media (prefers-reduced-motion: reduce) {
        .nav-progress-bar {
            animation: none;
            width: 100%;
        }
    }
</style>
