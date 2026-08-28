<script lang="ts">
    import type { RoleAccess } from "$lib/access/roleAccess";
    import { LogOut } from "lucide-svelte";

    let {
        access,
        compact = false,
        onLogout,
    }: {
        access: RoleAccess;
        compact?: boolean;
        onLogout?: () => void;
    } = $props();
</script>

<article
    class:compact
    class="role-card"
    aria-label={`Accesos de ${access.label}`}
>
    <header>
        <span>{access.label}</span>
    </header>

    <nav aria-label={`Opciones de ${access.label}`}>
        {#each access.actions as action}
            <a class="option-btn" href={action.href}>{action.label}</a>
        {/each}
        {#if onLogout}
            <div class="logout">
                <button type="button" onclick={onLogout}
                    >Cerrar sesión
                    <LogOut size={18} />
                </button>
            </div>
        {/if}
    </nav>
</article>

<style>
    .role-card {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        width: 30rem;
        min-height: 40rem;
        padding: 7rem;
        border: 1px solid #9a9a9a;
        border-radius: 15px;
        background: #fff;
        box-shadow: 0 8px 18px rgb(0 0 0 / 10%);
    }
    .option-btn {
        display: flex;
        width: 100%;
        text-align: left;
        padding: 1rem;
    }

    .option-btn:hover {
        background-color: lightgray;
        color: initial;
        text-decoration: none;
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
        line-height: 1;
        font-size: 10rem;
        font-weight: bold;
    }

    nav {
        display: grid;
        gap: 9px;
        margin-top: 16px;
    }

    a,
    button {
        color: #111827;
        background-color: #ffffff;
        font-weight: bold;
        border-radius: 15px;
        cursor: pointer;
    }

    a {
        width: fit-content;
        font-size: 15px;
        line-height: 1.25;
        text-decoration: none;
    }

    button {
        width: 100%;
        background-color: red;
        font-size: 15px;
        border: none;
        padding: 1rem;
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
        align-items: center;
        justify-content: center;
    }

    button:hover {
        background-color: #fef2f2;
        color: #b91c1c;
    }

    button:active {
        background-color: #fee2e2;
    }

    button:focus-visible {
        outline: 2px solid #fca5a5;
        outline-offset: 2px;
    }

    a:hover,
    a:focus-visible {
        color: #f3f4f6;
        text-decoration: underline;
        text-underline-offset: 3px;
    }

    .role-card.compact {
        width: 12rem;
        min-height: 10rem;
        padding: 9px 11px 12px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgb(0 0 0 / 13%);
    }

    .compact header {
        gap: 7px;
    }
    .compact header span {
        text-align: center;
        display: inline-block;
        width: fit-content;
        padding: 0;
        border: 0;
        border-radius: 0;
        font-size: 0.9rem;
        line-height: 1.05;
    }
    .compact nav {
        gap: 4px;
        margin-top: 9px;
    }
    .compact a,
    .compact button {
        font-size: 11px;
    }
</style>
