# Videl: versión publicada y recuperación

Guardado el 9 de octubre de 2026, por petición del usuario.

- Invitación pública: https://www.salondefiestasvillaverde.com/mis-xv-videl
- Proyecto Vercel: `villaverde-web`.
- Código publicado: `5b0f50b8706a045fa7c39d582416f2ffaffd057c`.
- Base que ya estaba en producción: `706114b07b19a6c09c8c51f9576f8e0d9517e29d`.
- Despliegue activo: `dpl_ESV2dXx5WdToyE1PKdfSdtJhVASV`.
- Rama local de la versión publicada: `codex/videl-publicacion`.
- Copia de publicación: `C:/claude/villaverde-crm/.context/audits/videl/publication-20261009`.

La rama de publicación conserva las páginas e invitaciones que ya estaban en
producción. Para una publicación futura, continuar desde esa rama o desde una
base de producción verificada. El checkout local `main` partía de `e670837` y
se guarda como punto de control del desarrollo, no como base del sitio actual.

Contenido de Videl: `public/mis-xv-videl/`, `src/app/api/videl-trivia/`,
`src/lib/videl-trivia.mjs`, `tests/videl-trivia.test.mjs` y
`supabase-videl-trivia.sql`. Se conservan las dos versiones de la invitación,
la foto original y editada, los ocho capítulos MP4, la apertura del sobre y el
MP3 íntegro de Te Regalo de Carla Morrison.

Fecha del evento: 21 de noviembre de 2026, 18:30, Ciudad de México.
Confirmación: Claudia Antunez, 5548614656, mediante WhatsApp.

La trivia está activada en Supabase `gfbixkddumsqlfrfbsmp`, migración
`videl_trivia_private_ranking`. El esquema y sus permisos se documentan en
`videl-trivia.md`. Los datos de invitados viven en la base de datos; no se
incluyen en Git ni en el respaldo de archivos. Tampoco se guardan credenciales.

Validación de la publicación: 17 pruebas Node, TypeScript sin errores, apertura
del sobre, video y música en reproducción real, navegación por clic,
confirmación con el teléfono correcto, top 20 y cabeceras de privacidad.
Recibo y captura en `C:/claude/villaverde-crm/.context/audits/videl/`.

## Restauración del diseño vertical

El 9 de octubre de 2026, el usuario eligió regresar al diseño anterior completo
con desplazamiento vertical. `index.html` vuelve a ser la invitación activa.
Los enlaces `/mis-xv-videl/cine.html` y `/mis-xv-videl/cine` redirigen con 307 a
`/mis-xv-videl`, conservando parámetros. El sobre animado, las mariposas, los
títulos y la canción funcionan en esa página original.

La prueba cinematográfica y su trivia permanecen en el historial y en el
respaldo completo guardado. Los identificadores de despliegue listados arriba
corresponden a aquella publicación; la restauración se registra por separado
en `.context/audits/videl/vertical-restoration-receipt.json`.

## Foto y trivia en la versión vertical

El mismo 9 de octubre, el usuario pidió conservar también la foto y la trivia.
`index.html` incluye el retrato enmarcado después de la portada, con el video
existente `01-portada.mp4`, imagen alternativa y control de pausa. Respeta el
movimiento reducido, ahorro de datos, pestaña oculta y pausa global.

La trivia aparece después de la confirmación, con diez preguntas, el API
existente, primer intento oficial, Top 20 y puesto propio entre todos los
participantes. No carga la navegación por capítulos ni bloquea el desplazamiento.
Los módulos aislados son `portrait.js/css` y `trivia.js/css`.

Validación: 17 pruebas de API, prueba aislada de UI con 26 participantes,
TypeScript, sintaxis y comprobación visual local y pública. Recibo y capturas
en `.context/audits/videl/vertical-photo-trivia-receipt.json` y los archivos
`vertical-foto-publicada.png` y `vertical-trivia-publicada.png`.
