import type { NextConfig } from "next";

/** Slugs de invitaciones en public/<slug>/index.html.
 *  Alimenta a la vez el rewrite de URL limpia y las cabeceras de privacidad,
 *  para que no se pueda publicar una invitación sin una de las dos cosas
 *  (a /eldiabloviste se le olvidó el rewrite y su URL limpia nunca funcionó). */
const INVITACIONES = [
  "mis-xv-dayana",
  "mis-xv-dayana-garduno",
  "ana-paula-1",
  "mis-xv-megan",
  "nuestra-boda",
  "boda-angel-isis",
  "mis-xv-karla",
  // Eventos ya pasados que se enseñan como muestra dentro de /informes.
  "eldiabloviste",
  "diadelmaestro",
];

/* El comparativo de precios y las fotos de los correos viven en public/brochures/ para
 * que la secuencia pueda enlazarlos sin la llave de servicio de Supabase. Se sirven, pero
 * NO se indexan: la lista de precios no tiene por qué salir en una búsqueda ni quedarse
 * cacheada en Google, donde envejecería mal (los precios se ajustan cada mes). */
const CABECERAS_FOLLETO = [
  {
    key: "X-Robots-Tag",
    value: "noindex, nofollow, noarchive, nosnippet, noimageindex",
  },
];

/* La plataforma de informes es la herramienta del vendedor frente al cliente: es la única
 * superficie que muestra los precios por persona y el salón Gardenia, que no se menciona
 * en ningún canal automático. No está enlazada desde ninguna página, pero eso no la
 * protege: basta con que alguien comparta la URL. Se PERMITE el rastreo (para que el
 * crawler llegue a leer el noindex; un Disallow en robots.txt lo dejaría indexando la URL
 * a ciegas) y se bloquea el indexado. no-referrer evita filtrar la URL al salir a wa.me. */
const CABECERAS_INFORMES = [
  { key: "Cache-Control", value: "no-cache, must-revalidate" },
  {
    key: "X-Robots-Tag",
    value: "noindex, nofollow, noarchive, nosnippet, noimageindex",
  },
  { key: "Referrer-Policy", value: "no-referrer" },
];

const CABECERAS_INVITACION = [
  {
    key: "X-Robots-Tag",
    value: "noindex, nofollow, noarchive, nosnippet, noimageindex",
  },
  { key: "Referrer-Policy", value: "no-referrer" },
];

const CABECERAS_LANDING = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: blob: https://gfbixkddumsqlfrfbsmp.supabase.co https://www.facebook.com",
      "media-src 'self' blob: https://gfbixkddumsqlfrfbsmp.supabase.co",
      "script-src 'self' 'unsafe-inline' https://connect.facebook.net",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "connect-src 'self' https://gfbixkddumsqlfrfbsmp.supabase.co https://www.facebook.com https://graph.facebook.com",
      "frame-src https://www.google.com https://maps.google.com",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const CABECERAS_EVENTUS = [
  { key: "Cache-Control", value: "no-store" },
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet, noimageindex" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const CABECERAS_MEDIA_LANDING = [
  {
    key: "Cache-Control",
    value: "public, max-age=86400, stale-while-revalidate=604800",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gfbixkddumsqlfrfbsmp.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      // 3-sep-2026: la invitacion paso de /boda-luis-isis a /boda-angel-isis
      // (el novio es Angel). Los enlaces personalizados por familia YA estaban
      // repartidos, asi que el slug viejo tiene que seguir resolviendo.
      // Next conserva el query string, que es donde viajan ?para= y ?pases=.
      // 307 y no 308 a proposito: un permanente se queda cacheado en el
      // navegador del invitado y seria dificil de revertir.
      {
        source: "/boda-luis-isis",
        destination: "/boda-angel-isis",
        permanent: false,
      },
      {
        source: "/boda-luis-isis/:path*",
        destination: "/boda-angel-isis/:path*",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/eventus",
        destination: "/eventus.html",
      },
      {
        source: "/invitaciones",
        destination: "/invitaciones.html",
      },
      {
        source: "/informes",
        destination: "/informes/index.html",
      },
      // Invitaciones de clientes: una sola lista arriba genera rewrite y
      // cabeceras. Agregar una nueva es añadir su slug a INVITACIONES.
      ...INVITACIONES.map((slug) => ({
        source: `/${slug}`,
        destination: `/${slug}/index.html`,
      })),
    ];
  },
  async headers() {
    return [
      { source: "/", headers: CABECERAS_LANDING },
      { source: "/eventus", headers: CABECERAS_EVENTUS },
      { source: "/eventus.html", headers: CABECERAS_EVENTUS },
      { source: "/api/eventus", headers: CABECERAS_EVENTUS },
      { source: "/testimonio-xv.mp4", headers: CABECERAS_MEDIA_LANDING },
      { source: "/testimonio-xv-poster.jpg", headers: CABECERAS_MEDIA_LANDING },
      { source: "/vendor/:path*", headers: CABECERAS_MEDIA_LANDING },
      { source: "/informes", headers: CABECERAS_INFORMES },
      { source: "/informes/:path*", headers: CABECERAS_INFORMES },
      { source: "/brochures/:path*", headers: CABECERAS_FOLLETO },
      // Cada invitación lleva nombre, dirección y teléfono de una familia real.
      // Se PERMITE el rastreo (para que el crawler lea el noindex y para que
      // funcione el preview de WhatsApp) pero se bloquea el indexado.
      // no-referrer evita filtrar la URL a Google al tocar "Ver ubicación".
      ...INVITACIONES.flatMap((slug) => [
        { source: `/${slug}`, headers: CABECERAS_INVITACION },
        { source: `/${slug}/:path*`, headers: CABECERAS_INVITACION },
      ]),
    ];
  },
};

export default nextConfig;
