"use client";

import { useState } from "react";

const COLORS = [
  { id: "rosa", name: "Rosa Imperial", hex: "#DB2777", filter: "sepia(1) hue-rotate(290deg) saturate(3) brightness(0.8)" },
  { id: "dorado", name: "Dorado Champagne", hex: "#CA8A04", filter: "sepia(1) hue-rotate(10deg) saturate(3) brightness(0.9)" },
  { id: "esmeralda", name: "Verde Esmeralda", hex: "#059669", filter: "sepia(1) hue-rotate(110deg) saturate(2) brightness(0.7)" },
  { id: "blanco", name: "Blanco Perla", hex: "#FDF2F8", filter: "grayscale(1) brightness(1.2)" },
];

export default function ManteleriaVisualizer() {
  const [activeColor, setActiveColor] = useState(COLORS[0]);

  return (
    <div className="visualizer-container">
      <div className="visualizer-main">
        {/* Base Image */}
        <img 
          src="https://lh3.googleusercontent.com/d/13Rdtbkgu1ZGpHdiu9t0KS6lG3OjBN0e_" 
          alt="Montaje de Salón"
          className="visualizer-image"
          style={{ filter: activeColor.filter }}
        />
        
        {/* Overlay gradient for depth */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%)",
          pointerEvents: "none"
        }}></div>

        <div style={{
          position: "absolute",
          bottom: "32px",
          left: "32px",
          color: "white"
        }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "36px", margin: 0 }}>
            {activeColor.name}
          </h3>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", margin: 0 }}>
            Selección actual de mantelería e iluminación
          </p>
        </div>
      </div>

      <div className="visualizer-controls">
        <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px", color: "white" }}>
          Personaliza tu montaje
        </h3>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginBottom: "24px" }}>
          Toca un color para visualizar cómo luciría el salón el día de tu evento.
        </p>

        <div className="color-grid">
          {COLORS.map(color => (
            <button
              key={color.id}
              className={`color-swatch ${activeColor.id === color.id ? "active" : ""}`}
              style={{ backgroundColor: color.hex }}
              onClick={() => setActiveColor(color)}
              aria-label={`Seleccionar color ${color.name}`}
            />
          ))}
        </div>

        <div style={{ marginTop: "40px", padding: "16px", background: "rgba(219,39,119,0.1)", borderRadius: "12px", border: "1px solid rgba(219,39,119,0.3)" }}>
          <p style={{ fontSize: "13px", color: "var(--rosa-light)", margin: 0, lineHeight: 1.5 }}>
            <strong>Nota:</strong> Los paquetes Diamante y Esmeralda incluyen la elección de mantelería premium sin costo extra.
          </p>
        </div>
      </div>
    </div>
  );
}
