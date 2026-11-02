# Guía de Desarrollo — CeCIT Beneficios

> Cómo levantar el entorno, escribir código y mantener el proyecto.
> Complementa a [01-arquitectura-frontend.md](./01-arquitectura-frontend.md),
> que explica *por qué* el proyecto es como es.

---

## 1. Requisitos

| Herramienta | Versión mínima |
|---|---|
| **bun** | `>= 1.3.14` (recomendado) |
| **node** | `>= v26.7.0` |
| **git** | cualquiera |

> Conviene revisar la **rama en la que se está trabajando** antes de instalar
> dependencias.

## 2. Puesta en marcha

```bash
git clone https://github.com/FedeLupianez/cecit-frontend
cd cecit-frontend

bun install     # o: npm install
bun run dev     # o: npm run dev
```

El servidor queda en <http://localhost:5173> por defecto.

### 2.1 Variables de entorno

Crear un `.env` en la raíz:

```dotenv
BACKEND_URL=http://localhost:3000

# Modo desarrollo sin autenticación
AUTH_DISABLED=false
DEV_USER_ROLE=PARTNER_ADMIN
```

| Variable | Obligatoria | Default | Descripción |
|---|---|---|---|
| `BACKEND_URL` | en producción | `http://localhost:3000` | Origen del backend NestJS. Se lee **en runtime**, así que se puede cambiar sin recompilar. |
| `AUTH_DISABLED` | no | — | `true` desactiva la redirección por cookie ausente. Solo para desarrollo. |
| `DEV_USER_ROLE` | no | — | Declarada en el README pero **no implementada** en el código. Ver §4. |
| `VITE_API_URL` | no | — | Origen del backend **para el build estático**. Vacío = llamadas relativas a `/api` (las proxya nginx/Caddy o el server de SvelteKit). Se compila dentro del bundle: cambiarla requiere recompilar. Ver §5.2.1. |

⚠️ `.env` está en `.gitignore`. Nunca subir credenciales.

## 3. Comandos

| Comando | Qué hace |
|---|---|
| `bun run dev` | Servidor de desarrollo con HMR |
| `bun run dev:nologin` | Lo mismo con `AUTH_DISABLED=true` |
| `bun run build` | Build de producción con `adapter-node` (server) |
| `bun run build:static` | Build 100% estático con `adapter-static` (carpeta `build/`), sin base y sin `VITE_API_URL` (modo proxy) |
| `bun run build:static:ftp` | Build estático para FTP/CDN: toma `BASE_PATH` y `VITE_API_URL` de `.env.ftp` y genera `build/.htaccess` |
| `bun run start` | Levanta el build (`node build`) |
| `bun run preview` | Previsualiza el build |
| `bun run preview:static` | Sirve `build/` + proxy `/api` (para probar el build estático) |
| `bun run check` | `svelte-kit sync` + `svelte-check` |
| `bun run check:watch` | El type-check en modo watch |

> `bun run check` es **la única verificación automatizada** del proyecto: no hay
> suite de tests. Es el piso de calidad antes de abrir un PR.

## 4. Sobre el modo sin autenticación

```bash
bun run dev:nologin
```

**Lo que hace realmente:** omite la redirección a `/login` cuando no existe la
cookie `refresh_token_cecit` (`src/routes/+layout.server.ts:6`).

**Lo que NO hace**, pese a lo que sugiere el README:

- No inyecta un perfil de prueba.
- No fabrica un access token.
- No saltea las llamadas al backend.
- `DEV_USER_ROLE` no lo lee ningún archivo fuente.

**Consecuencia práctica:** sin backend corriendo, la página carga pero
`profileStore` queda `null` y el navbar muestra "Cargando perfil..." de forma
permanente; las páginas con guard de rol se renderizan sin proteger porque el
chequeo `profile && ...` se salta. Sirve para iterar sobre la UI estática, no
para probar flujos autenticados.

⚠️ **Nunca activar en producción.** Es solo un flag de desarrollo.

## 5. Deployment

Hay **dos modos de build**. Elegí según dónde se va a publicar.

### 5.1 Build híbrido (server Node) — para VPS / contenedor

Usa `@sveltejs/adapter-node`: genera un server Node autocontenido en `build/`.

```bash
bun run build
BACKEND_URL=https://api.cecit.local node build
```

- `BACKEND_URL` se lee en **runtime**, la misma imagen sirve para distintos ambientes.
- El server de SvelteKit hace de proxy hacia el backend (`src/hooks.server.ts`):
  el navegador nunca contacta al origen del API directamente y la cookie
  `refresh_token_cecit` queda como *host-only* del dominio de la app.
- Se necesita un proxy inverso (nginx, Caddy) delante para TLS.

nginx mínimo:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;   # el node build
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 5.2 Build estático — para hosting FTP / CDN

Usa `@sveltejs/adapter-static`: **todo** el sitio son archivos estáticos.

```bash
bun run build:static          # build de prueba: sin base, API por proxy
bun run build:static:ftp      # build para subir: lee .env.ftp
```

`build:static` no lleva base ni `VITE_API_URL`: es el build para probar en local
(el browser llama a `/api` y lo proxya el preview o el nginx).

`build:static:ftp` es el build de publicación. Lee `.env.ftp` (copiá
`.env.ftp.example` y ajustá):

| Variable | Para qué | Ejemplo |
|---|---|---|
| `BASE_PATH` | Prefijo del sitio. Vacío = raíz del dominio | `/beneficios` |
| `VITE_API_URL` | Backend al que llama el browser. Vacío = `/api` relativo (necesita proxy) | `https://api.cecit.local` |

Los valores del shell tienen prioridad sobre los del archivo, así que
`BASE_PATH=/otra bun run build:static:ftp` compila para otra ubicación sin
tocar el archivo.

Además del build, `build:static:ftp` genera **`build/.htaccess`** con el
fallback SPA (§5.2.2) ya configurado para el base del build, y al terminar
imprime un resumen de lo que hay que setear en el hosting.

El resultado es **una sola carpeta `build/`** (ya viene merged: HTML
prerenderizado, `_app/`, `__data.json`, imágenes y `200.html`). No existen
`build/prerendered` ni `build/client`: eso es del build con Node.

Para probar el build estático en local (sirve `build/` y proxya `/api` al
backend, igual que nginx):

```bash
BACKEND_URL=http://localhost:3000 bun run preview:static   # http://localhost:4173
```

El preview **detecta solo el base con el que se compiló el build** (SvelteKit
lo deja escrito en el HTML) y sirve el sitio en ese prefijo. Si el build se
compiló con `BASE_PATH=/beneficios`, el preview abre en
`http://localhost:4173/beneficios/`; si se compiló sin base, abre en
`http://localhost:4173/`. Para forzar uno u otro:

```bash
BASE_PATH=/beneficios bun run preview:static   # fuerza el prefijo
```

Los assets que no existen en disco devuelven **404**, no el HTML del fallback
SPA: si un `.css` devolviera `text/html`, el browser lo descarta por MIME
mismatch y la página queda sin estilos sin mostrar ningún error.

> ⚠️ **No abras `build/index.html` con doble click** (`file://`): los módulos ES
> no cargan y los `fetch("/api/...")` no tienen a dónde ir. Hay que servirlo por
> HTTP.

#### 5.2.1 Cómo llegan las llamadas a la API

En un build estático **no hay server**, así que `/api` hay que resolverlo de
una de dos formas:

**Opción A — con proxy inverso (recomendada).** nginx/Caddy sirve los archivos
estáticos y reenvía `/api` al backend. Es el mismo criterio que el proxy de
SvelteKit: se quita el prefijo `/api`.

```nginx
server {
    listen 443 ssl;
    server_name app.cecit.local;
    root /var/www/cecit;          # <- contenido de build/

    location /api/ {
        proxy_pass http://127.0.0.1:3000/;   # la "/" final quita el prefijo /api
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /200.html;       # fallback SPA
    }
}
```

**Opción B — sin proxy (hosting FTP puro).** El browser llama al backend
directo. Hay que compilar con la URL del backend:

```bash
VITE_API_URL=https://api.cecit.local bun run build:static
```

Requisitos del backend para que funcione:

| Requisito | Por qué | Dónde |
|---|---|---|
| `FRONT_URL` = origen del hosting | CORS con credenciales (`origin` + `credentials: true`) | `.env` del backend |
| La cookie debe viajar | El refresh token es una cookie `httpOnly`, `SameSite=Strict` en prod | `src/auth/auth.controller.ts` |

Sobre el segundo punto: `SameSite` mira el **sitio** (dominio registrable), no
el origen. Si el hosting y la API son subdominios del mismo dominio
(`app.cecit.local` + `api.cecit.local`) → mismo sitio → `Strict` funciona y no
hay que tocar el backend. Si son sitios distintos → el browser no manda la
cookie y hay que cambiar el backend a `sameSite: 'none'` + `secure: true`
(Chrome exige `Secure` para `SameSite=None`).

#### 5.2.2 Fallback SPA (obligatorio en hosting estático)

Las rutas con parámetros (`/business-panel/benefit/:id`) no se prerenderizan:
se resuelven en el cliente. El servidor tiene que servir `200.html` cuando no
encuentra el archivo, si no un F5 en esa URL da 404.

- nginx/Caddy: `try_files $uri $uri/ /200.html;`
- cPanel/Plesk: *Error Documents* → 404 → `/200.html`.
- Apache: el `build/.htaccess` que genera `build:static:ftp` ya lo trae
  (`ErrorDocument 404 /200.html`, o `/beneficios/200.html` con base). Si el
  panel del hosting pisa ese archivo, configurá lo mismo a mano.

> ⚠️ Many clientes FTP omiten los archivos ocultos por default: si el
> `.htaccess` no sube, el fallback SPA no está y las rutas con parámetros dan
> 404.

### 5.3 Subir por FTP

1. Compilar el build estático:

   ```bash
   cp .env.ftp.example .env.ftp   # una vez, y ajustá BASE_PATH/VITE_API_URL
   bun run build:static:ftp
   ```

2. Subir **el contenido de `build/`** al directorio web del hosting (la raíz
   pública, no `build/` como subcarpeta):

   ```
   index.html
   200.html
   .htaccess
   benefits.html
   _app/
   __data.json
   empresas.png
   ...
   ```

   `build/` ya viene merged, así que **no** hay que combinar `prerendered` con
   `client` (esos subdirectorios solo existen en el build con Node).

3. En el panel del hosting: setear el documento de error 404 a `/200.html`
   (salvo que se haya subido el `.htaccess`, que ya lo resuelve).

4. Si no hay proxy inverso, configurar `FRONT_URL` en el backend con el origen
   del hosting (ver §5.2.1, opción B).

> El build con Node (`bun run build`) **no** se sube por FTP: genera un server,
> no archivos estáticos.

## 6. Convenciones de código

### 6.1 Svelte 5: solo runes

`svelte.config.js` fuerza el modo runes para **todo** el proyecto:

```js
runes: ({ filename }) => {
    const relativePath = relative(import.meta.dirname, filename).toLowerCase();
    return relativePath.split(sep).includes('node_modules') ? undefined : true;
}
```

Reglas prácticas:

| En vez de | Usar |
|---|---|
| `export let x` | `let { x }: { x: string } = $props()` |
| `$: total = a + b` | `let total = $derived(a + b)` |
| `on:click` | `onclick` |
| `let count = 0` | `let count = $state(0)` |
| `$: { /* efectos */ }` | `$effect(() => { /* ... */ })` |

### 6.2 Tipos en props

Los componentes con props usan tipado explícito del objeto `$props()`:

```ts
let { title, endpoint = "/api/benefits/actives" }: {
    title: string;
    endpoint: string;
} = $props();
```

`BenefitCard.svelte` es el ejemplo canónico con sus 14 props tipadas.

### 6.3 Formato de fechas

El backend trabaja con **strings** `"YYYY-MM-DD HH:mm:ss"`, no con ISO-8601.
El frontend concatena directamente:

```ts
start_date: `${startDate} ${startTime || "00:00"}:00`
```

Al parsear, `new Date("YYYY-MM-DD")` se interpreta como **UTC** y se corre un
día en timezones negativos. El proyecto ya tiene un workaround en
`admin-panel/+page.svelte:1170-1200`:

```ts
function formatDate(value: string) {
    if (!value) return "—";
    // Las fechas "YYYY-MM-DD" se parsean como UTC y se corren un día
    // en timezones negativos: construirlas como fecha local.
    const parts = value.slice(0, 10).split("-").map(Number);
    let date: Date;
    if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
        date = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
        date = new Date(value);
    }
    // ...
}
```

> ⚠️ Este helper está **duplicado** en `business-panel/benefit/[id_benefit]`
> pero **no** en `Voucher.svelte` ni en `redeem`, que sí tienen el bug de
> timezone. Si agregás un formateo de fechas, copiá el workaround completo,
> incluido el guard `isNaN`.

### 6.4 Errores y toasts

El `Toaster` ya está montado en `+layout.svelte`. Para notificar:

```ts
import { toast } from "svelte-sonner";
toast.success("Sesión iniciada correctamente");
```

Para traducir errores del backend existe el patrón `parseError`, replicado en
cinco archivos:

```ts
async function parseError(response: Response) {
    try {
        const data = await response.json();
        if (data?.message) {
            return Array.isArray(data.message) ? data.message.join(", ") : String(data.message);
        }
    } catch { /* sin cuerpo JSON */ }
    return "Ocurrió un error.";
}
```

> 💡 **Deuda conocida:** este helper y los banners `errorGlobal`/`successGlobal`
> deberían vivir en un módulo compartido. Si vas a tocar un archivo que ya lo
> tiene, considerá extraerlo.

### 6.5 Peticiones

Dos patrones conviven:

```ts
// 1. Endpoint autenticado → siempre apiFetch
import { apiFetch } from "$lib/api";
const res = await apiFetch("/api/partners/all");

// 2. Endpoint público → fetch crudo
const res = await fetch("/api/benefits/actives");
```

`apiFetch` inyecta el token, refresca ante 401 y reintenta una vez. **Usalo por
defecto** salvo que el endpoint sea deliberadamente público.

> ⚠️ **Trampa:** `business-panel/+page.svelte:110-112` tiene un `authHeaders()`
> que devuelve `{}` — residuo de la migración a `apiFetch`. No copiar ese
> patrón.

### 6.6 Rutas dinámicas

Los parámetros se leen con la API de runes, no con `load`:

```ts
import { page } from "$app/state";

const idBenefit = $derived(page.params.id_benefit ?? "");
const partnerId = $derived(page.url.searchParams.get("id_partner") ?? "");
```

### 6.7 CSS

Todo el CSS es escrito a mano con el scoping de Svelte. No hay framework de
estilos.

- Tokens globales: `src/app.css` (el único entry point global).
- Un componente puede importar su propio CSS: `import "./Categories.css";`
- Utilidades reutilizables: `.mini-spinner`, `.page-enter`, `.is-pending`.
- Declarar `@media` propios en cada componente; no hay tokens compartidos de
  breakpoint.
- Respetar `prefers-reduced-motion` en animaciones nuevas.

> ⚠️ **Trampa:** existen dos juegos de tokens duplicados dentro de componentes
> (`Categories.css` y `BenefitsSection.svelte`) con valores **distintos** de
> `app.css`. No confíes en ellos; usá `var(--primary-blue)` de `app.css`.

## 7. Checklist antes de abrir un PR

- [ ] `bun run check` pasa sin errores.
- [ ] `bun run build` compila.
- [ ] Probado el flujo en móvil (la app es responsive-first).
- [ ] Si tocaste autenticación: probado refresh de página y expiración de sesión.
- [ ] Si tocaste un guard de rol: probado con los **tres** roles.
- [ ] Si agregaste endpoints: updating la tabla de
  [01-arquitectura-frontend.md §6.2](./01-arquitectura-frontend.md).
- [ ] Sin `console.log` nuevos.
- [ ] Sin `any` en tipos nuevos.

## 8. Recursos

- [Documentación de SvelteKit](https://svelte.dev/docs/kit)
- [Runes de Svelte 5](https://svelte.dev/docs/svelte/svelte-5)
- [Guía de migración Svelte 4 → 5](https://svelte.dev/docs/svelte/v5-migration-guide)
- [Documentación del backend NestJS](https://docs.nestjs.com)
