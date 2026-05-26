# MRASysCont - State Machine

## Principio
Entidades criticas no cambian estado libremente.
Transiciones criticas deben auditarse.
Transiciones invalidas retornan 409.

## Usuarios
Estados: `invited`, `active`, `suspended`, `disabled`

| Desde | Hacia | Permiso | Auditoria | Motivo |
|---|---|---|---|---|
| invited | active | invitacion/admin | si | no |
| active | suspended | `users:suspend` | si | si |
| suspended | active | `users:reactivate` | si | si |
| active | disabled | `users:disable` | si | si |
| suspended | disabled | `users:disable` | si | si |
| disabled | active | prohibido por defecto | si (si se habilita excepcion) | si |

## Empresas
Estados: `draft`, `active`, `suspended`, `archived`

| Desde | Hacia | Permiso | Auditoria | Motivo |
|---|---|---|---|---|
| draft | active | `companies:activate` | si | no |
| active | suspended | `companies:suspend` | si | si |
| suspended | active | `companies:reactivate` | si | si |
| active | archived | `companies:archive` | si | si |
| suspended | archived | `companies:archive` | si | si |
| archived | active | prohibido por defecto | si (si se habilita excepcion) | si |

## Asignacion usuario-empresa
Estados: `active`, `revoked`

| Desde | Hacia | Permiso | Auditoria | Motivo |
|---|---|---|---|---|
| active | revoked | `users:assign_company` | si | opcional |
| revoked | active | `users:assign_company` | si | opcional |

## Fase 2 - Cliente del estudio
Estados: `active`, `suspended`, `archived`

| Desde | Hacia | Permiso | Auditoria | Motivo |
|---|---|---|---|---|
| active | suspended | `clients:suspend` | si | si |
| suspended | active | `clients:reactivate` | si | si |
| active | archived | `clients:archive` | si | si |
| suspended | archived | `clients:archive` | si | si |
| archived | active | prohibido por defecto | si (si excepcion) | si |

## Fase 2 - Tarea interna
Estados: `pending`, `in_progress`, `waiting_documentation`, `in_review`, `done`, `cancelled`

| Desde | Hacia | Permiso | Auditoria | Motivo |
|---|---|---|---|---|
| pending | in_progress | `tasks:update` | si | no |
| in_progress | waiting_documentation | `tasks:update` | si | opcional |
| waiting_documentation | in_progress | `tasks:update` | si | opcional |
| in_progress | in_review | `tasks:update` | si | no |
| in_review | done | `tasks:close` | si | no |
| pending | cancelled | `tasks:cancel` | si | si |
| in_progress | cancelled | `tasks:cancel` | si | si |
| done | in_progress | prohibido | si (si excepcion) | si |

## Fase 2 - Vencimiento
Estados: `scheduled`, `in_progress`, `presented`, `paid`, `overdue`, `cancelled`

| Desde | Hacia | Permiso | Auditoria | Motivo |
|---|---|---|---|---|
| scheduled | in_progress | `deadlines:update` | si | no |
| in_progress | presented | `deadlines:mark_presented` | si | no |
| presented | paid | `deadlines:mark_paid` | si | no |
| scheduled | overdue | sistema/cron | si | no |
| in_progress | overdue | sistema/cron | si | no |
| overdue | in_progress | `deadlines:update` | si | opcional |
| scheduled | cancelled | `deadlines:cancel` | si | si |
| paid | scheduled | prohibido | si (si excepcion) | si |

## Fase 2 - Estado mensual por cliente
Estados: `not_started`, `in_progress`, `waiting_documentation`, `in_review`, `ready`, `closed`, `observed`

| Desde | Hacia | Permiso | Auditoria | Motivo |
|---|---|---|---|---|
| not_started | in_progress | `monthly_status:update` | si | no |
| in_progress | waiting_documentation | `monthly_status:update` | si | opcional |
| waiting_documentation | in_progress | `monthly_status:update` | si | opcional |
| in_progress | in_review | `monthly_status:update` | si | no |
| in_review | ready | `monthly_status:update` | si | no |
| ready | closed | `monthly_status:close` | si | no |
| in_review | observed | `monthly_status:observe` | si | si |
| observed | in_progress | `monthly_status:update` | si | si |
| closed | in_progress | prohibido | si (si excepcion) | si |

## Fase 3 - Tercero comercial
Estados: `active`, `suspended`, `archived`

| Desde | Hacia | Permiso | Auditoria | Motivo |
|---|---|---|---|---|
| active | suspended | `third_parties:suspend` | si | si |
| suspended | active | `third_parties:reactivate` | si | si |
| active | archived | `third_parties:archive` | si | si |
| suspended | archived | `third_parties:archive` | si | si |
| archived | active | prohibido | si (si excepcion) | si |

## Fase 3 - Movimiento de cuenta corriente
Estados: `draft`, `posted`, `reversed`

| Desde | Hacia | Permiso | Auditoria | Motivo |
|---|---|---|---|---|
| draft | posted | `current_account:post` | si | no |
| posted | reversed | `current_account:reverse` | si | si |
| reversed | posted | prohibido | si (si excepcion) | si |

## Fase 4 - Periodo contable
Estados: `open`, `closed`

| Desde | Hacia | Permiso | Auditoria | Motivo |
|---|---|---|---|---|
| open | closed | `accounting_periods:close` | si | opcional |
| closed | open | `accounting_periods:reopen` | si | si |

## Fase 4 - Asiento contable
Estados: `draft`, `confirmed`, `reversed`, `voided`

| Desde | Hacia | Permiso | Auditoria | Motivo |
|---|---|---|---|---|
| draft | confirmed | `journal_entries:confirm` | si | no |
| confirmed | reversed | `journal_entries:reverse` | si | si |
| draft | voided | `journal_entries:void` | si | si |
| confirmed | draft | prohibido | si (si excepcion) | si |
| reversed | confirmed | prohibido | si (si excepcion) | si |
| voided | draft | prohibido | si (si excepcion) | si |

Reglas obligatorias de transicion Fase 4:
- `draft -> confirmed` solo si `sum(debit) == sum(credit)`.
- No se permite confirmar asientos en periodo `closed`.
- No se permite modificar asientos `confirmed`; correccion via contraasiento o nuevo asiento.
- Libros Diario/Mayor se construyen solo con asientos `confirmed`.

## Fase 5 - Documento del expediente
Estados: `uploaded`, `pending_review`, `observed`, `approved`, `rejected`, `archived`

| Desde | Hacia | Permiso | Auditoria | Motivo |
|---|---|---|---|---|
| uploaded | pending_review | `documents:submit_review` | si | no |
| pending_review | observed | `documents:review` | si | si |
| pending_review | approved | `documents:review` | si | no |
| pending_review | rejected | `documents:review` | si | si |
| observed | pending_review | `documents:resubmit` | si | opcional |
| approved | archived | `documents:archive` | si | si |
| rejected | archived | `documents:archive` | si | si |
| approved | pending_review | prohibido | si (si excepcion) | si |
| archived | pending_review | prohibido | si (si excepcion) | si |

Restricciones de actor Fase 5:
- `CONTADOR`/`ASISTENTE` con permiso: pueden revisar (`pending_review -> observed/approved/rejected`).
- `CLIENTE`: puede crear/subir y re-subir cuando corresponda, pero no puede aprobar/rechazar/archivar.
- `CLIENTE`: solo puede descargar documentos publicados/autorizados para cliente.

## Fase 6 - Entrada FX
Estados: `draft`, `posted`, `reversed`

| Desde | Hacia | Permiso | Auditoria | Motivo |
|---|---|---|---|---|
| draft | posted | `fx_entries:create` | si | no |
| posted | reversed | `fx_entries:reverse` | si | si |
| reversed | posted | prohibido | si (si excepcion) | si |

Reglas obligatorias de transicion Fase 6:
- No se permite `draft -> posted` en USD sin `exchangeRate`.
- No se permite `draft -> posted` en USD sin `originalAmount`.
- No se permite `draft -> posted` sin `accountingAmountArs`.
- Redondeo FX se aplica por politica centralizada antes de `posted`.

## Fase 7 - Comprobante local
Estados operativos canonicos (implementacion actual): `BORRADOR`, `REGISTRADO`, `ANULADO`

Mapeo documental:
- `draft` = `BORRADOR`
- `accounted` = `REGISTRADO`
- `cancelled` = `ANULADO`
- `issued_local` = no aplicable en la implementacion actual (sin estado intermedio operativo)

| Desde | Hacia | Permiso | Auditoria | Motivo |
|---|---|---|---|---|
| BORRADOR | REGISTRADO | `vouchers:confirm` + `journal_entries:confirm` | si | no |
| BORRADOR | ANULADO | `vouchers:cancel` | si | si |
| REGISTRADO | ANULADO | prohibido en Fase 7 (usar NC/ND segun caso) | si (si excepcion) | si |
| REGISTRADO | BORRADOR | prohibido | si (si excepcion) | si |
| ANULADO | BORRADOR | prohibido | si (si excepcion) | si |

Reglas obligatorias de transicion Fase 7:
- `BORRADOR -> REGISTRADO` solo si existe asiento propuesto vinculado valido.
- `BORRADOR -> REGISTRADO` solo si el periodo del asiento esta `ABIERTO`.
- Para `EMITIDO`, la numeracion fiscal se asigna en confirmacion; no en borrador.
- Comprobante confirmado (`REGISTRADO`) es inmutable.
- Si aplica anulacion contable, se resuelve por flujo contable/comercial sin editar historico.
- PDF local puede generarse en cualquier estado autorizado por permisos, siempre scopeado por tenant.
- QR fiscal de Fase 7 usa placeholder local y no implica autorizacion fiscal ARCA.

## Fase 8 - IVA base
Estados de proceso para libro/reporte IVA mensual: `draft`, `generated`, `exported`, `reconciled`

| Desde | Hacia | Permiso | Auditoria | Motivo |
|---|---|---|---|---|
| draft | generated | `vat:sales:read` / `vat:purchases:read` | si | no |
| generated | exported | `vat:export` | si | no |
| generated | reconciled | `vat:reconciliation:read` | si | no |
| exported | reconciled | `vat:reconciliation:read` | si | no |
| reconciled | generated | prohibido por defecto | si (si excepcion) | si |

Reglas obligatorias de transicion Fase 8:
- Todo estado IVA mensual se calcula por `studyId` + `companyId` + `period`.
- `generated` requiere clasificacion valida por operacion (`GRAVADA` / `EXENTA` / `NO_GRAVADA`).
- Operaciones `GRAVADA` requieren alicuota valida del catalogo permitido.
- `reconciled` requiere conciliacion contra asientos `CONFIRMADO` del mismo periodo.
- Exportaciones (`exported`) deben respetar scope tenant y formato permitido (CSV/Excel).

## Empresa activa de sesion
- No se puede seleccionar empresa suspendida/archivada/no asignada.
- Endpoints operativos requieren empresa activa valida.

## Estados futuros reservados
- Asientos: `draft`, `confirmed`, `reversed`, `voided`
- Comprobantes (futuro fiscal): `pending_fiscal_authorization`, `fiscally_authorized`, `rejected`
- IVA base: `draft`, `generated`, `exported`, `reconciled`
- Presentaciones: `not_started`, `missing_documentation`, `in_preparation`, `in_review`, `ready_to_file`, `filed`, `vep_generated`, `paid`, `observed`, `closed`

## Reglas globales
- No volver a draft desde estado confirmado/cerrado.
- No borrado fisico de entidades criticas confirmadas/aprobadas/cerradas.
- Toda transicion critica audita usuario, fecha, estado previo/nuevo y motivo cuando aplique.
