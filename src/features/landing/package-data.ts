export type PackageId = "premium" | "diamante" | "esmeralda";

export interface PackagePlan {
  id: PackageId;
  name: string;
  description: string;
  price: number;
  minimumGuests: number;
  totalHours: number;
  eventHours: number;
  courtesies: string;
  highlights: readonly string[];
  features: readonly string[];
}

export interface ComparisonRow {
  label: string;
  values: readonly [string, string, string];
}

const COMMON_FEATURES = [
  "Cena formal de 3 tiempos (crema + plato fuerte + guarnición)",
  "Refresco ilimitado (2 sabores) y hielo todo el evento",
  "Descorche libre — trae tus bebidas sin cargo",
  "Botella ¾ por mesa incluida",
  "Meseros con capitán + personal de recepción",
  "DJ todo el evento + Maestro de Ceremonias",
  "Iluminación inteligente tipo antro",
  "Batucada con globos",
  "2 camerinos privados (XV/novios + chambelanes)",
  "Invitación digital animada de regalo",
] as const;

const DIAMANTE_FEATURES = [
  "Mesas redondas + sillas Tiffany vestidas",
  "Colores de mantelería a elegir",
  "Cabina profesional para DJ con iluminación",
  "Pantalla gigante LED",
  "Descargas de CO2 espectaculares",
  "Chilaquiles de madrugada",
] as const;

export const PACKAGES: readonly PackagePlan[] = [
  {
    id: "premium",
    name: "Premium",
    description: "Para cuidar tu presupuesto y celebrar con todo lo esencial.",
    price: 420,
    minimumGuests: 150,
    totalHours: 7,
    eventHours: 6,
    courtesies: "1 cortesía a elegir de nuestra lista",
    highlights: [
      "Cena formal de 3 tiempos",
      "Descorche libre y botella ¾ por mesa",
      "DJ y Maestro de Ceremonias",
      "1 cortesía a elegir",
    ],
    features: [
      ...COMMON_FEATURES,
      "Mesas redondas + sillas Tiffany vestidas (colores básicos)",
    ],
  },
  {
    id: "diamante",
    name: "Diamante",
    description: "Para sumar música en vivo y más ambiente a tu celebración.",
    price: 530,
    minimumGuests: 170,
    totalHours: 8,
    eventHours: 7,
    courtesies: "2 cortesías a elegir de nuestra lista",
    highlights: [
      "Todo lo del Premium",
      "Grupo versátil de 5 integrantes",
      "Pantalla LED y chilaquiles de madrugada",
      "2 cortesías a elegir",
    ],
    features: [
      ...COMMON_FEATURES,
      ...DIAMANTE_FEATURES,
      "Grupo versátil en vivo (5 integrantes)",
    ],
  },
  {
    id: "esmeralda",
    name: "Esmeralda",
    description: "Para disfrutar la experiencia más completa de Villaverde.",
    price: 680,
    minimumGuests: 200,
    totalHours: 9,
    eventHours: 8,
    courtesies: "Todas las cortesías incluidas",
    highlights: [
      "Todo lo del Diamante",
      "Grupo versátil de 9 integrantes",
      "Show de robot y cabina foto 360 (1 hora)",
      "Todas las cortesías incluidas",
    ],
    features: [
      ...COMMON_FEATURES,
      ...DIAMANTE_FEATURES,
      "Grupo versátil 9 integrantes",
      "Cabina foto 360 (1 hora)",
      "Show de robot",
      "Cóctel de bienvenida",
      "Cantante durante la cena",
      "Cascada flores en escalera",
      "Inflable o trampolín",
      "Video remembranza",
      "Taxi dancer",
      "LED en cada mesa",
      "Arco de flores",
      "Cabezones",
      "Máquina de burbujas",
    ],
  },
];

export const COMPARISON_ROWS: readonly ComparisonRow[] = [
  { label: "Horas totales", values: ["7h", "8h", "9h"] },
  { label: "Precio por persona", values: ["$420 MXN", "$530 MXN", "$680 MXN"] },
  { label: "Invitados (mínimo)", values: ["150", "170", "200"] },
  { label: "Descorche libre", values: ["Incluido", "Incluido", "Incluido"] },
  { label: "Grupo en vivo", values: ["No incluido", "5 integrantes", "9 integrantes"] },
  { label: "Pantalla LED", values: ["No incluida", "Incluida", "Incluida"] },
  { label: "Show de robot", values: ["No incluido", "No incluido", "Incluido"] },
  { label: "Cabina 360", values: ["No incluida", "No incluida", "1 hora"] },
  { label: "Chilaquiles", values: ["No incluidos", "Incluidos", "Incluidos"] },
  { label: "Cortesías", values: ["1", "2", "Todas"] },
];
