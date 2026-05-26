# Fase 2 - Items Diferidos Formales

## Item diferido: Servicios contratados por cliente

Estado: `DEFERRED`

Motivo:
- El modelo de datos `ClientService` existe en Prisma.
- No hay endpoints/acciones/flujo UI implementados para alta/listado/baja logica de servicios.
- Se priorizo cierre de tenancy, permisos, tareas, vencimientos, estado mensual y dashboard base.

Riesgo aceptado temporalmente:
- El estudio no puede gestionar servicios contratados desde el sistema en esta iteracion.

Criterio de reingreso (obligatorio antes de marcar Fase 2 como 100% funcional):
1. Implementar endpoints canonicos:
   - `POST /clients/:id/services`
   - `GET /clients/:id/services`
   - `PATCH /clients/:id/services/:serviceId`
   - `DELETE /clients/:id/services/:serviceId` (baja logica)
2. Validar autorizacion por objeto en backend:
   - `studyId` del actor == `studyId` del cliente
   - `service.clientOfStudyId` pertenece al mismo `studyId`
3. Auditar acciones criticas:
   - alta, edicion y baja logica de servicio
4. Agregar tests minimos:
   - `accountant_can_create_service_for_client_in_study`
   - `assistant_cannot_create_service_without_permission`
   - `cannot_access_service_from_other_study`
   - `service_list_is_scoped_by_study`
   - `service_actions_create_audit_log`
5. Actualizar documentos canonicos:
   - `docs/TRACEABILITY_MATRIX.md`
   - `docs/CRITICAL_TEST_COVERAGE.md`
   - `docs/ENDPOINT_AUTHORIZATION.md`
   - `docs/API_CONTRACT.md`

