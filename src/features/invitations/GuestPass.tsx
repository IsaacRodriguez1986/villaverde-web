"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    qrcode?: (type: number, level: string) => {
      addData(value: string): void;
      make(): void;
      createDataURL(cellSize: number, margin: number): string;
    };
  }
}

/** The private invitation never leaves the browser to generate this QR. */
export function GuestPass({ token, code, guestId }: { token: string; code: string; guestId: string }) {
  const [ready, setReady] = useState(false);
  const [image, setImage] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ready || !window.qrcode || !token) return;
    try {
      const qr = window.qrcode(0, "M");
      qr.addData(`${window.location.origin}/rsvp/${encodeURIComponent(code)}/${encodeURIComponent(guestId)}#token=${encodeURIComponent(token)}`);
      qr.make();
      setImage(qr.createDataURL(5, 20));
      setError(false);
    } catch { setError(true); }
  }, [ready, token, code, guestId]);

  return <section aria-label="Pase de acceso" style={{ margin: "24px auto", maxWidth: 300 }}>
    <Script src="/vendor/qrcode/qrcode-2.0.4.js" onReady={() => setReady(true)} onError={() => setError(true)} />
    <h2 style={{ fontSize: 20, color: "#fff" }}>Tu pase de acceso</h2>
    {image ? <img src={image} alt="Código QR de tu pase privado para recepción" width={260} height={260} style={{ width: "100%", height: "auto", maxWidth: 260, background: "white", borderRadius: 8 }} />
      : <p role="status">{error ? "No se pudo generar el QR. En recepción pueden buscar tu nombre." : "Preparando tu pase…"}</p>}
    <p style={{ color: "rgba(255,255,255,.7)", fontSize: 14 }}>Muéstralo al equipo de recepción. Abrir este pase no registra tu llegada.</p>
    {image ? <a href={image} download="pase-eventus.gif" style={{ color: "#E0C068", display: "inline-block", padding: 12 }}>Guardar pase QR</a> : null}
  </section>;
}
