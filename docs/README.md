# Documentación — CeCIT Beneficios

> Documentación del frontend de la plataforma de beneficios del **Centro de
> Comercio, Industria y Turismo de Alta Gracia (CeCIT)**.
>
> living repository: se actualiza junto con el código.

---

## Por dónde empezar

| Si sos… | Leé |
|---|---|
| **Socio** que quiere usar beneficios | [Manual de Socio](./manual-usuario-socio.md) |
| **Comercio adherido** | [Manual de Negocios](./manual-negocios.md) |
| **Administrador del CeCIT** | [Manual de Administradores CeCIT](./manual-administradores-cecit.md) |
| **Desarrollador** que va a tocar el código | [Guía de Desarrollo](./02-guia-de-desarrollo.md) |
| **Cualquiera** que quiera entender el sistema | [Arquitectura del Frontend](./01-arquitectura-frontend.md) |

---

## Documentación técnica

| # | Archivo | Contenido |
|---|---|---|
| 01 | [Arquitectura del Frontend](./01-arquitectura-frontend.md) | Stack, estructura de carpetas, sistema de autenticación, capa de API, stores, componentes, estilos, accesibilidad y deuda técnica. **~500 líneas.** |
| 02 | [Guía de Desarrollo](./02-guia-de-desarrollo.md) | Requisitos, puesta en marcha, comandos, deployment, convenciones de código, trampas conocidas y checklist de PR. |

### Qué cubre la documentación técnica

**Arquitectura (01)**

- Stack y qué frameworks **no** se usan
- Estructura completa de `src/`
- Las 12 rutas y sus guards de acceso
- El modelo de autenticación: access token en memoria + refresh en cookie
- El proxy inverso de `hooks.server.ts` y por qué existe
- Los 40 endpoints organizados por recurso
- Los tres stores y sus sutilezas
- Los 11 componentes con sus props
- El sistema de estilos y tokens
- Accesibilidad: lo que está y lo que falta
- Mapa de deuda técnica para futuros cambios

**Desarrollo (02)**

- Requisitos, instalación, comandos
- Configuración de `.env`
- Cómo publicar en producción
- Convenciones Svelte 5 (runes)
- Trampas reales del código (workaround de fechas, headers de auth rotos,
  tokens de CSS duplicados)
- Checklist antes de abrir un PR

---

## Manuales por rol

### [Manual de Socio](./manual-usuario-socio.md)

Para los socios adheridos que usan los beneficios.

1. Qué es la plataforma
2. Crear tu cuenta
3. Iniciar sesión
4. Cerrar sesión
5. Explorar la página de inicio
6. Buscar y filtrar beneficios
7. Ver los detalles de un beneficio
8. **Adquirir un cupón**
9. Tu historial de cupones
10. Configurar tu cuenta
11. Preguntas frecuentes

### [Manual de Negocios](./manual-negocios.md)

Para los comercios adheridos que administran su cuenta.

1. Qué cambia respecto a un socio
2. Acceso al panel
3. **Canjear cupones en el mostrador**
4. Panel de negocio y métricas
5. Ubicaciones y sucursales
6. Empleados y permisos
7. Tus beneficios y tabla de canjes
8. Preguntas frecuentes

### [Manual de Administradores CeCIT](./manual-administradores-cecit.md)

Para el equipo del CeCIT que opera la plataforma.

1. Alcance del rol
2. Panel de administrador
3. Pestaña **Usuarios** (correos, contraseñas, activación)
4. Pestaña **Negocios** (alta, edición, eliminación)
5. Pestaña **Beneficios** (edición, activación)
6. **Crear un beneficio** (formulario de 6 pasos)
7. Pestaña **Vouchers** (emisión, búsqueda, canje)
8. Pestaña **Categorías**
9. Configuración de tu cuenta
10. Preguntas frecuentes
11. Buenas prácticas

---

## Documentación en construcción

| Archivo | Estado | Propósito |
|---|---|---|
| [PLAN-MANUAL-COMPLETO.md](./PLAN-MANUAL-COMPLETO.md) | 🔨 Plantilla | Plan de trabajo para consolidar los tres manuales en uno integral: glosario, matriz de roles, flujos, troubleshooting, capturas. |

> Este archivo es un **plan**, no documentación para usuarios. Sirve para
> retomar el trabajo en una sesión futura.

---

## Resumen del sistema

### Los tres roles

| Rol | Qué puede hacer | Menú propio |
|---|---|---|
| **Socio** (`USER`) | Consultar y adquirir beneficios, ver su historial | Historial, Configuración |
| **Admin de comercio** (`PARTNER_ADMIN`) | Todo lo de socio, más canjear cupones y administrar su negocio | Canjear Cupón, Panel de negocio, Historial, Configuración |
| **Admin CeCIT** (`CECIT_ADMIN`) | Todo lo de socio, más gestión de socios, comercios, beneficios y cupones | Crear Beneficio, Panel de administrador, Historial, Configuración |

### Stack

| Capa | Tecnología |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 (runes) |
| Build | Vite 7 · `adapter-node` |
| Lenguaje | TypeScript (strict) |
| Estilos | CSS escrito a mano (sin framework) |
| Estado | 3 stores propios |
| Iconos | lucide-svelte · qlementine-icons |
| Toasts | svelte-sonner |
| Backend | NestJS · TypeORM · MySQL · JWT |

### Flujo del negocio

```text
    CeCIT                                  Socio                Comercio
      │                                      │                     │
      ├─ crea beneficios ────────────────────►│                     │
      │                                      │                     │
      ├─ habilita admin ────────────────────►│──── cuenta ───────►│
      │                                      │                     │
      │                                      ├─ busca beneficio   │
      │                                      ├─ adquire cupón     │
      │                                      │  (PDF + token)     │
      │                                      │                     │
      │                                      ├─ va al comercio ───►│
      │                                      │  muestra token     │
      │                                      │                     ├─ valida
      │                                      │                     ├─ canjea
      │                                      │                     │
      │◄──────────── registro del canje ─────────────────────────┤
```

---

## Cómo está construida la documentación

| Documento | Audiencia | Nivel de detalle |
|---|---|---|
| Manuales por rol | Usuarios finales | Práctico, sin jerga |
| Arquitectura | Desarrolladores | Explicativo, con `file:line` |
| Guía de desarrollo | Desarrolladores | Prescriptivo, con trampas |
| Plan del manual | Equipo redactor | Organizativo |

### Principios aplicados

- **Documentado lo que existe, no lo que debería existir.** Las limitaciones
  del sistema están explícitas en los manuales.
- **Advertencias visibles** en toda acción destructiva o irreversible.
- **Mensajes de error citados textualmente**, para que el usuario los pueda
  comparar con lo que ve en pantalla.
- **Voseo rioplatense** consistente en toda la documentación.
- **Referencias `file:line`** en la documentación técnica, para saltar
  directo al código.

---

## Convenciones de los archivos

| Convención | Uso |
|---|---|
| `01-`, `02-`… | Documentación técnica, en orden de lectura |
| `manual-*.md` | Manuales por rol |
| `PLAN-*.md` | Documentación en construcción o planes de trabajo |

---

## Mantenimiento

> **Regla de oro:** si cambiás algo en la aplicación, actualizá el manual en el
> mismo commit. Una documentación desactualizada es peor que ninguna.

Ver la sección
[§7 Mantenimiento](./PLAN-MANUAL-COMPLETO.md#7-mantenimiento) del plan para el
checklist completo de revisión y el formato del registro de cambios.

### Checklist rápido

- [ ] ¿Hay funcionalidad nueva sin documentar?
- [ ] ¿Hay funcionalidad vieja que ya no existe?
- [ ] ¿Cambió algún mensaje de error?
- [ ] ¿Cambió algún flujo de pantallas?
- [ ] ¿La matriz de roles sigue siendo cierta?
