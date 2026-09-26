# Plano visual de mesas

Referencia: imagen de Isaac (personas alrededor de las mesas, tarjeta con el nombre al
pasar el cursor) y su indicación: "las mesas son cuadradas y las personas redondas;
toma como ejemplo el render de /informes".

## Cómo se ve

- El salón Villaverde visto desde arriba, vertical como en el render: pantalla a la
  izquierda, cortinas a la derecha, candiles, pista de baile al centro y la escalera
  de entrada abajo. Para eventos en Gardenia (`eventus_events.salon = 'gardenia'`)
  se dibuja un cuarto simple con la pista, hasta tener su croquis.
- Mesas cuadradas con placa dorada (verde cuando está llena) y personas redondas
  pegadas a sus lados. Acompañantes del color de su titular con un punto blanco;
  sillas libres huecas. Cada grupo de una mesa tiene un color distinto (hasta 8).
- Tarjeta flotante con nombre, rol, mesa, silla y estado al pasar el cursor, al
  enfocar con teclado o al elegir a alguien. Se esconde al salir de Mesas.

## Acomodo de mesas

- Plantilla: la cuadrícula con menos filas que acomoda todas las mesas en 3, 5, 7 o
  9 columnas alrededor de la pista; gana la de mesas más grandes (3 columnas en
  empate, como el render). Depende solo del número de mesas.
- Cada mesa ocupa su lugar de la plantilla por orden de número: mover o cambiar el
  cupo de una no mueve a las demás. Una mesa colocada a mano (`version > 1`) se
  queda donde la dejaron; si tapa el lugar de otra, esa otra va al hueco libre más
  cercano. Al agregar mesas y cambiar la cuadrícula, las no colocadas a mano se
  reacomodan.
- No se puede soltar una mesa sobre la pista ni sobre otra mesa. Una posición
  guardada con el tablero horizontal anterior que cae en la pista vuelve a la
  plantilla. Una mesa que se encima se marca en rojo y el inspector lo avisa.
- Cupo de 1 a 16 lugares por mesa (formulario y API). La base conserva su límite
  de 1000; en producción el máximo actual es 10.

## Mover personas

- Arrastre con ratón; en el celular, pulsación larga (350 ms) y arrastre. Las mesas
  donde el grupo no cabe se atenúan y soltar ahí avisa sin llamar al servidor.
- Un toque elige a la persona y abre la barra "Mover" (fija abajo, encima de la
  barra de navegación; el plano no salta). Tocar una mesa solo la pone como
  destino: mover un grupo siempre se confirma con "Mover".
- En el celular, con el plano a menos de 80%, el primer toque acerca a 100% en ese
  punto en vez de elegir a alguien (a 32% una persona mide 8 px).
- Cada persona ocupa una silla guardada en `seat_slots`. En la misma mesa, una silla
  ocupada intercambia a las dos personas; entre mesas viaja el grupo completo. El
  cliente manda quién vio en la silla (`expectedOccupant`) y el servidor rechaza el
  cambio si alguien más se sentó ahí mientras tanto.
- Teclado: Tab recorre las mesas; con las flechas se entra a sus sillas, Escape
  regresa a la mesa o cancela la selección. "Actualizar" conserva foco y posición.
- Avisos en español sobre el plano y en el aviso global (anunciado por lectores de
  pantalla). Sin conexión, sesión vencida, 5xx y rechazos tienen texto propio. Un
  guardado que tarda más de 15 s recarga el plano sin asegurar que se guardó.

## Recepción y RSVP

- "Por llegar" y el resultado del registro muestran mesa y sillas.
- Un invitado que canceló y vuelve a confirmar queda confirmado; si su mesa se llenó
  mientras tanto, pasa a "Sin mesa" en vez de recibir un error.

## Publicación

1. Aplicar en Supabase la migración del bot `eventus_exact_seats` (aplicada el 26-sep-2026 como `20260926050939`)
   y comprobar `select seat_slots from eventus_guests limit 0`. Es compatible con la
   web publicada. Si la web sale antes, la lista de invitados no carga.
2. Después integrar la rama a `main` de villaverde-web: Vercel publica `main` solo.

## Validación

- `scripts/eventus-experience.browser.test.cjs` (1280 y 390 px): entrada por Inicio,
  cupo, conflictos, mover mesas sin mover las demás, arrastre táctil de personas y
  mesas, tocar una mesa con alguien elegido, recepción con mesa y sillas, programa y
  galería.
- `scripts/eventus-exact-seats.browser.test.cjs` contra la demo: silla exacta,
  intercambio, acompañante independiente, primer toque que acerca, persistencia.
- `tests/eventus-experience-api.test.mjs`: permisos, errores de la base traducidos,
  reintento ante interbloqueo, ocupante esperado, cupo 16 y RSVP sin mesa.
- En el bot, `tests/eventus-exact-seats.sql.test.mjs` con PGlite: reducir cupo con
  huecos, ocupante esperado, registro con sillas e id fuera de rango.
- No sustituye un ensayo físico en Safari/iPhone.

Demo local: `node scripts/eventus-experience-demo.cjs`, puerto 3211, datos ficticios
guardados solo en el navegador.
