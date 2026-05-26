## Resumen

<!-- Describir objetivo del cambio -->

## Alcance

- [ ] Fase alineada con `docs/ROADMAP.md`
- [ ] No hay mezcla de fases sin decision documentada

## Checklist obligatorio

### Seguridad
- [ ] Autorizacion backend aplicada
- [ ] Autorizacion por objeto en endpoints con ID
- [ ] Sin fuga multi-tenant
- [ ] Sin secretos en logs/respuestas

### Tenancy
- [ ] Scope correcto (`studyId`, `clientOfStudyId`, `companyId`)
- [ ] Sin acceso cruzado entre estudios/empresas

### Dominio
- [ ] Reglas de fase respetadas
- [ ] Sin features fuera de alcance

### Tests
- [ ] Tests criticos agregados/actualizados
- [ ] `npm run test:tenancy` en verde
- [ ] `npm run test:permissions` en verde
- [ ] `npm test` en verde

### Quality gates
- [ ] `npx prisma validate`
- [ ] `npm run db:migration:check`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run build`

### Documentacion
- [ ] Docs canonicos actualizados
- [ ] Trazabilidad requisito -> test actualizada
