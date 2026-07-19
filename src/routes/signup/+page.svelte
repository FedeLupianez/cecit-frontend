<script lang="ts">
    import { accessToken } from "$lib/stores/authStore";
    import { goto } from "$app/navigation";

    let partnerNumber: string = $state("");
    let email: string = $state("");
    let password: string = $state("");
    let showPassword: boolean = $state(false);
    let error: string = $state("");
    const passwdError = "Ingresa una contraseña";
    const emailError = "Ingresa un correo electrónico válido.";
    const numberError = "Ingresa tu número de socio";

    async function login(e: Event) {
        e.preventDefault();
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(email)) {
            error = emailError;
            return;
        }
        if (!password) {
            error = passwdError;
            return;
        }
        if (!partnerNumber) {
            error = numberError;
            return;
        }
        error = "";

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_user: partnerNumber,
                    email: email,
                    password: password,
                }),
                credentials: "include",
            });
            if (!response.ok)
                throw new Error(`Response status : ${response.status}`);
            const result = await response.json();
            accessToken.setToken(result.access_token);
            goto("/");
        } catch (error) {
            console.log(error);
        }
    }
</script>

<svelte:head>
    <title>CeCIT Login</title>
</svelte:head>

<section class="login-page">
    <div class="login-card">
        <div class="left">
            <div
                style="display: flex; align-items: start; justify-content: center; flex-direction: column;"
            >
                <p class="title">¡Hola!</p>
                <p class="text">Ingresa los datos para acceder a beneficios</p>
            </div>

            <a href="/login">¿Ya tenés cuenta? Inicia Sesión</a>
        </div>
        <form onsubmit={login} class="right" novalidate>
            <input
                bind:value={partnerNumber}
                oninput={() => (error = "")}
                type="email"
                placeholder="Tu número de socio..."
                class="login"
                class:loginerror={error === emailError}
                required
            />

            <input
                bind:value={email}
                oninput={() => (error = "")}
                type="email"
                placeholder="Tu correo electrónico..."
                class="login"
                class:loginerror={error === emailError}
                required
            />

            <input
                bind:value={password}
                oninput={() => (error = "")}
                type={showPassword ? "text" : "password"}
                placeholder="Crea una contraseña"
                class="login"
                class:loginerror={error === passwdError}
                required
            />
            <label>
                <input type="checkbox" bind:checked={showPassword} />
                Mostrar contraseña
            </label>

            <p class="error" class:visible={!!error}>{error}</p>
            <button type="submit">Registrarme</button>
        </form>
    </div>
</section>

<style>
    .login-page {
        min-height: 90vh;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .login-card {
        width: 60%;
        height: 50vh;

        background: white;

        border-radius: 20px;
        border: solid 1px black;
        display: flex;
        flex-direction: row;
        box-shadow: 0 0 50px 5px rgba(0, 0, 0, 0.2);
    }

    .left,
    .right {
        display: flex;
        flex-direction: column;
        justify-content: start;
    }

    .left {
        padding-left: 4rem;
        padding-top: 5rem;
        padding-right: 1rem;
        padding-bottom: 5rem;
        flex-wrap: wrap;
        max-width: 50%;
        align-items: flex-start;
        justify-content: space-between;
    }
    a {
        text-decoration: none;
        color: black;
    }

    .right {
        align-items: start;
        justify-content: center;
        width: 40%;
        gap: 1rem;
    }

    .title {
        font-size: 3rem;
        font-weight: bold;
        margin-top: 0;
        margin-bottom: 0.7rem;
        padding: 0;
    }

    .text {
        font-size: 2rem;
        padding: 0;
        margin: 0;
    }

    .login {
        width: 100%;
        padding: 1rem;

        border-radius: 12px;
        border: 1px solid black;
        font-size: 1rem;
    }

    .login:focus {
        border: 1px solid white;
    }

    button {
        width: 10rem;

        padding: 15px;

        border: none;
        border-radius: 12px;

        background: var(--primary-blue);
        color: white;

        font-size: 16px;
        border: 1px solid var(--primary-blue);
    }

    button:hover {
        cursor: pointer;
        background: var(--primary-blue-light);
        border: 1px solid var(--primary-blue-light);
    }
    .error {
        color: #d32f2f;
        font-size: 0.9rem;
        margin: 0;
        min-height: 1.2rem;
        visibility: hidden;
    }

    .loginerror {
        color: #d32f2f;
        border: 1px solid #d32f2f;
    }

    .error.visible {
        visibility: visible;
    }
</style>
