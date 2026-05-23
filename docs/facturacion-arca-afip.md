# Facturacion ARCA/AFIP

## Objetivo

Integrar facturacion electronica argentina por empresa, manteniendo separacion entre contabilidad interna y autorizacion fiscal.

## Principios

- Cada empresa tiene su propio CUIT.
- Cada empresa tiene sus propios certificados.
- Cada empresa tiene sus propios puntos de venta.
- Cada empresa puede operar en homologacion o produccion.
- La integracion fiscal se implementa como modulo aislado.

## Servicios iniciales

La integracion inicial se basa en:

- WSAA: autenticacion y autorizacion para obtener token/sign.
- WSFEv1: autorizacion de comprobantes electronicos comunes.

Referencias oficiales:

- https://www.afip.gob.ar/ws/documentacion/wsaa.asp
- https://ftp.afip.gob.ar/ws/documentacion/ws-factura-electronica.asp
- https://www.afip.gov.ar/fe/ayuda/documentos/wsfev1-RG-4291.pdf
- https://servicioscf.afip.gob.ar/facturadecreditoelectronica/ayuda/manuales.asp

## Alcance v1

Operativo en v1:

- Factura A, B y C.
- Nota de credito A, B y C.
- Nota de debito A, B y C.
- CAE.
- Vencimiento de CAE.
- QR fiscal.
- PDF fiscal.
- Homologacion antes de produccion.

Preparado para fases posteriores:

- Factura de credito electronica MiPyME.
- Exportacion.
- Comprobantes especiales.
- Otros servicios ARCA/AFIP.

## Datos por empresa

Cada empresa debe configurar:

- CUIT.
- Condicion fiscal.
- Ambiente: homologacion o produccion.
- Certificado.
- Clave privada.
- Puntos de venta.
- Tipos de comprobante habilitados.
- Datos de emision.

Los certificados y claves se guardan cifrados y nunca se exponen al frontend.

## Flujo de emision

1. El usuario crea comprobante local.
2. El sistema valida datos fiscales.
3. El sistema propone asiento contable.
4. El contador confirma o deja pendiente segun flujo.
5. El modulo fiscal solicita token WSAA si hace falta.
6. El sistema consulta ultimo comprobante autorizado.
7. El sistema solicita CAE por WSFEv1.
8. Se guarda respuesta, CAE, vencimiento, QR y estado.
9. Se genera PDF.
10. Se audita la operacion.

## Estados fiscales

- Borrador.
- Pendiente de envio.
- Enviado.
- Aprobado.
- Rechazado.
- Observado.
- Error tecnico.
- Anulado localmente cuando corresponda.

## Manejo de errores

El sistema debe distinguir:

- Error de validacion local.
- Error de certificado.
- Error de autenticacion WSAA.
- Error de comunicacion.
- Rechazo fiscal.
- Observacion fiscal.
- Error de numeracion.
- Token vencido.

Cada error debe guardar detalle tecnico para el contador o soporte, y mensaje operativo claro para el usuario.

## Numeracion

La numeracion fiscal debe controlarse por:

- Empresa.
- Punto de venta.
- Tipo de comprobante.
- Ambiente.

Antes de emitir se debe consultar o validar el ultimo numero autorizado cuando aplique.

## Homologacion

Ninguna empresa debe pasar a produccion sin:

- Certificado cargado.
- Punto de venta configurado.
- Pruebas de homologacion exitosas.
- Comprobantes de prueba aprobados.
- Validacion del contador.

## Regla de alcance

El sistema se diseña para crecer a todos los comprobantes, pero v1 no debe prometer todos los casos especiales operativos. La entrega fiscal completa se habilita por etapas y por empresa, segun homologacion.
