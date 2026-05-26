# MRASysCont - Architecture Rules

## Reglas De Datos
1. Toda tabla operativa debe tener pertenencia explicita (empresa/cliente/usuario).
2. Sin `empresa_id` no hay operacion multiempresa valida.
3. Sin estado no hay entidad operativa (borrador/confirmado/etc).

## Reglas De Integridad
1. No borrado fisico de entidades criticas.
2. Correcciones por reversa/contraasiento/versionado.
3. Transacciones para operaciones criticas (confirmaciones, numeracion, conciliacion).

## Reglas De Seguridad
1. Autorizacion server-side obligatoria.
2. Aislamiento por tenant en todas las queries.
3. Auditoria para alta/confirmacion/anulacion/cierre.

## Reglas De Modularidad
1. Nucleo contable desacoplado de fiscalidad avanzada.
2. ARCA/AFIP como capa aislada y testeable.
3. Modulos avanzados activables por empresa.

## Reglas De Testing
1. Tests por modulo y por fase.
2. Cobertura minima de aislamiento multiempresa.
3. Cobertura de reglas de estado e inmutabilidad.
