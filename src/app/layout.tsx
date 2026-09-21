import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import MetaPixelConsent from "./MetaPixelConsent";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display-loaded",
  display: "swap",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.salondefiestasvillaverde.com"),
  title: "Salón de Fiestas en Chalco | Villaverde",
  description: "Paquetes todo incluido desde $420 por persona para bodas, XV años y graduaciones en Chalco. Agenda una visita y consulta disponibilidad.",
  keywords: "salon de fiestas chalco, salon para xv años chalco, salon para bodas chalco, salon villaverde, fiestas chalco, eventos chalco, salon de fiestas estado de mexico, xv años chalco, bodas chalco, graduaciones chalco, salon todo incluido chalco",
  alternates: {
    canonical: "https://www.salondefiestasvillaverde.com",
  },
  // Rutas fijas en public/ y no la convencion src/app/icon.png: Google pide
  // que la URL del favicon sea estable, y esa convencion le cuelga un hash
  // que cambia en cada build. Sin estos archivos Google dibuja el globo gris.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Salón de Fiestas Villaverde — Desde $420/persona todo incluido",
    description: "Paquetes todo incluido para bodas, XV años y graduaciones en Chalco. Consulta disponibilidad y agenda una visita.",
    url: "https://www.salondefiestasvillaverde.com",
    siteName: "Salón de Fiestas Villaverde",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "https://gfbixkddumsqlfrfbsmp.supabase.co/storage/v1/object/public/landing/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Salón de Fiestas Villaverde en Chalco - Bodas XV Años Graduaciones",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Salón de Fiestas Villaverde — Desde $420/persona",
    description: "Paquetes todo incluido para Bodas, XV Años y Graduaciones en Chalco, Estado de México.",
    images: ["https://gfbixkddumsqlfrfbsmp.supabase.co/storage/v1/object/public/landing/og-cover.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["EventVenue", "LocalBusiness"],
              name: "Salón de Fiestas Villaverde",
              description:
                "Salón de fiestas en Chalco con paquetes todo incluido para Bodas, XV Años y Graduaciones. Descorche libre, cortesías exclusivas y más de 10 años de experiencia.",
              url: "https://www.salondefiestasvillaverde.com",
              telephone: "+529995485862",
              image:
                "https://gfbixkddumsqlfrfbsmp.supabase.co/storage/v1/object/public/landing/og-cover.jpg",
              logo: "https://www.salondefiestasvillaverde.com/logo-villaverde.png",
              address: {
                "@type": "PostalAddress",
                streetAddress:
                  "Carretera México-Cuautla, Km. 35.5, Col. Santa Cruz Amalinalco",
                addressLocality: "Chalco",
                addressRegion: "Estado de México",
                addressCountry: "MX",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 19.2834655,
                longitude: -98.8805715,
              },
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Paquetes Todo Incluido",
                itemListElement: [
                  {
                    "@type": "Offer",
                    name: "Paquete Premium — 6 horas de evento",
                    description: "Paquete todo incluido con cena formal de 3 tiempos, descorche libre, DJ, iluminación inteligente, batucada, camerinos, invitación digital y 1 cortesía a elegir. 6 horas de evento.",
                    priceSpecification: {
                      "@type": "PriceSpecification",
                      minPrice: "420",
                      maxPrice: "470",
                      priceCurrency: "MXN",
                      unitText: "por persona",
                    },
                    eligibleQuantity: {
                      "@type": "QuantitativeValue",
                      minValue: 100,
                      maxValue: 450,
                      unitText: "invitados",
                    },
                  },
                  {
                    "@type": "Offer",
                    name: "Paquete Diamante — 7 horas de evento (Más Popular)",
                    description: "El paquete más elegido. Todo lo del Premium más grupo versátil en vivo, pantalla LED gigante, chilaquiles y 2 cortesías a elegir. Disponible desde 150 invitados. 7 horas de evento.",
                    priceSpecification: {
                      "@type": "PriceSpecification",
                      minPrice: "530",
                      maxPrice: "530",
                      priceCurrency: "MXN",
                      unitText: "por persona",
                    },
                    eligibleQuantity: {
                      "@type": "QuantitativeValue",
                      minValue: 150,
                      maxValue: 450,
                      unitText: "invitados",
                    },
                  },
                  {
                    "@type": "Offer",
                    name: "Paquete Esmeralda — 8 horas de evento (El Más Completo)",
                    description: "El paquete máximo con TODO incluido: grupo en vivo, pantalla LED, show de robot, cabina 360, cantante en cena y TODAS las cortesías. Disponible desde 150 invitados. 8 horas de evento.",
                    priceSpecification: {
                      "@type": "PriceSpecification",
                      minPrice: "680",
                      maxPrice: "680",
                      priceCurrency: "MXN",
                      unitText: "por persona",
                    },
                    eligibleQuantity: {
                      "@type": "QuantitativeValue",
                      minValue: 150,
                      maxValue: 450,
                      unitText: "invitados",
                    },
                  },
                ],
              },
              priceRange: "$420 - $680 MXN por persona",
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ],
                opens: "09:00",
                closes: "21:00",
              },
              sameAs: [
                "https://www.instagram.com/salon.villaverde/",
                "https://www.facebook.com/SalonVillaVerde/",
              ],
              maximumAttendeeCapacity: 450,
              amenityFeature: [
                { "@type": "LocationFeatureSpecification", name: "Estacionamiento", value: true },
                { "@type": "LocationFeatureSpecification", name: "Jardines con fuente", value: true },
                { "@type": "LocationFeatureSpecification", name: "Camerinos privados", value: true },
                { "@type": "LocationFeatureSpecification", name: "Descorche libre", value: true },
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "¿Cuánto cuesta un salón de fiestas en Chalco?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "En Salón de Fiestas Villaverde los paquetes todo incluido van desde $420 por persona (Paquete Premium con 150+ invitados) hasta $680 por persona (Paquete Esmeralda). Todos incluyen cena formal de 3 tiempos, descorche libre, DJ, iluminación inteligente, meseros y más. Sin costos ocultos.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿Qué incluye un paquete todo incluido para XV años?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Nuestros paquetes para XV años incluyen: salón con capacidad de 100 a 450 invitados, cena formal de 3 tiempos, refresco ilimitado, descorche libre (trae tus bebidas sin cargo), DJ y Maestro de Ceremonias, iluminación tipo antro, batucada con globos, 2 camerinos privados e invitación digital animada. Los paquetes Diamante y Esmeralda agregan grupo en vivo, pantalla LED gigante y más espectáculos.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿Cuánto es el anticipo para apartar mi fecha?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "La fecha se reserva al firmar el contrato y cubrir el anticipo de $3,000 MXN, sujeto a disponibilidad. La cotización por sí sola no reserva la fecha.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿El salón Villaverde permite descorche libre?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Sí, todos nuestros paquetes (Premium, Diamante y Esmeralda) incluyen descorche libre. Puedes traer tus propias bebidas alcohólicas sin ningún cargo adicional. Además, cada paquete incluye botella ¾ por mesa y refresco con hielo ilimitado durante todo el evento.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿Cuántos invitados caben en el salón?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "El Salón de Fiestas Villaverde tiene capacidad para 100 a 450 invitados. Contamos con mesas redondas, sillas Tiffany y amplios jardines con fuente para la recepción.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿Dónde se encuentra el Salón de Fiestas Villaverde?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Estamos en Carretera México-Cuautla, Km. 35.5, Col. Santa Cruz Amalinalco, Chalco, Estado de México. Puedes agendar una visita sin compromiso para conocer nuestras instalaciones.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿Qué diferencia hay entre los paquetes Premium, Diamante y Esmeralda?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "El Premium ($420/pp) incluye todo lo esencial: cena, descorche libre, DJ y 1 cortesía a elegir con 6 horas de evento. El Diamante ($530/pp, desde 150 invitados) agrega grupo versátil en vivo, pantalla LED, chilaquiles y 2 cortesías con 7 horas de evento. El Esmeralda ($680/pp, desde 150 invitados) incluye show de robot, cabina 360, cantante en cena y todas las cortesías con 8 horas de evento.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿Puedo agendar una visita para conocer el salón?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Por supuesto. Las visitas son con cita previa de lunes a sábado en horarios de 10am a 12pm y de 3pm a 6pm. Puedes agendar por WhatsApp al 9995485862 y te mostraremos las instalaciones completas: salón, jardines, camerinos, cocina y todo lo que incluyen nuestros paquetes. Las fotos no le hacen justicia, te invitamos a conocernos en persona.",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        {children}
        <MetaPixelConsent />
      </body>
    </html>
  );
}
