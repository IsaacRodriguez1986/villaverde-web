"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { TOUR_GROUPS, TOUR_SCENES, type TourScene } from "./tour-360-data";
import { createPanorama, type PanoramaViewer } from "./tour-360-runtime";
import styles from "./venue-tour-360.module.css";

type TourStatus = "idle" | "loading" | "ready" | "error";
const TOUR_LOAD_TIMEOUT_MS = 20_000;

interface VenueTour360Props {
  scenes?: readonly TourScene[];
}

interface TourOverlayProps {
  scene: TourScene;
  status: TourStatus;
  error: string;
  onStart: () => void;
}

function usePanoramaTour(scenes: readonly TourScene[]) {
  const initial = scenes.find((scene) => scene.group === "salon") ?? scenes[0];
  const [selectedId, setSelectedId] = useState(initial?.id ?? "");
  const [status, setStatus] = useState<TourStatus>("idle");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PanoramaViewer | null>(null);
  const firstSceneRef = useRef(selectedId);

  useEffect(() => {
    if (!attempt || !containerRef.current) return;
    let cancelled = false;
    let instance: PanoramaViewer | null = null;
    let timer: number | undefined;
    const clearTimer = () => { window.clearTimeout(timer); timer = undefined; };
    const dispose = () => {
      cancelled = true; clearTimer();
      const viewer = instance;
      if (viewerRef.current === viewer) viewerRef.current = null;
      viewer?.destroy();
    };
    const fail = (message: string) => {
      if (cancelled) { instance?.destroy(); return; }
      dispose(); setError(message); setStatus("error");
    };
    const armTimer = () => { clearTimer(); timer = window.setTimeout(() => fail("La vista tardó demasiado en cargar. Vuelve a intentar."), TOUR_LOAD_TIMEOUT_MS); };
    const callbacks = {
      onSceneChange: (id: string) => { if (!cancelled) { setSelectedId(id); setStatus("loading"); armTimer(); } },
      onLoad: () => {
        if (cancelled) { instance?.destroy(); return; }
        clearTimer(); setStatus("ready");
        if (document.activeElement === document.body || containerRef.current?.contains(document.activeElement)) containerRef.current?.focus({ preventScroll: true });
      },
      onError: fail,
    };
    armTimer();
    createPanorama(containerRef.current, scenes, firstSceneRef.current, callbacks)
      .then((viewer) => { instance = viewer; if (cancelled) viewer.destroy(); else viewerRef.current = viewer; })
      .catch((failure: unknown) => fail(failure instanceof Error ? failure.message : "No se pudo abrir el recorrido."));
    return dispose;
  }, [attempt, scenes]);

  const start = (id = selectedId) => { firstSceneRef.current = id; setSelectedId(id); setError(""); setStatus("loading"); setAttempt((value) => value + 1); };
  const selectScene = (id: string) => {
    if (status === "idle" || status === "error") start(id);
    else if (status === "ready") viewerRef.current?.loadScene(id);
  };
  return { selectedId, status, error, attempt, containerRef, start, selectScene };
}

function TourOverlay({ scene, status, error, onStart }: TourOverlayProps) {
  if (status === "ready") return null;
  const failed = status === "error";
  const busy = status === "loading";
  return (
    <div className={styles.overlay}>
      {status === "idle" && <Image className={styles.preview} src={scene.preview ?? scene.src} alt="" fill sizes="(max-width: 768px) 100vw, 1200px" loading="lazy" />}
      <div className={styles.overlayContent}>
        <p className={styles.overlayEyebrow}>Villaverde · Recorrido fotográfico 360°</p>
        <h3>{failed ? "Esta vista no pudo abrirse" : busy ? "Abriendo el recorrido…" : "Mira a tu alrededor"}</h3>
        <p>{failed ? error : busy ? "Estamos preparando la vista seleccionada." : "Elige un punto, arrastra y descubre cada detalle del lugar."}</p>
        {!busy && <button type="button" onClick={onStart}>{failed ? "Volver a intentar" : "Explorar en 360°"}<span aria-hidden="true"> ↗</span></button>}
        {busy && <span className={styles.loadingLine} aria-hidden="true" />}
        {failed && <a href="#galeria">Ver fotos del salón</a>}
      </div>
    </div>
  );
}

interface TourSelectorProps {
  scenes: readonly TourScene[];
  selectedId: string;
  loading: boolean;
  onSelect: (id: string) => void;
}

function TourSelector({ scenes, selectedId, loading, onSelect }: TourSelectorProps) {
  return (
    <div className={styles.groups} aria-label="Puntos del recorrido">
      {TOUR_GROUPS.map((group) => {
        const options = scenes.filter((scene) => scene.group === group.id);
        if (!options.length) return null;
        return (
          <div className={styles.group} key={group.id} role="group" aria-label={group.name}>
            <span className={styles.groupLabel}>{group.name}</span>
            <div className={styles.sceneButtons}>
              {options.map((scene) => <button key={scene.id} type="button" onClick={() => onSelect(scene.id)} aria-pressed={selectedId === scene.id} disabled={loading}>{scene.name}</button>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TourStepNavigation({ scenes, selectedId, loading, onSelect }: TourSelectorProps) {
  const selected = scenes.find((scene) => scene.id === selectedId);
  const steps = scenes.filter((scene) => scene.group === selected?.group);
  const index = steps.findIndex((scene) => scene.id === selectedId);
  if (steps.length < 2 || index < 0) return null;
  return (
    <div className={styles.stepNavigation} aria-label="Avanzar entre vistas">
      <button type="button" disabled={loading || index === 0} onClick={() => onSelect(steps[index - 1].id)}><span aria-hidden="true">← </span>Anterior</button>
      <span>Vista {index + 1} de {steps.length}</span>
      <button type="button" disabled={loading || index === steps.length - 1} onClick={() => onSelect(steps[index + 1].id)}>Siguiente<span aria-hidden="true"> →</span></button>
    </div>
  );
}

export function VenueTour360({ scenes = TOUR_SCENES }: VenueTour360Props) {
  const tour = usePanoramaTour(scenes);
  const selected = scenes.find((scene) => scene.id === tour.selectedId) ?? scenes[0];
  if (!selected) return null;
  return (
    <section className={`section ${styles.section}`} id="recorrido-360" aria-labelledby="tour360-title">
      <div className="section-narrow">
        <h2 className="section-title" id="tour360-title">Recorrido virtual 360°</h2>
        <p className="section-sub">Avanza entre cuatro vistas reales del salón. Arrastra para mirar alrededor o elige una vista exterior.</p>
        <div className={styles.frame} aria-busy={tour.status === "loading"}>
          <div key={tour.attempt} className={styles.viewer} ref={tour.containerRef} tabIndex={0} role="region" aria-label={`Vista 360°: ${selected.name}`} />
          <TourOverlay scene={selected} status={tour.status} error={tour.error} onStart={() => tour.start()} />
        </div>
        <p className={styles.status} role="status" aria-live="polite">{tour.status === "ready" ? `${selected.name}. Arrastra para girar o elige otro punto.` : tour.status === "loading" ? `Cargando ${selected.name}…` : tour.status === "error" ? "No se pudo abrir la vista. Puedes reintentar o visitar la galería." : "El recorrido se carga cuando lo abres."}</p>
        <TourStepNavigation scenes={scenes} selectedId={tour.selectedId} loading={tour.status === "loading"} onSelect={tour.selectScene} />
        <TourSelector scenes={scenes} selectedId={tour.selectedId} loading={tour.status === "loading"} onSelect={tour.selectScene} />
        <noscript><p className={styles.noScript}>Activa JavaScript para girar y cambiar de vista. También puedes <a href={selected.src}>abrir la fotografía panorámica</a> o ver los videos del salón.</p></noscript>
      </div>
    </section>
  );
}
