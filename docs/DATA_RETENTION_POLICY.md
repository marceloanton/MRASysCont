# Data Retention Policy - MRASysCont

## Objetivo
Definir retencion minima por tipo de dato para cumplimiento y operacion.

## Retencion sugerida

| Tipo de dato | Retencion minima |
|---|---|
| Asientos confirmados | 10 anios |
| Comprobantes emitidos/registrados | 10 anios |
| Documentacion respaldatoria | 10 anios |
| Auditoria de negocio | 10 anios |
| Logs tecnicos | 12 a 24 meses |
| Reportes exportados | segun contrato/politica interna |

## Reglas
- No borrado fisico de entidades criticas confirmadas.
- Aplicar soft delete/inactivacion cuando corresponda.
- Mantener trazabilidad de cambios y accesos.

## Eliminacion o bloqueo
Cuando aplique legalmente:
- documentar solicitud,
- ejecutar proceso controlado,
- registrar evidencia de cumplimiento.

## Revision
Revisar esta politica ante cambios normativos o contractuales.
