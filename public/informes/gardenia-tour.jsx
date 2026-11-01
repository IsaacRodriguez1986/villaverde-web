/* Recorrido interior de Gardenia: fotografías esféricas autohospedadas. */
const GARDENIA_TOUR_SCENES = [
  { id: 'pista', name: 'Pista', yaw: 28, pitch: -8, hfov: 110 },
  { id: 'mesas', name: 'Mesas', yaw: 65, pitch: -8, hfov: 110 },
  { id: 'escalera', name: 'Escalera', yaw: 100, pitch: -10, hfov: 100 },
  { id: 'vista-general', name: 'Vista general', yaw: 20, pitch: -15, hfov: 115 },
].map(scene => ({ ...scene, src: `assets/gardenia-360/${scene.id}.jpg`, preview: `assets/gardenia-360/${scene.id}-preview.jpg` }));

function gardeniaTourOptions(firstScene) {
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return {
    default: { firstScene, sceneFadeDuration: reduced ? 0 : 300, autoLoad: true },
    scenes: Object.fromEntries(GARDENIA_TOUR_SCENES.map(scene => [scene.id, {
      type: 'equirectangular', panorama: scene.src, preview: scene.preview,
      title: scene.name, yaw: scene.yaw, pitch: scene.pitch, hfov: scene.hfov, autoLoad: true,
    }])),
    compass: false, showZoomCtrl: true, showFullscreenCtrl: true,
    mouseZoom: 'fullscreenonly', orientationOnByDefault: false, autoRotate: false, escapeHTML: true,
    strings: { loadingLabel: 'Cargando vista…', loadButtonLabel: 'Abrir recorrido' },
  };
}

function mountGardeniaTour(host, firstScene, callbacks) {
  // Pannellum can finish its image request after destroy(); isolate every attempt.
  const pane = document.createElement('div');
  pane.id = 'vv-gardenia-tour-viewer';
  pane.className = 'vv-gardenia-tour__pane';
  host.appendChild(pane);
  let viewer = null;
  let disposed = false;
  let timer;
  const destroy = () => { clearTimeout(timer); if (viewer) viewer.destroy(); pane.remove(); };
  const dispose = () => { disposed = true; destroy(); };
  const fail = () => {
    if (disposed) { destroy(); return; }
    dispose(); callbacks.onError();
  };
  const wait = () => { clearTimeout(timer); timer = setTimeout(fail, 20000); };
  try {
    if (!window.pannellum) throw new Error('Visor no disponible');
    viewer = window.pannellum.viewer(pane, gardeniaTourOptions(firstScene));
    viewer.on('scenechange', id => { if (!disposed) { callbacks.onSceneChange(id); wait(); } });
    viewer.on('load', () => {
      if (disposed) { destroy(); return; }
      clearTimeout(timer); callbacks.onLoad();
      if (document.activeElement === document.body || host.contains(document.activeElement)) pane.focus({ preventScroll: true });
    });
    viewer.on('error', fail);
    wait();
  } catch (failure) { fail(); }
  return { dispose, loadScene: id => { if (!disposed && viewer) viewer.loadScene(id); } };
}

function useGardeniaTour() {
  const [selected, setSelected] = useState('pista');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const elementRef = useRef(null);
  const viewerRef = useRef(null);
  const firstSceneRef = useRef('pista');
  useEffect(() => {
    if (!attempt || !elementRef.current) return;
    const instance = mountGardeniaTour(elementRef.current, firstSceneRef.current, {
      onSceneChange: id => { setSelected(id); setStatus('loading'); },
      onLoad: () => setStatus('ready'),
      onError: () => { setError('No se pudo abrir esta vista. Comprueba la conexión y vuelve a intentar.'); setStatus('error'); },
    });
    viewerRef.current = instance;
    return () => { instance.dispose(); if (viewerRef.current === instance) viewerRef.current = null; };
  }, [attempt]);
  const start = (id = selected) => { firstSceneRef.current = id; setSelected(id); setError(''); setStatus('loading'); setAttempt(value => value + 1); };
  const choose = id => {
    if (status === 'idle' || status === 'error') start(id);
    else if (status === 'ready' && viewerRef.current) viewerRef.current.loadScene(id);
  };
  return { selected, status, error, elementRef, start, choose };
}

function GardeniaTourCover({ scene, tour }) {
  if (tour.status === 'ready') return null;
  const busy = tour.status === 'loading';
  const failed = tour.status === 'error';
  return (
    <div className="vv-gardenia-tour__cover">
      {tour.status === 'idle' && <img className="vv-gardenia-tour__preview" src={scene.preview} alt="" loading="lazy" decoding="async" />}
      <div className="vv-gardenia-tour__cover-content">
        <p className="vv-gardenia-tour__eyebrow">Salón Gardenia · Vistas reales</p>
        <h3>{failed ? 'Esta vista no pudo abrirse' : busy ? 'Abriendo el recorrido…' : 'Mira a tu alrededor'}</h3>
        <p>{failed ? tour.error : busy ? 'Estamos cargando la fotografía seleccionada.' : 'Explora cuatro puntos del salón y descubre el espacio a tu ritmo.'}</p>
        {busy ? <span className="vv-gardenia-tour__loading" aria-hidden="true" /> : <button type="button" className="vv-gardenia-tour__start" onClick={() => tour.start()}>{failed ? 'Volver a intentar' : 'Explorar Gardenia en 360°'} <Icon name="right" size={17} /></button>}
      </div>
    </div>
  );
}

function GardeniaTourControls({ tour }) {
  const index = GARDENIA_TOUR_SCENES.findIndex(scene => scene.id === tour.selected);
  const busy = tour.status === 'loading';
  return (
    <>
      <div className="vv-gardenia-tour__steps" aria-label="Avanzar entre vistas de Gardenia">
        <button type="button" disabled={busy || index === 0} onClick={() => tour.choose(GARDENIA_TOUR_SCENES[index - 1].id)}><Icon name="left" size={16} /> Anterior</button>
        <span>Vista {index + 1} de {GARDENIA_TOUR_SCENES.length}</span>
        <button type="button" disabled={busy || index === GARDENIA_TOUR_SCENES.length - 1} onClick={() => tour.choose(GARDENIA_TOUR_SCENES[index + 1].id)}>Siguiente <Icon name="right" size={16} /></button>
      </div>
      <div className="vv-gardenia-tour__scenes" role="group" aria-label="Puntos del salón Gardenia">
        {GARDENIA_TOUR_SCENES.map(scene => <button key={scene.id} type="button" aria-pressed={tour.selected === scene.id} disabled={busy} onClick={() => tour.choose(scene.id)}>{scene.name}</button>)}
      </div>
    </>
  );
}

function GardeniaTour360() {
  const tour = useGardeniaTour();
  const scene = GARDENIA_TOUR_SCENES.find(item => item.id === tour.selected) || GARDENIA_TOUR_SCENES[0];
  const isolateArrows = event => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) event.stopPropagation(); };
  const message = tour.status === 'ready' ? `${scene.name}. Arrastra para girar o elige otra vista.` : tour.status === 'loading' ? `Cargando ${scene.name}…` : tour.status === 'error' ? 'La vista no está disponible. Puedes volver a intentar.' : 'El recorrido se carga cuando lo abres.';
  return (
    <section className="vv-gardenia-tour" aria-labelledby="vv-gardenia-tour-title" onKeyDown={isolateArrows}>
      <h2 id="vv-gardenia-tour-title" className="vv-gardenia-tour__title">Recorrido 360° del <em>Salón Gardenia</em></h2>
      <p className="vv-gardenia-tour__lead">Avanza entre cuatro vistas reales del salón. Arrastra para mirar alrededor.</p>
      <div className="vv-gardenia-tour__frame" aria-busy={tour.status === 'loading'}>
        <div ref={tour.elementRef} className="vv-gardenia-tour__viewer" role="region" aria-label={`Vista 360° de Gardenia: ${scene.name}`} />
        <GardeniaTourCover scene={scene} tour={tour} />
      </div>
      <p className="vv-gardenia-tour__status" role="status" aria-live="polite">{message}</p>
      <GardeniaTourControls tour={tour} />
      <noscript><p>Activa JavaScript para girar y cambiar de vista. También puedes abrir las fotografías panorámicas del salón.</p></noscript>
    </section>
  );
}
