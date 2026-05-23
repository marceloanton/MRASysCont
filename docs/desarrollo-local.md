# Desarrollo Local

## Objetivo

Definir como levantar MRASysCont en una maquina de desarrollo y como pasar del modo demo local a persistencia real en PostgreSQL.

## Requisitos

- Node.js 22 o superior.
- npm 11 o superior.
- Docker Desktop si se quiere levantar PostgreSQL con `docker-compose.yml`.

## Instalacion

```bash
npm install
```

## Variables de entorno

Crear `.env` local usando `.env.example` como referencia.

Valor recomendado para desarrollo:

```env
DATABASE_URL="postgresql://mrasyscont:mrasyscont@localhost:5432/mrasyscont?schema=public"
```

## Modo demo local

Si PostgreSQL no esta disponible, la pantalla inicial sigue funcionando con datos demo locales.

Entrar por:

```text
http://127.0.0.1:3000/login
```

En desarrollo, usar los botones de `Modo demo local`.

La UI muestra la fuente activa:

- `Demo local`: no hay conexion a PostgreSQL o aun no se sembraron datos.
- `PostgreSQL`: la app leyo usuarios, empresas y membresias desde la base.

En modo demo local los listados administrativos funcionan con datos de ejemplo. Las altas de empresas y usuarios requieren PostgreSQL para persistir cambios.

Tambien funcionan en modo demo local:

- `/contabilidad/cuentas`
- `/contabilidad/periodos`

Las altas de cuentas y periodos requieren PostgreSQL para persistir cambios.

## PostgreSQL con Docker

Cuando Docker este instalado:

```bash
npm run db:up
npm run db:migrate
npm run db:seed
```

Luego iniciar la app:

```bash
npm run dev
```

Usuario seed:

```text
contador@mrasyscont.local
```

Contrasena seed por defecto:

```text
MraSysCont2026!
```

La contrasena puede cambiarse con `SEED_USER_PASSWORD` antes de ejecutar `npm run db:seed`.

## Validaciones

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run prisma:validate
```

## Notas

- No versionar `.env`.
- No versionar `.next/`, `node_modules/` ni logs.
- Las migraciones viven en `prisma/migrations/`.
- El seed inicial vive en `prisma/seed.ts`.
