# Desarrollo Local

## Objetivo

Definir como levantar MRASysCont en una maquina de desarrollo y como pasar del modo demo local a persistencia real en PostgreSQL.

## Requisitos

- Node.js 22 o superior.
- npm 11 o superior.
- Docker Desktop si se quiere levantar PostgreSQL con `docker-compose.yml`.

## Instalacion

```bash
npm install
```

## Variables de entorno

Crear `.env` local usando `.env.example` como referencia.

Valor recomendado para desarrollo:

```env
DATABASE_URL="postgresql://mrasyscont:mrasyscont@localhost:5432/mrasyscont?schema=public"
```

## Modo demo local

Si PostgreSQL no esta disponible, la pantalla inicial sigue funcionando con datos demo locales.

Entrar por:

```text
http://127.0.0.1:3000/login
```

En desarrollo, usar los botones de `Modo demo local`.

La UI muestra la fuente activa:

- `Demo local`: no hay conexion a PostgreSQL o aun no se sembraron datos.
- `PostgreSQL`: la app leyo usuarios, empresas y membresias desde la base.

En modo demo local los listados administrativos funcionan con datos de ejemplo. Las altas de empresas y usuarios requieren PostgreSQL para persistir cambios.

Tambien funcionan en modo demo local:

- `/contabilidad/cuentas`
- `/contabilidad/periodos`
- `/contabilidad/asientos`
- `/contabilidad/reportes`
- `/terceros`
- `/comprobantes`
- `/cuentas-corrientes`

La pantalla de reportes muestra Libro Diario, Libro Mayor y Balance de sumas y saldos por empresa activa y periodo. Tambien permite exportar esos reportes en CSV y abrir una vista imprimible para guardar como PDF desde el navegador.

Las altas de cuentas, periodos y asientos requieren PostgreSQL para persistir cambios.

Los asientos permiten agregar mas de dos lineas. Cada linea debe imputar solo Debe o Haber, y el total del asiento debe quedar balanceado.

El listado de asientos muestra el detalle de cuentas y montos de cada renglon para poder revisar el asiento antes de confirmar o anular.

Solo los asientos en estado `BORRADOR` pueden editarse. La edicion reemplaza fecha, descripcion y lineas completas; los asientos confirmados o anulados quedan bloqueados.

Los asientos `BORRADOR` pueden descartarse. Los asientos `CONFIRMADO` o `ANULADO` no se eliminan: solo se corrigen con contraasiento.

El modulo `/terceros` lista clientes/proveedores por empresa activa en modo demo. Las altas, ediciones y cambios de estado requieren PostgreSQL porque persisten contra la tabla `ThirdParty`.

El modulo `/comprobantes` registra facturas/notas/recibos emitidos o recibidos vinculados a terceros activos. No emite CAE ni llama ARCA/AFIP todavia; esa integracion queda para la fase fiscal.

El modulo `/cuentas-corrientes` calcula saldos por tercero desde los comprobantes registrados y movimientos iniciales de cobro/pago. Todavia no reemplaza tesoreria completa con caja, bancos y conciliacion.

## PostgreSQL con Docker

Cuando Docker este instalado:

```bash
npm run db:up
npm run db:migrate
npm run db:seed
```

Luego iniciar la app:

```bash
npm run dev
```

Usuario seed:

```text
contador@mrasyscont.local
```

Contrasena seed por defecto:

```text
MraSysCont2026!
```

La contrasena puede cambiarse con `SEED_USER_PASSWORD` antes de ejecutar `npm run db:seed`.

## Validaciones

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run prisma:validate
```

## Notas

- No versionar `.env`.
- No versionar `.next/`, `node_modules/` ni logs.
- Las migraciones viven en `prisma/migrations/`.
- El seed inicial vive en `prisma/seed.ts`.
