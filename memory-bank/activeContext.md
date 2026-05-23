# Active Context

## Estado actual

Fase 1 inicial: plataforma multi-empresa.

Se creo la documentacion base, el stack tecnico con Next.js, TypeScript, Prisma y PostgreSQL, y una primera capa funcional de usuarios demo, empresas, roles, selector de empresa, permisos por tenant y auditoria local.

## Foco inmediato

- Reemplazar datos demo por persistencia real en PostgreSQL.
- Definir estrategia concreta de autenticacion productiva.
- Crear migraciones iniciales.
- Mantener tests de aislamiento por `empresa_id` como proteccion obligatoria.

## Pendientes

- Configurar PostgreSQL local o contenedor.
- Crear migraciones reales cuando la base este disponible.
- Implementar login productivo.
