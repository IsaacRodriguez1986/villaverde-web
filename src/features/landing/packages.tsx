"use client";

import { COMPARISON_ROWS, PACKAGES, type PackagePlan } from "./package-data";
import styles from "./packages.module.css";

interface PackagesProps {
  onContact?: (placement: string) => void;
}

interface PackageCardProps extends PackagesProps {
  plan: PackagePlan;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m5 10 3.2 3.2L15 6.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PackageHeading({ plan }: { plan: PackagePlan }) {
  return (
    <header className={styles.cardHeader}>
      <p className={styles.cardLabel}>
        {plan.id === "diamante" ? "Música en vivo y espectáculo" : "Todo incluido"}
      </p>
      <h3 id={`nombre-${plan.id}`} className={styles.packageName}>{plan.name}</h3>
      <p className={styles.description}>{plan.description}</p>
      <p className={styles.price}>
        <span>${plan.price}</span>
        <span className={styles.priceUnit}>MXN / persona</span>
      </p>
      <p className={styles.minimum}>Desde {plan.minimumGuests} invitados</p>
      <div className={styles.duration}>
        <strong>{plan.totalHours} horas totales</strong>
        <span>{plan.eventHours} de evento + 30 min de recepción + 30 min de desalojo</span>
      </div>
    </header>
  );
}

function PackageDetails({ plan }: { plan: PackagePlan }) {
  return (
    <details className={styles.details}>
      <summary>
        <span>Ver todo lo que incluye</span>
        <ChevronIcon />
      </summary>
      <ul className={styles.fullFeatures}>
        <li>{plan.totalHours} horas totales: {plan.eventHours} de evento + 30 min de recepción + 30 min de desalojo</li>
        {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
        <li>{plan.courtesies}</li>
      </ul>
    </details>
  );
}

function PackageContact({ plan, onContact }: PackageCardProps) {
  const message = `Hola, quiero consultar disponibilidad de fecha con el Paquete ${plan.name.toUpperCase()} de Villaverde.`;
  return (
    <a
      className={styles.contact}
      href={`https://wa.me/529995485862?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onContact?.(`paquete_${plan.id}`)}
    >
      Consultar fecha — {plan.name}
      <span aria-hidden="true">↗</span>
    </a>
  );
}

function PackageCard({ plan, onContact }: PackageCardProps) {
  const cardClass = plan.id === "diamante" ? `${styles.card} ${styles.featured}` : styles.card;
  return (
    <article id={`paquete-${plan.id}`} className={cardClass} aria-labelledby={`nombre-${plan.id}`}>
      <PackageHeading plan={plan} />
      <ul className={styles.highlights}>
        {plan.highlights.map((highlight) => (
          <li key={highlight}><CheckIcon /><span>{highlight}</span></li>
        ))}
      </ul>
      <PackageContact plan={plan} onContact={onContact} />
      <PackageDetails plan={plan} />
    </article>
  );
}

function PackageComparison() {
  return (
    <details className={styles.comparison}>
      <summary>
        <span>Comparar los tres paquetes</span>
        <ChevronIcon />
      </summary>
      <p className={styles.tableHint}>En pantallas pequeñas puedes deslizar la tabla para ver los tres paquetes.</p>
      <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Comparativa de paquetes de Villaverde">
        <table>
          <caption>Servicios, precios y mínimos por paquete</caption>
          <thead>
            <tr>
              <th scope="col">Característica</th>
              {PACKAGES.map((plan) => <th scope="col" key={plan.id}>{plan.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {row.values.map((value, index) => <td key={`${row.label}-${PACKAGES[index].id}`}>{value}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

export function Packages({ onContact }: PackagesProps) {
  return (
    <section id="paquetes" className={styles.section} aria-labelledby="paquetes-title">
      <div className={styles.inner}>
        <header className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Paquetes todo incluido</p>
          <h2 id="paquetes-title">Tu celebración, a tu manera.</h2>
          <p>Compara invitados, duración y servicios para elegir cómo quieres celebrar en Villaverde.</p>
        </header>
        <div className={styles.grid}>
          {PACKAGES.map((plan) => <PackageCard key={plan.id} plan={plan} onContact={onContact} />)}
        </div>
        <div className={styles.conditions}>
          <p>Premium desde 150 invitados · Diamante desde 170 · Esmeralda desde 200</p>
          <p><strong>Reserva con contrato y $3,000 de anticipo.</strong> La cotización no reserva la fecha.</p>
        </div>
        <PackageComparison />
      </div>
    </section>
  );
}
