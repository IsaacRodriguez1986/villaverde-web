import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/rsvp/", "/agentes/"],
    },
    sitemap: "https://www.salondefiestasvillaverde.com/sitemap.xml",
  };
}
