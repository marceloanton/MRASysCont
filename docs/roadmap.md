# Roadmap

## Objetivo

Ordenar la implementacion completa de MRASysCont por fases, con dependencias claras y sin mezclar complejidad fiscal avanzada con el nucleo contable.

## Fase 0: Preparacion del proyecto

Entregables:

- Repositorio Git.
- Estructura documental.
- Stack base.
- Convenciones de codigo.
- Ambientes local, staging y produccion.
- Configuracion de base PostgreSQL.
- Memoria del proyecto si se decide usarla.

Criterio de salida:

- El proyecto corre localmente.
- Hay README y docs base.
- Hay comandos de build/test definidos.

## Fase 1: Plataforma base

Entregables:

- Login.
- Usuarios.
- Roles.
- Selector de empresa.
- Empresas.
- Asignacion usuario-empresa.
- Permisos centralizados.
- Auditoria base.
- Middleware de `empresa_id`.

Criterio de salida:

- Contador puede crear empresas y asignar usuarios.
- Asistente solo ve empresas asignadas.
- Cliente solo ve su empresa.
- Tests prueban aislamiento entre empresas.

## Fase 2: Nucleo contable

Entregables:

- Plantillas de plan de cuentas.
- Plan de cuentas por empresa.
- Periodos contables.
- Asientos borrador y confirmados.
- Partida doble.
- Contraasientos.
- Cierres estrictos.
- Libro Diario.
- Libro Mayor.

Criterio de salida:

- No se confirma asiento desbalanceado.
- No se modifica asiento confirmado.
- No se opera en periodo cerrado.

## Fase 3: Terceros y cuentas corrientes

Entregables:

- Clientes.
- Proveedores.
- Datos fiscales.
- Movimientos de cuenta corriente.
- Saldos por tercero.
- Estado de cuenta.

Criterio de salida:

- Cada empresa maneja terceros propios.
- Los saldos se calculan por empresa y tercero.

## Fase 4: Facturacion local

Entregables:

- Facturas A/B/C.
- Notas de credito A/B/C.
- Notas de debito A/B/C.
- Numeracion por empresa y punto de venta.
- PDF local.
- QR fiscal preparado.
- Asiento propuesto editable antes de confirmar.

Criterio de salida:

- Un comprobante puede registrarse localmente.
- El sistema propone asiento.
- El contador confirma asiento y comprobante.

## Fase 5: ARCA/AFIP MVP

Entregables:

- Certificados por empresa cifrados.
- Configuracion de entorno homologacion/produccion.
- WSAA.
- WSFEv1.
- CAE.
- Vencimiento CAE.
- QR fiscal.
- PDF fiscal.
- Manejo de errores y reintentos.

Criterio de salida:

- Una empresa emite comprobantes comunes en homologacion.
- Luego puede pasar a produccion con validacion.

## Fase 6: Multimoneda

Entregables:

- Monedas ARS/USD.
- Tipos de cambio.
- Facturas en USD.
- Asientos con importe ARS y moneda original.
- Reportes con moneda original cuando aplique.

Criterio de salida:

- Toda operacion USD conserva importe original y conversion ARS.

## Fase 7: Portal cliente

Entregables:

- Login cliente.
- Panel de empresa.
- Informes publicados.
- Descarga de comprobantes.
- Subida documental.
- Bandeja de revision para contador.
- Estados de documentos.

Criterio de salida:

- Cliente accede solo a su empresa.
- Contador revisa documentos subidos.

## Fase 8: Tesoreria

Entregables:

- Cajas.
- Bancos.
- Cobros.
- Pagos.
- Transferencias.
- Saldos.
- Conciliacion bancaria inicial.

Criterio de salida:

- Cobros y pagos impactan cuentas corrientes y tesoreria.

## Fase 9: Reportes

Entregables:

- Balance de sumas y saldos.
- Estado de resultados.
- IVA ventas.
- IVA compras.
- Cuentas corrientes.
- Exportacion PDF.
- Exportacion Excel/CSV.

Criterio de salida:

- Los reportes se generan por empresa, periodo y filtros definidos.

## Fase 10: Fiscal extendido

Entregables:

- IIBB avanzado.
- Retenciones.
- Percepciones.
- Padrones.
- Reglas por jurisdiccion.
- Libros especiales.

Criterio de salida:

- Cada empresa puede configurar reglas fiscales extendidas segun jurisdiccion.

## Fase 11: AFIP extendido

Entregables:

- FCE MiPyME.
- Exportacion.
- Comprobantes especiales.
- Habilitacion gradual por empresa.
- Homologacion por tipo de comprobante.

Criterio de salida:

- Los comprobantes especiales se habilitan solo cuando cada empresa completa homologacion.

## Fase 12: Premium

Entregables:

- Reportes comparativos entre empresas.
- Grupos economicos.
- Dashboard del estudio.
- Alertas.
- Vencimientos.
- Automatizaciones.
- Carga asistida de documentos.

Criterio de salida:

- El contador puede analizar varias empresas sin romper aislamiento operativo.
