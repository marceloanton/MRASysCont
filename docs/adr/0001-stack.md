# ADR 0001 - Stack Base

- Fecha: 2026-05-24
- Estado: Aceptado

## Contexto
Se requiere una base estable para evolucionar por fases con foco en trazabilidad y multi-tenant.

## Decision
Usar stack web con backend API, PostgreSQL como fuente de verdad, migraciones versionadas, tests automatizados y CI minimo.

## Alternativas
- Stack sin migraciones formales.
- Base documental sin SQL relacional.

## Consecuencias
- Mayor disciplina tecnica inicial.
- Mejor control de cambios y auditoria.
