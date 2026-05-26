# ADR 0003 - Autorizacion Por Objeto

- Fecha: 2026-05-24
- Estado: Aceptado

## Contexto
RBAC solo no evita BOLA/IDOR.

## Decision
Aplicar autorizacion en 3 capas: sesion, alcance tenant y verificacion por objeto.

## Alternativas
- Validacion solo por rol.
- Validacion solo en frontend.

## Consecuencias
- Menor riesgo de acceso cruzado.
- Mayor cobertura de tests de permisos.
