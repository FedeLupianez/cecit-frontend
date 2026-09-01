<script lang="ts">
    import { page } from "$app/state";
    import { accessToken } from "$lib/stores/authStore";
    import { profileStore } from "$lib/stores/profileStore";
    import RoleCard from "$lib/components/RoleCard.svelte";
    import { getRoleAccess } from "$lib/access/roleAccess";
    import { Pencil, Mail, Lock, BadgeCheck, Hash } from "lucide-svelte";

    const profile = $derived(
        page.data.profile as
            | {
                  user_id: string;
                  email: string;
                  role?: string;
              }
            | undefined,
    );
    const access = $derived(getRoleAccess(profile?.role));

    const avatar = $derived(
        profile?.email
            ? `https://ui-avatars.com/api/?background=19194f&color=fff&bold=true&name=${encodeURIComponent(profile.email)}`
            : "",
    );

    const roleLabel = $derived(access?.label ?? "Sin rol");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let editingEmail = $state(false);
    let emailInput = $state("");
    let savingEmail = $state(false);
    let emailError = $state("");
    let emailSuccess = $state("");

    let changingPassword = $state(false);
    let currentPassword = $state("");
    let newPassword = $state("");
    let confirmPassword = $state("");
    let savingPassword = $state(false);
    let passwordError = $state("");
    let passwordSuccess = $state("");

    function authHeaders() {
        return { Authorization: `Bearer ${accessToken.getToken()}` };
    }

    async function parseError(response: Response) {
        try {
            const data = await response.json();
            if (data?.message) {
                return Array.isArray(data.message)
                    ? data.message.join(", ")
                    : String(data.message);
            }
        } catch {
            /* sin cuerpo JSON */
        }
        return "Ocurrió un error.";
    }

    function startEditEmail() {
        if (!profile) return;
        emailInput = profile.email;
        emailError = "";
        emailSuccess = "";
        editingEmail = true;
    }

    function cancelEditEmail() {
        editingEmail = false;
        emailInput = "";
        emailError = "";
    }

    async function updateEmail() {
        if (!profile || savingEmail || changingPassword) return;
        const new_email = emailInput.trim();
        if (!emailRegex.test(new_email)) {
            emailError = "Ingresa un correo electrónico válido.";
            return;
        }
        if (new_email.toLowerCase() === profile.email.toLowerCase()) {
            editingEmail = false;
            return;
        }
        if (!accessToken.getToken()) {
            emailError = "Tu sesión expiró. Volvé a iniciar sesión.";
            return;
        }
        savingEmail = true;
        emailError = "";
        emailSuccess = "";
        try {
            const response = await fetch("/api/auth/update", {
                method: "PATCH",
                headers: {
                    ...authHeaders(),
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    process: "EMAIL",
                    email: profile.email,
                    new_email: emailInput,
                    current_password: currentPassword,
                }),
            });
            if (!response.ok) {
                emailError = await parseError(response);
                return;
            }
            profileStore.setProfile({
                ...profileStore.getProfile()!,
                email: new_email,
            });
            editingEmail = false;
            emailInput = "";
            emailSuccess = "Correo electrónico actualizado correctamente.";
        } catch (cause) {
            emailError =
                cause instanceof Error
                    ? cause.message
                    : "No se pudo actualizar el correo electrónico.";
        } finally {
            savingEmail = false;
        }
    }

    function startPasswordChange() {
        if (!profile || editingEmail) return;
        currentPassword = "";
        newPassword = "";
        confirmPassword = "";
        passwordError = "";
        passwordSuccess = "";
        changingPassword = true;
    }

    function cancelPasswordChange() {
        changingPassword = false;
        currentPassword = "";
        newPassword = "";
        confirmPassword = "";
        passwordError = "";
    }

    async function updatePassword() {
        if (!profile || savingPassword) return;
        if (!currentPassword) {
            passwordError = "Ingresa tu contraseña actual.";
            return;
        }
        if (!newPassword) {
            passwordError = "Ingresa una nueva contraseña.";
            return;
        }
        if (newPassword.length < 6) {
            passwordError =
                "La nueva contraseña debe tener al menos 6 caracteres.";
            return;
        }
        if (newPassword !== confirmPassword) {
            passwordError = "Las contraseñas no coinciden.";
            return;
        }
        if (!accessToken.getToken()) {
            passwordError = "Tu sesión expiró. Volvé a iniciar sesión.";
            return;
        }
        savingPassword = true;
        passwordError = "";
        passwordSuccess = "";
        try {
            const response = await fetch("/api/auth/update", {
                method: "PATCH",
                headers: {
                    ...authHeaders(),
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    process: "PASSWD",
                    current_password: currentPassword,
                    new_password: newPassword,
                }),
            });
            if (!response.ok) {
                passwordError = await parseError(response);
                return;
            }
            changingPassword = false;
            currentPassword = "";
            newPassword = "";
            confirmPassword = "";
            passwordSuccess = "Contraseña actualizada correctamente.";
        } catch (cause) {
            passwordError =
                cause instanceof Error
                    ? cause.message
                    : "No se pudo actualizar la contraseña.";
        } finally {
            savingPassword = false;
        }
    }
</script>

<svelte:head>
    <title>Mi perfil | CeCIT</title>
</svelte:head>

<section class="profile-page">
    <div class="hero">
        <div class="hero-inner">
            <div class="identity">
                <img class="avatar" src={avatar} alt="Foto de perfil" />
                <div class="identity-text">
                    <h1>Mi cuenta</h1>
                    <p class="email">{profile?.email ?? "Sin sesión"}</p>
                </div>
            </div>
            <div class="role-badge">
                <BadgeCheck size={16} />
                <span>{roleLabel}</span>
            </div>
        </div>
    </div>

    <div class="profile-content">
        <aside class="sidebar">
            {#if access}
                <RoleCard {access} compact />
            {:else}
                <div class="state-card" role="alert">
                    <h3>Sin rol disponible</h3>
                    <p>No fue posible obtener un rol válido para tu cuenta.</p>
                </div>
            {/if}

            <div class="sidemeta">
                <span class="sidemeta-icon"><Hash size={15} /></span>
                <div>
                    <span class="field-label">ID de socio</span>
                    <span class="sidemeta-value">{profile?.user_id}</span>
                </div>
            </div>
        </aside>

        <div class="details">
            <section id="configuration" class="detail-section">
                <header class="section-head">
                    <div>
                        <h2>Configuración de la cuenta</h2>
                        <p>Gestioná los datos de acceso a tu cuenta.</p>
                    </div>
                </header>

                <div class="field-row">
                    <div class="field-info">
                        <span class="field-label"
                            ><Mail size={14} />
                            Correo electrónico</span
                        >
                        {#if editingEmail}
                            <div class="edit-field">
                                <input
                                    type="email"
                                    placeholder="Nuevo correo electrónico"
                                    bind:value={emailInput}
                                    onkeydown={(e) =>
                                        e.key === "Enter" && updateEmail()}
                                />
                                <label class="password-label"
                                    ><input
                                        type="password"
                                        placeholder="Tu contraseña actual"
                                        bind:value={currentPassword}
                                    />
                                    Confirma con tu contraseña</label
                                >
                                <div class="edit-actions">
                                    <button
                                        class="save-btn"
                                        type="button"
                                        onclick={updateEmail}
                                        disabled={savingEmail}
                                        >{savingEmail
                                            ? "Guardando…"
                                            : "Guardar"}</button
                                    >
                                    <button
                                        class="cancel-btn"
                                        type="button"
                                        onclick={cancelEditEmail}
                                        >Cancelar</button
                                    >
                                </div>
                                {#if emailError}
                                    <p class="field-error" role="alert">
                                        {emailError}
                                    </p>
                                {/if}
                            </div>
                        {:else}
                            <p class="field-value">{profile?.email}</p>
                        {/if}
                        {#if emailSuccess}
                            <p class="field-success" role="status">
                                {emailSuccess}
                            </p>
                        {/if}
                    </div>
                    {#if !editingEmail}
                        <button
                            class="edit-btn"
                            type="button"
                            onclick={startEditEmail}
                        >
                            <Pencil size={14} />
                            Cambiar
                        </button>
                    {/if}
                </div>

                <hr class="divider" />

                <div class="field-row">
                    <div class="field-info">
                        <span class="field-label"
                            ><Lock size={14} />
                            Contraseña</span
                        >
                        {#if changingPassword}
                            <div class="edit-field">
                                <input
                                    type="password"
                                    placeholder="Contraseña actual"
                                    bind:value={currentPassword}
                                />
                                <input
                                    type="password"
                                    placeholder="Nueva contraseña"
                                    bind:value={newPassword}
                                />
                                <input
                                    type="password"
                                    placeholder="Repetí la nueva contraseña"
                                    bind:value={confirmPassword}
                                    onkeydown={(e) =>
                                        e.key === "Enter" && updatePassword()}
                                />
                                <div class="edit-actions">
                                    <button
                                        class="save-btn"
                                        type="button"
                                        onclick={updatePassword}
                                        disabled={savingPassword}
                                        >{savingPassword
                                            ? "Guardando…"
                                            : "Guardar"}</button
                                    >
                                    <button
                                        class="cancel-btn"
                                        type="button"
                                        onclick={cancelPasswordChange}
                                        >Cancelar</button
                                    >
                                </div>
                                {#if passwordError}
                                    <p class="field-error" role="alert">
                                        {passwordError}
                                    </p>
                                {/if}
                            </div>
                        {:else}
                            <p class="field-value muted">••••••••••••</p>
                        {/if}
                        {#if passwordSuccess}
                            <p class="field-success" role="status">
                                {passwordSuccess}
                            </p>
                        {/if}
                    </div>
                    {#if !changingPassword}
                        <button
                            class="edit-btn"
                            type="button"
                            onclick={startPasswordChange}
                        >
                            <Pencil size={14} />
                            Cambiar
                        </button>
                    {/if}
                </div>
            </section>

            <section id="access-sections" class="detail-grid">
                {#if profile?.role === "CECIT_ADMIN"}
                    <section id="admin-panel" class="detail-section tile">
                        <h3>Panel de administrador</h3>
                        <p>
                            Los accesos de administración están habilitados para
                            tu rol.
                        </p>
                    </section>
                    <section id="create-benefit" class="detail-section tile">
                        <h3>Crear beneficio</h3>
                        <p>
                            Podés crear beneficios con la API mediante
                            <code>POST /benefits</code>.
                        </p>
                    </section>
                {:else if profile?.role === "PARTNER_ADMIN"}
                    <section id="partner-panel" class="detail-section tile">
                        <h3>Panel de administrador</h3>
                        <p>
                            Tu rol puede administrar el comercio asociado
                            mediante los endpoints protegidos del backend.
                        </p>
                    </section>
                {/if}
            </section>
        </div>
    </div>
</section>

<style>
    .profile-page {
        min-height: 62vh;
        background: #f4f6fb;
        padding: 0 0 64px;
        color: #1a1f36;
    }

    .hero {
        background: linear-gradient(
            120deg,
            #19194f 0%,
            #26266f 55%,
            #3434a0 100%
        );
        padding: 44px clamp(16px, 6vw, 48px);
        color: #fff;
    }
    .hero-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        width: min(100%, 1080px);
        margin: 0 auto;
        flex-wrap: wrap;
    }
    .identity {
        display: flex;
        align-items: center;
        gap: 18px;
    }
    .avatar {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        border: 3px solid rgba(255, 255, 255, 0.6);
        object-fit: cover;
        background: #fff;
    }
    .identity-text h1 {
        margin: 0;
        font-size: 26px;
        line-height: 1.1;
        color: #fff;
    }
    .identity-text .email {
        margin: 6px 0 0;
        color: rgba(255, 255, 255, 0.85);
        font-size: 15px;
    }
    .role-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.14);
        border: 1px solid rgba(255, 255, 255, 0.25);
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        backdrop-filter: blur(4px);
    }

    .profile-content {
        display: flex;
        width: min(100%, 1080px);
        margin: 0 auto;
        gap: 28px;
        align-items: flex-start;
        padding: 28px clamp(16px, 6vw, 48px) 0;
    }

    .sidebar {
        width: 250px;
        flex-shrink: 0;
        display: grid;
        gap: 16px;
        position: sticky;
        top: 24px;
    }
    .sidemeta {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        border: 1px solid #e2e5ef;
        border-radius: 12px;
        background: #fff;
    }
    .sidemeta-icon {
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        border-radius: 9px;
        background: #eef0f7;
        color: var(--primary-blue);
        flex-shrink: 0;
    }
    .sidemeta-value {
        font-size: 14px;
        font-weight: 600;
        color: #1a1f36;
        word-break: break-all;
    }

    .details {
        flex: 1;
        min-width: 0;
        display: grid;
        gap: 20px;
    }

    .detail-section,
    .state-card {
        border: 1px solid #e2e5ef;
        border-radius: 16px;
        background: #fff;
        padding: 24px;
        box-shadow: 0 10px 24px rgb(20 24 60 / 6%);
    }

    .section-head {
        margin-bottom: 6px;
    }
    .section-head h2 {
        margin: 0;
        color: var(--primary-blue);
        font-size: 21px;
    }
    .section-head p {
        margin: 6px 0 0;
        color: #6b7280;
        font-size: 14px;
    }

    .detail-section h3,
    .state-card h3 {
        margin: 0 0 6px;
        color: var(--primary-blue);
        font-size: 17px;
    }
    .state-card p,
    .tile p {
        margin: 0;
        color: #6b7280;
        font-size: 14px;
        line-height: 1.5;
    }

    .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
    }
    .tile {
        box-shadow: none;
    }
    .tile h3 {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .tile code {
        background: #eef0f7;
        padding: 1px 5px;
        border-radius: 5px;
        font-size: 12px;
    }

    .field-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 16px 0 6px;
    }
    .field-info {
        flex: 1;
        min-width: 0;
    }
    .field-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 600;
        color: #6b7280;
        margin-bottom: 6px;
    }
    .field-value {
        margin: 0;
        font-size: 16px;
        color: #1a1f36;
    }
    .muted {
        color: #6b7280;
    }
    .divider {
        border: 0;
        border-top: 1px solid #eef0f6;
        margin: 16px 0 4px;
    }

    .edit-field {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 6px 0 2px;
    }
    .edit-field input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #cdd3e2;
        border-radius: 8px;
        font: inherit;
        font-size: 14px;
        background: #fbfbfd;
        transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
    }
    .edit-field input:focus {
        outline: none;
        border-color: var(--primary-blue);
        box-shadow: 0 0 0 3px rgb(25 25 79 / 12%);
        background: #fff;
    }
    .edit-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        padding-top: 4px;
    }
    .save-btn,
    .cancel-btn,
    .edit-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        font: inherit;
        cursor: pointer;
        border-radius: 999px;
        flex-shrink: 0;
        font-weight: 600;
        transition:
            background-color 0.15s ease,
            border-color 0.15s ease;
    }
    .save-btn {
        padding: 9px 18px;
        border: 1px solid #137333;
        background: #137333;
        color: #fff;
        font-size: 14px;
    }
    .save-btn:hover {
        background: #0f5f2b;
        border-color: #0f5f2b;
    }
    .save-btn:disabled {
        cursor: progress;
        opacity: 0.75;
    }
    .cancel-btn {
        padding: 9px 18px;
        border: 1px solid #d1d5db;
        background: #fff;
        color: #374151;
        font-size: 14px;
    }
    .cancel-btn:hover {
        background: #f3f4f6;
    }
    .edit-btn {
        padding: 9px 16px;
        border: 1px solid var(--primary-blue);
        background: #fff;
        color: var(--primary-blue);
        font-size: 13px;
    }
    .edit-btn:hover {
        background: var(--primary-blue);
        color: #fff;
    }
    .field-error {
        margin: 0;
        color: #c0392b;
        font-size: 13px;
        font-weight: 500;
    }
    .field-success {
        margin: 6px 0 0;
        color: #137333;
        font-size: 14px;
        font-weight: 600;
    }
    .password-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #6b7280;
    }
    .password-label input {
        width: auto;
    }

    @media (max-width: 780px) {
        .profile-content {
            flex-direction: column;
            align-items: stretch;
        }
        .sidebar {
            width: 100%;
            position: static;
        }
        .hero-inner {
            flex-direction: column;
            align-items: flex-start;
        }
    }
    @media (max-width: 480px) {
        .identity {
            flex-direction: column;
            align-items: flex-start;
        }
        .field-row {
            flex-direction: column;
            align-items: stretch;
        }
        .edit-btn {
            align-self: flex-start;
        }
    }
</style>
