# SECURITY_MODEL

## Objetivo
Modelo de seguridad para identidad, autorizacion, datos y auditoria.

## Canonico
- Autorizacion endpoint-level: `docs/ENDPOINT_AUTHORIZATION.md`
- Tenancy/entornos: `docs/TENANCY_AND_ENVIRONMENTS_CANONICAL.md`
- Threats: `docs/THREAT_MODEL.md`

## Principios
- Zero trust entre tenants.
- RBAC + object authorization backend.
- Defensa en profundidad.

## Reglas
- Backend valida autenticacion, permiso y alcance sobre objeto.
- No confiar IDs del frontend.
- Descargas privadas solo con URL firmada temporal y permiso.
- No loguear secretos/tokens/certificados.
- Accesos denegados y acciones criticas se auditan.

## Hardening
- rate limiting
- security headers
- CORS estricto
- dependency audit
- secret scan
