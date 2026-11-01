export interface TourHotSpot {
  id: string;
  pitch: number;
  yaw: number;
  text: string;
  sceneId: string;
  targetPitch?: number;
  targetYaw?: number;
}

export interface TourScene {
  id: string;
  name: string;
  group: "salon" | "exterior";
  src: string;
  preview?: string;
  yaw?: number;
  pitch?: number;
  hfov?: number;
  hotSpots?: readonly TourHotSpot[];
}

export const TOUR_GROUPS = [
  { id: "salon", name: "Salón" },
  { id: "exterior", name: "Exteriores" },
] as const;

export const TOUR_SCENES: readonly TourScene[] = [
  {
    id: "pista",
    name: "Pista",
    group: "salon",
    src: "/tours/villaverde/dji-20261101/pista.jpg",
    preview: "/tours/villaverde/dji-20261101/pista-preview.jpg",
    yaw: 28,
    pitch: -8,
    hfov: 110,
  },
  {
    id: "mesas",
    name: "Mesas",
    group: "salon",
    src: "/tours/villaverde/dji-20261101/mesas.jpg",
    preview: "/tours/villaverde/dji-20261101/mesas-preview.jpg",
    yaw: 65,
    pitch: -8,
    hfov: 110,
  },
  {
    id: "escalera",
    name: "Escalera",
    group: "salon",
    src: "/tours/villaverde/dji-20261101/escalera.jpg",
    preview: "/tours/villaverde/dji-20261101/escalera-preview.jpg",
    yaw: 100,
    pitch: -10,
    hfov: 100,
  },
  {
    id: "vista-general",
    name: "Vista general",
    group: "salon",
    src: "/tours/villaverde/dji-20261101/vista-general.jpg",
    preview: "/tours/villaverde/dji-20261101/vista-general-preview.jpg",
    yaw: 20,
    pitch: -15,
    hfov: 115,
  },
  {
    id: "fachada",
    name: "Fachada y jardín",
    group: "exterior",
    src: "https://gfbixkddumsqlfrfbsmp.supabase.co/storage/v1/object/public/landing/tour-360-fachada.webp",
  },
  {
    id: "entrada",
    name: "Entrada y fuente",
    group: "exterior",
    src: "https://gfbixkddumsqlfrfbsmp.supabase.co/storage/v1/object/public/landing/tour-360-entrada.webp",
  },
  {
    id: "vista",
    name: "Vista del jardín",
    group: "exterior",
    src: "https://gfbixkddumsqlfrfbsmp.supabase.co/storage/v1/object/public/landing/tour-360-vista.webp",
  },
  {
    id: "terraza",
    name: "Terraza",
    group: "exterior",
    src: "https://gfbixkddumsqlfrfbsmp.supabase.co/storage/v1/object/public/landing/tour-360-terraza.webp",
  },
];
