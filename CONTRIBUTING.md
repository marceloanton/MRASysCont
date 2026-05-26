# Contributing To MRASysCont

Gracias por colaborar en MRASysCont.

## Reglas base

- Implementar por fases segun `docs/ROADMAP.md`.
- No mezclar fases sin decision documentada.
- Respetar fuentes canonicas definidas en `AGENTS.md`.
- Toda accion debe mantener tenancy: `studyId -> clientOfStudyId -> companyId`.
- No usar `float/double` para importes.

## Flujo de trabajo

1. Crear rama desde `main`.
2. Implementar alcance acotado.
3. Agregar/actualizar tests criticos asociados.
4. Actualizar documentacion afectada.
5. Abrir PR con checklist completo.

## Quality gates obligatorios

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

## Criterios para aceptar un PR

- No rompe tenancy ni permisos.
- No introduce endpoints sin autorizacion backend.
- No rompe reglas contables/fiscales de la fase.
- Incluye tests y documentacion.
- CI en verde.

## Convenciones

- Commits claros por alcance.
- Evitar cambios masivos no relacionados.
- No subir secretos o datos sensibles.

## Contacto

Licencia/comercial: marceloanton@outlook.com
