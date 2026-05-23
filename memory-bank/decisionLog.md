# Decision Log

- 2026-05-23: Se adopta arquitectura web SaaS multi-empresa con PostgreSQL y `empresa_id` en tablas operativas.
- 2026-05-23: Se define ARS como moneda contable base y USD como moneda operativa con tipo de cambio registrado.
- 2026-05-23: Se define ARCA/AFIP por etapas: comprobantes comunes A/B/C en v1 y comprobantes especiales en fases posteriores.
- 2026-05-23: Se inicializa stack tecnico recomendado con Next.js, TypeScript, Prisma y PostgreSQL.
- 2026-05-23: Se implementa Fase 1 inicial con usuarios demo, selector de empresa, permisos centralizados, validacion de tenant y tests de aislamiento antes de conectar PostgreSQL.
- 2026-05-23: Se agrega preparacion de persistencia real con Docker Compose, migracion Prisma inicial, seed y fallback demo cuando PostgreSQL no esta disponible localmente.
