"use client";

import { useEffect, useState } from "react";

/* ===== SVG ICON COMPONENTS ===== */

function WhatsAppIcon({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function IconCheck({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconChevronDown({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconChevronLeft({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function IconChevronRight({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function IconX({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconMenu({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconStar({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconZoomIn({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

/* Lucide-style icons for sections */
function IconBuilding({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" />
    </svg>
  );
}

function IconTrees({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 10v.2A3 3 0 0 1 8.9 16v0H5v0h0a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z" /><path d="M7 16v6" /><path d="M13 19v3" /><path d="M16 13v.2A3 3 0 0 1 14.9 19v0H11v0h0a3 3 0 0 1-1-5.8V13a3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function IconDiamond({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z" />
    </svg>
  );
}

function IconGift({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

function IconSmartphone({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function IconShieldCheck({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function IconSparkles({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
  );
}

function IconMusic({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function IconMapPin({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconPhone({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconInstagram({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function IconFacebook({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  );
}

/* Extras section icons */
function IconLightbulb({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" />
    </svg>
  );
}

function IconPartyPopper({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.8 11.3 2 22l10.7-3.79" /><path d="M4 3h.01" /><path d="M22 8h.01" /><path d="M15 2h.01" /><path d="M22 20h.01" /><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" /><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17" /><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7" />
    </svg>
  );
}

function IconCamera({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function IconMonitor({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function IconDroplets({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" /><path d="M12.56 14.69c1.47 0 2.67-1.23 2.67-2.71 0-.78-.38-1.51-1.14-2.13-.76-.63-1.39-1.37-1.53-2.35-.14.98-.77 1.72-1.53 2.35-.76.62-1.14 1.35-1.14 2.13 0 1.48 1.2 2.71 2.67 2.71z" /><path d="M17 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S17.29 6.75 17 5.3c-.29 1.45-1.14 2.84-2.29 3.76S13 11.1 13 12.25c0 2.22 1.8 4.05 4 4.05z" />
    </svg>
  );
}

function IconType({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  );
}

function IconVideo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function IconChurch({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 7 4 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9l4-2" /><path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" /><path d="M18 22V5l-6-3-6 3v17" /><path d="M12 7v5" /><path d="M10 9h4" />
    </svg>
  );
}

function IconUtensils({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}

function IconClock({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconBot({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
    </svg>
  );
}

function IconMic({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function IconDrum({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 2 8 8" /><path d="m22 2-8 8" /><ellipse cx="12" cy="14" rx="10" ry="4" /><path d="M2 14v4c0 2.2 4.5 4 10 4s10-1.8 10-4v-4" />
    </svg>
  );
}

function IconGuitar({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m20 7 1.7-1.7a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0L17 4" /><path d="m17 4-5.1 5.1" /><circle cx="11.5" cy="12.5" r="6.5" /><path d="M12 12v.5" />
    </svg>
  );
}

function IconWine({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 22h8" /><path d="M7 10h10" /><path d="M12 15v7" /><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z" />
    </svg>
  );
}

/* Cortesias icons */
function IconFerrisWheel({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" /><path d="M12 2v4" /><path d="M12 18v4" /><path d="m4.93 4.93 2.83 2.83" /><path d="m16.24 16.24 2.83 2.83" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="m4.93 19.07 2.83-2.83" /><path d="m16.24 7.76 2.83-2.83" />
    </svg>
  );
}

function IconFlower({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3a4.5 4.5 0 1 0 4.5 4.5M7.5 12H9m7.5 0a4.5 4.5 0 1 1-4.5 4.5m4.5-4.5H15m-3 4.5V15" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/* ===== DATA ===== */

const testimonials = [
  {
    text: "El salón está hermoso, muy limpio y con un ambiente súper agradable. Celebramos los XV de mi hija y todos quedaron encantados con la atención. Recomendadísimo!",
    author: "Laura Méndez",
    event: "XV Años",
    initials: "LM",
  },
  {
    text: "Hicimos nuestra boda aquí y fue todo lo que soñamos. El paquete Diamante incluye todo, no tuvimos que preocuparnos por nada. El grupo en vivo estuvo increíble.",
    author: "Carlos y Ana García",
    event: "Boda",
    initials: "CG",
  },
  {
    text: "La atención desde el primer momento fue excelente. Nos ayudaron a personalizar todo para la graduación de mi hijo. Los jardines son perfectos para las fotos.",
    author: "Patricia Hernández",
    event: "Graduación",
    initials: "PH",
  },
  {
    text: "Segundo evento que hacemos en Villaverde y no nos cambiamos por nada. El descorche libre es un ahorro enorme y la comida siempre está deliciosa.",
    author: "Familia Rodríguez",
    event: "XV Años",
    initials: "FR",
  },
  {
    text: "Comparamos con otros 5 salones en Chalco y Villaverde fue el mejor en relación calidad-precio. Las cortesías son un detalle que nadie más ofrece.",
    author: "Mariana López",
    event: "Boda",
    initials: "ML",
  },
];

const galleryImages = [
  { src: "https://lh3.googleusercontent.com/d/1ULTFHFO50ZyblmQpaEcgfHUSWhaM-Oy3", alt: "Fachada del Salón de Fiestas Villaverde en Chalco estilo hacienda", className: "wide" },
  { src: "https://lh3.googleusercontent.com/d/1BLlyoHkWGhy6I0Hp7ZzG2EVe6yEVHm9B", alt: "Interior del salón Villaverde decorado para evento en Chalco", className: "" },
  { src: "https://lh3.googleusercontent.com/d/1qE0i254xALH01pZuRA4-41pnoKATtwMC", alt: "Jardines con fuente del salón para bodas y XV años en Chalco", className: "tall" },
  { src: "https://lh3.googleusercontent.com/d/13Rdtbkgu1ZGpHdiu9t0KS6lG3OjBN0e_", alt: "Montaje de mesas elegantes para banquete en salón Villaverde", className: "" },
  { src: "https://lh3.googleusercontent.com/d/1JH9OgRsPQf0k70Be-2qP1n8BXwT50lKR", alt: "Decoración elegante para boda en salón de fiestas Chalco", className: "" },
  { src: "https://lh3.googleusercontent.com/d/1wy5kl8jPaljjALel4SMNn3LwDfiNOLBA", alt: "Vista panorámica del Salón de Fiestas Villaverde capacidad hasta 450 personas", className: "wide" },
  { src: "https://lh3.googleusercontent.com/d/166Xx50pqnhCd4CkMRwb3BKzsfuYICHpp", alt: "Pista LED iluminada para XV años en salón Villaverde Chalco", className: "" },
  { src: "https://lh3.googleusercontent.com/d/1jRn3R0MimtNoSng13RODuNvFkxty0nhG", alt: "Escalera principal del salón para fotos de quinceañera en Chalco", className: "" },
];

/* ===== COMPONENT ===== */

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("entradas");
  const [currentTesti, setCurrentTesti] = useState(0);
  const [showSticky, setShowSticky] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    const handleScroll = () => {
      setShowSticky(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const testiInterval = setInterval(() => {
      setCurrentTesti((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      clearInterval(testiInterval);
    };
  }, []);

  // Lightbox keyboard nav
  useEffect(() => {
    if (lightboxIdx === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") setLightboxIdx((prev) => (prev! + 1) % galleryImages.length);
      if (e.key === "ArrowLeft") setLightboxIdx((prev) => (prev! - 1 + galleryImages.length) % galleryImages.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightboxIdx]);

  return (
    <>
      {/* Promo Bar */}
      <div className="promo-bar">
        Nuevos Paquetes 2026 — Aparta tu fecha con solo $3,000{" "}
        <a
          href="https://wa.me/529995485862?text=Quiero%20apartar%20mi%20fecha%202026%20en%20Villaverde"
          target="_blank"
          rel="noopener noreferrer"
        >
          APARTAR AHORA →
        </a>
      </div>

      {/* Nav */}
      <nav className="nav">
        <a href="#inicio" className="nav-logo">
          Villa<span>verde</span>
        </a>
        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú">
          {menuOpen ? <IconX size={24} /> : <IconMenu size={24} />}
        </button>
        <div className={`nav-links${menuOpen ? " open" : ""}`}>
          <a href="#inicio" onClick={() => setMenuOpen(false)}>Inicio</a>
          <a href="#paquetes" onClick={() => setMenuOpen(false)}>Paquetes</a>
          <a href="#galeria" onClick={() => setMenuOpen(false)}>Galería</a>
          <a href="#menu" onClick={() => setMenuOpen(false)}>Menú</a>
          <a href="#extras" onClick={() => setMenuOpen(false)}>Extras</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
          <a href="#contacto" onClick={() => setMenuOpen(false)}>Contacto</a>
          <a
            href="https://wa.me/529995485862?text=Hola%2C%20quiero%20cotizar%20mi%20evento%20en%20Villaverde"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-cta"
          >
            Cotizar Gratis
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" id="inicio">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="hero-badge">Nuevos Paquetes 2026</div>
          <h1>
            Tu fiesta <strong className="accent-rosa">perfecta</strong> sin{" "}
            <strong className="accent-verde">preocuparte por nada</strong>
          </h1>
          <p className="hero-sub">
            Salón de Fiestas todo incluido en Chalco · Bodas, XV Años y Graduaciones
          </p>
          <div className="hero-pills">
            <span className="hero-pill"><IconCheck size={14} /> Todo incluido</span>
            <span className="hero-pill"><IconCheck size={14} /> Desde $420/persona</span>
            <span className="hero-pill"><IconCheck size={14} /> Cortesías exclusivas</span>
          </div>
          <div className="hero-btns">
            <a
              href="https://wa.me/529995485862?text=Hola%2C%20quiero%20apartar%20mi%20fecha%20en%20Villaverde"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <WhatsAppIcon size={18} /> Aparta tu fecha hoy
            </a>
            <a href="#paquetes" className="btn-outline">
              Ver paquetes desde $420/persona <IconChevronDown size={16} />
            </a>
          </div>
        </div>
        <div className="hero-scroll">
          Scroll
          <IconChevronDown size={20} />
        </div>
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
          <div className="proof-num">450</div>
          <div className="proof-label">Capacidad de invitados</div>
        </div>
        <div className="proof-item">
          <div className="proof-num">4.8</div>
          <div className="proof-label">Calificación Google</div>
        </div>
      </div>

      {/* Eventos */}
      <section className="section reveal">
        <div className="section-narrow">
          <h2 className="section-title">
            Celebramos los momentos<br />más importantes de tu vida
          </h2>
          <p className="section-sub"></p>
          <div className="events-grid">
            <a href="#paquetes" className="event-card">
              <img src="https://lh3.googleusercontent.com/d/13fdfyk_4KgzeFUbmc02tqNMOewdHiIO1" alt="Fiesta de XV años en Salón de Fiestas Villaverde Chalco" />
              <div className="event-overlay">
                <h3>XV Años</h3>
                <p>La fiesta que siempre soñaste</p>
                <span className="ev-btn">Ver paquetes <IconChevronRight size={14} /></span>
              </div>
            </a>
            <a href="#paquetes" className="event-card">
              <img src="https://lh3.googleusercontent.com/d/1gPY-XRFHFsPyvlnDg2NSYlPP6-ubOuqb" alt="Salón para bodas todo incluido en Chalco Estado de México" />
              <div className="event-overlay">
                <h3>Bodas</h3>
                <p>El día más especial merece el lugar perfecto</p>
                <span className="ev-btn">Ver paquetes <IconChevronRight size={14} /></span>
              </div>
            </a>
            <a href="#paquetes" className="event-card">
              <img src="https://lh3.googleusercontent.com/d/1BAzHGdTpbbc2Gk8Z6wKrtp421A1ZbR59" alt="Fiesta de graduación en salón de fiestas Villaverde Chalco" />
              <div className="event-overlay">
                <h3>Graduaciones</h3>
                <p>Celebra tu logro a lo grande</p>
                <span className="ev-btn">Ver paquetes <IconChevronRight size={14} /></span>
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
            Tres niveles diseñados para que tu fiesta sea exactamente como la soñaste. Sin costos ocultos, sin sorpresas.
          </p>
          <div className="pkg-grid">
            {/* Premium */}
            <div className="pkg pkg-premium reveal">
              <div className="pkg-head">
                <div className="pkg-icon"><IconSparkles size={28} /></div>
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
                <div className="pkg-feat"><span className="ck"><IconCheck size={10} /></span> 6 horas de evento + recepción y desalojo</div>
                <div className="pkg-feat"><span className="ck"><IconCheck size={10} /></span> Cena formal de 3 tiempos (crema + plato fuerte + guarnición)</div>
                <div className="pkg-feat"><span className="ck"><IconCheck size={10} /></span> Refresco y hielo ilimitado todo el evento</div>
                <div className="pkg-feat hi"><span className="ck"><IconCheck size={10} /></span> Descorche libre — trae tus bebidas sin cargo</div>
                <div className="pkg-feat hi"><span className="ck"><IconCheck size={10} /></span> Botella ¾ por mesa incluida</div>
                <div className="pkg-feat"><span className="ck"><IconCheck size={10} /></span> Mesas redondas + sillas Tiffany vestidas (colores básicos)</div>
                <div className="pkg-feat"><span className="ck"><IconCheck size={10} /></span> Meseros con capitán + personal de recepción</div>
                <div className="pkg-feat"><span className="ck"><IconCheck size={10} /></span> DJ todo el evento + Maestro de Ceremonias</div>
                <div className="pkg-feat"><span className="ck"><IconCheck size={10} /></span> Iluminación inteligente tipo antro</div>
                <div className="pkg-feat"><span className="ck"><IconCheck size={10} /></span> Batucada con globos</div>
                <div className="pkg-feat"><span className="ck"><IconCheck size={10} /></span> 2 camerinos privados (XV/novios + chambelanes)</div>
                <div className="pkg-feat"><span className="ck"><IconCheck size={10} /></span> Estacionamiento amplio</div>
                <div className="pkg-feat"><span className="ck"><IconCheck size={10} /></span> Invitación digital animada de regalo</div>
                <div className="pkg-cort"><IconGift size={16} /> 1 cortesía a elegir de nuestra lista exclusiva</div>
              </div>
              <a href="https://wa.me/529995485862?text=Hola%2C%20quiero%20apartar%20mi%20fecha%20con%20el%20Paquete%20PREMIUM" target="_blank" rel="noopener noreferrer" className="pkg-btn">
                Apartar fecha — Premium
              </a>
            </div>

            {/* Diamante */}
            <div className="pkg pkg-diamante reveal">
              <div className="pkg-head">
                <div className="pkg-badge">Más Popular</div>
                <div className="pkg-icon"><IconDiamond size={28} /></div>
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
                <div className="pkg-feat hi"><span className="ck"><IconCheck size={10} /></span> 7 horas de evento (1 hora extra)</div>
                <div className="pkg-feat hi"><span className="ck"><IconCheck size={10} /></span> Grupo versátil en vivo (5 integrantes)</div>
                <div className="pkg-feat"><span className="ck"><IconCheck size={10} /></span> Cabina profesional para DJ con iluminación</div>
                <div className="pkg-feat hi"><span className="ck"><IconCheck size={10} /></span> Pantalla gigante LED</div>
                <div className="pkg-feat"><span className="ck"><IconCheck size={10} /></span> Descargas de CO2 espectaculares</div>
                <div className="pkg-feat hi"><span className="ck"><IconCheck size={10} /></span> Chilaquiles de madrugada</div>
                <div className="pkg-feat"><span className="ck"><IconCheck size={10} /></span> Colores de mantelería a elegir</div>
                <div className="pkg-cort"><IconGift size={16} /><IconGift size={16} /> 2 cortesías a elegir de nuestra lista exclusiva</div>
              </div>
              <a href="https://wa.me/529995485862?text=Hola%2C%20quiero%20apartar%20mi%20fecha%20con%20el%20Paquete%20DIAMANTE" target="_blank" rel="noopener noreferrer" className="pkg-btn">
                Apartar fecha — Diamante
              </a>
            </div>

            {/* Esmeralda */}
            <div className="pkg pkg-esmeralda reveal">
              <div className="pkg-head">
                <div className="pkg-badge">La joya de la corona</div>
                <div className="pkg-icon"><IconSparkles size={28} /></div>
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
                <div className="pkg-feat hi"><span className="ck"><IconCheck size={10} /></span> 8 horas de evento (2 horas extra)</div>
                <div className="pkg-feat hi"><span className="ck"><IconCheck size={10} /></span> Grupo versátil de 9 integrantes</div>
                <div className="pkg-feat hi"><span className="ck"><IconCheck size={10} /></span> Pista LED iluminada completa</div>
                <div className="pkg-feat hi"><span className="ck"><IconCheck size={10} /></span> Show de robot con pirotecnia</div>
                <div className="pkg-feat"><span className="ck"><IconCheck size={10} /></span> Cabina fotográfica 360 (1 hora)</div>
                <div className="pkg-feat"><span className="ck"><IconCheck size={10} /></span> Letras gigantes luminosas XV o BODA</div>
                <div className="pkg-feat"><span className="ck"><IconCheck size={10} /></span> Cascada de flores en escalera</div>
                <div className="pkg-feat"><span className="ck"><IconCheck size={10} /></span> Arco de flores artificiales</div>
                <div className="pkg-feat"><span className="ck"><IconCheck size={10} /></span> Cóctel de bienvenida</div>
                <div className="pkg-feat"><span className="ck"><IconCheck size={10} /></span> Cantante durante la cena</div>
                <div className="pkg-feat"><span className="ck"><IconCheck size={10} /></span> Iluminación LED en cada mesa</div>
                <div className="pkg-feat"><span className="ck"><IconCheck size={10} /></span> Menú premium personalizado</div>
                <div className="pkg-cort"><IconGift size={16} /> TODAS las cortesías incluidas sin límite</div>
              </div>
              <a href="https://wa.me/529995485862?text=Hola%2C%20quiero%20apartar%20mi%20fecha%20con%20el%20Paquete%20ESMERALDA" target="_blank" rel="noopener noreferrer" className="pkg-btn">
                Apartar fecha — Esmeralda
              </a>
            </div>
          </div>

          {/* Tabla Comparativa */}
          <div className="compare-section reveal">
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, textAlign: "center", marginBottom: "24px" }}>
              Comparativa rápida
            </h3>
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Característica</th>
                  <th>Premium</th>
                  <th>Diamante</th>
                  <th>Esmeralda</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Horas de evento</td><td>7h</td><td>8h</td><td>10h</td></tr>
                <tr><td>Precio desde</td><td>$420/pp</td><td>$530/pp</td><td>$680/pp</td></tr>
                <tr><td>Descorche libre</td><td className="compare-check">Incluido</td><td className="compare-check">Incluido</td><td className="compare-check">Incluido</td></tr>
                <tr><td>Grupo en vivo</td><td className="compare-x">—</td><td className="compare-check">5 int.</td><td className="compare-check">9 int.</td></tr>
                <tr><td>Pantalla LED</td><td className="compare-x">—</td><td className="compare-check">Incluida</td><td className="compare-check">Incluida</td></tr>
                <tr><td>Pista LED</td><td className="compare-x">—</td><td className="compare-x">—</td><td className="compare-check">Incluida</td></tr>
                <tr><td>Show de robot</td><td className="compare-x">—</td><td className="compare-x">—</td><td className="compare-check">Con pirotecnia</td></tr>
                <tr><td>Cabina 360</td><td className="compare-x">—</td><td className="compare-x">—</td><td className="compare-check">1 hora</td></tr>
                <tr><td>Chilaquiles</td><td className="compare-x">—</td><td className="compare-check">Incluidos</td><td className="compare-check">Incluidos</td></tr>
                <tr><td>Cortesías</td><td>1</td><td>2</td><td>Todas</td></tr>
              </tbody>
            </table>
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
            Personaliza tu evento con nuestras cortesías
          </h2>
          <p className="section-sub reveal">
            Un detalle exclusivo de Villaverde que ningún otro salón en Chalco ofrece. Tú eliges cómo hacer tu fiesta única.
          </p>
          <div className="cort-explain reveal">
            <div className="cort-explain-item">
              <div className="ce-num" style={{ color: "var(--rosa)" }}>1</div>
              <div className="ce-label">cortesía a elegir<br /><strong style={{ color: "var(--rosa)" }}>Premium</strong></div>
            </div>
            <div className="cort-explain-item">
              <div className="ce-num" style={{ color: "var(--gold)" }}>2</div>
              <div className="ce-label">cortesías a elegir<br /><strong style={{ color: "var(--gold)" }}>Diamante</strong></div>
            </div>
            <div className="cort-explain-item">
              <div className="ce-num" style={{ color: "var(--esmeralda)" }}>∞</div>
              <div className="ce-label">todas incluidas<br /><strong style={{ color: "var(--esmeralda)" }}>Esmeralda</strong></div>
            </div>
          </div>
          <div className="cort-grid reveal">
            <div className="cort-item"><span className="ci"><IconFerrisWheel size={20} /></span> Inflable o trampolín en jardín</div>
            <div className="cort-item"><span className="ci"><IconUtensils size={20} /></span> Torna fiesta de chilaquiles</div>
            <div className="cort-item"><span className="ci"><IconMusic size={20} /></span> Cabina iluminada para DJ</div>
            <div className="cort-item"><span className="ci"><IconLightbulb size={20} /></span> Iluminación LED en mesas</div>
            <div className="cort-item"><span className="ci"><IconFlower size={20} /></span> Arco de flores (cuadrado)</div>
            <div className="cort-item"><span className="ci"><IconFlower size={20} /></span> Arco de flores (medio punto)</div>
            <div className="cort-item"><span className="ci"><IconMic size={20} /></span> Cantante durante la cena</div>
            <div className="cort-item"><span className="ci"><IconPartyPopper size={20} /></span> Cabezones</div>
            <div className="cort-item"><span className="ci"><IconVideo size={20} /></span> Video remembranza</div>
            <div className="cort-item"><span className="ci"><IconDroplets size={20} /></span> Máquina de burbujas</div>
            <div className="cort-item"><span className="ci"><IconFlower size={20} /></span> Cascada de flores en escalera</div>
            <div className="cort-item"><span className="ci"><IconBot size={20} /></span> Show de robot (sin pirotecnia)</div>
          </div>
        </div>
      </section>

      {/* Galería con Lightbox */}
      <section className="section bg-gris" id="galeria">
        <div className="section-narrow">
          <h2 className="section-title reveal">Conoce nuestro salón</h2>
          <p className="section-sub reveal">Cada rincón diseñado para que tu evento sea espectacular</p>
          <div className="gallery-grid reveal">
            {galleryImages.map((img, i) => (
              <div key={i} className={`gallery-item ${img.className}`} onClick={() => setLightboxIdx(i)}>
                <img src={img.src} alt={img.alt} loading="lazy" />
                <div className="gallery-zoom"><IconZoomIn size={28} /></div>
              </div>
            ))}
          </div>
          <div className="gallery-cta reveal">
            <a
              href="https://wa.me/529995485862?text=Hola%2C%20quiero%20agendar%20una%20visita%20al%20Sal%C3%B3n%20Villaverde%20para%20conocerlo"
              target="_blank" rel="noopener noreferrer" className="btn-primary"
            >
              Visita el salón sin compromiso <IconChevronRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div className="lightbox" onClick={() => setLightboxIdx(null)}>
          <button className="lightbox-close" onClick={() => setLightboxIdx(null)} aria-label="Cerrar">
            <IconX size={24} />
          </button>
          <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + galleryImages.length) % galleryImages.length); }} aria-label="Anterior">
            <IconChevronLeft size={24} />
          </button>
          <img
            src={galleryImages[lightboxIdx].src}
            alt={galleryImages[lightboxIdx].alt}
            onClick={(e) => e.stopPropagation()}
          />
          <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % galleryImages.length); }} aria-label="Siguiente">
            <IconChevronRight size={24} />
          </button>
        </div>
      )}

      {/* Por qué Villaverde */}
      <section className="section">
        <div className="section-narrow">
          <h2 className="section-title reveal">
            ¿Por qué las familias de Chalco eligen Villaverde?
          </h2>
          <div className="why-grid reveal">
            <div className="why-card">
              <div className="why-icon"><IconBuilding size={24} /></div>
              <h3>Fachada icónica</h3>
              <p>Arquitectura estilo hacienda que crea el escenario perfecto para tus fotos. Un lugar que tus invitados nunca olvidarán.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><IconTrees size={24} /></div>
              <h3>Jardines con fuente</h3>
              <p>Espacios exteriores hermosos para la recepción y sesión de fotos al atardecer.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><IconDiamond size={24} /></div>
              <h3>2 camerinos privados</h3>
              <p>Exclusivo: uno para la quinceañera o novios y otro para chambelanes. Ningún otro salón lo ofrece.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><IconGift size={24} /></div>
              <h3>Cortesías personalizables</h3>
              <p>Tú eliges cómo complementar tu fiesta con nuestro sistema único de cortesías. Solo en Villaverde.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><IconSmartphone size={24} /></div>
              <h3>Invitación digital gratis</h3>
              <p>Animada con cuenta regresiva, mapa de ubicación y confirmación por WhatsApp. Incluida en todos los paquetes.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><IconShieldCheck size={24} /></div>
              <h3>Sin sorpresas de precio</h3>
              <p>Todo incluido desde el primer momento. Nada de &quot;extras ocultos&quot; que inflan la cuenta al final.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Menú */}
      <section className="section bg-crema" id="menu">
        <div className="section-narrow">
          <h2 className="section-title reveal">Nuestro Menú de Banquete</h2>
          <p className="section-sub reveal">Cocina de primera para consentir a tus invitados</p>
          <div className="menu-tabs reveal">
            {["entradas", "cremas", "pasta", "pollo", "cerdo", "guarn"].map((tab) => (
              <button
                key={tab}
                className={`menu-tab${activeMenu === tab ? " active" : ""}`}
                onClick={() => setActiveMenu(tab)}
              >
                {tab === "entradas" ? "Entradas" : tab === "cremas" ? "Cremas" : tab === "pasta" ? "Pasta" : tab === "pollo" ? "Pollo" : tab === "cerdo" ? "Cerdo" : "Guarniciones"}
              </button>
            ))}
          </div>

          {activeMenu === "entradas" && (
            <div className="menu-content active">
              <h3>Entradas</h3>
              <div className="menu-items">
                {["Coctel de frutas con coco", "Volovanes (2)", "Ensalada de atún", "Flor de calabaza con queso", "Melón al oporto", "Rollos de jamón con ensalada rusa", "Pepino relleno de atún", "Jitomate relleno de atún", "Pimiento relleno de pollo"].map((item) => (
                  <span key={item} className="menu-item">{item}</span>
                ))}
              </div>
            </div>
          )}

          {activeMenu === "cremas" && (
            <div className="menu-content active">
              <h3>Cremas</h3>
              <div className="menu-items">
                {["Elote", "Nuez", "Champiñones", "Chile poblano con elote", "Brócoli", "Almendras", "Pimiento morrón", "Zanahoria", "Flor de calabaza", "Cilantro", "Calabaza", "Coliflor", "Espinacas", "Espárragos", "Ejote", "Chícharos"].map((item) => (
                  <span key={item} className="menu-item">{item}</span>
                ))}
              </div>
            </div>
          )}

          {activeMenu === "pasta" && (
            <div className="menu-content active">
              <h3>Pasta y Espagueti</h3>
              <div className="menu-subsection">
                <h4>Codito</h4>
                <div className="menu-items">
                  {["Con crema y jamón", "Con atún", "A la poblana", "A la crema con espinaca", "Con jamón y queso", "A la hawaiana", "Al chipotle", "A la boloñesa", "A la italiana", "Con jamón y gratín"].map((item) => (
                    <span key={item} className="menu-item">{item}</span>
                  ))}
                </div>
              </div>
              <div className="menu-subsection">
                <h4>Espagueti</h4>
                <div className="menu-items">
                  {["A la italiana", "A la jardinera", "A la hawaiana", "A la poblana", "A la boloñesa", "Con chorizo", "A la francesa", "A la florentina", "A la mantequilla", "Al chipotle", "Al gratín", "A la salsa rosa"].map((item) => (
                    <span key={item} className="menu-item">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeMenu === "pollo" && (
            <div className="menu-content active">
              <h3>Pollo</h3>
              <div className="menu-items">
                {["Almendrado", "Al pimiento morrón", "En carnitas", "En crema de chipotle", "En mixiotes con nopales", "En vino blanco", "En achiote", "A la naranja", "En adobo", "A la ciruela", "En crema de nuez", "Enchilado", "En mole poblano", "En mole verde", "En crema de champiñones", "A la jardinera", "A la piña", "A los 3 chiles"].map((item) => (
                  <span key={item} className="menu-item">{item}</span>
                ))}
              </div>
              <div className="menu-subsection">
                <h4>Pechugas Cordon Blue rellenas de:</h4>
                <div className="menu-items">
                  {["Jamón y queso amarillo", "Huitlacoche c/ queso", "Flor de calabaza c/ queso", "Ensalada rusa", "Calabacitas con cebolla en vino blanco"].map((item) => (
                    <span key={item} className="menu-item">{item}</span>
                  ))}
                </div>
                <p style={{ textAlign: "center", fontSize: "13px", color: "var(--gris-text)", marginTop: "10px" }}>
                  Con baño de crema de: champiñones, chipotle o tres quesos
                </p>
              </div>
            </div>
          )}

          {activeMenu === "cerdo" && (
            <div className="menu-content active">
              <h3>Cerdo</h3>
              <div className="menu-items">
                {["Carnitas", "Pierna en adobo", "Pierna con champiñones"].map((item) => (
                  <span key={item} className="menu-item">{item}</span>
                ))}
              </div>
              <div className="menu-subsection">
                <h4>Lomo en:</h4>
                <div className="menu-items">
                  {["Adobo", "Enchilado", "Almendrado", "Crema de chipotle", "Mole poblano", "A la naranja", "A la jardinera", "A la ciruela", "Crema con champiñones", "Envinado", "A la piña", "A los tres chiles"].map((item) => (
                    <span key={item} className="menu-item">{item}</span>
                  ))}
                </div>
              </div>
              <div className="menu-subsection">
                <h4>También disponible:</h4>
                <div className="menu-items">
                  {["Chuleta ahumada en chipotle", "Chuleta ahumada en piña"].map((item) => (
                    <span key={item} className="menu-item">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeMenu === "guarn" && (
            <div className="menu-content active">
              <h3>Guarniciones y Arroz</h3>
              <div className="menu-subsection">
                <h4>Guarniciones</h4>
                <div className="menu-items">
                  {["Ensalada rusa", "Puré de papa", "Ensalada de zanahoria con piña", "Ensalada de manzana con piña", "Verduras a la mantequilla", "Ensalada de pepino", "Papas a la mantequilla", "Frijoles refritos o charros", "Nopales en escabeche", "Rajas con crema", "Ensalada Waldorf"].map((item) => (
                    <span key={item} className="menu-item">{item}</span>
                  ))}
                </div>
              </div>
              <div className="menu-subsection">
                <h4>Arroz</h4>
                <div className="menu-items">
                  {["Mexicano", "Poblano", "Jardinero", "Blanco", "Risotto español"].map((item) => (
                    <span key={item} className="menu-item">{item}</span>
                  ))}
                </div>
              </div>
              <div className="menu-subsection">
                <h4>Consomé</h4>
                <div className="menu-items">
                  {["Pollo", "Res"].map((item) => (
                    <span key={item} className="menu-item">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Extras */}
      <section className="section" id="extras">
        <div className="section-narrow">
          <h2 className="section-title reveal">Complementa tu evento</h2>
          <p className="section-sub reveal">Servicios adicionales para hacer tu fiesta aún más espectacular</p>
          <div className="extras-grid reveal">
            {[
              { icon: <IconLightbulb size={28} />, name: "Pista LED", price: "$6,000" },
              { icon: <IconPartyPopper size={28} />, name: "Cabezones", price: "$600", detail: "c/u" },
              { icon: <IconCamera size={28} />, name: "Cabina 360", price: "$2,500", detail: "1 hora" },
              { icon: <IconMonitor size={28} />, name: "Pantalla LED Gigante", price: "$10,000" },
              { icon: <IconDroplets size={28} />, name: "Burbujas", price: "$6,000" },
              { icon: <IconType size={28} />, name: "Letras Gigantes", price: "$500", detail: "c/u" },
              { icon: <IconVideo size={28} />, name: "Video Remembranza", price: "$600" },
              { icon: <IconChurch size={28} />, name: "Ceremonia Religiosa", price: "$5,000" },
              { icon: <IconUtensils size={28} />, name: "Torna Fiesta", price: "$4,000", detail: "100 personas" },
              { icon: <IconClock size={28} />, name: "Hora Extra", price: "$6,000" },
            ].map((extra) => (
              <div key={extra.name} className="extra-card">
                <div className="extra-icon">{extra.icon}</div>
                <div className="extra-name">{extra.name}</div>
                <div className="extra-price">{extra.price}</div>
                {extra.detail && <div className="extra-detail">{extra.detail}</div>}
              </div>
            ))}
          </div>
          <div className="extras-subtitle reveal"><IconMusic size={24} /> Música en Vivo</div>
          <div className="extras-grid reveal">
            {[
              { icon: <IconMusic size={28} />, name: "Mariachi", price: "$4,000" },
              { icon: <IconMic size={28} />, name: "Cantante", price: "$15,000" },
              { icon: <IconDrum size={28} />, name: "Banda 13 int.", price: "$13,000" },
              { icon: <IconGuitar size={28} />, name: "Grupo 5 int.", price: "$13,000" },
              { icon: <IconMusic size={28} />, name: "Grupo 9 int.", price: "$10,500" },
              { icon: <IconMusic size={28} />, name: "Trío", price: "$3,000" },
              { icon: <IconMusic size={28} />, name: "Norteño 4 int.", price: "$3,000" },
            ].map((extra) => (
              <div key={extra.name} className="extra-card">
                <div className="extra-icon">{extra.icon}</div>
                <div className="extra-name">{extra.name}</div>
                <div className="extra-price">{extra.price}</div>
              </div>
            ))}
          </div>
          <div className="extra-coctel reveal">
            <h3><IconWine size={24} /> Fiesta Cóctel</h3>
            <div className="ec-price">$8,600</div>
            <p>
              Para 100 personas — 4 vitroleros de 10 lts (piña colada, azulito,
              mojito frutos rojos, mojito mango) + 100 micheladas de ½ litro con
              banderilla, escarchado y sabores a elegir
            </p>
          </div>
        </div>
      </section>

      {/* Testimonios con Avatares */}
      <section className="section bg-gris">
        <div className="section-narrow">
          <h2 className="section-title reveal">Lo que dicen nuestras familias</h2>
          <div className="testi-carousel reveal">
            <button className="testi-nav prev" onClick={() => setCurrentTesti((currentTesti - 1 + testimonials.length) % testimonials.length)} aria-label="Anterior">
              <IconChevronLeft size={20} />
            </button>
            <button className="testi-nav next" onClick={() => setCurrentTesti((currentTesti + 1) % testimonials.length)} aria-label="Siguiente">
              <IconChevronRight size={20} />
            </button>
            <div className="testi-track" style={{ transform: `translateX(-${currentTesti * 100}%)` }}>
              {testimonials.map((t, i) => (
                <div key={i} className="testi-slide">
                  <div className="testi-card">
                    <div className="testi-avatar">{t.initials}</div>
                    <div className="testi-stars">
                      {[...Array(5)].map((_, j) => <IconStar key={j} size={20} />)}
                    </div>
                    <div className="testi-text">&quot;{t.text}&quot;</div>
                    <div className="testi-author">— {t.author}</div>
                    <div className="testi-event">{t.event}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="testi-dots">
              {testimonials.map((_, i) => (
                <button key={i} className={`testi-dot${currentTesti === i ? " active" : ""}`} onClick={() => setCurrentTesti(i)} aria-label={`Testimonio ${i + 1}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Instagram */}
      <section className="section">
        <div className="section-narrow">
          <h2 className="section-title reveal">Síguenos en Instagram</h2>
          <p className="section-sub reveal">
            <a href="https://www.instagram.com/salon.villaverde/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--rosa)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <IconInstagram size={18} /> @salon.villaverde
            </a>
          </p>
        </div>
      </section>

      {/* Mapa */}
      <section className="section">
        <div className="section-narrow">
          <h2 className="section-title reveal">¿Cómo llegar?</h2>
          <p className="section-sub reveal" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <IconMapPin size={16} /> Carretera México-Cuautla, Km. 35.5, Col. Santa Cruz Amalinalco, Chalco, Edo. de México
          </p>
          <div className="map-container reveal">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3765.974720759722!2d-98.8805715!3d19.2834655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ce1ee02966d737%3A0xc3176ac46d382ee3!2sSal%C3%B3n%20de%20Fiestas%20Villa%20Verde!5e0!3m2!1ses-419!2smx!4v1774235805211!5m2!1ses-419!2smx"
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Salón de Fiestas Villaverde" style={{ border: 0 }}
            ></iframe>
          </div>
          <p style={{ textAlign: "center", marginTop: "16px", fontSize: "14px" }}>
            <a href="https://maps.app.goo.gl/WiNBbqdBas4L6RDt6" target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--rosa)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <IconMapPin size={14} /> Ver en Google Maps
            </a>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-crema" id="faq">
        <div className="section-narrow">
          <h2 className="section-title reveal">Preguntas Frecuentes</h2>
          <p className="section-sub reveal">Todo lo que necesitas saber sobre tu evento en Villaverde</p>
          <div className="faq-list reveal">
            <details className="faq-item">
              <summary className="faq-question">¿Cuánto cuesta un salón de fiestas en Chalco?</summary>
              <div className="faq-answer">
                En Salón de Fiestas Villaverde nuestros paquetes todo incluido van desde <strong>$420 por persona</strong> (Paquete Premium con 150+ invitados) hasta <strong>$720 por persona</strong> (Paquete Esmeralda). Todos incluyen cena formal, descorche libre, DJ, iluminación inteligente, meseros y más. Sin costos ocultos.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-question">¿Qué incluye un paquete todo incluido para XV años?</summary>
              <div className="faq-answer">
                Nuestros paquetes para XV años incluyen: salón con capacidad de 100 a 450 invitados, cena formal de 3 tiempos, refresco ilimitado, descorche libre (trae tus bebidas sin cargo), DJ y Maestro de Ceremonias, iluminación tipo antro, batucada con globos, 2 camerinos privados, estacionamiento e invitación digital animada. Los paquetes Diamante y Esmeralda agregan grupo en vivo, pantalla LED gigante y más espectáculos.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-question">¿Cuánto es el anticipo para apartar mi fecha?</summary>
              <div className="faq-answer">
                Puedes apartar tu fecha con solo <strong>$3,000 MXN de anticipo</strong>. El resto se cubre en pagos cómodos antes del evento. Te recomendamos apartar con anticipación ya que las fechas de fin de semana se agotan rápido.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-question">¿El salón Villaverde permite descorche libre?</summary>
              <div className="faq-answer">
                Sí, <strong>todos nuestros paquetes incluyen descorche libre</strong>. Puedes traer tus propias bebidas alcohólicas sin ningún cargo adicional. Además, cada paquete incluye botella ¾ por mesa y refresco con hielo ilimitado durante todo el evento.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-question">¿Cuántos invitados caben en el salón?</summary>
              <div className="faq-answer">
                El Salón de Fiestas Villaverde tiene capacidad para <strong>100 a 450 invitados</strong>. Contamos con mesas redondas, sillas Tiffany y amplios jardines con fuente para la recepción.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-question">¿Dónde se encuentra el Salón de Fiestas Villaverde?</summary>
              <div className="faq-answer">
                Estamos en <strong>Carretera México-Cuautla, Km. 35.5, Col. Santa Cruz Amalinalco, Chalco, Estado de México</strong>. Contamos con estacionamiento amplio. Puedes agendar una visita sin compromiso para conocer nuestras instalaciones.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-question">¿Qué diferencia hay entre los paquetes Premium, Diamante y Esmeralda?</summary>
              <div className="faq-answer">
                El <strong>Premium</strong> ($420/pp) incluye todo lo esencial: cena, descorche libre, DJ y 1 cortesía. El <strong>Diamante</strong> ($530/pp) agrega grupo versátil en vivo, pantalla LED, chilaquiles y 2 cortesías. El <strong>Esmeralda</strong> ($680/pp) es el paquete máximo con pista LED, show de robot con pirotecnia, cabina 360, cantante en cena y todas las cortesías incluidas.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-question">¿Puedo agendar una visita para conocer el salón?</summary>
              <div className="faq-answer">
                Por supuesto. Las visitas son con cita previa. Puedes agendar por WhatsApp al <strong>9995485862</strong> y te mostraremos las instalaciones completas: salón, jardines, camerinos, cocina y todo lo que incluyen nuestros paquetes. Las fotos no le hacen justicia, te invitamos a conocernos en persona.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Formulario de Contacto */}
      <section className="section" id="formulario">
        <div className="section-narrow">
          <h2 className="section-title reveal">Cotiza en 30 segundos</h2>
          <p className="section-sub reveal">Solo tu nombre y teléfono — nosotros te llamamos en menos de 1 hora</p>
          <form
            className="contact-form reveal"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const nombre = (form.elements.namedItem("nombre") as HTMLInputElement).value;
              const telefono = (form.elements.namedItem("telefono") as HTMLInputElement).value;
              const msg = `Hola, quiero cotizar mi evento en Villaverde.\n\nNombre: ${nombre}\nTeléfono: ${telefono}`;
              window.open(`https://wa.me/529995485862?text=${encodeURIComponent(msg)}`, "_blank");
            }}
          >
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nombre">Tu nombre</label>
                <input type="text" id="nombre" name="nombre" required placeholder="¿Cómo te llamas?" />
              </div>
              <div className="form-group">
                <label htmlFor="telefono">WhatsApp</label>
                <input type="tel" id="telefono" name="telefono" required placeholder="55 1234 5678" />
              </div>
            </div>
            <button type="submit" className="btn-primary form-submit">
              <WhatsAppIcon size={18} /> Recibir cotización gratis
            </button>
          </form>
        </div>
      </section>

      {/* CTA Final */}
      <section className="cta-final" id="contacto">
        <div className="inner">
          <h2>¿Lista para la fiesta<br />de tus sueños?</h2>
          <p className="cta-sub">Las fechas de fin de semana se agotan rápido — agenda tu visita sin compromiso.</p>
          <div className="cta-anticipo">Aparta tu fecha con solo $3,000 de anticipo</div>
          <a
            href="https://wa.me/529995485862?text=Hola%2C%20quiero%20agendar%20una%20visita%20al%20Sal%C3%B3n%20Villaverde%20para%20conocerlo.%20%C2%BFQu%C3%A9%20horarios%20tienen%20disponibles%3F"
            target="_blank" rel="noopener noreferrer" className="btn-wa-big"
          >
            <WhatsAppIcon size={24} /> Aparta tu fecha ahora
          </a>
          <div className="cta-contact" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><IconPhone size={14} /> 9995485862</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><IconMapPin size={14} /> Chalco, Estado de México</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="fb-name">Villa<span>verde</span></div>
            <p>Salón de Fiestas Villaverde<br />Chalco, Estado de México<br />WhatsApp: 9995485862</p>
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
              <a href="https://wa.me/529995485862" target="_blank" rel="noopener noreferrer" title="WhatsApp">
                <WhatsAppIcon size={18} />
              </a>
              <a href="https://www.instagram.com/salon.villaverde/" target="_blank" rel="noopener noreferrer" title="Instagram">
                <IconInstagram size={18} />
              </a>
              <a href="https://www.facebook.com/SalonVillaVerde/" target="_blank" rel="noopener noreferrer" title="Facebook">
                <IconFacebook size={18} />
              </a>
            </div>
            <p style={{ fontSize: "12px", marginTop: "16px" }}>Visitas con cita previa</p>
          </div>
        </div>
        <div className="footer-copy">
          © 2026 Salón de Fiestas Villaverde — Chalco, Estado de México. Todos los derechos reservados.
        </div>
      </footer>

      {/* WhatsApp Float */}
      <a href="https://wa.me/529995485862?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20paquetes%20para%20mi%20evento" target="_blank" rel="noopener noreferrer" className="wa-float">
        <WhatsAppIcon size={34} />
      </a>

      {/* Sticky CTA Móvil */}
      {showSticky && (
        <div className="sticky-cta">
          <div className="sticky-cta-inner">
            <div className="sticky-cta-text">
              <strong>Paquetes desde $420/persona</strong>
              Aparta con solo $3,000
            </div>
            <a href="https://wa.me/529995485862?text=Hola%2C%20quiero%20cotizar%20mi%20evento%20en%20Villaverde" target="_blank" rel="noopener noreferrer" className="sticky-cta-btn">
              <WhatsAppIcon size={18} /> Apartar
            </a>
          </div>
        </div>
      )}
    </>
  );
}
