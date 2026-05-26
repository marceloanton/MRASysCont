# HANDOFF - MRASysCont

Fecha: 2026-05-26
Repo: https://github.com/marceloanton/MRASysCont
Rama: main

## 1) Estado del proyecto

MRASysCont está cerrado en:
- Fase 0.6: GO
- Fase 1: GO
- Fase 2: GO
- Fase 3: GO
- Fase 4: GO
- Fase 5: GO
- Fase 6: GO
- Fase 7: GO
- Fase 8: GO (IVA base)

## 2) Qué hay implementado

- Tenancy real: `studyId -> clientOfStudyId -> companyId`
- Seguridad backend con autorización por objeto
- Gestión estudio (clientes, tareas, vencimientos, dashboard)
- Terceros y cuentas corrientes
- Núcleo contable (cuentas, periodos, asientos, cierres, diario, mayor)
- Expediente documental (Fase 5)
- Multimoneda base ARS/USD (Fase 6)
- Comprobantes locales (Fase 7)
- IVA base (Fase 8): libro ventas/compras, reporte mensual, export CSV/Excel, conciliación vs contabilidad

## 3) Documentación canónica clave

Leer primero:
- `AGENTS.md`
- `docs/ROADMAP.md`
- `docs/TENANCY_AND_ENVIRONMENTS_CANONICAL.md`
- `docs/ENDPOINT_AUTHORIZATION.md`
- `docs/STATE_MACHINE.md`
- `docs/TRACEABILITY_MATRIX.md`
- `docs/CRITICAL_TEST_COVERAGE.md`
- `docs/CI_QUALITY_GATES.md`
- `docs/SECURITY_MODEL.md`
- `docs/TESTING_STRATEGY.md`
- `docs/API_CONTRACT.md`
- `docs/TECHNICAL_SPEC.md`

## 4) Quality gates (obligatorios)

Ejecutar en este orden:

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

## 5) Setup en otra PC

Requisitos:
- Node.js 20+
- npm 10+
- PostgreSQL 15+ (o Docker)

Pasos:

```bash
git clone https://github.com/marceloanton/MRASysCont.git
cd MRASysCont
npm install
copy .env.example .env
npm run prisma:generate
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev
```

## 6) Licencia y uso comercial

Modelo actual:
- Licencia propietaria (no open source)
- Uso evaluación/no comercial: permitido
- Uso comercial/facturación real: requiere licencia paga

Archivos legales:
- `LICENSE`
- `TERMS.md`
- `COMMERCIAL_LICENSE.md`

Contacto comercial:
- marceloanton@outlook.com

Variables de licencia:

```bash
MRASYSCONT_LICENSE_KEY=""
MRASYSCONT_ENFORCE_LICENSE="false"
```

Si `MRASYSCONT_ENFORCE_LICENSE=true` y no hay key, se bloquean acciones de comprobantes.

## 7) Evidencia visual

Screenshots en:
- `docs/screenshots/`

Generación automática:
- `scripts/capture-screenshots.mjs`

## 8) Despliegue gratis recomendado

- App: Vercel free
- DB: Neon o Supabase free
- Storage docs: Supabase Storage o Cloudflare R2 free tier

Nota: free tier no reemplaza operación productiva con SLA.

## 9) Riesgos/deuda conocida

- Mantener deuda documentada por fase en `docs/PHASE_*_DEFERRED_ITEMS.md`
- Respetar no mezclar fases ni adelantar módulos
- Mantener Decimal para importes monetarios y fiscales

## 10) Próximo paso sugerido

Antes de implementar Fase 9:
1. Auditoría pre-Fase 9
2. Cierre documental específico de Fase 9
3. Implementación Fase 9
4. Quality gates completos

