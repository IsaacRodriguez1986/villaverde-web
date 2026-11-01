import type { TourScene } from "./tour-360-data";

export interface PanoramaViewer {
  loadScene: (id: string, pitch?: number, yaw?: number, hfov?: number) => PanoramaViewer;
  destroy: () => void;
  getScene: () => string;
  on: (event: string, callback: (value?: unknown) => void) => PanoramaViewer;
  off: (event?: string, callback?: (value?: unknown) => void) => PanoramaViewer;
}

interface PanoramaSceneOptions {
  type: "equirectangular";
  panorama: string;
  preview?: string;
  title: string;
  autoLoad: boolean;
  yaw: number;
  pitch: number;
  hfov: number;
  hotSpots: Array<Record<string, string | number>>;
}

interface PanoramaOptions {
  default: { firstScene: string; sceneFadeDuration: number; autoLoad: boolean };
  scenes: Record<string, PanoramaSceneOptions>;
  compass: boolean;
  showZoomCtrl: boolean;
  showFullscreenCtrl: boolean;
  mouseZoom: "fullscreenonly";
  orientationOnByDefault: boolean;
  escapeHTML: boolean;
  strings: Record<string, string>;
}

interface PannellumAPI {
  viewer: (container: HTMLElement, options: PanoramaOptions) => PanoramaViewer;
}

interface PanoramaWindow extends Window {
  pannellum?: PannellumAPI;
}

export interface PanoramaCallbacks {
  onSceneChange: (id: string) => void;
  onLoad: () => void;
  onError: (message: string) => void;
}

let libraryPromise: Promise<PannellumAPI> | null = null;

function loadStylesheet(): Promise<void> {
  const existing = document.getElementById("pannellum-css") as HTMLLinkElement | null;
  if (existing?.sheet) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const link = existing ?? document.createElement("link");
    const finish = (error?: Error) => {
      clearTimeout(timer);
      link.removeEventListener("load", loaded);
      link.removeEventListener("error", failed);
      if (error) { if (!existing) link.remove(); reject(error); }
      else resolve();
    };
    const loaded = () => finish();
    const failed = () => finish(new Error("No se pudieron cargar los estilos del recorrido."));
    const timer = window.setTimeout(failed, 15000);
    link.addEventListener("load", loaded, { once: true });
    link.addEventListener("error", failed, { once: true });
    if (!existing) {
      link.id = "pannellum-css";
      link.rel = "stylesheet";
      link.href = "/vendor/pannellum/pannellum.min.css";
      document.head.append(link);
    }
  });
}

function loadScript(): Promise<PannellumAPI> {
  const runtime = window as PanoramaWindow;
  if (runtime.pannellum) return Promise.resolve(runtime.pannellum);
  return new Promise((resolve, reject) => {
    const existing = document.getElementById("pannellum-js") as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    const finish = (error?: Error) => {
      clearTimeout(timer);
      script.removeEventListener("load", loaded);
      script.removeEventListener("error", failed);
      if (error) { if (!existing) script.remove(); reject(error); }
      else if (runtime.pannellum) resolve(runtime.pannellum);
      else reject(new Error("El visor no pudo iniciarse."));
    };
    const loaded = () => finish();
    const failed = () => finish(new Error("No se pudo cargar el visor. Comprueba tu conexión."));
    const timer = window.setTimeout(failed, 15000);
    script.addEventListener("load", loaded, { once: true });
    script.addEventListener("error", failed, { once: true });
    if (!existing) {
      script.id = "pannellum-js";
      script.src = "/vendor/pannellum/pannellum.min.js";
      script.async = true;
      document.body.append(script);
    }
  });
}

function loadLibrary(): Promise<PannellumAPI> {
  if (!libraryPromise) {
    libraryPromise = Promise.all([loadStylesheet(), loadScript()])
      .then(([, runtime]) => runtime)
      .catch((error: unknown) => { libraryPromise = null; throw error; });
  }
  return libraryPromise;
}

function sceneOptions(scene: TourScene): PanoramaSceneOptions {
  return {
    type: "equirectangular", panorama: scene.src, preview: scene.preview,
    title: scene.name, autoLoad: true,
    yaw: scene.yaw ?? 0, pitch: scene.pitch ?? 0, hfov: scene.hfov ?? 100,
    hotSpots: (scene.hotSpots ?? []).map((spot) => ({ ...spot, type: "scene" })),
  };
}

export async function createPanorama(
  container: HTMLElement,
  scenes: readonly TourScene[],
  firstScene: string,
  callbacks: PanoramaCallbacks,
): Promise<PanoramaViewer> {
  const runtime = await loadLibrary();
  if (!container.isConnected) throw new DOMException("El visor se cerró.", "AbortError");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const viewer = runtime.viewer(container, {
    default: { firstScene, sceneFadeDuration: reduced ? 0 : 300, autoLoad: true },
    scenes: Object.fromEntries(scenes.map((scene) => [scene.id, sceneOptions(scene)])),
    compass: false, showZoomCtrl: true, showFullscreenCtrl: true,
    mouseZoom: "fullscreenonly", orientationOnByDefault: false, escapeHTML: true,
    strings: {
      loadingLabel: "Cargando vista…", loadButtonLabel: "Abrir recorrido",
      genericWebGLError: "Tu navegador no pudo abrir esta vista. Puedes ver las fotos de la galería.",
      fileAccessError: "No se pudo cargar esta vista. Comprueba tu conexión y vuelve a intentar.",
    },
  });
  viewer.on("scenechange", (id) => { if (typeof id === "string") callbacks.onSceneChange(id); });
  viewer.on("load", callbacks.onLoad);
  viewer.on("error", (message) => callbacks.onError(typeof message === "string" ? message : "No se pudo abrir esta vista."));
  return viewer;
}
