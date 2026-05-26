# Fiscal Contingency Plan

## Casos
- WSAA falla.
- WSFEv1 rechaza o timeout.
- Corte luego de enviar solicitud.

## Reglas
- No duplicar comprobantes.
- No marcar autorizado sin CAE valido.
- Mantener estado `pendiente_fiscal`.
- Registrar request/response sanitizados e intentos.
- Permitir retry controlado y consulta posterior.
