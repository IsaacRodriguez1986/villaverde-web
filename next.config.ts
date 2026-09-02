import type { NextConfig } from "next";

/** Slugs de invitaciones en public/<slug>/index.html.
 *  Alimenta a la vez el rewrite de URL limpia y las cabeceras de privacidad,
 *  para que no se pueda publicar una invitación sin una de las dos cosas
 *  (a /eldiabloviste se le olvidó el rewrite y su URL limpia nunca funcionó). */
const INVITACIONES = ["mis-xv-dayana", "ana-paula-1", "mis-xv-megan", "nuestra-boda", "boda-luis-isis"];

const CABECERAS_INVITACION = [
  {
    key: "X-Robots-Tag",
    value: "noindex, nofollow, noarchive, nosnippet, noimageindex",
  },
  { key: "Referrer-Policy", value: "no-referrer" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
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
      {
        source: "/informes/:path*",
        headers: [{ key: "Cache-Control", value: "no-cache, must-revalidate" }],
      },
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
