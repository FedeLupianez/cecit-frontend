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
        position: relative;
        align-items: stretch;
        justify-content: flex-start;
        width: 15.5rem;
        min-height: 0;
        padding: 10px;
        border: 1px solid #d2d4da;
        border-radius: 14px;
        box-shadow: 0 12px 32px rgb(0 0 0 / 16%);
        transform-origin: top right;
        animation: role-drop-in 0.16s ease;
    }

    .role-card.compact::before {
        content: "";
        position: absolute;
        top: -7px;
        right: 24px;
        width: 14px;
        height: 14px;
        background: #fff;
        border-top: 1px solid #d2d4da;
        border-left: 1px solid #d2d4da;
        transform: rotate(45deg);
    }

    @keyframes role-drop-in {
        from {
            opacity: 0;
            transform: translateY(-8px) scale(0.97);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    .compact header {
        gap: 7px;
        padding: 2px 4px 10px;
    }
    .compact header span {
        width: fit-content;
        padding: 4px 12px;
        border: 1px solid #e1e3e8;
        border-radius: 999px;
        background: #f4f5f7;
        color: #19194f;
        font-size: 0.72rem;
        font-weight: 700;
        line-height: 1;
        letter-spacing: 0.4px;
        text-transform: uppercase;
    }
    .compact nav {
        gap: 2px;
        margin-top: 0;
    }
    .compact a,
    .compact button {
        font-size: 13px;
    }
    .compact .option-btn {
        width: 100%;
        padding: 10px 12px;
        border-radius: 10px;
        color: #050505;
        font-weight: 600;
        line-height: 1.25;
        transition:
            background-color 0.15s ease,
            color 0.15s ease;
    }
    .compact .option-btn:hover,
    .compact .option-btn:focus-visible {
        background-color: #eef0f4;
        color: #19194f;
        text-decoration: none;
    }
    .compact .logout {
        margin-top: 6px;
        padding-top: 4px;
        border-top: 1px solid #ececf0;
    }
    .compact .logout button {
        justify-content: flex-start;
        border-radius: 10px;
        background-color: transparent;
        color: #c0392b;
        font-weight: 600;
    }
    .compact .logout button:hover {
        background-color: #fdf0f0;
        color: #b91c1c;
    }
    .compact .logout button:active {
        background-color: #fbe2e2;
    }
    .compact .logout button:focus-visible {
        outline: 2px solid #f5b8b8;
        outline-offset: 2px;
    }
</style>
