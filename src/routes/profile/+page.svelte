<script lang="ts">
    import { page } from "$app/state";
    import RoleCard from "$lib/components/RoleCard.svelte";
    import { getRoleAccess } from "$lib/access/roleAccess";

    const profile = $derived(page.data.profile as {
        user_id: string;
        email: string;
        role?: string;
    } | undefined);
    const access = $derived(getRoleAccess(profile?.role));
</script>

<svelte:head>
    <title>Mi perfil | CeCIT</title>
</svelte:head>

<section class="profile-page">
    <div class="profile-content">
        {#if access}
            <RoleCard {access} />
        {:else}
            <div class="state-card" role="alert">
                <h1>Sin rol disponible</h1>
                <p>No fue posible obtener un rol válido para tu cuenta.</p>
            </div>
        {/if}

        <div class="details">
            <section id="configuration" class="detail-section">
                <h1>Configuración</h1>
                <p>{profile?.email}</p>
                <p class="muted">ID de socio: {profile?.user_id}</p>
            </section>

            {#if profile?.role === "CECIT_ADMIN"}
                <section id="admin-panel" class="detail-section">
                    <h2>Panel de administrador</h2>
                    <p>Los accesos de administración están habilitados para tu rol.</p>
                </section>
                <section id="create-benefit" class="detail-section">
                    <h2>Crear beneficio</h2>
                    <p>La API permite crear beneficios con <code>POST /benefits</code>. Aún no existe un formulario de carga en este frontend.</p>
                </section>
            {:else if profile?.role === "PARTNER_ADMIN"}
                <section id="partner-panel" class="detail-section">
                    <h2>Panel de administrador</h2>
                    <p>Tu rol puede administrar el comercio asociado mediante los endpoints protegidos del backend.</p>
                </section>
            {/if}
        </div>
    </div>
</section>

<style>
    .profile-page { min-height: 62vh; background: #f5f6f8; padding: 48px 24px; }
    .profile-content { display: flex; width: min(100%, 860px); margin: 0 auto; gap: 42px; align-items: flex-start; }
    .details { flex: 1; display: grid; gap: 20px; }
    .detail-section, .state-card { border: 1px solid #d2d4da; border-radius: 12px; background: #fff; padding: 22px; box-shadow: 0 6px 14px rgb(0 0 0 / 5%); }
    h1, h2 { margin: 0 0 10px; color: var(--primary-blue); }
    h1 { font-size: 25px; } h2 { font-size: 20px; }
    p { margin: 6px 0; color: #333; } .muted { color: #6b6b6b; }
    @media (max-width: 640px) { .profile-page { padding: 28px 16px; } .profile-content { flex-direction: column; gap: 24px; } }
</style>
