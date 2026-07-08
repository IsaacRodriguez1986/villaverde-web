/* =====================================================================
   VILLAVERDE · Secciones 1 — Bienvenida · El Salón · Mantelería
   ===================================================================== */

/* ---------------- 1 · BIENVENIDA ---------------- */
function SecBienvenida({ onNext }) {
  return (
    <div className="vv-section" style={{ paddingTop: 30 }}>
      <div className="vv-split" style={{ display: 'grid', gridTemplateColumns: '1.04fr .96fr', gap: 54, alignItems: 'center' }}>
        <div>
          <p className="vv-eyebrow">Salón de Fiestas · Temporada 2026</p>
          <h1 className="vv-h1" style={{ fontSize: 'clamp(46px,5.4vw,70px)' }}>
            Tu evento soñado,<br /><em>sin costos ocultos</em>
          </h1>
          <p className="vv-lead">
            Bienvenidos a Villaverde. En los próximos minutos vamos a diseñar
            juntos la fiesta perfecta: el salón, los colores, el menú, las
            sorpresas y tu inversión final — todo, paso a paso.
          </p>
          <div style={{ display: 'flex', gap: 14, marginBottom: 38 }}>
            <button className="vv-btn" onClick={onNext}>
              Comenzar el recorrido <Icon name="right" size={18} stroke={2.4} />
            </button>
            <span className="vv-chip"><Icon name="clock" size={15} /> ~10 minutos</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, borderTop: '1px solid var(--vv-line)', paddingTop: 24 }}>
            {VV.STATS.map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: 'var(--vv-display)', fontWeight: 700, fontSize: 34, color: 'var(--vv-crimson)', lineHeight: 1 }}><CountUp value={s.n} /></div>
                <div style={{ fontSize: 12, color: 'var(--vv-muted)', marginTop: 6, lineHeight: 1.3 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <PhotoSlot id="foto-hero" src="assets/salon-villaverde-exterior.jpg"
            style={{
              borderRadius: '160px 160px 22px 22px', overflow: 'hidden',
              border: '6px solid var(--vv-cream)', boxShadow: 'var(--vv-shadow-lg)', aspectRatio: '4/5',
            }} />
          <div style={{
            position: 'absolute', bottom: -22, left: -22, background: 'var(--vv-cream)',
            borderRadius: 16, padding: '14px 20px', boxShadow: 'var(--vv-shadow-md)',
            display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--vv-line)',
          }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--vv-paper-2)', display: 'grid', placeItems: 'center', color: 'var(--vv-gold)' }}>
              <Icon name="diamond" size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--vv-ink)' }}>Paquetes todo incluido</div>
              <div style={{ fontSize: 12, color: 'var(--vv-muted)' }}>Aparta con solo $3,000</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 2 · EL SALÓN ---------------- */
const SALONES = [
  {
    id: 'villaverde', name: 'Salón Villaverde', tag: 'El íntimo', cap: 250,
    real: 'assets/salon-principal.jpg',
    desc: 'Nuestro salón clásico: cálido y acogedor, perfecto para una celebración entrañable. Techo entelado, candiles de cristal y pista de espejo.',
  },
  {
    id: 'gardenia', name: 'Salón Gardenia', tag: 'El gran salón', cap: 450,
    real: null, pano: 'assets/gardenia-panorama.jpg',
    desc: 'El espacio más amplio de Villaverde: gran capacidad sin perder elegancia, ideal para fiestas en grande con todo el lujo de detalles.',
  },
];

function SecSalon() {
  const [sid, setSid] = useState(() => localStorage.getItem('vv_salon') || 'villaverde');
  useEffect(() => { localStorage.setItem('vv_salon', sid); }, [sid]);
  const sal = SALONES.find(s => s.id === sid);

  const amen = [
    { icon: 'users', t: `Hasta ${sal.cap} invitados`, s: 'Capacidad cómoda y holgada' },
    { icon: 'car', t: '45 cajones', s: 'Estacionamiento propio' },
    { icon: 'shield', t: 'Seguridad', s: 'Vigilancia toda la noche' },
    { icon: 'sparkle', t: 'Pista de espejo', s: 'Candiles y techo entelado' },
  ];

  return (
    <div className="vv-section">
      <p className="vv-eyebrow">El Salón</p>
      <h1 className="vv-h1">Dos salones, <em>una experiencia</em></h1>
      <p className="vv-lead">Elige el espacio según el tamaño de tu fiesta. Ambos comparten el sello Villaverde: elegancia, servicio y todo incluido.</p>

      {/* Selector de salón */}
      <div className="vv-salonpick">
        {SALONES.map(s => {
          const on = s.id === sid;
          return (
            <button key={s.id} className={'vv-salontab' + (on ? ' is-on' : '')} onClick={() => setSid(s.id)}>
              <div className="vv-salontab__top">
                <Icon name={s.id === 'gardenia' ? 'leaf' : 'diamond'} size={22} style={{ color: on ? 'var(--vv-crimson)' : 'var(--vv-muted-2)' }} />
                <span className="vv-salontab__cap"><Icon name="users" size={15} /> {s.cap}</span>
              </div>
              <div className="vv-salontab__name">{s.name}</div>
              <div className="vv-salontab__tag">{s.tag} · hasta {s.cap} personas</div>
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--vv-muted)', maxWidth: 720, margin: '0 0 24px' }}>{sal.desc}</p>

      {sal.pano ? (
        /* Panorámica full-width (Gardenia) */
        <PhotoSlot id="gardenia-pano" src={sal.pano} className="vv-panowrap"
          style={{ aspectRatio: '2560 / 663', width: '100%' }}
          overlay={
            <div className="vv-pano__label">
              <div style={{ fontFamily: 'var(--vv-display)', fontSize: 26, fontWeight: 600 }}>{sal.name}</div>
              <div style={{ fontSize: 12.5, opacity: .92 }}>Vista panorámica · hasta {sal.cap} invitados</div>
            </div>
          } />
      ) : (
        <div key={sid} style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 300px) 1fr', gap: 18, marginBottom: 18, alignItems: 'start' }}>
          {/* Video del salón (vertical) */}
          <div style={{ position: 'relative' }}>
            <video src="assets/salon-muestra.mp4" controls playsInline preload="none" poster="assets/salon-muestra-poster.jpg"
              style={{ width: '100%', aspectRatio: '9/16', objectFit: 'cover', borderRadius: 'var(--vv-radius-lg)', border: '1px solid var(--vv-line)', boxShadow: 'var(--vv-shadow-md)', background: '#000', display: 'block' }} />
            <div style={{ position: 'absolute', left: 14, top: 12, color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', textShadow: '0 1px 6px rgba(0,0,0,.7)', pointerEvents: 'none' }}>{sal.name} · video</div>
          </div>
          {/* Foto destacada */}
          <PhotoSlot id={sid + '-feat'} src={sal.real || undefined} placeholder={'Foto de ' + sal.name}
            style={{ minHeight: 320, height: '100%', borderRadius: 'var(--vv-radius-lg)', overflow: 'hidden', border: '1px solid var(--vv-line)', boxShadow: 'var(--vv-shadow-sm)' }} />
        </div>
      )}

      {/* Galería */}
      <div key={sid + '-g'} className="vv-grid--4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 36 }}>
        {['Jardín & fachada', 'Mesa montada', 'Pista & escenario', 'Detalles'].map((cap, i) => (
          <PhotoSlot key={i} id={sid + '-gal-' + i} placeholder={cap}
            style={{ borderRadius: 'var(--vv-radius)', overflow: 'hidden', border: '1px solid var(--vv-line)', aspectRatio: '1/1', boxShadow: 'var(--vv-shadow-sm)' }} />
        ))}
      </div>

      {/* Plano 3D — solo Villaverde */}
      {sid === 'villaverde' && (
        <div className="vv-kenburns" style={{ marginBottom: 36, borderRadius: 'var(--vv-radius-lg)', overflow: 'hidden', border: '1px solid var(--vv-line)', boxShadow: 'var(--vv-shadow-md)', position: 'relative', background: '#f5f2ee' }}>
          <img src="assets/plano-3d-vacio-hd.jpg" alt="Plano 3D del Salón Villaverde" loading="lazy" decoding="async" style={{ width: '100%', display: 'block' }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(0deg, rgba(26,10,16,.72) 0%, transparent 100%)',
            padding: '48px 28px 22px',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          }}>
            <div style={{ color: '#fff' }}>
              <div style={{ fontFamily: 'var(--vv-display)', fontSize: 22, fontWeight: 600, textShadow: '0 2px 8px rgba(0,0,0,.4)' }}>Distribución del salón</div>
              <div style={{ fontSize: 13, opacity: .88, marginTop: 3 }}>Vista aérea 3D · Salón Villaverde · hasta 250 invitados</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(8px)', borderRadius: 10, padding: '8px 14px', color: '#fff', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
              <Icon name="sparkle" size={14} style={{ marginRight: 5, verticalAlign: -2 }} />Pista de espejo central
            </div>
          </div>
        </div>
      )}

      {/* Amenidades */}
      <div className="vv-grid--4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {amen.map((a, i) => (
          <div key={i} className="vv-card vv-tile" style={{ padding: '20px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--vv-crimson)', flex: 'none' }}><Icon name={a.icon} size={26} stroke={1.7} /></div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>{a.t}</div>
              <div style={{ fontSize: 12.5, color: 'var(--vv-muted)', marginTop: 3 }}>{a.s}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 3 · MANTELERÍA (visualizador) ---------------- */
function Tablescape({ color }) {
  const c = color.hex, cd = color.deep;
  return (
    <div className="ts-stage">
      <div className="ts-backdrop" style={{ background: `linear-gradient(180deg, ${c}22, ${cd}44)` }} />
      {/* sillas chiavari detrás */}
      {[-150, 0, 150].map((x, i) => (
        <div key={i} className="ts-chair" style={{ left: `calc(50% + ${x}px)` }}>
          <div className="ts-chair__back" />
          <div className="ts-chair__seat" style={{ background: c }} />
        </div>
      ))}
      {/* mesa */}
      <div className="ts-table">
        <div className="ts-skirt" style={{ background: `linear-gradient(180deg, ${c}, ${cd})` }}>
          <div className="ts-pleats" />
        </div>
        <div className="ts-top" style={{ background: `radial-gradient(120% 140% at 42% 22%, ${mix(c,'#ffffff',.34)}, ${c} 52%, ${cd})` }}>
          <div className="ts-overlay" style={{ background: `radial-gradient(120% 130% at 45% 25%, ${mix(c,'#ffffff',.5)}aa, ${c}55)` }} />
          {/* plaques / platos */}
          {[{x:46,y:74},{x:115,y:90},{x:185,y:95},{x:255,y:90},{x:324,y:74}].map((p, i) => (
            <div key={i} className="ts-plate" style={{ left: p.x, top: p.y }}>
              <div className="ts-napkin" style={{ background: `linear-gradient(160deg, ${mix(c,'#ffffff',.6)}, ${mix(c,'#ffffff',.25)})` }} />
            </div>
          ))}
          {/* centro de mesa */}
          <div className="ts-center">
            <div className="ts-vase" />
            <div className="ts-bloom">
              {[[-14,-6,18],[8,-14,20],[18,2,16],[-4,8,17],[2,-2,22]].map((b,i)=>(
                <span key={i} className="ts-flower" style={{ left:`calc(50% + ${b[0]}px)`, top:`${b[1]+18}px`, width:b[2], height:b[2] }} />
              ))}
              {[[-20,8],[20,10],[0,-2]].map((l,i)=>(
                <span key={'l'+i} className="ts-leaf" style={{ left:`calc(50% + ${l[0]}px)`, top:`${l[1]+22}px` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecManteleria() {
  const [sel, setSel] = useState(() => {
    const saved = localStorage.getItem('vv_mantel');
    return VV.MANTELES.find(m => m.id === saved) || VV.MANTELES[0];
  });
  useEffect(() => { localStorage.setItem('vv_mantel', sel.id); }, [sel]);

  // Precarga en idle las fotos de mantelería: el crossfade nunca cruza sobre una imagen en blanco
  useEffect(() => {
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
    const h = idle(() => {
      VV.MANTELES.forEach(m => {
        if (m.photo) {
          const im = new Image();
          im.decoding = 'async';
          im.src = m.photo;
          if (im.decode) im.decode().catch(() => {});
        }
      });
    });
    return () => { (window.cancelIdleCallback || clearTimeout)(h); };
  }, []);

  return (
    <div className="vv-section">
      <p className="vv-eyebrow">Visualizador de Mantelería</p>
      <h1 className="vv-h1">Elige el color de <em>tu mesa</em></h1>
      <p className="vv-lead">Toca un color y mira cómo cambia por completo el ambiente. Así se verá tu mesa el día del evento.</p>

      <div className="vv-split" style={{ display: 'grid', gridTemplateColumns: '1.4fr .8fr', gap: 30, alignItems: 'center' }}>
        <div className={"vv-card" + (sel.photo ? " vv-zoomable vv-kenburns" : "")} style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
          {sel.photo ? (
            <React.Fragment>
              <img key={sel.id} className="vv-pano vv-swap" src={sel.photo} alt={`Mesa montada con mantelería y cintas ${sel.name} en el salón Villaverde`} style={{ display: 'block', width: '100%', height: 460, objectFit: 'cover', objectPosition: 'center 72%' }} />
              <div className="vv-pano__label">
                <div style={{ fontFamily: 'var(--vv-display)', fontSize: 20, fontWeight: 600, lineHeight: 1.1 }}>Así se ve tu mesa en el salón</div>
                <div style={{ fontSize: 12.5, opacity: .85, marginTop: 3 }}>Montaje real · Mantelería y cintas {sel.name} · toca para ampliar</div>
              </div>
            </React.Fragment>
          ) : (
            <Tablescape color={sel} />
          )}
        </div>

        <div>
          <div style={{ fontFamily: 'var(--vv-display)', fontSize: 30, fontWeight: 600, color: sel.hex, lineHeight: 1, marginBottom: 4 }}>{sel.name}</div>
          <div style={{ fontSize: 13, color: 'var(--vv-muted)', marginBottom: 22 }}>Mantelería seleccionada</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
            {VV.MANTELES.map(m => (
              <button key={m.id} onClick={() => setSel(m)} title={m.name}
                style={{
                  aspectRatio: '1/1', borderRadius: '50%', cursor: 'pointer',
                  display: 'grid', placeItems: 'center',
                  background: `radial-gradient(circle at 35% 30%, ${mix(m.hex,'#ffffff',.35)}, ${m.hex} 60%, ${m.deep})`,
                  border: sel.id === m.id ? '3px solid var(--vv-ink)' : '3px solid transparent',
                  boxShadow: sel.id === m.id ? '0 0 0 3px var(--vv-cream), var(--vv-shadow-md)' : 'var(--vv-shadow-sm)',
                  transition: 'transform .15s', transform: sel.id === m.id ? 'scale(1.08)' : 'none',
                }}>
                {sel.id === m.id && <Icon name="check" size={20} stroke={3} style={{ color: '#fff', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.55))' }} />}
              </button>
            ))}
          </div>

          <div className="vv-card" style={{ padding: '16px 18px', background: 'var(--vv-paper-2)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--vv-gold)', flex: 'none' }}><Icon name="diamond" size={20} /></div>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--vv-muted)' }}>
              La <b style={{ color: 'var(--vv-ink)' }}>mantelería a color</b> viene incluida desde el paquete <b style={{ color: 'var(--vv-gold)' }}>Diamante</b>. Combínala con el tema de tu fiesta.
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}

/* mezcla simple de dos hex (#rrggbb) con factor t hacia b */
function mix(a, b, t) {
  const pa = [parseInt(a.slice(1,3),16), parseInt(a.slice(3,5),16), parseInt(a.slice(5,7),16)];
  const pb = [parseInt(b.slice(1,3),16), parseInt(b.slice(3,5),16), parseInt(b.slice(5,7),16)];
  const r = pa.map((v, i) => Math.round(v + (pb[i]-v)*t));
  return '#' + r.map(v => v.toString(16).padStart(2,'0')).join('');
}

Object.assign(window, { SecBienvenida, SecSalon, SecManteleria, Tablescape, mix });
