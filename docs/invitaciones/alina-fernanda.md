# Invitación de Alina Fernanda

Ruta prevista: `/mis-xv-alina-fernanda`.
Fuentes: `public/mis-xv-alina-fernanda/`.
Diseño aprobado: primera muestra floral, con champán, terracota y durazno;
flores en acuarela, marco fino y nombre caligráfico. La variante juvenil no fue elegida.

## Datos confirmados por la familia

- Sábado 28 de noviembre de 2026, hora de Ciudad de México.
- Misa: 15:45, San José Obrero, C. San José Obrero S/N,
  Col. Jiménez Cantú, Ixtapaluca. El enlace de Maps busca esta dirección;
  no se ha verificado un pin independiente de la iglesia.
- Recepción: 18:00, Salón Villaverde; confirmado explícitamente en este chat.
- Joana Sánchez, presentada como «Con el cariño de», sin añadir otro progenitor.
- Padrinos: Madelin Sánchez y David Rendón.
- Vestimenta: elegante sport. Azul cielo reservado exclusivamente para la quinceañera.
- Música: «If Only», de Dove Cameron. MP3 entregado por el usuario el 9 de octubre
  de 2026 y copiado íntegro a `assets/cancion.mp3` (3:42). Empieza al abrir la
  invitación y conserva los controles de pausa y reproducción.

## Funciones

- Apertura cinematográfica con sobre marfil, filigrana dorada, sello AF y flores,
  creado en Higgsfield. El poster se muestra al cargar y el MP4 sólo se solicita
  al tocar el sobre; después de la película hay un fundido hacia la invitación.
  `Saltar intro` y Escape permiten entrar directamente. Movimiento reducido y
  ahorro de datos omiten el video. Ante errores o espera excesiva se usa el sobre
  CSS o se abre la invitación; nunca se deja al invitado bloqueado.
  La página sigue siendo legible sin JavaScript.
- Nombre, frase y fecha con entradas escalonadas al abrir; títulos y algunos
  párrafos se animan al desplazarse. Respeta la preferencia de movimiento reducido.
- Flores originales en capas transparentes y mosaico de fotos; los motivos florales
  se animan sólo cuando están a la vista. El control de pausa conserva todo el texto
  legible y la animación se detiene cuando la pestaña queda en segundo plano.
- Retrato mejorado de Alina después de la portada, con marco fino y guirnalda
  inferior. Usa WebP de 480/960 píxeles, conserva el encuadre completo y tiene
  una entrada suave al aparecer. La foto fue proporcionada por el usuario.
- Contador hasta la misa con offset explícito `-06:00`; no muestra negativos.
- Calendario de noviembre y descarga ICS con dos eventos sin inventar hora de cierre.
  Google Calendar crea un recordatorio de día completo con ambos horarios en la descripción.
- Mapas de misa y recepción; fotos reales de Villaverde procedentes de sus invitaciones existentes.
- Audio local preparado desde el gesto de apertura, sin sonido durante la intro;
  la canción configurada empieza al mostrar la invitación y conserva su control
  manual si el navegador bloquea la reproducción.
- Enlaces personalizados `?para=Familia+Pérez&pases=3` (de 1 a 20), sin guardar datos.
  Son personalización visual, no boletos autenticados ni control de acceso.
- Formulario de RSVP que abrirá WhatsApp; no guarda confirmaciones en base de datos
  ni envía mensajes automáticamente. Se habilita sólo con un destinatario confirmado.
- Trivia activa con las ocho respuestas confirmadas, cuatro opciones por pregunta
  y 100 puntos por acierto. El invitado elige un nombre o apodo que aparecerá en el
  marcador compartido. Las respuestas se califican en `/api/alina-trivia`; el navegador
  no recibe la clave de respuestas ni decide los puntos.
  Supabase guarda cada intento una sola vez en `alina_trivia_results`, con acceso
  reservado al servidor. El marcador muestra los primeros 20 participantes, el total
  de invitados y empates que comparten lugar. Los reintentos de conexión reutilizan
  el identificador del intento; sessionStorage conserva sólo sus respuestas para
  recuperarlo desde el servidor, nunca un ranking local.
- Vista previa social propia, URL limpia y cabeceras `noindex` y `no-referrer`.

## Dirección visual y recursos

La revisión floral mantiene la primera muestra aprobada: papel marfil, rosas durazno,
follaje salvia y caligrafía terracota. El sobre, la portada, la familia y el cierre
usan arreglos independientes; no dependen de estirar una sola imagen de fondo.

Inspiración visual consultada a petición del usuario:
[invitación floral durazno en Pinterest](https://es.pinterest.com/pin/editable-invitation-elegant-peach-blush-floral-quinceanera-invitation-birthday-invite-mis-quince-printable-invite-t--1010635972612970810/).
Se revisaron referencias indexadas de composición floral; no se copiaron sus
imágenes, datos ni textos. Los dos arreglos se generaron para esta invitación a
partir de la muestra aprobada y se conservan como PNG con transparencia.
La página sirve sus versiones WebP (`flores-esquina.webp` y `flores-guirnalda.webp`)
para reducir la descarga y reutiliza esos dos archivos en todas las secciones.

La apertura usa `sobre-princesa-poster.webp` y `apertura-sobre.mp4` del mismo
directorio de assets. El video es silencioso para que la canción definitiva siga
siendo la que confirme la familia. Los prompts, modelos e identificadores de
generación se documentan en `alina-apertura-higgsfield.json`.

El interior retoma los detalles dorados del sobre: emblema XV, filigranas finas,
fecha con el día destacado y marco ornamental alrededor del retrato completo.
El contador introduce una sección salvia; las ubicaciones tienen ilustraciones
lineales de ceremonia y celebración. La confirmación conserva el acabado de una
carta y el cierre repite el monograma AF. Los adornos son SVG decorativos locales,
sin nuevas descargas, y sus entradas usan el mismo control de pausa y preferencia
de movimiento reducido que los textos.

## Datos pendientes

1. WhatsApp receptor: completar `rsvpPhone` en `assets/config.js` con `52` + 10 dígitos,
   una vez confirmado. No reutilizar teléfonos de otras invitaciones.
2. Trivia: faltan las respuestas de las preguntas 6 y 10. Se omiten del juego actual,
   que tiene ocho preguntas y un máximo de 800 puntos. Al completarlas, versionar
   el cuestionario y su marcador para no mezclar resultados de ocho y diez preguntas.

## Preguntas propuestas para la trivia

1. ¿Cuál es tu color favorito?
2. ¿Cuál es tu comida favorita?
3. ¿Cuál es tu postre favorito?
4. ¿Quién es tu cantante o grupo favorito?
5. ¿Cuál es tu canción favorita?
6. ¿Cuál es tu película o serie favorita? Elige una.
7. ¿Qué es lo que más te gusta hacer en tu tiempo libre?
8. ¿Cuál es tu animal favorito?
9. ¿Qué país te gustaría conocer?
10. ¿Cuál sería tu salida perfecta con amigos?

El juego usa cuatro opciones y una correcta por pregunta, 100 puntos por acierto;
nombre/apodo, puntos y posición en el marcador, con empates compartiendo lugar.
Las opciones incorrectas son distractores del juego, no preferencias atribuidas a Alina.

### Respuestas confirmadas el 9 de octubre de 2026

| Número | Tema | Respuesta correcta |
| --- | --- | --- |
| 1 | Color favorito | Rosa |
| 2 | Comida favorita | Chilaquiles |
| 3 | Postre favorito | Uvas |
| 4 | Cantante o grupo favorito | Charles Ans |
| 5 | Canción favorita | Visita (Enjambre) |
| 6 | Película o serie favorita | Pendiente |
| 7 | Actividad en el tiempo libre | Ver videos |
| 8 | Animal favorito | Cerditos |
| 9 | País que le gustaría conocer | Suiza |
| 10 | Salida perfecta con amigos | Pendiente |

Las respuestas 6 y 10 llegaron vacías. Conservarlas como pendientes hasta que
el usuario las confirme; no deducirlas de las otras respuestas.

## Revisión local

`npm run dev -- --hostname 127.0.0.1 --port 3028`

Abrir `http://127.0.0.1:3028/mis-xv-alina-fernanda`.
Pruebas de navegador: `NODE_PATH=<directorio con Playwright> node --test scripts/alina-invitation.browser.test.cjs`.
Las pruebas usan contactos y audio sintéticos; no deben enviar mensajes reales.

La publicación debe realizarse por el flujo habitual de Villaverde cuando esté autorizada.
