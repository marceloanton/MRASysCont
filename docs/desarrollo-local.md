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

La UI muestra la fuente activa:

- `Demo local`: no hay conexion a PostgreSQL o aun no se sembraron datos.
- `PostgreSQL`: la app leyo usuarios, empresas y membresias desde la base.

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
