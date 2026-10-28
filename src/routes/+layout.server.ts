import { redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";
import { env } from "$env/dynamic/private";
import { building } from "$app/environment";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies, request }) => {
    const authDisabled = env.AUTH_DISABLED === "true";

    if (authDisabled) return { authDisabled };

    // OJO: se usa `request.url` y no `url.pathname` a propósito.
    // `event.url` es trackeado por SvelteKit como dependencia del load: si el
    // layout dependiera de la URL, el client pediría `/__data.json` en cada
    // navegación y en un hosting estático (sin server) esa ruta no existe
    // para los paths con parámetros (ej. /business-panel/benefit/:id).
    // El pathname incluye el base, por eso se compara contra resolve().
    const { pathname } = new URL(request.url);

    if (pathname === resolve("/login") || pathname === resolve("/signup")) {
        return { authDisabled };
    }

    // Durante el prerender no hay cookies: si se redirigiera acá, el HTML
    // estático quedaría congelado con un 302 -> /login para todo el mundo.
    // En ese caso el control de sesión lo hace el cliente (+layout.ts).
    if (building) return { authDisabled };

    const refreshToken = cookies.get("refresh_token_cecit");
    if (!refreshToken) throw redirect(302, resolve("/login"));

    return { authDisabled };
};
