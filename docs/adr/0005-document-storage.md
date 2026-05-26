# ADR 0005 - Document Storage

- Fecha: 2026-05-24
- Estado: Aceptado

## Contexto
El expediente documental requiere seguridad, versionado y auditoria.

## Decision
Guardar archivo real en object storage y metadata en PostgreSQL.

## Alternativas
- Guardar blobs pesados en DB principal.
- Exponer archivos por URL publica fija.

## Consecuencias
- Mejor escalabilidad y control de acceso.
- Requiere capa de URLs firmadas y validaciones de upload.
