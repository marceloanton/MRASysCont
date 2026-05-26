# MRASysCont - Tenancy And Environments Canonical Rules

Este documento prevalece ante contradicciones.

## Modelo de tenancy oficial
Jerarquia oficial:

```txt
estudio_id
  └── cliente_id
        └── empresa_id
```

Reglas:
- `estudio_id` es frontera tenant principal.
- `empresa_id` no reemplaza a `estudio_id`.
- `cliente_id` no reemplaza a `empresa_id`.
- Toda entidad operativa debe declarar frontera de alcance.
- Ninguna consulta operativa devuelve datos fuera del estudio activo.

## Frontera por entidad
- Empresas: `estudio_id`
- Clientes del estudio: `estudio_id`
- Asignaciones usuario-empresa: `estudio_id`, `usuario_id`, `empresa_id`
- Asientos: `estudio_id`, `empresa_id`
- Comprobantes: `estudio_id`, `empresa_id`
- Documentos: `estudio_id`, `cliente_id` opcional, `empresa_id` opcional
- Tareas: `estudio_id`, `cliente_id` opcional, `empresa_id` opcional
- Vencimientos: `estudio_id`, `cliente_id` opcional, `empresa_id` opcional
- Presentaciones: `estudio_id`, `empresa_id`
- Honorarios: `estudio_id`, `cliente_id`

## Ambientes oficiales
| Ambiente | Uso | Datos reales | Credenciales reales |
|---|---|---|---|
| local | desarrollo | no | no |
| test | tests automatizados | no | no |
| staging | validacion previa | no por defecto | no por defecto |
| demo | demostraciones | no | no |
| fiscal_homologation | pruebas fiscales | no productivos | certificados homologacion |
| production | operacion real | si | si |

Reglas:
- Local/test/demo no usan datos reales.
- `fiscal_homologation` nunca se mezcla con `production`.
- Certificados productivos no se usan en local/test/staging/demo.
- Restore de producción en no-productivo debe anonimizar o proteger datos sensibles.

## Resolucion de contradicciones
Si otro documento contradice tenancy o ambientes, este documento prevalece.

## Migracion minima desde modelo previo
- Datos legacy sin `study_id` se migran a `std_default` (Default Study).
- Empresas existentes quedan asociadas a `std_default`.
- Asignaciones usuario-empresa existentes heredan `study_id` de su empresa.
- Sesiones existentes resuelven `activeStudyId` desde la empresa activa si existe.

## Criterio de cierre
- Jerarquia tenant unica y explicita.
- Ambientes y credenciales definidos sin ambiguedad.
- Referenciado desde AGENTS/ROADMAP/TECHNICAL_SPEC.
