import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
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
        source: "/mis-xv-dayana",
        destination: "/mis-xv-dayana/index.html",
      },
    ];
  },
  async headers() {
    return [
      {
        // Invitaciones de clientes: llevan nombre, dirección y teléfono.
        // Se permite el rastreo (para que el crawler LEA el noindex y para que
        // funcione el preview de WhatsApp) pero se bloquea el indexado.
        // no-referrer evita filtrar la URL a Google al tocar "Ver ubicación".
        source: "/mis-xv-dayana/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet, noimageindex",
          },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
      {
        source: "/mis-xv-dayana",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet, noimageindex",
          },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
};

export default nextConfig;
