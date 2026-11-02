import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Build del sitio estático (adapter-static) para publicar en un hosting FTP/CDN.
 *
 *   node scripts/build-static.mjs                 # variables del entorno/.env
 *   node scripts/build-static.mjs --env .env.ftp  # variables de .env.ftp
 *
 * Hace tres cosas:
 *
 *   1. Compila con STATIC_BUILD=true (adapter-static) aplicando BASE_PATH y
 *      VITE_API_URL del archivo de variables. Los valores del shell (o del
 *      .env que carga bun) tienen prioridad sobre los del archivo.
 *   2. Genera `build/.htaccess` con el fallback SPA acorde al base del build
 *      (si el hosting es Apache/cPanel). El output de adapter-static es plano,
 *      así que hay que subir el *contenido* de build/, no la carpeta.
 *   3. Imprime un resumen de lo que hay que configurar en el hosting.
 *
 * Ver docs/02-guia-de-desarrollo.md §5.2.
 */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "build");

const args = process.argv.slice(2);
const envIndex = args.indexOf("--env");
const envFile = envIndex !== -1 ? path.resolve(ROOT, args[envIndex + 1] ?? "") : null;

/**
 * Parser mínimo de archivos .env (soporta `export`, comentarios y comillas).
 * No hace falta más: no queremos arrastrar dotenv como dependencia.
 */
function readEnvFile(file) {
    if (!file) return {};
    if (!fs.existsSync(file)) {
        console.error(`[build:static] no existe ${path.relative(ROOT, file)}`);
        process.exit(1);
    }

    const vars = {};
    for (const raw of fs.readFileSync(file, "utf8").split("\n")) {
        const line = raw.trim().replace(/^export\s+/, "");
        if (!line || line.startsWith("#")) continue;
        const eq = line.indexOf("=");
        if (eq === -1) continue;

        const key = line.slice(0, eq).trim();
        let value = line.slice(eq + 1).trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }
        vars[key] = value;
    }
    return vars;
}

/** Normaliza el base a "/algo" (sin barra final) o "" si no hay. */
function normalizeBase(value) {
    const base = (value ?? "").trim().replace(/\/+$/, "");
    if (!base) return "";
    return base.startsWith("/") ? base : `/${base}`;
}

/**
 * Genera el .htaccess del build: fallback SPA y, según el modo de API, las
 * pistas para el proxy inverso.
 */
function writeHtaccess(out, base, apiUrl) {
    const prefix = base ? base : "";
    const fallback = `${prefix}/200.html`;

    const apiBlock = apiUrl
        ? `# La API: el browser llama directo a ${apiUrl} (VITE_API_URL quedó
# compilado en el bundle). No hace falta proxy, pero el backend tiene que
# permitir CORS con credenciales (FRONT_URL = origen de este sitio) y la
# cookie de refresh tiene que ser SameSite=None; Secure si el sitio y la API
# están en dominios distintos.`
        : `# La API: sin VITE_API_URL el browser llama a /api/... (relativo al
# origen), así que hace falta un proxy inverso que quite el prefijo /api.
# Ojo: /api NO lleva el prefijo del base, con lo cual estas reglas tienen que
# ir en la raíz del dominio, no en el subdirectorio del sitio.
#
# RewriteEngine On
# RewriteRule ^api/(.*)$ https://api.cecit.local/$1 [P,L]`;

    const content = `# ------------------------------------------------------------------
# Generado por scripts/build-static.mjs — no editar a mano.
# Se sube junto con el resto del build.
#
# Fallback SPA (SvelteKit + adapter-static): las rutas con parámetros
# (ej. /business-panel/benefit/:id) no se prerenderizan, así que no tienen
# HTML propio. Con este fallback el server devuelve 200.html y el router del
# cliente resuelve la ruta.
# ------------------------------------------------------------------

ErrorDocument 404 ${fallback}

# Si preferís que la respuesta sea 200 en lugar de 404 (requiere mod_rewrite),
# comentá el ErrorDocument de arriba y usá estas reglas:
#
# RewriteEngine On
# RewriteCond %{REQUEST_FILENAME} !-f
# RewriteCond %{REQUEST_FILENAME} !-d
# RewriteRule ^ ${fallback} [L]

${apiBlock}
`;

    fs.writeFileSync(path.join(out, ".htaccess"), content);
    return path.join(out, ".htaccess");
}

const fileVars = readEnvFile(envFile);

// El shell (y el .env que carga bun) tiene prioridad sobre el archivo.
const env = { ...process.env };
for (const [key, value] of Object.entries(fileVars)) {
    if (env[key] === undefined) env[key] = value;
}
env.STATIC_BUILD = "true";

const base = normalizeBase(env.BASE_PATH);
const apiUrl = (env.VITE_API_URL ?? "").trim();

console.log(`[build:static] base: ${base || "(raíz)"}`);
console.log(`[build:static] API:  ${apiUrl || "relativa a /api (necesita proxy inverso)"}`);

const vite = path.join(ROOT, "node_modules", "vite", "bin", "vite.js");
const result = spawnSync(process.execPath, [vite, "build"], {
    cwd: ROOT,
    env,
    stdio: "inherit",
});

if (result.error) {
    console.error(`[build:static] no se pudo ejecutar vite: ${result.error.message}`);
    process.exit(1);
}
if (result.status !== 0) process.exit(result.status ?? 1);

const htaccess = writeHtaccess(OUT, base, apiUrl);

console.log("");
console.log(`[build:static] build listo en ${path.relative(ROOT, OUT)}/`);
console.log(`[build:static] fallback SPA: ${path.relative(ROOT, htaccess)}`);
console.log("");
console.log("  Para subir por FTP:");
console.log(`    - subí el CONTENIDO de ${path.relative(ROOT, OUT)}/ (no la carpeta)`);
console.log("    - verificá que el cliente FTP no omita los archivos ocultos (.htaccess)");
console.log(`    - el sitio va a quedar en ${base || "/"}`);
if (apiUrl) {
    console.log(`    - el browser va a llamar la API en ${apiUrl} (CORS + cookie SameSite=None; Secure)`);
} else {
    console.log("    - configurá el proxy /api en el hosting (nginx/Caddy/mod_proxy)");
}
