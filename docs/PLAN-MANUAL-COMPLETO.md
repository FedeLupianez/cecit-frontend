# Plan para el Manual Completo

> **Este archivo es una plantilla de trabajo**, no documentación final.
> Define la estructura, el tono y el alcance del manual integral que se va a
> escribir más adelante. Sirve para no perder el hilo entre sesiones y para
> que varias personas puedan colaborar sin pisarse.
>
> Los tres manuales por rol ya escritos son la **base** desde la que se
> expande este documento.

---

## 1. Estado actual

| Documento | Estado | Rol |
|---|---|---|
| [`manual-usuario-socio.md`](./manual-usuario-socio.md) | ✅ Completo | Socio del CeCIT |
| [`manual-negocios.md`](./manual-negocios.md) | ✅ Completo | Administrador de comercio |
| [`manual-administradores-cecit.md`](./manual-administradores-cecit.md) | ✅ Completo | Administrador CeCIT |
| `MANUAL-COMPLETO.md` | ⬜ **Pendiente** | Integral, los tres roles |
| [`01-arquitectura-frontend.md`](./01-arquitectura-frontend.md) | ✅ Completo | Referencia técnica |
| [`02-guia-de-desarrollo.md`](./02-guia-de-desarrollo.md) | ✅ Completo | Referencia técnica |

### Qué falta para el manual completo

- [ ] Sección de **glosario** compartido (hoy el vocabulario está disperso)
- [ ] Sección de **primeros auxilios** troubleshooting por rol
- [ ] **Capturas de pantalla** embebidas
- [ ] Sección de **roles y permisos** (matriz explícita)
- [ ] **Flujos completos** de principio a fin con diagramas
- [ ] Sección de **preguntas frecuentes unificadas**
- [ ] **numeración de versión** y registro de cambios
- [ ] **Índice navegable** con anclas
- [ ] **Impresión / PDF** exportable

---

## 2. Objetivo del manual completo

Un único documento que permita que **cualquier persona del CeCIT resuelva su
problema sin asistencia**, cubriendo:

1. **Qué es la plataforma** y para qué existe.
2. **Qué puede hacer cada rol** y qué no.
3. **Cómo se hace cada tarea**, paso a paso.
4. **Qué hacer cuando algo falla.**
5. **A quién acudir** si no se resuelve.

### Criterio de calidad

Un manual completo está bien cuando **un tester que nunca vio la plataforma
puede completar las tareas comunes sin ayuda**. Probá ese criterio antes de dar el trabajo
por terminado.

---

## 3. Estructura propuesta

```text
MANUAL-COMPLETO.md
├── 0. Cómo usar este manual
├── 1. Conoce CeCIT Beneficios
│   ├── 1.1 Qué es
│   ├── 1.2 Objetivos
│   ├── 1.3 Roles y permisos
│   └── 1.4 Glosario
├── 2. Primeros pasos (todos los roles)
│   ├── 2.1 Acceder
│   ├── 2.2 Orientarse: la barra superior
│   └── 2.3 Tu perfil
├── 3. Socio — usar beneficios
│   └── (módulo de manual-usuario-socio.md)
├── 4. Administrador de comercio — atender el mostrador
│   └── (módulo de manual-negocios.md)
├── 5. Administrador CeCIT — operar la plataforma
│   └── (módulo de manual-administradores-cecit.md)
├── 6. Guía de problemas frecuentes
│   ├── 6.1 No puedo entrar
│   ├── 6.2 No veo un beneficio
│   ├── 6.3 No puedo adquirir un cupón
│   ├── 6.4 El token no funciona
│   ├── 6.5 Problemas de cuenta
│   └── 6.6 Problemas técnicos
├── 7. Referencia rápida
│   ├── 7.1 Atajos y atajos de teclado
│   ├── 7.2 Estados y sus colores
│   └── 7.3 Contactos
└── 8. Registro de cambios
```

> Marcá los pendientes a medida que avancés. Los archivos con caracteres
> con caracteres sustituidos deben corregirse antes de publicar.

---

## 4. Contenido pendiente en detalle

### 4.1 Glosario

Vocabulario que hoy está disperso por los tres manuales. Candidatos:

| Término | Significado | Dónde se usa |
|---|---|---|
| Socio | Persona adherida al CeCIT con cuenta en la plataforma | Todos |
| Beneficio | Promoción, descuento o cortesía disponible | Todos |
| Cupón / Voucher | Código generado al adquirir un beneficio | Todos |
| **Token** | Código de 6 caracteres que identifica un cupón | Socios, comercios |
| Comercio adherido | Negocio que ofrece beneficios | Comercios, admin |
| Tope de reintegro | Monto máximo de un descuento | Socios, admin |
| Cupones por usuario | Máximo de cupones que puede pedir cada socio | Admin |
| Beneficio activo / inactivo / pendiente | Estado de publicación | Admin |
| Sucursal / Ubicación | Dirección donde aplica el beneficio | Comercios, admin |
| Estado del cupón | Pendiente / Canjeado / Expirado / Rechazado | Todos |
| Categoría | Agrupación de beneficios (restaurantes, moda…) | Socios, admin |

### 4.2 Matriz de roles y permisos

La fuente de verdad actual es
[`src/lib/access/roleAccess.ts`](../src/lib/access/roleAccess.ts). El manual
debería incluir una tabla legible de **capacidades × roles**:

| Capacidad | Socio | Admin comercio | Admin CeCIT |
|---|---|---|---|
| Ver beneficios | ✅ | ✅ | ✅ |
| Adquirir cupones | ✅ | ✅ | ✅ |
| Ver historial propio | ✅ | ✅ | ✅ |
| Canjear cupones | ❌ | ✅ | ✅ |
| Ver panel de negocio | ❌ | ✅ | ❌ |
| Ver quién canjeó | ❌ | ✅ | ✅ |
| Administrar empleados | ❌ | ✅ | ❌ |
| Crear beneficios | ❌ | ❌ | ✅ |
| Administrar socios | ❌ | ❌ | ✅ |
| Administrar comercios | ❌ | ❌ | ✅ |
| Crear vouchers | ❌ | ❌ | ✅ |
| Moderar categorías | ❌ | ❌ | ✅ |

> ⚠️ Recordá que esta tabla describe la **interfaz**. La autorización real la
> aplica el backend: ver
> [01-arquitectura-frontend.md §5.5](./01-arquitectura-frontend.md).

### 4.3 Diagramas de flujo

Para las tres tareas más críticas:

**Adquirir un cupón (socio)**

```text
Buscar beneficio → Abrir detalle → "Adquirir Cupón" → Generar → PDF baja solo → Ir al comercio
```

**Canjear en el mostrador (comercio)**

```text
Socio entrega token → escribo token → verifico datos → ¿corresponde?
   ├─ Sí → Canjear → entrego beneficio
   └─ No → Rechazo (vencido / otro negocio / no corresponde)
```

**Crear un beneficio (admin CeCIT)**

```text
Datos básicos → Imagen → Tipo → Período → Métodos de pago → Límites → Publicar
```

### 4.4 Troubleshooting

Convertir los mensajes de error reales de la aplicación en una sección
dedicada. Fuente: [API §6.3](./01-arquitectura-frontend.md) y los `toast.error`
dispersos en el código.

| Síntoma | Causas probables | Qué probar |
|---|---|---|
| "Credenciales Inválidas" | Contraseña mal escrita, teclado en español | Verificar teclado y capitals |
| Te saca al login solo | Refresh falló | Reingresar; si persiste, ver cookie bloqueada |
| "No tenés permiso para…" | Rol incorrecto | Verificar rol en panel admin |
| "Este voucher pertenece a otro negocio" | Token de otro comercio | Verificar con el socio |
| "Alcanzaste el máximo de cupones" | Límite por usuario | Elegir otro beneficio |
| El beneficio no aparece | Fecha futura, inactivo o sin categoría | Revisar estado y fechas |
| El PDF no baja | Permiso de descargas del navegador | Autorizar descargas |
| La página queda en "Cargando perfil..." | Backend caído | Verificar `BACKEND_URL` |

### 4.5 Capturas de pantalla

Pendiente. Recomendaciones:

- Capturar en **escritorio (1440×900)** y **móvil (390×844)**.
- Anotar con **números y flechas** los elementos clave.
- Usar un **fondo gris** en las partes irrelevantes.
- Guardar en `docs/img/` con nombre descriptivo:
  `login-form.png`, `beneficio-modal.png`, `canjear-cupon.png`.
- Referenciarlas desde los manuales por rol.

### 4.6 Referencia rápida

- **Atajos de teclado**: Enter para buscar y confirmar, `Esc` para cerrar
  modales y menús.
- **Colores de estado**: verde = vigente/canjeado, rojo = vencido/expirado,
  naranja = rechazado, gris = inactivo.
- **Contactos**: CeCIT (España 147, Alta Gracia, Tel. 03547 3547446368),
  developers del Instituto Manuel Falla.

---

## 5. Directrices de escritura

### 5.1 Tono

- **Voseo rioplatense**: "vos", "hacé clic", "ingresá".
- Español de Argentina, sin regionalismos innecesarios.
- Segunda persona del singular para las instrucciones ("hacé", "escribí").
- Impersonar al grupo cuando aplique: "los administradores pueden…".

### 5.2 Estructura

- **Titulares imperativos** en procedimientos: "Cómo cambiar tu contraseña", no
  "Cambio de contraseña".
- **Listas numeradas** para procedimientos ordenados.
- **Tablas** para datos de referencia y comparaciones.
- **Advertencias** con `⚠️` para acciones destructivas.
- **Consejos** con `💡` para buenas prácticas.

### 5.3 Reglas de contenido

- **No inventar comportamiento.** Si una funcionalidad no existe, documentar
  la limitación explícitamente en lugar de omitirla.
- **Toda acción destructiva** lleva advertencia visible.
- **Toda limitación del sistema** se documenta (ej: "no se puede subir
  archivos, se pega una URL").
- **Los mensajes de error** se citan textualmente, entre comillas.
- **Sin jerga técnica** en los manuales por rol; sí en la documentación
  técnica.

### 5.4 Formato

- Markdown, con ATX headers (`#`).
- Archivos en UTF-8.
- Imágenes relativas: `![alt](./img/nombre.png)`.
- Enlaces internos relativos: `./nombre-archivo.md`.
- Saltos de línea `\n` en Windows y `\n` en Unix.

---

## 6. Plan de trabajo

### Fase 1 — Consolidar (hecha)

- [x] Manual de socios
- [x] Manual de negocios
- [x] Manual de administradores CeCIT
- [x] Documentación técnica del frontend

### Fase 2 — Unificar

- [ ] Extraer glosario compartido
- [ ] Construir matriz de roles y permisos
- [ ] Diagramas de flujo (los 3 críticos)
- [ ] Sección de troubleshooting unificada
- [ ] Sección de contactos

### Fase 3 — Enriquecer

- [ ] Capturas de pantalla
- [ ] Referencias a capturas en los tres manuales
- [ ] Índice con anclas
- [ ] Numeración de versión

### Fase 4 — Publicar

- [ ] Exportar a PDF
- [ ] Revisión de estilo con el equipo del CeCIT
- [ ] Prueba con un usuario real (criterio de §2)
- [ ] Publicación en el sitio del CeCIT
- [ ] Archivo con el equipo del Instituto Manuel Falla

---

## 7. Mantenimiento

### Regla de oro

> **Si cambiás algo en la aplicación, actualizá el manual en el mismo commit.**

Una documentación desactualizada es peor que ninguna: genera desconfianza y
llamadas de soporte.

### Checklist de revisión

Antes de cada release:

- [ ] ¿Hay funcionalidad nueva sin documentar?
- [ ] ¿Hay funcionalidad vieja que ya no existe?
- [ ] ¿Cambió algún mensaje de error?
- [ ] ¿Cambió algún flujo de pantallas?
- [ ] ¿Las capturas siguen reflejando la interfaz?
- [ ] ¿La matriz de roles sigue siendo cierta?

### Registro de cambios

Cada versión del manual debe registrar:

```markdown
## v1.1.0 — 2026-XX-XX

### Agregado
- Nueva sección: gestión de empleados en panel de negocio.

### Modificado
- El panel de negocio ahora muestra métricas calculadas en vivo.

### Corregido
- El token se describía como 5 caracteres; son 6.
```

Usar [SemVer](https://semver.org/lang/es/): `MAJOR` para cambios que rompen
compatibilidad, `MINOR` para funcionalidad nueva, `PATCH` para correcciones.

---

## 8. Preguntas abiertas

Resolver antes de escribir la Fase 2:

1. **¿El manual se publica en el sitio web del CeCIT** o se entrega en PDF?
   Depende de si hay dónde alojarlo y de si los socios acceden con email o sin
   cuenta.
2. **¿SeDOCUMENTAN también los problemas técnicos** (backend caído) o se
   derivan directamente al equipo de desarrollo?
3. **¿Habrá un canal de soporte definido?** Hoy la documentación sugiere
   contactar al CeCIT, pero no define un canal concreto.
4. **¿Se incluirán las métricas y estadísticas** cuando se desarrollen?
   [`create-benefit`](./01-arquitectura-frontend.md) hoy muestra números fijos
   que no son reales.
5. **¿Quién es el dueño editorial** del manual? Idealmente una persona del
   CeCIT que valide el contenido de negocio.
6. **¿Habrá versión por campaña?** Los beneficios cambian por estación; quizá
   un manual evergreen con ejemplos de temporada.

---

## 9. Recursos relacionados

- [`manual-usuario-socio.md`](./manual-usuario-socio.md) — base del módulo 3
- [`manual-negocios.md`](./manual-negocios.md) — base del módulo 4
- [`manual-administradores-cecit.md`](./manual-administradores-cecit.md) — base
  del módulo 5
- [`01-arquitectura-frontend.md`](./01-arquitectura-frontend.md) — fuente de
  verdad técnica
- [`02-guia-de-desarrollo.md`](./02-guia-de-desarrollo.md) — para el equipo
  técnico
