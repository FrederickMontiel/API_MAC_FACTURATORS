# Facturador API

API intermediaria para gestión de transacciones y servicios de facturación. Construida con NestJS, TypeORM y PostgreSQL.

## 🚀 Descripción

Este proyecto sirve como intermediario entre aplicaciones backend y servicios de facturación externos. Gestiona tokens, roles, secciones y permisos para controlar el acceso a diferentes servicios como:

- Transferencias en sistema Byte
- Pagos de servicios (EEGSA, etc.)
- Otras transacciones empresariales

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- pnpm
- PostgreSQL (v14 o superior)

## 🛠️ Instalación

1. Instalar dependencias:
```bash
pnpm install
```

2. Configurar variables de entorno:
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales de PostgreSQL
```

3. Crear la base de datos en PostgreSQL:
```sql
CREATE DATABASE facturador_db;
```

## 📦 Estructura del Proyecto

```
src/
├── entities/          # Entidades de TypeORM
│   ├── token.entity.ts
│   ├── role.entity.ts
│   ├── seccion.entity.ts
│   └── permiso.entity.ts
├── tokens/           # Módulo de Tokens
├── roles/            # Módulo de Roles
├── secciones/        # Módulo de Secciones
├── permisos/         # Módulo de Permisos
├── app.module.ts
└── main.ts
```

## 🔑 Características Principales

### Tabla de Tokens
- **ID único aleatorio**: Entre 100000 y 999999
- **Platform**: Identificador de la plataforma
- **JWT**: Token de autenticación
- **Timestamps**: created_at y updated_at automáticos

### Sistema de Permisos
- **Roles**: Grupos de permisos
- **Secciones**: Categorización de permisos
- **Permisos**: Control granular de acceso
- **Relaciones Many-to-Many**: Entre roles y permisos

## 🚀 Ejecución

### Modo Desarrollo
```bash
pnpm run start:dev
```

### Modo Producción
```bash
pnpm run build
pnpm run start:prod
```

## 📡 Endpoints Disponibles

### Tokens
- `POST /tokens` - Crear nuevo token (ID aleatorio automático)
- `GET /tokens` - Listar todos los tokens
- `GET /tokens/:id` - Obtener token por ID
- `GET /tokens/platform/:platform` - Obtener tokens por plataforma
- `PATCH /tokens/:id` - Actualizar token
- `DELETE /tokens/:id` - Eliminar token

### Roles
- `POST /roles` - Crear nuevo rol
- `GET /roles` - Listar todos los roles
- `GET /roles/:id` - Obtener rol con permisos
- `PATCH /roles/:id` - Actualizar rol
- `DELETE /roles/:id` - Eliminar rol

### Secciones
- `POST /secciones` - Crear nueva sección
- `GET /secciones` - Listar todas las secciones
- `GET /secciones/:id` - Obtener sección con permisos
- `PATCH /secciones/:id` - Actualizar sección
- `DELETE /secciones/:id` - Eliminar sección

### Permisos
- `POST /permisos` - Crear nuevo permiso
- `GET /permisos` - Listar todos los permisos
- `GET /permisos/:id` - Obtener permiso completo
- `GET /permisos/seccion/:seccionId` - Permisos por sección
- `PATCH /permisos/:id` - Actualizar permiso
- `DELETE /permisos/:id` - Eliminar permiso

## 🔐 Variables de Entorno

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=facturador_db

# Application
PORT=3000
NODE_ENV=development

# JWT (opcional)
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h
```

## 📝 Ejemplo de Uso

### Crear un Token
```bash
curl -X POST http://localhost:3000/tokens \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "byte-transfers",
    "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

Respuesta:
```json
{
  "id": 485932,
  "platform": "byte-transfers",
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "createdAt": "2025-11-17T12:00:00.000Z",
  "updatedAt": "2025-11-17T12:00:00.000Z"
}
```

## 🏗️ Tecnologías

- **NestJS**: Framework backend
- **TypeORM**: ORM para PostgreSQL
- **PostgreSQL**: Base de datos
- **class-validator**: Validación de DTOs
- **dotenv**: Variables de entorno

## 📄 Licencia

ISC
