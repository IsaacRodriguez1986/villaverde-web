# Plano visual de mesas

Referencia: imagen proporcionada por el usuario (personas alrededor de las mesas).
Implementación sobre las operaciones existentes, con asignación persistente de sillas.

- Mesas redondas sobre un plano claro; titulares con iniciales y acompañantes con
  puntos del mismo color. Para más de 20 lugares se resume la representación;
  el cupo real sigue completo y todos los grupos están en la lista lateral.
- Arrastre de grupos entre mesas y hacia Sin mesa con ratón o eventos táctiles.
- Un toque selecciona el grupo y permite elegir destino con un control accesible.
- Cada persona ocupa una silla numerada persistida en `seat_slots`. Dentro de una
  mesa se pueden mover titular y acompañantes por separado; una silla ocupada
  intercambia las dos personas. Entre mesas viaja el grupo completo, con la persona
  elegida en la silla indicada. Un destino ocupado en otra mesa se rechaza.
- El selector de silla permite elegir cualquier lugar incluso en mesas de más de
  20 personas. No se inventan nombres para acompañantes.
- Posición de mesas sigue usando coordenadas normalizadas 0–100. Zoom/paneo son
  de la vista; no modifican los datos. Se mantiene control de cupo y de versiones.
- Errores no anuncian un guardado ni cambian la asignación persistida.

Validación: test navegador existente ampliado, Chrome 1280/390 px. Se probaron
arrastre HTML real, gestos táctiles vía CDP (grupo y mesa), destino por selección,
desasignación, acompañantes, cupo completo, error 409 y regresiones de programa,
galería/recepción. Demo a 1440/390 px sin errores JS ni overflow horizontal.
Esto no sustituye un ensayo físico en Safari/iPhone.

Demo local: `node scripts/eventus-experience-demo.cjs`, puerto 3211, datos ficticios.
Este rediseño no se ha publicado aún.

## Corrección de silla exacta

Requiere aplicar, antes de publicar, la migración del backend
`20260925054505_eventus_exact_seats.sql` (pendiente en producción). Conserva
permisos de servicio, bloqueo por evento y control de versiones.

Verificado con SQL aislado (asignación, intercambios, cupo, conflictos y límites),
13 pruebas API/seguridad, TypeScript y build. Las pruebas de navegador a 1280/390 px
comprueban arrastre, movimiento táctil, intercambio, acompañante independiente y
persistencia tras recargar. La demo guarda únicamente datos ficticios en
localStorage del navegador; no conecta con datos reales.
