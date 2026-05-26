# Module Map

| Modulo | Carpeta principal | Fase | Owner sugerido |
|---|---|---|---|
| Auth/Tenancy | `lib/phase1`, `app/login`, `app/admin/*` | 1 | Security/Auth |
| Gestion estudio | `lib/phase2`, `app/estudio/*` | 2 | Product/Backoffice |
| Terceros/CC | `lib/phase3`, `app/terceros`, `app/cuentas-corrientes` | 3 | Accounting Ops |
| Nucleo contable | `lib/phase4*`, `app/contabilidad/*` | 4 | Accounting Core |
| Expediente documental | `lib/phase5-documents`, `app/estudio/documentos` | 5 | Documents |
| Multimoneda | `lib/phase6` | 6 | Accounting Core |
| Comprobantes locales | `lib/phase7`, `app/comprobantes` | 7 | Billing Local |
| IVA base | `lib/phase8`, `app/contabilidad/reportes` | 8 | Tax Base |
