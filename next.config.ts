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
    ];
  },
};

export default nextConfig;
