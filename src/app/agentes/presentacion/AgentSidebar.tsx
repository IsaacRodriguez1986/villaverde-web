"use client";

import { useState } from "react";

interface AgentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AgentSidebar({ isOpen, onClose }: AgentSidebarProps) {
  const [invitados, setInvitados] = useState<number>(150);
  const [paquete, setPaquete] = useState<number>(530); // Diamante by default

  const total = invitados * paquete;
  const anticipo = 3000;
  const resto = total - anticipo;

  return (
    <div className={`agent-sidebar ${isOpen ? "open" : ""}`}>
      <button 
        onClick={onClose}
        style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "white", fontSize: "24px", cursor: "pointer" }}
      >
        ×
      </button>

      <h3 className="agent-title">Modo Agente</h3>

      <div className="agent-box">
        <h4>Calculadora Rápida</h4>
        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
            Número de Invitados
          </label>
          <input 
            type="number" 
            className="agent-input" 
            value={invitados} 
            onChange={(e) => setInvitados(Number(e.target.value))}
            min={100}
            step={10}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
            Paquete Elegido
          </label>
          <select 
            className="agent-input" 
            value={paquete} 
            onChange={(e) => setPaquete(Number(e.target.value))}
          >
            <option value={420}>Premium ($420 - 150+)</option>
            <option value={470}>Premium ($470 - 100-149)</option>
            <option value={530}>Diamante ($530)</option>
            <option value={680}>Esmeralda ($680)</option>
          </select>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "14px", color: "white" }}>Total Evento:</span>
          <span className="agent-calc-result">${total.toLocaleString()}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>A liquidar (- $3,000):</span>
          <span style={{ fontSize: "14px", color: "var(--gold-light)", fontWeight: 700 }}>${resto.toLocaleString()}</span>
        </div>
      </div>

      <div className="agent-box">
        <h4>Manejo de Objeciones</h4>
        <details style={{ marginBottom: "8px" }}>
          <summary style={{ cursor: "pointer", color: "white", fontSize: "14px", fontWeight: 600 }}>"Está muy caro"</summary>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginTop: "8px", lineHeight: 1.4 }}>
            "Señora, considere que nuestro paquete ya incluye Grupo, Robot y Descorche. Si renta el salón barato y contrata todo por fuera, le va a salir al menos $15,000 más caro y tendrá que lidiar con 5 proveedores diferentes."
          </p>
        </details>
        <details>
          <summary style={{ cursor: "pointer", color: "white", fontSize: "14px", fontWeight: 600 }}>"Lo voy a pensar"</summary>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginTop: "8px", lineHeight: 1.4 }}>
            "Claro que sí, solo le recuerdo que las fechas de {new Date().getFullYear()} se están yendo rápido. Con solo $3,000 hoy podemos bloquear su fecha en sistema y congelar el precio actual."
          </p>
        </details>
      </div>

      <div className="agent-box" style={{ borderColor: "rgba(219,39,119,0.3)", background: "rgba(219,39,119,0.05)" }}>
        <h4 style={{ color: "var(--rosa-light)" }}>Gatillos de Cierre</h4>
        <ul style={{ paddingLeft: "16px", color: "white", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
          <li>Enfatiza el <strong>Descorche Libre</strong> (ahorro enorme).</li>
          <li>Menciona los <strong>2 camerinos</strong> exclusivos.</li>
          <li>Recuerda la urgencia de apartar fecha.</li>
        </ul>
      </div>

    </div>
  );
}
