# Release Checklist - MRASysCont

## Criterio GO/NO GO por fase

### 1. Alcance
- [ ] Solo incluye entregables de la fase objetivo.
- [ ] No mezcla fases posteriores.

### 2. Seguridad y tenancy
- [ ] Sin fuga multi-tenant.
- [ ] Autorizacion por objeto aplicada.
- [ ] Scope study/client/company correcto.

### 3. Reglas de dominio
- [ ] Reglas contables/fiscales de fase respetadas.
- [ ] Estados y transiciones validas.

### 4. Tests
- [ ] Tests criticos de fase implementados.
- [ ] Trazabilidad requisito -> test actualizada.

### 5. Quality gates
- [ ] npx prisma validate
- [ ] npm run db:migration:check
- [ ] npm run lint
- [ ] npm run typecheck
- [ ] npm run test:tenancy
- [ ] npm run test:permissions
- [ ] npm test
- [ ] npm run build

### 6. Documentacion
- [ ] Docs canonicos actualizados.
- [ ] Deuda/remanentes documentados.

Resultado:
- [ ] GO
- [ ] NO GO

Motivo:
