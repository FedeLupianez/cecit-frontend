import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const handle: Handle = async ({ event, resolve }) => {
    const { url, request } = event;
    if (url.pathname.startsWith('/api')) {
        const host = env.BACKEND_URL ?? "http://localhost:3000"
        const target = new URL(`${host}${url.pathname.replace(/^\/api/, '')}${url.search}`);

        const headers: Record<string, string> = {};
        const hopByHop = ['host', 'connection', 'transfer-encoding', 'content-length'];
        request.headers.forEach((value, key) => {
            if (value && !hopByHop.includes(key.toLowerCase())) headers[key] = value;
        });

        try {
            const res = await fetch(target, {
                method: request.method,
                headers,
                body: request.method !== 'GET' && request.method !== 'HEAD'
                    ? await request.arrayBuffer()
                    : undefined,
                redirect: 'manual',
            });

            const responseHeaders = new Headers();
            const skippedResponseHeaders = [
                'transfer-encoding',
                'connection',
                'content-encoding',
                'content-length',
            ];
            const setCookieValues = res.headers.getSetCookie?.() ?? [];
            res.headers.forEach((value, key) => {
                if (skippedResponseHeaders.includes(key.toLowerCase())) return;
                if (key.toLowerCase() === 'set-cookie') return;
                responseHeaders.set(key, value);
            });
            for (const cookie of setCookieValues) {
                responseHeaders.append('set-cookie', cookie);
            }

            const nullBodyStatuses = [101, 204, 205, 304];
            const responseBody = nullBodyStatuses.includes(res.status)
                ? null
                : Buffer.from(await res.arrayBuffer());

            return new Response(responseBody, {
                status: res.status,
                statusText: res.statusText,
                headers: responseHeaders
            });
        } catch (err) {
            console.error('Proxy error:', err);
            return new Response(
                JSON.stringify({ message: 'Error al comunicarse con el backend' }),
                { status: 502, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }
    return resolve(event);
};
