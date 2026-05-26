# MRASysCont - Traceability Matrix

## Fase 1: Plataforma base, seguridad y multiempresa

| ID | Requisito | Riesgo cubierto | Modulo | Endpoint / entidad | Tests obligatorios | Criterio de aceptacion |
|---|---|---|---|---|---|---|
| F1-R001 | Soporte `estudio_id` tenant principal | fuga entre estudios | tenancy | `estudios`, `usuarios`, `empresas` | `study_a_cannot_access_study_b_data` | ningun usuario accede fuera de su estudio |
| F1-R002 | Empresa pertenece a estudio | empresa huerfana | companies | `empresas.estudio_id` | `company_requires_study_id` | no crea empresa sin `estudio_id` |
| F1-R003 | Usuario pertenece a estudio antes de operar | usuario sin frontera tenant | auth/users | `usuario_estudio` | `user_without_study_cannot_operate` | sin estudio no opera |
| F1-R004 | Login solo usuarios activos | acceso indebido | auth | `POST /auth/login` | `inactive_user_cannot_login` | usuario inactivo rechazado |
| F1-R005 | Roles centralizados | permisos inconsistentes | rbac | `roles`, `permissions` | `role_permissions_are_enforced` | endpoint valida permiso |
| F1-R006 | Asignacion usuario-empresa obligatoria (asistente/cliente) | acceso cruzado empresas | users/companies | `usuario_empresa` | `assistant_sees_only_assigned_companies`, `client_sees_only_own_company` | no accede a empresas no asignadas |
| F1-R007 | Selector empresa valida pertenencia | manipulacion `empresa_id` | tenancy middleware | `POST /session/active-company` | `cannot_select_unassigned_company` | backend rechaza no asignada |
| F1-R008 | Endpoints operativos exigen empresa activa | operacion sin contexto | middleware | `active_company_id` | `operational_endpoint_requires_active_company` | request sin empresa activa rechazada |
| F1-R009 | Object authorization en endpoints con ID | BOLA/IDOR | api security | `GET/PATCH/DELETE /:id` | `cannot_access_object_from_other_company`, `cannot_access_object_from_other_study` | cambiar ID no permite acceso |
| F1-R010 | Cliente externo no ve datos internos | exposicion interna | portal/rbac | endpoints internos | `client_cannot_access_internal_study_data` | cliente solo ve recursos propios/publicados |
| F1-R011 | Asistente no cambia permisos | escalada | rbac | `PATCH /users/:id/roles` | `assistant_cannot_change_roles` | solo autorizado cambia roles |
| F1-R012 | Cambios de rol auditados | falta trazabilidad | audit | `audit_logs` | `role_change_creates_audit_log` | cambios de permisos auditados |
| F1-R013 | Asignaciones auditadas | acceso no rastreable | audit | `usuario_empresa`, `audit_logs` | `company_assignment_creates_audit_log` | alta/baja asignacion auditada |
| F1-R014 | Accesos denegados registrados | ataques no detectados | security logs | `security_audit_logs` | `denied_access_creates_security_log` | rechazos criticos generan log |
| F1-R015 | Listados filtran por estudio/permisos | fuga por listados | api/tenancy | `GET /companies`, `GET /users` | `company_list_is_scoped_by_study`, `user_list_is_scoped_by_study` | listados no fugan datos |
| F1-R016 | No confiar `empresa_id` del frontend | fuga por manipulación request | middleware/api | endpoints operativos | `tampered_company_id_is_rejected` | backend valida/recalcula alcance |
| F1-R017 | Cliente no crea empresas | abuso portal | companies | `POST /companies` | `client_cannot_create_company` | solo roles autorizados crean |
| F1-R018 | Politica consistente 403/404 | enumeracion recursos | api errors | respuestas api | `foreign_resource_returns_not_found_or_forbidden_by_policy` | respuesta consistente con API_CONTRACT |
| F1-R019 | Superadmin auditado | acciones privilegiadas sin trazabilidad | admin/audit | acciones admin | `superadmin_action_is_audited` | toda accion privilegiada auditada |
| F1-R020 | Suite multi-tenant obligatoria para cerrar fase | regresion aislamiento | qa | suite fase 1 | `phase_1_multitenant_suite_passes` | CI bloquea si falla aislamiento |
| F1-R021 | Empresa activa debe pertenecer al estudio activo | cruce tenant en sesion | session/tenant middleware | `activeStudyId`, `activeCompanyId` | `active_company_must_belong_to_active_study`, `cannot_select_company_from_other_study` | el backend rechaza selecciones cruzadas estudio/empresa |

## Fase 2: Gestion del estudio contable

| ID | Requisito | Riesgo cubierto | Modulo | Endpoint / entidad | Tests obligatorios | Criterio de aceptacion |
|---|---|---|---|---|---|---|
| F2-R001 | Cliente del estudio requiere `study_id` | cliente huerfano | clients | `client_of_study.study_id` | `client_record_requires_study_id` | no se crea cliente sin `study_id` |
| F2-R002 | Alta de cliente solo por rol autorizado | escalada de privilegios | clients/rbac | `POST /clients` | `accountant_can_create_client_in_study`, `assistant_cannot_create_client_without_permission` | solo roles habilitados crean |
| F2-R003 | Listado de clientes scope por estudio | fuga entre estudios | clients/tenancy | `GET /clients` | `client_list_is_scoped_by_study` | no mezcla clientes de otros estudios |
| F2-R004 | Object authorization en cliente por ID | BOLA/IDOR | clients/security | `GET/PATCH /clients/:id` | `cannot_access_client_from_other_study` | manipular ID no da acceso |
| F2-R005 | Responsable interno debe pertenecer al mismo estudio | asignacion cruzada insegura | clients/users | `POST /clients/:id/responsible` | `can_assign_internal_responsible_to_client`, `cannot_assign_responsible_from_other_study` | no asigna usuario externo al estudio |
| F2-R006 | Tareas internas requieren scope tenant | tarea fuera de tenant | tasks | `POST /tasks`, `GET /tasks` | `task_requires_study_scope`, `assistant_sees_only_assigned_tasks`, `cannot_access_task_from_other_study` | toda tarea queda en estudio y alcance valido |
| F2-R007 | Vencimientos requieren scope tenant | vencimiento sin frontera | deadlines | `POST /deadlines`, `GET /deadlines` | `deadline_requires_study_scope`, `deadline_list_is_scoped_by_study` | vencimientos solo del estudio activo |
| F2-R008 | Estado mensual con transiciones validas | estado inconsistente | monthly-status/state-machine | `PATCH /clients/:id/monthly-status` | `monthly_status_transition_is_valid`, `monthly_status_invalid_transition_returns_409` | transiciones invalidas retornan 409 |
| F2-R009 | Acciones criticas Fase 2 auditadas | falta trazabilidad | audit | `audit_logs` eventos de clientes/tareas/vencimientos/estado | `critical_phase2_actions_create_audit_log` | cambios criticos quedan auditados |

## Fase 3: Terceros y cuentas corrientes

| ID | Requisito | Riesgo cubierto | Modulo | Endpoint / entidad | Tests obligatorios | Criterio de aceptacion |
|---|---|---|---|---|---|---|
| F3-R001 | Tercero requiere `study_id` y `company_id` | tercero huerfano/fuga tenant | third-parties | `third_party` | `third_party_requires_study_and_company_scope` | no se crea tercero sin `study_id` y `company_id` |
| F3-R002 | Alta de tercero valida pertenencia al estudio/empresa | vinculacion cruzada insegura | third-parties/tenancy | `POST /third-parties` | `cannot_create_third_party_for_foreign_company` | no permite alta en empresa fuera de alcance |
| F3-R003 | Listado de terceros scope por estudio/empresa | fuga por listados | third-parties | `GET /third-parties` | `third_party_list_is_scoped_by_company` | no devuelve terceros de otra empresa |
| F3-R004 | Object authorization por tercero | BOLA/IDOR | third-parties/security | `GET/PATCH /third-parties/:id` | `cannot_access_third_party_from_other_company` | manipular ID no permite acceso |
| F3-R005 | Movimiento requiere `company_id` y `third_party_id` | movimiento huerfano | current-account | `current_account_movement` | `movement_requires_company_id`, `movement_requires_third_party_id` | no crea movimiento sin ambos campos |
| F3-R006 | Movimiento valida tercero de la misma empresa | cruce de saldos entre empresas | current-account/tenancy | `POST /current-account/movements` | `cannot_post_movement_for_third_party_from_other_company` | no permite cruce de tercero/empresa |
| F3-R007 | Saldos por tercero se calculan por scope estricto | saldo contaminado entre empresas | current-account/reports | `GET /current-account/balance` | `third_party_balance_is_scoped_by_company` | saldo usa solo movimientos del mismo scope |
| F3-R008 | Estado de cuenta por tercero se calcula por scope estricto | fuga por reporte | current-account/reports | `GET /current-account/statement` | `third_party_statement_is_scoped_by_company` | reporte no mezcla empresas |
| F3-R009 | Acciones criticas Fase 3 auditadas | falta trazabilidad | audit | `audit_logs` eventos terceros/cc | `critical_phase3_actions_create_audit_log` | alta/edicion/movimiento quedan auditados |

## Fase 4: Nucleo contable

| ID | Requisito | Riesgo cubierto | Modulo | Endpoint / entidad | Tests obligatorios | Criterio de aceptacion |
|---|---|---|---|---|---|---|
| F4-R001 | Asiento requiere `study_id` + `company_id` | asiento huerfano/fuga tenant | accounting/entries | `journal_entry` | `journal_entry_requires_study_and_company_scope` | no se crea asiento sin scope tenant |
| F4-R002 | Confirmacion exige partida doble balanceada | asiento contable invalido | accounting/validation | `POST /accounting/entries/:id/confirm` | `cannot_confirm_unbalanced_entry`, `double_entry_totals_must_match` | no confirma si debitos != creditos |
| F4-R003 | Asiento confirmado es inmutable | alteracion de libro legal | accounting/state-machine | `PATCH /accounting/entries/:id` | `cannot_modify_confirmed_entry` | backend rechaza cambios sobre confirmados |
| F4-R004 | No operar en periodo cerrado | registracion fuera de periodo habilitado | accounting/periods | `POST/PATCH /accounting/entries*` | `cannot_operate_in_closed_period` | toda operacion en periodo cerrado es rechazada |
| F4-R005 | Object authorization por asiento | BOLA/IDOR contable | accounting/security | `GET/PATCH /accounting/entries/:id` | `cannot_access_journal_entry_from_other_company` | manipular ID no permite acceso cruzado |
| F4-R006 | Diario se construye solo desde confirmados | reporte contable inconsistente | accounting/reports | `GET /accounting/journal-book` | `journal_book_is_built_from_confirmed_entries_only` | no incluye borradores/revertidos |
| F4-R007 | Mayor se construye solo desde confirmados | saldo por cuenta inconsistente | accounting/reports | `GET /accounting/ledger` | `ledger_is_built_from_confirmed_entries_only` | no incluye borradores/revertidos |
| F4-R008 | Acciones criticas Fase 4 auditadas | falta trazabilidad legal | accounting/audit | `audit_logs` eventos contables | `critical_phase4_actions_create_audit_log` | confirmar/revertir/cerrar periodo quedan auditados |

## Fase 5: Expediente documental

| ID | Requisito | Riesgo cubierto | Modulo | Endpoint / entidad | Tests obligatorios | Criterio de aceptacion |
|---|---|---|---|---|---|---|
| F5-R001 | Documento requiere `study_id` | documento huerfano/fuga tenant | documents | `study_document.study_id` | `document_requires_study_scope` | no se crea documento sin `study_id` |
| F5-R002 | Listado de documentos scope por estudio | fuga por listados | documents | `GET /documents` | `document_list_is_scoped_by_study` | no devuelve documentos de otro estudio |
| F5-R003 | Object authorization por documento | BOLA/IDOR | documents/security | `GET /documents/:id` | `cannot_access_document_from_other_study` | manipular ID no permite acceso |
| F5-R004 | Descarga requiere autorizacion y auditoria | exposicion sin trazabilidad | documents/security+audit | `POST /documents/:id/download` | `document_download_requires_authorization`, `document_download_is_audited` | toda descarga autorizada queda auditada |
| F5-R005 | Transiciones de estado documental controladas | estado inconsistente | documents/state-machine | `PATCH /documents/:id/status` | `document_status_transition_is_valid`, `document_invalid_transition_returns_409` | invalidas retornan 409 |
| F5-R006 | Acciones criticas Fase 5 auditadas | falta trazabilidad global | audit | `audit_logs` eventos documentos | `critical_phase5_actions_create_audit_log` | alta/revision/descarga quedan auditadas |
| F5-R007 | Cliente solo ve/sube documentos propios | exposicion de documentos ajenos | documents/portal | `POST /documents`, `GET /documents` | `client_can_upload_own_document`, `client_can_read_own_uploaded_documents`, `client_cannot_access_document_from_other_study` | cliente no cruza estudio/cliente/empresa |
| F5-R008 | Cliente solo descarga documentos publicados | descarga de documentos internos | documents/portal/security | `POST /documents/:id/download` | `client_can_download_published_document`, `client_cannot_download_internal_document` | cliente no descarga internos |
| F5-R009 | Cliente no revisa estados documentales | aprobaciones indebidas | documents/review/rbac | `PATCH /documents/:id/status` | `client_cannot_review_document` | solo estudio revisa/aprueba/rechaza |
| F5-R010 | Soporte de carpetas por cliente/empresa/periodo | desorden operativo y perdida de trazabilidad | documents/organization | `study_document` clasificado por carpeta logica | `document_folder_scope_by_client_company_period` | cada documento queda trazable por carpeta |
| F5-R011 | Buscador y filtros scopeados por tenant | fuga por busqueda | documents/search | `GET /documents?q=...` | `document_search_is_scoped_by_study` | busqueda no cruza tenant |
| F5-R012 | Control de documentacion faltante | omision de evidencia respaldatoria | documents/compliance | `GET /documents/missing` | `missing_documents_report_is_scoped_by_study` | faltantes calculados por alcance y periodo |

## Fase 6: Multimoneda

| ID | Requisito | Riesgo cubierto | Modulo | Endpoint / entidad | Tests obligatorios | Criterio de aceptacion |
|---|---|---|---|---|---|---|
| F6-R001 | Posting USD exige tipo de cambio | asiento FX incompleto | fx/validation | `POST /fx/entries` | `exchange_rate_required_for_usd_posting` | no se registra USD sin tipo de cambio |
| F6-R002 | Posting USD exige importe original | perdida de trazabilidad monetaria | fx/validation | `fx_entry.original_amount` | `cannot_post_usd_without_original_amount` | no se registra USD sin importe original |
| F6-R003 | Posting USD exige equivalente ARS contable | libro contable sin moneda base | fx/accounting | `fx_entry.accounting_amount_ars` | `cannot_post_usd_without_ars_equivalent` | todo USD registra impacto ARS |
| F6-R004 | Redondeo FX centralizado y consistente | diferencias por redondeo disperso | fx/rounding | utilidades de conversion FX | `rounding_policy_is_consistent_for_fx_conversion` | misma conversion produce mismo resultado |
| F6-R005 | Scope tenant en asientos FX | fuga entre empresas/estudios | fx/tenancy | `fx_entry` (`studyId`,`companyId`) | `fx_entry_requires_study_and_company_scope` | no se crea FX fuera de scope |
| F6-R006 | Object authorization FX por empresa | BOLA/IDOR FX | fx/security | `GET /fx/entries/:id` | `cannot_access_fx_entry_from_other_company` | manipular ID no da acceso cruzado |
| F6-R007 | Reporte FX muestra original + ARS | reportes incompletos/ambiguos | fx/reports | `GET /reports/fx` | `fx_report_shows_original_and_ars_amounts` | reporte incluye ambas monedas |
| F6-R008 | Acciones criticas FX auditadas | falta trazabilidad legal | fx/audit | `audit_logs` eventos FX | `critical_phase6_fx_actions_create_audit_log` | alta/reversa/ajuste FX quedan auditados |

## Fase 7: Comprobantes locales

| ID | Requisito | Riesgo cubierto | Modulo | Endpoint / entidad | Tests obligatorios | Criterio de aceptacion |
|---|---|---|---|---|---|---|
| F7-R001 | Comprobante requiere `study_id` + `company_id` | comprobante huerfano/fuga tenant | vouchers/tenancy | `voucher` | `voucher_requires_study_and_company_scope`, `cannot_create_voucher_for_foreign_company` | no se crea comprobante fuera del estudio/empresa activos |
| F7-R002 | Numeracion unica por empresa+punto de venta+tipo | duplicidad fiscal local | vouchers/numbering | `voucher_sequence`, `voucher.number` | `voucher_number_is_unique_by_company_point_of_sale_type` | no se permite numero repetido en mismo scope |
| F7-R003 | Numero de emitidos se asigna al confirmar | huecos y secuencia invalida | vouchers/workflow | `POST /vouchers/:id/confirm` | `emitted_voucher_number_is_assigned_on_confirm_only` | en borrador emitido el numero fiscal queda pendiente |
| F7-R004 | Confirmacion exige asiento propuesto valido | comprobante confirmado sin respaldo contable | vouchers/accounting | `voucher.journal_entry_id` | `cannot_confirm_voucher_without_proposed_entry`, `cannot_confirm_voucher_if_linked_entry_unbalanced` | no confirma sin asiento borrador balanceado |
| F7-R005 | No confirmar con periodo contable cerrado | inconsistencia contable-fiscal | vouchers/accounting-period | `POST /vouchers/:id/confirm` | `cannot_confirm_voucher_if_period_closed` | confirmacion rechazada si periodo no abierto |
| F7-R006 | Estado de comprobante con transiciones controladas | mutaciones arbitrarias de estado | vouchers/state-machine | `voucher.status` | `voucher_state_transition_is_valid`, `voucher_invalid_transition_returns_409` | transiciones invalidas retornan 409 |
| F7-R007 | PDF local respeta scope tenant | exposicion cruzada por descarga | vouchers/pdf/security | `GET /vouchers/:id/pdf` | `voucher_pdf_generation_respects_tenant_scope` | no genera PDF fuera del estudio/empresa activos |
| F7-R008 | QR fiscal local sin CAE real (placeholder) | confusion con autorizacion fiscal | vouchers/pdf/qr | `qr_payload.codAut=0` | `voucher_qr_placeholder_is_generated_without_cae` | QR se genera pero no marca autorizacion fiscal |
| F7-R009 | Comprobante confirmado es inmutable | alteracion posterior de comprobante registrado | vouchers/state-machine | `PATCH /vouchers/:id` | `voucher_invalid_transition_returns_409` | no se modifica comprobante confirmado |
| F7-R010 | Acciones criticas Fase 7 auditadas | falta trazabilidad legal/operativa | vouchers/audit | `audit_logs` eventos comprobantes | `critical_phase7_actions_create_audit_log` | alta, confirmacion, anulacion y generacion PDF quedan auditadas |

## Fase 8: IVA base

| ID | Requisito | Riesgo cubierto | Modulo | Endpoint / entidad | Tests obligatorios | Criterio de aceptacion |
|---|---|---|---|---|---|---|
| F8-R001 | IVA ventas requiere scope `study_id` + `company_id` + `periodo` | fuga tenant por libro/reporte | vat/sales | `vat_sale_book` | `vat_sale_requires_study_and_company_scope` | no se genera libro IVA ventas fuera del scope activo |
| F8-R002 | IVA compras requiere scope `study_id` + `company_id` + `periodo` | fuga tenant por libro/reporte | vat/purchases | `vat_purchase_book` | `vat_purchase_requires_study_and_company_scope` | no se genera libro IVA compras fuera del scope activo |
| F8-R003 | Acceso a libros IVA por objeto y scope estricto | BOLA/IDOR en reportes impositivos | vat/security | `GET /vat/*` | `cannot_access_vat_book_from_other_company` | manipular IDs/filtros no cruza empresas |
| F8-R004 | Tipo de operacion IVA valido | clasificacion fiscal incorrecta | vat/classification | `vat_operation_type` | `vat_operation_type_must_be_valid_gravada_exenta_no_gravada` | solo acepta `GRAVADA` / `EXENTA` / `NO_GRAVADA` |
| F8-R005 | Alicuota valida para operaciones gravadas | calculo de debito/credito fiscal incorrecto | vat/rates | `vat_rate` | `vat_rate_must_be_valid_for_taxed_operation` | gravadas requieren alicuota del catalogo permitido |
| F8-R006 | Libro IVA ventas se construye desde comprobantes scopeados | libro contaminado con datos de otra empresa | vat/sales/book | `voucher` + `vat_view` | `vat_sales_book_is_built_from_scoped_vouchers_only` | ventas incluye solo comprobantes del scope activo |
| F8-R007 | Libro IVA compras se construye desde comprobantes scopeados | libro contaminado con datos de otra empresa | vat/purchases/book | `voucher` + `vat_view` | `vat_purchases_book_is_built_from_scoped_vouchers_only` | compras incluye solo comprobantes del scope activo |
| F8-R008 | Reporte mensual IVA por empresa y periodo | reporte cruzado o fuera de periodo | vat/monthly-report | `GET /vat/monthly-report` | `vat_monthly_report_is_scoped_by_company_and_period` | reporte respeta `companyId` + periodo |
| F8-R009 | Exportacion CSV/Excel scopeada por tenant | fuga de datos por exportacion | vat/export | `GET /vat/export` | `vat_export_csv_is_scoped_by_company_and_period` | exporta solo datos del scope activo |
| F8-R010 | Conciliacion IVA contra contabilidad desde asientos confirmados | conciliacion inconsistente con libro legal | vat/reconciliation | `GET /vat/reconciliation` + `journal_entry` | `vat_reconciliation_matches_confirmed_accounting_entries` | conciliacion usa solo asientos `CONFIRMADO` |
| F8-R011 | Acciones criticas IVA auditadas | falta trazabilidad fiscal | vat/audit | `audit_logs` eventos IVA | `critical_phase8_actions_create_audit_log` | generacion de libros/reportes/export y conciliacion quedan auditadas |
