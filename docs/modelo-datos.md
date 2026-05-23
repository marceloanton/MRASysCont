# Modelo De Datos

## Objetivo

Definir las entidades principales del sistema y las reglas para mantener aislamiento multi-empresa, integridad contable y trazabilidad.

## Regla multi-empresa

Toda tabla operativa debe tener `empresa_id`, salvo tablas globales justificadas.

Tablas globales posibles:

- Usuarios.
- Roles base.
- Plantillas globales de plan de cuentas.
- Catalogos del sistema.
- Parametros fiscales generales.

Las tablas globales no deben contener movimientos contables ni datos privados de una empresa.

## Entidades principales

### Usuarios y permisos

- `usuarios`: identidad, email, estado, credenciales.
- `roles`: contador, asistente, cliente.
- `usuario_empresas`: empresas asignadas a cada usuario, rol efectivo y permisos.
- `sesiones`: sesiones activas, expiracion, metadata de seguridad.

### Empresas

- `empresas`: razon social, CUIT, condicion fiscal, estado, domicilio, moneda base.
- `empresa_configuracion`: parametros contables, fiscales, operativos y de reportes.
- `empresa_certificados`: certificados, claves y entorno AFIP cifrados.
- `puntos_venta`: puntos de venta por empresa y tipo de comprobante.

### Contabilidad

- `plantillas_plan_cuentas`: planes modelo por rubro.
- `plantilla_cuentas`: cuentas dentro de una plantilla.
- `cuentas_contables`: plan de cuentas propio de cada empresa.
- `periodos_contables`: meses/ejercicios, estado abierto/cerrado.
- `asientos`: cabecera de asiento, estado borrador/confirmado/anulado.
- `asiento_lineas`: debitos, creditos, cuenta, moneda e importe.
- `contraasientos`: relacion entre asiento original y asiento de anulacion.

### Terceros

- `terceros`: clientes/proveedores por empresa.
- `tercero_condicion_fiscal`: datos fiscales del tercero.
- `cuentas_corrientes`: saldos y movimientos por tercero.

### Comprobantes

- `comprobantes`: factura, nota de credito, nota de debito, compra, recibo u otro documento.
- `comprobante_items`: conceptos, cantidades, precios, impuestos.
- `comprobante_impuestos`: IVA, IIBB y otros tributos.
- `comprobante_afip`: CAE, vencimiento, estado, errores, QR, solicitud y respuesta.
- `comprobante_asiento`: relacion con asiento contable.

### Monedas

- `monedas`: ARS, USD y futuras monedas.
- `tipos_cambio`: fecha, moneda origen, moneda destino, fuente y valor.
- `movimientos_moneda`: importes originales y convertidos cuando aplique.

### Tesoreria

- `cajas`: cajas por empresa.
- `bancos`: cuentas bancarias por empresa.
- `cobros`: cobros recibidos.
- `pagos`: pagos realizados.
- `movimientos_tesoreria`: entradas, salidas, transferencias.
- `conciliaciones`: conciliacion bancaria y estado.

### Documentos

- `documentos`: archivos subidos por cliente o contador.
- `documento_revision`: estado pendiente, observado, aprobado, rechazado.
- `documento_vinculos`: relacion con comprobante, tercero, asiento o periodo.

### Auditoria

- `auditoria_eventos`: accion, usuario, empresa, entidad, fecha, IP, datos relevantes.
- `auditoria_cambios`: valores anteriores y nuevos para cambios auditables.

## Estados clave

- Asiento: borrador, confirmado, anulado.
- Periodo: abierto, cerrado.
- Comprobante: borrador, emitido_local, pendiente_afip, aprobado_afip, rechazado_afip, anulado.
- Documento: pendiente, en_revision, aprobado, rechazado.
- Empresa: activa, suspendida, archivada.

## Integridad contable

- Un asiento confirmado debe tener debito total igual a credito total.
- Un asiento confirmado no se edita ni se elimina.
- La anulacion se realiza con contraasiento.
- Un comprobante confirmado debe vincularse al asiento que genero o al asiento aprobado por el contador.
- No se permiten movimientos en periodos cerrados.

## Indices recomendados

- `empresa_id` en toda tabla operativa.
- `empresa_id + fecha` para movimientos y reportes.
- `empresa_id + periodo_id` para contabilidad.
- `empresa_id + tercero_id` para cuentas corrientes.
- `empresa_id + tipo + punto_venta + numero` para comprobantes.
- `empresa_id + estado` para bandejas operativas.
