# Solicitudes de creación de beneficios — contrato de API

Estado: **solo frontend implementado**. Los endpoints que se describen abajo
**todavía no existen** en `cecit-backend` y hay que agregarlos para que la
funcionalidad funcione end-to-end.

## Flujo

1. Un `PARTNER_ADMIN` entra a `/create-benefit` y envía una propuesta.
2. El backend la persiste con `status = PENDING`.
3. Un `CECIT_ADMIN` entra a `/benefit-requests`, puede **editar**, **aceptar**
   o **rechazar** cada solicitud.
4. Aceptar deja el beneficio `ACTIVE`; rechazar lo deja `REJECTED` (visible
   para el CECIT_ADMIN, pero no publicable).

## Cambios necesarios en `cecit-backend`

### `src/entities/benefits/benefits.entity.ts`

Agregar `REJECTED` al enum de estados:

```ts
export enum BenefitStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}
```

Como la columna es `enum` en MySQL, hace falta la migración que agregue el
valor (`ALTER TABLE Benefits MODIFY status ENUM(...)`).

### `POST /benefits` → permitir `PARTNER_ADMIN`

Hoy está bloqueado por `CecitAdminGuard`. Hay que aceptar también
`AdminGuard` y, cuando el rol es `PARTNER_ADMIN`, forzar:

- `status = PENDING` (el body no debe poder elegir el estado),
- `id_partner` debe pertenecer a los negocios del solicitante
  (`PartnersAdmins`), si no, `403`.

En el frontend este caso usa `POST /benefits/requests` (ver abajo), que es la
alternativa recomendada porque separa el flujo de revisión del de publicación
directa.

### Endpoints nuevos esperados por el frontend

| Método | Ruta | Body | Guards | Devuelve |
| --- | --- | --- | --- | --- |
| `POST` | `/benefits/requests` | `BenefitsCreateDTO` | `jwt` + `AdminGuard` | `201` con la fila creada en `PENDING` |
| `GET` | `/benefits/requests` | — | `jwt` + `CecitAdminGuard` | `BenefitsReturn[]` |
| `PATCH` | `/benefits/requests/accept` | `{ id_benefit }` | `jwt` + `CecitAdminGuard` | la fila actualizada (`ACTIVE`) |
| `PATCH` | `/benefits/requests/reject` | `{ id_benefit }` | `jwt` + `CecitAdminGuard` | la fila actualizada (`REJECTED`) |
| `PATCH` | `/benefits/requests/:id_benefit` | `BenefitsUpdateDTO` parcial | `jwt` + `CecitAdminGuard` | la fila actualizada |

`GET /benefits/requests` debería devolver también las solicitudes ya resueltas
(`ACTIVE` / `REJECTED`), porque la página muestra contadores por estado y deja
editar las `PENDING`.

Las fechas viajan y vuelven en el formato `"YYYY-MM-DD HH:mm:ss"` que ya usa
`benefits.entity.ts`; el frontend convierte a `YYYY-MM-DDTHH:mm` para los
`<input type="datetime-local">` y de vuelta al hacer el PATCH.

## Notas

- El frontend nunca confía en el `id_partner` que envía el comercio: la
  validación de que le pertenece al solicitante tiene que hacerla el backend.
- El guard de rol del frontend (`$effect` con `profileStore`) es solo
  cosmetics; la autorización real es del backend.