# Env Examples

## local

```env
NODE_ENV=development
DATABASE_URL=postgresql://mrasyscont:mrasyscont@localhost:5432/mrasyscont?schema=public
ARCA_ENV=homologacion
MRASYSCONT_LICENSE_KEY=
MRASYSCONT_ENFORCE_LICENSE=false
```

## test

```env
NODE_ENV=test
DATABASE_URL=postgresql://mrasyscont:mrasyscont@localhost:5432/mrasyscont?schema=public
```

## production (referencia)

```env
NODE_ENV=production
DATABASE_URL=postgresql://<user>:<pass>@<host>:5432/<db>?schema=public
APP_SECRET=<secret>
ENCRYPTION_KEY=<secret>
ARCA_ENV=produccion
MRASYSCONT_LICENSE_KEY=<commercial-key-if-applies>
MRASYSCONT_ENFORCE_LICENSE=true
```
