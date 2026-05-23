# Active Context

## Estado actual

Fase 2 inicial: nucleo contable.

Se creo la documentacion base, el stack tecnico con Next.js, TypeScript, Prisma y PostgreSQL, login inicial, sesiones preparadas para PostgreSQL, modo demo local, empresas, roles, selector de empresa, pantallas admin de empresas/usuarios, plan de cuentas, periodos contables con cierre, asientos borrador con lineas dinamicas, edicion controlada y detalle visible, confirmacion de asientos, anulacion por contraasiento, Libro Diario, Libro Mayor, Balance de sumas y saldos, exportacion CSV, vista imprimible/PDF, permisos por tenant y auditoria local.

## Foco inmediato

- Reemplazar datos demo por persistencia real en PostgreSQL.
- Crear migraciones iniciales.
- Conectar autenticacion productiva a PostgreSQL cuando Docker/PostgreSQL este disponible.
- Probar altas reales contra PostgreSQL.
- Agregar eliminacion controlada de asientos en borrador.
- Mantener tests de aislamiento por `empresa_id` como proteccion obligatoria.

## Pendientes

- Instalar Docker o configurar PostgreSQL local.
- Ejecutar `npm run db:migrate` y `npm run db:seed`.
- Reemplazar modo demo por datos persistidos en entorno local con PostgreSQL.
- Agregar reglas de bloqueo para periodos cerrados cuando existan asientos.
