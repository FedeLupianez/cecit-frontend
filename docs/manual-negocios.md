# Manual de Administrador de Negocios

> Guía para **comercios adheridos al CeCIT** que administran su cuenta en la
> plataforma de beneficios.
>
> Si sos socio que solo quiere usar beneficios, consultá el
> [Manual de Socio](./manual-usuario-socio.md). Si sos parte del equipo del
> CeCIT, el manual es el
> [Manual de Administradores CeCIT](./manual-administradores-cecit.md).

---

## 1. ¿Qué cambia respecto a un socio común?

Tu cuenta de administrador de negocio tiene **todo lo que tiene un socio**, y
además:

| Capacidad | Dónde |
|---|---|
| **Canjear cupones** de tus clientes en el mostrador | `Canjear Cupón` |
| **Ver estadísticas** de tus beneficios | `Panel de negocio` |
| **Administrar tu perfil de comercio** (nombre, logo, sucursales) | `Panel de negocio` |
| **Gestionar tu equipo** de empleados | `Panel de negocio` |
| **Ver quién canjeó** cada beneficio | `Panel de negocio` → `Detalles` |

> 💡 **No creás beneficios.** El alta de beneficios la hace el equipo del
> CeCIT. Vos los recibís, los ves y los canjeás.

---

## 2. Acceso al panel

### 2.1 Entrar

1. Iniciá sesión con tu correo y contraseña.
2. Hacé clic en tu **avatar** (esquina superior derecha).
3. Hacé clic en **"Panel de negocio"**.

Tu menú debería verse así:

```text
┌─────────────────────────────┐
│ Canjear Cupón               │
│ Panel de negocio            │
│ Historial                   │
│ Configuración               │
│ ─────────────────────────── │
│ 🔴 Cerrar sesión            │
└─────────────────────────────┘
```

### 2.2 Si no te aparece "Panel de negocio"

- Verificá que tu cuenta tenga el rol de **administrador de comercio**.
- Si tu comercio tiene varios administradores, cada uno tiene su propio acceso.
- Contactá al CeCIT para que revisen tu habilitación.

### 2.3 Si abrís el panel y no tenés negocios

Aparece el mensaje **"No tenés negocios asociados."**. Significa que tu cuenta
existe pero todavía no le asignaron un comercio. Contactá al CeCIT.

---

## 3. Tu primer día: la pantalla "Canjear Cupón"

Esta es la pantalla que vas a usar **en el mostrador, todas las días**.

### 3.1 Cómo funciona

Cada vez que un socio pide un beneficio en tu comercio, vos recibís un
**token de 6 caracteres**. Lo escribís acá, el sistema te muestra los datos del
cupón, y vos decidís si lo aceptás o no.

```text
Socio te muestra su cupón
          ↓
Vos escribís el token de 6 caracteres
          ↓
El sistema te muestra: beneficio, vencimiento, quién lo pidió
          ↓
Canjear  =  entregar el beneficio
Rechazar =  no se lo entregás
```

### 3.2 Buscar un cupón

1. Escribí el **token de 6 caracteres** en el campo de búsqueda.
2. Presioná **Enter** o hacé clic en **"Buscar"**.

Los caracteres se ven en mayúsculas y bien separados, como un boleto de cine.

### 3.3 La pantalla del cupón encontrado

Si el token es válido, aparece una tarjeta con:

| Dato | Para qué lo necesitás |
|---|---|
| **Beneficio** | Qué promoción es la que te piden |
| **Comercio** | Confirmación de que es tuyo |
| **Socio** | Nombre del cliente que lo trae |
| **DNI del socio** | Para verificar su identidad si hace falta |
| **Válido hasta** | La fecha límite del cupón |
| **Métodos de pago** | Con qué medios se puede aplicar |
| **Ubicación** | A qué dirección del negocio corresponde |

> ⚠️ **Siempre verificá el nombre del socio contra su documento.** Es la
> forma de confirmar que el cupón no lo está usando otra persona.

### 3.4 Canjear el cupón

1. Confirmá que todo esté correcto.
2. Hacé clic en **"Canjear"**.
3. La pantalla confirma la operación y el cupón queda registrado como usado.

**Los botones se desactivan una vez que hacés una de las dos acciones.** Una
vez canjeado o rechazado, el cupón no se puede volver a tocar desde esta
pantalla.

### 3.5 Rechazar un cupón

Hacé clic en **"Rechazar"** cuando el cupón:

- Está vencido.
- No corresponde a tu comercio.
- El socio no puede aprovechar la promoción (no cumple los requisitos).
- Tenés dudas sobre su validez.

### 3.6 Empezar de nuevo

Hacé clic en **"Quitar"** para limpiar la pantalla y buscar otro token.

### 3.7 Mensajes de error

| Mensaje | Qué pasó | Qué hacer |
|---|---|---|
| "Ingresá el token del voucher." | Campo vacío | Escribí el token |
| "No se encontró ningún voucher con ese token." | El código no existe | Verificá los 6 caracteres con el socio |
| "Tu sesión expiró. Volvé a iniciar sesión." | Sesión vencida | Volvé a iniciar sesión |
| "No tenés permiso para canjear beneficios." | Tu cuenta no habilitada | Contactá al CeCIT |
| "Este voucher pertenece a otro negocio. No tenés acceso para canjearlo." | El cupón es de otro comercio | No lo atiendas; que el socio use su comercio |

> 💡 **Consejo de mostrador:** anotá siempre el token antes de escribirlo. Si
> el socio no tiene el PDF a mano, el token escrito sirve igual.

---

## 4. Panel de negocio

Entrá por **"Panel de negocio"** en tu menú. Es tu consola de administración.

### 4.1 Métricas de resumen

Arriba de todo ves tres números:

| Métrica | Qué te dice |
|---|---|
| **Cupones utilizados** | Total de cupones pedidos en todos tus beneficios |
| **Canjes** | Total de cupones efectivamente canjeados |
| **Beneficios activos** | Cuántos de tus beneficios están vigentes |

> 💡 Estos números son **en vivo**: se calculan con los datos que hay en este
> momento, no con un informe histórico acumulado.

### 4.2 Si tenés más de un negocio

Cuando sos administrador de **varios comercios**, arriba aparece un selector
con el logo y el nombre de cada uno.

- Hacé clic en la pestaña del negocio que quieras administrar.
- Todo el contenido de abajo cambia al negocio seleccionado.
- **Ojo:** si editás el nombre o el logo y después cambiás de negocio, los
  cambios ya quedaron guardados. No hay un botón de "descartar".

### 4.3 Tarjeta de tu comercio

Es el primer bloque del panel.

| Campo | Cómo se edita |
|---|---|
| **Logo** | Clic en el ícono de lápiz → pegá la URL de la nueva imagen → **Guardar** |
| **Nombre** | Clic en el ícono de lápiz → escribí el nombre → **Guardar** |

> ⚠️ **Sobre el logo:** el sistema **no sube archivos**. Pegá una **dirección
> web (URL)** de una imagen. Ejemplo: `https://mi-negocio.com/logo.png`.
> Podés probarlo con un servicio de imágenes gratuito.
>
> También podés pedirle al CeCIT que suba tu logo si no tenés dónde alojarlo.

> 💡 Si escribís un nombre idéntico al que ya tenías, el sistema no hace nada y
> cierra el editor sin avisar. Es normal.

---

## 5. Ubicaciones (sucursales)

Este bloque administra las **direcciones** donde se puede usar el beneficio.

### 5.1 Ver tus ubicaciones

Aparecen listadas con el ícono de ubicación.

### 5.2 Agregar una ubicación

1. Escribí la dirección en el campo de texto.
2. Hacé clic en **"Agregar"**.

> 💡 **Separá múltiples direcciones con comas.** Por ejemplo:
> `Av. España 123, Alta Gracia` agrega **dos** ubicaciones.
>
> 📌 Cada ubicación aparece como un punto en el mapa dentro de la ficha del
> beneficio, así que escribilas completas y con el número exacto.

### 5.3 Eliminar una ubicación

Hacé clic en la **X** (🗑) junto a la dirección que querés borrar.

> ⚠️ Esta acción **no se puede deshacer**. Revisá antes de confirmar.

---

## 6. Empleados

Este bloque administra **quién puede administrar tu negocio** y quién figura
como empleado.

### 6.1 Ver la lista

Tu equipo aparece con nombre, apellido, DNI y rol. Hay un botón
**"Recargar"** para actualizar la lista manualmente.

### 6.2 Agregar un empleado

1. Escribí el **DNI** del empleado en el campo de texto.
2. Hacé clic en **"Agregar"**.

> ⚠️ **El DNI es la clave.** Si el empleado no figura en la base de socios del
> CeCIT, el sistema **no lo va a poder agregar**. Verificá que esté dado de alta
> como socio antes.

> 💡 Si el empleado aparece sin correo electrónico, es que **todavía no tiene
> cuenta creada en la plataforma**. Podés agregarlo a tu lista, pero no vas a
> poder darle permisos de administrador hasta que tenga su cuenta.

### 6.3 Dar permisos de administrador a un empleado

Si el empleado **tiene cuenta con correo electrónico**, aparece el botón
**"Hacer admin"**.

1. Hacé clic en **"Hacer admin"**.
2. Confirmá la operación.

A partir de ahí, ese empleado puede:
- Entrar al panel del negocio.
- Canjear cupones.
- Administrar sucursales y empleados.

Se le asigna una insignia **"Admin"** al lado de su nombre.

> ⚠️ **Solo los empleados con cuenta pueden ser administradores.** Los que
> están sin correo no pueden recibir el rol.

### 6.4 Quitar permisos de administrador

1. Hacé clic en **"Quitar admin"**.
2. Confirmá.

La persona sigue en tu lista de empleados, pero vuelve a ser un usuario común.

### 6.5 Eliminar un empleado

Hacé clic en la **X** junto a su fila.

> ⚠️ Esta acción **no se puede deshacer**. El empleado deja de formar parte de
> tu negocio.

---

## 7. Tus beneficios ("Tus Cupones")

Este bloque lista todos los beneficios que el CeCIT creó para tu comercio.

Cada tarjeta muestra:

| Dato | Qué significa |
|---|---|
| **Cupones** | `X / Y` — cuántos se pidieron sobre el total disponible |
| **Barra de progreso** | Cuánta demanda tiene tu beneficio |
| **Botón "Detalles"** | Abre la ficha completa del beneficio |

> ⚠️ **Los beneficios los crea el CeCIT, no vos.** Si necesitás un beneficio
> nuevo, un cambio o una renovación, pedilo al CeCIT.

### 7.1 Ver los detalles de un beneficio

Hacé clic en **"Detalles"**. Se abre una ficha con:

#### Información general

| Campo | Contenido |
|---|---|
| **Estado** | Activo / Inactivo / Pendiente |
| **Tipo** | Descuento, promotional, cortesía, etc. |
| **Categorías** | En qué categorías aparece el beneficio |
| **Vigencia** | Desde y hasta qué fecha |
| **Métodos de pago** | Medios de pago admitidos |
| **Cupones por usuario** | Máximo que puede pedir cada socio |
| **Límite de reintegro** | Tope máximo del descuento |
| **Direcciones** | Todas tus sucursales donde aplica |

#### Contador

`Cupones / Cupones máximos` — el stock restante.

#### Tabla de canjes

Debajo está la tabla con **quién canjeó** tu beneficio:

| Columna | Qué muestra |
|---|---|
| **Usuario** | Nombre y apellido del socio |
| **DNI** | Documento del socio |
| **Solicitado** | Fecha en que pidió el cupón |
| **Entregado** | Fecha en que lo canjeó (vacío si no lo canjeó) |
| **Vence** | Fecha límite del cupón |
| **Token** | El código del cupón |
| **Estado** | Pendiente / Canjeado / Expirado / Rechazado |

> 💡 La columna **"Entregado"** aparece vacía mientras el cupón siga
> pendiente. Es la forma rápida de distinguir "lo pidió pero no lo usó" de
> "ya lo usó".

#### Filtros de la tabla

- **Botones de estado** con la cantidad de cada uno:
  `Todos (12) · Pendiente (4) · Canjeado (6) · Expirado (1) · Rechazado (1)`
- **Cuadro de búsqueda** para filtrar por nombre, apellido, DNI, correo o
  token.

> 💡 Sirve mucho para responder "¿quién pidió esto?" o para auditar un canje
> puntual.

---

## 8. Preguntas frecuentes

### ¿Puedo tener más de un negocio?

Sí, si sos administrador de varios comercios, el selector de pestañas te
permite alternar entre ellos.

### ¿Quién puede ser administrador de mi negocio?

Cualquier empleado tuyo que tenga **cuenta creada en la plataforma** (con correo
electrónico). Vos lo designás desde el bloque **Empleados**.

### ¿Qué pasa si un socio pierde su sesión?

No necesita tener cuenta abierta. Vos podés canjear el cupón con el **token**
que él te muestre. Ese es el motivo por el que el token es la referencia real
del canje.

### ¿Y si el socio no tiene el PDF a mano?

No importa: el token es el mismo. Anotalo y escribilo en `Canjear Cupón`.

### ¿Puedo ver los datos personales de un socio?

Sí: nombre, apellido y DNI, y también el correo si el socio tiene cuenta. Son
datos que el socio deja para poder canjear. Cuidalos y no los compartas fuera de
tu comercio.

### ¿Un socio puede usar el beneficio en todas mis sucursales?

Eso depende de cómo el CeCIT configuró el beneficio. En la ficha del beneficio
(§7.1) aparecen todas las direcciones en las que aplica.

### ¿Qué pasa si rechazo un cupón por error?

El cupón queda registrado como **rechazado** y ya no se puede recuperar desde
la pantalla de canje. Contactá al CeCIT para evaluar una reversión.

### ¿Puedo crear beneficios yo?

No. Los beneficios los crea el equipo del CeCIT. Pediles tus beneficios a
través del CeCIT.

### ¿Cómo cambio el logo de mi negocio?

Necesitás una **URL** de una imagen (no se sube archivo). Pegala en el editor
del logo y guardá. Pedile ayuda al CeCIT si no tenés dónde alojar la imagen.

### ¿Dónde veo el historial de cupones que YO pedí?

En **"Historial"** de tu menú. Es distinto de la tabla de la §7.1: ahí están
los cupones que vos como socio pediste para advantageous vos mismo, no los de
tus clientes.

---

## 9. Contacto

| Necesitás | Contactá a |
|---|---|
| Crear o ampliar beneficios | CeCIT |
| Habilitar el rol de administrador | CeCIT |
| Resolver un canje mal hecho | CeCIT |
| Problemas técnicos de la plataforma | CeCIT |
| Cargar tu logo | CeCIT |

**CeCIT — Centro de Comercio, Industria y Turismo de Alta Gracia**
España 147, Alta Gracia, Córdoba, Argentina
Tel. (03547) 3547446368
<http://centrodecomercioag.com.ar/>
