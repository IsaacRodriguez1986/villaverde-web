# Plano visual de mesas

Referencia: imagen proporcionada por el usuario (personas alrededor de las mesas).
Implementación sobre las operaciones existentes, sin cambio de esquema ni permisos.

- Mesas redondas sobre un plano claro; titulares con iniciales y acompañantes con
  puntos del mismo color. Para más de 20 lugares se resume la representación;
  el cupo real sigue completo y todos los grupos están en la lista lateral.
- Arrastre de grupos entre mesas y hacia Sin mesa con ratón o eventos táctiles.
- Un toque selecciona el grupo y permite elegir destino con un control accesible.
- Los acompañantes viajan con su titular. No se inventan nombres ni se permite
  dividir un grupo; se persiste asignación a mesa, no el orden de las sillas.
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
