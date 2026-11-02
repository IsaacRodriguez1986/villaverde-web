"use client";

import { AttributedWhatsAppLink } from "./whatsapp-attribution";

import Image from "next/image";
import { WHATSAPP_DATE_URL } from "./contact";
import styles from "./cinematic-hero.module.css";

interface CinematicHeroProps {
  onContact?: (placement: string) => void;
}

function WhatsAppMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2a9.84 9.84 0 0 0-8.5 14.8L2 22l5.35-1.4A9.9 9.9 0 1 0 12.04 2Zm0 17.78a7.8 7.8 0 0 1-3.97-1.09l-.28-.17-3.17.83.85-3.08-.19-.3a7.85 7.85 0 1 1 6.76 3.81Zm4.3-5.88c-.24-.12-1.4-.69-1.62-.76-.21-.08-.37-.12-.52.12-.16.23-.61.76-.75.92-.13.16-.27.18-.5.06-.24-.12-1-.37-1.9-1.17-.7-.62-1.17-1.39-1.3-1.62-.14-.24-.02-.36.1-.48.1-.1.24-.27.36-.41.12-.14.15-.24.23-.4.08-.15.04-.29-.02-.4-.06-.12-.53-1.29-.73-1.76-.19-.46-.38-.4-.52-.4h-.45c-.16 0-.4.05-.61.29-.22.23-.81.79-.81 1.92 0 1.13.83 2.22.95 2.38.12.15 1.63 2.48 3.95 3.48.55.24.98.38 1.32.49.55.17 1.05.15 1.45.09.44-.07 1.37-.56 1.57-1.1.2-.54.2-1 .14-1.1-.06-.1-.22-.16-.45-.28Z" />
    </svg>
  );
}

function HeroPhoto() {
  return (
    <div className={styles.photograph}>
      <Image
        src="https://gfbixkddumsqlfrfbsmp.supabase.co/storage/v1/object/public/landing/panoramica.webp"
        alt="Montaje real del Salón Villaverde, con mesas vestidas, candiles y espacio para celebrar"
        fill
        loading="eager"
        fetchPriority="high"
        sizes="100vw"
        className={styles.image}
      />
    </div>
  );
}

function HeroActions({ onContact }: CinematicHeroProps) {
  return (
    <div className={styles.actions}>
      <AttributedWhatsAppLink
        className={styles.primary}
        href={WHATSAPP_DATE_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onContact?.("hero")}
      >
        <WhatsAppMark /> Consultar mi fecha
        <span aria-hidden="true">↗</span>
      </AttributedWhatsAppLink>
      <a className={styles.secondary} href="#paquetes">
        Ver paquetes <span aria-hidden="true">↓</span>
      </a>
    </div>
  );
}

export function CinematicHero({ onContact }: CinematicHeroProps) {
  return (
    <section className={styles.hero} id="inicio" aria-labelledby="landing-title">
      <HeroPhoto />
      <div className={styles.content}>
        <p className={styles.location}>Villaverde · Chalco, Estado de México</p>
        <h1 className={styles.title} id="landing-title">
          Tu gran día,
          <span>con todo resuelto.</span>
        </h1>
        <p className={styles.description}>
          Tú disfruta el momento. Nosotros ponemos el lugar, el banquete y el ambiente.
        </p>
        <p className={styles.price}>
          Desde <strong>$420</strong> por persona
          <span>Mínimo 150 invitados · Paquetes todo incluido</span>
        </p>
        <HeroActions onContact={onContact} />
      </div>
      <div className={styles.footnote}>
        <p>Bodas <span aria-hidden="true">/</span> XV años <span aria-hidden="true">/</span> Graduaciones</p>
        <a href="#experiencia">Conoce el lugar <span aria-hidden="true">↓</span></a>
      </div>
    </section>
  );
}
