import type { Metadata } from "next";

// La página de RSVP es un Client Component y no puede exportar `metadata`
// (Next.js lo prohíbe con "use client"). Este layout servidor aplica el
// noindex para que las invitaciones no se indexen en buscadores.
export const metadata: Metadata = {
  robots: { index: false },
};

export default function RSVPLayout({ children }: { children: React.ReactNode }) {
  return children;
}
