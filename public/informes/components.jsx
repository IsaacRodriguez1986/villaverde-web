/* =====================================================================
   VILLAVERDE · Componentes compartidos (iconos, rail, guión dock)
   ===================================================================== */
const { useState, useEffect, useRef, useMemo } = React;

/* ---------------- ICONOS (stroke, line) ---------------- */
function Icon({ name, size = 20, stroke = 2, style, className }) {
  const P = { fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    chevron:  <polyline points="6 9 12 15 18 9" {...P} />,
    left:     <g {...P}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></g>,
    right:    <g {...P}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></g>,
    check:    <polyline points="20 6 9 17 4 12" {...P} />,
    plus:     <g {...P}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></g>,
    diamond:  <g {...P}><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9 3l-3 6 6 12 6-12-3-6"/></g>,
    soup:     <g {...P}><path d="M4 11h16a8 8 0 0 1-16 0z"/><line x1="6" y1="2" x2="6.5" y2="5"/><line x1="10" y1="2" x2="10.5" y2="5"/><line x1="14" y1="2" x2="14.5" y2="5"/><line x1="3" y1="22" x2="21" y2="22"/></g>,
    plate:    <g {...P}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/></g>,
    cake:     <g {...P}><path d="M4 21h16v-6a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3z"/><path d="M4 16c2 1.4 3.3 1.4 5.3 0 2-1.4 3.4-1.4 5.4 0 2 1.4 3.3 1.4 5.3 0"/><line x1="12" y1="5" x2="12" y2="9"/><circle cx="12" cy="3.5" r="1"/></g>,
    robot:    <g {...P}><rect x="5" y="8" width="14" height="11" rx="2"/><line x1="12" y1="8" x2="12" y2="4"/><circle cx="12" cy="3" r="1.3"/><circle cx="9" cy="13" r="1.1"/><circle cx="15" cy="13" r="1.1"/><line x1="9" y1="19" x2="9" y2="22"/><line x1="15" y1="19" x2="15" y2="22"/></g>,
    camera:   <g {...P}><path d="M3 8h3l2-3h8l2 3h3v11H3z"/><circle cx="12" cy="13" r="3.5"/></g>,
    co2:      <g {...P}><path d="M7 16a4 4 0 1 1 1-7.9A5 5 0 0 1 18 9a3.5 3.5 0 0 1-.5 7H7z"/><line x1="9" y1="20" x2="9" y2="22"/><line x1="13" y1="20" x2="13" y2="23"/><line x1="17" y1="20" x2="17" y2="22"/></g>,
    flower:   <g {...P}><circle cx="12" cy="9" r="2.2"/><path d="M12 6.8c0-2.2 3-2.6 3-.4 2-.9 3.4 1.6 1.4 2.8 2 .6 1 3.4-1 2.6.7 2-2.4 2.8-3 1M12 6.8c0-2.2-3-2.6-3-.4-2-.9-3.4 1.6-1.4 2.8-2 .6-1 3.4 1 2.6-.7 2 2.4 2.8 3 1"/><line x1="12" y1="13" x2="12" y2="22"/></g>,
    arch:     <g {...P}><path d="M5 21V10a7 7 0 0 1 14 0v11"/><line x1="3" y1="21" x2="21" y2="21"/></g>,
    bubble:   <g {...P}><circle cx="9" cy="13" r="4"/><circle cx="16" cy="8" r="2.5"/><circle cx="17" cy="16" r="1.5"/></g>,
    jump:     <g {...P}><circle cx="12" cy="4" r="1.6"/><path d="M12 6v6m0 0-3 5m3-5 3 5M9 9l3 1 3-1"/></g>,
    mic:      <g {...P}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="9" y1="21" x2="15" y2="21"/></g>,
    dance:    <g {...P}><circle cx="13" cy="4" r="1.6"/><path d="M13 6c-1 2-3 2.5-4.5 2.5M13 6l2 3.5L12 14l1 7m2-11.5 3 1.5"/></g>,
    mask:     <g {...P}><path d="M4 5c5-1 11-1 16 0 .5 6-1.5 13-8 13S3.5 11 4 5z"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/><path d="M9.5 14c1.5 1 3.5 1 5 0"/></g>,
    film:     <g {...P}><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="4" x2="7" y2="20"/><line x1="17" y1="4" x2="17" y2="20"/><line x1="3" y1="12" x2="21" y2="12"/></g>,
    star:     <polygon points="12 2.5 15 9 22 9.7 16.8 14.4 18.3 21.3 12 17.6 5.7 21.3 7.2 14.4 2 9.7 9 9" {...P} />,
    users:    <g {...P}><circle cx="9" cy="8" r="3"/><path d="M3 21a6 6 0 0 1 12 0"/><path d="M16 6a3 3 0 0 1 0 5.5M21 21a6 6 0 0 0-4-5.6"/></g>,
    car:      <g {...P}><path d="M5 17h14M3 17l1.5-6a2 2 0 0 1 2-1.5h11a2 2 0 0 1 2 1.5L23 17M3 17v3h3v-3M18 17v3h3v-3"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/></g>,
    shield:   <g {...P}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><polyline points="9 12 11 14 15 10"/></g>,
    badge:    <g {...P}><circle cx="12" cy="9" r="6"/><path d="M9 14l-1 7 4-2 4 2-1-7"/></g>,
    play:     <polygon points="7 4 20 12 7 20" {...P} />,
    clock:    <g {...P}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></g>,
    pin:      <g {...P}><path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z"/><circle cx="12" cy="11" r="2.3"/></g>,
    gift:     <g {...P}><rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M4 13h16M12 9v11"/><path d="M12 9C9 9 7 4 12 4M12 9c3 0 5-5 0-5"/></g>,
    church:   <g {...P}><path d="M12 2v6M9.5 5h5M5 21V11l7-4 7 4v10M9 21v-4a3 3 0 0 1 6 0v4"/></g>,
    calendar: <g {...P}><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></g>,
    sparkle:  <g {...P}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18 4l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/></g>,
    target:   <g {...P}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></g>,
    chat:     <g {...P}><path d="M21 11.5a8 8 0 0 1-11.5 7.2L4 20l1.3-4.5A8 8 0 1 1 21 11.5z"/></g>,
    drink:    <g {...P}><path d="M5 4h14l-6 8v6m0 0h4m-4 0H9"/><path d="M6 7h12"/></g>,
    leaf:     <g {...P}><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19c4-5 7-7 11-9"/></g>,
    heart:    <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5C19 15.5 12 20 12 20z" {...P} />,
    money:    <g {...P}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><line x1="6" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="18" y2="12"/></g>,
    refresh:  <g {...P}><path d="M21 12a9 9 0 1 1-2.64-6.36"/><polyline points="21 4 21 10 15 10"/></g>,
    doc:      <g {...P}><path d="M7 3h8l4 4v14H7z"/><polyline points="14 3 14 8 19 8"/><line x1="10" y1="13" x2="16" y2="13"/><line x1="10" y1="17" x2="16" y2="17"/></g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}
      style={{ display: 'block', ...style }} aria-hidden="true">
      {paths[name] || paths.sparkle}
    </svg>
  );
}

/* Número que cuenta desde 0 hasta su valor al montar (respeta reduce-motion).
   Acepta prefijos/sufijos: '+12', '+800', '45', '100%'. */
function CountUp({ value, dur = 1100, className, style }) {
  const m = String(value).match(/^(\D*)([\d.,]+)(\D*)$/);
  const target = m ? parseFloat(m[2].replace(/,/g, '')) : null;
  const pre = m ? m[1] : '';
  const suf = m ? m[3] : '';
  const [n, setN] = useState(target == null ? 0 : 0);
  useEffect(() => {
    if (target == null) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setN(target); return; }
    let raf, start;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [value]);
  if (target == null) return <span className={className} style={style}>{value}</span>;
  return <span className={className} style={style}>{pre}{n.toLocaleString('es-MX')}{suf}</span>;
}

/* Interpola un número hacia su nuevo valor cuando cambia (respeta reduce-motion).
   Arranca cada transición desde el valor actualmente mostrado → suave aun arrastrando. */
function useTween(value, dur = 450) {
  const [disp, setDisp] = useState(value);
  const dispRef = useRef(value);
  useEffect(() => { dispRef.current = disp; });
  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start0 = dispRef.current;
    if (reduce || start0 === value) { setDisp(value); return; }
    let startTs, raf;
    const tick = (ts) => {
      if (!startTs) startTs = ts;
      const p = Math.min(1, (ts - startTs) / dur);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setDisp(Math.round(start0 + (value - start0) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [value]);
  return disp;
}

/* Monto en pesos que rueda suavemente hacia su nuevo valor. */
function Money({ value, className, style }) {
  const v = useTween(value);
  return <span className={className} style={{ fontVariantNumeric: 'tabular-nums', ...style }}>${v.toLocaleString('es-MX')}</span>;
}

function Stars({ n = 5, size = 16 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, color: 'var(--vv-gold)' }}>
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,.08))' }}>
          <Icon name="star" size={size} stroke={1.2} style={{ fill: 'var(--vv-gold)', color: 'var(--vv-gold)' }} />
        </span>
      ))}
    </span>
  );
}

/* ---------------- RAIL (navegación cronológica) ---------------- */
function Rail({ steps, current, visited, onGo }) {
  return (
    <aside className="vv-rail">
      <div className="vv-rail__brand">
        <img src="assets/logo-villaverde.png" alt="Villaverde" />
        <div>
          <h1>Villaverde</h1>
          <span>Salón de Fiestas</span>
        </div>
      </div>
      <ul className="vv-steps vv-scroll">
        <li className="vv-steps__label">Recorrido de venta</li>
        {steps.map((s, i) => {
          const active = s.id === current;
          const done = visited.has(s.id) && !active;
          return (
            <li key={s.id}
              className={'vv-step' + (active ? ' is-active' : '') + (done ? ' is-done' : '')}
              tabIndex={0} role="button" aria-current={active ? 'step' : undefined}
              onClick={() => onGo(i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onGo(i); } }}>
              <span className="vv-step__num">{done ? <Icon name="check" size={15} stroke={2.6} /> : s.n}</span>
              <span className="vv-step__txt"><b>{s.title}</b><small>{s.sub}</small></span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

/* ---------------- GUIÓN DEL ASESOR (dock) ---------------- */
function GuionDock({ stepId, stepTitle, open, onToggle }) {
  const g = VV.GUION[stepId];
  if (!g) return null;
  return (
    <div className={'vv-dock' + (open ? ' is-open' : '')}>
      <div className="vv-dock__handle" onClick={onToggle}>
        <div className="vv-dock__handle-l">
          <span className="vv-dock__tag">Solo asesor</span>
          {!open && <span className="vv-dock__pulse" />}
          <span className="vv-dock__title">Guión · <b>{stepTitle}</b></span>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--vv-gold-soft)', fontWeight: 700 }}>
          {open ? 'Ocultar' : 'Ver argumentos de venta'}
          <Icon name="chevron" size={20} className="vv-dock__chev" />
        </span>
      </div>
      <div className="vv-dock__body vv-scroll">
        <div className="vv-dock__col">
          <h4><Icon name="target" size={14} /> Objetivo de este paso</h4>
          <p style={{ margin: '0 0 8px', fontSize: 14.5, lineHeight: 1.5, color: '#EBD8CE' }}>{g.obj}</p>
          <h4><Icon name="chat" size={14} /> Qué decir</h4>
          <div className="vv-dock__script"><p className="say">{g.say}</p></div>
        </div>
        <div className="vv-dock__col">
          <h4><Icon name="sparkle" size={14} /> Tips clave</h4>
          <ul className="vv-dock__list">
            {g.tips.map((t, i) => <li key={i}><Icon name="check" size={15} stroke={2.6} />{t}</li>)}
          </ul>
          <h4 style={{ marginTop: 16 }}><Icon name="shield" size={14} /> Maneja objeciones</h4>
          <div className="vv-dock__obj">
            {g.obj_handling.map((o, i) => (
              <div key={i}><div className="q">{o.q}</div><div className="a">{o.a}</div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- LIGHTBOX (ampliar + zoom de fotos) ---------------- */
function Lightbox() {
  const [src, setSrc] = useState(null);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef(null);
  const moved = useRef(false);
  const [nat, setNat] = useState(null);
  const lastFocus = useRef(null);   // foco previo, para restaurarlo al cerrar
  const closeRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      const path = e.composedPath ? e.composedPath() : [];
      const slot = path.find(n => n && n.tagName && n.tagName.toLowerCase() === 'image-slot');
      if (slot && slot.shadowRoot) {
        const t = e.target;
        if (t && t.getAttribute && t.getAttribute('data-act')) return;
        const img = slot.shadowRoot.querySelector('.frame img');
        if (img && img.getAttribute('src') && getComputedStyle(img).display !== 'none') {
          e.preventDefault(); e.stopPropagation(); lastFocus.current = document.activeElement; setSrc(img.src);
        }
        return;
      }
      const z = e.target.closest && e.target.closest('.vv-zoomable');
      if (z) {
        const img = z.tagName === 'IMG' ? z : z.querySelector('img');
        if (img && img.src) { e.preventDefault(); lastFocus.current = document.activeElement; setSrc(img.src); }
      }
    }
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setSrc(null);
      if (e.key === '+' || e.key === '=') setScale(s => Math.min(6, s + 0.4));
      if (e.key === '-') setScale(s => Math.max(1, s - 0.4));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => { setScale(1); setPos({ x: 0, y: 0 }); setNat(null); }, [src]);
  useEffect(() => { if (scale === 1) setPos({ x: 0, y: 0 }); }, [scale]);

  // Al abrir, lleva el foco al botón cerrar; al cerrar, lo devuelve al elemento que lo abrió
  useEffect(() => {
    if (src) { if (closeRef.current) closeRef.current.focus(); }
    else if (lastFocus.current && lastFocus.current.focus) lastFocus.current.focus();
  }, [src]);

  if (!src) return null;

  const onWheel = (e) => {
    e.preventDefault();
    setScale(s => Math.min(6, Math.max(1, +(s + (e.deltaY > 0 ? -0.3 : 0.3)).toFixed(2))));
  };
  const onPointerDown = (e) => {
    if (scale <= 1) return;
    moved.current = false;
    drag.current = { x: e.clientX, y: e.clientY, ox: pos.x, oy: pos.y };
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true;
    setPos({ x: drag.current.ox + dx, y: drag.current.oy + dy });
  };
  const onPointerUp = () => { drag.current = null; };
  const onBackdrop = () => { if (!moved.current) setSrc(null); };
  const toggleZoom = (e) => { e.stopPropagation(); setScale(s => (s > 1 ? 1 : 2.4)); };

  return (
    <div className="vv-lightbox" role="dialog" aria-modal="true" aria-label="Foto ampliada" onClick={onBackdrop} onWheel={onWheel}
      onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
      <button ref={closeRef} className="vv-lightbox__close" aria-label="Cerrar" onClick={(e) => { e.stopPropagation(); setSrc(null); }}>
        <span style={{ fontSize: 26, lineHeight: 1, fontWeight: 300 }}>&times;</span>
      </button>

      <img src={src} alt="" className="vv-lightbox__img"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
          cursor: scale > 1 ? (drag.current ? 'grabbing' : 'grab') : 'zoom-in',
          maxWidth: nat ? `min(95vw, ${nat.w}px)` : '95vw',
          maxHeight: nat ? `min(88vh, ${nat.h}px)` : '88vh',
        }}
        onLoad={(e) => setNat({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={toggleZoom}
        onPointerDown={onPointerDown}
        draggable="false" />

      <div className="vv-lightbox__bar" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setScale(s => Math.max(1, +(s - 0.4).toFixed(2)))} title="Alejar">&minus;</button>
        <span>{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale(s => Math.min(6, +(s + 0.4).toFixed(2)))} title="Acercar">+</button>
        <span className="vv-lightbox__bar-sep" />
        <button onClick={() => { setScale(1); setPos({ x: 0, y: 0 }); }} title="Restablecer">Ajustar</button>
      </div>
    </div>
  );
}

/* ---------------- PHOTO SLOT (foto reemplazable con botones) ---------------- */
function PhotoSlot({ id, src, shape = 'rect', radius, placeholder = 'Arrastra una foto', overlay, className, style }) {
  const ref = useRef(null);
  const act = (sel) => (e) => {
    e.stopPropagation();
    const s = ref.current;
    const el = s && s.shadowRoot && s.shadowRoot.querySelector(sel);
    if (el) el.click();
  };
  const props = { ref, id, shape, placeholder, style: { width: '100%', height: '100%', display: 'block' } };
  if (src) props.src = src;
  if (radius != null) props.radius = radius;
  return (
    <div className={'vv-photo ' + (className || '')} style={style}>
      {React.createElement('image-slot', props)}
      {overlay}
      <div className="vv-photo__tools" onClick={(e) => e.stopPropagation()}>
        <button onClick={act('input[type="file"]')} title="Cambiar foto">
          <Icon name="camera" size={14} /> Cambiar
        </button>
        <button className="vv-photo__rm" onClick={act('[data-act="clear"]')} title="Quitar foto">
          <span style={{ fontSize: 15, lineHeight: 1, fontWeight: 400 }}>&times;</span> Quitar
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { Icon, Stars, CountUp, useTween, Money, Rail, GuionDock, Lightbox, PhotoSlot });
