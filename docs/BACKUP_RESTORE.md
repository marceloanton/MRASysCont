# Backup And Restore - MRASysCont

## Objetivo

Asegurar recuperacion de datos (DB + documentos) con pruebas periodicas.

## Backup minimo

- Base PostgreSQL diaria.
- Retencion minima: 14 a 30 dias.
- Cifrado en repositorio de backups.

## Restore de prueba

1. Restaurar DB en entorno de prueba.
2. Ejecutar `npm run db:migration:check`.
3. Validar login y tenancy.
4. Validar reportes contables/IVA.

## Criterio

Un backup no probado no se considera valido.

## Frecuencia sugerida

- Restore de prueba: semanal o quincenal.
- Evidencia documentada en ticket interno.
