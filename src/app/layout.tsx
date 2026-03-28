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
                    text: "En Salón de Fiestas Villaverde los paquetes todo incluido van desde $420 por persona (Paquete Premium con 150+ invitados) hasta $720 por persona (Paquete Esmeralda). Todos incluyen cena formal, descorche libre, DJ, iluminación y más.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿Qué incluye un paquete todo incluido para XV años?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Nuestros paquetes para XV años incluyen: salón con capacidad hasta 450 invitados, cena formal de 3 tiempos, refresco ilimitado, descorche libre, DJ y Maestro de Ceremonias, iluminación tipo antro, batucada, camerinos privados, estacionamiento e invitación digital animada. Los paquetes Diamante y Esmeralda agregan grupo en vivo, pantalla LED y más.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿Cuánto se necesita de anticipo para apartar fecha?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Puedes apartar tu fecha con solo $3,000 MXN de anticipo. El resto se cubre en pagos antes del evento.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿El salón Villaverde permite descorche libre?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Sí, todos nuestros paquetes (Premium, Diamante y Esmeralda) incluyen descorche libre. Puedes traer tus propias bebidas alcohólicas sin ningún cargo adicional. Además, el paquete incluye botella ¾ por mesa y refresco ilimitado.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿Dónde se encuentra el Salón de Fiestas Villaverde?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Estamos ubicados en Carretera México-Cuautla, Km. 35.5, Col. Santa Cruz Amalinalco, Chalco, Estado de México. Contamos con estacionamiento amplio para tus invitados.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿Cuál es la capacidad máxima del salón?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "El Salón de Fiestas Villaverde tiene capacidad de 100 a 450 invitados. Contamos con mesas redondas, sillas Tiffany y amplios jardines con fuente para la recepción.",
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
