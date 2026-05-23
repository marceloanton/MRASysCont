# Contabilidad

## Objetivo

Definir las reglas contables obligatorias del sistema para evitar errores logicos, problemas legales y perdida de trazabilidad.

## Plan de cuentas

El plan de cuentas es propio de cada empresa.

El contador puede mantener plantillas globales por rubro y copiarlas al crear una empresa. Luego cada empresa puede personalizar su plan sin afectar a otras.

Tipos de cuentas:

- Activo.
- Pasivo.
- Patrimonio.
- Ingresos.
- Egresos.
- Cuentas de orden si el contador las requiere.

## Asientos contables

Todo asiento debe cumplir partida doble:

- Total debito igual a total credito.
- Debe tener fecha contable.
- Debe pertenecer a una empresa.
- Debe pertenecer a un periodo abierto.
- Debe tener descripcion y origen.

Estados:

- Borrador: editable.
- Confirmado: inmutable.
- Anulado: queda vinculado a contraasiento.

## Inmutabilidad

Un asiento confirmado no se modifica ni se elimina.

Si hay error:

- Se genera un contraasiento.
- Se registra motivo.
- Se mantiene relacion con el asiento original.
- Se audita la accion.

## Periodos contables

Cada empresa tiene sus propios periodos.

Reglas:

- El cierre de ejercicio puede variar por empresa.
- Un periodo cerrado bloquea nuevos movimientos y modificaciones.
- Las correcciones posteriores se registran en un periodo abierto.
- Las reaperturas excepcionales deben quedar auditadas si se permiten.

## Devengado y percibido

El sistema debe distinguir:

- Devengado: reconocimiento contable de ingreso/gasto.
- Percibido: cobro o pago efectivo.

Facturacion y cobros/pagos no deben confundirse. Una factura puede generar cuenta corriente aunque aun no haya cobro o pago.

## Libros contables

Reportes base:

- Libro Diario.
- Libro Mayor.
- Balance de sumas y saldos.
- Estado de resultados.
- Cuentas corrientes.
- IVA ventas.
- IVA compras.

Todos los libros se generan por empresa y por periodo.

## Facturas y asientos

Cuando se emite o carga una factura:

- El sistema propone un asiento automatico.
- El contador puede revisar y ajustar antes de confirmar.
- Al confirmar, el asiento queda inmutable.
- El comprobante queda vinculado al asiento.

## Cierre de ejercicio

El cierre debe:

- Identificar cuentas de resultado.
- Generar asientos de cierre segun reglas definidas por el contador.
- Bloquear el ejercicio cerrado.
- Mantener auditoria.

## Reglas obligatorias

- No se permite asiento desbalanceado.
- No se permite asiento sin empresa.
- No se permite asiento en periodo cerrado.
- No se permite borrar asiento confirmado.
- No se permite mezclar cuentas de distintas empresas.
- No se permite reporte contable sin filtro de empresa.
