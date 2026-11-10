#!/usr/bin/env node
/**
 * Build estático para FTP / CDN.
 * Uso: bun run scripts/build-static.mjs --env .env.ftp
 * Genera la carpeta `build/` con estructura de carpetas por página (index.html en cada una).
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(__dirname, '..');

function parseArgs() {
    const args = process.argv.slice(2);
    const envFile = args.find(a => a.startsWith('--env='))?.split('=')[1] || '.env.ftp';
    return { envFile };
}

function loadEnv(envFile) {
    const path = resolve(rootDir, envFile);
    if (!existsSync(path)) {
        console.error(`❌ No existe ${envFile}`);
        process.exit(1);
    }
    const content = readFileSync(path, 'utf-8');
    for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [key, ...rest] = trimmed.split('=');
        if (key && rest.length) {
            process.env[key.trim()] = rest.join('=').trim();
        }
    }
    console.log(`📦 Cargado entorno: ${envFile}`);
}

function fixAssetPaths() {
    const buildDir = resolve(rootDir, 'build');
    const assetsBase = process.env.VITE_ASSETS_URL || '';
    const basePath = process.env.BASE_PATH || '';
    if (!assetsBase) return;

    const pages = [
        'login', 'signup', 'benefits', 'admin-panel', 'benefit-requests',
        'business-panel', 'create-benefit', 'history', 'profile', 'redeem'
    ];

    for (const page of pages) {
        const indexFile = resolve(buildDir, page, 'index.html');
        if (existsSync(indexFile)) {
            let html = readFileSync(indexFile, 'utf-8');
            // Fix _app assets (JS/CSS)
            html = html.replace(/href="\.\/_app\//g, `href="${assetsBase}/_app/`);
            html = html.replace(/src="\.\/_app\//g, `src="${assetsBase}/_app/`);
            // Fix static assets (images, etc.) - ./logo.png -> assetsBase/logo.png
            html = html.replace(/href="\.\/([^"]+)"/g, `href="${assetsBase}/$1"`);
            html = html.replace(/src="\.\/([^"]+)"/g, `src="${assetsBase}/$1"`);
            // Fix inline script imports - import("./_app/...") -> import("assetsBase/_app/...")
            html = html.replace(/import\("\.\/_app\//g, `import("${assetsBase}/_app/`);
            // Fix __sveltekit config assets path
            html = html.replace(/assets: "\/[^"]+"/g, `assets: "${assetsBase}"`);
            // Fix __sveltekit base path - dynamic base from current path breaks in subdirs
            html = html.replace(/base: new URL\("\.", location\)\.pathname\.slice\(0, -1\)/g, `base: "${basePath}"`);
            writeFileSync(indexFile, html);
        }
    }

    const rootIndex = resolve(buildDir, 'index.html');
    if (existsSync(rootIndex)) {
        let html = readFileSync(rootIndex, 'utf-8');
        html = html.replace(/href="\.\/_app\//g, `href="${assetsBase}/_app/`);
        html = html.replace(/src="\.\/_app\//g, `src="${assetsBase}/_app/`);
        html = html.replace(/href="\.\/([^"]+)"/g, `href="${assetsBase}/$1"`);
        html = html.replace(/src="\.\/([^"]+)"/g, `src="${assetsBase}/$1"`);
        html = html.replace(/import\("\.\/_app\//g, `import("${assetsBase}/_app/`);
        html = html.replace(/assets: "\/[^"]+"/g, `assets: "${assetsBase}"`);
        html = html.replace(/base: new URL\("\.", location\)\.pathname\.slice\(0, -1\)/g, `base: "${basePath}"`);
        writeFileSync(rootIndex, html);
    }

    console.log(`✅ Asset paths fijados a ${assetsBase}/`);
}

function runBuild() {
    // Forzar variables para el build estático
    process.env.STATIC_BUILD = 'true';
    process.env.NODE_ENV = 'production';

    console.log('🔨 Iniciando build estático...');
    console.log(`   BASE_PATH: ${process.env.BASE_PATH || '(vacío)'}`);
    console.log(`   VITE_API_URL: ${process.env.VITE_API_URL || '(vacío)'}`);

    const result = spawnSync('bun', ['run', 'build'], {
        cwd: rootDir,
        stdio: 'inherit',
        env: process.env,
        shell: true
    });

    if (result.status !== 0) {
        console.error('❌ Build falló');
        process.exit(result.status ?? 1);
    }

    console.log('✅ Build completado en ./build/');
}

function reorganizeBuild() {
    const buildDir = resolve(rootDir, 'build');
    
    // Lista de páginas conocidas (excluyendo 200.html y _app/)
    const pages = [
        'login',
        'signup',
        'benefits',
        'admin-panel',
        'benefit-requests',
        'business-panel',
        'create-benefit',
        'history',
        'profile',
        'redeem'
    ];

    for (const page of pages) {
        const flatFile = resolve(buildDir, `${page}.html`);
        const pageDir = resolve(buildDir, page);
        const indexFile = resolve(pageDir, 'index.html');

        if (existsSync(flatFile)) {
            // Crear directorio si no existe
            if (!existsSync(pageDir)) {
                require('node:fs').mkdirSync(pageDir, { recursive: true });
            }
            // Mover archivo a index.html dentro de su carpeta
            require('node:fs').renameSync(flatFile, indexFile);
            console.log(`   📁 ${page}/index.html`);
        }
    }

    // El archivo raíz index.html ya está en su lugar
    if (existsSync(resolve(buildDir, 'index.html'))) {
        console.log(`   📁 index.html`);
    }

    // 200.html se queda en la raíz para SPA fallback
    if (existsSync(resolve(buildDir, '200.html'))) {
        console.log(`   📁 200.html (SPA fallback)`);
    }

    console.log('✅ Estructura reorganizada a carpetas por página');
}

function verifyBuild() {
    const buildDir = resolve(rootDir, 'build');
    if (!existsSync(buildDir)) {
        console.error('❌ No se generó la carpeta build/');
        process.exit(1);
    }

    // Verificar estructura básica
    const indexHtml = resolve(buildDir, 'index.html');
    if (!existsSync(indexHtml)) {
        console.error('❌ Falta build/index.html');
        process.exit(1);
    }

    console.log('✅ Estructura de build verificada');
    console.log('   - build/index.html');
    console.log('   - build/login/index.html');
    console.log('   - build/benefits/index.html');
    console.log('   - etc.');
}

function main() {
    const { envFile } = parseArgs();
    loadEnv(envFile);
    runBuild();
    reorganizeBuild();
    fixAssetPaths();
    verifyBuild();
    console.log('\n🚀 Listo para subir por FTP a public_html/beneficios/');
}

main();