# Deploy Gratis - MRASysCont

## Opcion recomendada

- App: Vercel (free)
- DB: Neon o Supabase Postgres (free)

## Pasos

1. Subir repo a GitHub (main actualizado).
2. Crear DB Postgres en Neon/Supabase.
3. Crear proyecto en Vercel conectado al repo.
4. Configurar variables de entorno:
   - `DATABASE_URL`
   - `APP_SECRET`
   - `ENCRYPTION_KEY`
   - `MRASYSCONT_LICENSE_KEY` (si aplica)
   - `MRASYSCONT_ENFORCE_LICENSE`
5. Deploy.
6. Ejecutar migraciones en DB objetivo.

## Verificacion post deploy

- Login funciona.
- Selector estudio/empresa funciona.
- Reportes cargan por tenant.
- Build de Vercel en verde.

## Limites free tier

- Sin SLA.
- Recursos limitados.
- Puede haber latencia/sleep.
