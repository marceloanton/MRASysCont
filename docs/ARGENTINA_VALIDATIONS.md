# Argentina Validations

## CUIT/CUIL
- Validar formato y digito verificador.
- Normalizar sin guiones; presentar con guiones.

## Comprobantes
- Validar tipo, punto de venta, numeracion y fechas.
- Totales consistentes: neto + impuestos + otros.
- Reglas A/B/C y NC/ND por condicion fiscal.

## Periodos
- Definir periodo contable/fiscal y estado abierto/cerrado.

## Montos
- No negativos cuando corresponda.
- Redondeo centralizado.
- Prohibido float/double.
