# PHASE_5_DEFERRED_ITEMS

## Deuda diferida: metadata logica en `notes`

### Item
- `period` documental implementado de forma logica en `StudyDocument.notes` mediante tag: `[period:YYYY-MM]`.
- visibilidad cliente implementada de forma logica en `StudyDocument.notes` mediante tag: `[client-visible]` y/o estado `APPROVED` segun politica CLIENTE.

### Motivo
- Compatibilidad tecnica para cerrar Fase 5 sin introducir migracion nueva adicional en este corte.
- Se priorizo estabilidad de schema/migraciones y quality gates verdes.

### Riesgo
- Menor integridad estructural respecto de campos tipados.
- Consultas y filtros por periodo/visibilidad menos fuertes que con columnas explicitas.
- Mayor riesgo de inconsistencia semantica si el texto en `notes` no respeta formato.

### Criterio de reingreso
- Migracion futura para agregar campos explicitos en `StudyDocument`:
  - `period` (nullable inicial, luego politica definida por caso de uso).
  - `visibility` (enum explicito).
- Backfill de datos desde `notes` a columnas.
- Actualizacion de repositorio/queries para usar columnas.
- Tests de regresion:
  - filtros por periodo
  - politicas de visibilidad cliente
  - aislamiento por `studyId` + `companyId`

### Impacto sobre Fase 6
- No bloquea Fase 6.
- Condicion: mantener trazabilidad de esta deuda y no expandir su alcance fuera de Fase 5 documental.
