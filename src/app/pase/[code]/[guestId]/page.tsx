"use client";

import { use, useEffect, useState, useRef } from "react";

declare global {
  interface Window {
    qrcode: any;
  }
}

interface EventData {
  id: number;
  code: string;
  event_type: string;
  event_name: string;
  event_date: string;
  venue_name?: string;
  created_at?: string;
}

interface GuestData {
  id: number;
  event_code: string;
  name: string;
  status: string;
  companions: number;
  table_number?: string | number | null;
  phone?: string;
  created_at?: string;
}

const API_BASE = "/api/eventus";

function formatDateSpanish(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const days = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName} ${day} de ${month}, ${year}`;
}

export default function PasePage({
  params,
}: {
  params: Promise<{ code: string; guestId: string }>;
}) {
  const { code, guestId } = use(params);

  const [event, setEvent] = useState<EventData | null>(null);
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  // Fetch data from API proxy
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `${API_BASE}?code=${encodeURIComponent(code)}&guestId=${encodeURIComponent(guestId)}`
        );
        if (!res.ok) throw new Error("Error al cargar los datos");
        const data = await res.json();

        if (!data.event) throw new Error("Evento no encontrado");
        if (!data.guest) throw new Error("Invitado no encontrado");

        setEvent(data.event);
        setGuest(data.guest);
      } catch (err: any) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [code, guestId]);

  // Load QR code library and generate QR
  useEffect(() => {
    if (!guest || guest.status !== "confirmed") return;

    const checkinUrl = `https://salondefiestasvillaverde.com/checkin/${code}/${guestId}`;

    // Load the QR code library from CDN
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js";
    script.async = true;
    script.onload = () => {
      try {
        const qr = window.qrcode(0, "M");
        qr.addData(checkinUrl);
        qr.make();

        // Create a canvas for a cleaner QR
        const moduleCount = qr.getModuleCount();
        const cellSize = 6;
        const margin = 16;
        const size = moduleCount * cellSize + margin * 2;

        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // White background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, size, size);

        // Draw modules
        ctx.fillStyle = "#090909";
        for (let row = 0; row < moduleCount; row++) {
          for (let col = 0; col < moduleCount; col++) {
            if (qr.isDark(row, col)) {
              ctx.fillRect(
                margin + col * cellSize,
                margin + row * cellSize,
                cellSize,
                cellSize
              );
            }
          }
        }

        setQrDataUrl(canvas.toDataURL("image/png"));
      } catch (e) {
        console.error("Error generating QR:", e);
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [guest, code, guestId]);

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#090909",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid rgba(240,21,122,0.2)",
              borderTopColor: "#F0157A",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
            Cargando pase de acceso...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#090909",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: 24,
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: 400,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: 32,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2
            style={{
              color: "#fff",
              fontFamily: "Georgia, 'Cormorant Garamond', serif",
              fontSize: 22,
              marginBottom: 8,
            }}
          >
            No se pudo cargar el pase
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  // Not confirmed state
  if (guest && guest.status !== "confirmed") {
    const rsvpLink = `https://salondefiestasvillaverde.com/rsvp/${code}/${guestId}`;
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#090909",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: 24,
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: 400,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: 32,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎟️</div>
          <h2
            style={{
              color: "#fff",
              fontFamily: "Georgia, 'Cormorant Garamond', serif",
              fontSize: 22,
              marginBottom: 12,
            }}
          >
            Pase no disponible
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 14,
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            Para obtener tu pase de acceso VIP, primero necesitas confirmar tu
            asistencia.
          </p>
          <a
            href={rsvpLink}
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #F0157A, #C9084A)",
              color: "#fff",
              padding: "14px 32px",
              borderRadius: 50,
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            Confirmar asistencia
          </a>
        </div>
      </div>
    );
  }

  if (!event || !guest) return null;

  const passId = `VV-${String(guest.id).padStart(4, "0")}`;
  const passLink = `https://salondefiestasvillaverde.com/pase/${code}/${guestId}`;
  const whatsappMessage = encodeURIComponent(
    `🎟️ ¡Ya tengo mi pase VIP para ${event.event_name}!\n\nMira mi pase de acceso:\n${passLink}`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

  const eventTypeLabel: Record<string, string> = {
    boda: "Boda",
    xv: "XV Años",
    graduacion: "Graduación",
    cumpleanos: "Cumpleaños",
    bautizo: "Bautizo",
    corporativo: "Evento Corporativo",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#090909",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* The Pass Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          animation: "fadeIn 0.6s ease-out",
        }}
      >
        {/* Top section */}
        <div
          style={{
            background:
              "linear-gradient(165deg, rgba(240,21,122,0.08) 0%, rgba(15,15,15,0.98) 40%, rgba(201,168,76,0.06) 100%)",
            border: "1px solid rgba(240,21,122,0.2)",
            borderBottom: "none",
            borderRadius: "20px 20px 0 0",
            padding: "28px 24px 24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative top line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "linear-gradient(90deg, #F0157A, #C9A84C, #F0157A)",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s linear infinite",
            }}
          />

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <p
              style={{
                color: "#F0157A",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Pase de Acceso
            </p>
            <p
              style={{
                color: "rgba(201,168,76,0.7)",
                fontSize: 10,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Salón de Fiestas Villaverde
            </p>
          </div>

          {/* Event type badge */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <span
              style={{
                display: "inline-block",
                background: "rgba(240,21,122,0.12)",
                border: "1px solid rgba(240,21,122,0.25)",
                color: "#F0157A",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "5px 16px",
                borderRadius: 50,
              }}
            >
              {eventTypeLabel[event.event_type] || event.event_type}
            </span>
          </div>

          {/* Event name */}
          <h1
            style={{
              textAlign: "center",
              color: "#fff",
              fontFamily: "Georgia, 'Cormorant Garamond', serif",
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1.2,
              margin: "0 0 16px",
            }}
          >
            {event.event_name}
          </h1>

          {/* Date */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              📅 {formatDateSpanish(event.event_date)}
            </p>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)",
              marginBottom: 20,
            }}
          />

          {/* Guest info */}
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Invitado
            </p>
            <h2
              style={{
                color: "#fff",
                fontFamily: "Georgia, 'Cormorant Garamond', serif",
                fontSize: 24,
                fontWeight: 600,
                margin: 0,
              }}
            >
              {guest.name}
            </h2>
          </div>

          {/* Details row */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 32,
              marginTop: 20,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 9,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Acompañantes
              </p>
              <p
                style={{
                  color: "#C9A84C",
                  fontSize: 20,
                  fontFamily: "Georgia, 'Cormorant Garamond', serif",
                  fontWeight: 700,
                }}
              >
                {guest.companions}
              </p>
            </div>
            {guest.table_number && (
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    color: "rgba(255,255,255,0.35)",
                    fontSize: 9,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  Mesa
                </p>
                <p
                  style={{
                    color: "#C9A84C",
                    fontSize: 20,
                    fontFamily: "Georgia, 'Cormorant Garamond', serif",
                    fontWeight: 700,
                  }}
                >
                  {guest.table_number}
                </p>
              </div>
            )}
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 9,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Pase
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 13,
                  fontFamily: "monospace",
                  fontWeight: 600,
                }}
              >
                {passId}
              </p>
            </div>
          </div>
        </div>

        {/* Tear line / dashed separator */}
        <div
          style={{
            position: "relative",
            height: 24,
            overflow: "visible",
          }}
        >
          {/* Left notch */}
          <div
            style={{
              position: "absolute",
              left: -12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#090909",
              zIndex: 2,
            }}
          />
          {/* Right notch */}
          <div
            style={{
              position: "absolute",
              right: -12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#090909",
              zIndex: 2,
            }}
          />
          {/* Dashed line */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 16,
              right: 16,
              borderTop: "2px dashed rgba(255,255,255,0.1)",
            }}
          />
          {/* Background fill */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(15,15,15,0.98)",
              borderLeft: "1px solid rgba(240,21,122,0.2)",
              borderRight: "1px solid rgba(240,21,122,0.2)",
            }}
          />
        </div>

        {/* Bottom section - QR Code */}
        <div
          style={{
            background:
              "linear-gradient(165deg, rgba(15,15,15,0.98) 0%, rgba(201,168,76,0.04) 100%)",
            border: "1px solid rgba(240,21,122,0.2)",
            borderTop: "none",
            borderRadius: "0 0 20px 20px",
            padding: "20px 24px 28px",
            textAlign: "center",
          }}
        >
          {/* QR Code */}
          <div
            ref={qrRef}
            style={{
              display: "inline-block",
              background: "#fff",
              borderRadius: 12,
              padding: 12,
              marginBottom: 16,
            }}
          >
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code de acceso"
                style={{
                  display: "block",
                  width: 180,
                  height: 180,
                }}
              />
            ) : (
              <div
                style={{
                  width: 180,
                  height: 180,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                  fontSize: 12,
                }}
              >
                Generando QR...
              </div>
            )}
          </div>

          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 12,
              marginBottom: 4,
            }}
          >
            Presenta este código en la entrada
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: 10,
              fontFamily: "monospace",
            }}
          >
            {passId} · {code}
          </p>
        </div>
      </div>

      {/* Bottom buttons / actions */}
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          marginTop: 24,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <p
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,0.35)",
            fontSize: 12,
          }}
        >
          📱 Toma una captura de pantalla para guardar tu pase
        </p>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "linear-gradient(135deg, #25D366, #128C7E)",
            color: "#fff",
            padding: "14px 24px",
            borderRadius: 50,
            textDecoration: "none",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "0.01em",
          }}
        >
          💬 Compartir por WhatsApp
        </a>
      </div>

      {/* Footer */}
      <p
        style={{
          marginTop: 32,
          color: "rgba(255,255,255,0.15)",
          fontSize: 10,
          textAlign: "center",
        }}
      >
        Eventus Pro · Salón de Fiestas Villaverde
      </p>
    </div>
  );
}
