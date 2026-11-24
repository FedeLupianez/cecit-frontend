import http from "node:http";
import fs from "node:fs";
import path from "node:path";

/**
 * Servidor estático para probar el build de adapter-static (STATIC_BUILD=true).
 *
 * Hace lo mismo que el reverse proxy de producción (nginx/Caddy):
 *   - sirve ./build (HTML prerenderizado + 200.html como fallback SPA)
 *   - reenvía /api/* al backend, quitando el prefijo /api
 *
 *   node scripts/static-preview.mjs [directorio] [puerto]
 *
 * BACKEND_URL=http://localhost:3000 node scripts/static-preview.mjs
 *
 * Con BASE_PATH=/beneficios replica un hosting que publica el sitio en un
 * subdirectorio: las URLs llevan el prefijo pero los archivos son planos
 * (login.html, benefits.html, ...) igual que el output de adapter-static.
 *
 * Si no se pasa BASE_PATH, el base se detecta solo del HTML del build (SvelteKit
 * lo escribe ahí), así el preview sirve correctamente un build compilado con
 * `BASE_PATH=/beneficios bun run build:static` sin tener que acordarse del flag.
 */
const ROOT = path.resolve(process.argv[2] ?? "build");
const PORT = Number(process.argv[3] ?? 4173);
const BACKEND = process.env.BACKEND_URL ?? "http://localhost:3000";

const TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".txt": "text/plain; charset=utf-8",
};

const HOP_BY_HOP = new Set([
    "host",
    "connection",
    "transfer-encoding",
    "content-length",
    "keep-alive",
]);

/**
 * Extensiones de archivos estáticos. Si un request de este tipo no existe en
 * disco hay que devolver 404: servirle el HTML del fallback SPA hace que el
 * browser descarte el CSS/JS (MIME mismatch) y la página se vea sin estilos
 * sin que se note el error real.
 */
const ASSET_EXTENSIONS = new Set([
    ".css",
    ".js",
    ".mjs",
    ".map",
    ".json",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".webp",
    ".avif",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".otf",
    ".eot",
    ".txt",
    ".xml",
    ".webmanifest",
    ".wasm",
    ".pdf",
]);

/** Normaliza un base a "/algo" (sin barra final) o "" si no hay. */
function normalizeBase(value) {
    if (!value) return "";
    let base = value.trim();
    if (!base.startsWith("/")) base = `/${base}`;
    return base.replace(/\/+$/, "");
}

/**
 * Detecta el base con el que se compiló el build leyendo el HTML prerenderizado.
 * SvelteKit escribe ahí `base: "/beneficios"`; si el build se hizo sin base,
 * devuelve "".
 */
function detectBase(root) {
    for (const name of ["index.html", "200.html"]) {
        const file = path.join(root, name);
        if (!fs.existsSync(file)) continue;
        const html = fs.readFileSync(file, "utf8");
        // El objeto de config que SvelteKit inyecta: { base: "...", assets: "..." }
        const match = html.match(/base:\s*"([^"]*)"[\s\S]{0,200}?assets:\s*"/);
        if (match) return normalizeBase(match[1]);
    }
    return "";
}

const BASE =
    process.env.BASE_PATH !== undefined
        ? normalizeBase(process.env.BASE_PATH)
        : detectBase(ROOT);

function readBody(req) {
    return new Promise((resolve) => {
        const chunks = [];
        req.on("data", (c) => chunks.push(c));
        req.on("end", () => resolve(Buffer.concat(chunks)));
    });
}

async function proxyApi(req, res, pathname, search) {
    const target = new URL(`${BACKEND}${pathname.replace(/^\/api/, "")}${search}`);
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
        if (!HOP_BY_HOP.has(key)) headers[key] = value;
    }

    try {
        const body =
            req.method === "GET" || req.method === "HEAD" ? undefined : await readBody(req);
        const upstream = await fetch(target, {
            method: req.method,
            headers,
            body,
            redirect: "manual",
        });

        const outHeaders = {};
        upstream.headers.forEach((value, key) => {
            if (!HOP_BY_HOP.has(key) && key !== "set-cookie") {
                outHeaders[key] = value;
            }
        });
        // El refresh token viaja en una cookie httpOnly: hay que reenviarla tal cual.
        const setCookies = upstream.headers.getSetCookie?.() ?? [];
        if (setCookies.length) outHeaders["set-cookie"] = setCookies;

        res.writeHead(upstream.status, outHeaders);
        res.end(Buffer.from(await upstream.arrayBuffer()));
    } catch (error) {
        console.error("[static-preview] error de proxy:", error);
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Error al comunicarse con el backend" }));
    }
}

function sendFile(res, file, status = 200) {
    res.writeHead(status, {
        "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream",
    });
    fs.createReadStream(file).pipe(res);
}

/** Traduce una ruta URL a un archivo dentro de ROOT, o null si no existe. */
function tryFile(pathname) {
    let file = path.join(ROOT, pathname);
    // path traversal: el archivo tiene que estar dentro de ROOT
    if (file !== ROOT && !file.startsWith(ROOT + path.sep)) return null;
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
        file = path.join(file, "index.html");
    }
    if (!fs.existsSync(file) && fs.existsSync(`${file}.html`)) {
        file = `${file}.html`;
    }
    return fs.existsSync(file) ? file : null;
}

/** ¿Es un pedido de asset (CSS/JS/imagen) y no de una página? */
function isAssetPath(pathname) {
    if (pathname.startsWith("/_app/")) return true;
    return ASSET_EXTENSIONS.has(path.extname(pathname).toLowerCase());
}

/**
 * Resuelve un archivo del build.
 *
 * El output de adapter-static es plano (login.html, _app/..., logo.png) pero el
 * HTML referencia todo con el prefijo del base (/beneficios/_app/...). Se prueba
 * la ruta tal cual y, si es un asset, también sin su primer segmento, para que
 * un desajuste de base no deje la página sin estilos.
 */
function resolveFile(pathname) {
    const direct = tryFile(pathname);
    if (direct) return direct;

    if (isAssetPath(pathname)) {
        const slash = pathname.indexOf("/", 1);
        if (slash > 0) {
            const stripped = tryFile(pathname.slice(slash));
            if (stripped) return stripped;
        }
    }

    return null;
}

if (!fs.existsSync(ROOT)) {
    console.error(`[static-preview] no existe ${ROOT}. Corré el build estático primero:`);
    console.error("  bun run build:static");
    process.exit(1);
}

http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    let pathname;
    try {
        pathname = decodeURIComponent(url.pathname);
    } catch {
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("400: URL mal formada");
        return;
    }

    if (pathname === "/api" || pathname.startsWith("/api/")) {
        await proxyApi(req, res, pathname, url.search);
        return;
    }

    // Con base, el sitio vive bajo el prefijo: las URLs llevan el prefijo pero
    // los archivos son planos (login.html, benefits.html, ...).
    if (BASE) {
        if (pathname === "/" || pathname === BASE) {
            res.writeHead(302, { Location: `${BASE}/` });
            res.end();
            return;
        }
        if (pathname.startsWith(`${BASE}/`)) {
            pathname = pathname.slice(BASE.length);
        }
    }

    const file = resolveFile(pathname);
    if (file) {
        sendFile(res, file);
        return;
    }

    // Un asset que no existe tiene que dar 404, no el HTML del fallback: si no,
    // el browser recibe text/html donde esperaba CSS/JS, lo descarta por MIME
    // mismatch y la página queda sin estilos sin que se note el error real.
    if (isAssetPath(pathname)) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(`404: no existe ${pathname} en ${ROOT}`);
        return;
    }

    // Fallback SPA: las rutas con parámetros (ej. /business-panel/benefit/:id)
    // las resuelve el router del cliente.
    const fallback = path.join(ROOT, "200.html");
    if (!fs.existsSync(fallback)) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("not found");
        return;
    }
    sendFile(res, fallback);
}).listen(PORT, () => {
    const url = `http://localhost:${PORT}${BASE ? `${BASE}/` : "/"}`;
    console.log(`[static-preview] sirviendo ${ROOT} en ${url}`);
    console.log(`[static-preview] base: ${BASE || "(raíz)"}`);
    console.log(`[static-preview] /api/* -> ${BACKEND}`);
});
