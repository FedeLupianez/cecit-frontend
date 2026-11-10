/**
 * Cliente API para el build estático.
 * Usa VITE_API_URL (backend) en lugar de rutas relativas.
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

function getApiUrl(path: string): string {
    if (!API_BASE) return path;
    const base = API_BASE.replace(/\/+$/, '');
    const p = path.replace(/^\/+/, '');
    return `${base}/${p}`;
}

export async function apiFetch(
    path: string,
    init: RequestInit = {}
): Promise<Response> {
    const url = getApiUrl(path);
    const headers = new Headers(init.headers ?? {});
    headers.set('Content-Type', 'application/json');

    return fetch(url, {
        ...init,
        headers,
        credentials: 'include'
    });
}

export async function apiFetchAuth(
    path: string,
    init: RequestInit = {},
    token?: string
): Promise<Response> {
    const url = getApiUrl(path);
    const headers = new Headers(init.headers ?? {});
    headers.set('Content-Type', 'application/json');
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(url, {
        ...init,
        headers,
        credentials: 'include'
    });
}

export { getApiUrl };
export default { apiFetch, apiFetchAuth, getApiUrl };