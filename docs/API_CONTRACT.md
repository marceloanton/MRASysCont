# API_CONTRACT

## Objetivo
Unificar convenciones de API.

## Canonico
Autorizacion por endpoint y politica de errores: `docs/ENDPOINT_AUTHORIZATION.md`.

## Versionado
- Base path: `/api/v1`.

## Convenciones
- paginacion obligatoria en listados
- filtros por alcance tenant
- `request_id` en respuesta/logs

## Errores
- 401 no autenticado
- 403 sin permiso
- 404 recurso inexistente/fuera de alcance (segun politica)
- 409 estado invalido para accion
- 422 validacion de datos

## Idempotencia
Endpoints criticos aceptan `Idempotency-Key`.

## Endpoints Fase 1
Se especifican en `docs/ENDPOINT_AUTHORIZATION.md` con permiso, alcance y tests obligatorios.

## Endpoints Fase 2
Se especifican en `docs/ENDPOINT_AUTHORIZATION.md` con:
- permiso funcional por endpoint,
- scope tenant explicito (`studyId`, `clientOfStudyId`, `companyId` cuando aplique),
- validacion de objeto por ID,
- tests obligatorios asociados.

## Entidades minimas Fase 2 (contrato)
- `clientOfStudy` (`studyId` obligatorio)
- `clientService` (`studyId`, `clientOfStudyId` obligatorios)
- `clientInternalResponsible` (`studyId`, `clientOfStudyId`, `userId` obligatorios)
- `clientMonthlyStatus` (`studyId`, `clientOfStudyId`, `period`, `status`)
- `studyTask` (`studyId` obligatorio; `clientOfStudyId` y `companyId` opcionales segun caso)
- `studyDeadline` (`studyId`, `clientOfStudyId` obligatorios; `companyId` opcional)

## Reglas de contrato Fase 2
- Ningun endpoint Fase 2 acepta crear/editar entidades sin `studyId`.
- No se permite asignar responsable interno de otro estudio.
- `companyId` opcional en tareas/vencimientos solo si pertenece al mismo `studyId`.
- Transiciones invalidas de estado mensual retornan `409`.

## Endpoints Fase 3
Se especifican en `docs/ENDPOINT_AUTHORIZATION.md` con:
- permiso funcional por endpoint,
- scope tenant explicito (`studyId`, `companyId`, `thirdPartyId`),
- validacion de objeto por `thirdPartyId`,
- tests obligatorios asociados.

## Entidades minimas Fase 3 (contrato)
- `thirdParty` (`studyId`, `companyId` obligatorios)
- `currentAccountMovement` (`studyId`, `companyId`, `thirdPartyId` obligatorios)
- `currentAccountStatement` (view/reporte scopeado por `studyId` + `companyId` + `thirdPartyId`)

## Reglas de contrato Fase 3
- Ningun endpoint Fase 3 acepta crear/editar entidades sin `studyId`.
- Ningun movimiento de cuenta corriente se registra sin `companyId` y `thirdPartyId`.
- Saldos y estados de cuenta se calculan por scope estricto (`studyId` + `companyId` + `thirdPartyId`).
- Transiciones invalidas de estados criticos retornan `409`.

## Endpoints Fase 4
Se especifican en `docs/ENDPOINT_AUTHORIZATION.md` con:
- permiso funcional por endpoint,
- scope tenant explicito (`studyId`, `companyId`, `periodId`, `entryId`),
- validacion de objeto por `entryId`/`periodId`,
- tests obligatorios asociados.

## Entidades minimas Fase 4 (contrato)
- `accountingChartTemplate` (catalogo base controlado).
- `accountingAccount` (`studyId`, `companyId` obligatorios).
- `accountingPeriod` (`studyId`, `companyId`, `status`).
- `journalEntry` (`studyId`, `companyId`, `periodId`, `status`).
- `journalEntryLine` (`entryId`, `accountId`, `debit`, `credit`) con importes `NUMERIC`, nunca float/double.

## Reglas de contrato Fase 4
- Ningun endpoint Fase 4 acepta crear/editar asientos sin `studyId` + `companyId`.
- No se confirma asiento si la partida doble no cuadra.
- No se modifica asiento confirmado.
- No se opera en periodo cerrado.
- Correcciones via contraasiento o asiento nuevo.
- Libro Diario y Libro Mayor se construyen solo desde asientos confirmados.
- Transiciones invalidas de estado contable retornan `409`.

## Endpoints Fase 5
Se especifican en `docs/ENDPOINT_AUTHORIZATION.md` con:
- permiso funcional por endpoint,
- scope tenant explicito (`studyId`, `clientOfStudyId`, `companyId`),
- validacion de objeto por `documentId`,
- tests obligatorios asociados.

## Entidades minimas Fase 5 (contrato)
- `studyDocument` (`studyId` obligatorio)
- `studyDocumentFolder` (derivado logico por `studyId` + `clientOfStudyId?` + `companyId?` + `period?`)
- `studyDocumentVersion` (`documentId`, `version`, `storageKey`, `mimeType`, `sizeBytes`)
- `studyDocumentAccessLog` (`documentId`, `userId`, `action`, `occurredAt`)

## Reglas de contrato Fase 5
- Ningun endpoint Fase 5 acepta crear/editar entidades sin `studyId`.
- Fase 5 debe soportar carpetas logicas por cliente/empresa/periodo.
- Fase 5 debe soportar buscador (`q`) y filtros por categoria/estado/periodo.
- Fase 5 debe soportar control de documentacion faltante por alcance.
- Descarga de documento requiere autorizacion backend explicita.
- Toda descarga crea registro de auditoria.
- Transiciones invalidas de estado documental retornan `409`.
- Cliente solo puede ver/subir documentos propios y descargar documentos publicados para cliente.
- Cliente no puede aprobar/rechazar documentos ni ver documentos internos del estudio.

## Endpoints Fase 6
Se especifican en `docs/ENDPOINT_AUTHORIZATION.md` con:
- permiso funcional por endpoint,
- scope tenant explicito (`studyId`, `companyId`, `fxEntryId`),
- validacion de objeto por `fxEntryId`,
- tests obligatorios asociados.

## Entidades minimas Fase 6 (contrato)
- `exchangeRate` (`studyId`, `companyId`, `fromCurrency`, `toCurrency`, `rate`, `effectiveAt`).
- `fxEntry`:
  - `studyId`, `companyId`
  - `originalCurrency`
  - `originalAmount`
  - `exchangeRate`
  - `accountingCurrency` (`ARS`)
  - `accountingAmountArs`
  - `roundingPolicyVersion`
- `fxReportRow` (derivado): importes original + ARS equivalente.

## Reglas de contrato Fase 6
- No se permite posting USD sin `exchangeRate`.
- No se permite posting USD sin `originalAmount`.
- No se permite posting USD sin `accountingAmountArs`.
- `accountingCurrency` contable base: `ARS`.
- Precision monetaria en DB: `NUMERIC/DECIMAL`, nunca float/double.
- Politica de redondeo FX centralizada y versionada.
- Reportes FX muestran `originalAmount` + `originalCurrency` y `accountingAmountArs`.
- Transiciones invalidas retornan `409`.

## Endpoints Fase 7
Se especifican en `docs/ENDPOINT_AUTHORIZATION.md` con:
- permiso funcional por endpoint,
- scope tenant explicito (`studyId`, `companyId`, `voucherId`),
- validacion de objeto por `voucherId`,
- tests obligatorios asociados.

## Entidades minimas Fase 7 (contrato)
- `voucher`:
  - `studyId`, `companyId`, `thirdPartyId`
  - `type` (factura/NC/ND), `letter` (A/B/C), `pointOfSale`, `number`
  - `status` (`BORRADOR`, `REGISTRADO`, `ANULADO`)
  - `journalEntryId` (asiento propuesto vinculado)
  - `currency`, `netAmount`, `taxAmount`, `totalAmount`
- `voucherSequence`:
  - `studyId`, `companyId`, `pointOfSale`, `voucherType`, `lastNumber`
  - garantia de unicidad por alcance.
- `voucherPdfSnapshot` (si aplica persistencia):
  - referencia a comprobante, version de plantilla local, datos de emision.

## Reglas de contrato Fase 7
- Estados canonicos vigentes en implementacion:
  - `BORRADOR` (equivalente legacy: `draft`)
  - `REGISTRADO` (equivalente legacy: `accounted`)
  - `ANULADO` (equivalente legacy: `cancelled`)
- Estado legacy no aplicable en Fase 7 actual:
  - `issued_local` (no existe estado intermedio operativo entre emision y contabilizacion)
- No implementar ARCA/AFIP ni CAE real en Fase 7.
- QR fiscal de Fase 7 es placeholder local (`codAut=0`).
- No se confirma comprobante sin asiento propuesto valido.
- No se confirma comprobante con asiento desbalanceado.
- No se confirma comprobante en periodo contable cerrado.
- Numeracion unica por `studyId` + `companyId` + `pointOfSale` + `type` + `number`.
- Comprobante confirmado no se modifica.
- Acciones criticas de comprobantes auditan actor, accion, entidad y resultado.

## Endpoints Fase 8
Se especifican en `docs/ENDPOINT_AUTHORIZATION.md` con:
- permiso funcional por endpoint,
- scope tenant explicito (`studyId`, `companyId`, `period`),
- validacion de objeto/filtros de libro/reporte/export,
- tests obligatorios asociados.

## Entidades minimas Fase 8 (contrato)
- `vatOperation` (derivada de comprobante):
  - `studyId`, `companyId`, `period`, `voucherId`
  - `operationType` (`GRAVADA`, `EXENTA`, `NO_GRAVADA`)
  - `vatRate` (nullable para `EXENTA`/`NO_GRAVADA`)
  - `taxableBase`
  - `vatDebitFiscal`
  - `vatCreditFiscal`
- `vatSalesBookRow` y `vatPurchasesBookRow` (vistas derivadas).
- `vatMonthlyReport` (agregados por `companyId` + `period`).
- `vatReconciliationRow` (comparativo IVA vs asientos confirmados).

## Reglas de contrato Fase 8
- Scope obligatorio: `studyId` + `companyId` + `period`.
- Tipos validos de operacion: `GRAVADA`, `EXENTA`, `NO_GRAVADA`.
- Alicuotas validas (catalogo base): `0`, `10.5`, `21`, `27` (extensible por configuracion futura).
- `GRAVADA` requiere `taxableBase` y `vatRate` validos.
- `EXENTA` y `NO_GRAVADA` no generan `vatDebitFiscal`/`vatCreditFiscal`.
- Libros IVA ventas/compras se construyen desde comprobantes del scope activo.
- Reporte mensual y exportaciones CSV/Excel deben respetar scope tenant.
- Conciliacion IVA debe usar exclusivamente asientos contables `CONFIRMADO`.
- Precision monetaria: `NUMERIC/DECIMAL`; prohibido `float/double`.
- Acciones criticas (libros, reportes, exportacion, conciliacion) deben auditarse.
