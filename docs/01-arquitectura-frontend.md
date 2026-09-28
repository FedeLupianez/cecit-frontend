# Arquitectura del Frontend — CeCIT Beneficios

> Documento de referencia técnica del repositorio `cecit-frontend`.
> Describe cómo está construido el frontend, cómo se autentica, cómo se
> comunican con el backend y qué decisiones de diseño se tomaron.

---

## 1. Visión general

CeCIT Beneficios es una **aplicación web SPA con renderizado en servidor**
construida sobre **SvelteKit 2 + Svelte 5 (runes)**. Sirve a tres perfiles de
usuario con capacidades distintas, que comparten la misma base de código:

| Rol | Descripción | Navegación propia |
|---|---|---|
| `USER` | Socio del CeCIT | Historial, Configuración |
| `CECIT_ADMIN` | Administrador del CeCIT | Panel de administrador, Crear beneficio, Historial, Configuración |
| `PARTNER_ADMIN` | Administrador de un comercio adherido | Canjear cupón, Panel de negocio, Historial, Configuración |

El backend es un servicio **NestJS + TypeORM + MySQL** con autenticación **JWT**
y vive en un repositorio aparte. El frontend nunca lo consume directamente desde
el navegador: todo el tráfico pasa por un proxy same-origin implementado en el
hook de servidor (ver §5).

---

## 2. Stack tecnológico

### 2.1 Dependencias de producción

Solo tres, todas de UI:

| Paquete | Versión | Uso |
|---|---|---|
| `lucide-svelte` | `^1.0.1` | Set principal de iconos |
| `@iconify-svelte/qlementine-icons` | `^1.0.6` | Iconos complementarios (`User24Icon`) |
| `svelte-sonner` | `^1.2.1` | Notificaciones *toast* |

### 2.2 Dependencias de desarrollo

| Paquete | Versión |
|---|---|
| `@sveltejs/kit` | `^2.50.2` |
| `svelte` | `^5.54.0` |
| `@sveltejs/adapter-node` | `^5.5.7` |
| `@sveltejs/vite-plugin-svelte` | `^6.2.4` |
| `vite` | `^7.3.1` |
| `typescript` | `^5.9.3` |
| `svelte-check` | `^4.4.2` |
| `@types/node` | `^26.0.1` |

### 2.3 Qué **no** hay

Es importante conocer los límites del stack:

- **Sin Tailwind, sin PostCSS, sin Sass.** Todo el CSS es escrito a mano, con
  *scoping* nativo de Svelte.
- **Sin librería de gestión de estado** (Redux, Zustand, etc.). Hay tres stores
  propios y muy pequeños.
- **Sin librería de UI / design system.**
- **Sin framework de tests.** No hay Vitest, Jest ni Playwright instalados.
- **Sin librería de i18n.** Toda la interfaz está en español rioplatense.
- **Sin service worker / PWA.**

---

## 3. Estructura del proyecto

```text
src/
├── app.css                     # Hoja de estilos global (88 líneas)
├── app.d.ts
├── app.html                    # Shell HTML, preload on hover
├── hooks.server.ts             # Proxy inverso /api → BACKEND_URL
│
├── lib/
│   ├── api.ts                  # Wrapper fetch autenticado + refresh (62 líneas)
│   ├── access/
│   │   └── roleAccess.ts       # Mapa de navegación por rol
│   ├── assets/
│   │   └── favicon.svg
│   ├── components/             # 9 componentes reutilizables
│   │   ├── BenefitCard.svelte        (916)  tarjeta + modal de beneficio
│   │   ├── BenefitsSection.svelte    (762)  carrusel + filtros
│   │   ├── Categories.svelte         (157)  riel de categorías
│   │   ├── Categories.css            (397)
│   │   ├── Footer.svelte             (169)
│   │   ├── HeroCarousel.svelte       (153)  banner + buscador
│   │   ├── JoinSection.svelte        (170)  CTA "hacéte socio"
│   │   ├── Navbar.svelte             (436)
│   │   ├── NavigationProgress.svelte  (67)
│   │   ├── PartnersCarousel.svelte   (169)  marquesina de socios
│   │   └── RoleCard.svelte           (310)  navegación por rol
│   ├── data/                   # Datos mock (legado, mayormente sin uso)
│   │   ├── benefits.js
│   │   ├── categories.js
│   │   └── partners.js
│   ├── stores/
│   │   ├── authStore.ts              # access token (en memoria)
│   │   ├── profileStore.ts           # perfil + rol
│   │   └── categories.svelte.ts      # estado con runes
│   └── types/
│       └── Benefit.ts                # Benefit + BenefitsCreateDTO
│
└── routes/                     # Ver §4
```

---

## 4. Rutas

Todas las páginas son componentes `+page.svelte`. **No existe ningún
`+page.server.ts` ni `+page.ts` en la aplicación**: toda la carga de datos se
hace de forma imperativa desde `onMount` / `$effect`.

| Ruta | Archivo | Acceso | Descripción |
|---|---|---|---|
| `/` | `routes/+page.svelte` | Público* | Landing: hero, categorías, beneficios populares/nuevos, socios, CTA |
| `/login` | `routes/login/+page.svelte` | Público | Ingreso con correo y contraseña |
| `/signup` | `routes/signup/+page.svelte` | Público | Alta de socio |
| `/benefits` | `routes/benefits/+page.svelte` | Autenticado | Catálogo completo con filtros |
| `/history` | `routes/history/+page.svelte` | Autenticado | Historial de cupones del usuario |
| `/profile` | `routes/profile/+page.svelte` | Autenticado | Cambio de correo y contraseña |
| `/redeem` | `routes/redeem/+page.svelte` | `PARTNER_ADMIN` | Terminal de canje de cupones |
| `/create-benefit` | `routes/create-benefit/+page.svelte` | `CECIT_ADMIN` | Alta de beneficio (6 pasos) |
| `/admin-panel` | `routes/admin-panel/+page.svelte` | `CECIT_ADMIN` | Back-office, 5 pestañas (3.236 líneas) |
| `/business-panel` | `routes/business-panel/+page.svelte` | `PARTNER_ADMIN` | Consola del comercio |
| `/business-panel/benefit/[id_benefit]` | ruta dinámica | `PARTNER_ADMIN` | Detalle del beneficio + tabla de canjes |
| `*` (404) | `routes/+error.svelte` | Público | Pantalla de error genérica |

\* `/` está detrás del guard de cookie, pero **todo su contenido es público** y
no requiere token.

### 4.1 Layouts

Solo hay un layout, en la raíz:

- **`+layout.server.ts`** — guard de servidor. Ver §5.2.
- **`+layout.ts`** — bootstrap de sesión en el cliente. Ver §5.3.
- **`+layout.svelte`** — shell: `Navbar` + `NavigationProgress` + `<main>` +
  `Footer` + `<Toaster>`. Alterna una clase `is-navigating` en `<html>` durante
  la navegación.

---

## 5. Autenticación y sesión

El modelo es **access token corto en memoria + refresh token largo en cookie
`httpOnly`**, con un proxy same-origin que reenvía la cookie al backend.

### 5.1 El proxy inverso — `src/hooks.server.ts`

Es el único hook de servidor y **no autentica**: es un proxy transparente.

```text
Navegador  ──►  GET /api/benefits/actives
                        │
                        ▼
              hooks.server.ts  (SvelteKit / Node)
                        │  quita el prefijo /api
                        │  adjunta los headers Authorization y Cookie
                        ▼
              GET {BACKEND_URL}/benefits/actives
                        │
                        ▼
              Respuesta relayed (incluye Set-Cookie)
```

Detalles relevantes:

- Se eliminan headers *hop-by-hop* (`host`, `connection`, `transfer-encoding`,
  `content-length`) antes de reenviar.
- El body de requests no `GET`/`HEAD` se bufferiza con `request.arrayBuffer()`.
- `redirect: "manual"` para relayear redirects del backend sin seguirlos.
- `Set-Cookie` se re-emite **cookie por cookie** vía `headers.getSetCookie()`
  para no colapsar múltiples cookies en una sola.
- Cualquier excepción se convierte en un `502` con
  `{ "message": "Error al comunicarse con el backend" }`.

**Consecuencia práctica:** al ser same-origin, no hay CORS, ni wrestle de
`SameSite`/`Domain`, y la cookie de refresh es de primera parte.

### 5.2 Guard de servidor — `src/routes/+layout.server.ts`

```ts
export const load: LayoutServerLoad = async ({ cookies, url }) => {
    if (env.AUTH_DISABLED === "true") return {};
    if (url.pathname === "/login" || url.pathname === "/signup") return {};

    const refreshToken = cookies.get("refresh_token_cecit");
    if (!refreshToken) throw redirect(302, "/login");

    return {};
};
```

Como es un load del **layout raíz**, corre en todas las rutas salvo
`/login` y `/signup`.

> **Importante:** es una comprobación de **presencia**, no de validez. No
> valida el JWT, no consulta el backend y no decodifica el rol.

### 5.3 Bootstrap de sesión — `src/routes/+layout.ts`

En el cliente, antes de renderizar cualquier página protegida:

```ts
if (!browser) return {};
if (url.pathname === "/login" || url.pathname === "/signup") return {};
if (accessToken.getToken() && profileStore.getProfile()) return {};

const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
const { access_token, profile } = await res.json();
if (access_token) accessToken.setToken(access_token);
if (profile) profileStore.setProfile(profile);
```

El atajo `accessToken.getToken() && profileStore.getProfile()` evita más de un
refresh por carga de página. Los errores se silencian a propósito: el manejo de
401 queda en manos de `apiFetch`.

### 5.4 El wrapper autenticado — `src/lib/api.ts`

Es la pieza central del flujo de sesión. Exporta **una sola función**,
`apiFetch`, que:

1. Inyecta `Authorization: Bearer <token>` (solo si no viene ya puesto) y
   fuerza `credentials: "include"`.
2. Si la respuesta es `401`, ejecuta **un único refresh** y reintenta la
   petición **una sola vez**.
3. Si el refresh no devuelve token, redirige a `/login`.

```ts
let refreshing: Promise<string | null> | null = null;

function refreshOnce() {
    if (!refreshing) {
        refreshing = doRefresh().finally(() => { refreshing = null; });
    }
    return refreshing;
}
```

El *single-flight* (`refreshing`) es la clave: si 10 peticiones fallan con 401
al mismo tiempo, se ejecuta **un solo** `POST /api/auth/refresh` y las 10
esperan la misma promesa.

### 5.5 Control de acceso por rol

La fuente de navegación por rol es `src/lib/access/roleAccess.ts`:

```ts
const accessByRole: Record<AccountRole, RoleAccess> = {
    USER:         { label: "Usuario",       actions: [ /* Configuración, Historial */ ] },
    CECIT_ADMIN:  { label: "Administrador", actions: [ /* + Crear Beneficio, Panel */ ] },
    PARTNER_ADMIN:{ label: "Negociante",    actions: [ /* + Canjear Cupón, Panel */ ] }
};
```

> Este mapa es un **mapa de navegación**, no una frontera de autorización.
> El comentario del propio archivo lo aclara: el backend expone un `role` por
> cuenta pero no un endpoint de permisos, así que este mapeo replica sus guards
> reales.

**No existen guards de rol en el servidor.** La protección real de cada página
restringida es un `$effect` en el cliente:

```ts
$effect(() => {
    const profile = profileStore.getProfile();
    if (profile && profile.role !== "PARTNER_ADMIN") goto("/");
});
```

| Ruta | Predicado | Redirección |
|---|---|---|
| todas | cookie `refresh_token_cecit` presente | `/login` |
| `/admin-panel` | `role === "CECIT_ADMIN"` | `/` |
| `/create-benefit` | `role === "CECIT_ADMIN"` | `/` |
| `/redeem` | `role === "PARTNER_ADMIN"` | `/` |
| `/business-panel` | `role === "PARTNER_ADMIN"` | `/` |
| `/business-panel/benefit/[id]` | `role === "PARTNER_ADMIN"` | `/business-panel` |

Dos matices a tener en cuenta al mantener el código:

- El `profile &&` hace que **la comprobación se salte mientras el perfil es
  `null`**, es decir, durante la ventana entre el montaje y la respuesta de
  `/api/auth/refresh`.
- `profileStore.getProfile()` es una lectura **no reactiva** (`get({subscribe})`),
  así que el efecto se evalúa una vez por montaje.

En la práctica, **la autoridad real es el backend**: devuelve 401/403 y las
páginas lo comunican con mensajes explícitos.

### 5.6 Cookies

| Cookie | La setea | La lee | Propósito |
|---|---|---|---|
| `refresh_token_cecit` | Backend, relayed por `hooks.server.ts` | `+layout.server.ts` (presencia) | Continuidad de sesión |

El frontend **nunca** escribe ni borra cookies y **nunca** toca
`document.cookie`. El access token vive solo en memoria: un refresco duro de
página siempre dispara el round-trip de refresh.

### 5.7 Modo desarrollo sin login

```bash
bun run dev:nologin    # AUTH_DISABLED=true vite dev
```

```dotenv
BACKEND_URL=http://localhost:3000
AUTH_DISABLED=true
DEV_USER_ROLE=PARTNER_ADMIN
```

> **Estado real de la implementación:** `AUTH_DISABLED` se lee en **un solo
> lugar** (`+layout.server.ts:6`) y únicamente **omite la redirección por cookie
> ausente**. No inyecta un perfil de prueba, no fabrica un token y no saltea
> llamadas al backend. `DEV_USER_ROLE` está documentado pero **no lo lee ningún
> archivo fuente**.

⚠️ Nunca activarlo en producción.

---

## 6. Capa de API

### 6.1 Variables de entorno

| Variable | Dónde se lee | Default | Notas |
|---|---|---|---|
| `BACKEND_URL` | `src/hooks.server.ts:7` | `http://localhost:3000` | `$env/dynamic/private`, solo runtime |
| `AUTH_DISABLED` | `src/routes/+layout.server.ts:6` | — | comparación estricta `=== "true"` |
| `DEV_USER_ROLE` | — | — | **declarada pero sin uso en el código** |

No existen variables `PUBLIC_*`, ni `$env/static/*`, ni `envPrefix` custom.

> **Nota:** el repositorio `.gitignore` contempla `!.env.example` y el README lo
> referencia, pero **el archivo no existe**. Solo hay `.env`, que está
> ignorado por git.

### 6.2 Inventario de endpoints

Los endpoints no están abstraídos en funciones por recurso: cada página llama a
`/api/...` directamente. El contrato real vive en los call sites.

#### Autenticación — `/api/auth/*`

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| POST | `/api/auth/login` | `{ email, password }` | `{ access_token }` |
| POST | `/api/auth/register` | `{ id_user, email, password }` | `{ access_token }` |
| POST | `/api/auth/refresh` | — | `{ access_token, profile }` |
| POST | `/api/auth/logout` | — | ignorada |
| PATCH | `/api/auth/update` | `{ process: "EMAIL", email, new_email, current_password }` | — |
| PATCH | `/api/auth/update` | `{ process: "PASSWD", current_password, new_password }` | — |
| PATCH | `/api/auth/update-profile-admin` | `{ id_account, email, new_email }` | cuenta actualizada |

`process` es el discriminador que selecciona qué operación se ejecuta.

#### Beneficios — `/api/benefits/*`

| Método | Ruta | Uso |
|---|---|---|
| GET | `/api/benefits/actives` | Listado público de beneficios vigentes |
| GET | `/api/benefits/popular` | Carrusel "Beneficios Populares" |
| GET | `/api/benefits/news` | Carrusel "Nuevos beneficios" |
| GET | `/api/benefits/search?text=` | Buscador del hero |
| GET | `/api/benefits/all` | Panel de administrador |
| GET | `/api/benefits/partner?id_partner=` | Beneficios de un comercio |
| POST | `/api/benefits` | Alta (`BenefitsCreateDTO`) |
| PATCH | `/api/benefits` | Edición `{ id_benefit, ...draft }` |
| PATCH | `/api/benefits/activate` | `{ id_benefit }` |
| PATCH | `/api/benefits/deactivate` | `{ id_benefit }` |

#### Vouchers — `/api/vouchers/*`

| Método | Ruta | Uso |
|---|---|---|
| POST | `/api/vouchers/create` | `{ id_user, id_benefit }` (socio) · `{ id_account, id_benefit }` (admin) |
| GET | `/api/vouchers/userbenefit?id_account=&id_benefit=` | `{ coupons }` |
| GET | `/api/vouchers/file?token=` | PDF binario |
| GET | `/api/vouchers/byuser?id_user=` | Historial del usuario |
| GET | `/api/vouchers/bytoken?token=` | Búsqueda para canje |
| GET | `/api/vouchers/bybenefit?id_benefit=` | Vouchers de un beneficio |
| GET | `/api/vouchers/redeemed?id_benefit=&id_partner=` | Tabla de canjes |
| GET | `/api/vouchers/all` | Panel de administrador |
| PATCH | `/api/vouchers?action=redeem&token=` | Canjear |
| PATCH | `/api/vouchers?action=reject&token=` | Rechazar |
| DELETE | `/api/vouchers` | `{ token, id_account }` |

`action` es un discriminador en query string: `redeem` y `reject` son el mismo
endpoint.

#### Comercios — `/api/partners/*`

| Método | Ruta | Body / notas |
|---|---|---|
| GET | `/api/partners/all` | `Partner[]` |
| POST | `/api/partners` | `{ partner_name, email, password, logo, directions[] }` |
| PATCH | `/api/partners/name` | `{ id_partner, new_name }` |
| PATCH | `/api/partners/logo` | `{ id_partner, new_logo }` |
| GET | `/api/partners/locations?id_partner=` | `LocationItem[]` |
| POST | `/api/partners/locations` | `{ id_partner, direction }` |
| DELETE | `/api/partners/locations?id_location=` | — |
| DELETE | `/api/partners/id/:id_partner` | — |
| GET | `/api/partners/employees?id_partner=` | Acepta `Employee[]` o `{ employees: [...] }` |
| POST | `/api/partners/employees` | `{ id_partner, dni }` |
| DELETE | `/api/partners/employees?id_partner=&dni=` | **Claveado por DNI**, no por id |
| GET | `/api/partners-admins/me/all` | Negocios que administra el usuario |

#### Cuentas — `/api/accounts/*`

| Método | Ruta | Body |
|---|---|---|
| GET | `/api/accounts/all` | — |
| PATCH | `/api/accounts` | `{ id_account, password }` (reset) |
| PATCH | `/api/accounts` | `{ id_account, active }` (toggle) |
| PATCH | `/api/accounts/role` | `{ id_account, id_partner, newRole }` |

#### Datos de referencia

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/api/categories/actives` | `[{ name, icon_url }]` |
| GET | `/api/categories/all` | `[{ id_category, name, icon_url, active }]` |
| PATCH | `/api/categories/:id_category` | `{ active: boolean }` |
| GET | `/api/benefit-types/all` | `[{ id_type, name }]` |
| GET | `/api/payment-methods/all` | `string[]` |

### 6.3 Manejo de errores

**No hay una capa de error compartida.** Se repiten dos patrones:

**Patrón A — helper `parseError`**, copiado casi literalmente en cinco archivos:

```ts
async function parseError(response: Response) {
    try {
        const data = await response.json();
        if (data?.message) {
            return Array.isArray(data.message)
                ? data.message.join(", ")
                : String(data.message);
        }
    } catch { /* sin cuerpo JSON */ }
    return "Ocurrió un error.";
}
```

Asume un body estilo NestJS `{ message: string | string[] }`.

**Patrón B — banner global + toast** (`admin-panel`):

```ts
function setError(message: string)   { errorGlobal = message;   successGlobal = ""; toast.error(message); }
function setSuccess(message: string) { successGlobal = message; errorGlobal = "";   toast.success(message); }
```

Los **toasts** se montan una sola vez, en el layout raíz:

```svelte
<Toaster position="bottom-right" richColors closeButton />
```

Tratamiento por código de estado que sí está hecho en todas partes:

| Código | Comportamiento | Dónde |
|---|---|---|
| 401 | Refresh + reintento; si falla → `/login` | `api.ts` |
| 401 / 403 | "No tenés permiso para…" | `redeem`, `business-panel`, `admin-panel` |
| 404 | "No se encontró ningún voucher con ese token." | `redeem`, `admin-panel` |
| 409 | "Alcanzaste el máximo de cupones" / "pertenece a otro negocio" | `BenefitCard`, `redeem` |

---

## 7. Stores

La app usa dos estilos, separados por convención de nombre de archivo.

| Archivo | Estilo | Se consume vía |
|---|---|---|
| `authStore.ts` | `writable` clásico | `getToken()` |
| `profileStore.ts` | `writable` clásico | `getProfile()` y `$profileStore` (una vez) |
| `categories.svelte.ts` | **runes de módulo** | `loadCategories()` / `getFilters()` / `getCategories()` |

### 7.1 `authStore`

Almacena **solo el access token, solo en memoria**. Sin `localStorage`, sin
`sessionStorage`, sin `expiresAt`. Casi todos los consumidores usan la API
imperativa `accessToken.getToken()`.

### 7.2 `profileStore`

```ts
export interface Profile {
    user_id: string;
    email: string;
    role?: "USER" | "CECIT_ADMIN" | "PARTNER_ADMIN";
}
```

El rol **nunca se persiste ni se re-decodifica**: llega únicamente dentro del
objeto `profile` de `POST /api/auth/refresh`. Cuando el backend devuelve un
objeto actualizado, el patrón de mutación local es:

```ts
profileStore.setProfile({ ...profileStore.getProfile()!, email: new_email });
```

### 7.3 `categories.svelte.ts` — runes de módulo

```ts
let filters: string[] = $state([]);
let categories: Category[] = $state([]);
let loaded = false;              // `let` normal: NO reactivo, es un cerrojo

export async function loadCategories() { /* idempotente */ }
export function getFilters()  { return filters; }
export function getCategories() { return categories; }
```

Dos detalles importantes:

1. **Los getters leen `$state` en tiempo de llamada**, así que el consumidor
   debe llamar dentro de un `$derived` para que la lectura sea rastreada. Los
   tres consumidores lo hacen bien:
   ```ts
   let categories = $derived(getCategories());
   ```
2. `loaded` es un `let` normal a propósito: actúa como **cerrojo de
   idempotencia de un solo disparo**. Se pone en `true` *antes* del `await`, así
   que un fetch fallido queda cacheado permanentemente como "vacío".

El backend devuelve `icon_url`, pero el store lo re-forma a una clave corta
`icon`, que luego se busca contra un **mapa de componentes lucide** en
`Categories.svelte`. O sea: el backend guarda un *nombre de componente*, no una
URL, pese al nombre del campo.

---

## 8. Componentes

| Componente | Props | Llamadas propias | Runes |
|---|---|---|---|
| `Navbar.svelte` | — | `POST /auth/logout` | `$state`×5, `$derived`, `$effect` |
| `Footer.svelte` | — | — | ninguno (JS plano) |
| `HeroCarousel.svelte` | — | — | `$state`×2 |
| `Categories.svelte` | — | vía `loadCategories()` | `$derived`×2, `onMount` |
| `PartnersCarousel.svelte` | — | `GET /partners/all` | `$state` |
| `BenefitsSection.svelte` | `title`, `endpoint` | vía prop `endpoint` | `$state`×7, `$derived`×2 |
| `BenefitCard.svelte` | 14 tipadas | `POST /vouchers/create`, `GET /vouchers/file`, `GET /vouchers/userbenefit` | `$state`×6, `$derived`×4, `$derived.by`, `$effect` |
| `RoleCard.svelte` | `access`, `compact`, `onLogout`, `logoutPending` | — | `$state`, `$effect` |
| `NavigationProgress.svelte` | — | — | `$derived` |
| `history/Voucher.svelte` | 8 tipadas | `GET /vouchers/file` | `$state`×2, `$derived`×2 |

Todos usan la API de runes. **Ninguno declara `export let`.**

### 8.1 `Navbar.svelte`

Barra superior: logo, 3 enlaces institucionales externos, botón de avatar →
menú de rol con logout, y drawer móvil.

- Es el **único** consumidor que se suscribe a `profileStore`:
  ```ts
  onMount(() => {
      const unsub = profileStore.subscribe((p) => { profile = p; });
      // + listeners de window con teardown
      return () => { unsub(); /* ... */ };
  });
  ```
- El avatar se genera con un **servicio de terceros**, `ui-avatars.com`.
- Menú dismissible por click fuera y por `Escape`.
- Logout envuelto en `try/finally`: el estado local se limpia y redirige a
  `/login` **aunque** la llamada de red falle.
- `RoleCard` se renderiza **dos veces** (dropdown de escritorio y drawer móvil).

### 8.2 `BenefitCard.svelte`

El componente más rico: tarjeta compacta + modal a pantalla completa con
detalles y adquisición de cupón.

- **14 props tipadas.** Hay un mapeo camelCase ↔ snake_case en el borde:
  `startDate` ← `start_date`, `endDate` ← `end_date`.
- `getCopoun()` (con el typo, que se conserva en todo el código) ejecuta el
  flujo de adquisición: `POST /vouchers/create` → obtener contador →
  **descargar el PDF automáticamente** → toast → botón en estado "Canjeado"
  durante 3 segundos.
- Manejo explícito de `409`: fuerza el contador local a `max_per_user` para que
  la UI se autodeshabilite.
- **Coordinación entre componentes vía evento custom:**
  ```ts
  // BenefitsSection dispara
  window.dispatchEvent(new CustomEvent("close-benefit-overlays"));
  // BenefitCard escucha
  window.addEventListener("close-benefit-overlays", closeExpanded);
  ```
  Así, mover el carrusel cierra el modal abierto en vez de dejarlo flotando.
- Detalle editorial distintivo: el título del modal usa
  `writing-mode: vertical-rl` en una columna fija de 4rem.

### 8.3 Carruseles

`Categories.svelte` y `BenefitsSection.svelte` implementan un **wrap-around
infinito** propio: al acercarse al extremo, `scrollLeft` salta al extremo
opuesto. `PartnersCarousel.svelte` usa en cambio la técnica de **duplicar el
array** para que un `translateX(-50%)` en CSS loopée sin costura:

```ts
partners = [...data, ...data];
```

```css
@keyframes partners-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
```

Se pausa en hover (no aplica en táctil).

### 8.4 Interacción de drag en filtros

`BenefitsSection` implementa arrastre horizontal con umbral de 5px para no
romper el clic, y traduce **Shift + rueda** en scroll horizontal:

```ts
if (e.shiftKey && e.deltaY !== 0) { e.preventDefault(); /* scroll horizontal */ }
```

---

## 9. Tipos y datos

`src/lib/types/Benefit.ts` es el único archivo de tipos compartidos.

```ts
export interface BenefitsCreateDTO {
    id_admin: string;
    id_partner: string;
    id_type: number;
    start_date: string;          // "YYYY-MM-DD HH:mm:ss", no ISO-8601
    end_date: string;
    image: string;
    title: string;
    description: string;
    coupons: number;
    max_coupons: number;
    max_per_user: number;
    payment_methods: string[];
    refund_limit: number | null; // genuinamente nullable
}

export interface Benefit {
    id_benefit: string;
    id_admin: string;
    id_partner: string;
    partner: string;             // join denormalizado
    type: string;                // join denormalizado
    categories: string[];
    payment_methods: string[];
    logo: string;
    directions: string[];        // sucursales del comercio
    start_date: string;
    end_date: string;
    image: string;
    title: string;
    description: string;
    coupons: number;             // canjeados
    max_coupons: number;
    max_per_user: number;
    refund_limit: number;        // ← no nullable aquí, sí en el DTO
}
```

Notas de diseño:

- `Benefit` es el **modelo de lectura**: 5 campos son joins denormalizados para
  que la tarjeta renderice sin peticiones extra.
- **Naming consistente en `snake_case`**, alineado con el backend NestJS, lo
  que obliga a convertir a camelCase en el borde de las props.
- **Falta el campo `status`.** El API lo devuelve, pero no está en el tipo
  compartido: `admin-panel` lo agrega localmente (`status?: string`) y
  `business-panel` lo declara como `status?: "ACTIVE" | "INACTIVE" | "PENDING"`.
- `image` y `logo` son **URLs completas**, no blobs subidos. El formulario de
  alta pide una URL de imagen en un input de texto, no un upload.

**Uso limitado:** `Benefit` solo se usa en `BenefitsSection.svelte` y
`benefits/+page.svelte`. `admin-panel`, `business-panel` y la ruta dinámica
redeclaran subconjuntos locales. Hay **cuatro definiciones distintas** de
`Partner` en el proyecto y **tres** del literal de rol.

---

## 10. Estilos

### 10.1 Enfoque

CSS escrito a mano con el *scoping* nativo de Svelte. Cada componente tiene su
`<style>`; solo `Categories.svelte` importa un CSS externo
(`Categories.css`). El único punto de entrada global es `src/app.css`, importado
por `+layout.svelte`.

### 10.2 Tokens

`app.css` define solo dos variables:

```css
:root {
  --primary-blue: #19194f;
  --primary-blue-light: #2a2a7d;
}
```

Además hay un **segundo juego de tokens duplicados** dentro de
`Categories.css` y `BenefitsSection.svelte` (`--primary`, `--primary-light`,
`--shadow`, `--transition`), con valores ligeramente distintos, y varios colores
navy están hardcodeados directamente (`#151535`, `#050505`) en vez de usar el
token.

### 10.3 Utilidades globales

| Clase | Propósito |
|---|---|
| `.mini-spinner` | Spinner inline de 14px reutilizado por toda la app |
| `.page-enter` | Animación de entrada de página (`opacity` + `translateY`) |
| `.is-pending` | Estado pendiente para links/botones que navegan |
| `html.is-navigating` | Alternado por el layout; pone `cursor: progress` |
| `.sr-only` | Texto solo para lectores de pantalla (duplicado en 2 componentes) |

### 10.4 Responsive

Breakpoints habituales: `420px`, `460px`, `480px`, `520px`, `600px`, `640px`,
`700px`, `720px`, `768px`, `780px`, `900px`, `1050px`.

No hay tokens de breakpoint compartidos: cada componente declara sus propios
`@media`.

### 10.5 Accesibilidad

Lo que **sí** está:

- `aria-expanded`, `aria-label`, `aria-current`, `aria-disabled`, `aria-busy`.
- Roles ARIA: `role="dialog"`, `role="tablist"`, `role="tab"`, `role="tabpanel"`,
  `role="progressbar"`, `role="status"`, `role="alert"`.
- Textos `sr-only` para carga y cierre de sesión.
- Navegación por teclado: `Enter`/`Space` en `BenefitCard`, `Escape` para
  cerrar modales y menús.
- `onMount` de `Navbar` con teardown completo de listeners.
- Respeto de `prefers-reduced-motion` en `app.css`, `NavigationProgress`,
  `admin-panel`, `business-panel` y `profile`.

Lo que **faltaría**:

- `<Categories.svelte>` envuelve un `<button>` dentro de un `<a>`: contenido
  interactivo anidado. El ancla es el destino real y el botón es decorativo,
  así que el teclado solo alcanza el ancla.
- Varios estados `error` / `success` se asignan pero **nunca se renderizan**
  (solo toast). Ejemplos: `profile/+page.svelte`, `signup/+page.svelte`,
  `BenefitCard.svelte`.
- `page.url` de `$app/stores` se usa en `RoleCard`, mientras el resto del
  proyecto usa `$app/state`. Conviven ambas APIs.
- Títulos de `<svelte:head>` inconsistentes: `/signup` dice `"CeCIT Login"` y
  `+error.svelte` dice `"404 - Página no encontrada"` incluso para errores 500.

---

## 11. Puntos de extensión y deuda técnica

Esta sección es un mapa de lo que se puede tocar sin romper nada, y de lo que
conviene tener en cuenta antes de ampliar el sistema.

### 11.1 Extensiones naturales

| Objetivo | Dónde |
|---|---|
| Agregar un endpoint | No hay capa: llamar `/api/...` desde la página, idealmente vía `apiFetch` |
| Agregar un rol | `roleAccess.ts` + handling de perfil en backend |
| Agregar una sección de home | Componer en `routes/+page.svelte` |
| Cambiar el backend | `BACKEND_URL` en el entorno de runtime de Node |
| Estilos globales | `src/app.css` (único punto de entrada) |
| Agregar un beneficio a un panel | `admin-panel` y `business-panel` redeclaran sus tipos locales |

### 11.2 Deuda técnica conocida

**Arquitectura**

- Sin capa de servicios: los endpoints están dispersos en los call sites.
- `parseError` está duplicado en 5 archivos.
- No hay tests de ningún tipo.
- No hay capa de error ni tipos de error compartidos.

**Autenticación**

- El guard de servidor solo comprueba presencia de cookie, no validez.
- Los guards de rol son de cliente y se saltan mientras el perfil es `null`.
- El rol no se persiste: un fallo de refresh deja al usuario sin navegación.
- `AUTH_DISABLED` solo desactiva la redirección; `DEV_USER_ROLE` no está
  implementado.

**Tipos**

- 4 interfaces `Partner` distintas, 3 literales de rol duplicados, el campo
  `status` ausente del tipo compartido.
- `admin-panel` usa `directions`, `business-panel` usa `direction`.
- El `Voucher` de `business-panel` no contempla `REJECTED`.

**Datos y red**

- N+1 requests en `business-panel`: un `GET /vouchers/bybenefit` por beneficio,
  con `fetch` crudo sin token.
- Lógica de fechas duplicada, con un workaround de timezone aplicado
  inconsistentemente entre archivos.
- `console.log` residuales en varias páginas.

**Accesibilidad**

- Contenido interactivo anidado en `Categories.svelte`.
- Múltiples estados de error no renderizados.
- Coexistencia de `$app/stores` y `$app/state`.

**UI**

- Métricas hardcodeadas (`04 / 10 / 10`) en `create-benefit`, mientras
  `business-panel` sí las calcula de verdad.
- CSS muerto: `.error-box` en login, `.voucher-error` en `BenefitCard`,
  `backdrop-filter` comentado, tokens `--shadow`/`--transition` sin uso.
- `create-benefit` y el botón "Ir al panel" navegan a `/business-panel`, que es
  una ruta de negocio, desde una página de administrador.
- `RoleCard` en modo no-compacto tiene `font-size: 10rem` sobre una tarjeta de
  `padding: 7rem`; solo el breakpoint de 600px lo disimula en pantallas anchas.

### 11.3 Cómo verificar los cambios

```bash
bun run check        # svelte-kit sync && svelte-check
bun run build        # vite build
bun run dev          # servidor de desarrollo
bun run dev:nologin  # sin guard de login
```

> `bun run check` es la única verificación automatizada disponible: no hay
> suite de tests, así que el type-check es el piso de calidad.

---

## 12. Referencias

- Documentación de SvelteKit: <https://svelte.dev/docs/kit>
- Runes de Svelte 5: <https://svelte.dev/docs/svelte/svelte-5>
- `adapter-node`: <https://svelte.dev/docs/kit/adapter-node>
- Iconos lucide: <https://lucide.dev>
- Toasts: <https://github.com/emilkowalski/svelte-sonner>
