# Decision Log

- 2026-05-23: Se adopta arquitectura web SaaS multi-empresa con PostgreSQL y `empresa_id` en tablas operativas.
- 2026-05-23: Se define ARS como moneda contable base y USD como moneda operativa con tipo de cambio registrado.
- 2026-05-23: Se define ARCA/AFIP por etapas: comprobantes comunes A/B/C en v1 y comprobantes especiales en fases posteriores.
- 2026-05-23: Se inicializa stack tecnico recomendado con Next.js, TypeScript, Prisma y PostgreSQL.
- 2026-05-23: Se implementa Fase 1 inicial con usuarios demo, selector de empresa, permisos centralizados, validacion de tenant y tests de aislamiento antes de conectar PostgreSQL.
- 2026-05-23: Se agrega preparacion de persistencia real con Docker Compose, migracion Prisma inicial, seed y fallback demo cuando PostgreSQL no esta disponible localmente.
- 2026-05-23: Se agrega login inicial con hash scrypt, sesiones persistidas en PostgreSQL cuando exista base y modo demo local solo para desarrollo.
- 2026-05-23: Se agregan pantallas admin de empresas y usuarios; las mutaciones requieren permisos y PostgreSQL, mientras los listados usan fallback demo en desarrollo.
- 2026-05-23: Se inicia Fase 2 con plan de cuentas y periodos contables por empresa, usando permisos `manageSettings`, fallback demo y repositorios preparados para PostgreSQL.
- 2026-05-23: Se agregan asientos borrador con validacion de partida doble, periodo abierto y cuentas imputables de la empresa activa.
- 2026-05-23: Se agrega confirmacion de asientos; solo los borradores balanceados de periodos abiertos pueden pasar a confirmado.
- 2026-05-23: Se agrega anulacion de asientos confirmados mediante contraasiento inverso, dejando vinculo entre asiento original y asiento de anulacion.
- 2026-05-23: Se agrega cierre de periodos contables; las operaciones de asientos ya validan periodo abierto para crear, confirmar y anular.
- 2026-05-23: Se agregan reportes iniciales de Libro Diario y Libro Mayor filtrados por empresa activa y periodo.
- 2026-05-23: Se agrega Balance de sumas y saldos derivado de las mismas lineas del Libro Diario para evitar consultas duplicadas y mantener consistencia de totales.
- 2026-05-23: Se agrega exportacion CSV server-side de reportes, protegida por sesion y empresa activa.
- 2026-05-23: Se agrega vista imprimible server-side para reportes; PDF se obtiene con impresion del navegador antes de incorporar un generador binario dedicado.
