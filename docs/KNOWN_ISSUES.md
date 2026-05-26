# Known Issues

## CI en GitHub Actions
- Estado: pendiente de activacion por permisos OAuth sin scope `workflow`.
- Workaround: usar checks locales y PR checklist.
- Archivo plantilla: `docs/ci.workflow.yml`.

## Notas de line endings (CRLF/LF)
- Pueden aparecer warnings de conversion en Windows.
- No bloquea build/tests.

## Free tier deploy
- Puede haber latencia/sleep en servicios gratuitos.
