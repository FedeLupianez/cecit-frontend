import adapterNode from '@sveltejs/adapter-node';
import adapterStatic from '@sveltejs/adapter-static';
import { relative, sep } from 'node:path';

/**
 * Build estático (STATIC_BUILD=true) vs. híbrido con server Node.
 *
 * - `STATIC_BUILD=true` → adapter-static: genera un sitio 100% estático
 *   (HTML prerenderizado + 200.html para las rutas con parámetros). No hay
 *   server de SvelteKit, así que /api lo tiene que proxear el reverse proxy
 *   (nginx/Caddy) o el browser llama directo al backend con VITE_API_URL.
 *
 * - default → adapter-node: el server de SvelteKit sirve el HTML prerenderizado,
 *   renderiza on-demand las rutas con parámetros y proxya /api al backend
 *   (src/hooks.server.ts).
 *
 * BASE_PATH sirve el sitio en un subdirectorio (ej. /beneficios). Sin esto, las
 * rutas de los assets son relativas y se rompen si falta la barra final.
 */
const isStatic = process.env.STATIC_BUILD === 'true';
const base = process.env.BASE_PATH ?? '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    compilerOptions: {
        // defaults to rune mode for the project, except for `node_modules`. Can be removed in svelte 6.
        runes: ({ filename }) => {
            const relativePath = relative(import.meta.dirname, filename);
            const pathSegments = relativePath.toLowerCase().split(sep);
            const isExternalLibrary = pathSegments.includes('node_modules');

            return isExternalLibrary ? undefined : true;
        }
    },
    kit: {
        paths: {
            base,
            // rutas absolutas (/base/_app/...) en vez de relativas: así el sitio
            // funciona con o sin barra final y no depende del cwd del servidor.
            relative: false
        },
        adapter: isStatic
            ? adapterStatic({
                pages: 'build',
                assets: 'build',
                // SPA fallback: sirve las rutas con parámetros (ej.
                // /business-panel/benefit/[id_benefit]) desde el cliente.
                fallback: '200.html',
                precompress: true,
                strict: false
            })
            : adapterNode({
                out: 'build',
                precompress: true
            }),
        prerender: {
            // '*' = todas las rutas sin parámetros como punto de entrada.
            entries: ['*'],
            // Las rutas que dependan de datos del backend (ids, etc.) se renderizan
            // on-demand; si alguna queda marcada como prerenderable sin generar,
            // se avisa en vez de romper el build.
            handleUnseenRoutes: 'warn'
        }
    }
};

export default config;
