# MRASysCont - Product Spec

## Producto
Plataforma para estudio contable argentino con gestion de clientes, empresas, documentacion, vencimientos, tareas, contabilidad, comprobantes, impuestos, presentaciones, reportes, portal cliente y tesoreria.

## Usuarios
- Titular del estudio
- Contador
- Asistente contable
- Liquidador de sueldos
- Cliente externo
- Auditor externo
- Admin tecnico

## Capacidades Nucleares
1. Multiempresa y multi-cliente.
2. Permisos y aislamiento estricto.
3. Expediente documental por cliente/empresa/periodo.
4. Gestion de vencimientos y tareas.
5. Nucleo contable formal.
6. Terceros y cuentas corrientes.
7. Comprobantes locales y luego ARCA/AFIP.
8. Portal cliente con acceso acotado.
9. Tesoreria y conciliacion.
10. Reportes profesionales y publicacion.

## Restricciones Funcionales
- Ninguna operacion critica sin auditoria.
- Asientos confirmados inmutables.
- Periodos cerrados bloquean operacion.
- Comprobantes contabilizados no se editan.
- Automatizaciones no confirman operaciones criticas sin aprobacion humana.
