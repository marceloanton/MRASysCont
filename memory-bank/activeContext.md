# Active Context

## Estado actual

Fase 1 inicial: plataforma multi-empresa.

Se creo la documentacion base, el stack tecnico con Next.js, TypeScript, Prisma y PostgreSQL, y una primera capa funcional de usuarios demo, empresas, roles, selector de empresa, permisos por tenant y auditoria local.

## Foco inmediato

- Reemplazar datos demo por persistencia real en PostgreSQL.
- Crear migraciones iniciales.
- Definir estrategia concreta de autenticacion productiva.
- Mantener tests de aislamiento por `empresa_id` como proteccion obligatoria.

## Pendientes

- Instalar Docker o configurar PostgreSQL local.
- Ejecutar `npm run db:migrate` y `npm run db:seed`.
- Implementar login productivo.
