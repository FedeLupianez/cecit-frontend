import adapterNode from '@sveltejs/adapter-node';
import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { relative, sep } from 'node:path';

// basePath debe empezar con / y no terminar con / (ej: /beneficios)
const rawBasePath = process.env.BASE_PATH || '/beneficios';
const basePath = rawBasePath ? `/${rawBasePath.replace(/^\/+|\/+$/g, '')}` : '';
// assets vacío = paths relativos desde base. El build plano (login.html) resuelve _app/ correctamente.
const assetsPath = '';

console.log('[svelte.config] BASE_PATH:', basePath);
console.log('[svelte.config] assets path:', assetsPath || '(relativo)');

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // compilerOptions: {
    // 	// defaults to rune mode for the project, except for `node_modules`. Can be removed in svelte 6.
    // 	runes: ({ filename }) => {
    // 		const relativePath = relative(import.meta.dirname, filename);
    // 		const pathSegments = relativePath.toLowerCase().split(sep);
    // 		const isExternalLibrary = pathSegments.includes('node_modules');
    //
    // 		return isExternalLibrary ? undefined : true;
    // 	}
    // },
    preprocess: vitePreprocess(),
    kit: {
        adapter: adapterStatic({
            pages: 'build',
            assets: 'build',
            fallback: '200.html',
            precompress: true
        }),
        paths: {
            base: '/beneficios',
            assets: assetsPath
        }
    }
};

export default config;
