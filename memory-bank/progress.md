# Progress

## Completado

- Documentacion base del producto.
- Roadmap completo por fases.
- Criterios de aceptacion.
- Preguntas para validar con el contador.
- Scaffold Next.js, TypeScript, Prisma y PostgreSQL.
- Fase 1 inicial con usuarios demo, roles, empresas, selector de empresa, permisos por tenant y auditoria local.
- Tests unitarios de aislamiento multi-empresa.
- Docker Compose, migracion inicial, seed Prisma y fallback demo cuando PostgreSQL no esta disponible.
- Login inicial, logout, hashing de contrasena y sesiones persistidas preparadas para PostgreSQL.
- Pantallas administrativas `/admin/empresas` y `/admin/usuarios` con acciones protegidas por permisos.
- Fase 2 inicial con `/contabilidad/cuentas` y `/contabilidad/periodos`.
- Validaciones de codigo de cuenta, tipo de cuenta y rango de periodo.
- Asientos borrador con dos lineas, partida doble, periodo abierto y cuentas de la empresa activa.
- Confirmacion de asientos borrador con bloqueo de confirmados.
- Anulacion de asientos confirmados mediante contraasiento vinculado.

## En curso

- Fase 1: persistencia real, autenticacion productiva y migraciones.

## Proximo

- Instalar Docker o configurar PostgreSQL local.
- Ejecutar migraciones y seed.
- Ejecutar flujo completo login/productivo contra PostgreSQL local.
- Probar CRUD real de empresas, usuarios, cuentas y periodos contra PostgreSQL.
- Agregar cierre de periodos y bloqueo operativo.
