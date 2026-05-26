# DATA_MODEL

## Objetivo
Definir fronteras de datos y entidades base para multi-tenant estricto.

## 1. Jerarquia
`estudios -> clientes_estudio -> empresas`

## 2. Entidades Nucleo
- `estudios`
- `study_memberships`
- `clientes_estudio`
- `empresas`
- `usuarios`
- `usuario_estudio`
- `usuario_empresa`
- `roles`
- `permisos`
- `sesiones` (`active_study_id`, `active_company_id`)

## 3. Entidades Operativas y Scope
- `asientos`: `estudio_id`, `empresa_id`
- `comprobantes`: `estudio_id`, `empresa_id`
- `documentos`: `estudio_id`, `cliente_id`, `empresa_id` opcional
- `tareas`: `estudio_id`, `cliente_id` opcional, `empresa_id` opcional
- `vencimientos`: `estudio_id`, `cliente_id`, `empresa_id` opcional
- `presentaciones`: `estudio_id`, `empresa_id`
- `honorarios`: `estudio_id`, `cliente_id`

### Nota transitoria de migracion
- En entidades operativas ya existentes, `studyId` puede permanecer nullable temporalmente por compatibilidad con fases previas.
- Esta excepcion es solo transitoria hasta completar migracion por modulo.
- Objetivo final obligatorio: todas las entidades operativas con frontera tenant deben tener `studyId NOT NULL`.
- Regla de diseño inmediata: nuevas entidades operativas no pueden crearse sin `studyId` requerido.

## 4. Constraints Criticos
- `UNIQUE (estudio_id, empresa_id, tipo_comprobante, punto_venta, numero)`
- `UNIQUE (estudio_id, empresa_id, periodo_id, numero_asiento)`
- `UNIQUE (estudio_id, empresa_id, codigo_cuenta)`
- `UNIQUE (estudio_id, empresa_id, tercero_tipo, cuit)`
- `UNIQUE (study_id, user_id)` en membresias de estudio
- `UNIQUE (study_id, user_id, company_id)` en asignaciones usuario-empresa

## 5. Dinero
Usar `NUMERIC/DECIMAL`; prohibido float/double.

## 6. Borrado y Retencion
- Soft delete para entidades no criticas.
- No borrado fisico para asientos confirmados, comprobantes fiscales, cierres, presentaciones y auditorias.

## 7. Tarea tecnica futura (hardening de tenancy)
- Endurecer `studyId` a `NOT NULL` entidad por entidad cuando cada modulo se migre completamente.
- Ejecutar backfill verificable antes de cada `ALTER COLUMN ... SET NOT NULL`.
- Bloquear PRs que introduzcan nuevas entidades operativas sin `studyId` requerido.
