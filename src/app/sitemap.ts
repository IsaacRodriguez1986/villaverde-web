import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.salondefiestasvillaverde.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      images: [
        "https://villaverde-web.vercel.app/fotos/panoramica.jpg",
        "https://villaverde-web.vercel.app/fotos/fachada.jpg",
        "https://villaverde-web.vercel.app/fotos/interior.jpg",
        "https://villaverde-web.vercel.app/fotos/jardines.jpg",
        "https://villaverde-web.vercel.app/fotos/mesas.jpg",
        "https://villaverde-web.vercel.app/fotos/decoracion.jpg",
        "https://villaverde-web.vercel.app/fotos/xv-anos.jpg",
        "https://villaverde-web.vercel.app/fotos/bodas.jpg",
        "https://villaverde-web.vercel.app/fotos/graduaciones.jpg",
      ],
    },
  ];
}
