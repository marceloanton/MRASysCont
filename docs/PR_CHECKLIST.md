# Checklist Obligatorio De PR

## Seguridad
- [ ] Autorizacion backend en endpoints nuevos/modificados.
- [ ] Sin acceso cruzado estudio/cliente/empresa.
- [ ] Sin URLs publicas permanentes para documentos privados.
- [ ] Sin secretos en logs/respuestas.

## Multi-tenancy
- [ ] Frontera de tenant clara en tablas y queries.
- [ ] Tests manipulando IDs ajenos.

## Contabilidad
- [ ] Sin float/double para importes.
- [ ] No se rompe inmutabilidad de asientos/comprobantes confirmados.
- [ ] Operaciones criticas en transaccion.

## Documentos
- [ ] Validacion de tamano/MIME/extension.
- [ ] Hash y auditoria de eventos.

## Tests
- [ ] Unit + permisos + aislamiento + errores esperados.
- [ ] Regresion para bug corregido.

## Documentacion
- [ ] Docs impactadas actualizadas.
- [ ] ADR actualizado si hubo decision arquitectonica.
