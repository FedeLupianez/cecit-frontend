import type { Handle } from '@sveltejs/kit';
import http from 'node:http';
import type { IncomingMessage } from 'node:http';
import { env } from '$env/dynamic/private';

export const handle: Handle = async ({ event, resolve }) => {
    const { url, request } = event;
    if (url.pathname.startsWith('/api')) {
        const host = env.HOST ?? "http://localhost:3000"
        const target = new URL(`${host}${url.pathname.replace(/^\/api/, '')}${url.search}`);

        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
            if (value) headers[key] = value;
        });

        const body = request.method !== 'GET' && request.method !== 'HEAD'
            ? Buffer.from(await request.arrayBuffer())
            : null;

        const res = await new Promise<Response>((resolvePromise, reject) => {
            const proxyReq = http.request(target, {
                method: request.method,
                headers,
                timeout: 30000,
            }, (proxyRes: IncomingMessage) => {
                const chunks: Buffer[] = [];
                proxyRes.on('data', (chunk: Buffer) => chunks.push(chunk));
                proxyRes.on('end', () => {
                    const responseBody = Buffer.concat(chunks);
                    const responseHeaders = new Headers();
                    const resHeaders = proxyRes.headers;
                    for (const key of Object.keys(resHeaders)) {
                        if (key === 'transfer-encoding' || key === 'connection') continue;
                        const value = resHeaders[key as keyof typeof resHeaders];
                        if (Array.isArray(value)) {
                            for (const v of value) {
                                if (v) responseHeaders.append(key, v);
                            }
                        } else if (value) {
                            responseHeaders.set(key, value);
                        }
                    }
                    const nullBodyStatuses = [101, 204, 205, 304];
                    resolvePromise(new Response(
                        nullBodyStatuses.includes(proxyRes.statusCode ?? 500) ? null : responseBody,
                        {
                            status: proxyRes.statusCode ?? 500,
                            statusText: proxyRes.statusMessage,
                            headers: responseHeaders
                        }
                    ));
                });
            });

            proxyReq.on('error', (err: Error) => reject(err));
            proxyReq.on('timeout', () => {
                proxyReq.destroy();
                reject(new Error('Proxy request timeout'));
            });

            if (body) {
                proxyReq.write(body);
            }
            proxyReq.end();
        });

        return res;
    }
    return resolve(event);
};
