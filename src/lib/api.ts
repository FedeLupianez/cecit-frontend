import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import { accessToken } from "$lib/stores/authStore";

/**
 * Base de la API.
 *
 * - Vacía (default): las llamadas son relativas al origen (`/api/...`). Es el
 *   modo recomendado en producción: el proxy inverso (nginx/Caddy) reenvía
 *   `/api` al backend, así que la cookie de refresh queda como host-only del
 *   dominio de la app y `SameSite=Strict` no bloquea nada.
 * - Definida (`VITE_API_URL=https://api.cecit.local`): el browser llama al
 *   backend directamente. Requiere que el backend habilite CORS con
 *   credenciales (`FRONT_URL`) y que app y API sean *same-site* (subdominios
 *   del mismo dominio) para que viaje la cookie `refresh_token_cecit`.
 *   Es el modo para hosting estático (FTP) donde no hay proxy inverso.
 */
export const API_BASE: string = import.meta.env.VITE_API_URL ?? "";

/**
 * Prefija una ruta de API con {@link API_BASE}.
 *
 * El backend monta sus rutas en la raíz (`/auth/login`), el prefijo `/api` es
 * una convención del frontend que el proxy (src/hooks.server.ts) o el nginx
 * quitan. Con base absoluta se replica ese mismo comportamiento.
 */
export function apiUrl(path: string): string {
    if (!API_BASE) return path;
    return `${API_BASE}${path.replace(/^\/api/, "")}`;
}

const REFRESH_URL = apiUrl("/api/auth/refresh");
const LOGIN_URL = "/login";

// Refresca el access token una sola vez aunque varios requests fallen con
// 401 a la vez. Devuelve el nuevo token o null si la sesión murió.
let refreshing: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
    try {
        const res = await fetch(REFRESH_URL, {
            method: "POST",
            credentials: "include",
        });
        if (!res.ok) return null;
        const data = await res.json().catch(() => null);
        const token: string | null = data?.access_token ?? null;
        if (token) accessToken.setToken(token);
        return token;
    } catch {
        return null;
    }
}

function refreshOnce(): Promise<string | null> {
    if (!refreshing) {
        refreshing = doRefresh().finally(() => {
            refreshing = null;
        });
    }
    return refreshing;
}

function withAuth(init: RequestInit, token: string | null): RequestInit {
    const headers = new Headers(init.headers ?? {});
    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    return { ...init, headers, credentials: "include" };
}

/**
 * fetch contra /api con Authorization automática y un reintento tras
 * refresh ante 401 (cubre access tokens expirados en páginas de larga
 * permanencia). Si el refresh falla, redirige a /login.
 */
export async function apiFetch(
    input: string,
    init: RequestInit = {},
): Promise<Response> {
    let res = await fetch(apiUrl(input), withAuth(init, accessToken.getToken()));
    if (res.status !== 401) return res;

    const newToken = await refreshOnce();
    if (!newToken) {
        await goto(resolve(LOGIN_URL));
        return res;
    }
    return fetch(apiUrl(input), withAuth(init, newToken));
}
