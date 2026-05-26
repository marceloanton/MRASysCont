# OPERATIONS_RUNBOOK

## Objetivo
Estandar operativo para despliegue, incidentes y recuperacion.

## Ambientes
- `local`
- `test`
- `staging`
- `production`
- `arca_homologacion`
- `arca_produccion`

Reglas:
- no mezclar credenciales entre ambientes
- no usar certificados productivos en local/test

## Operacion Diaria
- health checks
- readiness checks
- logs estructurados
- metricas y alertas por modulo

## Backups
- definir `RPO` y `RTO`
- backup de DB + storage + config critica
- cifrado y retencion
- restore probado periodicamente

## Despliegue Seguro
1. backup previo
2. migracion controlada
3. smoke tests
4. monitoreo post-deploy
5. rollback si falla

## Incidentes
1. detectar
2. contener
3. corregir
4. recuperar
5. post-mortem
