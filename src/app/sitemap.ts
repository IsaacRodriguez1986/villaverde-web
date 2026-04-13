import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.salondefiestasvillaverde.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      images: [
        "https://lh3.googleusercontent.com/d/1wy5kl8jPaljjALel4SMNn3LwDfiNOLBA",
        "https://lh3.googleusercontent.com/d/1ULTFHFO50ZyblmQpaEcgfHUSWhaM-Oy3",
        "https://lh3.googleusercontent.com/d/1BLlyoHkWGhy6I0Hp7ZzG2EVe6yEVHm9B",
        "https://lh3.googleusercontent.com/d/1qE0i254xALH01pZuRA4-41pnoKATtwMC",
        "https://lh3.googleusercontent.com/d/13Rdtbkgu1ZGpHdiu9t0KS6lG3OjBN0e_",
        "https://lh3.googleusercontent.com/d/1JH9OgRsPQf0k70Be-2qP1n8BXwT50lKR",
        "https://lh3.googleusercontent.com/d/13fdfyk_4KgzeFUbmc02tqNMOewdHiIO1",
        "https://lh3.googleusercontent.com/d/1gPY-XRFHFsPyvlnDg2NSYlPP6-ubOuqb",
        "https://lh3.googleusercontent.com/d/1BAzHGdTpbbc2Gk8Z6wKrtp421A1ZbR59",
      ],
    },
  ];
}
