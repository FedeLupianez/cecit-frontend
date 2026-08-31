# CeCIT Beneficios

Sistema de gestión de beneficios para los socios del **Centro de Comercio, Industria y Turismo de Alta Gracia (CeCIT)**.

## 📖 Descripción

Esta aplicación permite a los socios adheridos al CeCIT acceder a beneficios exclusivos ofrecidos por los comercios asociados.

El objetivo del sistema es fortalecer la red comercial local, facilitando la administración, consulta y utilización de promociones, descuentos y otros beneficios disponibles para los miembros de la institución.

## ✨ Características

- Autenticación de socios.
- Consulta de beneficios disponibles.
- Visualización de comercios adheridos.
- Gestión de promociones y descuentos.
- Administración de socios.
- Panel de administración para la gestión de beneficios.
- Historial de beneficios utilizados (opcional).
- Diseño responsive para dispositivos móviles.

## 👥 Tipos de usuarios

### Socios
- Iniciar sesión.
- Consultar beneficios vigentes.
- Utilizar promociones disponibles.
- Obtener Cupones de los beneficios vigentes.

### Administradores de Negocios
- Tienen todas las capacidades de un Socio.
- Crear, modificar y eliminar beneficios.
- Consultar estadísticas de uso.
- Gestionar el perfil del negocio.

## 🚀 Tecnologías

- Frontend: Svelte
- Backend: NestJS.
- ORM: TypeORM.
- Base de datos: MySQL.
- Autenticación: JWT.


## 📂 Estructura del proyecto

```text
src
├── auth
├── common
├── entities
│   ├── accounts
│   ├── benefits
│   ├── benefit-types
│   ├── categories
│   ├── partners
│   ├── partnersadmins
│   ├── partners_categories
│   ├── payment_benefit
│   ├── payment-methods
│   ├── refresh-token.entity.ts
│   ├── users
│   └── vouchers
├── pdf
    └── pdf.service.ts
└── ssh
    ├── ssh-tunnel.module.ts
    └── ssh-tunnel.service.ts
```

## 📌 Objetivo

Promover el comercio local mediante una plataforma digital que conecte a los socios del CeCIT con los beneficios ofrecidos por los comercios adheridos, simplificando su administración y utilización.

## Instalación

### Requisitos
- bun >= 1.3.14
- node >= v26.7.0
- git

### Clonar repositorio
```bash
    git clone https://github.com/FedeLupianez/cecit-frontend
    cd cecit-backend
```

### Instalar dependencias
¡Tener en cuenta la rama en la que se está trabajando!
```bash
    bun install
```
o
```bash
    npm install
```

## Correr el Proyecto
```bash
    bun run dev
```
o
```bash
    npm run dev
```

## 🧪 Modo desarrollo sin autenticación

Para probar la página sin tener que iniciar sesión (ni tener el backend corriendo), se puede
desactivar la autenticación mediante variables de entorno:

```bash
    AUTH_DISABLED=true bun run dev
```

o configurarlas en el archivo `.env` (ver `.env.example`):

```dotenv
AUTH_DISABLED=true
DEV_USER_ROLE=USER
```

- `AUTH_DISABLED=true`: saltea el login y las llamadas de autenticación al backend, usando un perfil de prueba.
- `DEV_USER_ROLE`: rol del perfil de prueba para probar las distintas vistas (`USER`, `CECIT_ADMIN` o `PARTNER_ADMIN`).

⚠️ Nunca activarlo en producción.

## 🔒 Seguridad

- Autenticación mediante JWT.
- Control de acceso por roles.
- Protección de rutas privadas.
- Validación de datos de entrada.

## 📈 Futuras mejoras

- Integración con QR para validar beneficios.
- Estadísticas avanzadas.

## 📄 Licencia

Este proyecto fue desarrollado para el **Centro de Comercio, Industria y Turismo de Alta Gracia (CeCIT)** por alumnos de la especialidad de programación del **Instituto Manuel de Falla**.
