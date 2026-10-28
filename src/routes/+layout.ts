import { browser } from "$app/environment";
import { redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";
import { accessToken } from "$lib/stores/authStore";
import { profileStore } from "$lib/stores/profileStore";
import { apiUrl } from "$lib/api";

// Todas las rutas sin parámetros se prerenderizan a HTML estático.
export const prerender = true;

export const load = async ({ url, data }) => {
    if (!browser) return {};

    // `url.pathname` incluye el base (ej. /beneficios/login), por eso se
    // compara contra resolve() y no contra "/login" a secas.
    // Normalizamos quitando trailing slash: Apache (DirectorySlash) redirige
    // /beneficios/signup -> /beneficios/signup/ y rompe la comparación.
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    if (
        pathname === resolve("/login") ||
        pathname === resolve("/signup")
    ) {
        return {};
    }

    if (accessToken.getToken() && profileStore.getProfile()) return {};

    try {
        const res = await fetch(apiUrl("/api/auth/refresh"), {
            method: "POST",
            credentials: "include",
        });
        if (res.ok) {
            const { access_token, profile } = await res.json();
            if (access_token) accessToken.setToken(access_token);
            if (profile) profileStore.setProfile(profile);
            return {};
        }
    } catch {
        // apiFetch will handle 401s on subsequent requests
    }

    // Sin sesión válida: el HTML ya está prerenderizado, así que el control de
    // sesión corre acá (mismo criterio que +layout.server.ts).
    if (!data?.authDisabled) redirect(302, resolve("/login"));

    return {};
};