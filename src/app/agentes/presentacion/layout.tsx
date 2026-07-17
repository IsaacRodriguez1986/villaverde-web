import type { Metadata } from "next";

// La presentación de agentes es un Client Component y no puede exportar
// `metadata` (Next.js lo prohíbe con "use client"). Este layout servidor
// aplica el noindex para que la herramienta interna no se indexe.
export const metadata: Metadata = {
  robots: { index: false },
};

export default function PresentacionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
