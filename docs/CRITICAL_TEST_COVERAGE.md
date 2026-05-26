# MRASysCont - Critical Test Coverage

## Regla
Fase 1 no se considera completa si falta cualquier test critico listado.

## Auth
| Test | Tipo | Riesgo |
|---|---|---|
| `valid_user_can_login` | integration | login basico |
| `invalid_password_cannot_login` | integration | acceso no autorizado |
| `inactive_user_cannot_login` | integration | usuario baja accede |
| `disabled_user_cannot_login` | integration | usuario deshabilitado accede |
| `login_failure_is_logged` | integration | ataques sin auditoria |

## Usuarios y roles
| Test | Tipo | Riesgo |
|---|---|---|
| `accountant_can_create_user_in_same_study` | integration | alta funcional |
| `assistant_cannot_create_user` | permission | escalada |
| `client_cannot_create_user` | permission | abuso portal |
| `cannot_get_user_from_other_study` | tenancy | fuga entre estudios |
| `assistant_cannot_change_roles` | permission | escalada |
| `role_change_creates_audit_log` | audit | sin trazabilidad |

## Empresas
| Test | Tipo | Riesgo |
|---|---|---|
| `accountant_can_create_company` | integration | alta funcional |
| `client_cannot_create_company` | permission | abuso |
| `company_requires_study_id` | integration | empresa huerfana |
| `company_list_is_scoped_by_study` | tenancy | fuga estudio |
| `assistant_sees_only_assigned_companies` | tenancy | fuga empresa |
| `client_sees_only_own_company` | tenancy | fuga portal |
| `cannot_get_foreign_company_by_id` | BOLA | manipulacion id |
| `cannot_update_foreign_company` | BOLA | manipulacion id |

## Asignacion usuario-empresa
| Test | Tipo | Riesgo |
|---|---|---|
| `accountant_can_assign_company_to_user` | integration | asignacion funcional |
| `cannot_assign_company_from_other_study` | tenancy | cruce tenant |
| `cannot_assign_foreign_user_to_company` | tenancy | cruce tenant |
| `company_assignment_creates_audit_log` | audit | sin trazabilidad |
| `revoked_assignment_blocks_access` | permission | acceso residual |

## Selector de empresa
| Test | Tipo | Riesgo |
|---|---|---|
| `user_can_select_assigned_company` | integration | selector funcional |
| `cannot_select_unassigned_company` | permission | manipulacion empresa |
| `cannot_select_company_from_other_study` | tenancy | fuga tenant |
| `cannot_select_suspended_company` | state | operacion invalida |
| `active_company_is_used_by_operational_middleware` | integration | contexto incorrecto |
| `active_company_must_belong_to_active_study` | tenancy | cruce estudio-empresa |

## Middleware y object authorization
| Test | Tipo | Riesgo |
|---|---|---|
| `operational_endpoint_requires_active_company` | integration | operacion sin contexto |
| `tampered_company_id_is_rejected` | BOLA | request manipulado |
| `foreign_resource_returns_expected_error` | BOLA | enumeracion/fuga |
| `permission_is_checked_in_backend` | permission | seguridad frontend-only |
| `denied_access_creates_security_log` | audit/security | ataque no auditado |

## Auditoria
| Test | Tipo | Riesgo |
|---|---|---|
| `critical_action_creates_audit_log` | audit | falta trazabilidad |
| `audit_logs_are_scoped_by_study` | tenancy | fuga logs |
| `client_cannot_read_audit_logs` | permission | exposicion interna |
| `audit_log_does_not_store_sensitive_data` | security | datos sensibles en logs |

## Migracion tenancy
| Test | Tipo | Riesgo |
|---|---|---|
| `existing_data_migrates_to_default_study` | migration | perdida o inconsistencia de datos legacy |
| `company_requires_study_id` | migration/integration | empresa huerfana |
| `user_company_assignment_requires_same_study` | migration/tenancy | cruce tenant en asignaciones |

## Fase 2 - Gestion del estudio contable
| Test | Tipo | Riesgo |
|---|---|---|
| `accountant_can_create_client_in_study` | integration | alta valida de cliente |
| `assistant_cannot_create_client_without_permission` | permission | escalada por asistente |
| `client_record_requires_study_id` | integration/tenancy | cliente huerfano |
| `cannot_access_client_from_other_study` | tenancy/BOLA | fuga entre estudios |
| `client_list_is_scoped_by_study` | tenancy | fuga por listados |
| `can_assign_internal_responsible_to_client` | integration | asignacion valida |
| `cannot_assign_responsible_from_other_study` | tenancy/permission | asignacion cruzada |
| `task_requires_study_scope` | tenancy | tarea sin frontera |
| `assistant_sees_only_assigned_tasks` | permission/tenancy | fuga de tareas |
| `cannot_access_task_from_other_study` | tenancy/BOLA | acceso cruzado |
| `deadline_requires_study_scope` | tenancy | vencimiento sin frontera |
| `deadline_list_is_scoped_by_study` | tenancy | fuga por listados |
| `monthly_status_transition_is_valid` | state | transicion valida no permitida |
| `monthly_status_invalid_transition_returns_409` | state | transicion invalida aceptada |
| `critical_phase2_actions_create_audit_log` | audit | falta trazabilidad |

## Fase 3 - Terceros y cuentas corrientes
| Test | Tipo | Riesgo |
|---|---|---|
| `third_party_requires_study_and_company_scope` | integration/tenancy | tercero sin frontera tenant |
| `cannot_create_third_party_for_foreign_company` | tenancy/permission | alta cruzada insegura |
| `third_party_list_is_scoped_by_company` | tenancy | fuga por listados |
| `cannot_access_third_party_from_other_company` | tenancy/BOLA | acceso cruzado por ID |
| `movement_requires_company_id` | integration | movimiento huerfano por empresa |
| `movement_requires_third_party_id` | integration | movimiento huerfano por tercero |
| `cannot_post_movement_for_third_party_from_other_company` | tenancy | cruce de tercero/empresa |
| `third_party_balance_is_scoped_by_company` | tenancy/accounting | saldo contaminado entre empresas |
| `third_party_statement_is_scoped_by_company` | tenancy/reporting | fuga por estado de cuenta |
| `critical_phase3_actions_create_audit_log` | audit | acciones criticas sin auditoria |

## Fase 4 - Nucleo contable
| Test | Tipo | Riesgo |
|---|---|---|
| `cannot_confirm_unbalanced_entry` | accounting/validation | confirmacion de asiento invalido |
| `cannot_modify_confirmed_entry` | accounting/state | alteracion de asiento inmutable |
| `cannot_operate_in_closed_period` | accounting/periods | registracion fuera de periodo habilitado |
| `journal_entry_requires_study_and_company_scope` | tenancy/integration | asiento sin frontera tenant |
| `cannot_access_journal_entry_from_other_company` | tenancy/BOLA | acceso cruzado por ID |
| `double_entry_totals_must_match` | accounting/invariant | partida doble inconsistente |
| `journal_book_is_built_from_confirmed_entries_only` | reporting/accounting | libro diario contaminado con borradores |
| `ledger_is_built_from_confirmed_entries_only` | reporting/accounting | libro mayor contaminado con borradores |
| `critical_phase4_actions_create_audit_log` | audit | acciones contables criticas sin trazabilidad |

## Fase 5 - Expediente documental
| Test | Tipo | Riesgo |
|---|---|---|
| `document_requires_study_scope` | integration/tenancy | documento sin frontera tenant |
| `cannot_create_document_for_foreign_study` | tenancy/permission | vinculacion cruzada insegura |
| `document_list_is_scoped_by_study` | tenancy | fuga por listados |
| `cannot_access_document_from_other_study` | tenancy/BOLA | acceso cruzado por ID |
| `document_download_requires_authorization` | permission/security | descarga sin permiso |
| `document_download_is_audited` | audit/security | accesos sensibles sin trazabilidad |
| `document_status_transition_is_valid` | state | transicion valida rechazada |
| `document_invalid_transition_returns_409` | state | transicion invalida aceptada |
| `document_version_list_is_scoped_by_study` | tenancy | fuga por versionado |
| `critical_phase5_actions_create_audit_log` | audit | acciones criticas sin auditoria |
| `client_can_upload_own_document` | permission/portal | bloqueo indebido de carga cliente |
| `client_can_read_own_uploaded_documents` | permission/portal | cliente sin acceso a propios documentos |
| `client_can_download_published_document` | permission/portal | cliente no puede descargar documento publicado |
| `client_cannot_download_internal_document` | permission/security | exposicion de documentos internos |
| `client_cannot_review_document` | permission/state | aprobacion/rechazo indebido por cliente |
| `document_folder_scope_by_client_company_period` | organization/tenancy | carpeta documental sin alcance consistente |
| `document_search_is_scoped_by_study` | search/tenancy | fuga por buscador |
| `missing_documents_report_is_scoped_by_study` | reporting/tenancy | reporte de faltantes cruzado |

## Fase 6 - Multimoneda
| Test | Tipo | Riesgo |
|---|---|---|
| `exchange_rate_required_for_usd_posting` | validation/fx | posting USD sin tipo de cambio |
| `cannot_post_usd_without_original_amount` | validation/fx | perdida de importe original |
| `cannot_post_usd_without_ars_equivalent` | accounting/fx | impacto contable ARS ausente |
| `rounding_policy_is_consistent_for_fx_conversion` | rounding/fx | diferencias por redondeo inconsistente |
| `fx_entry_requires_study_and_company_scope` | tenancy/fx | asiento FX sin frontera tenant |
| `cannot_access_fx_entry_from_other_company` | tenancy/BOLA | acceso cruzado por ID |
| `fx_report_shows_original_and_ars_amounts` | reporting/fx | reporte sin moneda original/ARS |
| `critical_phase6_fx_actions_create_audit_log` | audit/fx | acciones FX sin trazabilidad |

## Fase 7 - Comprobantes locales
| Test | Tipo | Riesgo |
|---|---|---|
| `voucher_requires_study_and_company_scope` | integration/tenancy | comprobante sin frontera tenant |
| `cannot_create_voucher_for_foreign_company` | tenancy/permission | alta cruzada insegura |
| `voucher_number_is_unique_by_company_point_of_sale_type` | numbering/invariant | duplicidad de numeracion fiscal local |
| `emitted_voucher_number_is_assigned_on_confirm_only` | workflow/numbering | huecos por numeracion temprana |
| `cannot_confirm_voucher_without_proposed_entry` | accounting/workflow | comprobante confirmado sin asiento propuesto |
| `cannot_confirm_voucher_if_linked_entry_unbalanced` | accounting/invariant | confirmacion con asiento desbalanceado |
| `cannot_confirm_voucher_if_period_closed` | accounting/periods | confirmacion fuera de periodo habilitado |
| `voucher_state_transition_is_valid` | state | transicion valida no permitida |
| `voucher_invalid_transition_returns_409` | state | transicion invalida aceptada |
| `voucher_pdf_generation_respects_tenant_scope` | security/tenancy | fuga por PDF de otro tenant |
| `voucher_qr_placeholder_is_generated_without_cae` | fiscal/local | QR marcando autorizacion inexistente |
| `critical_phase7_actions_create_audit_log` | audit | acciones criticas sin trazabilidad |

## Fase 8 - IVA base
| Test | Tipo | Riesgo |
|---|---|---|
| `vat_sale_requires_study_and_company_scope` | tenancy/integration | libro IVA ventas sin frontera tenant |
| `vat_purchase_requires_study_and_company_scope` | tenancy/integration | libro IVA compras sin frontera tenant |
| `cannot_access_vat_book_from_other_company` | tenancy/BOLA | acceso cruzado por objeto/filtros |
| `vat_operation_type_must_be_valid_gravada_exenta_no_gravada` | validation/fiscal | clasificacion fiscal invalida |
| `vat_rate_must_be_valid_for_taxed_operation` | validation/fiscal | alicuota invalida en operacion gravada |
| `vat_sales_book_is_built_from_scoped_vouchers_only` | reporting/tenancy | libro ventas contaminado |
| `vat_purchases_book_is_built_from_scoped_vouchers_only` | reporting/tenancy | libro compras contaminado |
| `vat_monthly_report_is_scoped_by_company_and_period` | reporting/tenancy | reporte mensual cruzado |
| `vat_export_csv_is_scoped_by_company_and_period` | export/security | fuga por exportacion |
| `vat_reconciliation_matches_confirmed_accounting_entries` | accounting/fiscal | conciliacion con asientos no confirmados |
| `critical_phase8_actions_create_audit_log` | audit/fiscal | acciones criticas IVA sin trazabilidad |
