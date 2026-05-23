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
- Asientos borrador con lineas dinamicas, validando que cada linea tenga Debe o Haber pero no ambos.
- Detalle visible de lineas dentro del listado de asientos.
- Edicion controlada de asientos en borrador.
- Descarte controlado de asientos en borrador.
- Confirmacion de asientos borrador con bloqueo de confirmados.
- Anulacion de asientos confirmados mediante contraasiento vinculado.
- Cierre de periodos contables para bloquear nuevas operaciones.
- Reportes iniciales Libro Diario, Libro Mayor y Balance de sumas y saldos por empresa y periodo.
- Exportacion CSV de Balance, Diario y Mayor.
- Vista imprimible para guardar reportes como PDF desde el navegador.
- Fase 3 inicial con terceros clientes/proveedores por empresa.
- Edicion y activacion/desactivacion de terceros.
- Comprobantes iniciales emitidos/recibidos vinculados a terceros.
- Cuentas corrientes derivadas con saldos por tercero.

## En curso

- Fase 3: terceros y cuentas corrientes.

## Proximo

- Instalar Docker o configurar PostgreSQL local.
- Ejecutar migraciones y seed.
- Ejecutar flujo completo login/productivo contra PostgreSQL local.
- Probar CRUD real de empresas, usuarios, cuentas y periodos contra PostgreSQL.
- Agregar pagos/cobros iniciales para aplicar contra cuentas corrientes.
