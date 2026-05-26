# Security Baseline - MRASysCont

## Objetivo
Definir controles minimos de seguridad para operar en entornos reales.

## Baseline obligatorio

### Aplicacion
- HTTPS obligatorio en produccion.
- Cookies de sesion con `HttpOnly`, `Secure`, `SameSite`.
- CORS restringido a origenes permitidos.
- Headers de seguridad (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
- Validacion de input en backend.
- Autorizacion por objeto en endpoints con ID.

### Tenancy
- Scope obligatorio `studyId` y `companyId` en recursos operativos.
- Prohibido acceso cruzado entre estudios/empresas.

### Secretos
- No secretos en repo.
- Rotacion periodica de secretos.
- Logs sin tokens, passwords o certificados.

### Base de datos
- Minimo privilegio para credenciales de app.
- Backups cifrados.
- Restore probado periodicamente.

### Observabilidad
- Logs estructurados sanitizados.
- Alertas para errores 5xx, accesos denegados inusuales y fallas criticas.

## Gate de seguridad previa a produccion
- Checklist de `docs/SECURITY_MODEL.md` completo.
- Quality gates en verde.
- Relevamiento de riesgos abiertos documentado.
