# Auditoría web · salondefiestasvillaverde.com

## Lighthouse móvil, producción

- Rendimiento: 76
- Accesibilidad: 99
- Buenas prácticas: 100
- SEO: 100
- FCP: 1.4 s
- LCP: 4.9 s
- TBT: 300 ms
- CLS: 0

## Correcciones incluidas

- Prioridad explícita para la imagen principal que determina el LCP.
- Jerarquía de encabezados corregida en el pie de página.
- Selector rápido de paquete para reducir carga de decisión.
- Catálogo visual de desarrollo y reglas de componentes.
- Endurecimiento de Eventus y cabeceras privadas.

## Oportunidades restantes

- Reducir el póster remoto del video vertical: Lighthouse estima cerca de 164 KiB evitables.
- Dividir JavaScript interactivo de la landing: Lighthouse estima cerca de 53 KiB sin uso en la carga inicial.
- Volver a medir la vista previa; la medición anterior corresponde a la producción previa a estos cambios.

Archivos fuente: `.context/audits/lighthouse-production.report.json` y `.context/audits/lighthouse-production.report.html`.
