# MRASysCont - Endpoint Authorization

## Principio
Todo endpoint debe validar en backend:
1. usuario autenticado
2. usuario activo
3. pertenencia al estudio
4. permiso de accion
5. alcance sobre objeto
6. alcance sobre empresa/cliente si aplica
7. estado del recurso si aplica

## Politica de respuestas
- 401: no autenticado
- 403: autenticado sin permiso funcional
- 404: recurso inexistente o fuera de alcance (segun politica antienumeracion)
- 409: estado invalido para accion
- 422: validacion de datos

## Endpoints Fase 1
| Endpoint | Permiso requerido | Alcance | Validacion de objeto | Tests obligatorios |
|---|---|---|---|---|
| `POST /auth/login` | publico | n/a | usuario activo | `inactive_user_cannot_login`, `valid_user_can_login` |
| `GET /me` | autenticado | own_user_scope | usuario propio | `user_can_get_own_profile` |
| `GET /studies/current` | autenticado | study_scope | estudio del usuario | `user_can_get_own_study`, `user_cannot_get_foreign_study` |
| `POST /companies` | `companies:create` | study_scope | empresa se crea en estudio activo | `accountant_can_create_company`, `client_cannot_create_company` |
| `GET /companies` | `companies:read` | study_scope | filtrar por estudio+asignacion | `assistant_sees_only_assigned_companies`, `client_sees_only_own_company` |
| `GET /companies/:id` | `companies:read` | company_scope | empresa pertenece al estudio y al alcance | `cannot_get_foreign_company_by_id` |
| `PATCH /companies/:id` | `companies:update` | company_scope | idem anterior | `cannot_update_foreign_company`, `client_cannot_update_company` |
| `POST /users` | `users:create` | study_scope | nuevo usuario del mismo estudio | `accountant_can_create_user`, `assistant_cannot_create_user` |
| `GET /users` | `users:read` | study_scope | filtrar por estudio | `user_list_is_scoped_by_study` |
| `GET /users/:id` | `users:read` | study_scope | usuario del mismo estudio | `cannot_get_user_from_other_study` |
| `PATCH /users/:id/roles` | `roles:assign` | study_scope | actor y target mismo estudio | `assistant_cannot_change_roles`, `role_change_creates_audit_log` |
| `POST /users/:id/companies` | `users:assign_company` | study_scope+company_scope | usuario y empresa del estudio activo | `cannot_assign_foreign_company_to_user`, `company_assignment_creates_audit_log` |
| `DELETE /users/:id/companies/:companyId` | `users:assign_company` | study_scope+company_scope | idem anterior | `company_unassignment_creates_audit_log` |
| `POST /session/active-company` | autenticado | company_scope + study_scope | solo empresa asignada, activa y del estudio activo | `cannot_select_unassigned_company`, `cannot_select_suspended_company`, `cannot_select_company_from_other_study`, `active_company_must_belong_to_active_study` |
| `GET /audit-logs` | `audit:read` | study_scope | filtrar por estudio | `audit_logs_are_scoped_by_study`, `client_cannot_read_audit_logs` |

## Endpoints Fase 2
| Endpoint | Permiso requerido | Scope tenant | Validacion de objeto | Tests obligatorios |
|---|---|---|---|---|
| `POST /clients` | `clients:create` | `studyId` | cliente se crea en estudio activo | `accountant_can_create_client_in_study`, `assistant_cannot_create_client_without_permission`, `client_record_requires_study_id` |
| `GET /clients` | `clients:read` | `studyId` | listado filtrado por estudio | `client_list_is_scoped_by_study` |
| `GET /clients/:id` | `clients:read` | `studyId` + `clientOfStudyId` | cliente pertenece al estudio activo | `cannot_access_client_from_other_study` |
| `PATCH /clients/:id` | `clients:update` | `studyId` + `clientOfStudyId` | idem anterior | `cannot_access_client_from_other_study` |
| `POST /clients/:id/services` | `clients:update` | `studyId` + `clientOfStudyId` | servicio ligado a cliente del estudio | `client_record_requires_study_id` |
| `POST /clients/:id/responsible` | `clients:assign_responsible` | `studyId` + `clientOfStudyId` | usuario responsable debe pertenecer al mismo estudio | `can_assign_internal_responsible_to_client`, `cannot_assign_responsible_from_other_study` |
| `PATCH /clients/:id/monthly-status` | `clients:update_status` | `studyId` + `clientOfStudyId` | transicion valida de estado mensual | `monthly_status_transition_is_valid`, `monthly_status_invalid_transition_returns_409` |
| `POST /tasks` | `tasks:create` | `studyId` + `clientOfStudyId?` + `companyId?` | no crear tarea sin `studyId`; `companyId` debe pertenecer a estudio | `task_requires_study_scope` |
| `GET /tasks` | `tasks:read` | `studyId` | filtrar por estudio y alcance de usuario | `assistant_sees_only_assigned_tasks` |
| `GET /tasks/:id` | `tasks:read` | `studyId` | tarea pertenece al estudio activo | `cannot_access_task_from_other_study` |
| `PATCH /tasks/:id` | `tasks:update` | `studyId` | idem anterior + estado valido | `cannot_access_task_from_other_study` |
| `POST /deadlines` | `deadlines:create` | `studyId` + `clientOfStudyId` + `companyId?` | no crear vencimiento sin scope de estudio | `deadline_requires_study_scope` |
| `GET /deadlines` | `deadlines:read` | `studyId` | listado filtrado por estudio | `deadline_list_is_scoped_by_study` |
| `GET /dashboard/study` | `dashboard:read` | `studyId` | agregados solo del estudio activo | `client_list_is_scoped_by_study` |

## Endpoints Fase 3
| Endpoint | Permiso requerido | Scope tenant | Validacion de objeto | Tests obligatorios |
|---|---|---|---|---|
| `POST /third-parties` | `third_parties:create` | `studyId` + `companyId` | tercero se crea en empresa activa del estudio activo | `third_party_requires_study_and_company_scope`, `cannot_create_third_party_for_foreign_company` |
| `GET /third-parties` | `third_parties:read` | `studyId` + `companyId` | listado filtrado por empresa activa | `third_party_list_is_scoped_by_company` |
| `GET /third-parties/:id` | `third_parties:read` | `studyId` + `companyId` + `thirdPartyId` | tercero pertenece a empresa activa | `cannot_access_third_party_from_other_company` |
| `PATCH /third-parties/:id` | `third_parties:update` | `studyId` + `companyId` + `thirdPartyId` | idem anterior | `cannot_access_third_party_from_other_company` |
| `POST /current-account/movements` | `current_account:post` | `studyId` + `companyId` + `thirdPartyId` | movimiento requiere tercero de la empresa activa | `movement_requires_company_id`, `movement_requires_third_party_id`, `cannot_post_movement_for_third_party_from_other_company` |
| `GET /current-account/balance` | `current_account:read` | `studyId` + `companyId` + `thirdPartyId` | saldo solo del scope activo | `third_party_balance_is_scoped_by_company` |
| `GET /current-account/statement` | `current_account:read` | `studyId` + `companyId` + `thirdPartyId` | estado de cuenta solo del scope activo | `third_party_statement_is_scoped_by_company` |

## Endpoints Fase 4
| Endpoint | Permiso requerido | Scope tenant | Validacion de objeto | Tests obligatorios |
|---|---|---|---|---|
| `POST /accounting/chart-templates` | `accounting_templates:create` | `studyId` o global controlado | plantilla no cruza estudios/empresas operativas | `journal_entry_requires_study_and_company_scope` |
| `POST /accounting/accounts` | `accounting_accounts:create` | `studyId` + `companyId` | cuenta asociada a empresa activa del estudio activo | `journal_entry_requires_study_and_company_scope` |
| `GET /accounting/accounts` | `accounting_accounts:read` | `studyId` + `companyId` | listado filtrado por empresa activa | `cannot_access_journal_entry_from_other_company` |
| `POST /accounting/periods` | `accounting_periods:create` | `studyId` + `companyId` | periodo asociado a empresa activa | `cannot_operate_in_closed_period` |
| `PATCH /accounting/periods/:id/close` | `accounting_periods:close` | `studyId` + `companyId` + `periodId` | periodo pertenece a empresa activa; cierre auditado | `cannot_operate_in_closed_period`, `critical_phase4_actions_create_audit_log` |
| `PATCH /accounting/periods/:id/reopen` | `accounting_periods:reopen` | `studyId` + `companyId` + `periodId` | reapertura solo con permiso explicito y auditoria | `critical_phase4_actions_create_audit_log` |
| `POST /accounting/entries` | `journal_entries:create` | `studyId` + `companyId` + `periodId` | no crear en periodo cerrado | `journal_entry_requires_study_and_company_scope`, `cannot_operate_in_closed_period` |
| `GET /accounting/entries` | `journal_entries:read` | `studyId` + `companyId` | listado filtrado por empresa activa | `cannot_access_journal_entry_from_other_company` |
| `GET /accounting/entries/:id` | `journal_entries:read` | `studyId` + `companyId` + `entryId` | asiento pertenece a empresa activa | `cannot_access_journal_entry_from_other_company` |
| `PATCH /accounting/entries/:id` | `journal_entries:update_draft` | `studyId` + `companyId` + `entryId` | solo asientos borrador editables | `cannot_modify_confirmed_entry` |
| `POST /accounting/entries/:id/confirm` | `journal_entries:confirm` | `studyId` + `companyId` + `entryId` | valida partida doble y periodo abierto | `cannot_confirm_unbalanced_entry`, `double_entry_totals_must_match`, `cannot_operate_in_closed_period`, `critical_phase4_actions_create_audit_log` |
| `POST /accounting/entries/:id/reverse` | `journal_entries:reverse` | `studyId` + `companyId` + `entryId` | reversa por contraasiento, no edicion directa | `cannot_modify_confirmed_entry`, `critical_phase4_actions_create_audit_log` |
| `GET /accounting/journal-book` | `journal_book:read` | `studyId` + `companyId` + `periodId` | construccion desde asientos confirmados | `journal_book_is_built_from_confirmed_entries_only` |
| `GET /accounting/ledger` | `ledger:read` | `studyId` + `companyId` + `periodId` | construccion desde asientos confirmados | `ledger_is_built_from_confirmed_entries_only` |

## Endpoints Fase 5
| Endpoint | Permiso requerido | Scope tenant | Validacion de objeto | Tests obligatorios |
|---|---|---|---|---|
| `POST /documents` | `documents:create` | `studyId` + `clientOfStudyId?` + `companyId?` + `period?` | no crear sin `studyId`; `clientOfStudyId` y `companyId` del estudio activo; carpeta por periodo opcional | `document_requires_study_scope`, `cannot_create_document_for_foreign_study` |
| `GET /documents` | `documents:read` | `studyId` + filtros `clientOfStudyId?` + `companyId?` + `period?` + `category?` + `status?` + `q?` | listado filtrado por estudio y alcance del actor | `document_list_is_scoped_by_study`, `document_search_is_scoped_by_study` |
| `GET /documents/:id` | `documents:read` | `studyId` + `documentId` | documento pertenece al estudio activo | `cannot_access_document_from_other_study` |
| `PATCH /documents/:id/status` | `documents:review` | `studyId` + `documentId` | transicion valida por state machine; cliente no aprueba/rechaza | `document_status_transition_is_valid`, `document_invalid_transition_returns_409`, `client_cannot_review_document` |
| `POST /documents/:id/download` | `documents:download` | `studyId` + `documentId` | no descargar fuera de scope; registrar auditoria | `document_download_requires_authorization`, `document_download_is_audited` |
| `GET /documents/:id/versions` | `documents:read` | `studyId` + `documentId` | versiones solo del documento autorizado | `document_version_list_is_scoped_by_study` |
| `GET /documents/missing` | `documents:read` | `studyId` + `clientOfStudyId?` + `companyId?` + `period?` | control de documentacion faltante por carpeta/periodo y alcance | `missing_documents_report_is_scoped_by_study` |

## Endpoints Fase 6
| Endpoint | Permiso requerido | Scope tenant | Validacion de objeto | Tests obligatorios |
|---|---|---|---|---|
| `POST /fx/exchange-rates` | `fx_rates:create` | `studyId` + `companyId` | tipo de cambio por fecha/moneda y alcance activo | `exchange_rate_required_for_usd_posting` |
| `GET /fx/exchange-rates` | `fx_rates:read` | `studyId` + `companyId` | listado filtrado por empresa activa | `fx_entry_requires_study_and_company_scope` |
| `POST /fx/entries` | `fx_entries:create` | `studyId` + `companyId` | USD requiere `originalCurrency`, `originalAmount`, `exchangeRate`, `accountingAmountArs` | `exchange_rate_required_for_usd_posting`, `cannot_post_usd_without_original_amount`, `cannot_post_usd_without_ars_equivalent`, `fx_entry_requires_study_and_company_scope` |
| `GET /fx/entries/:id` | `fx_entries:read` | `studyId` + `companyId` + `fxEntryId` | entrada pertenece a empresa activa | `cannot_access_fx_entry_from_other_company` |
| `GET /reports/fx` | `reports:read` | `studyId` + `companyId` + `periodId?` | reporte muestra importes original y ARS | `fx_report_shows_original_and_ars_amounts` |

## Endpoints Fase 7
| Endpoint | Permiso requerido | Scope tenant | Validacion de objeto | Tests obligatorios |
|---|---|---|---|---|
| `POST /vouchers` | `vouchers:create` | `studyId` + `companyId` + `thirdPartyId` | tercero pertenece a la empresa activa del estudio activo | `voucher_requires_study_and_company_scope`, `cannot_create_voucher_for_foreign_company` |
| `GET /vouchers` | `vouchers:read` | `studyId` + `companyId` | listado filtrado por empresa activa | `voucher_requires_study_and_company_scope` |
| `GET /vouchers/:id` | `vouchers:read` | `studyId` + `companyId` + `voucherId` | comprobante pertenece a empresa activa | `voucher_requires_study_and_company_scope` |
| `PATCH /vouchers/:id` | `vouchers:update_draft` | `studyId` + `companyId` + `voucherId` | solo borradores editables | `voucher_invalid_transition_returns_409` |
| `POST /vouchers/:id/confirm` | `vouchers:confirm` + `journal_entries:confirm` | `studyId` + `companyId` + `voucherId` | exige asiento propuesto, balanceado y periodo abierto; asigna numero en EMITIDO | `emitted_voucher_number_is_assigned_on_confirm_only`, `cannot_confirm_voucher_without_proposed_entry`, `cannot_confirm_voucher_if_linked_entry_unbalanced`, `cannot_confirm_voucher_if_period_closed`, `voucher_number_is_unique_by_company_point_of_sale_type` |
| `POST /vouchers/:id/cancel` | `vouchers:cancel` | `studyId` + `companyId` + `voucherId` | solo estado permitido por state machine; sin editar confirmados | `voucher_state_transition_is_valid`, `voucher_invalid_transition_returns_409` |
| `GET /vouchers/:id/pdf` | `vouchers:read` | `studyId` + `companyId` + `voucherId` | genera PDF local solo del scope activo | `voucher_pdf_generation_respects_tenant_scope`, `voucher_qr_placeholder_is_generated_without_cae` |

## Endpoints Fase 8
| Endpoint | Permiso requerido | Scope tenant | Validacion de objeto | Tests obligatorios |
|---|---|---|---|---|
| `GET /vat/sales-book` | `vat:sales:read` | `studyId` + `companyId` + `period` | libro IVA ventas solo del scope activo | `vat_sale_requires_study_and_company_scope`, `vat_sales_book_is_built_from_scoped_vouchers_only` |
| `GET /vat/purchases-book` | `vat:purchases:read` | `studyId` + `companyId` + `period` | libro IVA compras solo del scope activo | `vat_purchase_requires_study_and_company_scope`, `vat_purchases_book_is_built_from_scoped_vouchers_only` |
| `GET /vat/monthly-report` | `vat:report:read` | `studyId` + `companyId` + `period` | reporte mensual por empresa/periodo | `vat_monthly_report_is_scoped_by_company_and_period` |
| `GET /vat/export` | `vat:export` | `studyId` + `companyId` + `period` + `format` | exportacion CSV/Excel sin cruce tenant | `vat_export_csv_is_scoped_by_company_and_period` |
| `GET /vat/reconciliation` | `vat:reconciliation:read` | `studyId` + `companyId` + `period` | conciliacion contra asientos confirmados del scope activo | `vat_reconciliation_matches_confirmed_accounting_entries`, `cannot_access_vat_book_from_other_company` |
| `POST /vat/classify/:voucherId` | `vat:classify` | `studyId` + `companyId` + `voucherId` | valida tipo de operacion/alicuota/base imponible | `vat_operation_type_must_be_valid_gravada_exenta_no_gravada`, `vat_rate_must_be_valid_for_taxed_operation` |

Reglas Fase 6:
- No usar `float/double` para calculo/almacenamiento monetario.
- Redondeo FX centralizado (no por endpoint/pantalla).
- Toda accion critica FX (alta tasa, alta/reversa de entrada, ajuste) debe auditarse.

Reglas Fase 7:
- No implementar ARCA/AFIP ni CAE real en Fase 7.
- QR fiscal es local y placeholder (`codAut=0`).
- No confirmar comprobante sin asiento propuesto valido.
- No confirmar comprobante con periodo cerrado.
- No permitir numeracion duplicada por `studyId` + `companyId` + `pointOfSale` + `type` + `number`.
- No permitir modificacion de comprobantes confirmados.
- Toda accion critica (alta, confirmacion, anulacion, PDF) debe auditarse.

Reglas Fase 8:
- Scope obligatorio por `studyId` + `companyId` + `period`.
- Tipos validos de operacion IVA: `GRAVADA`, `EXENTA`, `NO_GRAVADA`.
- Alicuotas validas se aplican solo a operaciones `GRAVADA`.
- Reportes/libros/exportaciones no pueden mezclar empresas ni periodos.
- Conciliacion IVA se calcula exclusivamente con asientos contables `CONFIRMADO`.
- Exportaciones CSV/Excel requieren autorizacion y auditoria.
- Toda accion critica IVA (libros/reportes/export/conciliacion) debe auditarse.

Politica CLIENTE para Fase 5 (obligatoria):
- Puede subir documentos propios de su alcance.
- Puede ver documentos propios subidos por el.
- Puede ver/descargar solo documentos publicados/autorizados para cliente.
- No puede aprobar/rechazar documentos.
- No puede ver documentos internos del estudio.
- No puede acceder a recursos de otro `studyId`/`clientOfStudyId`/`companyId`.

## Patron obligatorio
Para endpoints con `:id`:
1. autenticar
2. cargar recurso
3. validar `estudio_id`
4. validar alcance `cliente_id`/`empresa_id` si aplica
5. validar permiso
6. validar estado
7. ejecutar accion
8. auditar accion critica

## Criterio de cierre
- Endpoints Fase 1 con permiso+alcance+tests definidos.
- Politica 401/403/404/409/422 cerrada.
