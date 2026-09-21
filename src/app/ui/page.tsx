import { notFound } from "next/navigation";
import "./ui-kit.css";

const swatches = [
  ["Rosa", "#db2777"], ["Rosa oscuro", "#9d174d"], ["Esmeralda", "#047857"],
  ["Dorado", "#a16207"], ["Texto", "#111827"], ["Crema", "#fdf2f8"],
];

export default function UiKitPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="ui-shell">
      <header className="ui-hero">
        <p>Villaverde · sistema visual</p>
        <h1>UI Kit operativo</h1>
        <span>Referencia de desarrollo para mantener landing, CRM y nuevas rutas consistentes.</span>
      </header>
      <section><h2>Color</h2><div className="ui-swatches">{swatches.map(([name, color]) => (
        <div className="ui-swatch" key={name}><i style={{ background: color }} /><strong>{name}</strong><code>{color}</code></div>
      ))}</div></section>
      <section><h2>Tipografía</h2><div className="ui-type"><h3>Una celebración que sí se siente tuya</h3><p>Texto claro para explicar precios, condiciones y el siguiente paso.</p></div></section>
      <section><h2>Acciones</h2><div className="ui-row"><button className="ui-primary">Cotizar por WhatsApp</button><button className="ui-secondary">Ver paquetes</button><button className="ui-disabled" disabled>No disponible</button></div></section>
      <section><h2>Tarjeta comercial</h2><article className="ui-card"><small>Más popular</small><h3>Diamante</h3><p>Grupo en vivo, pantalla LED y siete horas de evento.</p><strong>$530 por persona</strong><button className="ui-primary">Consultar fecha</button></article></section>
      <section><h2>Estados</h2><div className="ui-states"><p className="ok">Guardado correctamente</p><p className="warning">La cotización no reserva la fecha</p><p className="error">No pudimos enviar la solicitud</p></div></section>
    </main>
  );
}
