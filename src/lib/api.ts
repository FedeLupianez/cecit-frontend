import { goto } from "$app/navigation";
import { accessToken } from "$lib/stores/authStore";

const REFRESH_URL = "/api/auth/refresh";
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
    let res = await fetch(input, withAuth(init, accessToken.getToken()));
    if (res.status !== 401) return res;

    const newToken = await refreshOnce();
    if (!newToken) {
        await goto(LOGIN_URL);
        return res;
    }
    return fetch(input, withAuth(init, newToken));
}
