"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";

const API_BASE = "/api/eventus";

/* ─── Types ─── */

interface EventData {
  id: number;
  code: string;
  type: string;
  name: string;
  date: string;
  photo_url?: string;
  gallery?: string[];
  dress_code?: string;
  event_time?: string;
  [key: string]: unknown;
}

interface GuestData {
  id: number;
  event_code: string;
  name: string;
  companions?: number;
  mesa?: string | number;
  status?: string;
  wa?: string;
  [key: string]: unknown;
}

type ViewState =
  | "loading"
  | "invitation"
  | "confirmed"
  | "cancelled"
  | "already_confirmed"
  | "already_cancelled"
  | "error";

/* ─── Theme config by event type ─── */

interface ThemeConfig {
  accent: string;
  accentRgb: string;
  icon: string;
  label: string;
}

function getTheme(type: string): ThemeConfig {
  const t = type?.toLowerCase().trim() || "";
  if (t === "xv" || t === "xv años" || t === "xv_anos")
    return { accent: "#F0157A", accentRgb: "240,21,122", icon: "\u{1F451}", label: "XV Anos" };
  if (t === "boda")
    return { accent: "#FFF8E7", accentRgb: "255,248,231", icon: "\u{1F48D}", label: "Boda" };
  if (t === "graduacion" || t === "graduación")
    return { accent: "#00E676", accentRgb: "0,230,118", icon: "\u{1F393}", label: "Graduacion" };
  return { accent: "#C9A84C", accentRgb: "201,168,76", icon: "\u{1F389}", label: "Evento" };
}

/* ─── Helpers ─── */

function formatDateSpanish(dateStr: string): string {
  try {
    const date = new Date(dateStr + "T12:00:00");
    const days = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    const months = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
    ];
    return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

function formatEventTitle(type: string, name: string): string {
  const t = type?.toLowerCase().trim() || "";
  if (t === "xv" || t === "xv años" || t === "xv_anos") return `XV Anos de ${name}`;
  if (t === "boda") return `Boda de ${name}`;
  if (t === "graduacion" || t === "graduación") return `Graduacion de ${name}`;
  if (t === "bautizo") return `Bautizo de ${name}`;
  if (t === "cumpleaños" || t === "cumpleanos") return `Cumpleanos de ${name}`;
  return name;
}

function getEventDateTime(event: EventData): Date {
  const dateStr = event.date || "";
  const timeStr = event.event_time || "18:00";
  try {
    return new Date(`${dateStr}T${timeStr}:00`);
  } catch {
    return new Date(dateStr + "T18:00:00");
  }
}

/* ─── Countdown Hook ─── */

function useCountdown(targetDate: Date) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, targetDate.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, passed: diff === 0 };
}

/* ─── Confetti Effect ─── */

function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ["#C9A84C", "#F0157A", "#00E676", "#FFF8E7", "#FFD700", "#FF6B6B"];
    const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string; rotation: number; rv: number; life: number }[] = [];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.5,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rv: (Math.random() - 0.5) * 10,
        life: 1,
      });
    }
    let frame: number;
    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rotation += p.rv;
        if (p.y > canvas.height + 20) { p.life = 0; continue; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      if (alive) frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 9999 }}
    />
  );
}

/* ─── Lightbox ─── */

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.9)", zIndex: 9998,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, cursor: "pointer", animation: "fadeIn 0.3s ease",
      }}
    >
      <img
        src={src}
        alt=""
        style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: 12, border: "2px solid rgba(201,168,76,0.4)" }}
      />
    </div>
  );
}

/* ─── CSS ─── */

const GLOBAL_CSS = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInScale {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
  }
  @keyframes sparkle {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.08); }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(201,168,76,0.3), 0 0 40px rgba(201,168,76,0.1); }
    50% { box-shadow: 0 0 30px rgba(201,168,76,0.5), 0 0 60px rgba(201,168,76,0.2); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes celebrationBounce {
    0%, 100% { transform: translateY(0) scale(1); }
    25% { transform: translateY(-30px) scale(1.1); }
    50% { transform: translateY(-10px) scale(1.05); }
    75% { transform: translateY(-20px) scale(1.08); }
  }
  @keyframes countPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .rsvp-btn:active {
    transform: scale(0.96) !important;
  }
  .rsvp-btn:hover {
    filter: brightness(1.1);
  }
  .gallery-scroll::-webkit-scrollbar {
    height: 4px;
  }
  .gallery-scroll::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.05);
    border-radius: 2px;
  }
  .gallery-scroll::-webkit-scrollbar-thumb {
    background: rgba(201,168,76,0.3);
    border-radius: 2px;
  }
`;

/* ─── Floating Particles Background ─── */

function ParticlesBackground({ accentRgb }: { accentRgb: string }) {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 15,
    duration: 8 + Math.random() * 12,
    size: 2 + Math.random() * 4,
    opacity: 0.2 + Math.random() * 0.5,
  }));
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {/* Radial gradients */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        background: `radial-gradient(ellipse at 50% 0%, rgba(${accentRgb},0.07) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(201,168,76,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 60%, rgba(${accentRgb},0.03) 0%, transparent 40%)`,
      }} />
      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            bottom: "-10px",
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: `rgba(201,168,76,${p.opacity})`,
            boxShadow: `0 0 ${p.size * 2}px rgba(201,168,76,${p.opacity * 0.5})`,
            animation: `float ${p.duration}s ${p.delay}s infinite ease-in`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Divider ─── */

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "28px 0" }}>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)" }} />
      <div style={{ color: "#C9A84C", fontSize: 10, animation: "sparkle 3s ease-in-out infinite" }}>{"\u2726"}</div>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)" }} />
    </div>
  );
}

/* ─── Detail Card ─── */

function DetailCard({ icon, label, value, link }: { icon: string; label: string; value: string; link?: string }) {
  const content = (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px 18px",
      background: "rgba(201,168,76,0.04)",
      border: "1px solid rgba(201,168,76,0.1)",
      borderRadius: 14,
      transition: "all 0.2s ease",
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: "rgba(201,168,76,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#C9A84C", marginBottom: 3, fontFamily: "system-ui, -apple-system, sans-serif" }}>
          {label}
        </p>
        <p style={{ margin: 0, fontSize: 15, color: "rgba(255,255,255,0.85)", fontFamily: "Georgia, 'Times New Roman', serif", lineHeight: 1.4 }}>
          {value}
        </p>
      </div>
      {link && (
        <div style={{ fontSize: 16, color: "rgba(201,168,76,0.5)", flexShrink: 0 }}>{"\u203A"}</div>
      )}
    </div>
  );
  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
        {content}
      </a>
    );
  }
  return content;
}

/* ─── Countdown ─── */

function CountdownDisplay({ event }: { event: EventData }) {
  const target = getEventDateTime(event);
  const { days, hours, minutes, seconds, passed } = useCountdown(target);
  if (passed) return null;
  const units = [
    { value: days, label: "Dias" },
    { value: hours, label: "Horas" },
    { value: minutes, label: "Min" },
    { value: seconds, label: "Seg" },
  ];
  return (
    <div style={{ animation: "fadeInUp 1s ease-out 0.6s both" }}>
      <p style={{
        textAlign: "center", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em",
        color: "#C9A84C", marginBottom: 14, fontFamily: "system-ui, -apple-system, sans-serif",
      }}>
        Cuenta regresiva
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
        {units.map((u) => (
          <div key={u.label} style={{
            width: 68, padding: "12px 0", borderRadius: 14,
            background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.12)",
            textAlign: "center",
          }}>
            <div style={{
              fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 26, fontWeight: 700,
              color: "#C9A84C", lineHeight: 1, animation: "countPulse 2s ease-in-out infinite",
            }}>
              {String(u.value).padStart(2, "0")}
            </div>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginTop: 4, fontFamily: "system-ui, -apple-system, sans-serif" }}>
              {u.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Photo Gallery ─── */

function PhotoGallery({ gallery }: { gallery: string[] }) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const photos = gallery.slice(0, 5);
  if (!photos.length) return null;
  return (
    <>
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
      <div style={{ animation: "fadeInUp 1s ease-out 0.8s both" }}>
        <p style={{
          textAlign: "center", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em",
          color: "#C9A84C", marginBottom: 14, fontFamily: "system-ui, -apple-system, sans-serif",
        }}>
          Galeria
        </p>
        <div
          className="gallery-scroll"
          style={{
            display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8,
            scrollSnapType: "x mandatory",
          }}
        >
          {photos.map((url, i) => (
            <div
              key={i}
              onClick={() => setLightboxSrc(url)}
              style={{
                flexShrink: 0, width: 140, height: 140, borderRadius: 14, overflow: "hidden",
                border: "1px solid rgba(201,168,76,0.15)", cursor: "pointer",
                scrollSnapAlign: "start", transition: "transform 0.2s ease",
              }}
            >
              <img
                src={url}
                alt={`Foto ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── Main Page ─── */

export default function RSVPPage({
  params,
}: {
  params: Promise<{ code: string; guestId: string }>;
}) {
  const { code, guestId } = use(params);

  const [viewState, setViewState] = useState<ViewState>("loading");
  const [event, setEvent] = useState<EventData | null>(null);
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(
          `${API_BASE}?code=${encodeURIComponent(code)}&guestId=${encodeURIComponent(guestId)}`
        );
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();

        if (!data.event || !data.guest) {
          setViewState("error");
          return;
        }

        setEvent(data.event);
        setGuest(data.guest);

        const status = data.guest.status?.toLowerCase();
        if (status === "confirmed") {
          setViewState("already_confirmed");
        } else if (status === "cancelled") {
          setViewState("already_cancelled");
        } else {
          setViewState("invitation");
        }
      } catch (err) {
        console.error("Error loading RSVP data:", err);
        setViewState("error");
      }
    }
    loadData();
  }, [code, guestId]);

  async function updateStatus(newStatus: "confirmed" | "cancelled") {
    setUpdating(true);
    try {
      const res = await fetch(API_BASE, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          guestId,
          status: newStatus,
        }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      if (data.guest) {
        setGuest(data.guest);
      }
      if (newStatus === "confirmed") {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
      setViewState(newStatus === "confirmed" ? "confirmed" : "cancelled");
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Hubo un error al actualizar tu respuesta. Intenta de nuevo.");
    } finally {
      setUpdating(false);
    }
  }

  const theme = event ? getTheme(event.type) : { accent: "#C9A84C", accentRgb: "201,168,76", icon: "", label: "" };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {showConfetti && <ConfettiCanvas />}
      <ParticlesBackground accentRgb={theme.accentRgb} />
      <div
        style={{
          minHeight: "100vh",
          background: "#090909",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "32px 16px 48px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#fff",
          position: "relative",
        }}
      >
        <div style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 1 }}>
          {viewState === "loading" && <LoadingView />}
          {viewState === "error" && <ErrorView />}
          {viewState === "invitation" && event && guest && (
            <InvitationView
              event={event}
              guest={guest}
              theme={theme}
              updating={updating}
              onConfirm={() => updateStatus("confirmed")}
              onDecline={() => updateStatus("cancelled")}
            />
          )}
          {viewState === "confirmed" && event && guest && (
            <ConfirmedView event={event} guest={guest} code={code} guestId={guestId} theme={theme} />
          )}
          {viewState === "cancelled" && event && guest && (
            <CancelledView event={event} />
          )}
          {viewState === "already_confirmed" && event && guest && (
            <AlreadyConfirmedView event={event} guest={guest} code={code} guestId={guestId} theme={theme} />
          )}
          {viewState === "already_cancelled" && event && guest && (
            <AlreadyCancelledView event={event} onChangeMind={() => updateStatus("confirmed")} updating={updating} />
          )}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 48, textAlign: "center", position: "relative", zIndex: 1,
          animation: "fadeIn 1s ease-out 1.2s both",
        }}>
          <Divider />
          <p style={{
            fontSize: 11, letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)",
            fontFamily: "system-ui, -apple-system, sans-serif", margin: "0 0 10px",
          }}>
            Cortesia de
          </p>
          <p style={{
            fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 14, fontWeight: 600,
            color: "#C9A84C", letterSpacing: "0.08em", margin: "0 0 16px",
          }}>
            Salon de Fiestas Villaverde
          </p>
          <a
            href="https://wa.me/529995485862"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none",
              padding: "8px 16px", borderRadius: 20,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              transition: "all 0.2s ease",
            }}
          >
            {"\u{1F4AC}"} WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function LoadingView() {
  return (
    <div style={{ textAlign: "center", padding: "100px 0", animation: "fadeIn 0.5s ease" }}>
      <div style={{
        width: 48, height: 48, margin: "0 auto 28px",
        border: "2px solid rgba(201,168,76,0.1)",
        borderTopColor: "#C9A84C",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }} />
      <p style={{
        fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 16,
        color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em",
      }}>
        Cargando tu invitacion...
      </p>
    </div>
  );
}

function ErrorView() {
  return (
    <div style={{ textAlign: "center", padding: "80px 24px", animation: "fadeInUp 0.8s ease-out" }}>
      <div style={{
        width: 80, height: 80, margin: "0 auto 28px", borderRadius: "50%",
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
      }}>
        {"\u{1F512}"}
      </div>
      <h1 style={{
        fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 28, fontWeight: 700,
        color: "#fff", marginBottom: 12,
      }}>
        Invitacion no encontrada
      </h1>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, lineHeight: 1.7 }}>
        Este enlace no es valido o la invitacion ya no esta disponible.
        <br />
        Verifica que tengas el enlace correcto.
      </p>
    </div>
  );
}

/* ─── INVITATION VIEW ─── */

function InvitationView({
  event,
  guest,
  theme,
  updating,
  onConfirm,
  onDecline,
}: {
  event: EventData;
  guest: GuestData;
  theme: ThemeConfig;
  updating: boolean;
  onConfirm: () => void;
  onDecline: () => void;
}) {
  const title = formatEventTitle(event.type, event.name);
  const dateFormatted = formatDateSpanish(event.date);
  const mapsUrl = "https://maps.google.com/?q=Salon+de+Fiestas+Villaverde+Chalco+Estado+de+Mexico";

  return (
    <div>
      {/* ── Brand ── */}
      <div style={{ textAlign: "center", marginBottom: 24, animation: "fadeInUp 0.8s ease-out" }}>
        <p style={{
          fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 12, fontWeight: 600,
          letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", margin: 0,
        }}>
          Salon de Fiestas Villaverde
        </p>
      </div>

      {/* ── Photo Frame ── */}
      <div style={{ textAlign: "center", marginBottom: 28, animation: "fadeInScale 1s ease-out 0.2s both" }}>
        {event.photo_url ? (
          <div style={{
            width: 180, height: 180, margin: "0 auto", borderRadius: "50%",
            border: "3px solid #C9A84C",
            boxShadow: "0 0 30px rgba(201,168,76,0.3), 0 0 60px rgba(201,168,76,0.1)",
            animation: "glow 4s ease-in-out infinite",
            overflow: "hidden",
          }}>
            <img
              src={event.photo_url}
              alt={event.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        ) : (
          <div style={{
            width: 140, height: 140, margin: "0 auto", borderRadius: "50%",
            border: "2px solid rgba(201,168,76,0.3)",
            background: "rgba(201,168,76,0.05)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 56, animation: "glow 4s ease-in-out infinite",
          }}>
            {theme.icon}
          </div>
        )}
      </div>

      {/* ── Main Card ── */}
      <div style={{
        background: "linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
        border: "1px solid rgba(201,168,76,0.12)",
        borderRadius: 24,
        padding: "36px 24px 32px",
        backdropFilter: "blur(20px)",
        animation: "fadeInUp 0.8s ease-out 0.3s both",
      }}>
        {/* Subtitle */}
        <p style={{
          textAlign: "center",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontStyle: "italic", fontSize: 15, color: "rgba(255,255,255,0.45)",
          margin: "0 0 8px", letterSpacing: "0.02em",
        }}>
          Tienes una invitacion especial
        </p>

        {/* Event type icon */}
        <div style={{ textAlign: "center", fontSize: 40, margin: "8px 0 12px" }}>
          {theme.icon}
        </div>

        {/* Event Title */}
        <h1 style={{
          textAlign: "center",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 30, fontWeight: 700, color: "#fff",
          margin: "0 0 4px", lineHeight: 1.25,
        }}>
          {title}
        </h1>

        <Divider />

        {/* Detail cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <DetailCard
            icon={"\u{1F4C5}"}
            label="Fecha"
            value={dateFormatted}
          />
          {event.event_time && (
            <DetailCard
              icon={"\u{1F555}"}
              label="Hora"
              value={event.event_time + " hrs"}
            />
          )}
          <DetailCard
            icon={"\u{1F4CD}"}
            label="Lugar"
            value="Salon de Fiestas Villaverde, Chalco, Edo. de Mexico"
            link={mapsUrl}
          />
          {event.dress_code && (
            <DetailCard
              icon={"\u{1F454}"}
              label="Codigo de vestimenta"
              value={event.dress_code}
            />
          )}
        </div>

        <Divider />

        {/* Countdown */}
        <CountdownDisplay event={event} />

        {/* Gallery */}
        {event.gallery && event.gallery.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <PhotoGallery gallery={event.gallery} />
          </div>
        )}

        <Divider />

        {/* Guest Info */}
        <div style={{ textAlign: "center", animation: "fadeInUp 1s ease-out 1s both" }}>
          <p style={{
            margin: "0 0 6px", fontSize: 11, textTransform: "uppercase",
            letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}>
            Invitado especial
          </p>
          <h2 style={{
            margin: "0 0 14px",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 28, fontWeight: 700,
            background: "linear-gradient(135deg, #C9A84C 0%, #E0C068 50%, #C9A84C 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 3s linear infinite",
          }}>
            {guest.name}
          </h2>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            {guest.companions !== undefined && guest.companions !== null && guest.companions > 0 && (
              <div style={{
                padding: "8px 16px", borderRadius: 10,
                background: `rgba(${theme.accentRgb},0.06)`,
                border: `1px solid rgba(${theme.accentRgb},0.12)`,
              }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
                  {"\u{1F465}"} {guest.companions} acompanante{guest.companions > 1 ? "s" : ""}
                </span>
              </div>
            )}
            {guest.mesa && (
              <div style={{
                padding: "8px 16px", borderRadius: 10,
                background: "rgba(201,168,76,0.06)",
                border: "1px solid rgba(201,168,76,0.12)",
              }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
                  {"\u{1FA91}"} Mesa {guest.mesa}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── RSVP Buttons ── */}
      <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14, animation: "fadeInUp 1s ease-out 1.1s both" }}>
        <button
          className="rsvp-btn"
          onClick={onConfirm}
          disabled={updating}
          style={{
            width: "100%", padding: "20px 24px",
            fontSize: 17, fontWeight: 700,
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: "#fff",
            background: "linear-gradient(135deg, #00C853 0%, #00E676 50%, #69F0AE 100%)",
            backgroundSize: "200% auto",
            border: "none", borderRadius: 16,
            cursor: updating ? "wait" : "pointer",
            opacity: updating ? 0.7 : 1,
            transition: "all 0.3s ease",
            boxShadow: "0 6px 30px rgba(0,230,118,0.3)",
            letterSpacing: "0.02em",
            animation: updating ? "none" : "gradientShift 3s ease infinite",
          }}
        >
          {updating ? "Confirmando..." : "\u2714\uFE0F Confirmar asistencia"}
        </button>

        <button
          className="rsvp-btn"
          onClick={onDecline}
          disabled={updating}
          style={{
            width: "100%", padding: "16px 24px",
            fontSize: 14, fontWeight: 500,
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: "rgba(255,255,255,0.4)",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            cursor: updating ? "wait" : "pointer",
            opacity: updating ? 0.7 : 1,
            transition: "all 0.3s ease",
          }}
        >
          No podre asistir
        </button>
      </div>
    </div>
  );
}

/* ─── CONFIRMED VIEW ─── */

function ConfirmedView({
  event,
  guest,
  code,
  guestId,
  theme,
}: {
  event: EventData;
  guest: GuestData;
  code: string;
  guestId: string;
  theme: ThemeConfig;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        background: "linear-gradient(160deg, rgba(0,230,118,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(0,230,118,0.15)",
        borderRadius: 24,
        padding: "52px 28px 44px",
        animation: "fadeInScale 0.8s ease-out",
      }}>
        <div style={{ fontSize: 72, marginBottom: 20, animation: "celebrationBounce 1.2s ease-out" }}>
          {"\u{1F389}"}
        </div>

        <h1 style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 32, fontWeight: 700, color: "#00E676",
          margin: "0 0 16px",
        }}>
          Gracias por confirmar!
        </h1>

        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.6, margin: "0 0 6px" }}>
          {guest.name}, tu asistencia a
        </p>
        <p style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 22, fontWeight: 600, color: "#fff", margin: "0 0 6px",
        }}>
          {formatEventTitle(event.type, event.name)}
        </p>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 32px" }}>
          ha sido registrada exitosamente.
        </p>

        <Divider />

        <a
          href={`/pase/${code}/${guestId}`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "18px 36px", fontSize: 16, fontWeight: 700,
            color: "#090909",
            background: "linear-gradient(135deg, #C9A84C 0%, #E0C068 50%, #C9A84C 100%)",
            border: "none", borderRadius: 14,
            textDecoration: "none", letterSpacing: "0.02em",
            boxShadow: "0 6px 24px rgba(201,168,76,0.35)",
            transition: "all 0.2s ease",
          }}
        >
          {"\u{1F3AB}"} Ver mi pase VIP
        </a>
      </div>
    </div>
  );
}

/* ─── CANCELLED VIEW ─── */

function CancelledView({ event }: { event: EventData }) {
  return (
    <div style={{ textAlign: "center", animation: "fadeInUp 0.8s ease-out" }}>
      <div style={{
        background: "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 24,
        padding: "52px 28px 44px",
      }}>
        <div style={{ fontSize: 56, marginBottom: 24 }}>{"\u{1F614}"}</div>

        <h1 style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 26, fontWeight: 700, color: "#fff", margin: "0 0 16px",
        }}>
          Lamentamos que no puedas asistir
        </h1>

        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, lineHeight: 1.7, margin: 0 }}>
          Si cambias de opinion, puedes volver a este enlace para confirmar tu asistencia.
        </p>
      </div>
    </div>
  );
}

/* ─── ALREADY CONFIRMED VIEW ─── */

function AlreadyConfirmedView({
  event,
  guest,
  code,
  guestId,
  theme,
}: {
  event: EventData;
  guest: GuestData;
  code: string;
  guestId: string;
  theme: ThemeConfig;
}) {
  return (
    <div style={{ textAlign: "center", animation: "fadeInUp 0.8s ease-out" }}>
      <div style={{
        background: "linear-gradient(160deg, rgba(0,230,118,0.04) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(0,230,118,0.12)",
        borderRadius: 24,
        padding: "52px 28px 44px",
      }}>
        <div style={{
          width: 80, height: 80, margin: "0 auto 24px", borderRadius: "50%",
          background: "rgba(0,230,118,0.08)", border: "2px solid rgba(0,230,118,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
        }}>
          {"\u2714\uFE0F"}
        </div>

        <h1 style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 28, fontWeight: 700, color: "#00E676", margin: "0 0 14px",
        }}>
          Ya confirmaste tu asistencia
        </h1>

        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, margin: "0 0 6px" }}>
          {guest.name}
        </p>
        <p style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 20, fontWeight: 600, color: "#fff", margin: "0 0 6px",
        }}>
          {formatEventTitle(event.type, event.name)}
        </p>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, margin: "0 0 32px" }}>
          {formatDateSpanish(event.date)}
        </p>

        <a
          href={`/pase/${code}/${guestId}`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "18px 36px", fontSize: 16, fontWeight: 700,
            color: "#090909",
            background: "linear-gradient(135deg, #C9A84C 0%, #E0C068 50%, #C9A84C 100%)",
            border: "none", borderRadius: 14,
            textDecoration: "none", letterSpacing: "0.02em",
            boxShadow: "0 6px 24px rgba(201,168,76,0.35)",
          }}
        >
          {"\u{1F3AB}"} Ver mi pase VIP
        </a>
      </div>
    </div>
  );
}

/* ─── ALREADY CANCELLED VIEW ─── */

function AlreadyCancelledView({
  event,
  onChangeMind,
  updating,
}: {
  event: EventData;
  onChangeMind: () => void;
  updating: boolean;
}) {
  return (
    <div style={{ textAlign: "center", animation: "fadeInUp 0.8s ease-out" }}>
      <div style={{
        background: "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 24,
        padding: "52px 28px 44px",
      }}>
        <div style={{ fontSize: 56, marginBottom: 24 }}>{"\u{1F4E9}"}</div>

        <h1 style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 26, fontWeight: 700, color: "#fff", margin: "0 0 16px",
        }}>
          Declinaste esta invitacion
        </h1>

        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, lineHeight: 1.7, margin: "0 0 32px" }}>
          Si cambiaste de opinion, aun puedes confirmar tu asistencia.
        </p>

        <button
          className="rsvp-btn"
          onClick={onChangeMind}
          disabled={updating}
          style={{
            padding: "18px 36px", fontSize: 16, fontWeight: 700,
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: "#fff",
            background: "linear-gradient(135deg, #00C853 0%, #00E676 50%, #69F0AE 100%)",
            border: "none", borderRadius: 14,
            cursor: updating ? "wait" : "pointer",
            opacity: updating ? 0.7 : 1,
            boxShadow: "0 6px 24px rgba(0,230,118,0.3)",
            transition: "all 0.3s ease",
          }}
        >
          {updating ? "Confirmando..." : "\u2714\uFE0F Ahora si asistire"}
        </button>
      </div>
    </div>
  );
}
