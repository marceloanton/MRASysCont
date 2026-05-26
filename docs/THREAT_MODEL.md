# Threat Model

## Amenazas Minimas
1. Acceso a recursos de otro cliente/empresa por cambio de ID.
2. Descarga de documento privado sin permisos.
3. Confirmacion de asiento desbalanceado.
4. Operacion en periodo cerrado.
5. Duplicacion por retry sin idempotencia.
6. Reuso de `idempotency_key` en otro tenant.
7. Filtrado de secretos en logs.
8. Upload malicioso.
9. Elevacion de privilegios por cambio de rol.
10. Falla ARCA en medio de autorizacion fiscal.

## Para Cada Amenaza
Registrar: riesgo, impacto, mitigacion, modulo afectado y test obligatorio.
