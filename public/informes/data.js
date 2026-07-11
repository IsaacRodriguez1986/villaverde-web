/* =====================================================================
   VILLAVERDE · Datos de la plataforma (contenido editable)
   ===================================================================== */
window.VV = window.VV || {};

/* ---------- PASOS DEL RECORRIDO (orden cronológico de venta) ---------- */
VV.STEPS = [
  { id: 'bienvenida',  n: 1,  title: 'Bienvenida',     sub: 'Conexión y sueño' },
  { id: 'salon',       n: 2,  title: 'El Salón',       sub: 'Galería y video' },
  { id: 'manteleria',  n: 3,  title: 'Mantelería',     sub: 'Visualiza tu color' },
  { id: 'menu',        n: 4,  title: 'Menú',           sub: 'La cena de gala' },
  { id: 'paquetes',    n: 5,  title: 'Paquetes',       sub: 'Todo incluido' },
  { id: 'cortesias',   n: 6,  title: 'Cortesías',      sub: 'Según tu paquete' },
  { id: 'cotizador',   n: 7,  title: 'Cotizador',      sub: 'Tu inversión' },
  { id: 'testimonios', n: 8,  title: 'Testimonios',    sub: 'Confianza' },
  { id: 'fechas',      n: 9,  title: 'Disponibilidad', sub: 'Aparta tu fecha' },
  { id: 'cierre',      n: 10, title: 'Cierre',         sub: 'Sí, ¡vamos!' },
];

/* ---------- COLORES DE MANTELERÍA ---------- */
VV.MANTELES = [
  { id: 'verde',    name: 'Verde Esmeralda', hex: '#1C7C4F', deep: '#114E32', photo: 'assets/mesa-salon-verde-v3.jpg' },
  { id: 'azul',     name: 'Azul Rey',        hex: '#1E3A8A', deep: '#142862', photo: 'assets/mesa-salon-azul.jpg' },
  { id: 'rojo',     name: 'Rojo',            hex: '#C81E1E', deep: '#8F1414', photo: 'assets/mesa-salon-rojo-v2.jpg' },
  { id: 'guinda',   name: 'Guinda',          hex: '#6E0B27', deep: '#48071A', photo: 'assets/mesa-salon-guinda.jpg' },
  { id: 'magenta',  name: 'Magenta',         hex: '#EC1E8C', deep: '#B30E66', photo: 'assets/mesa-salon-magenta.jpg' },
  { id: 'rosa',     name: 'Rosa Pastel',     hex: '#F2A8C4', deep: '#D87CA4', photo: 'assets/mesa-salon-rosa.jpg' },
  { id: 'dorado',   name: 'Amarillo Dorado', hex: '#C9A227', deep: '#9A7B16', photo: 'assets/mesa-salon-amarillo.jpg' },
  { id: 'negro',    name: 'Negro Elegante',  hex: '#22201F', deep: '#000000', photo: 'assets/mesa-salon-negro-v2.jpg' },
  { id: 'morado',   name: 'Morado Real',     hex: '#6B21A8', deep: '#481574', photo: 'assets/mesa-salon-morado.jpg' },
];

/* ---------- PAQUETES ---------- */
VV.PAQUETES = [
  {
    id: 'premium', name: 'Premium', accent: 'var(--vv-crimson)',
    tag: 'La mejor relación valor-precio', tone: 'crimson',
    horas: '6 horas totales', horasDet: '6h evento + 30 min recepción + 30 min desalojo',
    priceMain: 420, priceFrom: 470,
    priceNote: '150+ invitados', priceNote2: '$470 pp · 100–149 invitados',
    cortesias: 1,
    incluye: [
      'Cena formal de 3 tiempos', 'Refresco y hielo ilimitado',
      'Descorche libre', 'Botella de 3/4 por mesa',
      'Mesas redondas + sillas Tiffany', 'Meseros con capitán',
      'DJ + Maestro de Ceremonias', 'Iluminación inteligente',
      'Batucada con globos', '2 camerinos privados',
      'Invitación digital animada',
    ],
    hereda: null,
  },
  {
    id: 'diamante', name: 'Diamante', accent: 'var(--vv-gold)',
    tag: 'El favorito para XV Años', tone: 'gold', popular: true,
    horas: '7 horas totales', horasDet: '7h evento + 30 min recepción + 30 min desalojo',
    priceMain: 530, priceFrom: null,
    priceNote: '150+ invitados', priceNote2: null,
    cortesias: 2,
    incluye: [
      'Pantalla gigante LED', 'Grupo versátil en vivo (5 int.)',
      'Descargas de CO₂', 'Cabina profesional para DJ',
      'Mantelería color a elegir', 'Chilaquiles de madrugada',
    ],
    hereda: 'Premium',
  },
  {
    id: 'esmeralda', name: 'Esmeralda', accent: 'var(--vv-emerald)',
    tag: 'La joya de la corona', tone: 'emerald',
    horas: '8 horas totales', horasDet: '8h evento + 30 min recepción + 30 min desalojo',
    priceMain: 680, priceFrom: null,
    priceNote: '150+ invitados', priceNote2: null,
    cortesias: 'Todas',
    incluye: [
      'Show de robot', 'Grupo versátil 9 integrantes',
      'Cóctel de bienvenida', 'Cabina foto 360 (1 hora)',
      'Cantante durante la cena', 'LED en cada mesa',
      'Cascada de flores en escalera', 'Arco de flores',
      'Inflable o trampolín', 'Cabezones',
      'Video remembranza', 'Máquina de burbujas',
      'Taxi dancer', 'Batucada con globos',
    ],
    hereda: 'Diamante',
  },
];

/* ---------- INFO DETALLADA POR ELEMENTO DEL PAQUETE ----------
   Se muestra al dar clic a cada elemento dentro de un paquete.
   go  = id de paso del recorrido al que se puede saltar
   cort = id de cortesía (para reusar su galería de fotos) */
VV.ITEM_INFO = {
  'Cena formal de 3 tiempos':       { icon: 'plate',  d: 'Entrada, plato fuerte y postre servidos a la mesa por meseros con capitán. No es buffet: es una cena de gala. El menú es personalizable y adaptamos platillos especiales (veganos, alergias) sin costo extra.', go: 'menu', fotos: ['assets/menu-carne-v2.jpg', 'assets/menu-pasta-v2.jpg', 'assets/menu-crema-v2.jpg'] },
  'Refresco y hielo ilimitado':     { icon: 'drink',  d: 'Refresco de las marcas principales y hielo sin límite durante todo tu evento. Nadie se queda con el vaso vacío.', fotos: ['assets/mesero-refresco.jpg'] },
  'Descorche libre':                { icon: 'drink',  d: 'Trae tu propio licor sin pagar descorche. Tú decides qué se sirve en tu fiesta y te ahorras ese costo extra que otros salones cobran.', fotos: ['assets/descorche-vino.jpg'] },
  'Botella de 3/4 por mesa':        { icon: 'drink',  d: 'Incluimos una botella de 3/4 de litro por cada mesa para que tus invitados arranquen la celebración.' },
  'Mesas redondas + sillas Tiffany':{ icon: 'sparkle',d: 'Mesas redondas vestidas y elegantes sillas Tiffany con cojín para todos tus invitados. El montaje clásico que se ve espectacular en fotos.', go: 'manteleria', fotos: ['assets/mesa-tiffany-rosa.jpg'] },
  'Meseros con capitán':            { icon: 'users',  d: 'Equipo de meseros profesionales coordinados por un capitán que supervisa el servicio toda la noche para que todo fluya perfecto.', fotos: ['assets/meseros-capitan.jpg'] },
  'DJ + Maestro de Ceremonias':     { icon: 'mic',    d: 'DJ profesional con audio de calidad y un maestro de ceremonias que conduce los momentos clave: entrada, vals, brindis y más.', fotos: ['assets/dj-maestro.jpg'] },
  'Iluminación inteligente':        { icon: 'sparkle',d: 'Sistema de luces robóticas que cambian de color y ritmo según el momento de la fiesta, del vals romántico al reventón.', fotos: ['assets/iluminacion-inteligente.jpg'], poster: true },
  'Batucada con globos':            { icon: 'bubble', d: 'Show de batucada con tambores y globos que prende la pista y marca el inicio de la fiesta. Energía pura para tus invitados.', fotos: ['assets/batucada-baile.jpg'] },
  '2 camerinos privados':           { icon: 'users',  d: 'Dos camerinos independientes para que la quinceañera/novios y los chambelanes se arreglen con privacidad y comodidad.' },
  'Invitación digital animada':     { icon: 'film',   d: 'Invitación digital animada de regalo, con cuenta regresiva, itinerario, ubicación y confirmación por WhatsApp. Moderna y sin costo de imprenta. Desliza para ver todos sus módulos.', invitacion: true },

  'Pantalla gigante LED':           { icon: 'film',   d: 'Pantalla LED de gran formato para proyectar el video remembranza, mensajes y visuales en vivo. Se ve increíble desde cualquier mesa.', fotos: ['assets/pantalla-led.jpg'] },
  'Grupo versátil en vivo (5 int.)':{ icon: 'mic',    d: 'Grupo musical versátil de 5 integrantes tocando en vivo los géneros que más le gustan a tu gente. Alterna con el DJ para no parar la fiesta.' },
  'Descargas de CO₂':               { icon: 'co2',    d: 'Cañones de CO₂ que lanzan chorros de humo frío en los momentos más intensos. Efecto de antro y fotos espectaculares (sin pirotecnia).', fotos: ['assets/robot-co2-batucada.jpg'] },
  'Cabina profesional para DJ':     { icon: 'mic',    d: 'Cabina profesional iluminada para el DJ, que eleva la imagen del escenario y la experiencia de sonido.' },
  'Mantelería color a elegir':      { icon: 'sparkle',d: 'Elige el color de mantelería que combine con tu tema. Mira cómo cambia por completo el ambiente de tu mesa.', go: 'manteleria' },
  'Chilaquiles de madrugada':       { icon: 'soup',   d: 'La torna fiesta: chilaquiles calientitos a la madrugada para revivir a todos y cerrar la noche con broche de oro.' },

  'Show de robot':                  { icon: 'robot',  d: 'Robot LED gigante que baila e interactúa con los invitados. Uno de los momentos más fotografiados y compartidos de la noche (sin pirotecnia).', go: 'cortesias', cort: 'robot' },
  'Grupo versátil 9 integrantes':   { icon: 'mic',    d: 'Grupo versátil completo de 9 integrantes con sección de vientos. Sonido de gran evento que llena la pista toda la noche.', fotos: ['assets/trooncosis-grupo.jpg'], poster: true },
  'Cóctel de bienvenida':           { icon: 'drink',  d: 'Coctelería de bienvenida para recibir a tus invitados: 4 vitroleros de 10 L + 100 micheladas para 100 personas.', fotos: ['assets/coctel-bienvenida.jpg'] },
  'Cabina foto 360 (1 hora)':       { icon: 'camera', d: 'Cabina 360° por una hora: tus invitados se graban en video giratorio y se lo llevan al instante. Siempre es el éxito de la fiesta.' },
  'Cantante durante la cena':       { icon: 'mic',    d: 'Voz en vivo amenizando la cena con un ambiente elegante e íntimo mientras tus invitados disfrutan los tres tiempos.', go: 'cortesias', cort: 'cantante', video: 'assets/cantante-cena.mp4', fotos: ['assets/cantante-real.jpg', 'assets/mariachi-cena.jpg'] },
  'LED en cada mesa':               { icon: 'sparkle',d: 'Iluminación LED de color en cada mesa que hace brillar el salón y crea una atmósfera mágica de noche.', go: 'cortesias', cort: 'ledmesas' },
  'Cascada de flores en escalera':  { icon: 'flower', d: 'Una cascada de flores decorando la escalera de entrada: el marco perfecto para la entrada del festejado y las fotos.', go: 'cortesias', cort: 'cascada', fotos: ['assets/cascada/01.jpg', 'assets/cascada/02.jpg', 'assets/cascada/03.jpg', 'assets/cascada/04.jpg'] },
  'Arco de flores':                 { icon: 'arch',   d: 'Arco floral para la entrada o el área de fotos. Un punto focal hermoso que tus invitados no dejarán de fotografiar.', go: 'cortesias', cort: 'arco' },
  'Inflable o trampolín':           { icon: 'jump',   d: 'Inflable o trampolín en el jardín para que los más jóvenes se diviertan sin parar mientras los adultos disfrutan.', go: 'cortesias', cort: 'inflable' },
  'Cabezones':                      { icon: 'mask',   d: 'Cabezones bailarines: personajes gigantes que salen a la pista y arman la fiesta con los niños y los grandes.', go: 'cortesias', cort: 'cabezones' },
  'Video remembranza':              { icon: 'film',   d: 'Video con los recuerdos del festejado proyectado en la pantalla gigante. Un momento emotivo garantizado.', go: 'cortesias', cort: 'video' },
  'Máquina de burbujas':            { icon: 'bubble', d: 'Máquina de burbujas que llena el aire durante el vals y crea un ambiente de ensueño para las fotos.', go: 'cortesias', cort: 'burbujas', fotos: ['assets/burbujas-real.jpg', 'assets/burbujas-baile.jpg'] },
  'Taxi dancer':                    { icon: 'dance',  d: 'Bailarines profesionales que se mezclan con los invitados y mantienen la pista llena toda la noche.', go: 'cortesias', cort: 'taxi' },
};

/* ---------- COMPARATIVO DE PAQUETES ----------
   Valores por paquete: true = incluido (✓), false = no incluido (—), string = detalle */
VV.COMPARA = [
  { t: 'Duración del evento',          premium: '6 h',  diamante: '7 h',  esmeralda: '8 h' },
  { t: 'Precio por persona (desde)',   premium: '$420', diamante: '$530', esmeralda: '$680' },
  { t: 'Cortesías incluidas',          premium: '1',    diamante: '2',    esmeralda: 'Todas' },
  { t: 'Cena de gala de 3 tiempos',    premium: true,   diamante: true,   esmeralda: true },
  { t: 'DJ + Maestro de Ceremonias',   premium: true,   diamante: true,   esmeralda: true },
  { t: '2 camerinos privados',         premium: true,   diamante: true,   esmeralda: true },
  { t: 'Mantelería a color',           premium: false,  diamante: true,   esmeralda: true },
  { t: 'Pantalla LED gigante',         premium: false,  diamante: true,   esmeralda: true },
  { t: 'Música versátil en vivo',      premium: false,  diamante: '5 int.', esmeralda: '9 int.' },
  { t: 'Descargas de CO₂',             premium: false,  diamante: true,   esmeralda: true },
  { t: 'Chilaquiles de madrugada',     premium: false,  diamante: true,   esmeralda: true },
  { t: 'Cabina foto 360°',             premium: false,  diamante: false,  esmeralda: true },
  { t: 'Show de robot',                premium: false,  diamante: false,  esmeralda: true },
  { t: 'Cantante durante la cena',     premium: false,  diamante: false,  esmeralda: true },
];

/* ---------- MENÚ DE BANQUETE (real) ---------- */
VV.MENU = {
  nota: 'Cena formal de 3 tiempos · Cocina de primera · personalizable con el cliente · Porciones: carne 140 g · crema 160 ml · ensalada 160 g · Las verduras se sirven según la temporada del año',
  cats: [
    { t: 'Entradas',     icon: 'drink', ops: ['Coctel de frutas', 'Volovanes', 'Ensaladas', 'Melón'] },
    { t: 'Cremas',       icon: 'soup',  ops: ['Elote', 'Nuez', 'Champiñones', 'Chile poblano'] },
    { t: 'Pasta',        icon: 'plate', ops: ['Espagueti italiana', 'Boloñesa', 'Hawaiana', 'Poblana'] },
    { t: 'Pollo',        icon: 'plate', ops: ['Almendrado', 'A la naranja', 'Adobado', 'Cordon Bleu'] },
    { t: 'Cerdo',        icon: 'plate', ops: ['Lomo enchilado', 'Envinado', 'A los tres chiles'] },
    { t: 'Guarniciones', icon: 'leaf',  ops: ['Puré de papa', 'Ensalada de manzana', 'Papas a la mantequilla'] },
  ],
  madrugada: ['Torna fiesta de chilaquiles', 'Café de olla'],
  bebidas: ['Refresco y hielo ilimitado', 'Descorche libre', 'Botella de 3/4 por mesa'],
};

/* ---------- CORTESÍAS A ELEGIR (reales, 12) ---------- */
VV.CORTESIAS = [
  { id: 'inflable', name: 'Inflable / trampolín', desc: 'En el jardín, diversión para los jóvenes.', icon: 'jump',   wow: 3,
    gallery: [
      'assets/inflables/03-promo.jpg','assets/inflables/04-promo.jpg',
      'assets/inflables/06-promo.jpg',
    ] },
  { id: 'ledmesas', name: 'Iluminación LED en mesas', desc: 'Cada mesa con luz de color.',          icon: 'sparkle',wow: 4,
    gallery: ['assets/mesas-led-rosa.jpg', 'assets/mesas-led-azul.jpg'] },
  { id: 'cantante', name: 'Cantante durante la cena', desc: 'Voz en vivo mientras cenan.',          icon: 'mic',    wow: 4,
    video: 'assets/cantante-cena.mp4',
    gallery: ['assets/cantante-real.jpg', 'assets/mariachi-cena.jpg'] },
  { id: 'video',    name: 'Video remembranza',     desc: 'Recuerdos en pantalla gigante.',          icon: 'film',   wow: 3 },
  { id: 'cascada',  name: 'Cascada de flores',      desc: 'Flores en la escalera de entrada.',       icon: 'flower', wow: 4,
    gallery: ['assets/cascada/01.jpg', 'assets/cascada/02.jpg', 'assets/cascada/03.jpg', 'assets/cascada/04.jpg'] },
  { id: 'taxi',     name: 'Servicio de taxi dancer',desc: 'Bailarines que llenan la pista.',         icon: 'dance',  wow: 3,
    gallery: ['assets/taxi-dancer.jpg'] },
  { id: 'chilaquiles', name: 'Torna fiesta de chilaquiles', desc: 'El antojo perfecto de madrugada.',icon: 'soup',   wow: 4,
    gallery: ['assets/chilaquiles.jpg'] },
  { id: 'arco',     name: 'Arco de flores',         desc: 'Marco floral para fotos y entrada.',      icon: 'arch',   wow: 3 },
  { id: 'cabezones',name: 'Cabezones bailarines',   desc: 'Personajes gigantes para la fiesta.',     icon: 'mask',   wow: 2,
    gallery: ['assets/cabezones.jpg'] },
  { id: 'burbujas', name: 'Máquina de burbujas',    desc: 'Ambiente de ensueño en el vals.',         icon: 'bubble', wow: 3,
    gallery: ['assets/burbujas-real.jpg', 'assets/burbujas-baile.jpg'] },
  { id: 'robot',    name: 'Robot show',             desc: 'Robot LED que baila (sin pirotecnia).',   icon: 'robot',  wow: 5,
    gallery: ['assets/robot-show.jpg'] },
  { id: 'letras',   name: 'Letras iluminadas',      desc: 'El nombre del festejado en luces.',       icon: 'badge',  wow: 4,
    gallery: [
      'assets/letras/03.jpg',
      'assets/letras/04.jpg','assets/letras/05.jpg','assets/letras/06.jpg',
      'assets/letras/11.jpg','assets/letras/12.jpg',
      'assets/letras/13.jpg','assets/letras/14.jpg','assets/letras/15.jpg',
      'assets/letras/16.jpg','assets/letras/17.jpg','assets/letras/18.jpg',
      'assets/letras/19.jpg',
    ] },
  { id: 'ceremonia', name: 'Ceremonia religiosa',   desc: 'Altar montado dentro del salón.',         icon: 'arch',   wow: 4,
    gallery: ['assets/ceremonia-religiosa.jpg'] },
];

/* ---------- TEMÁTICAS QUE HEMOS AMBIENTADO (galería por temática) ----------
   Cada temática abre el visor GaleriaLightbox con SUS fotos y videos.
   La primera foto de `gallery` se usa como portada de la tarjeta.
   Una temática con `gallery` vacío se muestra en gris ("Próximamente").

   Para agregar o rellenar una temática:
   1) Crea la carpeta  assets/tematicas/<id>/  y mete ahí sus fotos/videos.
   2) Lista las rutas en `gallery` (y `video` opcional).
   Basta sobrescribir los archivos con los mismos nombres para cambiar las fotos
   —sin tocar este archivo. Ver assets/tematicas/LEEME.txt. */
VV.TEMATICAS = [
  { id: 'alicia', name: 'Alicia en el País de las Maravillas',
    // Video de EJEMPLO (reutiliza un video existente para que veas fotos+video ya funcionando).
    // Cuando tengas el video real de esta temática, ponlo en assets/tematicas/alicia/video.mp4
    // y cambia esta ruta por 'assets/tematicas/alicia/video.mp4'.
    video: 'assets/cantante-cena.mp4',
    // Fotos de RELLENO — reemplázalas por las reales (mismos nombres 01..04.jpg).
    gallery: [
      'assets/tematicas/alicia/01.jpg',
      'assets/tematicas/alicia/02.jpg',
      'assets/tematicas/alicia/03.jpg',
      'assets/tematicas/alicia/04.jpg',
    ] },

  // Ejemplos vacíos: se ven en gris "Próximamente" hasta que tengan fotos.
  // Renómbralos con tus temáticas reales y llénales la carpeta + gallery.
  { id: 'glow',   name: 'Glow / Neón',      gallery: [] },
  { id: 'jardin', name: 'Jardín Encantado', gallery: [] },
];

/* ---------- COMPLEMENTA TU EVENTO ---------- */
VV.COMPLEMENTOS = ['Pista LED', 'Pantalla LED gigante', 'Video remembranza', '1 hora extra', 'Cabezones', 'Burbujas', 'Ceremonia', 'Cabina foto 360°', 'Letras gigantes', 'Torna fiesta'];
VV.MUSICA = ['Mariachi', 'Banda', 'Grupo 5 o 9 integrantes', 'Trío', 'Norteño', 'Cantante'];
VV.COCTEL = '100 personas — 4 vitroleros de 10 L + 100 micheladas';

/* ---------- ¿POR QUÉ ELEGIRNOS? ---------- */
VV.PORQUE = [
  { t: 'Fachada icónica',        s: 'Hacienda perfecta para fotos',     icon: 'sparkle' },
  { t: '2 camerinos privados',   s: 'Para quinceañera y chambelanes',    icon: 'users' },
  { t: 'Invitación digital gratis', s: 'Con cuenta regresiva y WhatsApp', icon: 'film' },
  { t: 'Jardines con fuente',    s: 'Espacios hermosos para recepción',  icon: 'leaf' },
  { t: 'Cortesías únicas',       s: 'Solo en Villaverde',                icon: 'diamond' },
  { t: 'Sin sorpresas de precio',s: 'Todo incluido desde el inicio',     icon: 'shield' },
];

/* ---------- CONTACTO ---------- */
VV.CONTACTO = {
  lugar: 'Chalco, Estado de México',
  whats: '55 1734 0226',
  whatsIntl: '525517340226',   // formato internacional para links wa.me
  web: 'salondefiestasvillaverde.com',
  instagram: '@salon.villaverde',
  horario: 'Visitas: Lun–Sáb · 10am–12pm y 3pm–6pm',
  anticipo: 3000,
};

/* ---------- FECHAS APARTADAS (fuente: tabla eventus_events del CRM = pestaña Calendario del dashboard) ----------
   El calendario de Disponibilidad marca estas fechas como "Apartada" (no seleccionables).
   Son los eventos realmente contratados/agendados (cualquier salón cuenta como ocupado),
   deduplicados por fecha. NO se muestra el salón al cliente, solo la fecha y el tipo.
   Re-sincronizar (snapshot) con la query a Supabase:
     GET /rest/v1/eventus_events?date=gte.<HOY>&select=date,type&order=date.asc
   deduplicar por date y mapear type (xv→'XV Años', graduacion→'Graduación', boda→'Boda').
   Última sync: 26-jun-2026. */
VV.OCUPADAS = [
  { date: '2026-07-04', tipo: 'XV Años' },
  { date: '2026-08-01', tipo: 'Graduación' },
  { date: '2026-08-08', tipo: 'XV Años' },
  { date: '2026-08-15', tipo: 'XV Años' },
  { date: '2026-08-22', tipo: 'XV Años' },
  { date: '2026-09-19', tipo: 'XV Años' },
  { date: '2026-10-10', tipo: 'XV Años' },
  { date: '2026-10-17', tipo: 'XV Años' },
  { date: '2026-10-24', tipo: 'XV Años' },
  { date: '2026-11-07', tipo: 'XV Años' },
  { date: '2026-11-14', tipo: 'XV Años' },
  { date: '2026-11-21', tipo: 'XV Años' },
  { date: '2026-11-28', tipo: 'XV Años' },
  { date: '2026-12-19', tipo: 'XV Años' },
  { date: '2026-12-26', tipo: 'XV Años' },
  { date: '2027-01-16', tipo: 'XV Años' },
  { date: '2027-01-23', tipo: 'XV Años' },
  { date: '2027-01-30', tipo: 'XV Años' },
  { date: '2027-02-20', tipo: 'XV Años' },
  { date: '2027-03-13', tipo: 'XV Años' },
  { date: '2027-04-03', tipo: 'XV Años' },
  { date: '2027-04-10', tipo: 'XV Años' },
  { date: '2027-05-08', tipo: 'XV Años' },
  { date: '2027-08-28', tipo: 'XV Años' },
  { date: '2027-09-11', tipo: 'XV Años' },
  { date: '2027-10-23', tipo: 'Boda' },
  { date: '2027-12-04', tipo: 'XV Años' },
];

/* ---------- TESTIMONIOS (ejemplo) ---------- */
VV.TESTIMONIOS = [
  { name: 'Familia Hernández', event: 'XV de Valentina', stars: 5, text: 'El salón se veía de revista. La cabina 360 fue el éxito de la noche y el servicio impecable. ¡Sin un solo costo escondido!' },
  { name: 'Mariana & Diego', event: 'Boda', stars: 5, text: 'Buscábamos elegancia y Villaverde la superó. La mantelería en azul rey quedó exactamente como la vimos en la cotización.' },
  { name: 'Familia Robles', event: 'XV de Sofía', stars: 5, text: 'Lo mejor fue la tranquilidad: todo incluido, todo cumplido. Los chilaquiles de madrugada cerraron la fiesta perfecta.' },
];

VV.STATS = [
  { n: '+12', l: 'años de experiencia' },
  { n: '+800', l: 'eventos celebrados' },
  { n: '45', l: 'autos de estacionamiento' },
  { n: '100%', l: 'sin costos ocultos' },
];

/* ---------- GUIÓN DEL ASESOR (por paso) ---------- */
VV.GUION = {
  bienvenida: {
    obj: 'Crear conexión emocional y entender el sueño del cliente antes de hablar de precios.',
    say: '«Cuéntame, ¿de quién es la fiesta y cómo se la imaginan? Aquí en Villaverde nos encargamos de TODO para que ustedes solo disfruten.»',
    tips: ['Pregunta nombre del festejado/a y úsalo toda la presentación.', 'Anota la fecha tentativa y número aproximado de invitados.', 'Refuerza el lema: “tu evento soñado, sin costos ocultos”.', 'Aún NO menciones precios.'],
    obj_handling: [
      { q: '“Solo estoy cotizando.”', a: 'Perfecto, justo para eso es esta presentación. Déjame mostrarte todo y tú decides con calma.' },
    ],
  },
  salon: {
    obj: 'Provocar el “wow” visual. Que se imaginen su evento aquí.',
    say: '«Mira el techo entelado y los candiles… esta es la pista de espejo donde van a entrar. Imagínate la entrada del festejado justo aquí.»',
    tips: ['Reproduce el video a pantalla completa.', 'Señala detalles: candiles, pista de espejo, jardín para fotos.', 'Menciona los 45 cajones de estacionamiento y la seguridad.'],
    obj_handling: [
      { q: '“¿Puedo visitarlo en persona?”', a: '¡Claro! Agenda una visita; te recomiendo verlo montado un fin de semana de evento.' },
    ],
  },
  manteleria: {
    obj: 'Generar pertenencia: que “diseñen” su evento eligiendo color.',
    say: '«Elige el color que va con tu tema… ¿ves cómo cambia por completo el ambiente? Así se va a ver TU mesa.»',
    tips: ['Deja que el cliente toque y elija el color.', 'Combina con el color del vestido o tema del evento.', 'La mantelería a color viene incluida desde el paquete Diamante.'],
    obj_handling: [
      { q: '“¿Tienen mi color exacto?”', a: 'Manejamos esta gama y podemos cotizar tonos especiales. Dime tu color y lo revisamos.' },
    ],
  },
  menu: {
    obj: 'Vender la experiencia gastronómica: cena de gala, no “comida de salón”.',
    say: '«Es una cena formal de 3 tiempos servida a la mesa, con capitán de meseros. Y a la madrugada… chilaquiles para revivir a todos.»',
    tips: ['Resalta “servido a la mesa”, no buffet.', 'Menciona refresco y hielo ilimitado + descorche libre.', 'El menú es personalizable; ofrece degustación.'],
    obj_handling: [
      { q: '“¿Y si tengo invitados veganos?”', a: 'Adaptamos platillos sin costo extra. Lo dejamos anotado en tu contrato.' },
    ],
  },
  cortesias: {
    obj: 'Mostrar el factor diferenciador y justificar subir de paquete.',
    say: '«Estas son las cortesías que hacen inolvidable la noche. El robot y la cabina 360 son siempre los favoritos.»',
    tips: ['Deja que elija sus cortesías favoritas (se guardan).', 'Premium incluye 1, Diamante 2, Esmeralda TODAS.', 'Refuerza el valor para justificar subir a Diamante o Esmeralda.'],
    obj_handling: [
      { q: '“Quiero varias cortesías.”', a: 'Entonces el paquete Esmeralda te conviene: las incluye todas y sale más a cuenta que contratarlas aparte.' },
    ],
  },
  paquetes: {
    obj: 'Presentar de mayor a menor, anclar en Esmeralda y recomendar Diamante.',
    say: '«Tenemos tres paquetes todo incluido. El Esmeralda es la joya de la corona; pero el más elegido para XV es el Diamante por todo lo que trae.»',
    tips: ['Presenta primero el Esmeralda (ancla de precio alto).', 'Luego posiciona Diamante como “el inteligente”.', 'Recalca: sin costos ocultos, todo incluido.', 'Usa el cotizador para mostrar el número final.'],
    obj_handling: [
      { q: '“Está fuera de mi presupuesto.”', a: 'Veamos el Premium y ajustemos invitados. Recuerda que NO hay costos extra después.' },
    ],
  },
  cotizador: {
    obj: 'Construir el número JUNTO al cliente para que sea “suyo”.',
    say: '«Vamos a armar tu números. ¿Cuántos invitados calculas? …Mira, esto incluye absolutamente todo lo que ya vimos.»',
    tips: ['Mueve el número de invitados con el cliente viendo.', 'Muestra el precio por persona vs. el total con todo incluido.', 'Compara: contratar por separado costaría mucho más.'],
    obj_handling: [
      { q: '“¿Hay descuento?”', a: 'Apartando hoy te garantizo el precio 2026 y tu fecha. Después sube por temporada.' },
    ],
  },
  testimonios: {
    obj: 'Reducir el riesgo percibido con prueba social.',
    say: '«No solo es lo que yo te digo… mira lo que dicen las familias que ya celebraron aquí.»',
    tips: ['Menciona +800 eventos y +12 años.', 'Refuerza “sin costos ocultos” con testimonios reales.'],
    obj_handling: [
      { q: '“Necesito pensarlo.”', a: 'Claro. Mientras lo piensan, ¿checamos si tu fecha sigue disponible?' },
    ],
  },
  fechas: {
    obj: 'Crear urgencia legítima: las buenas fechas se agotan.',
    say: '«Estas son las fechas que me quedan. Las de temporada alta vuelan… ¿cuál te late?»',
    tips: ['Muestra el calendario; señala fechas “pocas disponibles”.', 'La urgencia es real: temporada de XV y bodas se llena.', 'Conduce hacia el anticipo de $3,000.'],
    obj_handling: [
      { q: '“Aún no tengo la fecha exacta.”', a: 'Aparta la tentativa con $3,000; es reembolsable/movible según política. Mejor asegurarla.' },
    ],
  },
  cierre: {
    obj: 'Cerrar: apartar la fecha con $3,000 de anticipo.',
    say: '«Con solo $3,000 apartas tu fecha y congelas el precio. ¿Te ayudo a dejarla apartada hoy mismo?»',
    tips: ['Pide la decisión de forma directa y cálida.', 'Resume todo lo que se llevan por su inversión.', 'Ten lista la forma de pago y el contrato.'],
    obj_handling: [
      { q: '“Lo consulto y te aviso.”', a: 'Perfecto. Te aparto la fecha 48h sin compromiso para que la platiquen con calma.' },
    ],
  },
};

/* ---------- HELPERS DE PRECIO Y ESTADO (fuente única de verdad) ---------- */
VV.priceFor = function (pkgId, guests) {
  if (pkgId === 'premium') return guests < 150 ? 470 : 420;
  if (pkgId === 'diamante') return 530;
  return 680;
};

// Llaves de datos del cliente (se borran al iniciar una cotización nueva).
// NO incluye config del asesor (tweaks de color/tipografía/guión).
VV.CLIENT_KEYS = ['vv_step', 'vv_pkgview', 'vv_pkg', 'vv_guests', 'vv_cliente',
  'vv_evento', 'vv_fecha', 'vv_mantel', 'vv_menu', 'vv_fav', 'vv_salon'];

// Notifica a la barra de resumen del topbar que cambió una selección.
VV.notifyStore = function () { try { window.dispatchEvent(new Event('vv-store')); } catch (e) {} };
