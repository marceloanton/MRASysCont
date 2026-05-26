# Roadmap V2 - MRASysCont

## Objetivo
Construir MRASysCont como sistema integral para estudio contable argentino con aislamiento multi-tenant, trazabilidad estricta y cumplimiento legal progresivo.

## Principios Transversales
- Multi-tenant obligatorio: `estudio_id -> cliente_id -> empresa_id`.
- No borrar fisicamente entidades criticas; usar anulacion/reversion/versionado.
- Estados controlados por maquinas de estado.
- Operaciones criticas en transaccion e idempotentes.
- No mezclar fiscalidad avanzada con nucleo contable.

## Precondicion de GO para Fase 1
Debe estar cerrado:
- `docs/TENANCY_AND_ENVIRONMENTS_CANONICAL.md`
- `docs/ENDPOINT_AUTHORIZATION.md`
- `docs/STATE_MACHINE.md`
- `docs/TRACEABILITY_MATRIX.md`
- `docs/CRITICAL_TEST_COVERAGE.md`
- `docs/CI_QUALITY_GATES.md`

## Fase 0 - Preparacion
Base tecnica, repo, stack, PostgreSQL, migraciones, tests y docs base.

## Fase 0.5 - Arquitectura Tecnica Transversal
Documentos rectores tecnicos, seguridad, modelo de datos, API, errores, testing, runbook y ADRs.

## Fase 0.6 - Estabilizacion Pre-Fase 1
Congelar alcance funcional y cerrar hardening tecnico minimo antes de aceptar Fase 1.

Entregables:
- Migracion `Study` validada en base real con `DATABASE_URL`.
- Scripts de CI alineados a `docs/CI_QUALITY_GATES.md`.
- Deuda tecnica de tenancy documentada y priorizada.
- Evidencia de ejecucion de gates (validate/migrate/seed/lint/typecheck/test/build).

Criterio de salida:
- `npx prisma validate` en verde.
- `npx prisma migrate dev` en verde.
- `npx prisma db seed` en verde.
- `npm run db:migration:check` en verde.
- `npm run lint` en verde.
- `npm run typecheck` en verde.
- `npm test` en verde.
- `npm run build` en verde.

## Fase 1 - Plataforma Base, Seguridad y Multiempresa
Login, usuarios, roles, permisos, empresas, asignaciones y auditoria base.

## Fase 2 - Gestion Del Estudio
Clientes del estudio, dashboard base, vencimientos, tareas y estados mensuales.

Entregables minimos Fase 2:
- Clientes del estudio.
- Servicios contratados por cliente.
- Responsable interno por cliente.
- Estado mensual por cliente.
- Tareas internas del estudio.
- Vencimientos basicos.
- Dashboard base del estudio.

Entidades minimas Fase 2:
- `client_of_study` (siempre con `study_id`).
- `client_service` (siempre con `study_id`, `client_of_study_id`).
- `client_internal_responsible` (siempre con `study_id`, `client_of_study_id`, `user_id`).
- `client_monthly_status` (siempre con `study_id`, `client_of_study_id`, `period`).
- `study_task` (siempre con `study_id`, `client_of_study_id` opcional, `company_id` opcional).
- `study_deadline` (siempre con `study_id`, `client_of_study_id`, `company_id` opcional).

Criterio de salida Fase 2:
- No existe entidad Fase 2 sin `study_id`.
- No se permite asignar responsable interno de otro estudio.
- Tareas y vencimientos no se crean sin scope de estudio.
- Endpoints Fase 2 cumplen autorizacion por objeto.
- Tests criticos Fase 2 definidos en `docs/CRITICAL_TEST_COVERAGE.md` pasan.
- Cualquier entregable diferido de Fase 2 queda formalizado en `docs/PHASE_2_DEFERRED_ITEMS.md` con criterio de reingreso.

## Fase 3 - Terceros y cuentas corrientes
Clientes comerciales, proveedores, datos fiscales y movimientos de cuenta corriente por tercero.
Canonico: Fase 3 no incluye expediente documental.

Entregables minimos Fase 3:
- Alta/edicion/listado de terceros (clientes y proveedores).
- Datos fiscales minimos por tercero.
- Registro de movimientos de cuenta corriente por tercero.
- Calculo de saldos por tercero.
- Estado de cuenta por tercero.

Entidades minimas Fase 3:
- `third_party` (`study_id`, `company_id` obligatorios).
- `current_account_movement` (`study_id`, `company_id`, `third_party_id` obligatorios).
- `current_account_snapshot` (opcional para optimizacion, siempre scopeado por `study_id` + `company_id` + `third_party_id`).

Criterio de salida Fase 3:
- Todo tercero pertenece a `study_id` y `company_id`.
- No existe movimiento sin `company_id`.
- No existe movimiento sin `third_party_id`.
- No hay acceso cruzado entre empresas/estudios.
- Estado de cuenta y saldo se calculan solo con movimientos del mismo `study_id` + `company_id` + `third_party_id`.
- Tests criticos Fase 3 definidos en `docs/CRITICAL_TEST_COVERAGE.md` pasan.

## Fase 4 - Nucleo Contable
Plan de cuentas, periodos, asientos, cierres, libro diario y mayor.

Entregables minimos Fase 4:
- Plantillas de plan de cuentas.
- Plan de cuentas por empresa.
- Periodos contables.
- Asientos en borrador y confirmados.
- Validacion estricta de partida doble.
- Contraasientos para correcciones.
- Cierres estrictos de periodo.
- Libro Diario.
- Libro Mayor.

Entidades minimas Fase 4:
- `accounting_chart_template` (global controlado o por estudio, sin datos operativos cruzados).
- `accounting_account` (`study_id`, `company_id` obligatorios).
- `accounting_period` (`study_id`, `company_id` obligatorios).
- `journal_entry` (`study_id`, `company_id`, `period_id`, `status`).
- `journal_entry_line` (`entry_id`, `account_id`, `debit`, `credit` en `NUMERIC`, nunca float/double).
- `journal_book_row` y `ledger_row` como vistas/reportes derivados de asientos confirmados.

Criterio de salida Fase 4:
- No se confirma asiento desbalanceado.
- No se modifica asiento confirmado.
- No se opera en periodo cerrado.
- Toda correccion se hace por contraasiento o asiento nuevo.
- Libro Diario y Libro Mayor se construyen solo desde asientos confirmados.
- Todos los asientos respetan `study_id` + `company_id`.
- Tests criticos Fase 4 definidos en `docs/CRITICAL_TEST_COVERAGE.md` pasan.

## Fase 5 - Expediente Documental
Subidas, categorias, estados, revision, versionado basico y auditoria de descargas.
Canonico: toda funcionalidad documental pertenece a Fase 5.
Deuda post-Fase 5 documentada en `docs/PHASE_5_DEFERRED_ITEMS.md` (period/visibility logicos en `notes`) y no bloquea Fase 6.

## Fase 6 - Multimoneda
Monedas ARS/USD, tipos de cambio, operaciones en USD con importe original y equivalente ARS contable, y reportes con moneda original cuando aplique.

## Fase 7 - Comprobantes Locales
A/B/C + NC/ND, numeracion estricta, PDF local, QR preparado y asiento propuesto.

## Fase 8 - IVA Base
IVA compras/ventas y libros impositivos basicos.

## Fase 9 - Portal Cliente
Acceso cliente a documentos, vencimientos e informes publicados.

## Fase 10 - Tesoreria
Cajas, bancos, cobros, pagos, transferencias y conciliacion inicial.

## Fase 11 - Reportes
Reportes contables y de gestion con exportaciones.

## Fase 12 - ARCA/AFIP MVP
WSAA, WSFEv1, CAE, vencimiento, QR fiscal y homologacion/produccion separadas.

## Fase 13 - Papeles De Trabajo
Evidencia profesional para cierres y revisiones.

## Fase 14 - Control De Presentaciones
Estados de obligaciones, constancias y alertas.

## Fase 15 - Honorarios Del Estudio
Planes, facturacion del estudio, cobros y deuda.

## Fase 16 - Fiscal Extendido
IIBB, retenciones, percepciones, padrones y reglas por jurisdiccion.

## Fase 17 - ARCA/AFIP Extendido
Comprobantes especiales (FCE, E, exportacion).

## Fase 18 - UIF/PLA-FT Opcional
Legajo UIF, riesgo y evidencia para clientes alcanzados.

## Fase 19 - Sueldos Opcional
Liquidacion laboral, recibos y reportes basicos.

## Fase 20 - Premium
Analitica avanzada, automatizaciones y capacidades de inteligencia asistida.
