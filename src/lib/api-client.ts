/**
 * Cliente API para el build estático.
 * Usa VITE_API_URL (backend) en lugar de rutas relativas.
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

// Simple in-memory cache for GET requests (TTL: 30s)
const GET_CACHE_TTL = 30_000;
const getCache = new Map<string, { data: Response; expires: number }>();

function getApiUrl(path: string): string {
    if (!API_BASE) return path;
    const base = API_BASE.replace(/\/+$/, '');
    const p = path.replace(/^\/+/, '');
    return `${base}/${p}`;
}

function cacheKey(path: string, init: RequestInit): string {
    return `${init.method ?? 'GET'}:${getApiUrl(path)}`;
}

export async function apiFetch(
    path: string,
    init: RequestInit = {}
): Promise<Response> {
    const url = getApiUrl(path);
    const headers = new Headers(init.headers ?? {});
    headers.set('Content-Type', 'application/json');
    const method = init.method ?? 'GET';
    const key = cacheKey(path, init);

    // Serve cached GET responses
    if (method === 'GET') {
        const cached = getCache.get(key);
        const now = Date.now();
        if (cached && cached.expires > now) {
            // Return a cloned response so caller can consume it
            return cached.data.clone();
        }
    }

    const res = await fetch(url, {
        ...init,
        headers,
        credentials: 'include'
    });

    // Cache successful GET responses
    if (method === 'GET' && res.ok) {
        getCache.set(key, {
            data: res.clone(),
            expires: Date.now() + GET_CACHE_TTL
        });
    }

    return res;
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