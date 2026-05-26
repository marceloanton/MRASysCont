# MRASysCont - CI Quality Gates

## Principio
Ningun merge si rompe seguridad, tenancy, permisos, migraciones o tests criticos.

## Gates bloqueantes Fase 1
| Gate | Comando esperado | Bloqueante | Criterio |
|---|---|---:|---|
| Install | `npm ci` | si | instala sin errores |
| Lint | `npm run lint` | si | 0 errores |
| Typecheck | `npm run typecheck` | si | 0 errores |
| Unit tests | `npm run test:unit` | si | 100% pasan |
| Integration tests | `npm run test:integration` | si | 100% pasan |
| Multi-tenant tests | `npm run test:tenancy` | si | 100% pasan |
| Permission tests | `npm run test:permissions` | si | 100% pasan |
| Migration check | `npm run db:migration:check` | si | aplica en DB limpia |
| Build | `npm run build` | si | build exitoso |
| Dependency audit | `npm audit` | si (criticas) | 0 vulnerabilidades criticas sin excepcion documentada |
| Secrets scan | herramienta disponible | si | 0 secretos en repo |
| API contract check | `npm run test:contract` (si aplica) | si cuando exista | contrato consistente |

## Umbrales minimos Fase 1
- tests criticos fase 1: 100% pasan
- tests tenancy: 100% pasan
- tests permisos: 100% pasan
- tests object authorization: 100% pasan
- tests auditoria critica: 100% pasan
- type errors: 0
- lint errors: 0
- migraciones fallidas: 0
- secretos detectados: 0

## Politica de excepcion
Solo si:
1. documentada
2. responsable asignado
3. fecha de vencimiento
4. no afecta multi-tenancy/permisos/secretos/tests criticos
