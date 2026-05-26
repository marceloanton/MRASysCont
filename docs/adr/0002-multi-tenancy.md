# ADR 0002 - Multi-Tenancy

- Fecha: 2026-05-24
- Estado: Aceptado

## Contexto
El producto debe servir uno o mas estudios contables con aislamiento estricto.

## Decision
Jerarquia obligatoria: `estudio_id -> cliente_id -> empresa_id`.

## Alternativas
- Solo `empresa_id` como tenant.
- Mono-tenant por deployment.

## Consecuencias
- Evita fuga de datos entre estudios.
- Requiere validacion estricta de alcance en backend.
