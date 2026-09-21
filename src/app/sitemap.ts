import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.salondefiestasvillaverde.com",
      lastModified: new Date("2026-09-21T00:00:00-06:00"),
      changeFrequency: "monthly",
      priority: 1,
      images: [
        "https://gfbixkddumsqlfrfbsmp.supabase.co/storage/v1/object/public/landing/fachada.webp",
        "https://gfbixkddumsqlfrfbsmp.supabase.co/storage/v1/object/public/landing/interior.webp",
        "https://gfbixkddumsqlfrfbsmp.supabase.co/storage/v1/object/public/landing/jardines.webp",
        "https://gfbixkddumsqlfrfbsmp.supabase.co/storage/v1/object/public/landing/montaje.webp",
        "https://gfbixkddumsqlfrfbsmp.supabase.co/storage/v1/object/public/landing/boda-decor.webp",
        "https://gfbixkddumsqlfrfbsmp.supabase.co/storage/v1/object/public/landing/panoramica.webp",
        "https://gfbixkddumsqlfrfbsmp.supabase.co/storage/v1/object/public/landing/pista-led.webp",
        "https://gfbixkddumsqlfrfbsmp.supabase.co/storage/v1/object/public/landing/escalera.webp",
      ],
    },
  ];
}
