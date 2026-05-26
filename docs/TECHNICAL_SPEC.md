# TECHNICAL_SPEC

## Objetivo
Definir reglas tecnicas transversales obligatorias para todas las fases.

## Canonico
Tenancy y ambientes se rigen por `docs/TENANCY_AND_ENVIRONMENTS_CANONICAL.md`.
Autorizacion endpoint-level se rige por `docs/ENDPOINT_AUTHORIZATION.md`.
Estados se rigen por `docs/STATE_MACHINE.md`.
Tests criticos se rigen por `docs/CRITICAL_TEST_COVERAGE.md`.
Quality gates se rigen por `docs/CI_QUALITY_GATES.md`.

## Multi-Tenancy
- `estudio_id` frontera principal.
- `cliente_id` frontera comercial.
- `empresa_id` frontera contable/fiscal.
- Toda tabla operativa explicita su alcance.
- Toda consulta operativa filtra por alcance efectivo.
- Regla transitoria de compatibilidad:
  - En entidades operativas ya existentes de fases previas, `studyId` puede quedar nullable temporalmente solo para compatibilidad de migracion.
  - No habilita bypass de autorizacion ni lectura cross-study.
  - Cada modulo migrado debe cerrar su hardening con `studyId NOT NULL`.
- Regla obligatoria hacia adelante:
  - Queda prohibido crear nuevas entidades operativas con `studyId` nullable.
  - Toda nueva entidad operativa debe nacer con `studyId` requerido y FK valida.

## Autorizacion
Capas:
1. autenticacion/sesion
2. resolucion de alcance tenant
3. autorizacion por accion y objeto

## Importes
- Prohibido `float/double`.
- `NUMERIC/DECIMAL` segun precision definida.
- Hotspots tecnicos pre-Fase 6 (uso de `number/Math.round` en capa app) documentados en `docs/PHASE_6_MULTICURRENCY_HOTSPOTS.md`.
- Reglas Fase 6 (multimoneda):
  - `moneda_original` + `importe_original` obligatorios para operaciones USD.
  - `tipo_cambio` obligatorio para operaciones USD.
  - `importe_contable_ars` obligatorio en todo posting con impacto contable.
  - `Voucher` puede conservar importes en moneda original; el impacto contable legal se conserva en ARS en `JournalEntryLine` junto a `currency`, `originalAmount` y `exchangeRate` cuando aplica.
  - precision recomendada:
    - montos monetarios: `NUMERIC(18,2)`
    - tipo de cambio: `NUMERIC(18,6)`
  - redondeo FX centralizado y versionado (no distribuido en handlers/UI).
- Reglas Fase 8 (IVA base):
  - importes IVA (`base_imponible`, `iva_debito_fiscal`, `iva_credito_fiscal`) en `NUMERIC/DECIMAL`.
  - prohibido `float/double` para calculos y almacenamiento de IVA.
  - alicuotas permitidas (catalogo base): `0`, `10.5`, `21`, `27`.
  - operaciones `EXENTA` y `NO_GRAVADA` no deben computar debito/credito fiscal.
  - conciliacion IVA contra contabilidad solo con asientos `CONFIRMADO`.
  - cierre mensual de IVA scopeado por `studyId` + `companyId` + `period`.

## Estados
Entidades criticas con state machine y transiciones invalidas rechazadas con 409.

## Idempotencia
Operaciones criticas idempotentes (`idempotency_key`/`operation_id`).

## Concurrencia
- Operaciones criticas en transaccion.
- Locks para numeracion/cierres.
- Constraints unicos criticos.

## Integraciones
ARCA desacoplado y request/response sanitizados.

## Documentos
Storage seguro + metadata DB + hash + auditoria + URL firmada temporal.
Para Fase 5, la deuda de `period`/`visibility` en metadata logica (`notes`) queda formalizada en `docs/PHASE_5_DEFERRED_ITEMS.md`.

## Testing y CI/CD
Cumplir `docs/CRITICAL_TEST_COVERAGE.md` y `docs/CI_QUALITY_GATES.md`.

## Fase 8 - Estructuras tecnicas minimas
- `vatOperation` derivada de comprobantes locales:
  - `studyId`, `companyId`, `period`, `voucherId`
  - `operationType` (`GRAVADA`, `EXENTA`, `NO_GRAVADA`)
  - `vatRate`, `taxableBase`, `vatDebitFiscal`, `vatCreditFiscal`
- vistas/reportes:
  - `vatSalesBook`
  - `vatPurchasesBook`
  - `vatMonthlyReport`
  - `vatReconciliation`
- exportaciones:
  - CSV y Excel por `studyId` + `companyId` + `period`
  - siempre con validacion de permisos y auditoria.

## Deuda Tecnica Planificada (tenancy hardening)
- Tarea futura obligatoria por modulo:
  - Endurecer `studyId` a `NOT NULL` por entidad cuando el modulo quede completamente migrado.
  - Agregar validaciones y tests de migracion para garantizar backfill completo antes del `NOT NULL`.
