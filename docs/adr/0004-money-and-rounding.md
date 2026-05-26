# ADR 0004 - Money And Rounding

- Fecha: 2026-05-24
- Estado: Aceptado

## Contexto
Los importes contables/fiscales requieren precision exacta.

## Decision
Prohibir `float/double` y usar `NUMERIC/DECIMAL` con precision definida.

## Alternativas
- Punto flotante con redondeos ad-hoc.

## Consecuencias
- Menos errores de precision.
- Necesidad de utilidades centralizadas de redondeo.
