/* =====================================================================
   VILLAVERDE · Cotización imprimible (hoja carta, solo @media print)
   Diseño editorial elegante — filetes oro, acentos vino, sin foto.
   ===================================================================== */

const VV_MESES_N = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function CotizacionPrint({ pkg, guests, pp, cliente, evento }) {
  const total = pp * guests;
  const anticipo = 3000;
  const restante = total - anticipo;
  const fmt = (n) => '$' + n.toLocaleString('es-MX');

  const hoy = new Date();
  const fechaHoy = hoy.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  const folio = 'VV-' + hoy.getFullYear().toString().slice(2) +
    String(hoy.getMonth() + 1).padStart(2, '0') + String(hoy.getDate()).padStart(2, '0');

  const fechaEvento = localStorage.getItem('vv_fecha') || 'Por definir';
  const salonId = localStorage.getItem('vv_salon') || 'villaverde';
  const salonName = salonId === 'gardenia' ? 'Salón Gardenia' : 'Salón Villaverde';

  const mantel = VV.MANTELES.find(m => m.id === (localStorage.getItem('vv_mantel') || ''));
  const mantelIncluido = pkg.id !== 'premium'; // la mantelería a color viene incluida desde Diamante

  let favIds = [];
  try { favIds = JSON.parse(localStorage.getItem('vv_fav') || '[]'); } catch {}
  const favs = VV.CORTESIAS.filter(c => favIds.includes(c.id));

  let menuSelRaw = {};
  try { menuSelRaw = JSON.parse(localStorage.getItem('vv_menu') || '{}'); } catch {}
  const menuItems = Object.entries(menuSelRaw).filter(([k, v]) => v);

  // "Todo lo que incluye" REAL: recorre la cadena de herencia (base → ... → paquete)
  const allIncluye = (() => {
    const chain = [];
    let cur = pkg;
    while (cur) { chain.unshift(cur); cur = cur.hereda ? VV.PAQUETES.find(p => p.name === cur.hereda) : null; }
    return chain.flatMap(p => p.incluye);
  })();

  const cortNote = pkg.cortesias === 'Todas'
    ? 'Este paquete incluye TODAS las cortesías.'
    : `Este paquete incluye ${pkg.cortesias} cortesía${pkg.cortesias > 1 ? 's' : ''} a elegir.`;

  // Precio tachado: solo cuando el cliente obtiene una tarifa menor a la base (Premium 150+)
  const showFrom = pkg.priceFrom && pp < pkg.priceFrom;

  // Plan de pagos: anticipo + mensualidades hasta la fecha del evento
  const plan = (() => {
    const low = fechaEvento.toLowerCase();
    const ym = low.match(/\d{4}/);
    const dm = low.match(/\b(\d{1,2})\b/);
    const mi = VV_MESES_N.findIndex(mn => low.indexOf(mn) >= 0);
    if (!ym || !dm || mi < 0) return null;
    const ev = new Date(+ym[0], mi, +dm[1]);
    let months = (ev.getFullYear() - hoy.getFullYear()) * 12 + (ev.getMonth() - hoy.getMonth());
    if (ev.getDate() < hoy.getDate()) months -= 1;
    if (months < 2) return null;
    const mensual = Math.ceil(restante / months / 100) * 100;
    return { months, mensual };
  })();

  return ReactDOM.createPortal(
    <div className="vv-ps">
      {/* Encabezado — doble filete vino + oro */}
      <header className="vv-ps__head">
        <div className="vv-ps__brand">
          <img src="assets/logo-villaverde.png" alt="Villaverde" />
          <div>
            <div className="vv-ps__name">Villaverde</div>
            <div className="vv-ps__sub">Jardín &amp; Salón de Eventos · {VV.CONTACTO.lugar}</div>
          </div>
        </div>
        <div className="vv-ps__doc">
          <div className="vv-ps__doctitle">Cotización</div>
          <div className="vv-ps__folio">Folio {folio}</div>
          <div className="vv-ps__date">{fechaHoy}</div>
        </div>
      </header>

      {/* Datos del cliente */}
      <section className="vv-ps__meta">
        <div><span>A nombre de</span><b>{cliente || '________________________'}</b></div>
        <div><span>Evento</span><b>{evento || '—'}</b></div>
        <div><span>Fecha del evento</span><b>{fechaEvento}</b></div>
        <div><span>Invitados</span><b>{guests} personas</b></div>
      </section>

      {/* Paquete + inversión */}
      <section className="vv-ps__hero">
        <div>
          <div className="vv-ps__eyebrow vv-ps__eyebrow--gold">Paquete seleccionado</div>
          <div className="vv-ps__pkgname">{pkg.name}</div>
          <div className="vv-ps__pkgtag">{pkg.tag}</div>
          <div className="vv-ps__pkgmeta">{salonName} · {pkg.horasDet || pkg.horas}</div>
        </div>
        <div className="vv-ps__hero-r">
          <div className="vv-ps__pp">
            {showFrom && <s>{fmt(pkg.priceFrom)}</s>} {fmt(pp)} <small>por persona × {guests}</small>
          </div>
          <div className="vv-ps__total">{fmt(total)}</div>
          <div className="vv-ps__totalnote">Inversión total · todo incluido</div>
        </div>
      </section>

      {/* Ornamento */}
      <div className="vv-ps__flourish"><span></span>&#9670;<span></span></div>

      {/* Todo lo que incluye — lista completa a 2 columnas */}
      <section className="vv-ps__incl">
        <h4>Todo lo que incluye tu paquete {pkg.name}</h4>
        <ul className="vv-ps__list vv-ps__list--cols" style={{ columnCount: allIncluye.length > 18 ? 3 : 2 }}>
          {allIncluye.map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      </section>

      {/* Detalle en dos columnas */}
      <section className="vv-ps__cols">
        <div>
          {menuItems.length > 0 && (
            <div className="vv-ps__sub-block">
              <h4>Menú elegido</h4>
              <ul className="vv-ps__list vv-ps__list--menu">
                {menuItems.map(([cat, op]) => <li key={cat}><b>{cat}:</b> {op}</li>)}
              </ul>
            </div>
          )}
          <h4 className={menuItems.length ? 'vv-ps__h4-sp' : ''}>Cortesías de su interés</h4>
          <div className="vv-ps__cortnote">{cortNote}</div>
          {favs.length > 0 ? (
            <ul className="vv-ps__list vv-ps__list--fav">
              {favs.map(f => <li key={f.id}>{f.name}</li>)}
            </ul>
          ) : (
            <div className="vv-ps__empty">Sin cortesías marcadas aún.</div>
          )}
          {mantel && (
            <div className="vv-ps__mantel">
              <span className="vv-ps__swatch" style={{ background: mantel.hex }}></span>
              <b>Mantelería:</b> {mantel.name}
              {!mantelIncluido && <span className="vv-ps__cplx"> (complemento — incluida desde Diamante)</span>}
            </div>
          )}
        </div>

        <div>
          <h4>Inversión y plan de pagos</h4>
          <div className="vv-ps__pay">
            <div><span>Anticipo para apartar fecha</span><b className="vv-ps__pay-em">{fmt(anticipo)}</b></div>
            <div>
              <span>Saldo en mensualidades sin intereses</span>
              <b>{plan ? `${plan.months} × ~${fmt(plan.mensual)}` : 'a meses hasta tu evento'}</b>
            </div>
            <div className="vv-ps__pay-tot"><span>Restante</span><b>{fmt(restante)}</b></div>
          </div>
          <div className="vv-ps__pay-note">
            Formas de pago: transferencia, tarjeta de débito o efectivo (no se acepta tarjeta de crédito) · Apartamos tu fecha tentativa 48 h sin compromiso.
          </div>
        </div>
      </section>

      {/* Prueba social */}
      <div className="vv-ps__trust">
        <span className="vv-ps__stars">★★★★★</span> +800 eventos celebrados · +12 años de experiencia · Todo incluido, sin costos ocultos
      </div>

      {/* Pie: contacto + QR + firmas */}
      <footer className="vv-ps__foot">
        <div className="vv-ps__foot-l">
          <div className="vv-ps__contact">
            <b>WhatsApp {VV.CONTACTO.whats}</b> · {VV.CONTACTO.web} · {VV.CONTACTO.instagram}
          </div>
          <div className="vv-ps__legal">
            {VV.CONTACTO.horario} · Precios sujetos a disponibilidad de fecha · Cotización válida 15 días naturales.
          </div>
          <div className="vv-ps__signs">
            <div className="vv-ps__sign"><div className="vv-ps__signline"></div>Asesor Villaverde</div>
            <div className="vv-ps__sign"><div className="vv-ps__signline"></div>Cliente · de conformidad</div>
          </div>
        </div>
        <div className="vv-ps__qr">
          <img src="assets/qr-villaverde.png" alt="WhatsApp Villaverde" />
          <span>Escanea y escríbenos</span>
        </div>
      </footer>
    </div>,
    document.body
  );
}

Object.assign(window, { CotizacionPrint });
