# Criterios De Aceptacion

## Objetivo

Definir condiciones verificables para aceptar cada fase del sistema y evitar entregar funcionalidades incompletas o inseguras.

## Documentacion

- Cada documento tiene objetivo, alcance, decisiones tomadas y pendientes.
- El roadmap cubre MVP, fases futuras y dependencias.
- Las preguntas para el contador cubren temas funcionales, fiscales, contables, operativos y comerciales.
- Los criterios de aceptacion pueden usarse como checklist por fase.
- La documentacion no promete todos los comprobantes AFIP en v1.

## Plataforma y multi-empresa

- El contador puede crear y seleccionar empresas.
- El asistente ve solo empresas asignadas.
- El cliente ve solo su empresa.
- Todo endpoint operativo exige empresa activa.
- Toda tabla operativa tiene `empresa_id`.
- Los tests intentan acceder a datos de otra empresa y fallan.
- Las exportaciones respetan empresa.

## Seguridad y auditoria

- Login y acciones criticas quedan auditadas.
- Cambios de permisos quedan auditados.
- Certificados fiscales se guardan cifrados.
- Secretos no aparecen en logs ni frontend.
- Las acciones criticas registran usuario, empresa, entidad, fecha y detalle.

## Contabilidad

- No se confirma asiento desbalanceado.
- No se crea asiento sin empresa.
- No se crea asiento en periodo cerrado.
- No se edita asiento confirmado.
- No se elimina asiento confirmado.
- La anulacion genera contraasiento.
- Los libros Diario y Mayor se generan por empresa y periodo.

## Periodos

- Cada empresa tiene periodos propios.
- El cierre bloquea nuevas operaciones.
- El sistema informa claramente cuando un periodo esta cerrado.
- Las correcciones se hacen en periodo abierto o con reapertura auditada si se habilita.

## Facturacion local

- El comprobante pertenece a una empresa.
- La numeracion se controla por empresa, punto de venta y tipo.
- El sistema propone asiento antes de confirmar.
- El PDF se genera con datos fiscales correctos.
- La cuenta corriente se actualiza segun el comprobante.

## ARCA/AFIP

- WSAA funciona en homologacion.
- WSFEv1 autoriza comprobantes comunes en homologacion.
- Se guarda CAE y vencimiento.
- Se genera QR fiscal.
- Se guardan errores y observaciones.
- Se distingue rechazo fiscal de error tecnico.
- No se pasa a produccion sin validacion.

## Multimoneda

- ARS es moneda contable base.
- Operacion USD guarda importe original.
- Operacion USD guarda tipo de cambio, fecha y fuente.
- El asiento registra equivalente ARS.
- Los reportes legales salen en ARS.

## Portal cliente

- Cliente no ve datos de otra empresa.
- Cliente descarga solo informes publicados.
- Cliente sube documentos a su empresa.
- Documento queda en bandeja de revision.
- Revision queda auditada.

## Tesoreria

- Cobros y pagos se registran por empresa.
- Cajas y bancos pertenecen a una empresa.
- Movimientos actualizan saldos.
- Cuenta corriente refleja cobros y pagos.
- Conciliacion inicial permite marcar movimientos.

## Reportes

- Reportes tienen filtro obligatorio por empresa.
- Reportes permiten periodo o rango de fechas cuando corresponde.
- Exportacion PDF funciona.
- Exportacion Excel/CSV funciona.
- Saldos coinciden con asientos confirmados.

## Backups y operacion

- Existe estrategia de backup por empresa.
- Existe backup global administrado.
- Se prueba restauracion.
- Logs de errores no exponen secretos.
- Hay ambiente staging antes de produccion.
