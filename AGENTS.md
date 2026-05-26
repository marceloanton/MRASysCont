# MRASysCont - Instrucciones Obligatorias Para Codex

## Naturaleza Del Producto
MRASysCont es una plataforma integral para estudio contable argentino, multi-cliente y multiempresa.

## Bloqueantes Pre-Fase 1
No se implementa Fase 1 si no estan cerrados:
- `docs/TENANCY_AND_ENVIRONMENTS_CANONICAL.md`
- `docs/ENDPOINT_AUTHORIZATION.md`
- `docs/STATE_MACHINE.md`
- `docs/TRACEABILITY_MATRIX.md`
- `docs/CRITICAL_TEST_COVERAGE.md`
- `docs/CI_QUALITY_GATES.md`
- `docs/PHASE_0_6_STABILIZATION.md`

## Fuentes Canonicas (orden de precedencia)
1. `docs/TENANCY_AND_ENVIRONMENTS_CANONICAL.md`
2. `docs/ENDPOINT_AUTHORIZATION.md`
3. `docs/STATE_MACHINE.md`
4. `docs/CI_QUALITY_GATES.md`
5. `docs/CRITICAL_TEST_COVERAGE.md`
6. `docs/TRACEABILITY_MATRIX.md`
7. `docs/ROADMAP.md`
8. `docs/PRODUCT_SPEC.md`

## Reglas De Implementacion
1. Implementar por fase segun `docs/ROADMAP.md`.
2. No implementar fuera de la fase solicitada.
3. No mezclar fiscalidad avanzada con nucleo contable.
4. No cerrar una fase sin tests y documentacion actualizada.
5. No tomar decisiones de alcance sin documentarlas en `docs/` y/o ADR.
6. Antes de aceptar Fase 1, cerrar Fase 0.6 (migracion+CI+deuda documentada).
7. Canonico de fases: Fase 3 = terceros/cuentas corrientes; Fase 5 = expediente documental; Fase 7 = comprobantes locales; Fase 8 = IVA base; Fase 9 = portal cliente.

## Reglas Obligatorias Fase 1
- Todo endpoint requiere autorizacion backend.
- Todo endpoint con ID valida autorizacion por objeto.
- Toda operacion operativa respeta `estudio_id`.
- `empresa_id` no reemplaza `estudio_id`.
- Prohibido simular estudio con empresa; `Study` es entidad real de dominio.
- Tests de tenancy/permisos/object authorization son bloqueantes.
- CI bloquea si falla cualquier test critico de Fase 1.
- No se acepta codigo sin tests vinculados a `TRACEABILITY_MATRIX.md`.
- No avanzar a Fase 2 hasta GO formal de Fase 1.

## Congelamiento De Modulos Phase2/3/4 Durante Fase 1
- Hasta completar Fase 1, no modificar `phase2`, `phase3` y `phase4` salvo:
  - compatibilidad estricta de tenancy,
  - correcciones necesarias para tests,
  - correcciones necesarias para build/lint/typecheck.
- Prohibido agregar nuevas features en `phase2`, `phase3` y `phase4` durante Fase 1.
- `phase2`, `phase3` y `phase4` no se usan como criterio de "Fase 1 completa".

## Reglas Tecnicas Transversales
- No usar `float/double` para importes.
- Operaciones criticas idempotentes.
- Operaciones criticas dentro de transaccion.
- Entidades criticas con state machine.
- Secretos fuera de codigo y sin logging sensible.
- No mezclar codigo/documentacion de expediente documental dentro de Fase 3.

## Criterio De Aceptacion De Fase
1. Entregables completos.
2. `lint`, `typecheck`, `test` en verde.
3. Aislamiento y seguridad verificados.
4. Documentacion actualizada.
