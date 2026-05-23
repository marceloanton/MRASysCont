# Portal Cliente

## Objetivo

Dar a cada empresa cliente acceso limitado a su informacion, sin permitir cruces de datos ni modificaciones contables directas.

## Alcance v1

El cliente puede:

- Ingresar con usuario propio.
- Ver datos de su empresa.
- Descargar comprobantes publicados.
- Descargar informes publicados por el contador.
- Subir documentos para revision.
- Ver estado de documentos cargados.

El cliente no puede:

- Ver otras empresas.
- Modificar asientos.
- Emitir comprobantes fiscales.
- Cambiar configuracion contable o fiscal.
- Cerrar periodos.
- Crear cuentas contables.

## Flujo de documentos

1. Cliente sube documento.
2. El sistema lo guarda asociado a su empresa.
3. El documento queda pendiente de revision.
4. Contador o asistente lo revisa.
5. El documento se aprueba, observa o rechaza.
6. Si corresponde, se vincula a comprobante, asiento, tercero o periodo.
7. La accion queda auditada.

## Estados de documentos

- Pendiente.
- En revision.
- Observado.
- Aprobado.
- Rechazado.
- Procesado.

## Informes publicados

El contador decide que informes ve el cliente.

Ejemplos:

- Estado de cuenta.
- IVA ventas/compras.
- Balance resumido.
- Resultados.
- Comprobantes emitidos.
- Comprobantes recibidos cargados.

## Seguridad

Cada acceso del cliente debe validar:

- Usuario autenticado.
- Empresa asociada.
- Permiso de lectura.
- Documento o informe perteneciente a esa empresa.

Los archivos deben servirse con enlaces privados y temporales cuando la infraestructura lo permita.

## Notificaciones futuras

Fases posteriores pueden incluir:

- Avisos de documentos observados.
- Recordatorios de vencimientos.
- Solicitudes del contador al cliente.
- Alertas de comprobantes pendientes.
