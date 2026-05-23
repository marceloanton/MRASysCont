# MRASysCont

MRASysCont sera un sistema contable web multi-empresa para estudios contables. El contador opera como usuario central del sistema, administra multiples empresas cliente desde una sola plataforma y mantiene los datos de cada empresa aislados.

## Objetivo

Construir una plataforma SaaS para:

- Administrar empresas cliente como tenants independientes.
- Llevar contabilidad formal con plan de cuentas, asientos, libros y cierres.
- Emitir facturacion electronica ARCA/AFIP por empresa.
- Operar en ARS como moneda base y registrar operaciones en USD.
- Dar acceso de lectura a clientes y permitir subida de documentos para revision.
- Mantener auditoria, seguridad, backups y trazabilidad desde el primer dia.

## Stack recomendado

- Frontend: Next.js o React moderno.
- Backend: API web con permisos centralizados y validacion obligatoria de empresa activa.
- Base de datos: PostgreSQL.
- Infraestructura: Cloud/VPS con ambientes local, staging y produccion.
- Procesos asincronicos: cola de trabajos para ARCA/AFIP, reportes, backups y tareas programadas.
- Almacenamiento: documentos privados por empresa y certificados fiscales cifrados.

## Estado del proyecto

Estado actual: Fase 2 inicial. Ya existe documentacion, scaffold tecnico, login, sesiones preparadas para PostgreSQL, modo demo local, selector de empresa, permisos por tenant, auditoria local, pantallas administrativas de empresas/usuarios, plan de cuentas, periodos contables, asientos borrador con partida doble, confirmacion de asientos y anulacion por contraasiento.

La documentacion en `docs/` es la fuente oficial para alcance, arquitectura, reglas contables, seguridad, roadmap y criterios de aceptacion.

## Documentos principales

- [Producto](docs/producto.md)
- [Arquitectura](docs/arquitectura.md)
- [Modelo de datos](docs/modelo-datos.md)
- [Seguridad y auditoria](docs/seguridad-y-auditoria.md)
- [Contabilidad](docs/contabilidad.md)
- [Facturacion ARCA/AFIP](docs/facturacion-arca-afip.md)
- [Multimoneda](docs/multimoneda.md)
- [Portal cliente](docs/portal-cliente.md)
- [Roadmap](docs/roadmap.md)
- [Desarrollo local](docs/desarrollo-local.md)
- [Preguntas para el contador](docs/preguntas-contador.md)
- [Criterios de aceptacion](docs/criterios-aceptacion.md)

## Reglas no negociables

- Ningun endpoint puede operar sin empresa activa validada.
- Ninguna tabla operativa queda sin `empresa_id`, salvo tablas globales justificadas.
- Los asientos confirmados no se editan ni eliminan.
- Las correcciones contables se hacen con contraasiento.
- Los periodos cerrados quedan bloqueados.
- Cada accion critica queda auditada.
- Cada empresa tiene CUIT, condicion fiscal, certificados, puntos de venta, periodos y configuracion propios.
- Los certificados y secretos fiscales se guardan cifrados.
- Todo reporte, exportacion y backup debe poder ejecutarse por empresa.
- ARCA/AFIP se implementa en una capa aislada, extensible y testeable en homologacion antes de produccion.

## Comandos

```bash
npm install
npm run dev
npm run build
npm run test
npm run lint
npm run typecheck
npm run prisma:validate
npm run db:up
npm run db:migrate
npm run db:seed
```

Para validar Prisma sin una base local cargada:

```powershell
$env:DATABASE_URL='postgresql://mrasyscont:mrasyscont@localhost:5432/mrasyscont?schema=public'; npm run prisma:validate
```

## Base de datos local

La configuracion recomendada usa PostgreSQL por Docker Compose:

```bash
npm run db:up
npm run db:migrate
npm run db:seed
```

Si Docker no esta instalado, la app sigue abriendo con datos demo locales. Cuando PostgreSQL este disponible, la misma pantalla inicial indica si esta leyendo desde `PostgreSQL` o desde `Demo local`.
