import { getAnalyticsConsent } from "./analytics-consent";

interface ContactParameters {
  content_name: string;
  content_category: string;
}

interface MetaPixel {
  (command: "track", event: "Contact", parameters: ContactParameters): void;
}

interface AnalyticsWindow extends Window {
  fbq?: MetaPixel;
}

export const WHATSAPP_DATE_URL =
  "https://wa.me/529995485862?text=" +
  encodeURIComponent("Hola, quiero consultar disponibilidad de fecha para mi evento en Villaverde.");

export function trackWhatsAppContact(placement: string): void {
  if (typeof window === "undefined") return;
  if (getAnalyticsConsent() !== "accepted") return;
  const pixel = (window as AnalyticsWindow).fbq;
  if (typeof pixel !== "function") return;
  pixel("track", "Contact", {
    content_name: "cotizacion_whatsapp",
    content_category: placement,
  });
}
