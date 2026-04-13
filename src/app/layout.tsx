import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Salón de Fiestas en Chalco | Bodas, XV Años y Graduaciones — Villaverde",
  description: "Salón de fiestas en Chalco con paquetes todo incluido desde $420 por persona. Descorche libre, cortesías exclusivas y 10+ años de experiencia. Bodas, XV Años, Graduaciones. Aparta tu fecha con solo $3,000.",
  keywords: "salon de fiestas chalco, salon para xv años chalco, salon para bodas chalco, salon villaverde, fiestas chalco, eventos chalco, salon de fiestas estado de mexico, xv años chalco, bodas chalco, graduaciones chalco, salon todo incluido chalco",
  alternates: {
    canonical: "https://www.salondefiestasvillaverde.com",
  },
  openGraph: {
    title: "Salón de Fiestas Villaverde — Desde $420/persona todo incluido",
    description: "Bodas, XV Años y Graduaciones en Chalco. Descorche libre, cortesías exclusivas. Aparta con solo $3,000.",
    url: "https://www.salondefiestasvillaverde.com",
    siteName: "Salón de Fiestas Villaverde",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "https://lh3.googleusercontent.com/d/1wy5kl8jPaljjALel4SMNn3LwDfiNOLBA",
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
    images: ["https://lh3.googleusercontent.com/d/1wy5kl8jPaljjALel4SMNn3LwDfiNOLBA"],
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
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
                "https://lh3.googleusercontent.com/d/1wy5kl8jPaljjALel4SMNn3LwDfiNOLBA",
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
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                reviewCount: "500",
                bestRating: "5",
              },
              review: [
                {
                  "@type": "Review",
                  author: { "@type": "Person", name: "María Guadalupe Hernández" },
                  datePublished: "2025-11-15",
                  reviewBody: "Hicimos los XV años de mi hija aquí y fue un sueño hecho realidad. El paquete Diamante incluye todo: cena deliciosa de 3 tiempos, descorche libre, DJ increíble y la batucada fue lo máximo. Las instalaciones son hermosas, los jardines con fuente perfectos para las fotos. El equipo de Villaverde nos hizo sentir en familia. 100% recomendado.",
                  reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
                },
                {
                  "@type": "Review",
                  author: { "@type": "Person", name: "Carlos y Fernanda Martínez" },
                  datePublished: "2025-09-22",
                  reviewBody: "Celebramos nuestra boda en Villaverde y fue perfecto. El salón estilo hacienda es elegante, la cena estuvo exquisita y el descorche libre nos ahorró muchísimo. Los meseros muy atentos, la iluminación tipo antro transformó el ambiente para el baile. La escalera principal fue ideal para las fotos. Nuestros invitados siguen hablando del evento.",
                  reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
                },
                {
                  "@type": "Review",
                  author: { "@type": "Person", name: "Profesora Leticia Morales" },
                  datePublished: "2026-01-10",
                  reviewBody: "Organizamos la graduación de nuestra generación aquí y salió espectacular. El paquete Premium nos dio todo lo que necesitábamos a un precio muy accesible. La comida de 3 tiempos riquísima, el DJ puso excelente ambiente y el estacionamiento amplio fue un plus enorme para nuestros invitados. Definitivamente regresaremos.",
                  reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
                },
                {
                  "@type": "Review",
                  author: { "@type": "Person", name: "Ana Lucía Ramírez" },
                  datePublished: "2025-08-05",
                  reviewBody: "Los XV de mi sobrina quedaron muy bonitos. El salón es amplio y elegante, la comida estuvo bien y el servicio fue bueno. Lo único es que hubiéramos querido un poquito más de tiempo, pero el paquete Premium de 7 horas estuvo bien para el presupuesto. El descorche libre es una gran ventaja contra otros salones de Chalco.",
                  reviewRating: { "@type": "Rating", ratingValue: "4", bestRating: "5" },
                },
                {
                  "@type": "Review",
                  author: { "@type": "Person", name: "Roberto y Diana Sánchez" },
                  datePublished: "2026-02-14",
                  reviewBody: "Nuestra boda en Villaverde superó todas las expectativas. Elegimos el paquete Esmeralda y valió cada peso: el grupo en vivo fue increíble, las cortesías como los cabezones y el show de burbujas encantaron a todos, y la cena de 3 tiempos estuvo deliciosa. Los jardines con fuente le dieron un toque mágico a la ceremonia. El mejor salón de Chalco sin duda.",
                  reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
                },
              ],
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Paquetes Todo Incluido",
                itemListElement: [
                  {
                    "@type": "Offer",
                    name: "Paquete Premium — 7 horas totales",
                    description: "Paquete todo incluido con cena formal de 3 tiempos, descorche libre, DJ, iluminación inteligente, batucada, camerinos, estacionamiento, invitación digital y 1 cortesía a elegir. 7 horas totales de evento.",
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
                    name: "Paquete Diamante — 8 horas totales (Más Popular)",
                    description: "El paquete más elegido. Todo lo del Premium más grupo versátil en vivo, pantalla LED gigante, chilaquiles y 2 cortesías a elegir. 8 horas totales de evento.",
                    priceSpecification: {
                      "@type": "PriceSpecification",
                      minPrice: "530",
                      maxPrice: "580",
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
                    name: "Paquete Esmeralda — 9 horas totales (El Más Completo)",
                    description: "El paquete máximo con TODO incluido: grupo en vivo, pantalla LED, show de robot, cabina 360, cantante en cena y TODAS las cortesías. 9 horas totales de evento.",
                    priceSpecification: {
                      "@type": "PriceSpecification",
                      minPrice: "680",
                      maxPrice: "720",
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
                ],
              },
              priceRange: "$420 - $720 MXN por persona",
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
                    text: "En Salón de Fiestas Villaverde los paquetes todo incluido van desde $420 por persona (Paquete Premium con 150+ invitados) hasta $720 por persona (Paquete Esmeralda). Todos incluyen cena formal de 3 tiempos, descorche libre, DJ, iluminación inteligente, meseros y más. Sin costos ocultos.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿Qué incluye un paquete todo incluido para XV años?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Nuestros paquetes para XV años incluyen: salón con capacidad de 100 a 450 invitados, cena formal de 3 tiempos, refresco ilimitado, descorche libre (trae tus bebidas sin cargo), DJ y Maestro de Ceremonias, iluminación tipo antro, batucada con globos, 2 camerinos privados, estacionamiento e invitación digital animada. Los paquetes Diamante y Esmeralda agregan grupo en vivo, pantalla LED gigante y más espectáculos.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿Cuánto es el anticipo para apartar mi fecha?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Puedes apartar tu fecha con solo $3,000 MXN de anticipo. El resto se cubre en pagos cómodos antes del evento. Te recomendamos apartar con anticipación ya que las fechas de fin de semana se agotan rápido.",
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
                    text: "Estamos en Carretera México-Cuautla, Km. 35.5, Col. Santa Cruz Amalinalco, Chalco, Estado de México. Contamos con estacionamiento amplio incluido. Puedes agendar una visita sin compromiso para conocer nuestras instalaciones.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿Qué diferencia hay entre los paquetes Premium, Diamante y Esmeralda?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "El Premium ($420/pp) incluye todo lo esencial: cena, descorche libre, DJ y 1 cortesía a elegir con 7 horas totales. El Diamante ($530/pp) es el más popular: agrega grupo versátil en vivo, pantalla LED, chilaquiles y 2 cortesías con 8 horas totales. El Esmeralda ($680/pp) es el paquete máximo con show de robot, cabina 360, cantante en cena y todas las cortesías incluidas con 9 horas totales.",
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
      <body>
        {children}
        {/* Meta Pixel */}
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '460528009991262');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=460528009991262&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}
