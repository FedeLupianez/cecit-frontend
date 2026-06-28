<script lang="ts">
    import { accessToken } from "$lib/stores/authStore";
    import { goto } from "$app/navigation";

    let email = $state("");
    let password = $state("");
    let showPassword = $state(false);
    let error = $state("");
    const passwdError = "Ingresa una contraseña";
    const emailError = "Ingresa un correo electrónico válido.";

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
            const response = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email, password: password }),
                credentials: "include",
            });
            if (!response.ok)
                throw new Error(`Response status : ${response.status}`);
            const result = await response.json();
            console.log(result);
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

            <p class="error" class:visible={!!error}>{error}</p>
            <button type="submit">Iniciar Sesión</button>
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
        flex-wrap: wrap;
        max-width: 50%;
        align-items: flex-start;
    }

    .right {
        align-items: start;
        justify-content: center;
        width: 30%;
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

        background: #19194f;
        color: white;

        font-size: 16px;
        border: 1px solid #19194f;
    }

    button:hover {
        cursor: pointer;
        color: #19194f;
        background: white;
        border: 1px solid black;
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
