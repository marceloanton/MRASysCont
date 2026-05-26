# TESTING_STRATEGY

## Objetivo
Asegurar calidad funcional, aislamiento y cumplimiento de invariantes criticos.

## Canonico
- Cobertura critica Fase 1: `docs/CRITICAL_TEST_COVERAGE.md`
- Trazabilidad requisito->test: `docs/TRACEABILITY_MATRIX.md`
- Gates de CI: `docs/CI_QUALITY_GATES.md`

## Suites obligatorias
1. permisos y object authorization
2. aislamiento multi-tenant
3. invariantes contables
4. transiciones de estado
5. idempotencia
6. concurrencia/locking

## Mapeo temporal de scripts CI (pre-suites dedicadas)
- `test:unit`: valida utilidades e invariantes puros existentes.
- `test:integration`: ejecuta flujos integrados actuales disponibles.
- `test:tenancy`: ejecuta suite dedicada de tenancy (`lib/phase1/tenant-access.test.ts`).
- `test:permissions`: filtra casos de permisos/autorizacion sobre la suite de tenancy.
- `test:contract`: placeholder controlado.
  - Si no existe `openapi.yaml`, informa TODO y finaliza OK.
  - Si existe `openapi.yaml`, mantiene TODO explicito hasta implementar validador formal de contrato.

## Regla de fase
No se cierra Fase 1 si falta cualquier test critico definido.

## Regla de fase 2
No se inicia implementacion funcional de Fase 2 si no estan cerrados:
- requisitos trazables en `docs/TRACEABILITY_MATRIX.md`,
- endpoints autorizados en `docs/ENDPOINT_AUTHORIZATION.md`,
- transiciones en `docs/STATE_MACHINE.md`,
- cobertura minima en `docs/CRITICAL_TEST_COVERAGE.md`.

No se cierra Fase 2 si falta cualquier test critico Fase 2 listado.

## Suites minimas obligatorias Fase 2
1. permisos Fase 2 (clientes/tareas/vencimientos/estado mensual)
2. aislamiento multi-tenant por `studyId`
3. object authorization sobre `clientOfStudyId`/`taskId`/`deadlineId`
4. transiciones de estado mensual y tareas
5. auditoria de acciones criticas Fase 2

## Tests criticos Fase 2 (canonicos)
- `accountant_can_create_client_in_study`
- `assistant_cannot_create_client_without_permission`
- `client_record_requires_study_id`
- `cannot_access_client_from_other_study`
- `client_list_is_scoped_by_study`
- `can_assign_internal_responsible_to_client`
- `cannot_assign_responsible_from_other_study`
- `task_requires_study_scope`
- `assistant_sees_only_assigned_tasks`
- `cannot_access_task_from_other_study`
- `deadline_requires_study_scope`
- `deadline_list_is_scoped_by_study`
- `monthly_status_transition_is_valid`
- `monthly_status_invalid_transition_returns_409`
- `critical_phase2_actions_create_audit_log`

## CI Gate
PR bloqueada si falla cualquier gate bloqueante de `CI_QUALITY_GATES.md`.

## Regla de fase 3
No se inicia implementacion funcional de Fase 3 si no estan cerrados:
- requisitos trazables en `docs/TRACEABILITY_MATRIX.md`,
- endpoints autorizados en `docs/ENDPOINT_AUTHORIZATION.md`,
- transiciones en `docs/STATE_MACHINE.md`,
- cobertura minima en `docs/CRITICAL_TEST_COVERAGE.md`.

No se cierra Fase 3 si falta cualquier test critico Fase 3 listado.

## Suites minimas obligatorias Fase 3
1. permisos Fase 3 (terceros y cuenta corriente)
2. aislamiento multi-tenant por `studyId` + `companyId`
3. object authorization sobre `thirdPartyId`
4. transiciones de estados criticos (tercero y movimientos)
5. auditoria de alta/edicion/movimientos
6. integridad de saldos y estado de cuenta

## Tests criticos Fase 3 (canonicos)
- `third_party_requires_study_and_company_scope`
- `cannot_create_third_party_for_foreign_company`
- `third_party_list_is_scoped_by_company`
- `cannot_access_third_party_from_other_company`
- `movement_requires_company_id`
- `movement_requires_third_party_id`
- `cannot_post_movement_for_third_party_from_other_company`
- `third_party_balance_is_scoped_by_company`
- `third_party_statement_is_scoped_by_company`
- `critical_phase3_actions_create_audit_log`

## Regla de fase 4
No se inicia implementacion funcional de Fase 4 si no estan cerrados:
- requisitos trazables en `docs/TRACEABILITY_MATRIX.md`,
- endpoints autorizados en `docs/ENDPOINT_AUTHORIZATION.md`,
- transiciones en `docs/STATE_MACHINE.md`,
- cobertura minima en `docs/CRITICAL_TEST_COVERAGE.md`.

No se cierra Fase 4 si falta cualquier test critico Fase 4 listado.

## Suites minimas obligatorias Fase 4
1. invariantes contables de partida doble
2. permisos y object authorization de asientos/periodos
3. aislamiento multi-tenant por `studyId` + `companyId`
4. transiciones de estado de periodo y asiento
5. construccion de Libro Diario y Libro Mayor desde confirmados
6. auditoria de confirmacion, reversa y cierre/reapertura de periodo

## Tests criticos Fase 4 (canonicos)
- `cannot_confirm_unbalanced_entry`
- `cannot_modify_confirmed_entry`
- `cannot_operate_in_closed_period`
- `journal_entry_requires_study_and_company_scope`
- `cannot_access_journal_entry_from_other_company`
- `double_entry_totals_must_match`
- `journal_book_is_built_from_confirmed_entries_only`
- `ledger_is_built_from_confirmed_entries_only`
- `critical_phase4_actions_create_audit_log`

## Regla de fase 5
No se inicia implementacion funcional de Fase 5 (expediente documental) si no estan cerrados:
- requisitos trazables en `docs/TRACEABILITY_MATRIX.md`,
- endpoints autorizados en `docs/ENDPOINT_AUTHORIZATION.md`,
- transiciones en `docs/STATE_MACHINE.md`,
- cobertura minima en `docs/CRITICAL_TEST_COVERAGE.md`.

No se cierra Fase 5 si falta cualquier test critico Fase 5 listado.

## Tests criticos Fase 5 (canonicos)
- `document_requires_study_scope`
- `cannot_create_document_for_foreign_study`
- `document_list_is_scoped_by_study`
- `cannot_access_document_from_other_study`
- `document_download_requires_authorization`
- `document_download_is_audited`
- `document_status_transition_is_valid`
- `document_invalid_transition_returns_409`
- `document_version_list_is_scoped_by_study`
- `critical_phase5_actions_create_audit_log`
- `client_can_upload_own_document`
- `client_can_read_own_uploaded_documents`
- `client_can_download_published_document`
- `client_cannot_download_internal_document`
- `client_cannot_review_document`
- `document_folder_scope_by_client_company_period`
- `document_search_is_scoped_by_study`
- `missing_documents_report_is_scoped_by_study`

## Suites minimas obligatorias Fase 5 (adicional)
1. permisos portal cliente documental (subida/lectura/descarga publicada)
2. bloqueo de revision documental para cliente
3. organizacion por carpeta cliente/empresa/periodo
4. buscador y filtros con scope tenant
5. control de faltantes scopeado por tenant/periodo

## Regla de fase 6
No se inicia implementacion funcional de Fase 6 (multimoneda) si no estan cerrados:
- requisitos trazables en `docs/TRACEABILITY_MATRIX.md`,
- endpoints autorizados en `docs/ENDPOINT_AUTHORIZATION.md`,
- transiciones en `docs/STATE_MACHINE.md`,
- cobertura minima en `docs/CRITICAL_TEST_COVERAGE.md`.

No se cierra Fase 6 si falta cualquier test critico Fase 6 listado.

## Tests criticos Fase 6 (canonicos)
- `exchange_rate_required_for_usd_posting`
- `cannot_post_usd_without_original_amount`
- `cannot_post_usd_without_ars_equivalent`
- `rounding_policy_is_consistent_for_fx_conversion`
- `fx_entry_requires_study_and_company_scope`
- `cannot_access_fx_entry_from_other_company`
- `fx_report_shows_original_and_ars_amounts`
- `critical_phase6_fx_actions_create_audit_log`

## Suites minimas obligatorias Fase 6
1. validaciones FX de posting (USD -> ARS contable)
2. precision Decimal y redondeo centralizado
3. aislamiento tenant para tasas y asientos FX
4. object authorization sobre `fxEntryId`
5. reportes con moneda original + ARS
6. auditoria de acciones criticas FX

## Regla de fase 7
No se inicia implementacion funcional de Fase 7 (comprobantes locales) si no estan cerrados:
- requisitos trazables en `docs/TRACEABILITY_MATRIX.md`,
- endpoints autorizados en `docs/ENDPOINT_AUTHORIZATION.md`,
- transiciones en `docs/STATE_MACHINE.md`,
- cobertura minima en `docs/CRITICAL_TEST_COVERAGE.md`.

No se cierra Fase 7 si falta cualquier test critico Fase 7 listado.

## Tests criticos Fase 7 (canonicos)
- `voucher_requires_study_and_company_scope`
- `cannot_create_voucher_for_foreign_company`
- `voucher_number_is_unique_by_company_point_of_sale_type`
- `emitted_voucher_number_is_assigned_on_confirm_only`
- `cannot_confirm_voucher_without_proposed_entry`
- `cannot_confirm_voucher_if_linked_entry_unbalanced`
- `cannot_confirm_voucher_if_period_closed`
- `voucher_state_transition_is_valid`
- `voucher_invalid_transition_returns_409`
- `voucher_pdf_generation_respects_tenant_scope`
- `voucher_qr_placeholder_is_generated_without_cae`
- `critical_phase7_actions_create_audit_log`

## Suites minimas obligatorias Fase 7
1. validaciones de alcance tenant para comprobantes (`studyId` + `companyId`)
2. reglas de numeracion por empresa/punto de venta/tipo
3. confirmacion vs borrador con asiento propuesto vinculado
4. bloqueo por periodo contable cerrado
5. state machine de comprobantes
6. PDF local + QR placeholder con autorizacion por objeto
7. auditoria de acciones criticas de comprobantes

## Regla de fase 8
No se inicia implementacion funcional de Fase 8 (IVA base) si no estan cerrados:
- requisitos trazables en `docs/TRACEABILITY_MATRIX.md`,
- endpoints autorizados en `docs/ENDPOINT_AUTHORIZATION.md`,
- transiciones en `docs/STATE_MACHINE.md`,
- cobertura minima en `docs/CRITICAL_TEST_COVERAGE.md`.

No se cierra Fase 8 si falta cualquier test critico Fase 8 listado.

## Tests criticos Fase 8 (canonicos)
- `vat_sale_requires_study_and_company_scope`
- `vat_purchase_requires_study_and_company_scope`
- `cannot_access_vat_book_from_other_company`
- `vat_operation_type_must_be_valid_gravada_exenta_no_gravada`
- `vat_rate_must_be_valid_for_taxed_operation`
- `vat_sales_book_is_built_from_scoped_vouchers_only`
- `vat_purchases_book_is_built_from_scoped_vouchers_only`
- `vat_monthly_report_is_scoped_by_company_and_period`
- `vat_export_csv_is_scoped_by_company_and_period`
- `vat_reconciliation_matches_confirmed_accounting_entries`
- `critical_phase8_actions_create_audit_log`

## Suites minimas obligatorias Fase 8
1. validacion de clasificacion fiscal (`GRAVADA` / `EXENTA` / `NO_GRAVADA`)
2. validacion de alicuotas permitidas y base imponible
3. libros IVA ventas/compras por scope tenant
4. reporte mensual por `companyId` + `period`
5. exportacion CSV/Excel con control de scope tenant
6. conciliacion IVA contra asientos `CONFIRMADO`
7. auditoria de acciones criticas IVA
