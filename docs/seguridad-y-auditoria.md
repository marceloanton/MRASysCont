# Seguridad Y Auditoria

## Objetivo

Evitar cruces de datos entre empresas, proteger informacion fiscal y contable, y dejar trazabilidad legal y operativa de cada accion critica.

## Roles

- Contador: acceso total a todas las empresas y configuracion del sistema.
- Asistente: acceso solo a empresas asignadas y modulos permitidos.
- Cliente: acceso de lectura a su empresa y subida documental.

## Aislamiento por empresa

Cada request debe resolver:

- Usuario autenticado.
- Rol del usuario.
- Empresa activa.
- Permiso del usuario sobre esa empresa.
- Accion solicitada.

Si cualquiera de esos puntos falla, la request debe rechazarse.

## Reglas obligatorias

- Ningun endpoint opera sin empresa activa validada.
- Ninguna consulta operativa omite filtro por `empresa_id`.
- Ninguna exportacion omite empresa.
- Ningun backup mezcla datos de empresas sin marcarlo como backup global administrado.
- El cliente nunca puede acceder a datos de otra empresa.
- El asistente nunca puede acceder a empresas no asignadas.

## Auditoria

Registrar siempre:

- Usuario.
- Empresa.
- Fecha y hora.
- IP y user agent cuando aplique.
- Accion.
- Entidad afectada.
- Identificador de registro.
- Estado anterior y nuevo cuando aplique.

## Acciones criticas

Auditar especialmente:

- Login y logout.
- Cambio de empresa activa.
- Creacion o modificacion de empresa.
- Cambio de roles o permisos.
- Confirmacion de asientos.
- Anulacion por contraasiento.
- Cierre o reapertura excepcional de periodos.
- Emision AFIP.
- Carga, reemplazo o eliminacion logica de documentos.
- Carga o rotacion de certificados fiscales.
- Exportacion de reportes.
- Ejecucion de backups.

## Proteccion de secretos

Certificados, claves privadas, tokens y credenciales deben:

- Guardarse cifrados.
- Estar separados por empresa.
- No exponerse en logs.
- No enviarse al frontend.
- Tener rotacion documentada.
- Tener permisos de acceso restringidos.

## Periodos y asientos

- Los periodos cerrados bloquean cambios.
- Los asientos confirmados son inmutables.
- Las correcciones usan contraasiento.
- Las reaperturas excepcionales, si existieran, requieren auditoria reforzada.

## Pruebas de seguridad

Cada fase debe incluir pruebas de:

- Usuario cliente intentando acceder a otra empresa.
- Asistente intentando operar una empresa no asignada.
- Endpoint sin `empresa_id`.
- Exportacion sin filtro por empresa.
- Modificacion de asiento confirmado.
- Modificacion de periodo cerrado.
- Lectura de certificado fiscal desde frontend.

## Politica de eliminacion

Los datos contables y fiscales no se eliminan fisicamente en operacion normal.

Se debe usar:

- Baja logica.
- Estados.
- Auditoria.
- Anulaciones contables cuando corresponda.
