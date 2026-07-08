/* =====================================================================
   VILLAVERDE · Secciones 3 — Paquetes · Cotizador · Fechas · Cierre
   ===================================================================== */

/* ---------------- 6 · PAQUETES ---------------- */
function InvitacionDemo() {
  // cuenta regresiva viva a una fecha fija de muestra
  const target = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + 124); d.setHours(19, 0, 0, 0); return d.getTime(); }, []);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const diff = Math.max(0, target - now);
  const dd = Math.floor(diff / 864e5), hh = Math.floor(diff % 864e5 / 36e5), mm = Math.floor(diff % 36e5 / 6e4), ss = Math.floor(diff % 6e4 / 1e3);
  const cd = [['Días', dd], ['Hrs', hh], ['Min', mm], ['Seg', ss]];

  const Mod = ({ children, alt, pad = '38px 26px' }) => (
    <div style={{ padding: pad, textAlign: 'center', background: alt ? '#fff' : 'transparent', position: 'relative' }}>{children}</div>
  );
  const Eyebrow = ({ children }) => (
    <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#B98A4B', fontWeight: 700, marginBottom: 12 }}>{children}</div>
  );
  const Script = ({ children, size = 30 }) => (
    <div style={{ fontFamily: 'var(--vv-display)', fontStyle: 'italic', fontSize: size, color: '#9C6B3F', lineHeight: 1.1 }}>{children}</div>
  );
  const Rule = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '14px 0' }}>
      <span style={{ height: 1, width: 34, background: '#D9B98F' }} />
      <span style={{ color: '#C99A5C' }}><Icon name="flower" size={13} /></span>
      <span style={{ height: 1, width: 34, background: '#D9B98F' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0 4px' }}>
      <div className="vv-phone">
        <div className="vv-phone__notch" />
        <div className="vv-phone__screen vv-scroll">
          {/* PORTADA */}
          <div style={{ position: 'relative', minHeight: 552, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '30px 24px 30px', overflow: 'hidden' }}>
            <img src="assets/invitacion-xv.jpg" alt="Quinceañera" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 26%' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(58,28,14,.46) 0%, rgba(58,28,14,.05) 26%, rgba(58,28,14,0) 50%, rgba(64,30,15,.42) 74%, rgba(50,22,11,.9) 100%)' }} />
            {/* esquinas doradas */}
            <div style={{ position: 'absolute', top: 14, left: 14, width: 30, height: 30, borderTop: '2px solid rgba(244,214,168,.85)', borderLeft: '2px solid rgba(244,214,168,.85)', borderTopLeftRadius: 6 }} />
            <div style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderTop: '2px solid rgba(244,214,168,.85)', borderRight: '2px solid rgba(244,214,168,.85)', borderTopRightRadius: 6 }} />
            <div style={{ position: 'absolute', bottom: 14, left: 14, width: 30, height: 30, borderBottom: '2px solid rgba(244,214,168,.85)', borderLeft: '2px solid rgba(244,214,168,.85)', borderBottomLeftRadius: 6 }} />
            <div style={{ position: 'absolute', bottom: 14, right: 14, width: 30, height: 30, borderBottom: '2px solid rgba(244,214,168,.85)', borderRight: '2px solid rgba(244,214,168,.85)', borderBottomRightRadius: 6 }} />

            {/* monograma sello */}
            <div style={{ position: 'relative', marginTop: 8 }}>
              <div style={{ width: 64, height: 64, borderRadius: 999, border: '1.5px solid rgba(244,214,168,.9)', display: 'grid', placeItems: 'center', background: 'rgba(58,28,14,.28)', backdropFilter: 'blur(2px)', boxShadow: '0 0 0 4px rgba(58,28,14,.18)' }}>
                <span style={{ fontFamily: 'var(--vv-display)', fontStyle: 'italic', fontSize: 26, color: '#F8E7CC', lineHeight: 1 }}>XV</span>
              </div>
            </div>

            <div style={{ position: 'relative', textAlign: 'center', color: '#fff', paddingBottom: 6 }}>
              <div style={{ fontSize: 10.5, letterSpacing: 5, textTransform: 'uppercase', color: '#F6E3C8', fontWeight: 700, textShadow: '0 1px 6px rgba(0,0,0,.5)' }}>Mis XV Años</div>
              <div style={{ fontFamily: 'var(--vv-display)', fontStyle: 'italic', fontSize: 58, color: '#fff', lineHeight: 1, margin: '6px 0 2px', textShadow: '0 2px 18px rgba(0,0,0,.5)' }}>Valentina</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, margin: '12px 0' }}>
                <span style={{ height: 1, width: 40, background: 'linear-gradient(90deg,transparent,rgba(244,214,168,.9))' }} />
                <span style={{ color: '#F6E3C8' }}><Icon name="flower" size={13} /></span>
                <span style={{ height: 1, width: 40, background: 'linear-gradient(90deg,rgba(244,214,168,.9),transparent)' }} />
              </div>
              <div style={{ fontSize: 13, color: '#FBEFE0', fontWeight: 600, letterSpacing: .5, textShadow: '0 1px 6px rgba(0,0,0,.6)' }}>Sábado 24 de Mayo · 7:00 PM</div>
              <div style={{ marginTop: 16, fontSize: 9.5, letterSpacing: 2.5, textTransform: 'uppercase', color: '#F6E3C8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: .92 }}>
                Desliza para ver más <Icon name="chevron" size={15} className="vv-bob" />
              </div>
            </div>
          </div>

          {/* CUENTA REGRESIVA */}
          <div style={{ padding: '34px 26px', textAlign: 'center', position: 'relative', background: 'linear-gradient(180deg,#4A2211,#5C2E18)' }}>
            <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#E7C49A', fontWeight: 700, marginBottom: 14 }}>Falta poco para mi gran día</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {cd.map(([l, v]) => (
                <div key={l} style={{ minWidth: 54, padding: '14px 6px', borderRadius: 12, background: 'linear-gradient(170deg,rgba(255,245,232,.12),rgba(255,245,232,.03))', border: '1px solid rgba(231,196,154,.4)' }}>
                  <div key={v} className="vv-tick" style={{ fontFamily: 'var(--vv-display)', fontSize: 28, fontWeight: 700, color: '#F8E7CC', lineHeight: 1 }}>{String(v).padStart(2, '0')}</div>
                  <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: '#D6AE83', marginTop: 6 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* FRASE */}
          <Mod>
            <span style={{ color: '#C99A5C' }}><Icon name="flower" size={20} /></span>
            <div style={{ fontFamily: 'var(--vv-display)', fontStyle: 'italic', fontSize: 20, color: '#8A5E38', lineHeight: 1.55, marginTop: 12 }}>
              “Hoy una niña deja de serlo para empezar a escribir su propia historia.”
            </div>
            <Rule />
          </Mod>

          {/* ITINERARIO */}
          <Mod alt pad="34px 30px">
            <Eyebrow>Itinerario</Eyebrow>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[['church', 'Misa de acción de gracias', '6:00 PM'], ['drink', 'Recepción y coctel', '7:30 PM'], ['plate', 'Cena formal', '8:30 PM'], ['dance', 'Vals y baile', '9:30 PM']].map(([ic, t, h], i, a) => (
                <div key={t} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch' }}>
                    <span style={{ width: 30, height: 30, borderRadius: 999, background: '#F3D6C8', color: '#9C6B3F', display: 'grid', placeItems: 'center', flex: 'none' }}><Icon name={ic} size={15} /></span>
                    {i < a.length - 1 && <span style={{ width: 1.5, flex: 1, minHeight: 16, background: '#E6C3A8' }} />}
                  </div>
                  <div style={{ paddingBottom: 16 }}>
                    <div style={{ fontWeight: 700, color: '#6E4F38', fontSize: 13.5 }}>{t}</div>
                    <div style={{ fontSize: 12, color: '#B98A4B', fontWeight: 600 }}>{h}</div>
                  </div>
                </div>
              ))}
            </div>
          </Mod>

          {/* DÓNDE */}
          <Mod>
            <Eyebrow>Ubicación</Eyebrow>
            <Script size={24}>Salón Villaverde</Script>
            <div style={{ fontSize: 12, color: '#8A6A4E', marginTop: 6, lineHeight: 1.5 }}>Av. de las Fiestas 1200<br />Col. Jardines · Ciudad</div>
            <div style={{ height: 96, borderRadius: 12, marginTop: 14, background: 'linear-gradient(135deg,#EAD9C5,#E0C6A8)', position: 'relative', overflow: 'hidden', border: '1px solid #E6C3A8' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '22px 22px' }} />
              <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-60%)', color: '#B0452F' }}><Icon name="pin" size={28} /></span>
            </div>
            <button className="vv-invi-btn" style={{ marginTop: 14 }}><Icon name="pin" size={14} /> Cómo llegar</button>
          </Mod>

          {/* VESTIMENTA */}
          <Mod alt>
            <Eyebrow>Código de vestimenta</Eyebrow>
            <Script size={26}>Etiqueta rigurosa</Script>
            <div style={{ fontSize: 12, color: '#8A6A4E', marginTop: 8 }}>Color reservado para la quinceañera:</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
              {['#E8B4C2', '#C9A05C'].map(c => <span key={c} style={{ width: 26, height: 26, borderRadius: 999, background: c, border: '2px solid #fff', boxShadow: '0 0 0 1px #E6C3A8' }} />)}
            </div>
          </Mod>

          {/* PADRINOS */}
          <Mod>
            <Eyebrow>Con la bendición de</Eyebrow>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
              {[['Mis padres', 'Roberto & Carmen'], ['Mis padrinos', 'Jorge & Lucía']].map(([r, n]) => (
                <div key={r}>
                  <div style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: 'uppercase', color: '#B98A4B', fontWeight: 700 }}>{r}</div>
                  <div style={{ fontFamily: 'var(--vv-display)', fontStyle: 'italic', fontSize: 20, color: '#9C6B3F', marginTop: 2 }}>{n}</div>
                </div>
              ))}
            </div>
          </Mod>

          {/* RSVP */}
          <Mod>
            <Eyebrow>Confirma tu asistencia</Eyebrow>
            <div style={{ fontSize: 12.5, color: '#8A6A4E', lineHeight: 1.5, marginBottom: 14 }}>Tu presencia es el mejor regalo. Por favor confírmanos antes del 10 de mayo.</div>
            <button className="vv-invi-btn" style={{ width: '100%', justifyContent: 'center' }}><Icon name="check" size={15} stroke={2.6} /> Confirmar por WhatsApp</button>
          </Mod>

          {/* MESA DE REGALOS */}
          <Mod alt>
            <Eyebrow>Mesa de regalos</Eyebrow>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 4 }}>
              {[['gift', 'Sobre'], ['gift', 'Liverpool'], ['gift', 'Amazon']].map(([ic, t]) => (
                <div key={t} style={{ flex: 1, padding: '14px 6px', borderRadius: 12, background: 'linear-gradient(170deg,#FBEBE4,#F3D6C8)', border: '1px solid #E6C3A8' }}>
                  <span style={{ color: '#9C6B3F' }}><Icon name={ic} size={20} /></span>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6E4F38', marginTop: 6 }}>{t}</div>
                </div>
              ))}
            </div>
          </Mod>

          {/* CIERRE */}
          <div style={{ padding: '40px 26px', textAlign: 'center', background: 'linear-gradient(190deg,#F7DCD0,#F3D0C2)', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 12, border: '1.5px solid rgba(180,130,70,.45)', borderRadius: 14, pointerEvents: 'none' }} />
            <img src="assets/invitacion-xv.jpg" alt="Valentina" style={{ width: 96, height: 96, borderRadius: 999, objectFit: 'cover', objectPosition: 'center 22%', border: '3px solid #fff', boxShadow: '0 6px 18px -6px rgba(120,70,40,.5)', marginBottom: 14 }} />
            <div style={{ color: '#B0452F' }}><Icon name="flower" size={20} /></div>
            <Script size={34}>¡Te esperamos!</Script>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#A9743F', fontWeight: 700, marginTop: 8 }}>Valentina · Mis XV Años</div>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--vv-muted-2)', marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
        <Icon name="chevron" size={13} /> Desliza dentro del celular para recorrer toda la invitación
      </div>
    </div>
  );
}

function ItemDetalle({ name, accent, onGo, onClose }) {
  const info = VV.ITEM_INFO[name] || {};
  const cort = info.cort ? VV.CORTESIAS.find(c => c.id === info.cort) : null;
  const fotos = info.fotos ? info.fotos : (cort && cort.gallery ? cort.gallery : null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className="vv-imodal" onClick={onClose}>
      <div className="vv-imodal__card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '22px 24px 16px' }}>
          <span style={{
            flex: 'none', width: 52, height: 52, borderRadius: 14, display: 'grid', placeItems: 'center',
            background: 'var(--vv-paper-2)', color: accent,
          }}><Icon name={info.icon || 'check'} size={28} stroke={1.7} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--vv-display)', fontSize: 24, fontWeight: 700, color: 'var(--vv-ink)', lineHeight: 1.1 }}>{name}</div>
            <div style={{ fontSize: 11.5, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 800, color: accent, marginTop: 4 }}>Incluido en tu paquete</div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" style={{
            flex: 'none', width: 34, height: 34, borderRadius: 999, border: '1px solid var(--vv-line)',
            background: 'var(--vv-paper)', color: 'var(--vv-muted)', fontSize: 20, lineHeight: 1, cursor: 'pointer',
          }}>&times;</button>
        </div>

        <div style={{ padding: '0 24px', fontSize: 15, lineHeight: 1.6, color: 'var(--vv-muted)' }}>
          {info.d || 'Elemento incluido en el paquete.'}
        </div>

        {info.invitacion && <InvitacionDemo />}

        {info.video && (
          <div style={{ padding: '18px 24px 4px' }}>
            <video src={info.video} controls playsInline preload="metadata"
              style={{ width: '100%', borderRadius: 12, border: '1px solid var(--vv-line)', boxShadow: 'var(--vv-shadow-md)', background: '#000', display: 'block' }} />
          </div>
        )}

        {!info.invitacion && !info.video && fotos && info.poster && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '18px 24px 4px' }}>
            <img src={fotos[0]} alt={name} className="vv-zoomable"
              style={{ maxWidth: '320px', width: '100%', borderRadius: 12, cursor: 'zoom-in', border: '1px solid var(--vv-line)', boxShadow: 'var(--vv-shadow-md)' }} />
          </div>
        )}

        {!info.invitacion && !info.video && fotos && !info.poster && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(fotos.length, 3)}, 1fr)`, gap: 10, padding: '18px 24px 4px' }}>
            {fotos.map((src, i) => (
              <img key={i} src={src} alt={name} className="vv-zoomable"
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 12, cursor: 'zoom-in', border: '1px solid var(--vv-line)' }} />
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, padding: '18px 24px 22px', marginTop: fotos ? 4 : 14 }}>
          {info.go && (
            <button className="vv-btn" style={{ flex: 1, justifyContent: 'center', background: accent }}
              onClick={() => { onClose(); onGo(info.go); }}>
              {info.cort ? 'Verlo en Cortesías' : 'Verlo en el recorrido'} <Icon name="right" size={16} stroke={2.4} />
            </button>
          )}
          <button className="vv-btn vv-btn--ghost" style={{ flex: info.go ? 'none' : 1, justifyContent: 'center' }}
            onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function SecPaquetes({ onGo }) {
  const pkgs = VV.PAQUETES;
  const [activeId, setActiveId] = useState(() => localStorage.getItem('vv_pkgview') || 'esmeralda');
  const [detalle, setDetalle] = useState(null);
  useEffect(() => { localStorage.setItem('vv_pkgview', activeId); VV.notifyStore(); }, [activeId]);

  const p = pkgs.find(x => x.id === activeId) || pkgs[0];
  const parent = p.hereda ? pkgs.find(x => x.name === p.hereda) : null;
  const hasGal = (name) => {
    const info = VV.ITEM_INFO[name];
    if (!info) return false;
    if (info.fotos && info.fotos.length) return true;
    if (!info.cort) return false;
    const c = VV.CORTESIAS.find(x => x.id === info.cort);
    return !!(c && c.gallery && c.gallery.length);
  };

  return (
    <div className="vv-section">
      {detalle && <ItemDetalle name={detalle} accent={p.accent} onGo={onGo} onClose={() => setDetalle(null)} />}

      <p className="vv-eyebrow">Paquetes Todo Incluido 2026</p>
      <h1 className="vv-h1">Tres formas de <em>celebrar</em></h1>
      <p className="vv-lead">Elige un paquete para verlo a detalle. Toca cualquier elemento incluido para conocer más.</p>

      {/* Pestañas — una hoja por paquete */}
      <div className="vv-grid--3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 22 }}>
        {pkgs.map(pk => {
          const on = pk.id === activeId;
          return (
            <button key={pk.id} onClick={() => setActiveId(pk.id)}
              className={'vv-pkgtab' + (on ? ' is-on' : '')}
              style={on ? { borderColor: pk.accent, boxShadow: `0 0 0 1.5px ${pk.accent}, var(--vv-shadow-md)` } : undefined}>
              {pk.popular && <span className="vv-pkgtab__ribbon">Más elegido</span>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ color: pk.accent }}><Icon name="diamond" size={19} /></span>
                <b style={{ fontFamily: 'var(--vv-display)', fontSize: 22, fontWeight: 700, color: on ? pk.accent : 'var(--vv-ink)' }}>{pk.name}</b>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--vv-muted)', marginTop: 5, fontWeight: 700 }}>{pk.horas}</div>
              <div style={{ marginTop: 7, fontSize: 13.5, fontWeight: 800, color: on ? pk.accent : 'var(--vv-muted)' }}>
                desde ${pk.priceMain}<span style={{ fontWeight: 600, fontSize: 11, color: 'var(--vv-muted-2)' }}> / persona</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Hoja del paquete activo */}
      <div key={p.id} className={'vv-pkgsheet vv-pkg--' + p.tone} style={{
        border: '1px solid var(--vv-line)', borderRadius: 'var(--vv-radius-lg)', overflow: 'hidden',
        background: 'var(--vv-cream)', boxShadow: 'var(--vv-shadow-md)',
      }}>
        {/* Cabecera */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20,
          padding: '24px 28px', borderBottom: '1px solid var(--vv-line)', background: 'var(--vv-paper-2)',
        }}>
          <div style={{ display: 'flex', gap: 15 }}>
            <div style={{ color: p.accent, marginTop: 3 }}><Icon name="diamond" size={32} /></div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--vv-display)', fontSize: 36, fontWeight: 700, color: p.accent, lineHeight: 1 }}>{p.name}</span>
                {p.popular && <span className="vv-pkgsheet__ribbon">Más elegido para XV</span>}
              </div>
              <div style={{ fontFamily: 'var(--vv-display)', fontStyle: 'italic', fontSize: 17, color: 'var(--vv-muted)', marginTop: 7 }}>{p.tag}</div>
              <div style={{ fontSize: 12.5, color: 'var(--vv-muted-2)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <Icon name="clock" size={14} /> {p.horasDet}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            {p.priceFrom && <div style={{ fontSize: 14, color: 'var(--vv-muted-2)', textDecoration: 'line-through' }}>${p.priceFrom}</div>}
            <div style={{ fontFamily: 'var(--vv-display)', fontSize: 48, fontWeight: 700, color: p.accent, lineHeight: 1 }}>${p.priceMain}</div>
            <div style={{ fontSize: 12, color: 'var(--vv-muted)', fontWeight: 700 }}>por persona</div>
            <div style={{ fontSize: 11.5, color: 'var(--vv-muted-2)', marginTop: 2 }}>{p.priceNote}{p.priceNote2 ? ' · ' + p.priceNote2 : ''}</div>
          </div>
        </div>

        {/* Cuerpo */}
        <div style={{ padding: '20px 28px 26px' }}>
          {parent && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
              padding: '11px 16px', borderRadius: 12, background: 'var(--vv-paper-2)', marginBottom: 18,
            }}>
              <span style={{ color: p.accent, display: 'flex' }}><Icon name="check" size={17} stroke={2.6} /></span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--vv-ink)' }}>
                Incluye <b>TODO lo del paquete {p.hereda}</b>, y además:
              </span>
              <button className="vv-tlink" onClick={() => setActiveId(parent.id)} style={{
                marginLeft: 'auto', fontSize: 12.5, fontWeight: 800, color: parent.accent, cursor: 'pointer',
                background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>Ver {p.hereda} <Icon name="right" size={14} stroke={2.4} /></button>
            </div>
          )}

          <div style={{ fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 800, color: 'var(--vv-muted)', marginBottom: 14 }}>
            {parent ? 'Lo nuevo de este paquete' : 'Todo lo que incluye'} · toca un elemento para ver el detalle
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {p.incluye.map((x, i) => {
              const info = VV.ITEM_INFO[x] || {};
              return (
                <button key={i} className="vv-pkgitem" onClick={() => setDetalle(x)}>
                  <span style={{ color: p.accent, flex: 'none' }}><Icon name={info.icon || 'check'} size={21} stroke={1.8} /></span>
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: 'var(--vv-ink)' }}>{x}</span>
                  {hasGal(x) && <span className="vv-pkgitem__cam"><Icon name="camera" size={12} /> fotos</span>}
                  <Icon name="right" size={16} stroke={2.4} className="vv-pkgitem__chev" />
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 18, padding: '12px 16px', borderRadius: 12, background: 'var(--vv-paper-2)' }}>
            <span style={{ color: p.accent, display: 'flex' }}><Icon name="diamond" size={18} /></span>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--vv-ink)' }}>
              {p.cortesias === 'Todas' ? 'Incluye TODAS las cortesías' : `Incluye ${p.cortesias} cortesía${p.cortesias > 1 ? 's' : ''} a elegir`}
            </span>
            <button className="vv-tlink" onClick={() => onGo('cortesias')} style={{
              marginLeft: 'auto', fontSize: 12.5, fontWeight: 800, color: 'var(--vv-crimson)', cursor: 'pointer',
              background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>Ver cortesías <Icon name="right" size={14} stroke={2.4} /></button>
          </div>

          <button className="vv-btn" style={{ width: '100%', justifyContent: 'center', background: p.accent, marginTop: 18 }}
            onClick={() => onGo('cotizador')}>
            Cotizar el paquete {p.name} <Icon name="right" size={17} stroke={2.4} />
          </button>
        </div>
      </div>

      <div className="vv-grid--3" style={{ marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {[{ i: 'users', t: 'Mínimo 100 invitados' }, { i: 'car', t: 'Estacionamiento 45 autos' }, { i: 'badge', t: 'Calidad garantizada' }].map((x, k) => (
          <div key={k} className="vv-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13.5, fontWeight: 700, color: 'var(--vv-muted)' }}>
            <span style={{ color: 'var(--vv-gold)' }}><Icon name={x.i} size={22} /></span>{x.t}
          </div>
        ))}
      </div>

      <ComparaTabla activeId={activeId} onPick={setActiveId} />
    </div>
  );
}

function ComparaTabla({ activeId, onPick }) {
  const pkgs = VV.PAQUETES;
  const Cell = ({ v, accent }) => {
    if (v === true) return <span style={{ color: 'var(--vv-emerald)', display: 'inline-flex' }}><Icon name="check" size={18} stroke={2.8} /></span>;
    if (v === false) return <span style={{ color: 'var(--vv-muted-2)', fontWeight: 600 }}>—</span>;
    return <span style={{ fontWeight: 800, color: accent }}>{v}</span>;
  };
  return (
      <div style={{ marginTop: 30 }}>
        <h2 style={{ fontFamily: 'var(--vv-display)', fontSize: 27, fontWeight: 700, color: 'var(--vv-ink)', margin: '0 0 5px' }}>Compara los 3 paquetes</h2>
        <p style={{ fontSize: 13.5, color: 'var(--vv-muted)', margin: '0 0 14px' }}>Todo de un vistazo. Toca un paquete para abrir su hoja completa arriba.</p>

      <div className="vv-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="vv-compara">
          <thead>
            <tr>
              <th className="vv-compara__feat"></th>
              {pkgs.map(p => (
                <th key={p.id} className={'vv-compara__head' + (p.id === activeId ? ' is-on' : '')}
                  onClick={() => onPick(p.id)}
                  style={p.id === activeId ? { boxShadow: `inset 0 -3px 0 ${p.accent}` } : undefined}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: p.accent }}>
                    <Icon name="diamond" size={14} /> <b style={{ fontFamily: 'var(--vv-display)', fontSize: 16 }}>{p.name}</b>
                  </span>
                  {p.popular && <span className="vv-compara__pop">Más elegido</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {VV.COMPARA.map((row, i) => (
              <tr key={i}>
                <td className="vv-compara__feat">{row.t}</td>
                <td className={activeId === 'premium' ? 'is-on' : ''}><Cell v={row.premium} accent="var(--vv-crimson)" /></td>
                <td className={activeId === 'diamante' ? 'is-on' : ''}><Cell v={row.diamante} accent="var(--vv-gold)" /></td>
                <td className={activeId === 'esmeralda' ? 'is-on' : ''}><Cell v={row.esmeralda} accent="var(--vv-emerald)" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: 'var(--vv-muted-2)', margin: '12px 2px 0', display: 'flex', alignItems: 'center', gap: 7 }}>
        <Icon name="shield" size={14} /> Todos los paquetes incluyen absolutamente todo lo listado · sin costos ocultos.
      </p>
    </div>
  );
}

/* ---------------- 7 · COTIZADOR ---------------- */
function ppFor(pkgId, guests) { return VV.priceFor(pkgId, guests); }   // fuente única: VV.priceFor (data.js)
function SecCotizador() {
  const [pkgId, setPkgId] = useState(() => localStorage.getItem('vv_pkg') || 'diamante');
  const [guests, setGuests] = useState(() => +(localStorage.getItem('vv_guests') || 150));
  const [cliente, setCliente] = useState(() => localStorage.getItem('vv_cliente') || '');
  const [evento, setEvento] = useState(() => localStorage.getItem('vv_evento') || '');
  useEffect(() => { localStorage.setItem('vv_pkg', pkgId); VV.notifyStore(); }, [pkgId]);
  useEffect(() => { localStorage.setItem('vv_guests', guests); VV.notifyStore(); }, [guests]);
  useEffect(() => { localStorage.setItem('vv_cliente', cliente); }, [cliente]);
  useEffect(() => { localStorage.setItem('vv_evento', evento); }, [evento]);

  const pkg = VV.PAQUETES.find(p => p.id === pkgId);
  const pp = ppFor(pkgId, guests);
  const total = pp * guests;
  const anticipo = 3000;
  const restante = total - anticipo;
  const fmt = (n) => '$' + n.toLocaleString('es-MX');
  const minWarn = pkgId !== 'premium' && guests < 150;
  const minPax = pkgId === 'premium' ? 100 : 150;
  useEffect(() => { if (guests < minPax) setGuests(minPax); }, [minPax]);
  const pct = Math.max(0, Math.min(100, Math.round((guests - minPax) / (400 - minPax) * 100)));

  return (
    <div className="vv-section">
      <p className="vv-eyebrow">Tu Inversión</p>
      <h1 className="vv-h1">Armemos <em>tus números</em></h1>
      <p className="vv-lead">Ajusta el paquete y los invitados. El total se calcula en vivo — recuerda que incluye absolutamente todo.</p>

      <div className="vv-split" style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 26 }}>
        {/* Controles */}
        <div>
          <div style={{ fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 800, color: 'var(--vv-muted)', marginBottom: 12 }}>1 · Elige paquete</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 28 }}>
            {VV.PAQUETES.map(p => (
              <button key={p.id} onClick={() => setPkgId(p.id)}
                className={'vv-qpick' + (pkgId === p.id ? ' is-on' : '')}
                style={pkgId === p.id ? { borderColor: p.accent, boxShadow: `0 0 0 1px ${p.accent}` } : {}}>
                <Icon name="diamond" size={20} style={{ color: p.accent }} />
                <b style={{ color: pkgId === p.id ? p.accent : 'var(--vv-ink)' }}>{p.name}</b>
                <small>{p.horas}</small>
              </button>
            ))}
          </div>

          <div style={{ fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 800, color: 'var(--vv-muted)', marginBottom: 12 }}>2 · Número de invitados</div>
          <div className="vv-card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
              <span key={guests} className="vv-pop" style={{ fontFamily: 'var(--vv-display)', fontSize: 52, fontWeight: 700, color: 'var(--vv-crimson)', lineHeight: 1 }}>{guests}</span>
              <span style={{ fontSize: 13, color: 'var(--vv-muted)', fontWeight: 700 }}>invitados</span>
            </div>
            <input type="range" min={minPax} max="400" step="10" value={guests}
              onChange={e => setGuests(+e.target.value)} className="vv-range"
              aria-label="Número de invitados" aria-valuetext={guests + ' invitados'}
              style={{ background: `linear-gradient(90deg, var(--vv-crimson) 0%, var(--vv-crimson-soft) ${pct}%, var(--vv-line) ${pct}%, var(--vv-line) 100%)` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--vv-muted-2)', marginTop: 6 }}>
              <span>{minPax}</span><span>400</span>
            </div>
            {minWarn && (
              <div style={{ marginTop: 14, fontSize: 13, color: 'var(--vv-crimson)', display: 'flex', gap: 8, alignItems: 'center', fontWeight: 700 }}>
                <Icon name="shield" size={16} /> {pkg.name} aplica desde 150 invitados. Premium desde 100.
              </div>
            )}
            {pkgId === 'premium' && guests < 150 && (
              <div className="vv-upsell">
                <span className="vv-upsell__ic"><Icon name="sparkle" size={17} /></span>
                <span>Con <b>150 invitados</b> el precio baja a <b>$420</b> por persona (de $470). Tu total sería <b>{fmt(420 * 150)}</b> — menos que con 149.
                  <button type="button" className="vv-upsell__cta" onClick={() => setGuests(150)}>Subir a 150</button>
                </span>
              </div>
            )}
          </div>

          <div style={{ fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 800, color: 'var(--vv-muted)', margin: '28px 0 12px' }}>3 · Datos para la cotización</div>
          <div className="vv-card" style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 14 }}>
            <label className="vv-field">
              <span>A nombre de</span>
              <input type="text" value={cliente} placeholder="Nombre del cliente"
                onChange={e => setCliente(e.target.value)} />
            </label>
            <label className="vv-field">
              <span>Evento</span>
              <input type="text" value={evento} placeholder="XV años, boda…"
                onChange={e => setEvento(e.target.value)} list="vv-eventos" />
              <datalist id="vv-eventos">
                <option value="XV años"></option>
                <option value="Boda"></option>
                <option value="Bautizo"></option>
                <option value="Cumpleaños"></option>
                <option value="Evento corporativo"></option>
              </datalist>
            </label>
          </div>
        </div>

        {/* Resultado */}
        <div className="vv-card" style={{ padding: 0, overflow: 'hidden', alignSelf: 'start', boxShadow: 'var(--vv-shadow-lg)' }}>
          <div className="vv-sheen" style={{ background: 'linear-gradient(120deg, #2A1018, #1A0A10)', padding: '24px 26px', color: '#fff' }}>
            <div style={{ fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--vv-gold-soft)', fontWeight: 800 }}>Paquete {pkg.name}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
              <span style={{ fontFamily: 'var(--vv-display)', fontSize: 30, fontWeight: 700 }}><Money value={pp} /></span>
              <span style={{ fontSize: 13, opacity: .8 }}>por persona × {guests}</span>
            </div>
          </div>
          <div style={{ padding: '24px 26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--vv-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Inversión total</span>
            </div>
            <div style={{ fontFamily: 'var(--vv-display)', fontSize: 56, fontWeight: 700, color: 'var(--vv-crimson)', lineHeight: 1, marginBottom: 4 }}><Money value={total} /></div>
            <div style={{ fontSize: 12.5, color: 'var(--vv-muted)', marginBottom: 20 }}>Todo incluido · sin costos ocultos</div>

            <div style={{ display: 'grid', gap: 10, borderTop: '1px dashed var(--vv-line-strong)', paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--vv-muted)' }}>Anticipo para apartar</span>
                <b style={{ color: 'var(--vv-emerald)' }}>{fmt(anticipo)}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--vv-muted)' }}>Restante (a meses)</span>
                <b><Money value={restante} /></b>
              </div>
            </div>

            <button className="vv-btn vv-btn--gold" style={{ width: '100%', justifyContent: 'center', marginTop: 22, fontSize: 15 }}
              onClick={() => window.print()}>
              <Icon name="film" size={17} /> Imprimir cotización
            </button>
            <div style={{ fontSize: 11.5, color: 'var(--vv-muted-2)', textAlign: 'center', marginTop: 8 }}>
              Genera una hoja formal con el resumen, sus cortesías favoritas y la fecha elegida.
            </div>
          </div>
        </div>
      </div>

      <CotizacionPrint pkg={pkg} guests={guests} pp={pp} cliente={cliente} evento={evento} />
    </div>
  );
}

/* ---------------- 9 · DISPONIBILIDAD ---------------- */
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_SEM = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
// Fechas apartadas. Snapshot baked (offline) en data.js · VV.OCUPADAS; en vivo se refresca del CRM.
const VV_OCUPADAS = (typeof VV !== 'undefined' && VV.OCUPADAS) || [];
// Endpoint en vivo: lee eventus_events + blocked_dates del CRM (deduplicado por fecha, sin PII).
const OCUPADAS_URL = 'https://bot-villaverde.vercel.app/api/ocupadas';
function isoYMD(y, m, d) {
  return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
}
const HOY_ISO = (() => { const t = new Date(); return isoYMD(t.getFullYear(), t.getMonth(), t.getDate()); })();
function statusFor(y, m, d, OCUP) {
  const iso = isoYMD(y, m, d);
  if (iso < HOY_ISO) return 'past';                   // ya pasó
  if (OCUP.has(iso)) return 'taken';                  // apartada (evento contratado en el CRM)
  const dow = new Date(y, m, d).getDay();             // 0 dom ... 6 sab
  if (dow !== 5 && dow !== 6) return 'week';          // entre semana
  return 'open';                                      // fin de semana libre
}
function SecFechas() {
  const [mi, setMi] = useState(0);
  // Arranca con el snapshot baked (funciona offline) y se refresca en vivo del CRM al montar.
  const [ocupadas, setOcupadas] = useState(VV_OCUPADAS);
  useEffect(() => {
    let alive = true;
    fetch(OCUPADAS_URL)
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (alive && d && Array.isArray(d.dates) && d.dates.length) setOcupadas(d.dates); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  const OCUP = new Set(ocupadas.map(o => o.date));
  const OCUP_TIPO = {}; ocupadas.forEach(o => { OCUP_TIPO[o.date] = o.tipo; });
  // Ventana dinámica: desde el mes actual, cubriendo al menos 6 meses y hasta la última fecha apartada.
  const months = (() => {
    const t = new Date();
    const startIdx = t.getFullYear() * 12 + t.getMonth();
    let lastIdx = startIdx + 5;                         // mínimo 6 meses visibles
    ocupadas.forEach(o => {
      const p = /^(\d{4})-(\d{2})-/.exec(o.date || '');
      if (p) { const idx = (+p[1]) * 12 + (+p[2] - 1); if (idx > lastIdx) lastIdx = idx; }
    });
    const arr = [];
    for (let i = startIdx; i <= lastIdx; i++) arr.push([Math.floor(i / 12), i % 12]);
    return arr;
  })();
  const [y, m] = months[Math.min(mi, months.length - 1)];
  const [picked, setPicked] = useState(() => localStorage.getItem('vv_fecha') || '');
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const pick = (d) => { const k = `${d} ${MESES[m]} ${y}`; setPicked(k); localStorage.setItem('vv_fecha', k); };

  return (
    <div className="vv-section">
      <p className="vv-eyebrow">Disponibilidad</p>
      <h1 className="vv-h1">Aparta <em>tu fecha</em></h1>
      <p className="vv-lead">Las fechas de temporada (XV y bodas en fin de semana) vuelan. Elige la tuya y te la confirmamos al instante.</p>

      <div className="vv-split" style={{ display: 'grid', gridTemplateColumns: '1.3fr .7fr', gap: 28, alignItems: 'start' }}>
        <div className="vv-card" style={{ padding: '22px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <button className="vv-navbtn" onClick={() => setMi(Math.max(0, mi - 1))} disabled={mi === 0}><Icon name="left" size={16} /></button>
            <div style={{ fontFamily: 'var(--vv-display)', fontSize: 28, fontWeight: 600 }}>{MESES[m]} <span style={{ color: 'var(--vv-muted-2)' }}>{y}</span></div>
            <button className="vv-navbtn" onClick={() => setMi(Math.min(months.length - 1, mi + 1))} disabled={mi === months.length - 1}><Icon name="right" size={16} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, textAlign: 'center' }}>
            {['D','L','M','M','J','V','S'].map((d, i) => <div key={i} style={{ fontSize: 11, fontWeight: 800, color: 'var(--vv-muted-2)', padding: '4px 0' }}>{d}</div>)}
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const st = statusFor(y, m, d, OCUP);
              const key = `${d} ${MESES[m]} ${y}`;
              const isPicked = picked === key;
              const isToday = isoYMD(y, m, d) === HOY_ISO;
              const locked = st === 'taken' || st === 'past';
              const estadoTxt = st === 'taken' ? ('apartada — ' + (OCUP_TIPO[isoYMD(y, m, d)] || 'evento'))
                : st === 'past' ? 'fecha pasada' : st === 'open' ? 'fin de semana disponible' : 'entre semana';
              return (
                <button key={i} onClick={locked ? undefined : () => pick(d)} disabled={locked}
                  title={st === 'taken' ? ('Apartada · ' + (OCUP_TIPO[isoYMD(y, m, d)] || 'Evento')) : undefined}
                  aria-label={d + ' de ' + MESES[m] + ' ' + y + ' — ' + estadoTxt + (isToday ? ' (hoy)' : '')}
                  className={'vv-day vv-day--' + st + (isPicked ? ' is-picked' : '') + (isToday ? ' is-today' : '')}>{d}</button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 18, flexWrap: 'wrap' }}>
            {[['open','Fin de semana disponible','var(--vv-emerald)'],['taken','Apartada','rgba(164,21,75,.55)'],['week','Entre semana','var(--vv-line-strong)']].map((l,i)=>(
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--vv-muted)' }}>
                <span style={{ width: 12, height: 12, borderRadius: 4, background: l[2] }} />{l[1]}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="vv-card" style={{ padding: '24px 26px', background: picked ? 'linear-gradient(140deg, var(--vv-paper-2), var(--vv-cream))' : 'var(--vv-cream)' }}>
            <Icon name="calendar" size={30} style={{ color: 'var(--vv-crimson)' }} />
            <div style={{ fontSize: 13, color: 'var(--vv-muted)', marginTop: 14, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 800 }}>Fecha elegida</div>
            <div key={picked} className="vv-pop" style={{ fontFamily: 'var(--vv-display)', fontSize: picked ? 30 : 20, fontWeight: 600, color: picked ? 'var(--vv-crimson)' : 'var(--vv-muted-2)', marginTop: 6, lineHeight: 1.1 }}>
              {picked || 'Toca una fecha disponible'}
            </div>
          </div>
          <div style={{ marginTop: 14, fontSize: 13, color: 'var(--vv-muted)', display: 'flex', gap: 9, lineHeight: 1.5 }}>
            <Icon name="clock" size={17} style={{ color: 'var(--vv-gold)', flex: 'none', marginTop: 1 }} />
            Te aparto la fecha tentativa hasta por 48 h sin compromiso mientras lo platican.
          </div>

          {/* Fechas ya apartadas (reales del CRM) — visibles sin tener que navegar de mes */}
          {(() => {
            const prox = ocupadas
              .filter(o => /^\d{4}-\d{2}-\d{2}$/.test(o.date || '') && o.date >= HOY_ISO)
              .sort((a, b) => (a.date < b.date ? -1 : 1));
            if (!prox.length) return null;
            const top = prox.slice(0, 6);
            const extra = prox.length - top.length;
            return (
              <div className="vv-card" style={{ marginTop: 16, padding: '16px 20px' }}>
                <div style={{ fontSize: 11.5, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 800, color: 'var(--vv-crimson)', display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                  <Icon name="shield" size={15} /> Próximas fechas apartadas
                </div>
                <div style={{ display: 'grid', gap: 9 }}>
                  {top.map((o, i) => {
                    const [yy, mm, dd] = o.date.split('-').map(Number);
                    const dt = new Date(yy, mm - 1, dd);
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13.5, borderTop: i ? '1px dashed var(--vv-line)' : 'none', paddingTop: i ? 9 : 0 }}>
                        <span style={{ fontWeight: 700 }}>{DIAS_SEM[dt.getDay()]} {dd} {MESES[mm - 1].toLowerCase()} {yy}</span>
                        <span style={{ fontSize: 12, color: 'var(--vv-muted)' }}>{o.tipo}</span>
                      </div>
                    );
                  })}
                </div>
                {extra > 0 && (
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--vv-muted-2)', fontWeight: 600 }}>
                    + {extra} fecha{extra > 1 ? 's' : ''} más apartada{extra > 1 ? 's' : ''} en los próximos meses
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

/* ---------------- 10 · CIERRE ---------------- */
function SecCierre({ onGo }) {
  const pkgId = localStorage.getItem('vv_pkg') || 'diamante';
  const pkg = VV.PAQUETES.find(p => p.id === pkgId);
  const guests = +(localStorage.getItem('vv_guests') || 150);
  const mantel = VV.MANTELES.find(m => m.id === (localStorage.getItem('vv_mantel') || ''));
  const fecha = localStorage.getItem('vv_fecha') || 'Por definir';
  const pp = ppFor(pkgId, guests);
  const total = pp * guests;
  const fmt = (n) => '$' + n.toLocaleString('es-MX');
  const [cliente, setCliente] = useState(() => localStorage.getItem('vv_cliente') || '');
  const [evento, setEvento] = useState(() => localStorage.getItem('vv_evento') || '');
  useEffect(() => { localStorage.setItem('vv_cliente', cliente); }, [cliente]);
  useEffect(() => { localStorage.setItem('vv_evento', evento); }, [evento]);

  // Envía el resumen de la cotización por WhatsApp (el cliente se lo lleva al teléfono)
  const waSend = () => {
    let favIds = []; try { favIds = JSON.parse(localStorage.getItem('vv_fav') || '[]'); } catch (e) {}
    const favNames = VV.CORTESIAS.filter(c => favIds.includes(c.id)).map(c => c.name);
    let menuSel = {}; try { menuSel = JSON.parse(localStorage.getItem('vv_menu') || '{}'); } catch (e) {}
    const menuLines = Object.entries(menuSel).filter(([k, v]) => v).map(([k, v]) => `${k}: ${v}`);
    const L = ['*Cotización Villaverde*'];
    if (cliente) L.push('A nombre de: ' + cliente);
    if (evento) L.push('Evento: ' + evento);
    L.push('Fecha: ' + fecha);
    L.push(`Paquete: ${pkg.name} — ${fmt(pp)}/persona`);
    L.push('Invitados: ' + guests);
    if (mantel) L.push('Mantelería: ' + mantel.name);
    L.push(`*Total: ${fmt(total)}* (todo incluido)`);
    L.push('Anticipo para apartar: $3,000');
    if (favNames.length) L.push('Cortesías: ' + favNames.join(', '));
    if (menuLines.length) L.push('Menú: ' + menuLines.join(' · '));
    L.push('');
    L.push('WhatsApp Villaverde: ' + VV.CONTACTO.whats);
    window.open('https://wa.me/' + VV.CONTACTO.whatsIntl + '?text=' + encodeURIComponent(L.join('\n')), '_blank');
  };

  const resumen = [
    { i: 'diamond', l: 'Paquete', v: pkg.name, c: pkg.accent },
    { i: 'users', l: 'Invitados', v: guests + ' personas' },
    { i: 'sparkle', l: 'Mantelería', v: mantel ? mantel.name : '—', c: mantel && mantel.hex },
    { i: 'calendar', l: 'Fecha', v: fecha },
  ];

  return (
    <div className="vv-section vv-cierre">
      <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
        <div className="vv-flourish"><Icon name="diamond" size={20} /></div>
        <p className="vv-eyebrow" style={{ justifyContent: 'center' }}>El momento es ahora</p>
        <h1 className="vv-h1" style={{ fontSize: 'clamp(44px,5.2vw,64px)' }}>Hagamos tu fiesta <em>realidad</em></h1>
        <p className="vv-lead" style={{ margin: '0 auto 30px' }}>Con solo <b style={{ color: 'var(--vv-crimson)' }}>$3,000 de anticipo</b> apartas tu fecha y congelas el precio 2026. Esto es lo que diseñamos juntos:</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, maxWidth: 880, margin: '0 auto 26px' }}>
        {resumen.map((r, i) => (
          <div key={i} className="vv-card" style={{ padding: '20px 18px', textAlign: 'center' }}>
            <span style={{ color: r.c || 'var(--vv-crimson)' }}><Icon name={r.i} size={26} /></span>
            <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--vv-muted)', fontWeight: 800, marginTop: 10 }}>{r.l}</div>
            <div style={{ fontWeight: 800, fontSize: 16, marginTop: 4, color: r.c || 'var(--vv-ink)' }}>{r.v}</div>
          </div>
        ))}
      </div>

      <div className="vv-card" style={{ maxWidth: 880, margin: '0 auto 14px', padding: '14px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <label className="vv-field">
          <span>A nombre de</span>
          <input type="text" value={cliente} placeholder="Nombre del cliente" onChange={e => setCliente(e.target.value)} />
        </label>
        <label className="vv-field">
          <span>Evento</span>
          <input type="text" value={evento} placeholder="XV años, boda…" onChange={e => setEvento(e.target.value)} list="vv-eventos-cierre" />
          <datalist id="vv-eventos-cierre">
            <option value="XV años"></option><option value="Boda"></option><option value="Bautizo"></option><option value="Cumpleaños"></option><option value="Graduación"></option>
          </datalist>
        </label>
      </div>

      <div className="vv-sheen" style={{ maxWidth: 880, margin: '0 auto', background: 'linear-gradient(120deg, #2A1018, #1A0A10)', borderRadius: 'var(--vv-radius-lg)', padding: '30px 38px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <div style={{ color: '#fff' }}>
          <div style={{ fontSize: 12.5, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--vv-gold-soft)', fontWeight: 800 }}>Inversión total estimada</div>
          <div style={{ fontFamily: 'var(--vv-display)', fontSize: 48, fontWeight: 700, lineHeight: 1.05 }}><Money value={total} /></div>
          <div style={{ fontSize: 12.5, color: '#E7D2C8' }}>{pkg.name} · {guests} invitados · todo incluido</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="vv-btn vv-btn--gold" style={{ fontSize: 16, padding: '15px 30px' }}
            onClick={() => window.print()}>
            <Icon name="doc" size={18} /> Imprimir hoja de informes
          </button>
          <button className="vv-btn vv-cta-pulse" style={{ background: 'var(--vv-emerald)', color: '#fff', fontSize: 15, padding: '13px 26px', justifyContent: 'center' }}
            onClick={waSend}>
            <Icon name="chat" size={17} /> Enviar resumen por WhatsApp
          </button>
          <button className="vv-navbtn" onClick={() => onGo('cotizador')} style={{ justifyContent: 'center', background: 'transparent', color: '#F2E2D9', borderColor: 'rgba(255,255,255,.25)' }}>
            Ajustar cotización
          </button>
        </div>
      </div>

      {/* Contacto */}
      <div style={{ maxWidth: 880, margin: '22px auto 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <div className="vv-card" style={{ padding: '18px 20px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: 'var(--vv-crimson)', flex: 'none' }}><Icon name="target" size={24} /></span>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--vv-muted)', fontWeight: 800 }}>Ubicación</div>
            <div style={{ fontWeight: 800, fontSize: 14.5 }}>{VV.CONTACTO.lugar}</div>
          </div>
        </div>
        <div className="vv-card" style={{ padding: '18px 20px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: 'var(--vv-emerald)', flex: 'none' }}><Icon name="chat" size={24} /></span>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--vv-muted)', fontWeight: 800 }}>WhatsApp</div>
            <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--vv-emerald)' }}>{VV.CONTACTO.whats}</div>
          </div>
        </div>
        <div className="vv-card" style={{ padding: '18px 20px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: 'var(--vv-crimson)', flex: 'none' }}><Icon name="clock" size={24} /></span>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--vv-muted)', fontWeight: 800 }}>Horario</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--vv-ink)' }}>Lun–Sáb · 10–12 y 3–6 pm</div>
          </div>
        </div>
      </div>

      <CotizacionPrint pkg={pkg} guests={guests} pp={pp} cliente={cliente} evento={evento} />
    </div>
  );
}

Object.assign(window, { SecPaquetes, SecCotizador, SecFechas, SecCierre, ppFor });
