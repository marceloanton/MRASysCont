# ADR 0006 - ARCA Integration

- Fecha: 2026-05-24
- Estado: Aceptado

## Contexto
La autorizacion fiscal requiere trazabilidad, retries y no duplicacion.

## Decision
Desacoplar integracion ARCA en modulo propio con logs de request/response sanitizados e idempotencia.

## Alternativas
- Integracion embebida en modulo de comprobantes sin capa separada.

## Consecuencias
- Mejor mantenibilidad y auditoria.
- Mayor complejidad inicial de arquitectura.
