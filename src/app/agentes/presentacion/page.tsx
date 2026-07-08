"use client";

import { useState } from "react";
import ManteleriaVisualizer from "./ManteleriaVisualizer";
import PackagesGrid from "./PackagesGrid";
import AgentSidebar from "./AgentSidebar";
import "./presentacion.css";

// Minimalist icons
function EyeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function PresentationPage() {
  const [activeSection, setActiveSection] = useState("inicio");
  const [agentMode, setAgentMode] = useState(false);

  return (
    <div className="pres-container">
      {/* Header Navigation */}
      <header className="pres-header">
        <div className="pres-logo">
          Villa<span>verde</span>
        </div>
        <nav className="pres-nav">
          <button 
            className={activeSection === "inicio" ? "active" : ""} 
            onClick={() => setActiveSection("inicio")}
          >
            Bienvenida
          </button>
          <button 
            className={activeSection === "visualizador" ? "active" : ""} 
            onClick={() => setActiveSection("visualizador")}
          >
            Tu Evento
          </button>
          <button 
            className={activeSection === "paquetes" ? "active" : ""} 
            onClick={() => setActiveSection("paquetes")}
          >
            Paquetes
          </button>
          <button 
            className={activeSection === "galeria" ? "active" : ""} 
            onClick={() => setActiveSection("galeria")}
          >
            Galería
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="pres-section">
        {activeSection === "inicio" && (
          <div style={{ textAlign: "center", paddingTop: "80px" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "72px", marginBottom: "20px" }}>
              Imagina tu evento <span style={{ color: "var(--rosa-light)", fontStyle: "italic" }}>aquí</span>
            </h1>
            <p style={{ fontSize: "20px", color: "rgba(255,255,255,0.6)", maxWidth: "600px", margin: "0 auto 60px" }}>
              En Salón de Fiestas Villaverde cuidamos cada detalle para que tu única preocupación sea disfrutar.
            </p>
            <div style={{ borderRadius: "24px", overflow: "hidden", maxWidth: "1000px", margin: "0 auto", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
              <img src="https://lh3.googleusercontent.com/d/1wy5kl8jPaljjALel4SMNn3LwDfiNOLBA" alt="Salon Villaverde" style={{ width: "100%", height: "auto" }} />
            </div>
          </div>
        )}

        {activeSection === "visualizador" && (
          <ManteleriaVisualizer />
        )}

        {activeSection === "paquetes" && (
          <PackagesGrid />
        )}

        {activeSection === "galeria" && (
          <div style={{ textAlign: "center", paddingTop: "40px" }}>
             <h2 style={{ fontFamily: "var(--font-display)", fontSize: "48px", marginBottom: "40px", color: "var(--gold-light)" }}>Detalles que enamoran</h2>
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                <img src="https://lh3.googleusercontent.com/d/13Rdtbkgu1ZGpHdiu9t0KS6lG3OjBN0e_" alt="Mesa" style={{ borderRadius: "16px", width: "100%", height: "250px", objectFit: "cover" }} />
                <img src="https://lh3.googleusercontent.com/d/1jRn3R0MimtNoSng13RODuNvFkxty0nhG" alt="Escalera" style={{ borderRadius: "16px", width: "100%", height: "250px", objectFit: "cover" }} />
                <img src="https://lh3.googleusercontent.com/d/166Xx50pqnhCd4CkMRwb3BKzsfuYICHpp" alt="Pista" style={{ borderRadius: "16px", width: "100%", height: "250px", objectFit: "cover" }} />
             </div>
          </div>
        )}
      </main>

      {/* Agent Mode Toggle */}
      <button 
        className="agent-toggle" 
        onClick={() => setAgentMode(!agentMode)}
        aria-label="Toggle Agent Mode"
      >
        <EyeIcon />
      </button>

      {/* Agent Sidebar */}
      <AgentSidebar isOpen={agentMode} onClose={() => setAgentMode(false)} />
    </div>
  );
}
