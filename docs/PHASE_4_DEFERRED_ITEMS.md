# Fase 4 - Deuda Tecnica Diferida

## Estado
- Fecha: 2026-05-24
- Objetivo: cerrar deuda pre-Fase 5 sin abrir alcance funcional.

## Item 1: Naming heredado de contabilidad en `lib/phase2/*`

### Estado
- Parcialmente resuelto.

### Hecho
- Se creo una capa canonica de imports para contabilidad en `lib/phase4-accounting/*`.
- Todos los imports de `app/contabilidad/*` y `app/comprobantes/actions.ts` ya consumen `lib/phase4-accounting/*`.
- Se mantuvo compatibilidad hacia atras sin mover implementaciones internas.

### Diferido
- Mover fisicamente implementaciones contables desde `lib/phase2/*` a `lib/phase4-accounting/*`.
- Ajustar tests y paths internos para eliminar definitivamente el legado.

### Criterio de reingreso
- Ejecutar en una ventana de hardening, fuera de implementacion funcional de fase.
- Mantener quality gates en verde durante todo el refactor.
- No mezclar con implementacion de expediente documental.

## Item 2: Warning por lockfiles multiples en build

### Estado
- Resuelto.

### Hecho
- Se fijo `outputFileTracingRoot` en `next.config.ts` para evitar inferencia de root por lockfiles externos al proyecto.
- No se eliminaron lockfiles externos ni del repo actual.

