# Support Playbook

## 1) Recepcion de incidente
- Registrar fecha/hora, estudio, empresa, modulo, impacto.

## 2) Clasificacion
- Critico: caida total, fuga de datos, bloqueo operativo contable/fiscal.
- Alto: falla funcional severa sin fuga.
- Medio/Bajo: degradacion o UX.

## 3) Diagnostico rapido
- Reproducir en entorno controlado.
- Revisar logs sanitizados.
- Validar tenancy y permisos.

## 4) Resolucion
- Fix minimo seguro.
- Test de regresion obligatorio.
- Actualizar changelog/deuda si aplica.

## 5) Cierre
- Comunicar causa raiz.
- Confirmar mitigacion y estado final.
