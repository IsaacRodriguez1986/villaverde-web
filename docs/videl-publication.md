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

## Flores y detalles de princesa

El 9 de octubre de 2026, el usuario pidió más flores y detalles de princesa,
con una referencia visual de TikTok, y solicitó GPT Image 2 para los diseños.
La invitación vertical incorpora rosas y peonías rosas, hojas plateadas,
perlas, coronas, filigranas y destellos suaves. El retrato tiene un marco
exterior con flores; fecha, confirmación, foto, música y trivia siguen usando
los datos y módulos existentes.

El recurso `assets/princess-gpt-image-2.webp` procede del modelo verificado
`gpt_image_2` (OpenAI mediante Higgsfield), 2048 × 2048, calidad alta, trabajo
`1fd2c010-cdf2-4355-9630-2b994b11759a`. El original PNG tiene fondo blanco,
sin alfa; `mix-blend-mode: multiply` lo integra sobre el papel rosa. La
conversión a WebP reduce su tamaño a 410274 bytes. Las coronas y filigranas
son SVG y la composición está en `assets/princess.css`.

Las decoraciones no reciben clics y permanecen detrás del contenido. Los
destellos respetan la pausa global, la apertura del sobre y la preferencia
de movimiento reducido. Las pruebas móviles conservan el desplazamiento
vertical, la reproducción del retrato y el acceso al Top 20 sin escribir
participaciones de prueba en producción.

El PNG original y el registro del modelo se conservan en
`.context/audits/videl/princess-art/` del repositorio raíz. La publicación,
sus comprobaciones y capturas se registran en
`.context/audits/videl/princess-publication-receipt.json`.

## Rediseño completo de princesa

El 9 de octubre de 2026, el usuario pidió acercar mucho más toda la composición
a su ejemplo de TikTok. La portada ahora presenta un marco rococó de plata con
tiara, perlas y grandes ramos. Cada sección tiene una guirnalda de rosas, papel
marfil enmarcado y ramos inferiores. Regalos y vestimenta tienen sus propias
secciones; esta última incorpora la ilustración de un vestido de gala marfil
y un esmoquin negro. Las coronas de fecha y trivia se sustituyen por la nueva
tiara de plata. Se mantiene el rosa y la plata solicitados para Videl.

Los cuatro recursos nuevos proceden de `gpt_image_2` (OpenAI mediante Higgsfield),
resolución 2k y calidad alta:

- Portada: `royal-hero-gpt2.webp`, trabajo `97e4a94e-9682-42e0-a8ae-3181f7b10dc4`.
- Guirnalda: `royal-garland-gpt2.webp`, trabajo `c3799d31-23fe-4405-bad9-08929ad8b882`.
- Vestimenta: `royal-dress-code-gpt2.webp`, trabajo `2c2e9534-8960-4b95-be56-c39c0ffab648`.
- Tiara: `royal-tiara-gpt2.webp`, trabajo `ec740130-34ac-4d4c-9dee-c03a462562a5`.

La composición vive en `assets/royal-design.css`; `royal-magic.js/css` agrega
destellos, luz de perlas y pétalos en los márgenes. Respeta la apertura del sobre,
la pausa general, movimiento reducido, ahorro de datos y pestaña oculta. La foto
conserva su video original completo en 9:16, con marco rectangular sin recorte.
Fecha, música, confirmación y trivia mantienen sus datos y lógica existentes.

Validación local: TypeScript, sintaxis, identificadores HTML únicos, ausencia de
desbordamiento a 320/390/620/1280, apertura del sobre, video y música, controles
de pausa y 20 filas entre 28 participantes simulados únicamente en lectura GET.
Se publica un solo artefacto preparado y se promueve ese mismo despliegue.
Originales PNG, registros del modelo y evidencia se conservan en
`.context/audits/videl/royal-art/` y `royal-publication-receipt.json` en la raíz.
