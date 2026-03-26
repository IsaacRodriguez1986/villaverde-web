"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function trackLead(source: string) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Lead", { content_name: source });
  }
}

function WhatsAppIcon({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const testimonials = [
  {
    text: "El salón está hermoso, muy limpio y con un ambiente súper agradable. Celebramos los XV de mi hija y todos quedaron encantados con la atención. ¡Recomendadísimo!",
    author: "Laura Méndez",
    event: "XV Años",
  },
  {
    text: "Hicimos nuestra boda aquí y fue todo lo que soñamos. El paquete Diamante incluye todo, no tuvimos que preocuparnos por nada. El grupo en vivo estuvo increíble.",
    author: "Carlos y Ana García",
    event: "Boda",
  },
  {
    text: "La atención desde el primer momento fue excelente. Nos ayudaron a personalizar todo para la graduación de mi hijo. Los jardines son perfectos para las fotos.",
    author: "Patricia Hernández",
    event: "Graduación",
  },
  {
    text: "Segundo evento que hacemos en Villaverde y no nos cambiamos por nada. El descorche libre es un ahorro enorme y la comida siempre está deliciosa.",
    author: "Familia Rodríguez",
    event: "XV Años",
  },
  {
    text: "Comparamos con otros 5 salones en Chalco y Villaverde fue el mejor en relación calidad-precio. Las cortesías son un detalle que nadie más ofrece.",
    author: "Mariana López",
    event: "Boda",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("entradas");
  const [currentTesti, setCurrentTesti] = useState(0);
  const [showSticky, setShowSticky] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [menuExpanded, setMenuExpanded] = useState(false);
  const exitShownRef = useRef(false);

  useEffect(() => {
    // Scroll reveal
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    // Show sticky CTA after scrolling past hero
    const handleScroll = () => {
      setShowSticky(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Auto-rotate testimonials
    const testiInterval = setInterval(() => {
      setCurrentTesti((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    // Scroll depth tracking
    let tracked25 = false, tracked50 = false, tracked75 = false;
    const handleScrollDepth = () => {
      const depth = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (depth > 0.25 && !tracked25) { tracked25 = true; window.fbq?.("trackCustom", "ScrollDepth", { depth: "25%" }); }
      if (depth > 0.50 && !tracked50) { tracked50 = true; window.fbq?.("trackCustom", "ScrollDepth", { depth: "50%" }); }
      if (depth > 0.75 && !tracked75) { tracked75 = true; window.fbq?.("trackCustom", "ScrollDepth", { depth: "75%" }); }
    };
    window.addEventListener("scroll", handleScrollDepth, { passive: true });

    // Section view tracking
    const trackSections = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id === "paquetes") window.fbq?.("track", "ViewContent", { content_name: "paquetes" });
          if (id === "contacto") window.fbq?.("track", "InitiateCheckout", { content_name: "contacto" });
          trackSections.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll("#paquetes, #contacto").forEach((el) => trackSections.observe(el));

    // Live visitors toast
    const toastInterval = setInterval(() => {
      setShowToast(true);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 4000);
      setTimeout(() => setShowToast(false), 4500);
    }, 35000);
    const firstToast = setTimeout(() => {
      setShowToast(true);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 4000);
      setTimeout(() => setShowToast(false), 4500);
    }, 8000);

    // Exit intent
    const handleExitIntent = (e: MouseEvent) => {
      if (e.clientY < 10 && !exitShownRef.current) {
        exitShownRef.current = true;
        setShowExitPopup(true);
        window.fbq?.("trackCustom", "ExitIntent");
      }
    };
    document.addEventListener("mousemove", handleExitIntent);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      clearInterval(testiInterval);
      window.removeEventListener("scroll", handleScrollDepth);
      trackSections.disconnect();
      document.removeEventListener("mousemove", handleExitIntent);
      clearInterval(toastInterval);
      clearTimeout(firstToast);
    };
  }, []);

  return (
    <>
      {/* Promo Bar */}
      <div className="promo-bar">
        Paquetes 2026 disponibles — Aparta tu fecha con $3,000 de anticipo
      </div>

      {/* Nav */}
      <nav className="nav">
        <a href="#inicio" className="nav-logo">
          Villa<span>verde</span>
        </a>
        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
        <div className={`nav-links${menuOpen ? " open" : ""}`}>
          <a href="#inicio" onClick={() => setMenuOpen(false)}>Inicio</a>
          <a href="#paquetes" onClick={() => setMenuOpen(false)}>Paquetes</a>
          <a href="#galeria" onClick={() => setMenuOpen(false)}>Galería</a>
          <a href="#menu" onClick={() => setMenuOpen(false)}>Menú</a>
          <a href="#extras" onClick={() => setMenuOpen(false)}>Extras</a>
          <a href="#contacto" onClick={() => setMenuOpen(false)}>Contacto</a>
          <a
            href="https://wa.me/529995485862?text=Hola%2C%20quiero%20agendar%20una%20visita%20al%20salon"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-cta"
            onClick={() => trackLead("nav_agendar")}
          >
            Agenda tu visita
          </a>
        </div>
      </nav>

      {/* Hero con video (fallback a imagen) */}
      <section className="hero" id="inicio">
        {/* Para activar video: sube tu video a /public/hero.mp4 y descomenta */}
        {/* <video className="hero-video" autoPlay muted loop playsInline poster="https://lh3.googleusercontent.com/d/1wy5kl8jPaljjALel4SMNn3LwDfiNOLBA">
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="hero-video-overlay"></div> */}
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="hero-badge" style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <span style={{color:'#FFD700'}}>★ 4.8</span> en Google · 127 reseñas
          </div>
          <h1>
            Tu fiesta desde <strong className="accent-verde">$420 por persona</strong> — todo incluido, sin sorpresas
          </h1>
          <p className="hero-sub">
            Bodas, XV Años y Graduaciones en Chalco, Estado de México
          </p>
          <div className="hero-pills">
            <span className="hero-pill">500+ eventos realizados</span>
            <span className="hero-pill">10+ años de experiencia</span>
            <span className="hero-pill">Todo incluido</span>
          </div>
          <div className="hero-btns">
            <a
              href="https://wa.me/529995485862?text=Hola%2C%20quiero%20informacion%20de%20paquetes%20para%20mi%20evento"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              onClick={() => trackLead("hero_whatsapp")}
            >
              Agenda tu visita gratis
            </a>
          </div>
          <p style={{fontSize:'0.85rem',color:'rgba(255,255,255,0.6)',marginTop:'0.5rem'}}>
            Incluye invitaciones digitales con QR gratis para tu evento
          </p>
        </div>
        <div className="hero-scroll">Scroll</div>
      </section>

      {/* Proof Bar */}
      <div className="proof reveal">
        <div className="proof-item">
          <div className="proof-num">500+</div>
          <div className="proof-label">Eventos realizados</div>
        </div>
        <div className="proof-item">
          <div className="proof-num">10+</div>
          <div className="proof-label">Años de experiencia</div>
        </div>
        <div className="proof-item">
          <div className="proof-num">250+</div>
          <div className="proof-label">Capacidad de invitados</div>
        </div>
        <div className="proof-item">
          <div className="proof-num">4.8★</div>
          <div className="proof-label">Calificación Google</div>
        </div>
      </div>

      {/* Social proof bar */}
      <div className="urgency-bar">
        <div className="urgency-inner">
          <span className="urgency-text">Los fines de semana se agotan primero — agenda tu visita sin compromiso</span>
        </div>
      </div>

      {/* Cómo funciona */}
      <section className="steps-section reveal">
        <div className="section-narrow">
          <h2 className="section-title">Reserva en 4 pasos</h2>
          <p className="section-sub">Así de fácil es celebrar en Villaverde</p>
          <div className="steps-grid">
            <div className="step-item">
              <div className="step-num">1</div>
              <div className="step-icon-circle">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div className="step-title">Agenda tu visita</div>
              <div className="step-desc">Conoce el salón sin compromiso</div>
            </div>
            <div className="step-item">
              <div className="step-num">2</div>
              <div className="step-icon-circle">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <div className="step-title">Elige tu paquete</div>
              <div className="step-desc">Premium, Diamante o Esmeralda</div>
            </div>
            <div className="step-item">
              <div className="step-num">3</div>
              <div className="step-icon-circle">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
              <div className="step-title">Aparta con $3,000</div>
              <div className="step-desc">Asegura tu fecha favorita</div>
            </div>
            <div className="step-item">
              <div className="step-num">4</div>
              <div className="step-icon-circle">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
              <div className="step-title">Disfruta tu fiesta</div>
              <div className="step-desc">Nosotros nos encargamos de todo</div>
            </div>
          </div>
        </div>
      </section>

      {/* Eventos */}
      <section className="section reveal">
        <div className="section-narrow">
          <h2 className="section-title">
            Celebramos los momentos
            <br />
            más importantes de tu vida
          </h2>
          <p className="section-sub"></p>
          <div className="events-grid">
            <a href="#paquetes" className="event-card">
              <img
                src="https://lh3.googleusercontent.com/d/13fdfyk_4KgzeFUbmc02tqNMOewdHiIO1"
                alt="XV Años"
              />
              <div className="event-overlay">
                <h3>XV Años</h3>
                <p>La fiesta que siempre soñaste para tu hija</p>
                <span className="ev-btn">Ver paquetes →</span>
              </div>
            </a>
            <a href="#paquetes" className="event-card">
              <img
                src="https://lh3.googleusercontent.com/d/1gPY-XRFHFsPyvlnDg2NSYlPP6-ubOuqb"
                alt="Bodas"
              />
              <div className="event-overlay">
                <h3>Bodas</h3>
                <p>Tu día más especial merece el lugar perfecto</p>
                <span className="ev-btn">Ver paquetes →</span>
              </div>
            </a>
            <a href="#paquetes" className="event-card">
              <img
                src="https://lh3.googleusercontent.com/d/1BAzHGdTpbbc2Gk8Z6wKrtp421A1ZbR59"
                alt="Graduaciones"
              />
              <div className="event-overlay">
                <h3>Graduaciones</h3>
                <p>Celebra tu logro con la fiesta que mereces</p>
                <span className="ev-btn">Ver paquetes →</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Paquetes */}
      <section className="section bg-crema" id="paquetes">
        <div className="section-narrow">
          <h2 className="section-title reveal">Elige tu paquete ideal</h2>
          <p className="section-sub reveal">
            Tres niveles diseñados para que tu fiesta sea exactamente como la
            soñaste. Sin costos ocultos, sin sorpresas.
          </p>
          <div className="pkg-grid">
            {/* Esmeralda */}
            <div className="pkg pkg-esmeralda reveal">
              <div className="pkg-head">
                <div className="pkg-badge">💚 La joya de la corona</div>
                <div className="pkg-icon">💎</div>
                <div className="pkg-name">Esmeralda</div>
                <div className="pkg-tag">La fiesta perfecta sin límites</div>
              </div>
              <div className="pkg-prices">
                <div className="pkg-price-box">
                  <div className="pkg-price-label">100–149 inv.</div>
                  <div className="pkg-price-num">$720</div>
                  <div className="pkg-price-unit">por persona</div>
                </div>
                <div className="pkg-price-box">
                  <div className="pkg-price-label">150+ inv.</div>
                  <div className="pkg-price-num">$680</div>
                  <div className="pkg-price-unit">por persona</div>
                </div>
              </div>
              <div className="pkg-body">
                <h4>Todo lo del Diamante más</h4>
                <div className="pkg-feat hi"><span className="ck">✓</span> 8 horas de evento (2 horas extra)</div>
                <div className="pkg-feat hi"><span className="ck">✓</span> Grupo versátil de 9 integrantes</div>
                <div className="pkg-feat hi"><span className="ck">✓</span> Pista LED iluminada completa</div>
                <div className="pkg-feat hi"><span className="ck">✓</span> Show de robot con pirotecnia 🤖</div>
                <div className="pkg-feat"><span className="ck">✓</span> Cabina fotográfica 360 (1 hora)</div>
                <div className="pkg-feat"><span className="ck">✓</span> Letras gigantes luminosas XV o BODA</div>
                <div className="pkg-feat"><span className="ck">✓</span> Cascada de flores en escalera</div>
                <div className="pkg-feat"><span className="ck">✓</span> Arco de flores artificiales</div>
                <div className="pkg-feat"><span className="ck">✓</span> Cóctel de bienvenida</div>
                <div className="pkg-feat"><span className="ck">✓</span> Cantante durante la cena</div>
                <div className="pkg-feat"><span className="ck">✓</span> Iluminación LED en cada mesa</div>
                <div className="pkg-feat"><span className="ck">✓</span> Menú premium personalizado</div>
                <div className="pkg-cort">🎁 ¡TODAS las cortesías incluidas sin límite!</div>
              </div>
              <a
                href="https://wa.me/529995485862?text=Hola%2C%20me%20interesa%20el%20Paquete%20ESMERALDA%20para%20mi%20evento.%20%C2%BFMe%20pueden%20dar%20m%C3%A1s%20informaci%C3%B3n%3F"
                target="_blank"
                rel="noopener noreferrer"
                className="pkg-btn"
                onClick={() => trackLead("paquete_esmeralda")}
              >
                Cotizar Esmeralda por WhatsApp
              </a>
            </div>

            {/* Diamante */}
            <div className="pkg pkg-diamante reveal">
              <div className="pkg-head">
                <div className="pkg-badge">⭐ Más Popular</div>
                <div className="pkg-icon">💎</div>
                <div className="pkg-name">Diamante</div>
                <div className="pkg-tag">El paquete estrella de Villaverde</div>
              </div>
              <div className="pkg-prices">
                <div className="pkg-price-box">
                  <div className="pkg-price-label">100–149 inv.</div>
                  <div className="pkg-price-num">$580</div>
                  <div className="pkg-price-unit">por persona</div>
                </div>
                <div className="pkg-price-box">
                  <div className="pkg-price-label">150+ inv.</div>
                  <div className="pkg-price-num">$530</div>
                  <div className="pkg-price-unit">por persona</div>
                </div>
              </div>
              <div className="pkg-body">
                <h4>Todo lo del Premium más</h4>
                <div className="pkg-feat hi"><span className="ck">✓</span> 7 horas de evento (1 hora extra)</div>
                <div className="pkg-feat hi"><span className="ck">✓</span> Grupo versátil en vivo (5 integrantes)</div>
                <div className="pkg-feat"><span className="ck">✓</span> Cabina profesional para DJ con iluminación</div>
                <div className="pkg-feat hi"><span className="ck">✓</span> Pantalla gigante LED</div>
                <div className="pkg-feat"><span className="ck">✓</span> Descargas de CO2 espectaculares</div>
                <div className="pkg-feat hi"><span className="ck">✓</span> Chilaquiles de madrugada 🌮</div>
                <div className="pkg-feat"><span className="ck">✓</span> Colores de mantelería a elegir</div>
                <div className="pkg-cort">🎁🎁 2 cortesías a elegir de nuestra lista exclusiva</div>
                <div className="pkg-value">Incluye $27,000 en extras por solo $110 más por persona vs Premium</div>
              </div>
              <a
                href="https://wa.me/529995485862?text=Hola%2C%20me%20interesa%20el%20Paquete%20DIAMANTE%20para%20mi%20evento.%20%C2%BFMe%20pueden%20dar%20m%C3%A1s%20informaci%C3%B3n%3F"
                target="_blank"
                rel="noopener noreferrer"
                className="pkg-btn"
                onClick={() => trackLead("paquete_diamante")}
              >
                Cotizar Diamante por WhatsApp
              </a>
            </div>

            {/* Premium */}
            <div className="pkg pkg-premium reveal">
              <div className="pkg-head">
                <div className="pkg-icon">✦</div>
                <div className="pkg-name">Premium</div>
                <div className="pkg-tag">La mejor relación valor-precio</div>
              </div>
              <div className="pkg-prices">
                <div className="pkg-price-box">
                  <div className="pkg-price-label">100–149 inv.</div>
                  <div className="pkg-price-num">$470</div>
                  <div className="pkg-price-unit">por persona</div>
                </div>
                <div className="pkg-price-box">
                  <div className="pkg-price-label">150+ inv.</div>
                  <div className="pkg-price-num">$420</div>
                  <div className="pkg-price-unit">por persona</div>
                </div>
              </div>
              <div className="pkg-body">
                <h4>Incluye</h4>
                <div className="pkg-feat"><span className="ck">✓</span> 6 horas de evento + recepción y desalojo</div>
                <div className="pkg-feat"><span className="ck">✓</span> Cena formal 3 tiempos (crema + pasta + plato fuerte con guarnición)</div>
                <div className="pkg-feat"><span className="ck">✓</span> Refresco y hielo ilimitado todo el evento</div>
                <div className="pkg-feat hi"><span className="ck">✓</span> Descorche libre — ¡trae tus bebidas sin cargo!</div>
                <div className="pkg-feat hi"><span className="ck">✓</span> Botella ¾ por mesa incluida</div>
                <div className="pkg-feat"><span className="ck">✓</span> Mesas redondas + sillas Tiffany vestidas (colores básicos)</div>
                <div className="pkg-feat"><span className="ck">✓</span> Meseros con capitán + personal de recepción</div>
                <div className="pkg-feat"><span className="ck">✓</span> DJ todo el evento + Maestro de Ceremonias</div>
                <div className="pkg-feat"><span className="ck">✓</span> Iluminación inteligente tipo antro</div>
                <div className="pkg-feat"><span className="ck">✓</span> Batucada con globos</div>
                <div className="pkg-feat"><span className="ck">✓</span> 2 camerinos privados (XV/novios + chambelanes)</div>
                <div className="pkg-feat"><span className="ck">✓</span> Estacionamiento amplio</div>
                <div className="pkg-feat"><span className="ck">✓</span> Invitación digital animada de regalo</div>
                <div className="pkg-cort">🎁 1 cortesía a elegir de nuestra lista exclusiva</div>
              </div>
              <a
                href="https://wa.me/529995485862?text=Hola%2C%20me%20interesa%20el%20Paquete%20PREMIUM%20para%20mi%20evento.%20%C2%BFMe%20pueden%20dar%20m%C3%A1s%20informaci%C3%B3n%3F"
                target="_blank"
                rel="noopener noreferrer"
                className="pkg-btn"
                onClick={() => trackLead("paquete_premium")}
              >
                Cotizar Premium por WhatsApp
              </a>
            </div>
          </div>
          <div className="pkg-note reveal">
            Mínimo 100 invitados · Estacionamiento con cargo adicional de $50 por auto
            <br />
            <strong>Aparta tu fecha con solo $3,000 de anticipo</strong>
          </div>
        </div>
      </section>

      {/* Cortesías */}
      <section className="section">
        <div className="section-narrow">
          <h2 className="section-title reveal">
            Personaliza tu evento con nuestras cortesías 🎁
          </h2>
          <p className="section-sub reveal">
            Un detalle exclusivo de Villaverde que ningún otro salón en Chalco
            ofrece. Tú eliges cómo hacer tu fiesta única.
          </p>
          <div className="cort-explain reveal">
            <div className="cort-explain-item">
              <div className="ce-num" style={{ color: "var(--rosa)" }}>1</div>
              <div className="ce-label">
                cortesía a elegir
                <br />
                <strong style={{ color: "var(--rosa)" }}>Premium</strong>
              </div>
            </div>
            <div className="cort-explain-item">
              <div className="ce-num" style={{ color: "var(--gold)" }}>2</div>
              <div className="ce-label">
                cortesías a elegir
                <br />
                <strong style={{ color: "var(--gold)" }}>Diamante</strong>
              </div>
            </div>
            <div className="cort-explain-item">
              <div className="ce-num" style={{ color: "var(--esmeralda)" }}>∞</div>
              <div className="ce-label">
                todas incluidas
                <br />
                <strong style={{ color: "var(--esmeralda)" }}>Esmeralda</strong>
              </div>
            </div>
          </div>
          <div className="cort-grid reveal">
            <div className="cort-item"><span className="ci">🎪</span> Inflable o trampolín en jardín</div>
            <div className="cort-item"><span className="ci">🌮</span> Torna fiesta de chilaquiles</div>
            <div className="cort-item"><span className="ci">🎵</span> Cabina iluminada para DJ</div>
            <div className="cort-item"><span className="ci">💡</span> Iluminación LED en mesas</div>
            <div className="cort-item"><span className="ci">🌸</span> Arco de flores (cuadrado)</div>
            <div className="cort-item"><span className="ci">🌺</span> Arco de flores (medio punto)</div>
            <div className="cort-item"><span className="ci">🎤</span> Cantante durante la cena</div>
            <div className="cort-item"><span className="ci">🤡</span> Cabezones</div>
            <div className="cort-item"><span className="ci">📹</span> Video remembranza</div>
            <div className="cort-item"><span className="ci">🫧</span> Máquina de burbujas</div>
            <div className="cort-item"><span className="ci">🌊</span> Cascada de flores en escalera</div>
            <div className="cort-item"><span className="ci">🤖</span> Show de robot (sin pirotecnia)</div>
          </div>
        </div>
      </section>

      {/* Galería */}
      <section className="section bg-gris" id="galeria">
        <div className="section-narrow">
          <h2 className="section-title reveal">Conoce nuestro salón</h2>
          <p className="section-sub reveal">
            Cada rincón diseñado para que tu evento sea espectacular
          </p>
          <div className="gallery-grid reveal">
            <div className="gallery-item wide" onClick={() => setLightboxSrc("https://lh3.googleusercontent.com/d/1ULTFHFO50ZyblmQpaEcgfHUSWhaM-Oy3")} style={{cursor:"pointer"}}>
              <img src="https://lh3.googleusercontent.com/d/1ULTFHFO50ZyblmQpaEcgfHUSWhaM-Oy3" alt="Fachada Villaverde" />
            </div>
            <div className="gallery-item" onClick={() => setLightboxSrc("https://lh3.googleusercontent.com/d/1BLlyoHkWGhy6I0Hp7ZzG2EVe6yEVHm9B")} style={{cursor:"pointer"}}>
              <img src="https://lh3.googleusercontent.com/d/1BLlyoHkWGhy6I0Hp7ZzG2EVe6yEVHm9B" alt="Interior salón" />
            </div>
            <div className="gallery-item tall" onClick={() => setLightboxSrc("https://lh3.googleusercontent.com/d/1qE0i254xALH01pZuRA4-41pnoKATtwMC")} style={{cursor:"pointer"}}>
              <img src="https://lh3.googleusercontent.com/d/1qE0i254xALH01pZuRA4-41pnoKATtwMC" alt="Fuente jardines" />
            </div>
            <div className="gallery-item" onClick={() => setLightboxSrc("https://lh3.googleusercontent.com/d/13Rdtbkgu1ZGpHdiu9t0KS6lG3OjBN0e_")} style={{cursor:"pointer"}}>
              <img src="https://lh3.googleusercontent.com/d/13Rdtbkgu1ZGpHdiu9t0KS6lG3OjBN0e_" alt="Montaje mesa" />
            </div>
            <div className="gallery-item" onClick={() => setLightboxSrc("https://lh3.googleusercontent.com/d/1JH9OgRsPQf0k70Be-2qP1n8BXwT50lKR")} style={{cursor:"pointer"}}>
              <img src="https://lh3.googleusercontent.com/d/1JH9OgRsPQf0k70Be-2qP1n8BXwT50lKR" alt="Montaje elegante" />
            </div>
            <div className="gallery-item wide" onClick={() => setLightboxSrc("https://lh3.googleusercontent.com/d/1wy5kl8jPaljjALel4SMNn3LwDfiNOLBA")} style={{cursor:"pointer"}}>
              <img src="https://lh3.googleusercontent.com/d/1wy5kl8jPaljjALel4SMNn3LwDfiNOLBA" alt="Salón panorámica" />
            </div>
            <div className="gallery-item" onClick={() => setLightboxSrc("https://lh3.googleusercontent.com/d/166Xx50pqnhCd4CkMRwb3BKzsfuYICHpp")} style={{cursor:"pointer"}}>
              <img src="https://lh3.googleusercontent.com/d/166Xx50pqnhCd4CkMRwb3BKzsfuYICHpp" alt="Pista LED" />
            </div>
            <div className="gallery-item" onClick={() => setLightboxSrc("https://lh3.googleusercontent.com/d/1jRn3R0MimtNoSng13RODuNvFkxty0nhG")} style={{cursor:"pointer"}}>
              <img src="https://lh3.googleusercontent.com/d/1jRn3R0MimtNoSng13RODuNvFkxty0nhG" alt="Escalera principal" />
            </div>
          </div>
          <div className="gallery-cta reveal">
            <a
              href="https://wa.me/529995485862?text=Hola%2C%20quiero%20agendar%20una%20visita%20al%20Sal%C3%B3n%20Villaverde%20para%20conocerlo"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              onClick={() => trackLead("galeria_visita")}
            >
              ¿Quieres verlo en persona? Agenda tu visita →
            </a>
          </div>
        </div>
      </section>

      {/* Por qué Villaverde */}
      <section className="section">
        <div className="section-narrow">
          <h2 className="section-title reveal">
            ¿Por qué las familias de Chalco eligen Villaverde?
          </h2>
          <div className="why-grid reveal">
            <div className="why-card">
              <div className="why-icon">🏰</div>
              <h3>Fachada icónica</h3>
              <p>Arquitectura estilo hacienda que crea el escenario perfecto para tus fotos. Un lugar que tus invitados nunca olvidarán.</p>
            </div>
            <div className="why-card">
              <div className="why-icon">🌿</div>
              <h3>Jardines con fuente</h3>
              <p>Espacios exteriores hermosos para la recepción y sesión de fotos al atardecer.</p>
            </div>
            <div className="why-card">
              <div className="why-icon">💎</div>
              <h3>2 camerinos privados</h3>
              <p>Exclusivo: uno para la quinceañera o novios y otro para chambelanes. Ningún otro salón lo ofrece.</p>
            </div>
            <div className="why-card">
              <div className="why-icon">🎁</div>
              <h3>Cortesías personalizables</h3>
              <p>Tú eliges cómo complementar tu fiesta con nuestro sistema único de cortesías. Solo en Villaverde.</p>
            </div>
            <div className="why-card">
              <div className="why-icon">📱</div>
              <h3>Invitación digital gratis</h3>
              <p>Invitación digital animada con confirmación de asistencia, cuenta regresiva y mapa — valorada en $2,500, incluida GRATIS en todos los paquetes.</p>
            </div>
            <div className="why-card">
              <div className="why-icon">💰</div>
              <h3>Sin sorpresas de precio</h3>
              <p>Todo incluido desde el primer momento. Nada de &quot;extras ocultos&quot; que inflan la cuenta al final.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparación con competencia */}
      <section className="section bg-crema">
        <div className="section-narrow">
          <h2 className="section-title reveal">Compara y decide</h2>
          <p className="section-sub reveal">
            Mira lo que incluyen nuestros paquetes vs. otros salones de la zona
          </p>
          <div className="reveal" style={{ overflowX: "auto" }}>
            <table className="compare-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Villaverde</th>
                  <th>Otros salones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Descorche libre</td>
                  <td><span className="compare-check">✓ Incluido</span></td>
                  <td><span className="compare-x">✗ $5,000–$8,000 extra</span></td>
                </tr>
                <tr>
                  <td>Cortesías a elegir</td>
                  <td><span className="compare-check">✓ Hasta 12 opciones</span></td>
                  <td><span className="compare-x">✗ No incluyen</span></td>
                </tr>
                <tr>
                  <td>Invitación digital</td>
                  <td><span className="compare-check">✓ Gratis</span></td>
                  <td><span className="compare-x">✗ No ofrecen</span></td>
                </tr>
                <tr>
                  <td>Botella por mesa</td>
                  <td><span className="compare-check">✓ Incluida</span></td>
                  <td><span className="compare-x">✗ $150–$200 extra</span></td>
                </tr>
                <tr>
                  <td>Camerinos privados</td>
                  <td><span className="compare-check">✓ 2 exclusivos</span></td>
                  <td><span className="compare-x">✗ 0–1</span></td>
                </tr>
                <tr>
                  <td>Precio por persona</td>
                  <td><span className="compare-check">Desde $420</span></td>
                  <td><span className="compare-x">Desde $450–$550</span></td>
                </tr>
                <tr>
                  <td>Chilaquiles madrugada</td>
                  <td><span className="compare-check">✓ En Diamante y Esmeralda</span></td>
                  <td><span className="compare-x">✗ $4,000+ extra</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Menú */}
      <section className="section bg-crema" id="menu">
        <div className="section-narrow">
          <h2 className="section-title reveal">Nuestro Menú de Banquete</h2>
          <p className="section-sub reveal">
            Cocina de primera para consentir a tus invitados
          </p>
          <div className="menu-tabs reveal">
            {["entradas", "cremas", "pasta", "pollo", "cerdo", "guarn"].map(
              (tab) => (
                <button
                  key={tab}
                  className={`menu-tab${activeMenu === tab ? " active" : ""}`}
                  onClick={() => setActiveMenu(tab)}
                >
                  {tab === "entradas" ? "Entradas" : tab === "cremas" ? "Cremas" : tab === "pasta" ? "Pasta" : tab === "pollo" ? "Pollo" : tab === "cerdo" ? "Cerdo" : "Guarniciones"}
                </button>
              )
            )}
          </div>

          {activeMenu === "entradas" && (() => {
            const items = ["Coctel de frutas con coco", "Volovanes (2)", "Ensalada de atún", "Flor de calabaza con queso", "Melón al oporto", "Rollos de jamón con ensalada rusa", "Pepino relleno de atún", "Jitomate relleno de atún", "Pimiento relleno de pollo"];
            return (
            <div className="menu-content active">
              <h3>Entradas</h3>
              <div className="menu-items">
                {(menuExpanded ? items : items.slice(0, 4)).map((item) => (
                  <span key={item} className="menu-item">{item}</span>
                ))}
              </div>
              {!menuExpanded && items.length > 4 && (
                <button className="menu-expand" onClick={() => setMenuExpanded(true)}>
                  Ver todas las opciones ({items.length}) ↓
                </button>
              )}
            </div>
            );
          })()}

          {activeMenu === "cremas" && (() => {
            const items = ["Elote", "Nuez", "Champiñones", "Chile poblano con elote", "Brócoli", "Almendras", "Pimiento morrón", "Zanahoria", "Flor de calabaza", "Cilantro", "Calabaza", "Coliflor", "Espinacas", "Espárragos", "Ejote", "Chícharos"];
            return (
            <div className="menu-content active">
              <h3>Cremas</h3>
              <div className="menu-items">
                {(menuExpanded ? items : items.slice(0, 4)).map((item) => (
                  <span key={item} className="menu-item">{item}</span>
                ))}
              </div>
              {!menuExpanded && items.length > 4 && (
                <button className="menu-expand" onClick={() => setMenuExpanded(true)}>
                  Ver todas las opciones ({items.length}) ↓
                </button>
              )}
            </div>
            );
          })()}

          {activeMenu === "pasta" && (() => {
            const codito = ["Con crema y jamón", "Con atún", "A la poblana", "A la crema con espinaca", "Con jamón y queso", "A la hawaiana", "Al chipotle", "A la boloñesa", "A la italiana", "Con jamón y gratín"];
            const espagueti = ["A la italiana", "A la jardinera", "A la hawaiana", "A la poblana", "A la boloñesa", "Con chorizo", "A la francesa", "A la florentina", "A la mantequilla", "Al chipotle", "Al gratín", "A la salsa rosa"];
            return (
            <div className="menu-content active">
              <h3>Pasta y Espagueti</h3>
              <div className="menu-subsection">
                <h4>Codito</h4>
                <div className="menu-items">
                  {(menuExpanded ? codito : codito.slice(0, 4)).map((item) => (
                    <span key={item} className="menu-item">{item}</span>
                  ))}
                </div>
                {!menuExpanded && codito.length > 4 && (
                  <button className="menu-expand" onClick={() => setMenuExpanded(true)}>
                    Ver todas las opciones ({codito.length}) ↓
                  </button>
                )}
              </div>
              <div className="menu-subsection">
                <h4>Espagueti</h4>
                <div className="menu-items">
                  {(menuExpanded ? espagueti : espagueti.slice(0, 4)).map((item) => (
                    <span key={item} className="menu-item">{item}</span>
                  ))}
                </div>
                {!menuExpanded && espagueti.length > 4 && (
                  <button className="menu-expand" onClick={() => setMenuExpanded(true)}>
                    Ver todas las opciones ({espagueti.length}) ↓
                  </button>
                )}
              </div>
            </div>
            );
          })()}

          {activeMenu === "pollo" && (() => {
            const polloItems = ["Almendrado", "Al pimiento morrón", "En carnitas", "En crema de chipotle", "En mixiotes con nopales", "En vino blanco", "En achiote", "A la naranja", "En adobo", "A la ciruela", "En crema de nuez", "Enchilado", "En mole poblano", "En mole verde", "En crema de champiñones", "A la jardinera", "A la piña", "A los 3 chiles"];
            const cordonItems = ["Jamón y queso amarillo", "Huitlacoche c/ queso", "Flor de calabaza c/ queso", "Ensalada rusa", "Calabacitas con cebolla en vino blanco"];
            return (
            <div className="menu-content active">
              <h3>Pollo</h3>
              <div className="menu-items">
                {(menuExpanded ? polloItems : polloItems.slice(0, 4)).map((item) => (
                  <span key={item} className="menu-item">{item}</span>
                ))}
              </div>
              {!menuExpanded && polloItems.length > 4 && (
                <button className="menu-expand" onClick={() => setMenuExpanded(true)}>
                  Ver todas las opciones ({polloItems.length}) ↓
                </button>
              )}
              <div className="menu-subsection">
                <h4>Pechugas Cordon Blue rellenas de:</h4>
                <div className="menu-items">
                  {(menuExpanded ? cordonItems : cordonItems.slice(0, 4)).map((item) => (
                    <span key={item} className="menu-item">{item}</span>
                  ))}
                </div>
                {!menuExpanded && cordonItems.length > 4 && (
                  <button className="menu-expand" onClick={() => setMenuExpanded(true)}>
                    Ver todas las opciones ({cordonItems.length}) ↓
                  </button>
                )}
                <p style={{ textAlign: "center", fontSize: "13px", color: "var(--gris-text)", marginTop: "10px" }}>
                  Con baño de crema de: champiñones, chipotle o tres quesos
                </p>
              </div>
            </div>
            );
          })()}

          {activeMenu === "cerdo" && (() => {
            const cerdoItems = ["Carnitas", "Pierna en adobo", "Pierna con champiñones"];
            const lomoItems = ["Adobo", "Enchilado", "Almendrado", "Crema de chipotle", "Mole poblano", "A la naranja", "A la jardinera", "A la ciruela", "Crema con champiñones", "Envinado", "A la piña", "A los tres chiles"];
            const tambienItems = ["Chuleta ahumada en chipotle", "Chuleta ahumada en piña"];
            return (
            <div className="menu-content active">
              <h3>Cerdo</h3>
              <div className="menu-items">
                {(menuExpanded ? cerdoItems : cerdoItems.slice(0, 4)).map((item) => (
                  <span key={item} className="menu-item">{item}</span>
                ))}
              </div>
              <div className="menu-subsection">
                <h4>Lomo en:</h4>
                <div className="menu-items">
                  {(menuExpanded ? lomoItems : lomoItems.slice(0, 4)).map((item) => (
                    <span key={item} className="menu-item">{item}</span>
                  ))}
                </div>
                {!menuExpanded && lomoItems.length > 4 && (
                  <button className="menu-expand" onClick={() => setMenuExpanded(true)}>
                    Ver todas las opciones ({lomoItems.length}) ↓
                  </button>
                )}
              </div>
              <div className="menu-subsection">
                <h4>También disponible:</h4>
                <div className="menu-items">
                  {tambienItems.map((item) => (
                    <span key={item} className="menu-item">{item}</span>
                  ))}
                </div>
              </div>
            </div>
            );
          })()}

          {activeMenu === "guarn" && (() => {
            const guarnItems = ["Ensalada rusa", "Puré de papa", "Ensalada de zanahoria con piña", "Ensalada de manzana con piña", "Verduras a la mantequilla", "Ensalada de pepino", "Papas a la mantequilla", "Frijoles refritos o charros", "Nopales en escabeche", "Rajas con crema", "Ensalada Waldorf"];
            const arrozItems = ["Mexicano", "Poblano", "Jardinero", "Blanco", "Risotto español"];
            const consomeItems = ["Pollo", "Res"];
            return (
            <div className="menu-content active">
              <h3>Guarniciones y Arroz</h3>
              <div className="menu-subsection">
                <h4>Guarniciones</h4>
                <div className="menu-items">
                  {(menuExpanded ? guarnItems : guarnItems.slice(0, 4)).map((item) => (
                    <span key={item} className="menu-item">{item}</span>
                  ))}
                </div>
                {!menuExpanded && guarnItems.length > 4 && (
                  <button className="menu-expand" onClick={() => setMenuExpanded(true)}>
                    Ver todas las opciones ({guarnItems.length}) ↓
                  </button>
                )}
              </div>
              <div className="menu-subsection">
                <h4>Arroz</h4>
                <div className="menu-items">
                  {(menuExpanded ? arrozItems : arrozItems.slice(0, 4)).map((item) => (
                    <span key={item} className="menu-item">{item}</span>
                  ))}
                </div>
                {!menuExpanded && arrozItems.length > 4 && (
                  <button className="menu-expand" onClick={() => setMenuExpanded(true)}>
                    Ver todas las opciones ({arrozItems.length}) ↓
                  </button>
                )}
              </div>
              <div className="menu-subsection">
                <h4>Consomé</h4>
                <div className="menu-items">
                  {consomeItems.map((item) => (
                    <span key={item} className="menu-item">{item}</span>
                  ))}
                </div>
              </div>
            </div>
            );
          })()}
        </div>
      </section>

      {/* Extras */}
      <section className="section" id="extras">
        <div className="section-narrow">
          <h2 className="section-title reveal">Complementa tu evento</h2>
          <p className="section-sub reveal">
            Servicios adicionales para hacer tu fiesta aún más espectacular
          </p>
          <div className="extras-grid reveal">
            {[
              { icon: "💡", name: "Pista LED", price: "$6,000" },
              { icon: "🤡", name: "Cabezones", price: "$600", detail: "c/u" },
              { icon: "📸", name: "Cabina 360", price: "$2,500", detail: "1 hora" },
              { icon: "📺", name: "Pantalla LED Gigante", price: "$10,000" },
              { icon: "🫧", name: "Burbujas", price: "$6,000" },
              { icon: "🔤", name: "Letras Gigantes", price: "$500", detail: "c/u" },
              { icon: "📹", name: "Video Remembranza", price: "$600" },
              { icon: "⛪", name: "Ceremonia Religiosa", price: "$5,000" },
              { icon: "🌮", name: "Torna Fiesta", price: "$4,000", detail: "100 personas" },
              { icon: "⏰", name: "Hora Extra", price: "$6,000" },
            ].map((extra) => (
              <div key={extra.name} className="extra-card">
                <div className="extra-icon">{extra.icon}</div>
                <div className="extra-name">{extra.name}</div>
                <div className="extra-price">{extra.price}</div>
                {extra.detail && <div className="extra-detail">{extra.detail}</div>}
              </div>
            ))}
          </div>
          <div className="extras-subtitle reveal">Música en Vivo 🎶</div>
          <div className="extras-grid reveal">
            {[
              { icon: "🎺", name: "Mariachi", price: "$4,000" },
              { icon: "🎤", name: "Cantante", price: "$15,000" },
              { icon: "🥁", name: "Banda 13 int.", price: "$13,000" },
              { icon: "🎸", name: "Grupo 5 int.", price: "$13,000" },
              { icon: "🎵", name: "Grupo 9 int.", price: "$10,500" },
              { icon: "🎻", name: "Trío", price: "$3,000" },
              { icon: "🤠", name: "Norteño 4 int.", price: "$3,000" },
            ].map((extra) => (
              <div key={extra.name} className="extra-card">
                <div className="extra-icon">{extra.icon}</div>
                <div className="extra-name">{extra.name}</div>
                <div className="extra-price">{extra.price}</div>
              </div>
            ))}
          </div>
          <div className="extra-coctel reveal">
            <h3>🍹 Fiesta Cóctel</h3>
            <div className="ec-price">$8,600</div>
            <p>
              Para 100 personas — 4 vitroleros de 10 lts (piña colada, azulito,
              mojito frutos rojos, mojito mango) + 100 micheladas de ½ litro con
              banderilla, escarchado y sabores a elegir
            </p>
          </div>
        </div>
      </section>

      {/* Testimonios - Google Reviews */}
      <section className="section bg-gris">
        <div className="section-narrow">
          <div className="google-header reveal">
            <span className="google-logo">
              <span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span>
            </span>
            <span style={{ fontSize: "15px", color: "var(--gris-text)" }}>Reseñas</span>
          </div>
          <div className="google-rating reveal">
            <strong>4.8</strong> ★★★★★ · 127 reseñas en Google
          </div>
          <div className="testi-carousel reveal">
            <button
              className="testi-nav prev"
              onClick={() =>
                setCurrentTesti(
                  (currentTesti - 1 + testimonials.length) % testimonials.length
                )
              }
            >
              ‹
            </button>
            <button
              className="testi-nav next"
              onClick={() =>
                setCurrentTesti((currentTesti + 1) % testimonials.length)
              }
            >
              ›
            </button>
            <div
              className="testi-track"
              style={{ transform: `translateX(-${currentTesti * 100}%)` }}
            >
              {testimonials.map((t, i) => (
                <div key={i} className="testi-slide">
                  <div className="testi-card">
                    <div className="testi-stars">★★★★★</div>
                    <div className="testi-text">
                      &quot;{t.text}&quot;
                    </div>
                    <div className="testi-author">— {t.author}</div>
                    <div className="testi-event">{t.event}</div>
                    <div className="google-badge">
                      <span className="google-logo" style={{ fontSize: "11px" }}>
                        <span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span>
                      </span>
                      Reseña verificada
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="testi-dots">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`testi-dot${currentTesti === i ? " active" : ""}`}
                  onClick={() => setCurrentTesti(i)}
                />
              ))}
            </div>
          </div>
          <div className="testi-cta reveal">
            <a href="#">DÉJANOS TU RESEÑA EN GOOGLE ⭐</a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="section-narrow">
          <h2 className="section-title reveal">Preguntas frecuentes</h2>
          <div className="faq-list reveal">
            {[
              { q: "¿Puedo llevar mis propias bebidas?", a: "¡Sí! Todos nuestros paquetes incluyen descorche libre. Trae todo el alcohol que quieras sin ningún cargo extra. Solo nosotros proporcionamos los refrescos y hielo que están incluidos." },
              { q: "¿Cuánto es el anticipo para apartar?", a: "Solo $3,000 MXN para reservar tu fecha. El resto se liquida en pagos cómodos antes del evento. Aceptamos transferencia y efectivo." },
              { q: "¿Qué pasa si llueve?", a: "Nuestro salón es completamente techado, así que tu evento no se ve afectado. Los jardines son para la recepción y fotos, pero toda la fiesta es en interior." },
              { q: "¿Tienen estacionamiento?", a: "Sí, contamos con estacionamiento amplio con un cargo de $50 por auto. También hay espacio en las calles aledañas sin costo." },
              { q: "¿Puedo hacer mi evento en cualquier día?", a: "Sí, manejamos eventos de lunes a domingo. Los viernes y sábados son los más solicitados, así que te recomendamos apartar con anticipación." },
              { q: "¿Incluyen la decoración?", a: "Incluimos mesas redondas con mantelería, sillas Tiffany vestidas, iluminación inteligente y la decoración base del salón. Decoración temática personalizada es un servicio adicional." },
              { q: "¿Cuál es la capacidad máxima?", a: "Nuestro salón tiene capacidad para hasta 250 invitados cómodamente. El mínimo es de 100 personas para cualquier paquete." },
              { q: "¿Qué pasa si se va la luz?", a: "Contamos con planta eléctrica propia que se activa automáticamente. Tu evento no se detiene ni un segundo — la música, las luces y todo el servicio siguen sin interrupción. Es una ventaja que muy pocos salones en la zona ofrecen." },
            ].map((faq, i) => (
              <div key={i} className="faq-item">
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className="faq-toggle" style={{ transform: openFaq === i ? "rotate(45deg)" : "none" }}>+</span>
                </button>
                <div className={`faq-answer${openFaq === i ? " open" : ""}`}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram */}
      <section className="section bg-gris">
        <div className="section-narrow">
          <h2 className="section-title reveal">Síguenos en Instagram</h2>
          <p className="section-sub reveal">Descubre más de nuestros eventos y el detrás de cámaras</p>
          <div className="insta-grid reveal">
            {[
              "https://lh3.googleusercontent.com/d/1ULTFHFO50ZyblmQpaEcgfHUSWhaM-Oy3",
              "https://lh3.googleusercontent.com/d/1BLlyoHkWGhy6I0Hp7ZzG2EVe6yEVHm9B",
              "https://lh3.googleusercontent.com/d/1qE0i254xALH01pZuRA4-41pnoKATtwMC",
              "https://lh3.googleusercontent.com/d/13Rdtbkgu1ZGpHdiu9t0KS6lG3OjBN0e_",
              "https://lh3.googleusercontent.com/d/1JH9OgRsPQf0k70Be-2qP1n8BXwT50lKR",
              "https://lh3.googleusercontent.com/d/166Xx50pqnhCd4CkMRwb3BKzsfuYICHpp",
            ].map((src, i) => (
              <a key={i} href="https://www.instagram.com/salon.villaverde/" target="_blank" rel="noopener noreferrer" className="insta-item">
                <img src={src} alt={`Villaverde Instagram ${i + 1}`} />
              </a>
            ))}
          </div>
          <div style={{ textAlign: "center" }} className="reveal">
            <a href="https://www.instagram.com/salon.villaverde/" target="_blank" rel="noopener noreferrer" className="insta-btn">
              Ver más en @salon.villaverde →
            </a>
          </div>
        </div>
      </section>

      {/* Mapa */}
      <section className="section">
        <div className="section-narrow">
          <h2 className="section-title reveal">¿Cómo llegar?</h2>
          <p className="section-sub reveal">
            📍 Carretera México-Cuautla, Km. 35.5, Col. Santa Cruz Amalinalco, Chalco, Edo. de México
          </p>
          <div className="map-container reveal">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3765.974720759722!2d-98.8805715!3d19.2834655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ce1ee02966d737%3A0xc3176ac46d382ee3!2sSal%C3%B3n%20de%20Fiestas%20Villa%20Verde!5e0!3m2!1ses-419!2smx!4v1774235805211!5m2!1ses-419!2smx"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Salón de Fiestas Villaverde"
              style={{ border: 0 }}
            ></iframe>
          </div>
          <p style={{ textAlign: "center", marginTop: "16px", fontSize: "14px" }}>
            <a
              href="https://maps.app.goo.gl/WiNBbqdBas4L6RDt6"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--rosa)", fontWeight: 700 }}
            >
              📍 Ver en Google Maps →
            </a>
          </p>
        </div>
      </section>

      {/* CTA Final */}
      <section className="cta-final" id="contacto">
        <div className="inner">
          <h2>
            En 6 meses esta va a ser
            <br />
            tu fiesta
          </h2>
          <p className="cta-sub">
            Imagina a tus invitados disfrutando aquí. El primer paso es conocerlo.
          </p>
          <div className="cta-anticipo">
            Solo $3,000 separan a tu familia de la fiesta perfecta
          </div>
          <a
            href="https://wa.me/529995485862?text=Hola%2C%20quiero%20agendar%20una%20visita%20al%20Sal%C3%B3n%20Villaverde%20para%20conocerlo.%20%C2%BFQu%C3%A9%20horarios%20tienen%20disponibles%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-wa-big"
            onClick={() => trackLead("cta_final_visita")}
          >
            <WhatsAppIcon size={24} />
            Quiero conocer el salón
          </a>
          <div className="cta-contact">
            📞 WhatsApp: 9995485862 · 📍 Chalco, Estado de México
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="fb-name">
              Villa<span>verde</span>
            </div>
            <p>
              Salón de Fiestas Villaverde
              <br />
              Chalco, Estado de México
              <br />
              WhatsApp: 9995485862
            </p>
          </div>
          <div className="footer-links">
            <h4>Navegación</h4>
            <a href="#inicio">Inicio</a>
            <a href="#paquetes">Paquetes</a>
            <a href="#galeria">Galería</a>
            <a href="#menu">Menú</a>
            <a href="#extras">Extras</a>
            <a href="#contacto">Contacto</a>
          </div>
          <div>
            <h4>Síguenos</h4>
            <div className="footer-social">
              <a href="https://wa.me/529995485862" target="_blank" rel="noopener noreferrer" title="WhatsApp">💬</a>
              <a href="https://www.instagram.com/salon.villaverde/" target="_blank" rel="noopener noreferrer" title="Instagram">📷</a>
              <a href="https://www.facebook.com/SalonVillaVerde/" target="_blank" rel="noopener noreferrer" title="Facebook">👤</a>
            </div>
            <p style={{ fontSize: "12px", marginTop: "16px" }}>
              Visitas con cita previa
            </p>
          </div>
        </div>
        <div className="footer-copy">
          © 2026 Salón de Fiestas Villaverde — Chalco, Estado de México. Todos
          los derechos reservados.
        </div>
      </footer>

      {/* WhatsApp Float */}
      <a
        href="https://wa.me/529995485862?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20paquetes%20para%20mi%20evento"
        target="_blank"
        rel="noopener noreferrer"
        className="wa-float"
        onClick={() => trackLead("wa_float")}
      >
        <WhatsAppIcon size={34} />
      </a>

      {/* Lightbox */}
      {lightboxSrc && (
        <div className="lightbox-overlay" onClick={() => setLightboxSrc(null)}>
          <button className="lightbox-close" onClick={() => setLightboxSrc(null)}>&#x2715;</button>
          <img src={lightboxSrc} alt="Galería Villaverde" className="lightbox-img" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Exit Intent Popup */}
      {showExitPopup && (
        <div className="exit-overlay" onClick={() => setShowExitPopup(false)}>
          <div className="exit-popup" onClick={(e) => e.stopPropagation()}>
            <button className="exit-close" onClick={() => setShowExitPopup(false)}>&#x2715;</button>
            <h3>Antes de irte</h3>
            <p>Te mandamos los paquetes completos y fechas disponibles por WhatsApp. Sin compromiso.</p>
            <a
              href="https://wa.me/529995485862?text=Hola%2C%20vi%20su%20p%C3%A1gina%20y%20me%20interesan%20los%20precios%20y%20fechas%20disponibles"
              target="_blank"
              rel="noopener noreferrer"
              className="exit-cta"
              onClick={() => { trackLead("exit_popup"); setShowExitPopup(false); }}
            >
              Envíame los precios por WhatsApp
            </a>
            <span className="exit-dismiss" onClick={() => setShowExitPopup(false)}>No gracias, solo estaba viendo</span>
          </div>
        </div>
      )}

      {/* Live visitors toast removed - fake social proof hurts trust */}

      {/* Sticky CTA Móvil */}
      {showSticky && (
        <div className="sticky-cta">
          <div className="sticky-cta-inner">
            <div className="sticky-cta-text">
              <strong>Paquetes desde $420/persona</strong>
              Aparta con solo $3,000
            </div>
            <a
              href="https://wa.me/529995485862?text=Hola%2C%20quiero%20cotizar%20mi%20evento%20en%20Villaverde"
              target="_blank"
              rel="noopener noreferrer"
              className="sticky-cta-btn"
              onClick={() => trackLead("sticky_cotizar")}
            >
              <WhatsAppIcon size={18} />
              Cotizar
            </a>
          </div>
        </div>
      )}
    </>
  );
}
