# Incident Response - MRASysCont

## Objetivo
Responder rapido y de forma controlada ante incidentes de seguridad, disponibilidad o integridad.

## Severidad
- SEV1: fuga de datos, caida total, corrupcion critica.
- SEV2: falla severa de modulo critico.
- SEV3: degradacion parcial.
- SEV4: incidencia menor.

## Flujo
1. Detectar y registrar incidente.
2. Clasificar severidad.
3. Contener impacto (bloqueo de endpoint, rollback, feature flag).
4. Remediar.
5. Validar con tests/regresion.
6. Comunicar cierre y causa raiz.

## Datos minimos del ticket
- Fecha/hora
- Modulo afectado
- Estudio/empresa impactados
- Severidad
- Causa raiz
- Mitigacion aplicada
- Test/regresion agregado

## Reglas
- No ocultar incidentes de seguridad.
- No exponer datos sensibles en comunicacion.
- Toda fuga multi-tenant es SEV1.
