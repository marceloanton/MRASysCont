$ErrorActionPreference = "Stop"

Write-Host "[1/8] prisma validate" -ForegroundColor Cyan
npx prisma validate

Write-Host "[2/8] db:migration:check" -ForegroundColor Cyan
npm run db:migration:check

Write-Host "[3/8] lint" -ForegroundColor Cyan
npm run lint

Write-Host "[4/8] typecheck" -ForegroundColor Cyan
npm run typecheck

Write-Host "[5/8] test:tenancy" -ForegroundColor Cyan
npm run test:tenancy

Write-Host "[6/8] test:permissions" -ForegroundColor Cyan
npm run test:permissions

Write-Host "[7/8] test" -ForegroundColor Cyan
npm test

Write-Host "[8/8] build" -ForegroundColor Cyan
npm run build

Write-Host "OK: Todos los quality gates pasaron." -ForegroundColor Green
