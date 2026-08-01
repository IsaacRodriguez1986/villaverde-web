"use client";

import { useState } from "react";

function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function PackagesGrid() {
  return (
    <div className="pres-packages">
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "48px", color: "white", marginBottom: "10px" }}>
          Nuestros Paquetes
        </h2>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "18px" }}>
          Todo incluido para que solo llegues a disfrutar
        </p>
      </div>

      <div className="pkg-grid">
        {/* Premium */}
        <div className="pkg pkg-premium">
          <div className="pkg-head">
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
            <div className="pkg-feat"><span className="ck"><IconCheck /></span> 6 horas totales</div>
            <div className="pkg-feat"><span className="ck"><IconCheck /></span> Cena formal de 3 tiempos</div>
            <div className="pkg-feat"><span className="ck"><IconCheck /></span> Refresco y hielo ilimitado</div>
            <div className="pkg-feat hi"><span className="ck"><IconCheck /></span> Descorche libre</div>
            <div className="pkg-feat"><span className="ck"><IconCheck /></span> DJ + Iluminación</div>
            <div className="pkg-cort">1 cortesía a elegir</div>
          </div>
        </div>

        {/* Diamante */}
        <div className="pkg pkg-diamante">
          <div className="pkg-badge">Más Elegido</div>
          <div className="pkg-head">
            <div className="pkg-name">Diamante</div>
            <div className="pkg-tag">El paquete estrella de Villaverde</div>
          </div>
          <div className="pkg-prices single">
            <div className="pkg-price-box">
              <div className="pkg-price-label">Desde 150 inv.</div>
              <div className="pkg-price-num">$530</div>
              <div className="pkg-price-unit">por persona</div>
            </div>
          </div>
          <div className="pkg-body">
            <h4>Todo lo del Premium más</h4>
            <div className="pkg-feat hi"><span className="ck"><IconCheck /></span> 7 horas totales (+1 hr)</div>
            <div className="pkg-feat hi"><span className="ck"><IconCheck /></span> Grupo versátil (5 int.)</div>
            <div className="pkg-feat"><span className="ck"><IconCheck /></span> Pantalla gigante LED</div>
            <div className="pkg-feat hi"><span className="ck"><IconCheck /></span> Chilaquiles de madrugada</div>
            <div className="pkg-cort">2 cortesías a elegir</div>
          </div>
        </div>

        {/* Esmeralda */}
        <div className="pkg pkg-esmeralda">
          <div className="pkg-head">
            <div className="pkg-name">Esmeralda</div>
            <div className="pkg-tag">La fiesta perfecta sin límites</div>
          </div>
          <div className="pkg-prices single">
            <div className="pkg-price-box">
              <div className="pkg-price-label">Desde 150 inv.</div>
              <div className="pkg-price-num">$680</div>
              <div className="pkg-price-unit">por persona</div>
            </div>
          </div>
          <div className="pkg-body">
            <h4>Todo lo del Diamante más</h4>
            <div className="pkg-feat hi"><span className="ck"><IconCheck /></span> 8 horas totales</div>
            <div className="pkg-feat hi"><span className="ck"><IconCheck /></span> Grupo versátil 9 int.</div>
            <div className="pkg-feat"><span className="ck"><IconCheck /></span> Cabina foto 360 (1 hr)</div>
            <div className="pkg-feat hi"><span className="ck"><IconCheck /></span> Show de robot</div>
            <div className="pkg-cort">Todas las cortesías</div>
          </div>
        </div>
      </div>
    </div>
  );
}
