# PUBLIC_SYNC_RULES

## Objetivo
Definir que contenido puede sincronizarse al repositorio publico desde el repositorio privado.

## Regla principal
El repositorio privado es la fuente principal de desarrollo.
El repositorio publico es solo vitrina comercial y demo.

## Se puede publicar (allowlist)
- Landing publica (`/publico`).
- Capturas y assets de presentacion (`public/screenshots/*`).
- README comercial.
- Documentacion comercial/publica:
  - pricing publico
  - demo script
  - FAQ publica
  - onboarding comercial
  - roadmap publico resumido
- Archivos legales publicos (licencia/terminos comerciales).

## No se publica (denylist)
- AGENTS interno completo.
- Threat model interno.
- Reglas de seguridad operativa detalladas.
- Modelos de autorizacion internos detallados.
- Matrices internas de trazabilidad y cobertura critica.
- Runbooks de incidente/DR internos detallados.
- Estrategia de testing interna completa.
- Migraciones/contratos en desarrollo no anunciados.
- Credenciales, llaves, seeds sensibles o datos reales.

## Procedimiento de sincronizacion privado -> publico
1. Tomar cambios solo de la allowlist.
2. Revisar que no haya referencias a documentos privados.
3. Validar build/lint.
4. Publicar en rama principal del repo publico.

## Gobernanza
- Cualquier excepcion debe aprobarla el owner.
- Si hay duda: NO publicar hasta revisar.

## Contacto
- marceloanton@outlook.com
