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
        source: "/informes",
        destination: "/informes/index.html",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/informes/:path*",
        headers: [
          { key: "Cache-Control", value: "no-cache, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
