# Multimoneda

## Objetivo

Permitir operaciones en ARS y USD sin perder consistencia contable ni claridad en reportes.

## Politica base

ARS es la moneda contable base.

USD se registra como moneda operativa cuando el comprobante, cobro, pago o movimiento lo requiera.

Cada operacion en USD debe guardar:

- Importe original en USD.
- Tipo de cambio.
- Fecha del tipo de cambio.
- Fuente del tipo de cambio.
- Importe convertido a ARS.

## Contabilidad

Los asientos impactan la contabilidad principal en ARS.

Cuando una linea se origine en USD, debe conservar datos de moneda original para consulta, trazabilidad y reportes.

## Comprobantes en USD

Una factura en USD debe guardar:

- Moneda del comprobante.
- Importe USD.
- Tipo de cambio usado.
- Total ARS equivalente.
- Impuestos calculados segun normativa aplicable.
- Datos fiscales requeridos por ARCA/AFIP.

## Tipos de cambio

El sistema debe permitir:

- Cargar tipo de cambio manual.
- Guardar fuente.
- Reutilizar tipo de cambio por fecha cuando corresponda.
- Auditar cambios.

Fuentes posibles:

- Manual contador.
- Banco Nacion.
- Fuente externa integrada en fase futura.

## Reportes

Los reportes contables legales se generan en ARS.

Los reportes de gestion pueden mostrar:

- Importe ARS.
- Importe original USD.
- Tipo de cambio.
- Diferencias de cambio si se implementan.

## Diferencias de cambio

La primera version debe registrar la informacion necesaria para calcular diferencias de cambio. La automatizacion completa de diferencias de cambio puede quedar para una fase posterior si el contador lo valida.

## Reglas obligatorias

- No se permite movimiento USD sin tipo de cambio cuando impacta contabilidad.
- No se debe reemplazar el importe original en USD por el valor convertido.
- No se debe usar tipo de cambio global sin empresa/fecha/fuente auditada.
- Los cierres deben preservar los valores usados historicamente.
