# Producto

## Vision

MRASysCont es un sistema contable multi-empresa para un contador o estudio contable que administra muchas empresas cliente desde una sola plataforma.

El contador no es un usuario comun. Es el operador central del sistema, con acceso total a empresas, configuraciones, reportes, cierres, facturacion y auditoria.

Cada empresa funciona como un tenant aislado. Su plan de cuentas, asientos, comprobantes, periodos, clientes, proveedores, documentos, certificados fiscales y reportes no deben cruzarse con los de otra empresa.

## Usuarios

- Contador: super-usuario del sistema. Administra todo, crea empresas, configura fiscalidad, revisa documentos, confirma asientos y genera informes.
- Asistente: usuario del estudio con acceso solo a empresas asignadas. Puede operar carga, facturacion y tareas contables permitidas, sin configuracion critica.
- Cliente empresa: usuario con portal propio. Ve informacion de su empresa, descarga comprobantes e informes publicados, y sube documentos para revision.

## Alcance MVP

El MVP incluye:

- Plataforma web multi-empresa.
- Login, roles y selector de empresa.
- Empresas con configuracion contable, fiscal y operativa propia.
- Plan de cuentas por plantilla copiable y personalizable.
- Asientos contables por partida doble.
- Periodos contables y cierres estrictos.
- Facturacion local A/B/C, notas de credito y notas de debito.
- Integracion ARCA/AFIP inicial con WSAA y WSFEv1 para comprobantes comunes.
- ARS como moneda contable base y USD como moneda operativa.
- Portal cliente de lectura y subida documental.
- Caja/bancos basico.
- Reportes legales y de gestion base.
- Auditoria de acciones criticas.

## Fuera del MVP inicial

Queda preparado para fases posteriores:

- Todos los comprobantes especiales ARCA/AFIP.
- Factura de credito electronica MiPyME.
- Exportacion.
- Retenciones y percepciones completas.
- IIBB avanzado por jurisdiccion.
- Reportes comparativos entre empresas.
- Grupos economicos.
- Automatizaciones avanzadas de carga documental.

## Decisiones tomadas

- El sistema sera web moderno en Cloud/VPS.
- La base sera PostgreSQL.
- Se usara una base compartida con `empresa_id` en tablas operativas.
- El aislamiento multi-empresa se implementa en una capa central de permisos y consultas.
- ARCA/AFIP se implementa como modulo aislado.
- La primera entrega fiscal operativa se limita a comprobantes comunes A/B/C y notas.

## Pendientes para validar con el contador

- Rubros principales de las empresas cliente.
- Cantidad inicial y estimada de empresas.
- Planes de cuentas modelo por rubro.
- Flujos reales de carga de comprobantes.
- Politica de aprobacion de asientos.
- Provincias y jurisdicciones de IIBB.
- Necesidad concreta de FCE MiPyME, exportacion u otros comprobantes especiales.
- Formato esperado de informes para clientes.
