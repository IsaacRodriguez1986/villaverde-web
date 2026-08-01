/* =====================================================================
   VILLAVERDE · Secciones 2 — Menú · Cortesías · Testimonios
   ===================================================================== */

/* ---------------- 4 · MENÚ ---------------- */
function SecMenu() {
  const m = VV.MENU;
  const [sel, setSel] = useState(() => { try { return JSON.parse(localStorage.getItem('vv_menu') || '{}'); } catch (e) { return {}; } });
  useEffect(() => { localStorage.setItem('vv_menu', JSON.stringify(sel)); }, [sel]);
  const hechas = m.cats.filter(c => sel[c.t]).length;
  const menuListo = hechas === m.cats.length;
  return (
    <div className="vv-section">
      <p className="vv-eyebrow">Menú de Banquete</p>
      <h1 className="vv-h1">Cena formal <em>de 3 tiempos</em></h1>
      <p className="vv-lead">Cocina de primera, servida a la mesa con capitán de meseros. <b>Toca un platillo</b> en cada categoría para armar el menú — sale en tu cotización.</p>

      <div style={{ marginTop: -4, marginBottom: 18 }}>
        <span className="vv-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 700, color: menuListo ? 'var(--vv-emerald)' : 'var(--vv-muted)' }}>
          <Icon name={menuListo ? 'check' : 'leaf'} size={14} stroke={menuListo ? 2.8 : 2} />
          {menuListo ? 'Menú completo' : `Menú armado: ${hechas} / ${m.cats.length} categorías`}
        </span>
      </div>

      <div className="vv-grid--3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 18 }}>
        {m.cats.map((c, i) => (
          <div key={i} className="vv-card" style={{ padding: '22px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
              <span style={{ color: 'var(--vv-crimson)' }}><Icon name={c.icon} size={24} stroke={1.7} /></span>
              <div style={{ fontFamily: 'var(--vv-display)', fontSize: 25, fontWeight: 600 }}>{c.t}</div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 9 }}>
              {c.ops.map((o, j) => (
                <li key={j} onClick={() => setSel(s => ({ ...s, [c.t]: s[c.t] === o ? null : o }))}
                  style={{ display: 'flex', gap: 9, fontSize: 14, lineHeight: 1.4, cursor: 'pointer', padding: '4px 8px', margin: '0 -8px', borderRadius: 8, fontWeight: sel[c.t] === o ? 800 : 400, color: sel[c.t] === o ? 'var(--vv-crimson)' : 'var(--vv-ink)', background: sel[c.t] === o ? 'var(--vv-paper-2)' : 'transparent', transition: 'all .15s' }}>
                  <span style={{ color: sel[c.t] === o ? 'var(--vv-crimson)' : 'var(--vv-gold)', flex: 'none', marginTop: 2 }}><Icon name={sel[c.t] === o ? 'check' : 'leaf'} size={14} stroke={sel[c.t] === o ? 2.8 : 2} /></span>{o}
                </li>
              ))}
            </ul>
            {c.note && (
              <div style={{ marginTop: 14, paddingTop: 11, borderTop: '1px dashed var(--vv-emerald)', display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12.5, color: 'var(--vv-emerald)', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.35 }}>
                <span style={{ flex: 'none', marginTop: 1 }}><Icon name="leaf" size={14} /></span>{c.note}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Galería de platillos */}
      <div className="vv-grid--4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        {[
          { src: 'assets/menu-pollo.jpg', label: 'Pollo relleno' },
          { src: 'assets/menu-carne-v2.jpg', label: 'Lomo en adobo' },
          { src: 'assets/menu-crema-v2.jpg', label: 'Crema de la casa' },
          { src: 'assets/menu-pasta-v2.jpg', label: 'Espagueti boloñesa' },
        ].map((p, i) => (
          <div key={i} className="vv-zoomable" style={{ position: 'relative', borderRadius: 'var(--vv-radius-lg)', overflow: 'hidden', aspectRatio: '1', boxShadow: 'var(--vv-shadow-md)', cursor: 'zoom-in' }}>
            <img src={p.src} alt={p.label} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(0deg, rgba(26,10,16,.7) 0%, transparent 100%)',
              padding: '28px 14px 12px',
            }}>
              <div style={{ color: '#fff', fontSize: 13.5, fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,.5)' }}>{p.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div className="vv-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ color: 'var(--vv-crimson)' }}><Icon name="soup" size={22} /></span>
            <div style={{ fontFamily: 'var(--vv-display)', fontSize: 23, fontWeight: 600 }}>Torna fiesta de madrugada</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
            {m.madrugada.map((x, i) => <span key={i} className="vv-chip">{x}</span>)}
          </div>
        </div>
        <div className="vv-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ color: 'var(--vv-crimson)' }}><Icon name="drink" size={22} /></span>
            <div style={{ fontFamily: 'var(--vv-display)', fontSize: 23, fontWeight: 600 }}>Barra de bebidas</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
            {m.bebidas.map((x, i) => <span key={i} className="vv-chip">{x}</span>)}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'var(--vv-muted)', fontStyle: 'italic' }}>
        <Icon name="sparkle" size={15} style={{ color: 'var(--vv-gold)' }} /> {m.nota}
      </div>
    </div>
  );
}

/* ---------------- LIGHTBOX GALERÍA (video + fotos) ---------------- */
function GaleriaLightbox({ media, onClose }) {
  const [idx, setIdx] = useState(0);
  const len = media.length;
  const prev = () => setIdx((idx - 1 + len) % len);
  const next = () => setIdx((idx + 1) % len);
  const isVid = (m) => m && typeof m === 'object' && m.video;
  const cur = media[idx];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const lbOverlay = {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(10,4,6,.92)', backdropFilter: 'blur(12px)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  };
  const lbClose = {
    position: 'absolute', top: 18, right: 22, background: 'rgba(255,255,255,.12)',
    border: 'none', color: '#fff', fontSize: 28, width: 44, height: 44,
    borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
  const lbArrow = (side) => ({
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    [side]: 18, background: 'rgba(255,255,255,.12)', border: 'none', color: '#fff',
    fontSize: 28, width: 48, height: 48, borderRadius: '50%', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background .2s',
  });
  const lbThumbRow = {
    display: 'flex', gap: 8, marginTop: 18, overflowX: 'auto', maxWidth: '90vw', padding: '4px 0',
  };
  const mediaStyle = { maxWidth: '78vw', maxHeight: '68vh', borderRadius: 10, boxShadow: '0 8px 40px rgba(0,0,0,.5)' };

  return (
    <div className="vv-gallery-in" style={lbOverlay} onClick={onClose}>
      <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); else e.stopPropagation(); }} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <button className="vv-glb-btn vv-glb-close" style={lbClose} onClick={onClose}>&times;</button>
        {len > 1 && <button className="vv-glb-btn vv-glb-arrow" style={lbArrow('left')} onClick={prev}><Icon name="left" size={22} /></button>}
        {len > 1 && <button className="vv-glb-btn vv-glb-arrow" style={lbArrow('right')} onClick={next}><Icon name="right" size={22} /></button>}

        {isVid(cur) ? (
          <video key={idx} src={cur.video} controls playsInline preload="metadata" poster={cur.poster}
            style={{ ...mediaStyle, background: '#000' }} />
        ) : (
          <img key={idx} className="vv-gallery-img" src={cur} alt={`Foto ${idx + 1}`}
            style={{ ...mediaStyle, objectFit: 'contain' }} />
        )}

        <div style={{ color: '#fff', fontSize: 13, marginTop: 12, opacity: .7 }}>{idx + 1} / {len}</div>

        {len > 1 && (
          <div style={lbThumbRow}>
            {media.map((m, i) => {
              const thumbStyle = {
                width: 56, height: 42, borderRadius: 6, cursor: 'pointer', flexShrink: 0,
                border: i === idx ? '2px solid var(--vv-crimson)' : '2px solid transparent',
                opacity: i === idx ? 1 : .5, transition: 'all .2s',
              };
              return isVid(m) ? (
                <button key={i} className="vv-glb-thumb" onClick={() => setIdx(i)}
                  style={{ ...thumbStyle, background: '#1a0a10', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Icon name="play" size={16} />
                </button>
              ) : (
                <img key={i} className="vv-glb-thumb" src={m} alt="" onClick={() => setIdx(i)}
                  style={{ ...thumbStyle, objectFit: 'cover' }} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- 5 · CORTESÍAS ---------------- */
function SecCortesias() {
  const [fav, setFav] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('vv_fav') || '[]')); } catch { return new Set(); }
  });
  const [galleryOpen, setGalleryOpen] = useState(null);
  const pkgId = (typeof localStorage !== 'undefined' && (localStorage.getItem('vv_pkgview') || localStorage.getItem('vv_pkg'))) || 'diamante';
  const pkg = VV.PAQUETES.find(p => p.id === pkgId) || VV.PAQUETES[1];
  const incl = pkg.cortesias; // número o 'Todas'
  const allIn = incl === 'Todas';
  const limit = allIn ? VV.CORTESIAS.length : incl;
  const toggle = (id) => setFav(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id);
    localStorage.setItem('vv_fav', JSON.stringify([...n])); return n;
  });

  return (
    <div className="vv-section">
      {galleryOpen && <GaleriaLightbox media={galleryOpen} onClose={() => setGalleryOpen(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p className="vv-eyebrow">El Factor WOW</p>
          <h1 className="vv-h1">Cortesías <em>inolvidables</em></h1>
          <p className="vv-lead" style={{ marginBottom: 8 }}>Estas sorpresas hacen la noche memorable. Elige las que incluye tu paquete — las guardamos para tu cotización.</p>
        </div>
        <div className="vv-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--vv-paper-2)' }}>
          <span style={{ color: 'var(--vv-crimson)' }}><Icon name="check" size={22} stroke={2.6} /></span>
          <div>
            <div key={fav.size} className="vv-pop" style={{ fontWeight: 800, fontSize: 22, fontFamily: 'var(--vv-display)', lineHeight: 1, color: 'var(--vv-crimson)' }}>{fav.size}{allIn ? '' : ' / ' + limit}</div>
            <div style={{ fontSize: 11, color: 'var(--vv-muted)' }}>cortesías elegidas</div>
          </div>
        </div>
      </div>

      <div className="vv-card" style={{ marginTop: 16, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', background: 'linear-gradient(100deg, var(--vv-paper-2), var(--vv-cream))', borderLeft: `4px solid ${pkg.accent}` }}>
        <span style={{ color: pkg.accent, flex: 'none' }}><Icon name="diamond" size={22} /></span>
        <div style={{ fontSize: 14, lineHeight: 1.45 }}>
          {allIn ? (
            <span>Tu paquete <b style={{ color: pkg.accent }}>{pkg.name}</b> incluye <b>TODAS las cortesías</b> — llévatelas todas.</span>
          ) : (
            <span>Tu paquete <b style={{ color: pkg.accent }}>{pkg.name}</b> incluye <b>{incl} cortesía{incl > 1 ? 's' : ''} a elegir</b>. {fav.size > limit ? <b style={{ color: 'var(--vv-crimson)' }}>Llevas {fav.size} — sube a un paquete mayor o quita {fav.size - limit}.</b> : `Has elegido ${fav.size} de ${limit}.`}</span>
          )}
        </div>
        <button className="vv-tlink" onClick={() => { localStorage.setItem('vv_step', '4'); location.reload(); }} style={{ marginLeft: 'auto', fontSize: 12.5, fontWeight: 800, color: pkg.accent, cursor: 'pointer', background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>Cambiar paquete <Icon name="right" size={14} stroke={2.4} /></button>
      </div>

      <div className="vv-grid--4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginTop: 10 }}>
        {VV.CORTESIAS.map(c => {
          const on = fav.has(c.id);
          const media = [...(c.video ? [{ video: c.video, poster: (c.gallery && c.gallery[0]) || undefined }] : []), ...(c.gallery || [])];
          const hasMedia = media.length > 0;
          const cover = c.gallery && c.gallery.length ? c.gallery[0] : null;
          return (
            <button key={c.id}
              onClick={() => hasMedia ? setGalleryOpen(media) : toggle(c.id)}
              className={'vv-cortesia' + (on ? ' is-fav' : '')}
              style={hasMedia ? { cursor: 'pointer' } : undefined}>
              <span className={'vv-cortesia__cover' + (cover ? '' : ' is-plain')}
                style={cover ? { backgroundImage: `url(${cover})` } : undefined}>
                <span className="vv-cortesia__cover-grad"></span>
                <span className="vv-cortesia__badge" style={{ color: cover ? '#fff' : 'var(--vv-gold)' }}>
                  <Icon name={c.icon} size={28} stroke={1.6} />
                </span>
              </span>
              <span className="vv-cortesia__pick" onClick={(e) => { e.stopPropagation(); toggle(c.id); }} title={on ? 'Quitar' : 'Elegir'}>
                <Icon name={on ? 'check' : 'plus'} size={16} stroke={3} />
              </span>
              <div className="vv-cortesia__body">
                <div style={{ fontWeight: 800, fontSize: 15, textAlign: 'left' }}>{c.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--vv-muted)', marginTop: 5, textAlign: 'left', lineHeight: 1.4 }}>{c.desc}</div>
                {hasMedia && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--vv-crimson)', fontWeight: 700 }}>
                    <Icon name={c.video ? 'play' : 'camera'} size={13} />
                    {c.video
                      ? (c.gallery && c.gallery.length ? `Ver video + ${c.gallery.length} foto${c.gallery.length > 1 ? 's' : ''}` : 'Ver video')
                      : `Ver ${c.gallery.length} foto${c.gallery.length > 1 ? 's' : ''}`}
                  </div>
                )}
                <div style={{ marginTop: hasMedia ? 6 : 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Stars n={c.wow} size={12} />
                  <span style={{ fontSize: 10, color: 'var(--vv-muted-2)', letterSpacing: 1, textTransform: 'uppercase' }}>wow</span>
                </div>
                <span className={'vv-cortesia__choose' + (on ? ' is-on' : '')} role="button"
                  onClick={(e) => { e.stopPropagation(); toggle(c.id); }}>
                  <Icon name={on ? 'check' : 'plus'} size={15} stroke={3} />
                  {on ? 'Elegida' : 'Elegir cortesía'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="vv-card" style={{ marginTop: 22, padding: '18px 22px', display: 'flex', gap: 14, alignItems: 'center', background: 'linear-gradient(100deg, var(--vv-paper-2), var(--vv-cream))' }}>
        <span style={{ color: 'var(--vv-emerald)', flex: 'none' }}><Icon name="diamond" size={26} /></span>
        <div style={{ fontSize: 14.5, lineHeight: 1.5 }}>
          <b>Premium</b> incluye 1 cortesía · <b style={{ color: 'var(--vv-gold)' }}>Diamante</b> incluye 2 · <b style={{ color: 'var(--vv-emerald)' }}>Esmeralda</b> las incluye <b>TODAS</b>. Si te gustan varias, el Esmeralda sale más a cuenta.
        </div>
      </div>

      {/* Complementa tu evento */}
      <div style={{ marginTop: 38 }}>
        <div className="vv-flourish" style={{ justifyContent: 'flex-start' }}><Icon name="sparkle" size={18} /></div>
        <h2 style={{ fontFamily: 'var(--vv-display)', fontSize: 32, fontWeight: 600, margin: '4px 0 6px' }}>Complementa tu evento</h2>
        <p style={{ fontSize: 14.5, color: 'var(--vv-muted)', margin: '0 0 18px' }}>Extras opcionales para llevar tu fiesta aún más lejos.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
          {VV.COMPLEMENTOS.map((x, i) => <span key={i} className="vv-chip">{x}</span>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14 }}>
          <div className="vv-card" style={{ padding: '18px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ color: 'var(--vv-crimson)' }}><Icon name="mic" size={20} /></span>
              <div style={{ fontWeight: 800, fontSize: 15 }}>Música en vivo</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {VV.MUSICA.map((x, i) => <span key={i} className="vv-chip" style={{ background: 'var(--vv-cream)' }}>{x}</span>)}
            </div>
          </div>
          <div className="vv-card" style={{ padding: '18px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ color: 'var(--vv-crimson)' }}><Icon name="drink" size={20} /></span>
              <div style={{ fontWeight: 800, fontSize: 15 }}>Fiesta cóctel</div>
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--vv-muted)', lineHeight: 1.5 }}>{VV.COCTEL}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 8 · TESTIMONIOS ---------------- */
function SecTestimonios() {
  return (
    <div className="vv-section">
      <p className="vv-eyebrow">Lo que dicen las familias</p>
      <h1 className="vv-h1">Confianza <em>ganada</em></h1>
      <p className="vv-lead">No solo es lo que te decimos. Mira lo que viven las familias que ya celebraron en Villaverde.</p>

      {/* ¿Por qué elegirnos? */}
      <div className="vv-grid--3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 30 }}>
        {VV.PORQUE.map((p, i) => (
          <div key={i} className="vv-card vv-tile" style={{ padding: '18px 20px', display: 'flex', gap: 13, alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--vv-gold)', flex: 'none' }}><Icon name={p.icon} size={24} stroke={1.7} /></div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>{p.t}</div>
              <div style={{ fontSize: 12.5, color: 'var(--vv-muted)', marginTop: 2 }}>{p.s}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="vv-grid--3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginBottom: 30 }}>
        {VV.TESTIMONIOS.map((t, i) => (
          <div key={i} className="vv-card vv-tile" style={{ padding: '26px 24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'var(--vv-display)', fontSize: 60, lineHeight: .6, color: 'var(--vv-line-strong)', height: 30 }}>&ldquo;</div>
            <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--vv-ink)', flex: 1, margin: '6px 0 18px' }}>{t.text}</p>
            <Stars n={t.stars} size={16} />
            <div style={{ marginTop: 12, paddingTop: 14, borderTop: '1px solid var(--vv-line)' }}>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>{t.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--vv-crimson)', fontWeight: 700 }}>{t.event}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="vv-statbar" style={{ background: 'linear-gradient(100deg, #2A1018, #1A0A10)', borderRadius: 'var(--vv-radius-lg)', padding: '30px 36px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
        {VV.STATS.map((s, i) => (
          <div key={i} style={{ textAlign: 'center', color: '#fff', borderRight: i < 3 ? '1px solid rgba(255,255,255,.12)' : 'none' }}>
            <div style={{ fontFamily: 'var(--vv-display)', fontWeight: 700, fontSize: 44, color: 'var(--vv-gold-soft)', lineHeight: 1 }}>{s.n}</div>
            <div style={{ fontSize: 12.5, color: '#E7D2C8', marginTop: 8, letterSpacing: .3 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { SecMenu, SecCortesias, SecTestimonios });
