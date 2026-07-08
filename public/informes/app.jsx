/* =====================================================================
   VILLAVERDE · App shell — navegación, rail, topbar, guión, tweaks
   ===================================================================== */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primary": "#A4154B",
  "titleFont": "Cormorant Garamond",
  "showGuion": false
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  // El guión del asesor solo se muestra con el link privado ...?asesor=1 (nunca al lead)
  const asesorMode = (typeof location !== 'undefined') && new URLSearchParams(location.search).has('asesor');
  const showGuion = t.showGuion || asesorMode;
  const steps = VV.STEPS;
  const [idx, setIdx] = useState(() => {
    const s = +(localStorage.getItem('vv_step') || 0);
    return isNaN(s) ? 0 : Math.min(Math.max(s, 0), steps.length - 1);
  });
  const [visited, setVisited] = useState(() => new Set([steps[0].id]));
  const [dock, setDock] = useState(false);
  const stageRef = useRef(null);
  const [, setBump] = useState(0);

  const cur = steps[idx];

  useEffect(() => {
    localStorage.setItem('vv_step', idx);
    setVisited(prev => new Set(prev).add(cur.id));
    setDock(false);
    if (stageRef.current) stageRef.current.scrollTop = 0;
  }, [idx]);

  // La barra de resumen del topbar se refresca cuando cambia una selección (cotizador)
  useEffect(() => {
    const bump = () => setBump(b => b + 1);
    window.addEventListener('vv-store', bump);
    window.addEventListener('focus', bump);
    return () => { window.removeEventListener('vv-store', bump); window.removeEventListener('focus', bump); };
  }, []);

  // aplica tweaks a las variables de marca
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--vv-crimson', t.primary);
    r.style.setProperty('--vv-display', `'${t.titleFont}', Georgia, serif`);
  }, [t.primary, t.titleFont]);

  const go = (i) => setIdx(Math.min(Math.max(i, 0), steps.length - 1));
  const goId = (id) => { const i = steps.findIndex(s => s.id === id); if (i >= 0) go(i); };

  // Inicia una cotización nueva: borra los datos del cliente y vuelve al paso 1
  const nuevoCliente = () => {
    if (!window.confirm('¿Empezar una cotización nueva? Se borrarán los datos del cliente actual (paquete, invitados, fecha, cortesías y menú).')) return;
    (VV.CLIENT_KEYS || []).forEach(k => localStorage.removeItem(k));
    location.reload();
  };

  // Resumen vivo para el topbar (solo de Paquetes en adelante; antes no se habla de precio)
  // En Paquetes el resumen sigue la pestaña que se está viendo (vv_pkgview); en el resto, el paquete cotizado (vv_pkg)
  const rPkgId = (cur.id === 'paquetes' && localStorage.getItem('vv_pkgview'))
    || localStorage.getItem('vv_pkg') || localStorage.getItem('vv_pkgview') || 'diamante';
  const rPkg = VV.PAQUETES.find(p => p.id === rPkgId) || VV.PAQUETES[0];
  const rGuests = +(localStorage.getItem('vv_guests') || 150);
  const rTotalNum = VV.priceFor(rPkgId, rGuests) * rGuests;
  const showResumen = idx >= steps.findIndex(s => s.id === 'paquetes');

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT') return;
      // Con un visor/modal abierto, sus propias flechas mandan: no mover el paso de fondo
      if (document.querySelector('.vv-gallery-in, .vv-lightbox, .vv-imodal')) return;
      if (e.key === 'ArrowRight') go(idx + 1);
      if (e.key === 'ArrowLeft') go(idx - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx]);

  const render = () => {
    switch (cur.id) {
      case 'bienvenida':  return <SecBienvenida onNext={() => go(idx + 1)} />;
      case 'salon':       return <SecSalon />;
      case 'manteleria':  return <SecManteleria />;
      case 'menu':        return <SecMenu />;
      case 'cortesias':   return <SecCortesias />;
      case 'paquetes':    return <SecPaquetes onGo={goId} />;
      case 'cotizador':   return <SecCotizador />;
      case 'testimonios': return <SecTestimonios />;
      case 'fechas':      return <SecFechas />;
      case 'cierre':      return <SecCierre onGo={goId} />;
      default: return null;
    }
  };

  return (
    <div className="vv-app">
      <Rail steps={steps} current={cur.id} visited={visited} onGo={go} />

      <div className="vv-main">
        <div className="vv-topbar">
          <div className="vv-topbar__crumb" role="status" aria-live="polite">
            Paso {cur.n} / {steps.length} <span style={{ opacity: .4 }}>·</span> <b>{cur.title}</b>
          </div>

          {showResumen && (
            <div className="vv-resumen" title="Resumen de la cotización en curso">
              <span className="vv-resumen__item"><Icon name="diamond" size={14} style={{ color: rPkg.accent }} /> {rPkg.name}</span>
              <span className="vv-resumen__sep" />
              <span className="vv-resumen__item"><Icon name="users" size={14} /> {rGuests} inv.</span>
              <span className="vv-resumen__sep" />
              <Money value={rTotalNum} className="vv-resumen__item vv-resumen__total" />
            </div>
          )}

          <div className="vv-navbtns">
            <button className="vv-navbtn vv-navbtn--reset" onClick={nuevoCliente} title="Borrar datos y empezar con otro cliente">
              <Icon name="refresh" size={15} /> <span className="vv-navbtn__lbl">Nuevo cliente</span>
            </button>
            <button className="vv-navbtn" onClick={() => go(idx - 1)} disabled={idx === 0}>
              <Icon name="left" size={16} /> <span className="vv-navbtn__lbl">Anterior</span>
            </button>
            <button className="vv-navbtn vv-navbtn--primary" onClick={() => go(idx + 1)} disabled={idx === steps.length - 1}>
              <span className="vv-navbtn__lbl">Siguiente</span> <Icon name="right" size={16} />
            </button>
          </div>
        </div>

        <div className="vv-progress" aria-hidden="true">
          <div className="vv-progress__bar" style={{ width: ((idx + 1) / steps.length * 100) + '%' }} />
        </div>

        <div className="vv-stage vv-scroll" ref={stageRef}
          style={{ paddingBottom: showGuion ? 'var(--dock-h)' : 0 }}>
          <div key={cur.id}>{render()}</div>
        </div>

        {showGuion && (
          <GuionDock stepId={cur.id} stepTitle={cur.title} open={dock} onToggle={() => setDock(o => !o)} />
        )}
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Marca" />
        <TweakColor label="Color primario" value={t.primary}
          options={['#A4154B', '#B30E66', '#7C0E37', '#9F1239']}
          onChange={(v) => setTweak('primary', v)} />
        <TweakSelect label="Tipografía de títulos" value={t.titleFont}
          options={['Cormorant Garamond']}
          onChange={(v) => setTweak('titleFont', v)} />
        <TweakSection label="Presentación" />
        <TweakToggle label="Mostrar guión del asesor" value={t.showGuion}
          onChange={(v) => setTweak('showGuion', v)} />
      </TweaksPanel>

      <Lightbox />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
