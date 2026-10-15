# Protección de invitaciones al publicar

`npm run build` ejecuta `build:verified`: valida las fuentes, compila Next y
valida las rutas y APIs realmente emitidas. Un error devuelve código 1 y evita
que Vercel sustituya el sitio publicado. El comando de build del proyecto Vercel
debe ser `npm run build:verified`; así una copia anterior sin ese script tampoco
puede publicar por el flujo normal de builds.

El registro `config/invitations-publication.json` conserva las 11 invitaciones y
sus 262 archivos iniciales, además de los APIs y enlaces antiguos necesarios.
Es independiente de las carpetas y de `next.config.ts`: quitar accidentalmente
ambos no elimina la obligación de conservar la invitación. Se comprueba que los
archivos existan y no estén vacíos, sin fijar hashes que impidan editar diseños.
También se recorren las referencias locales del HTML, CSS y JavaScript actual.

Se bloquean rutas ausentes, reglas que redirijan las invitaciones, pérdida de
cabeceras de privacidad, APIs sin compilar e invitaciones nuevas sin registrar.
`/informes` es una herramienta del salón y está excluida explícitamente del
inventario de invitaciones.

En builds de producción de Vercel, la revisión Git debe coincidir con el último
commit de `main` remoto. Esto impide publicar una copia antigua que sí tenga el
guard pero todavía no conozca una invitación nueva. Si no se puede consultar la
rama, el build falla y la publicación actual se conserva. Las comprobaciones
locales y previews no requieren esa consulta de red.

## Cambios futuros

- Al crear una invitación, añadirla a `INVITACIONES` y al registro, con su HTML,
  recursos y APIs. Ejecutar `npm run check:invitations` y `npm run build`.
- Reemplazar el contenido de un recurso conserva su ruta. Si un cambio aprobado
  renombra o retira un archivo, actualizar también sus referencias y el registro.
- Retirar una invitación o un enlace ya compartido requiere una decisión
  explícita; no borrar entradas del registro para conseguir que pase un build.
- No modificar el comando de Vercel para saltarse un error. El mensaje identifica
  el archivo, ruta o dependencia que debe recuperarse.

`npm run test:invitations` usa archivos temporales y datos sintéticos: simula
pérdidas completas, recursos ausentes/vacíos, errores de rutas, APIs y salida de
Next. No contacta invitados ni escribe en Supabase. GitHub Actions ejecuta esas
pruebas y el control de fuentes en cada pull request y cambio en `main`.
