<script lang="ts">
    import { accessToken } from "$lib/stores/authStore";
    import { goto } from "$app/navigation";

    let email = $state("");
    let password = $state("");
    let showPassword = $state(false);
    let error = $state("");
    const passwdError = "Ingresa una contraseña";
    const emailError = "Ingresa un correo electrónico válido.";
    let loading: boolean = $state(false);
    let errorTimeout: ReturnType<typeof setTimeout> | undefined;

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
        error = "";

        try {
            loading = true;
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email, password: password }),
                credentials: "include",
            });
            if (!response.ok)
                throw new Error(`Response status : ${response.status}`);
            const result = await response.json();
            accessToken.setToken(result.access_token);
            goto("/");
        } catch (rerror) {
            error = "Credenciales Inválidas";
            loading = false;
            console.log(rerror);
            if (errorTimeout) clearTimeout(errorTimeout);
            errorTimeout = setTimeout(() => {
                error = "";
            }, 3000);
        }
    }
</script>

<svelte:head>
    <title>CeCIT Login</title>
</svelte:head>

<section class="login-page">
    <div class="login-card">
        <div class="left">
            <p class="title">¡Hola!</p>
            <p class="text">Bienvenido de vuelta.</p>
            <p class="text">Ingresa los datos para iniciar sesión</p>
        </div>
        <form onsubmit={login} class="right" novalidate>
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
                placeholder="Tu contraseña..."
                class="login"
                class:loginerror={error === passwdError}
                required
            />
            <label>
                <input type="checkbox" bind:checked={showPassword} />
                Mostrar contraseña
            </label>

            {#if loading}
                <div class="loading-container">
                    <div class="spinner"></div>
                    <p>Iniciando Sesión...</p>
                </div>
            {:else if !loading && error}
                <span class="error-box">{error}</span>
            {:else}
                <button type="submit">Iniciar Sesión</button>
            {/if}
        </form>
    </div>
</section>

<style>
    .loading-container {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 16px;
        color: #151535;
        font-size: 16px;
        font-weight: 600;
    }

    .spinner {
        width: 48px;
        height: 48px;
        border: 5px solid #e0e0e0;
        border-top-color: #151535;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

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

        padding: 1rem;
        height: 23rem;
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
        padding-left: 2rem;
        padding-top: 1rem;
        padding-right: 2rem;
        flex-wrap: wrap;
        max-width: 50%;
        align-items: flex-start;
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

    .error-box {
        color: #b71c1c;
        font-weight: 500;
        font-size: 0.95rem;
        padding: 0.6rem 1rem;
        border-radius: 10px;
        background: #ffebee;
        border: 1px solid #ef9a9a;
        display: inline-block;
        animation: shake 0.4s ease;
        max-width: 100%;
        word-break: break-word;
    }

    @keyframes shake {
        0%,
        100% {
            transform: translateX(0);
        }
        25% {
            transform: translateX(-4px);
        }
        50% {
            transform: translateX(4px);
        }
        75% {
            transform: translateX(-2px);
        }
    }

    .loginerror {
        color: #d32f2f;
        border: 1px solid #d32f2f;
    }

    .error.visible {
        visibility: visible;
    }
</style>
