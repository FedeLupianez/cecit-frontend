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

⚠️ `.env` está en `.gitignore`. Nunca subir credenciales.

## 3. Comandos

| Comando | Qué hace |
|---|---|
| `bun run dev` | Servidor de desarrollo con HMR |
| `bun run dev:nologin` | Lo mismo con `AUTH_DISABLED=true` |
| `bun run build` | Build de producción con `adapter-node` |
| `bun run start` | Levanta el build (`node build`) |
| `bun run preview` | Previsualiza el build |
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

El build usa `@sveltejs/adapter-node`, que genera un servidor Node
autocontenido en `build/`:

```bash
bun run build
BACKEND_URL=https://api.cecit.local node build
```

Puntos a tener en cuenta:

- `BACKEND_URL` se lee en **runtime** desde el entorno, así que la misma
  imagen sirve para distintos ambientes.
- El servidor SvelteKit es el que hace de proxy hacia el backend. El navegador
  nunca contacta al origen del API directamente.
- Se necesita un proxy inverso (nginx, Caddy) delante para TLS, y para
  management de la cookie de refresh según el dominio de despliegue.

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
