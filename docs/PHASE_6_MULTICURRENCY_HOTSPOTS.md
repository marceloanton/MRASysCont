# PHASE_6_MULTICURRENCY_HOTSPOTS

## Objetivo
Registrar hotspots tecnicos detectados antes de implementar Fase 6 (multimoneda), sin refactor funcional en este paso.

## Hotspots identificados (number / Math.round)
- `lib/phase3/validation.ts`
  - `Math.round(input.netAmount * 100)`
  - `Math.round(input.taxAmount * 100)`
  - `Math.round(input.totalAmount * 100)`
  - riesgo: precision binaria para casos de conversion/rounding multimoneda.
- `lib/phase3/validation.ts`
  - `validatePositiveAmount(amount: number)` usa `Math.round(amount * 100)`.
- `lib/phase4/validation.ts`
  - `validateTreasuryAmount(amount: number)` usa `Math.round(Math.abs(amount) * 100)`.
- `lib/phase3/voucher-repository.ts`
  - validaciones de monto y umbral con `Math.round(input.totalAmount * 100)`.
- `app/comprobantes/[voucherId]/pdf/route.ts`
  - conversiones `Number(...)`/`toFixed(2)` para salida PDF.

## Estado actual (post-Fase 6)
- En DB se usan `Decimal`/`NUMERIC` para importes monetarios relevantes.
- El flujo FX implementado (posting USD + asiento contable) usa reglas y redondeo centralizado en `lib/phase6/fx-rules.ts`.
- Los hotspots `number/Math.round` remanentes no bloquean el flujo FX implementado porque hoy impactan validaciones heredadas y presentacion/export, no el calculo FX contable central.
- En comprobantes:
  - `Voucher` puede guardar importes principales en moneda original.
  - `JournalEntryLine` conserva impacto contable ARS (`debit/credit`) y, cuando aplica, `currency` + `originalAmount` + `exchangeRate`.

## Criterio de reingreso (refactor Decimal futuro)
- Disparadores:
  - inicio de Fase 7 o refactor contable transversal,
  - bug de precision monetaria reproducible,
  - necesidad de soportar mas monedas/fuentes FX.
- Alcance minimo:
  - reemplazar hotspots `number/Math.round` por utilidades Decimal centralizadas,
  - consolidar una unica politica de redondeo versionada para validacion, posting y reportes.
- Criterio de cierre:
  - tests de regresion monetaria en verde (incluyendo FX),
  - ausencia de calculo monetario critico con `number/Math.round`,
  - documentacion tecnica actualizada con la politica final.
