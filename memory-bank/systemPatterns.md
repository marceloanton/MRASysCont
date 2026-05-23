# System Patterns

## Multi-tenant

Toda tabla operativa debe tener `empresa_id`. Las consultas y endpoints deben validar empresa activa contra permisos del usuario.

## Contabilidad

Los asientos confirmados son inmutables. Las correcciones se hacen con contraasiento. Los periodos cerrados bloquean movimientos.

## Integraciones fiscales

ARCA/AFIP debe vivir en una capa aislada. WSAA y WSFEv1 son servicios iniciales, con certificados cifrados por empresa.

## Frontend

La interfaz debe priorizar operacion de estudio contable: clara, densa cuando corresponde, sin estilo de landing page para tareas internas.
