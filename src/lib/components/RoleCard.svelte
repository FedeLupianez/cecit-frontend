<script lang="ts">
    import User24Icon from "@iconify-svelte/qlementine-icons/user-24";
    import type { RoleAccess } from "$lib/access/roleAccess";

    let {
        access,
        compact = false,
        onLogout
    }: {
        access: RoleAccess;
        compact?: boolean;
        onLogout?: () => void;
    } = $props();
</script>

<article class:compact class="role-card" aria-label={`Accesos de ${access.label}`}>
    <header>
        <span>{access.label}</span>
        <User24Icon height="2.1em" aria-hidden="true" />
    </header>

    <nav aria-label={`Opciones de ${access.label}`}>
        {#each access.actions as action}
            <a href={action.href}>{action.label}</a>
        {/each}
        {#if onLogout}
            <button type="button" onclick={onLogout}>Cerrar sesión</button>
        {/if}
    </nav>
</article>

<style>
    .role-card {
        width: min(100%, 235px);
        min-height: 154px;
        padding: 14px 18px 20px;
        border: 1px solid #9a9a9a;
        border-radius: 12px;
        background: #fff;
        box-shadow: 0 8px 18px rgb(0 0 0 / 10%);
    }

    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        color: var(--primary-blue);
    }

    header span {
        padding: 4px 13px;
        border: 1px solid #555;
        border-radius: 999px;
        color: #333;
        font-size: 14px;
        line-height: 1;
    }

    nav {
        display: grid;
        gap: 9px;
        margin-top: 16px;
    }

    a {
        width: fit-content;
        color: #3b3b3b;
        font-size: 15px;
        line-height: 1.25;
        text-decoration: none;
    }

    button {
        width: fit-content;
        padding: 0;
        border: 0;
        background: transparent;
        color: #3b3b3b;
        font: inherit;
        font-size: 15px;
        line-height: 1.25;
        cursor: pointer;
    }

    a:hover,
    a:focus-visible {
        color: var(--primary-blue);
        text-decoration: underline;
        text-underline-offset: 3px;
    }

    button:hover,
    button:focus-visible {
        color: var(--primary-blue);
        text-decoration: underline;
        text-underline-offset: 3px;
    }

    .role-card.compact {
        width: 136px;
        min-height: 0;
        padding: 9px 11px 12px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgb(0 0 0 / 13%);
    }

    .compact header { gap: 7px; }
    .compact header span { max-width: 81px; padding: 0; border: 0; border-radius: 0; font-size: 12px; line-height: 1.05; }
    .compact nav { gap: 4px; margin-top: 9px; }
    .compact a, .compact button { font-size: 11px; }
</style>
