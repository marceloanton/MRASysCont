# Arquitectura

## Objetivo

Definir una arquitectura SaaS segura para operar multiples empresas contables desde una sola plataforma, con aislamiento estricto por `empresa_id` y capacidad de integrar ARCA/AFIP por empresa.

## Vista general

Componentes principales:

- Frontend web: interfaz para contador, asistentes y clientes.
- Backend API: reglas de negocio, permisos, contabilidad, facturacion y reportes.
- PostgreSQL: base transaccional compartida.
- Worker/cola: tareas asincronicas para ARCA/AFIP, generacion de reportes, backups y procesos programados.
- Storage privado: documentos cargados, PDFs fiscales, adjuntos y archivos por empresa.
- Servicio de secretos: certificados, claves fiscales tecnicas y credenciales cifradas.

## Multi-tenant

Se adopta una base compartida con columna `empresa_id` en todas las tablas operativas.

Esta opcion es practica para un contador con muchas empresas, pero exige controles fuertes:

- Toda request debe tener usuario autenticado.
- Toda operacion de datos requiere empresa activa.
- La empresa activa debe validarse contra los permisos del usuario.
- Las consultas deben filtrar por `empresa_id` desde una capa central.
- Los endpoints globales deben estar justificados y limitados.
- Las pruebas deben intentar cruces de datos entre empresas.

## Frontend

El frontend debe tener:

- Login.
- Selector de empresa para contador y asistentes.
- Navegacion por modulos.
- Paneles diferenciados por rol.
- Portal cliente con lectura y subida documental.
- Estados claros para periodos cerrados, comprobantes pendientes y errores AFIP.

## Backend

El backend debe concentrar:

- Autenticacion y sesiones.
- Autorizacion por rol, empresa y modulo.
- Validacion de `empresa_id`.
- Servicios contables.
- Servicios fiscales ARCA/AFIP.
- Auditoria.
- Reportes.
- Administracion de archivos y certificados.

Ninguna regla critica debe depender solo del frontend.

## Base de datos

PostgreSQL debe incluir:

- Indices por `empresa_id` en tablas operativas.
- Restricciones para partida doble.
- Estados inmutables para asientos confirmados.
- Auditoria de cambios.
- Soporte para periodos cerrados.
- Relaciones por empresa para evitar datos huerfanos o cruzados.

## Colas y tareas

Usar workers para:

- Solicitar y renovar tickets WSAA.
- Emitir comprobantes AFIP.
- Generar PDFs y reportes pesados.
- Ejecutar backups por empresa.
- Procesar documentos cargados.
- Enviar notificaciones.

## Despliegue

Produccion debe correr en Cloud/VPS para controlar:

- Certificados fiscales.
- Workers.
- Tareas programadas.
- Backups.
- Logs.
- Seguridad de red.
- Ambientes staging y produccion.

## Ambientes

- Local: desarrollo.
- Staging: pruebas integradas y homologacion AFIP.
- Produccion: uso real con certificados productivos.

## Reglas de arquitectura

- Toda integracion externa vive detras de una interfaz propia.
- ARCA/AFIP no debe contaminar el modelo contable interno.
- Los comprobantes se guardan localmente con estado fiscal.
- La contabilidad no depende de que AFIP este disponible para mantener consistencia interna.
- Los reportes siempre deben poder generarse por empresa.
