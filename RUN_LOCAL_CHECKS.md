# Run Local Checks

Usar antes de push/merge.

## Comando unico (PowerShell)

```powershell
./scripts/prepush-check.ps1
```

## Comandos manuales

```bash
npx prisma validate
npm run db:migration:check
npm run lint
npm run typecheck
npm run test:tenancy
npm run test:permissions
npm test
npm run build
```
