# Disaster Recovery - MRASysCont

## Objetivo
Recuperar operacion ante falla mayor de infraestructura o datos.

## Objetivos recomendados
- RPO objetivo: <= 24h
- RTO objetivo: <= 8h

## Activos criticos
1. Base de datos PostgreSQL
2. Documentos (storage)
3. Configuracion de app y secretos

## Estrategia minima
- Backups diarios cifrados.
- Retencion minima 30 dias.
- Restore de prueba periodico.

## Procedimiento resumido
1. Declarar evento DR.
2. Congelar escrituras si aplica.
3. Restaurar DB al ultimo backup valido.
4. Restaurar documentos.
5. Verificar integridad tenancy y permisos.
6. Ejecutar quality gates clave.
7. Habilitar trafico progresivo.

## Validacion post-restore
- Login y seleccion de estudio/empresa
- Consultas scoped por tenant
- Reportes contables/IVA
- Exportaciones criticas

## Evidencia
Registrar fecha, backup usado, tiempo de recuperacion y resultados.
