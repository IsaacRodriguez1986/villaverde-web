/* Eventus experience: server-confirmed changes and keyboard alternatives to drag. */
(function () {
  'use strict';
  var tables = [], tablesCode = '', selectedTable = 1, seatingBusy = false, programEdit = null, programBusy = false;
  var cameraStream = null, cameraTimer = null;
  function esc(value) { return escapeHtml(String(value == null ? '' : value)); }
  function request(body) { return apiCall(Object.assign({code: E && E.code}, body)); }
  var messageTimer = null;
  function message(id, text, error) { var node = document.getElementById(id); if(node) { node.className = error ? 'exp-error' : 'exp-notice'; node.textContent = text; node.hidden = !text; if (id === 'seat-message') { clearTimeout(messageTimer); if (text && !/…$/.test(text)) messageTimer = setTimeout(function () { var again = document.getElementById(id); if (again && again.textContent === text) again.hidden = true; }, error ? 10000 : 4000); } } }
  function count(mesa) { return E.guests.filter(function(g){return g.status !== 'cancelled' && g.mesa === mesa;}).reduce(function(n,g){return n+1+(g.companions||0);},0); }
  function fits(g, t) { return !!g && (g.mesa === t.mesa || count(t.mesa) + 1 + (g.companions || 0) <= t.capacity); }
  function tableOptions(value, g) { return '<option value="">Sin mesa</option>' + tables.map(function(t){var full=!!g&&!fits(g,t);return '<option value="'+t.mesa+'" '+(t.mesa===value?'selected':'')+(full?' disabled':'')+'>Mesa '+t.mesa+' · '+count(t.mesa)+'/'+t.capacity+(full?' · llena':'')+'</option>';}).join(''); }
  function guestRow(g) { return '<div class="exp-guest" draggable="true" data-guest="'+g.id+'"><button type="button" class="exp-guest-pick" data-pick-guest="'+g.id+'" title="Mover '+esc(g.name)+'" style="--person-color:'+guestColor(g.id)+'"><b>'+esc(initials(g.name))+'</b><span>'+esc(g.name)+'<small>'+(1+(g.companions||0))+' lugar(es)'+(g.status==='cancelled'?' · Cancelado':'')+'</small></span></button><select aria-label="Mesa de '+esc(g.name)+'" data-seat="'+g.id+'">'+tableOptions(g.mesa,g)+'</select></div>'; }
  function replaceGuest(g) { var i = E.guests.findIndex(function(v){return v.id===g.id;}); if(i>=0) E.guests[i]=Object.assign({},E.guests[i],g,{arrivedAt:g.arrived_at||E.guests[i].arrivedAt}); }
  async function fetchGuests() { var rows=await request({op:'db',method:'GET',table:'eventus_guests',query:'event_code=eq.'+encodeURIComponent(E.code)+'&order=id.asc'}); return Array.isArray(rows)?rows.map(function(g){return Object.assign({},g,{arrivedAt:g.arrived_at});}):null; }
  async function refreshGuests() { var rows=await fetchGuests(); if(rows) E.guests=rows; }
  // Counts saved changes: a refresh that started before one of them brings an older snapshot than the screen.
  var mutationSeq = 0;
  window.rT = async function (retried) {
    if(!E) return;
    var code=E.code, box=document.getElementById('tB'), painted=tablesCode===code&&!!box.querySelector('.exp-plan-viewport');
    box.classList.add('experience');
    if(tablesCode!==code){seatZoom=null;pickedGuest=null;}
    // Refreshing an already drawn plan keeps it on screen, so focus and scroll are not lost.
    if(painted){message('seat-message','Actualizando plano…');var view=box.querySelector('.exp-plan-viewport');if(seatZoom===null&&view&&view.clientWidth>0){seatZoom=0.5;applyZoom(fitZoom());view.scrollLeft=0;view.scrollTop=0;}}
    else box.innerHTML='<p role="status">Cargando plano y capacidades…</p>';
    var seq=mutationSeq;
    try { var result=await request({op:'tables-get'}); var rows=await fetchGuests(); if(!E||E.code!==code)return;
      if(seq!==mutationSeq){if(!retried)return window.rT(true);message('seat-message','');return;}
      tables=result.tables;if(rows)E.guests=rows;tablesCode=code;renderTables(); }
    catch(e){if(painted){renderTables();notify(seatError(e),true);return;}box.innerHTML='<div class="exp-error" role="alert">'+esc(seatError(e))+'</div><button onclick="rT()">Reintentar</button>';}
  };
  /* Seating plan: the salon drawn from above (square tables, round people), laid out like the Villaverde render. */
  var pickedGuest = null, pickedPerson = 0, seatZoom = null, seatSearch = '', suppressSeatClick = {until: 0, x: 0, y: 0}, dragInfo = null, touchDrag = null, pendingFocus = null, tableGrab = null, colorMap = {};
  var layout = {pos: {}, scale: 1, clash: {}};
  var ROOM_W = 1000, ROOM_H = 1333, WALL = 12, MARGIN = 40, STAIRS_H = 96;
  var BOARD_W = ROOM_W + 2 * WALL + 2 * MARGIN, BOARD_H = MARGIN + ROOM_H + 2 * WALL + STAIRS_H + 60;
  var SEAT = 26, SEAT_GAP = 30, TABLE_PAD = 12, LONG_PRESS = 350, MIN_ZOOM = 0.2, MAX_ZOOM = 1.6, TOUCH_ZOOM = 0.8, MAX_CAPACITY = 16, SAVE_TIMEOUT = 15000;
  // Positions are percentages of the room interior: table centers live inside AREA and never on the dance floor.
  var PISTA = {x1: 38, x2: 62, y1: 31, y2: 55}, AREA = {x1: 10, x2: 90, y1: 9, y2: 86};
  var GRID_COLS = [3, 5, 7, 9];
  var PALETTE = ['#e3a6b5', '#a6a2e2', '#d4ae5e', '#86b395', '#8fb3cc', '#cf957b', '#6f5a50', '#e4677a', '#b6d37f', '#f0c948', '#7fc6c0', '#c49ad9', '#5f86c4', '#a58d6a', '#e79fce', '#8c9c4f'];
  var SEAT_ERRORS = {
    table_full: 'No hay lugares suficientes en esa mesa. Elige otra o aumenta su capacidad.',
    seat_occupied: 'Esa silla está ocupada. Elige una libre para cambiar de mesa.',
    version_conflict: 'Alguien más cambió el plano. Lo actualizamos; vuelve a elegir.',
    invalid_seat: 'Esa silla no existe en la mesa elegida. Actualiza el plano.',
    table_not_found: 'Esa mesa ya no existe. Actualiza el plano.',
    not_found: 'No encontramos a esa persona o mesa. Actualiza el plano.',
    invalid_table: 'Revisa el cupo (de 1 a 16 lugares) y la posición de la mesa.',
    invalid_version: 'Actualiza el plano y vuelve a intentarlo.',
    guest_cancelled: 'Esa persona canceló su asistencia. Márcala como confirmada en Invitados antes de sentarla.',
    invalid_guest: 'No encontramos a esa persona. Actualiza el plano.',
    invalid_data: 'Esos datos no son válidos. Actualiza el plano.',
    timeout: 'La conexión tardó demasiado; no sabemos si se guardó. Actualizamos el plano.'
  };
  var RECEPTION_ERRORS = {
    guest_cancelled: 'Este invitado canceló su asistencia; confirma con el anfitrión antes de dejarlo pasar.',
    not_found: 'Pase no encontrado en este evento.',
    'invalid guest pass': 'Este pase es de otro evento o está dañado.',
    'reception requires admin': 'Tu sesión del personal venció; vuelve a entrar.',
    'invalid guest': 'Pase no válido.',
    invalid_guest: 'Pase no válido.',
    timeout: 'La conexión tardó demasiado; revisa en la lista si la llegada quedó registrada.'
  };
  function friendlyError(e, map, fallback) {
    if (e && Object.prototype.hasOwnProperty.call(map, e.message)) return map[e.message];
    var status = e && e.status;
    if (status === 0) return 'No hay conexión. Revisa tu internet e inténtalo de nuevo.';
    if (status === 401) return 'Tu enlace venció. Vuelve a abrir tu enlace de Eventus.';
    if (status === 403) return 'No tienes permiso para esto; vuelve a entrar.';
    if (status === 409 && map.version_conflict) return map.version_conflict;
    if (status === 429) return 'Hiciste muchos cambios seguidos; espera un momento.';
    if (status >= 500) return 'El servidor no respondió; no se guardó el cambio.';
    return fallback;
  }
  function seatError(e) { return friendlyError(e, SEAT_ERRORS, 'No se pudo guardar el cambio. Actualiza el plano e inténtalo de nuevo.'); }
  // Plan notices also go to the global toast: it lives outside the panel, stays visible and is announced.
  function notify(text, error) { message('seat-message', text, error); if (text && typeof toast === 'function') toast(text, error); }
  function withTimeout(promise) { return Promise.race([promise, new Promise(function (_, reject) { setTimeout(function () { var e = new Error('timeout'); e.status = -1; reject(e); }, SAVE_TIMEOUT); })]); }
  // After a conflict or a timeout the plan reloads; the reason stays on screen once it is redrawn.
  async function refreshWithNotice(text) { await window.rT(); message('seat-message', text, true); }
  function setBusy(on) { var box = document.getElementById('tB'); if (box) box.setAttribute('aria-busy', on ? 'true' : 'false'); }
  function busyNotice() { notify('Espera, estamos guardando el cambio anterior.'); }
  function coarsePointer() { try { return matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } }
  // On a phone, a tap on a small plan first zooms in there instead of grabbing whoever is under the finger.
  function tapZoom(e) { if (!coarsePointer() || seatZoom === null || seatZoom >= TOUCH_ZOOM) return false; applyZoom(1, e.clientX, e.clientY); return true; }
  function initials(name) { return String(name).trim().split(/\s+/).slice(0,2).map(function(v){return v[0]||'';}).join('').toUpperCase(); }
  function guestColor(id) { return colorMap[id] || PALETTE[Math.abs(Number(id)) % PALETTE.length]; }
  // Each group at a table gets a color no other group there has (up to 8), so two families never read as one.
  function buildColorMap() {
    colorMap = {};
    tables.forEach(function (t) {
      var used = {};
      E.guests.filter(function (g) { return g.status !== 'cancelled' && g.mesa === t.mesa; }).sort(function (a, b) { return a.id - b.id; }).forEach(function (g) {
        var base = Math.abs(Number(g.id)), pick = PALETTE[base % PALETTE.length];
        for (var k = 0; k < PALETTE.length; k++) { var c = PALETTE[(base + k) % PALETTE.length]; if (!used[c]) { pick = c; break; } }
        used[pick] = true; colorMap[g.id] = pick;
      });
    });
  }
  function norm(value) { return String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function shortName(name) { var parts = String(name).trim().split(/\s+/); return parts[0] + (parts[1] ? ' ' + parts[1][0] + '.' : ''); }
  function onPista(x, y, half) { var px = x * ROOM_W / 100, py = y * ROOM_H / 100; return px + half > PISTA.x1 * ROOM_W / 100 && px - half < PISTA.x2 * ROOM_W / 100 && py + half > PISTA.y1 * ROOM_H / 100 && py - half < PISTA.y2 * ROOM_H / 100; }
  // A table the user placed (version > 1) keeps its saved spot; the rest follow the salon template.
  // A saved center on the dance floor came from the older horizontal board: it goes back to the template.
  function isPinned(t) { return Number(t.version) > 1 && !onPista(Number(t.x), Number(t.y), 0); }
  function sideCounts(cap) { var base = Math.floor(cap / 4), rem = cap % 4; return {top: base + (rem > 0 ? 1 : 0), right: base + (rem > 2 ? 1 : 0), bottom: base + (rem > 1 ? 1 : 0), left: base}; }
  function tableSide(cap) { var c = sideCounts(cap); return Math.max(72, Math.max(c.top, c.right, c.bottom, c.left) * SEAT_GAP + TABLE_PAD * 2); }
  function footprint(cap) { return tableSide(cap) + SEAT * 2; }
  // Chairs go clockwise from the top-left corner, touching the table edge.
  function seatPoints(cap) {
    var c = sideCounts(cap), off = tableSide(cap) / 2 + SEAT / 2 - 2, pts = [], i;
    function spread(n, k) { return (k - (n - 1) / 2) * SEAT_GAP; }
    for (i = 0; i < c.top; i++) pts.push({x: spread(c.top, i), y: -off});
    for (i = 0; i < c.right; i++) pts.push({x: off, y: spread(c.right, i)});
    for (i = 0; i < c.bottom; i++) pts.push({x: -spread(c.bottom, i), y: off});
    for (i = 0; i < c.left; i++) pts.push({x: -off, y: -spread(c.left, i)});
    return pts;
  }
  function gridScale(grid, fp) { var colPx = (AREA.x2 - AREA.x1) / 100 * ROOM_W / (grid.cols - 1), rowPx = (AREA.y2 - AREA.y1) / 100 * ROOM_H / (grid.rows - 1); return Math.min(1, (Math.min(colPx, rowPx) - 14) / fp); }
  function gridSlots(grid, fp) {
    var slots = [], colStep = (AREA.x2 - AREA.x1) / (grid.cols - 1), rowStep = (AREA.y2 - AREA.y1) / (grid.rows - 1), half = fp * grid.scale / 2;
    for (var r = 0; r < grid.rows; r++) for (var c = 0; c < grid.cols; c++) { var x = AREA.x1 + c * colStep, y = AREA.y1 + r * rowStep; if (!onPista(x, y, half)) slots.push({x: x, y: y}); }
    return slots;
  }
  // Salon template: the fewest rows that leave a free slot for every table not placed by hand, for 3, 5, 7
  // or 9 columns; the largest tables win (3 columns around the dance floor on a tie, as in the render).
  // Slots are sized for a 12-seat table: resizing one table never reshapes the whole salon (a bigger one
  // that no longer fits is marked instead).
  var SLOT_CAPACITY = 12;
  function chooseGrid(all, pinned, fp) {
    var best = null, autoCount = all.length - pinned.length;
    GRID_COLS.forEach(function (cols) {
      for (var rows = 2; rows <= 24; rows++) {
        var grid = {cols: cols, rows: rows}; grid.scale = gridScale(grid, fp);
        var free = gridSlots(grid, fp).filter(function (s) { return !pinned.some(function (t) { return overlap({x: Number(t.x), y: Number(t.y)}, SLOT_CAPACITY, s, SLOT_CAPACITY, grid.scale); }); });
        if (free.length >= autoCount && gridSlots(grid, fp).length >= all.length) { if (!best || grid.scale > best.scale + 0.01) best = grid; return; }
      }
    });
    return best || {cols: 9, rows: 24, scale: gridScale({cols: 9, rows: 24}, fp)};
  }
  // Table center in board pixels, pushed inside the walls exactly as it is drawn.
  function drawnCenter(p, capacity, scale) { var half = footprint(capacity) * scale / 2; return {x: clamp(p.x * ROOM_W / 100, half, ROOM_W - half), y: clamp(p.y * ROOM_H / 100, half, ROOM_H - half)}; }
  function overlap(a, capA, b, capB, scale) { var ca = drawnCenter(a, capA, scale), cb = drawnCenter(b, capB, scale), h = (footprint(capA) + footprint(capB)) * scale / 2; return Math.abs(ca.x - cb.x) < h && Math.abs(ca.y - cb.y) < h; }
  function touchesPista(p, capacity, scale) { var c = drawnCenter(p, capacity, scale); return onPista(c.x / ROOM_W * 100, c.y / ROOM_H * 100, footprint(capacity) * scale / 2); }
  // One pass in table-number order: each table takes its own slot of the template if it is free, otherwise
  // the nearest free slot at that moment. Tables placed by hand keep their spot. So adding table N+1 never
  // moves tables 1..N, and moving one table only affects the table whose slot it now covers.
  function computeLayout() {
    var fp = footprint(SLOT_CAPACITY), all = tables.slice().sort(function (a, b) { return a.mesa - b.mesa; }), pinned = all.filter(isPinned);
    var grid = chooseGrid(all, pinned, fp), slots = gridSlots(grid, fp), used = slots.map(function () { return false; }), pos = {};
    pinned.forEach(function (t) { pos[t.mesa] = {x: Number(t.x), y: Number(t.y)}; });
    // Placement ignores table size (every table counts as a 12-seat slot): changing a capacity never pushes
    // neighbors around; a table too big for its spot is marked by clashes() instead.
    function freeFor(t, s) { return !pinned.some(function (o) { return overlap({x: Number(o.x), y: Number(o.y)}, SLOT_CAPACITY, s, SLOT_CAPACITY, grid.scale); }); }
    all.forEach(function (t, n) {
      if (pos[t.mesa]) return;
      if (slots[n] && !used[n] && freeFor(t, slots[n])) { pos[t.mesa] = slots[n]; used[n] = true; return; }
      var home = slots[n] || {x: 50, y: AREA.y2}, best = -1, bd = Infinity;
      slots.forEach(function (s, k) { if (used[k] || !freeFor(t, s)) return; var d = Math.hypot(s.x - home.x, s.y - home.y); if (d < bd) { bd = d; best = k; } });
      if (best >= 0) { used[best] = true; pos[t.mesa] = slots[best]; } else pos[t.mesa] = {x: AREA.x1 + (n % 9) * 10, y: AREA.y2};
    });
    return {pos: pos, scale: grid.scale, clash: clashes(all, pos, grid.scale)};
  }
  // Tables that touch the dance floor or another table (placed by hand, or bigger than their slot), as drawn.
  function clashes(all, pos, scale) {
    var out = {};
    all.forEach(function (t, i) {
      if (touchesPista(pos[t.mesa], t.capacity, scale)) out[t.mesa] = 'la pista';
      for (var k = i + 1; k < all.length; k++) {
        var o = all[k];
        if (overlap(pos[t.mesa], t.capacity, pos[o.mesa], o.capacity, scale)) { out[t.mesa] = out[t.mesa] || 'la Mesa ' + o.mesa; out[o.mesa] = out[o.mesa] || 'la Mesa ' + t.mesa; }
      }
    });
    return out;
  }
  function tableCenter(t) {
    var p = layout.pos[t.mesa] || {x: 50, y: 50}, half = footprint(t.capacity) * layout.scale / 2;
    return {x: clamp(p.x * ROOM_W / 100, half, ROOM_W - half), y: clamp(p.y * ROOM_H / 100, half, ROOM_H - half)};
  }
  function shownPosition(t) { var p = layout.pos[t.mesa] || {x: t.x, y: t.y}; return {x: clamp(Math.round(p.x), 0, 100), y: clamp(Math.round(p.y), 0, 100)}; }
  function chairPeople(t) {
    var people=new Array(t.capacity),waiting=[];
    E.guests.filter(function(g){return g.status!=='cancelled'&&g.mesa===t.mesa;}).sort(function(a,b){return a.id-b.id;}).forEach(function(g){for(var i=0;i<1+(g.companions||0);i++){var p={guest:g,companion:i>0,personIndex:i},slot=(g.seat_slots||[])[i];if(slot>=1&&slot<=t.capacity&&!people[slot-1])people[slot-1]=p;else waiting.push(p);}});
    waiting.forEach(function(p){for(var i=0;i<t.capacity;i++)if(!people[i]){people[i]=p;break;}});return people;
  }
  function currentChair(g, person) {
    var t = tables.find(function (v) { return v.mesa === g.mesa; }); if (!t) return null;
    var n = chairPeople(t).findIndex(function (p) { return p && p.guest.id === g.id && p.personIndex === person; });
    return n >= 0 ? n + 1 : null;
  }
  function personLabel(g, person) { return (person ? 'Acompañante ' + person + ' de ' : '') + g.name; }
  function chairOptions(mesa, picked) {
    var t = tables.find(function (v) { return v.mesa === Number(mesa); }), html = '<option value="">Automática</option>';
    if (!t) return html;
    var people = chairPeople(t), sameTable = !!picked && picked.mesa === t.mesa;
    for (var i = 0; i < t.capacity; i++) {
      var p = people[i], text = 'Silla ' + (i + 1), disabled = false;
      if (p) {
        var mine = picked && p.guest.id === picked.id && p.personIndex === pickedPerson;
        text += mine ? ' · aquí está' : sameTable ? ' · intercambiar con ' + (p.companion ? 'acompañante de ' + shortName(p.guest.name) : shortName(p.guest.name)) : ' · ocupada';
        disabled = !!mine || !sameTable;
      }
      html += '<option value="' + (i + 1) + '"' + (disabled ? ' disabled' : '') + '>' + esc(text) + '</option>';
    }
    return html;
  }
  function moveLabel(picked, dest) { return picked && (picked.companions || 0) > 0 && (dest === '' || Number(dest) !== picked.mesa) ? 'Mover grupo' : 'Mover'; }
  function guestSeats(t) {
    var people = chairPeople(t), html = '';
    seatPoints(t.capacity).forEach(function (pt, n) {
      var p = people[n], slot = n + 1, style = 'left:' + pt.x + 'px;top:' + pt.y + 'px';
      if (p) {
        var g = p.guest, label = personLabel(g, p.personIndex), picked = pickedGuest === g.id && pickedPerson === p.personIndex, size = 1 + (g.companions || 0);
        var detail = (p.companion ? '' : size > 1 ? ', titular de ' + size + ' personas' : '') + (g.status === 'pending' ? ', pendiente' : g.status === 'confirmed' ? ', confirmado' : '');
        html += '<button type="button" tabindex="-1" class="exp-person' + (p.companion ? ' companion' : '') + (picked ? ' picked' : '') + '" style="' + style + ';--person-color:' + guestColor(g.id) + '" data-guest="' + g.id + '" data-pick-guest="' + g.id + '" data-person-index="' + p.personIndex + '" data-seat-target="' + t.mesa + '" data-chair="' + slot + '" data-label="' + esc(label) + '" draggable="true" aria-pressed="' + picked + '" aria-label="' + esc(label + detail) + ', mesa ' + t.mesa + ', silla ' + slot + '"></button>';
      } else html += '<button type="button" tabindex="-1" class="exp-empty-seat" style="' + style + '" data-seat-target="' + t.mesa + '" data-chair="' + slot + '" aria-label="Mesa ' + t.mesa + ', silla ' + slot + ' libre"><span>' + slot + '</span></button>';
    });
    return html;
  }
  function tableHtml(v, picked) {
    var c = tableCenter(v), side = tableSide(v.capacity), occupied = count(v.mesa);
    return '<div class="exp-table-group' + (v.mesa === selectedTable ? ' selected' : '') + (occupied >= v.capacity ? ' full' : '') + (layout.clash[v.mesa] ? ' clash' : '') + (picked && !fits(picked, v) ? ' no-fit' : '') + '" style="left:' + c.x + 'px;top:' + c.y + 'px;--s:' + layout.scale + '" data-drop-table="' + v.mesa + '">' +
      '<button type="button" class="exp-table" style="width:' + side + 'px;height:' + side + 'px" draggable="true" data-table="' + v.mesa + '" data-move-table="' + v.mesa + '" data-label="Mesa ' + v.mesa + '" aria-label="Mesa ' + v.mesa + ', ' + occupied + ' de ' + v.capacity + ' lugares ocupados"><span class="exp-table-plate" aria-hidden="true">' + v.mesa + '</span></button>' + guestSeats(v) + '</div>';
  }
  function roomHtml(picked) {
    var plain = E && E.salon === 'gardenia';
    var decor = plain ? '<div class="exp-pista" style="left:' + PISTA.x1 + '%;top:' + PISTA.y1 + '%;width:' + (PISTA.x2 - PISTA.x1) + '%;height:' + (PISTA.y2 - PISTA.y1) + '%"><span>PISTA DE BAILE</span></div>' : [14, 24, 76, 86].map(function (x) { return '<span class="exp-room-window" style="left:' + x + '%"></span>'; }).join('') +
      '<span class="exp-room-door"></span><span class="exp-room-screen"></span><span class="exp-room-drapes"></span><span class="exp-room-opening"></span>' +
      '<div class="exp-pista" style="left:' + PISTA.x1 + '%;top:' + PISTA.y1 + '%;width:' + (PISTA.x2 - PISTA.x1) + '%;height:' + (PISTA.y2 - PISTA.y1) + '%"><span>PISTA DE BAILE</span></div>' +
      [16.5, 35, 62].map(function (y) { return '<span class="exp-chandelier" style="top:' + y + '%"></span>'; }).join('');
    var stairsTop = MARGIN + ROOM_H + 2 * WALL, centerX = MARGIN + WALL + ROOM_W / 2, room = '<div class="exp-room" id="seat-room" style="left:' + MARGIN + 'px;top:' + MARGIN + 'px;width:' + ROOM_W + 'px;height:' + ROOM_H + 'px;border-width:' + WALL + 'px">' + decor + tables.map(function (t) { return tableHtml(t, picked); }).join('') + '</div>';
    if (plain) return room;
    return '<span class="exp-board-label exp-board-label-vertical" style="left:' + (MARGIN / 2) + 'px;top:' + (MARGIN + WALL + ROOM_H * 0.42) + 'px">PANTALLA</span>' +
      '<div class="exp-stairs" style="left:' + centerX + 'px;top:' + (stairsTop - 2) + 'px;height:' + STAIRS_H + 'px"></div>' +
      '<span class="exp-board-label" style="left:' + centerX + 'px;top:' + (stairsTop + STAIRS_H + 14) + 'px">ENTRADA</span>' +
      room;
  }
  function moveBarHtml(picked) {
    if (!picked) return '';
    var label = personLabel(picked, pickedPerson), chair = currentChair(picked, pickedPerson);
    return '<div class="exp-move-bar" role="region" aria-label="Mover a ' + esc(label) + '"><div class="exp-move-title"><strong>' + esc(label) + '</strong><span>' + (1 + (picked.companions || 0)) + ' persona(s) · ' + (picked.mesa ? 'Mesa ' + picked.mesa + (chair ? ', silla ' + chair : '') : 'Sin mesa') + '</span></div>' +
      '<label>Mesa<select id="move-destination">' + tableOptions(picked.mesa, picked) + '</select></label><label>Silla<select id="move-chair">' + chairOptions(picked.mesa, picked) + '</select></label>' +
      '<div class="exp-move-actions"><button type="button" id="move-picked">' + moveLabel(picked, String(picked.mesa || '')) + '</button><button type="button" id="cancel-picked">Cancelar</button></div></div>';
  }
  function focusKeyOf(el, box) {
    if (!el || !box.contains(el) || el === document.body) return null;
    if (el.id) return '#' + el.id;
    if (el.classList.contains('exp-person')) return '.exp-person[data-guest="' + el.dataset.guest + '"][data-person-index="' + el.dataset.personIndex + '"]';
    if (el.classList.contains('exp-empty-seat')) return '.exp-empty-seat[data-seat-target="' + el.dataset.seatTarget + '"][data-chair="' + el.dataset.chair + '"]';
    if (el.dataset.table) return '[data-table="' + el.dataset.table + '"]';
    if (el.dataset.seat) return 'select[data-seat="' + el.dataset.seat + '"]';
    if (el.dataset.pickGuest) return '.exp-guest-pick[data-pick-guest="' + el.dataset.pickGuest + '"]';
    return null;
  }
  function renderTables() {
    var box=document.getElementById('tB'), t=tables.find(function(t){return t.mesa===selectedTable;})||tables[0];
    var oldViewport=box.querySelector('.exp-plan-viewport'),scroll=oldViewport?{x:oldViewport.scrollLeft,y:oldViewport.scrollTop}:null;
    var focusKey=pendingFocus||focusKeyOf(document.activeElement,box);pendingFocus=null;
    if(t)selectedTable=t.mesa;
    layout=computeLayout();buildColorMap();
    var z=seatZoom||0.5,free=E.guests.filter(function(g){return g.status!=='cancelled'&&!g.mesa;}),picked=E.guests.find(function(g){return g.id===pickedGuest;})||null;
    if(!picked)pickedGuest=null;
    box.classList.toggle('has-pick',!!picked);box.setAttribute('aria-busy',seatingBusy?'true':'false');
    var people=E.guests.filter(function(g){return g.status!=='cancelled';}).reduce(function(n,g){return n+1+(g.companions||0);},0),seated=tables.reduce(function(n,v){return n+count(v.mesa);},0),seats=tables.reduce(function(n,v){return n+v.capacity;},0);
    box.innerHTML='<div class="exp-plan-heading"><div><span class="exp-eyebrow">DISTRIBUCIÓN DEL SALÓN</span><h3>Cada invitado, en su lugar</h3><p class="exp-muted">Arrastra a una persona a la silla que quieras. En la misma mesa intercambian lugar; al cambiar de mesa, sus acompañantes van con ella. En el celular, toca el plano para acercarte, luego toca a la persona para elegir mesa y silla, o mantenla presionada para arrastrarla.</p></div><span class="exp-plan-count">'+seated+' de '+people+' personas con lugar · '+tables.length+' mesas · '+seats+' lugares</span></div>'+
      moveBarHtml(picked)+
      '<div class="exp-seating-layout"><section class="exp-plan-surface" aria-label="Plano interactivo"><div class="exp-plan-tools"><button type="button" id="seat-refresh" onclick="rT()">Actualizar</button><label>Mesa<select id="table-select">'+tables.map(function(v){return '<option value="'+v.mesa+'" '+(v.mesa===selectedTable?'selected':'')+'>Mesa '+v.mesa+'</option>';}).join('')+'</select></label><div class="exp-zoom"><button type="button" id="zoom-out" aria-label="Alejar plano">−</button><output id="zoom-value">'+Math.round(z*100)+'%</output><button type="button" id="zoom-in" aria-label="Acercar plano">+</button><button type="button" id="zoom-fit">Ver todo</button></div></div>'+
      '<div class="exp-plan-stage"><div id="seat-message" hidden></div>'+
      '<div class="exp-plan-viewport" role="region" tabindex="0" aria-label="Plano del salón. Tab recorre las mesas; con las flechas entras a sus sillas."><div class="exp-plan-size" style="width:'+BOARD_W*z+'px;height:'+BOARD_H*z+'px"><div class="exp-board exp-floor'+(picked?' is-moving':'')+'" id="seat-board" style="width:'+BOARD_W+'px;height:'+BOARD_H+'px;transform:scale('+z+');--z:'+z+'">'+roomHtml(picked)+'</div></div></div></div>'+
      '<div class="exp-plan-legend"><span><i class="exp-dot"></i> Invitado</span><span><i class="exp-dot companion"></i> Acompañante</span><span><i class="exp-dot empty"></i> Lugar libre</span><span><i class="exp-plate-mini"></i> Mesa con lugares</span><span><i class="exp-plate-mini full"></i> Mesa llena</span><span>Pasa el cursor o toca a una persona para ver quién es. Pellizca o usa +/− para acercar.</span></div></section>'+
      '<aside class="exp-seat-sidebar"><section class="exp-unassigned" data-unseat="true"><div class="exp-sidebar-heading"><h4>Sin mesa</h4><span>'+free.length+' grupos</span></div><label class="exp-search-label">Buscar invitado<input id="seat-search" type="search" placeholder="Nombre del invitado" value="'+esc(seatSearch)+'"></label><p id="seat-search-hint" class="exp-search-hint" hidden></p><div class="exp-free-list">'+(free.map(guestRow).join('')||'<p class="exp-muted">Todos tienen lugar. Suelta aquí un grupo para dejarlo sin mesa.</p>')+'</div><p class="exp-drop-hint">Suelta aquí para quitar la asignación</p></section><section class="exp-table-inspector">'+(t?inspectorHtml(t):'<p>No hay mesas configuradas.</p>')+'</section></aside></div>';
    var viewport=box.querySelector('.exp-plan-viewport');
    // Fit only once the plan is visible: drawn while Mesas is hidden, the viewport measures 0 (it opened at 20%).
    if(seatZoom===null){if(viewport.clientWidth>0){seatZoom=z;applyZoom(fitZoom());viewport.scrollLeft=0;viewport.scrollTop=0;}}
    else if(scroll){viewport.scrollLeft=scroll.x;viewport.scrollTop=scroll.y;}
    bindPlan(box,viewport,t,picked);
    if(focusKey){var again=box.querySelector(focusKey);if(again)again.focus({preventScroll:true});}
    if(seatingBusy)message('seat-message','Guardando el cambio anterior…');
    refreshCard();
  }
  function inspectorHtml(t) {
    var pos = shownPosition(t);
    return '<div class="exp-sidebar-heading"><h4>Mesa '+t.mesa+'</h4><span>'+count(t.mesa)+' / '+t.capacity+'</span></div>'+(layout.clash[t.mesa]?'<p class="exp-clash-note" role="note">Esta mesa se encima con '+esc(layout.clash[t.mesa])+'. Arrástrala a un espacio libre.</p>':'')+E.guests.filter(function(g){return g.mesa===t.mesa;}).map(guestRow).join('')+
      '<details><summary>Capacidad y posición</summary><form id="table-form" class="exp-form"><label>Capacidad<input name="capacity" type="number" min="1" max="16" required value="'+t.capacity+'"></label><label>Posición horizontal (%)<input name="x" type="number" min="0" max="100" required value="'+pos.x+'"></label><label>Posición vertical (%)<input name="y" type="number" min="0" max="100" required value="'+pos.y+'"></label><button>Guardar mesa</button></form><p class="exp-muted">También puedes arrastrar la mesa en el plano (en el celular, mantenla presionada).</p></details>';
  }
  function bindPlan(box, viewport, t, picked) {
    var board=document.getElementById('seat-board');
    document.getElementById('table-select').onchange=function(e){selectedTable=Number(e.target.value);renderTables();var group=box.querySelector('[data-drop-table="'+selectedTable+'"]');if(group)group.scrollIntoView({block:'center',inline:'center'});};
    document.getElementById('zoom-in').onclick=function(){applyZoom(currentZoom()*1.25);};
    document.getElementById('zoom-out').onclick=function(){applyZoom(currentZoom()/1.25);};
    document.getElementById('zoom-fit').onclick=function(){applyZoom(fitAll());viewport.scrollLeft=0;viewport.scrollTop=0;};
    var dest=document.getElementById('move-destination');
    if(dest){
      dest.onchange=function(){document.getElementById('move-chair').innerHTML=chairOptions(dest.value,picked);document.getElementById('move-picked').textContent=moveLabel(picked,dest.value);};
      document.getElementById('move-picked').onclick=function(){if(seatingBusy){busyNotice();return;}var chair=document.getElementById('move-chair').value;moveGuest(pickedGuest,dest.value?Number(dest.value):null,chair?Number(chair):undefined,pickedPerson);};
      document.getElementById('cancel-picked').onclick=function(){if(seatingBusy){busyNotice();return;}pickedGuest=null;renderTables();};
      if(seatingBusy){document.getElementById('move-picked').disabled=true;document.getElementById('cancel-picked').disabled=true;}
    }
    box.onkeydown=function(e){if(e.key==='Escape'&&pickedGuest!==null){e.preventDefault();pickedGuest=null;pendingFocus=focusKeyOf(document.activeElement,box);renderTables();}};
    box.querySelectorAll('[data-seat]').forEach(function(node){node.onchange=function(){moveGuest(Number(node.dataset.seat),node.value?Number(node.value):null);};});
    box.querySelectorAll('[data-pick-guest]').forEach(function(node){node.onclick=function(e){e.stopPropagation();if(ghostClick(e))return;if(seatingBusy){busyNotice();return;}if(node.classList.contains('exp-person')&&pickedGuest===null&&tapZoom(e))return;pickFrom(node);};});
    box.querySelectorAll('.exp-person').forEach(function(node){
      node.onpointerenter=function(e){if(e.pointerType==='mouse'&&!dragInfo)showCard(node);};
      node.onpointerleave=function(e){if(e.pointerType==='mouse')refreshCard();};
      node.onfocus=function(){if(node.matches(':focus-visible'))showCard(node);};
      node.onblur=function(){refreshCard();};
    });
    box.querySelectorAll('[data-guest]').forEach(function(node){
      node.ondragstart=function(e){if(e.target.closest('select')){e.preventDefault();return;}e.stopPropagation();dragInfo={guest:Number(node.dataset.guest),person:Number(node.dataset.personIndex||0)};e.dataTransfer.setData('text/plain','guest:'+dragInfo.guest+':'+dragInfo.person);e.dataTransfer.effectAllowed='move';hideCard();setMoving(true);};
      node.ondragend=function(){dragInfo=null;clearDropMarks();setMoving(pickedGuest!==null);};
    });
    box.querySelectorAll('[data-table]').forEach(function(node){
      node.ondragstart=function(e){e.stopPropagation();var r=node.getBoundingClientRect();tableGrab={dx:e.clientX-(r.left+r.width/2),dy:e.clientY-(r.top+r.height/2)};e.dataTransfer.setData('text/plain','table:'+node.dataset.table);};
      node.onclick=function(e){if(ghostClick(e))return;if(seatingBusy){busyNotice();return;}if(tapZoom(e))return;tableTap(Number(node.dataset.table));};
    });
    box.querySelectorAll('[data-seat-target],[data-drop-table],[data-unseat]').forEach(function(node){
      node.ondragover=function(e){if(!dragInfo)return;e.preventDefault();e.stopPropagation();markDrop(node,dropCheck(dragInfo,node));};
      node.ondragleave=function(e){if(!node.contains(e.relatedTarget))node.classList.remove('drop-ready','drop-bad');};
      node.ondrop=function(e){clearDropMarks();var data=e.dataTransfer.getData('text/plain');if(!data.startsWith('guest:'))return;e.preventDefault();e.stopPropagation();var parts=data.split(':'),info={guest:Number(parts[1]),person:Number(parts[2]||0)};dragInfo=null;if(!dropCheck(info,node)){rejectDrop(node);return;}dropGuest(info.guest,info.person,node);};
    });
    box.querySelectorAll('.exp-empty-seat').forEach(function(node){node.onclick=function(e){if(ghostClick(e))return;if(seatingBusy){busyNotice();return;}if(tapZoom(e))return;if(pickedGuest===null){notify('Primero toca a la persona que quieres mover.');return;}moveGuest(pickedGuest,Number(node.dataset.seatTarget),Number(node.dataset.chair),pickedPerson);};});
    board.addEventListener('keydown',seatKeys);
    board.addEventListener('click',function(e){if(!e.target.closest('button'))tapZoom(e);});
    board.ondragover=function(e){e.preventDefault();};
    board.ondrop=function(e){e.preventDefault();var data=e.dataTransfer.getData('text/plain');if(!data.startsWith('table:'))return;var table=tables.find(function(v){return v.mesa===Number(data.slice(6));}),grab=tableGrab||{dx:0,dy:0};tableGrab=null;saveTable(table,positionFromClient(e.clientX-grab.dx,e.clientY-grab.dy));};
    var form=document.getElementById('table-form');if(form)form.onsubmit=function(e){e.preventDefault();saveTable(t,{capacity:Number(form.elements.capacity.value),x:Number(form.elements.x.value),y:Number(form.elements.y.value)});};
    var search=document.getElementById('seat-search');search.oninput=function(){filterSearch(box);};
    search.onkeydown=function(e){if(e.key!=='Enter')return;e.preventDefault();var hit=box.querySelector('.exp-person.match');if(hit)hit.scrollIntoView({block:'center',inline:'center',behavior:'smooth'});};
    filterSearch(box);
    viewport.addEventListener('scroll',cardFrame,{passive:true});
    bindPinch(viewport);
    bindSeatTouch(box);
  }
  function filterSearch(box) {
    var input = document.getElementById('seat-search'); seatSearch = input.value; var q = norm(seatSearch).trim(), seated = 0;
    box.querySelectorAll('.exp-free-list [data-guest]').forEach(function (row) { var g = E.guests.find(function (v) { return v.id === Number(row.dataset.guest); }); row.hidden = !!q && !(g && norm(g.name).includes(q)); });
    box.querySelectorAll('.exp-person').forEach(function (node) { var g = E.guests.find(function (v) { return v.id === Number(node.dataset.guest); }), hit = !!q && !!g && norm(g.name).includes(q); node.classList.toggle('match', hit); if (hit) seated++; });
    var hint = document.getElementById('seat-search-hint'); hint.hidden = !q;
    hint.textContent = q ? (seated ? seated + (seated === 1 ? ' persona con mesa resaltada' : ' personas con mesa resaltadas') + ' en el plano. Enter para ir.' : 'Nadie con mesa coincide.') : '';
  }
  function pickFrom(node) {
    var id = Number(node.dataset.pickGuest), person = Number(node.dataset.personIndex || 0);
    if (pickedGuest === id && pickedPerson === person) { pickedGuest = null; renderTables(); return; }
    pickedGuest = id; pickedPerson = person; renderTables();
    var dest = document.getElementById('move-destination'); if (dest && !node.classList.contains('exp-person')) dest.focus({preventScroll: true});
  }
  function ghostClick(e) { var s = suppressSeatClick; return Date.now() < s.until && Math.hypot(e.clientX - s.x, e.clientY - s.y) < 16; }
  // With someone picked, tapping a table only chooses it as destination: moving a whole group needs "Mover".
  function tableTap(mesa) {
    if (pickedGuest === null) { selectedTable = mesa; renderTables(); return; }
    var dest = document.getElementById('move-destination'), option = dest && dest.querySelector('option[value="' + mesa + '"]'); if (!dest) return;
    if (!option || option.disabled) { notify(SEAT_ERRORS.table_full, true); return; }
    dest.value = String(mesa); dest.onchange();
    var go = document.getElementById('move-picked'); if (go) go.focus({preventScroll: true});
    notify('Mesa ' + mesa + ' elegida. Pulsa "' + (go ? go.textContent : 'Mover') + '" para confirmar.');
  }
  function rejectDrop(node) { notify(node.dataset.chair && node.classList.contains('exp-person') ? SEAT_ERRORS.seat_occupied : SEAT_ERRORS.table_full, true); }
  // Keyboard: one Tab stop per table; arrows walk its chairs, Escape goes back to the table.
  function seatKeys(e) {
    var el = e.target, group = el.closest && el.closest('.exp-table-group'); if (!group) return;
    var seats = Array.prototype.slice.call(group.querySelectorAll('.exp-person,.exp-empty-seat')); if (!seats.length) return;
    var next = ['ArrowRight', 'ArrowDown'].indexOf(e.key) >= 0, prev = ['ArrowLeft', 'ArrowUp'].indexOf(e.key) >= 0, i = seats.indexOf(el);
    if (el.classList.contains('exp-table')) { if (next || e.key === 'Home') { e.preventDefault(); seats[0].focus(); } else if (prev || e.key === 'End') { e.preventDefault(); seats[seats.length - 1].focus(); } return; }
    if (i < 0) return;
    if (next || prev) { e.preventDefault(); seats[(i + (next ? 1 : seats.length - 1)) % seats.length].focus(); }
    else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); seats[e.key === 'Home' ? 0 : seats.length - 1].focus(); }
    else if (e.key === 'Escape' && pickedGuest === null) { e.preventDefault(); group.querySelector('.exp-table').focus(); }
  }
  function dropTarget(node) { return {mesa: node.dataset.seatTarget ? Number(node.dataset.seatTarget) : node.dataset.dropTable ? Number(node.dataset.dropTable) : null, chair: node.dataset.chair ? Number(node.dataset.chair) : undefined}; }
  function dropCheck(info, node) {
    var g = E.guests.find(function (v) { return v.id === info.guest; }), d = dropTarget(node); if (!g) return false;
    if (d.mesa === null || g.mesa === d.mesa) return true;
    var t = tables.find(function (v) { return v.mesa === d.mesa; }); if (!t) return false;
    if (count(d.mesa) + 1 + (g.companions || 0) > t.capacity) return false;
    return !(d.chair && chairPeople(t)[d.chair - 1]);
  }
  function dropGuest(id, person, node) { var d = dropTarget(node); moveGuest(id, d.mesa, d.chair, person); }
  function markDrop(node, ok) { clearDropMarks(); node.classList.add(ok ? 'drop-ready' : 'drop-bad'); }
  function clearDropMarks() { document.querySelectorAll('#tB .drop-ready,#tB .drop-bad').forEach(function (n) { n.classList.remove('drop-ready', 'drop-bad'); }); }
  function setMoving(on) {
    var board = document.getElementById('seat-board'); if (!board) return; board.classList.toggle('is-moving', !!on);
    // Dim the tables where the group being moved does not fit.
    var g = on && E.guests.find(function (v) { return v.id === (dragInfo ? dragInfo.guest : pickedGuest); });
    board.querySelectorAll('.exp-table-group').forEach(function (node) { var t = tables.find(function (v) { return v.mesa === Number(node.dataset.dropTable); }); node.classList.toggle('no-fit', !!g && !!t && !fits(g, t)); });
  }
  function positionFromClient(x, y) {
    var room = document.getElementById('seat-room').getBoundingClientRect(), px = (x - room.left) / seatZoom - WALL, py = (y - room.top) / seatZoom - WALL;
    return {x: Math.round(clamp(px / ROOM_W * 100, 3, 97)), y: Math.round(clamp(py / ROOM_H * 100, 3, 97))};
  }
  function currentZoom() { var board = document.getElementById('seat-board'); return seatZoom || (board && parseFloat(board.style.getPropertyValue('--z'))) || 0.5; }
  function fitZoom() { var view = document.querySelector('#tB .exp-plan-viewport'); return clamp(((view ? view.clientWidth : 800) - 4) / BOARD_W, MIN_ZOOM, 1.2); }
  // "Ver todo": the whole salon, by width and by the viewport's maximum height (its own height shrinks with the board).
  function fitAll() { var view = document.querySelector('#tB .exp-plan-viewport'); if (!view) return fitZoom(); var maxH = parseFloat(getComputedStyle(view).maxHeight) || innerHeight * 0.7; return clamp(Math.min((view.clientWidth - 4) / BOARD_W, (maxH - 4) / BOARD_H), MIN_ZOOM, 1.2); }
  function applyZoom(value, fx, fy) {
    var view = document.querySelector('#tB .exp-plan-viewport'), size = document.querySelector('#tB .exp-plan-size'), board = document.getElementById('seat-board'); if (!view || !board) return;
    var z = clamp(value, MIN_ZOOM, MAX_ZOOM), r = view.getBoundingClientRect(), old = currentZoom();
    if (fx == null) { fx = r.left + view.clientWidth / 2; fy = r.top + view.clientHeight / 2; }
    // Anchor on the board itself: it is centered when narrower than the viewport.
    var sr = size.getBoundingClientRect(), bx = (fx - sr.left) / old, by = (fy - sr.top) / old;
    seatZoom = z; size.style.width = BOARD_W * z + 'px'; size.style.height = BOARD_H * z + 'px'; board.style.transform = 'scale(' + z + ')'; board.style.setProperty('--z', z);
    var mx = Math.max(0, (view.clientWidth - BOARD_W * z) / 2);
    view.scrollLeft = bx * z + mx - (fx - r.left); view.scrollTop = by * z - (fy - r.top);
    var out = document.getElementById('zoom-value'); if (out) out.textContent = Math.round(z * 100) + '%';
    refreshCard();
  }
  function bindPinch(view) {
    var pinch = null;
    function gap(e) { return Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); }
    view.addEventListener('touchstart', function (e) { if (e.touches.length === 2) { cancelTouchDrag(); pinch = {d: gap(e) || 1, z: currentZoom()}; } }, {passive: true});
    view.addEventListener('touchmove', function (e) { if (!pinch || e.touches.length !== 2) return; e.preventDefault(); applyZoom(pinch.z * gap(e) / pinch.d, (e.touches[0].clientX + e.touches[1].clientX) / 2, (e.touches[0].clientY + e.touches[1].clientY) / 2); }, {passive: false});
    view.addEventListener('touchend', function (e) { if (e.touches.length < 2) pinch = null; });
    // One mouse notch is about x1.28, like the buttons; trackpad pinches send small deltas and stay smooth.
    view.addEventListener('wheel', function (e) { if (!e.ctrlKey) return; e.preventDefault(); var dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY; applyZoom(currentZoom() * Math.exp(-clamp(dy, -25, 25) * 0.01), e.clientX, e.clientY); }, {passive: false});
  }
  function seatCard() {
    var card = document.getElementById('seat-card');
    if (!card) { card = document.createElement('div'); card.id = 'seat-card'; card.className = 'exp-seat-card'; card.setAttribute('role', 'tooltip'); card.hidden = true; document.body.appendChild(card); }
    return card;
  }
  function navShown(nav) { return !!nav && nav.getClientRects().length > 0 && getComputedStyle(nav).display !== 'none'; }
  function planOnScreen() { var s2 = document.getElementById('S2'), panel = document.getElementById('p-mesas'); return !!E && !!panel && panel.classList.contains('active') && (!s2 || s2.classList.contains('active')); }
  function showCard(node) {
    if (!planOnScreen()) { hideCard(); return; }
    var g = E && E.guests.find(function (v) { return v.id === Number(node.dataset.guest); }); if (!g) return;
    var person = Number(node.dataset.personIndex || 0), size = 1 + (g.companions || 0), card = seatCard();
    var role = person ? 'Acompaña a ' + g.name : size > 1 ? 'Titular · ' + size + ' personas' : 'Invitado', status = {confirmed: 'Confirmado', pending: 'Pendiente'}[g.status] || '';
    card.innerHTML = '<strong>' + esc(person ? 'Acompañante ' + person : g.name) + '</strong><small>' + esc(role) + '</small><span>Mesa ' + esc(node.dataset.seatTarget) + ' · Silla ' + esc(node.dataset.chair) + (status ? ' · ' + status : '') + '</span>';
    var r = node.getBoundingClientRect(), view = document.querySelector('#tB .exp-plan-viewport'), vr = view && view.getBoundingClientRect();
    var bar = document.querySelector('#tB .exp-move-bar'), nav = document.getElementById('bottomNav');
    var floor = Math.min(innerHeight, bar ? bar.getBoundingClientRect().top : innerHeight, navShown(nav) ? nav.getBoundingClientRect().top : innerHeight);
    var top = vr ? Math.max(vr.top, 0) : 0, bottom = vr ? Math.min(vr.bottom, floor) : floor, left = vr ? Math.max(vr.left, 0) : 0, right = vr ? Math.min(vr.right, innerWidth) : innerWidth;
    if (!r.width || !vr || r.bottom < top || r.top > bottom || r.right < left || r.left > right) { hideCard(); return; }
    card.hidden = false;
    var h = card.offsetHeight, w = card.offsetWidth, above = r.top - h - 14 >= top, below = !above && r.bottom + h + 14 <= bottom;
    if (!above && !below) { hideCard(); return; }
    card.classList.toggle('below', below);
    card.style.left = clamp(r.left + r.width / 2, Math.max(vr.left, 0) + w / 2 + 4, Math.min(vr.right, innerWidth) - w / 2 - 4) + 'px'; card.style.top = (below ? r.bottom : r.top) + 'px';
  }
  function hideCard() { var card = document.getElementById('seat-card'); if (card) card.hidden = true; }
  // The picked person keeps its card; hover and keyboard focus show others temporarily.
  var cardTicking = false;
  function cardFrame() { if (cardTicking) return; cardTicking = true; requestAnimationFrame(function () { cardTicking = false; refreshCard(); }); }
  function refreshCard() {
    if (!planOnScreen()) { hideCard(); return; }
    var focused = document.activeElement, box = document.getElementById('tB');
    if (focused && focused.classList && focused.classList.contains('exp-person') && box && box.contains(focused) && focused.matches(':focus-visible')) { showCard(focused); return; }
    var picked = pickedGuest !== null && document.querySelector('#tB .exp-person.picked');
    if (picked) showCard(picked); else hideCard();
  }
  function cancelTouchDrag() {
    var d = touchDrag; if (!d) return; touchDrag = null; clearTimeout(d.timer);
    if (d.ghost) d.ghost.remove(); d.handle.classList.remove('lifted');
    if (d.active) { dragInfo = null; clearDropMarks(); setMoving(pickedGuest !== null); }
  }
  function targetAt(x, y) { var under = document.elementFromPoint(x, y); return under && under.closest('#tB [data-seat-target],#tB [data-drop-table],#tB [data-unseat]'); }
  function insideViewport(x, y) { var view = document.querySelector('#tB .exp-plan-viewport'), r = view && view.getBoundingClientRect(); return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }
  function autoScroll(x, y) {
    var view = document.querySelector('#tB .exp-plan-viewport'), r = view.getBoundingClientRect(), bar = document.querySelector('#tB .exp-move-bar'), nav = document.getElementById('bottomNav');
    var bottom = Math.min(r.bottom, innerHeight, bar ? bar.getBoundingClientRect().top : innerHeight, navShown(nav) ? nav.getBoundingClientRect().top : innerHeight), top = Math.max(r.top, 0);
    if (y < top || y > bottom) return;
    if (x > r.right - 28) view.scrollLeft += 16; if (x < r.left + 28) view.scrollLeft -= 16;
    // The page itself only moves when the plan is cut off by the screen or the bottom bar and cannot scroll further.
    if (y > bottom - 28) { var down = view.scrollTop; view.scrollTop += 16; if (view.scrollTop === down && r.bottom > bottom + 1) window.scrollBy(0, 16); }
    if (y < top + 28) { var up = view.scrollTop; view.scrollTop -= 16; if (view.scrollTop === up && r.top < top - 1) window.scrollBy(0, -16); }
  }
  // Touch: a short swipe scrolls as usual; holding still for LONG_PRESS lifts the person or table to drag it.
  function bindSeatTouch(box) {
    box.querySelectorAll('[data-pick-guest],[data-move-table]').forEach(function (handle) {
      handle.oncontextmenu = function (e) { e.preventDefault(); };
      handle.addEventListener('touchstart', function (e) {
        cancelTouchDrag(); if (seatingBusy || e.touches.length !== 1) return;
        var t = e.touches[0], d = touchDrag = {handle: handle, x: t.clientX, y: t.clientY, lastX: t.clientX, lastY: t.clientY, active: false, moved: false};
        d.timer = setTimeout(function () {
          if (touchDrag !== d) return; d.active = true; hideCard(); handle.classList.add('lifted');
          try { if (navigator.vibrate) navigator.vibrate(10); } catch (err) {}
          d.ghost = document.createElement('div'); d.ghost.className = 'exp-drag-ghost'; d.ghost.textContent = handle.dataset.label || handle.textContent.trim();
          d.ghost.style.left = d.lastX + 'px'; d.ghost.style.top = d.lastY + 'px'; document.body.appendChild(d.ghost);
          if (handle.dataset.pickGuest) { dragInfo = {guest: Number(handle.dataset.pickGuest), person: Number(handle.dataset.personIndex || 0)}; setMoving(true); }
          else { var r = handle.getBoundingClientRect(); d.grab = {dx: d.x - (r.left + r.width / 2), dy: d.y - (r.top + r.height / 2)}; }
        }, LONG_PRESS);
      }, {passive: true});
      handle.addEventListener('touchmove', function (e) {
        var d = touchDrag; if (!d || d.handle !== handle) return;
        if (e.touches.length > 1) { cancelTouchDrag(); return; }
        var t = e.touches[0]; d.lastX = t.clientX; d.lastY = t.clientY;
        if (!d.active) { if (Math.hypot(t.clientX - d.x, t.clientY - d.y) > 10) cancelTouchDrag(); return; }
        e.preventDefault(); if (Math.hypot(t.clientX - d.x, t.clientY - d.y) > 10) d.moved = true;
        d.ghost.style.left = t.clientX + 'px'; d.ghost.style.top = t.clientY + 'px';
        if (dragInfo) { var target = targetAt(t.clientX, t.clientY); if (target) markDrop(target, dropCheck(dragInfo, target)); else clearDropMarks(); }
        autoScroll(t.clientX, t.clientY);
      }, {passive: false});
      handle.addEventListener('touchend', function (e) {
        var d = touchDrag; if (!d || d.handle !== handle) return;
        if (!d.active) { cancelTouchDrag(); return; }
        e.preventDefault();
        var t = e.changedTouches[0], info = dragInfo; cancelTouchDrag(); suppressSeatClick = {until: Date.now() + 700, x: t.clientX, y: t.clientY};
        if (!d.moved) { if (handle.dataset.pickGuest) pickFrom(handle); else tableTap(Number(handle.dataset.moveTable)); return; }
        if (info) { var target = targetAt(t.clientX, t.clientY); if (target) { if (dropCheck(info, target)) dropGuest(info.guest, info.person, target); else rejectDrop(target); } return; }
        if (insideViewport(t.clientX, t.clientY)) { var table = tables.find(function (v) { return v.mesa === Number(handle.dataset.moveTable); }); saveTable(table, positionFromClient(t.clientX - d.grab.dx, t.clientY - d.grab.dy)); }
      });
      handle.addEventListener('touchcancel', cancelTouchDrag);
    });
  }
  // A table dropped by hand must land on free floor, judged as it will be drawn (pushed inside the walls).
  function placementProblem(table, x, y, capacity) {
    var spot = {x: x, y: y};
    if (touchesPista(spot, capacity, layout.scale)) return 'Ahí está la pista de baile. Suelta la mesa en un espacio libre.';
    var other = tables.find(function (o) { var p = layout.pos[o.mesa]; return o.mesa !== table.mesa && p && overlap(spot, capacity, p, o.capacity, layout.scale); });
    return other ? 'Ahí ya está la Mesa ' + other.mesa + '. Suelta la mesa en un espacio libre.' : '';
  }
  async function saveTable(table, changes) {
    if(!table)return;if(seatingBusy){busyNotice();return;}
    var shown=shownPosition(table),next=Object.assign({capacity:table.capacity,x:shown.x,y:shown.y},changes);
    if(!Number.isInteger(next.capacity)||next.capacity<1||next.capacity>MAX_CAPACITY){notify(SEAT_ERRORS.invalid_table,true);return;}
    if(next.x!==shown.x||next.y!==shown.y){var problem=placementProblem(table,next.x,next.y,next.capacity);if(problem){notify(problem,true);return;}}
    seatingBusy=true;setBusy(true);message('seat-message','Guardando mesa…');
    var result;
    try{result=await withTimeout(request(Object.assign({op:'table-save',mesa:table.mesa,expectedVersion:table.version},next)));}
    catch(e){seatingBusy=false;setBusy(false);var text=e.message==='table_full'?'Esa mesa tiene más personas que el nuevo cupo. Muévelas antes de reducirlo.':seatError(e);if(e.status===-1||e.message==='version_conflict'){notify(text,true);refreshWithNotice(text);}else{renderTables();notify(text,true);}return;}
    tables=tables.map(function(t){return t.mesa===table.mesa?result.table:t;});mutationSeq++;
    // Saving a table can renumber its chairs (and bump those guests' versions): reload them before drawing.
    try{await refreshGuests();}catch(e){/* saved anyway; the next refresh brings the chairs */}
    seatingBusy=false;setBusy(false);renderTables();notify('Mesa guardada.');
  }
  async function moveGuest(id, mesa, chair, person) {
    if(seatingBusy){busyNotice();return;}var g=E.guests.find(function(g){return g.id===id;});if(!g)return;
    person=person||0;mesa=mesa==null?null:mesa;
    // Dropping someone where they already are is not a change: skip the write.
    if(mesa===(g.mesa||null)&&(!chair||chair===currentChair(g,person))){if(pickedGuest!==null){pickedGuest=null;renderTables();}return;}
    var t=tables.find(function(t){return t.mesa===mesa;});
    if(t&&g.mesa!==mesa&&count(mesa)+1+(g.companions||0)>t.capacity){notify(SEAT_ERRORS.table_full,true);return;}
    // Who this view shows in the chosen chair: the server refuses the swap if someone else sat there meanwhile.
    var occupant=null;if(chair&&t){var occ=chairPeople(t)[chair-1];occupant=occ?{guestId:occ.guest.id,personIndex:occ.personIndex}:null;}
    var dest=document.getElementById('move-destination'),seat=document.getElementById('move-chair'),kept=dest?{mesa:dest.value,chair:seat&&seat.value}:null;
    seatingBusy=true;setBusy(true);message('seat-message','Guardando asignación…');
    ['move-picked','cancel-picked'].forEach(function(n){var b=document.getElementById(n);if(b)b.disabled=true;});
    try{var result=await withTimeout(request(Object.assign({op:'guest-seat',guestId:id,mesa:mesa,expectedVersion:g.version||1},chair?{seatIndex:chair,personIndex:person,expectedOccupant:occupant}:{})));(result.guests||[result.guest]).forEach(replaceGuest);mutationSeq++;pickedGuest=null;pendingFocus='.exp-person[data-guest="'+id+'"][data-person-index="'+person+'"]';seatingBusy=false;setBusy(false);renderTables();uS();notify(chair?'Silla '+chair+' guardada.':'Asignación guardada.');}
    catch(e){seatingBusy=false;setBusy(false);var text=seatError(e);
      if(e.status===-1||e.message==='version_conflict'){notify(text,true);refreshWithNotice(text);return;}
      renderTables();notify(text,true);
      // Keep what the person chose in the move bar, so a rejected move can be corrected instead of redone.
      var d=document.getElementById('move-destination');if(kept&&d&&pickedGuest!==null){d.value=kept.mesa;d.onchange();var c=document.getElementById('move-chair');if(c&&kept.chair)c.value=kept.chair;}}
    finally{seatingBusy=false;setBusy(false);}
  }
  window.aM=async function(){var input=document.getElementById('nM'),n=Number(input.value);if(!Number.isInteger(n)||n<1||n>60){toast('Elige entre 1 y 60 mesas',1);return;}if(E.guests.some(function(g){return g.mesa>n&&g.status!=='cancelled';})){toast('Reasigna los invitados antes de quitar sus mesas.',1);return;}try{await request({op:'db',method:'PATCH',table:'eventus_events',query:'code=eq.'+E.code,body:{num_mesas:n}});E.numMesas=n;pM();await rT();toast('Número de mesas guardado');}catch(e){toast(seatError(e),1);}};

  function minute(p){var v=String(p.time||'00:00').split(':');return Number(v[0])*60+Number(v[1])+(Number(p.day_offset||p.dayOffset||0)*1440);}
  function warnings(list){var sorted=list.slice().sort(function(a,b){return minute(a)-minute(b);}), result=[];for(var i=0;i<sorted.length;i++){var p=sorted[i];if(minute(p)%1440+p.dur>1440)result.push(p.name+' termina al día siguiente.');for(var j=i+1;j<sorted.length;j++)if(minute(sorted[j])<minute(p)+p.dur)result.push(p.name+' se solapa con '+sorted[j].name+'.');}var total=list.reduce(function(n,p){return n+p.dur;},0),limit=(E.hours||0)*60;if(limit&&total>limit)result.push('La duración total excede el paquete por '+(total-limit)+' minutos.');return result;}
  window.rProg=function(){var box=document.getElementById('progC');box.classList.add('experience');var list=E.program||[],p=programEdit||{name:'',time:'18:00',dur:15,note:'',responsible:'',status:'pending',day_offset:0};
    box.innerHTML='<button class="sub-back" onclick="backToMas()">← Volver</button><h3>Programa del evento</h3><p class="exp-muted">Organiza horarios y responsables. Marca cada avance con una acción explícita.</p><div id="program-message" role="status" hidden></div>'+warnings(list).map(function(w){return '<div class="exp-notice">'+esc(w)+'</div>';}).join('')+'<form id="program-form" class="exp-form exp-card"><label class="exp-wide">Actividad<input name="name" required maxlength="150" value="'+esc(p.name)+'"></label><label>Horario<input name="time" type="time" required value="'+esc(p.time).slice(0,5)+'"></label><label>Día<select name="dayOffset"><option value="0">Día del evento</option><option value="1" '+((p.day_offset||p.dayOffset)?'selected':'')+'>Día siguiente</option></select></label><label>Duración (minutos)<input name="dur" type="number" min="1" max="1440" required value="'+p.dur+'"></label><label>Responsable<input name="responsible" maxlength="150" value="'+esc(p.responsible||'')+'"></label><label class="exp-wide">Notas<textarea name="note" maxlength="2000">'+esc(p.note)+'</textarea></label><div class="exp-actions exp-wide"><button>'+(p.id?'Guardar cambios':'Agregar actividad')+'</button>'+(p.id?'<button type="button" id="program-cancel">Cancelar edición</button>':'')+'</div></form><section aria-label="Actividades">'+list.slice().sort(function(a,b){return minute(a)-minute(b);}).map(function(a){return '<article class="exp-program '+a.status+'"><span class="exp-status">'+({pending:'PENDIENTE',in_progress:'EN CURSO',completed:'TERMINADA'}[a.status]||'PENDIENTE')+'</span><h4>'+esc(a.time).slice(0,5)+((a.day_offset||a.dayOffset)?' (+1 día)':'')+' · '+esc(a.name)+'</h4><p>'+a.dur+' min · '+esc(a.responsible||'Sin responsable')+'</p>'+(a.note?'<p class="exp-muted">'+esc(a.note)+'</p>':'')+'<div class="exp-actions"><button data-edit-program="'+a.id+'">Editar</button><button data-state-program="'+a.id+'" data-next="'+(a.status==='pending'?'in_progress':a.status==='in_progress'?'completed':'pending')+'">'+(a.status==='pending'?'Iniciar':a.status==='in_progress'?'Terminar':'Reabrir')+'</button><button data-delete-program="'+a.id+'">Eliminar</button></div></article>';}).join('')+(list.length?'':'<p class="exp-muted">Aún no hay actividades. Agrega la primera arriba.</p>')+'</section>';
    document.getElementById('program-form').onsubmit=saveProgramForm;box.querySelectorAll('[data-state-program],[data-delete-program]').forEach(function(b){b.disabled=!!programEdit;});var cancel=document.getElementById('program-cancel');if(cancel)cancel.onclick=function(){programEdit=null;rProg();};box.querySelectorAll('[data-edit-program]').forEach(function(b){b.onclick=function(){programEdit=list.find(function(p){return p.id===Number(b.dataset.editProgram);});rProg();document.querySelector('#program-form input').focus();};});box.querySelectorAll('[data-state-program]').forEach(function(b){b.onclick=function(){var p=list.find(function(p){return p.id===Number(b.dataset.stateProgram);});mutateProgram(Object.assign({},p,{status:b.dataset.next}));};});box.querySelectorAll('[data-delete-program]').forEach(function(b){b.onclick=async function(){var p=list.find(function(p){return p.id===Number(b.dataset.deleteProgram);});if(!confirm('¿Eliminar '+p.name+' del programa?'))return;b.disabled=true;try{await request({op:'program-delete',id:p.id,expectedVersion:p.version||1});E.program=E.program.filter(function(v){return v.id!==p.id;});programEdit=null;rProg();message('program-message','Actividad eliminada.');}catch(e){message('program-message',e.message,true);b.disabled=false;}};});
  };
  async function saveProgramForm(e){e.preventDefault();var f=e.currentTarget,p=Object.assign({},programEdit||{status:'pending'},{name:f.elements.name.value.trim(),time:f.elements.time.value,dur:Number(f.elements.dur.value),dayOffset:Number(f.elements.dayOffset.value),day_offset:Number(f.elements.dayOffset.value),responsible:f.elements.responsible.value.trim(),note:f.elements.note.value.trim()});var ws=warnings((E.program||[]).filter(function(v){return v.id!==p.id;}).concat([p]));if(ws.length&&!confirm(ws.join('\n')+'\n\n¿Guardar con estas advertencias?'))return;await mutateProgram(p);}
  async function mutateProgram(p){if(programBusy)return;programBusy=true;var f=document.getElementById('program-form');document.querySelectorAll('#progC button').forEach(function(b){b.disabled=true;});message('program-message','Guardando actividad…');try{var result=await request({op:'program-save',id:p.id,name:p.name,time:p.time,dur:p.dur,note:p.note||'',responsible:p.responsible||'',status:p.status||'pending',dayOffset:Number(p.dayOffset||p.day_offset||0),expectedVersion:p.id?(p.version||1):undefined});E.program=(E.program||[]).filter(function(v){return v.id!==result.activity.id;}).concat([result.activity]);programEdit=null;rProg();message('program-message','Actividad guardada.');}catch(e){message('program-message',e.status===409?'La actividad cambió en otra sesión. Recarga el evento antes de volver a guardar; tu captura se conserva.':e.message,true);document.querySelectorAll('#progC button').forEach(function(b){b.disabled=!!programEdit&&(b.hasAttribute('data-state-program')||b.hasAttribute('data-delete-program'));});}finally{programBusy=false;}}

  var oldMas=window.rMas;
  window.rMas=function(){oldMas();var grid=document.querySelector('#p-mas .mas-grid');if(grid&&E&&(E.activated||ADMIN_VIEW)){var b=document.createElement('button');b.className='mas-card';b.innerHTML='<span class="mas-icon">▧</span><span class="mas-info"><span class="mas-title">Fotos del evento</span><span class="mas-desc">Subir fotos y ver la galería compartida</span></span>';b.onclick=showGallery;grid.appendChild(b);}};
  async function showGallery(){var panel=document.getElementById('p-galeria');if(!panel){panel=document.createElement('div');panel.className='pn experience';panel.id='p-galeria';document.querySelector('#S2 main').appendChild(panel);}goPanel('galeria');panel.innerHTML='<button onclick="backToMas()">← Volver</button><h3>Fotos del evento</h3><p role="status">Consultando galería…</p>';try{var g=await request({op:'gallery-get'});panel.innerHTML='<button onclick="backToMas()">← Volver</button><h3>Fotos del evento</h3>'+(g.configured?'<p class="exp-muted">Comparte los recuerdos de tu evento. Las fotos se publican según la moderación del salón.</p><div class="exp-actions">'+(safeUrl(g.uploadUrl)?'<a class="exp-link" href="'+esc(g.uploadUrl)+'" target="_blank" rel="noopener noreferrer">Subir fotos</a>':'')+(safeUrl(g.galleryUrl)?'<a class="exp-link" href="'+esc(g.galleryUrl)+'" target="_blank" rel="noopener noreferrer">Ver galería</a>':'')+'</div><p class="exp-muted">'+esc({abierto:'La carga de fotos está abierta.',cerrado:'La carga de fotos está cerrada.',aun_no:'La carga de fotos se abrirá durante el evento.',deshabilitado:'La carga de fotos está deshabilitada.'}[g.windowState]||'El acceso respeta los horarios configurados por el salón.')+'</p>':'<div class="exp-notice">La galería de este evento todavía no está configurada. El salón debe vincularla para habilitar las fotos.</div>');}catch(e){panel.innerHTML='<button onclick="backToMas()">← Volver</button><h3>Fotos del evento</h3><div class="exp-error" role="alert">'+esc(e.message)+'</div>';var retry=document.createElement('button');retry.textContent='Reintentar';retry.onclick=showGallery;panel.appendChild(retry);}}
  function safeUrl(value){try{return new URL(value).protocol==='https:';}catch(e){return false;}}

  var oldReception=window.admRenderCheckinDetail;
  window.admRenderCheckinDetail=function(){stopCamera();return '<div class="experience">'+oldReception()+'<section class="exp-card"><h4>Leer pase QR</h4><p class="exp-muted">Escanea o pega el enlace del pase. La llegada se registra únicamente al pulsar Verificar y registrar.</p><label>Enlace del pase<input id="reception-token" type="text" autocomplete="off" placeholder="Pega el enlace privado del invitado"></label><div class="exp-actions"><button onclick="eventusScanCamera()">Abrir cámara</button><button onclick="eventusStopCamera()">Cerrar cámara</button><button onclick="eventusReceiveQR()">Verificar y registrar</button></div><video id="reception-video" class="exp-camera" playsinline muted hidden></video><div id="reception-message" role="status" hidden></div><p id="reception-table" class="exp-reception-table" aria-live="polite" hidden></p></section></div>';};
  function stopCamera(){if(cameraTimer)clearTimeout(cameraTimer);cameraTimer=null;if(cameraStream)cameraStream.getTracks().forEach(function(t){t.stop();});cameraStream=null;var v=document.getElementById('reception-video');if(v){v.srcObject=null;v.hidden=true;}}
  window.eventusStopCamera=stopCamera;
  window.eventusScanCamera=async function(){stopCamera();try{if(!window.BarcodeDetector)throw new Error('Este navegador no puede leer QR con cámara. Pega el enlace del pase o busca al invitado por nombre.');cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});var v=document.getElementById('reception-video');v.hidden=false;v.srcObject=cameraStream;await v.play();var detector=new BarcodeDetector({formats:['qr_code']});async function scan(){if(!cameraStream||!document.getElementById('reception-video')){stopCamera();return;}try{var codes=await detector.detect(v);if(codes.length){document.getElementById('reception-token').value=codes[0].rawValue;stopCamera();message('reception-message','Pase leído. Pulsa Verificar y registrar para confirmar la llegada.');return;}}catch(e){}cameraTimer=setTimeout(scan,300);}scan();}catch(e){stopCamera();message('reception-message',e.name==='NotAllowedError'?'Permiso de cámara denegado. Puedes pegar el enlace o buscar por nombre.':e.name==='NotFoundError'?'No encontramos una cámara en este equipo. Pega el enlace del pase o busca por nombre.':e.name==='NotReadableError'?'Otra aplicación está usando la cámara. Ciérrala o busca al invitado por nombre.':/BarcodeDetector|QR/.test(e.message)?e.message:'No se pudo abrir la cámara. Pega el enlace del pase o busca por nombre.',true);}};
  // The hostess needs the table right away: show it big next to the check-in result.
  function receptionPlace(g){var seats=(g.seat_slots||[]).filter(Boolean),people=1+(g.companions||0);return g.mesa?'MESA '+g.mesa+(seats.length?' · '+(seats.length>1?'sillas ':'silla ')+seats.join(', '):'')+' · '+people+(people>1?' personas':' persona'):'SIN MESA ASIGNADA · avisa al capitán de meseros';}
  function showReceptionPlace(g){var node=document.getElementById('reception-table');if(!node)return;node.textContent=g?receptionPlace(g):'';node.hidden=!g;node.classList.toggle('exp-reception-missing',!!g&&!g.mesa);}
  async function receive(body){message('reception-message','Verificando pase…');showReceptionPlace(null);try{var result=await withTimeout(apiCall(Object.assign({op:'guest-checkin',code:ADM_CHECKIN_CODE},body)));var ev=ADM_EVENTS.find(function(e){return e.code===ADM_CHECKIN_CODE;}),guest=result.guest;if(ev){var i=ev._guests.findIndex(function(g){return g.id===result.guest.id;});if(i>=0){guest=Object.assign({},ev._guests[i],result.guest);ev._guests[i]=guest;}}admRender();message('reception-message',(result.alreadyArrived?'Este pase ya fue registrado: ':'Llegada registrada: ')+result.guest.name,result.alreadyArrived);showReceptionPlace(guest);toast(result.alreadyArrived?'Este pase ya fue utilizado':'Llegada registrada',result.alreadyArrived);}catch(e){var text=friendlyError(e,RECEPTION_ERRORS,'No se pudo registrar la llegada; inténtalo de nuevo.');message('reception-message',text,true);toast(text,1);}}
  window.eventusReceiveQR=async function(){var value=document.getElementById('reception-token').value.trim(),token=value;try{var url=new URL(value);token=new URLSearchParams(url.hash.slice(1)).get('token')||'';}catch(e){}if(!token){message('reception-message','Pega un pase válido.',true);return;}await receive({guestToken:token});};
  window.admCheckinGuest=async function(id){await receive({guestId:id});};
  window.admDoCheckin=async function(){var input=document.getElementById('admScanInput'),name=input.value.trim().toLocaleLowerCase(),ev=ADM_EVENTS.find(function(e){return e.code===ADM_CHECKIN_CODE;});if(!name||!ev)return;var guests=ev._guests.filter(function(g){return g.name.toLocaleLowerCase().includes(name)&&g.status!=='cancelled';});if(guests.length!==1){var result=document.getElementById('admScanResult');result.textContent=guests.length?'Hay varias coincidencias. Usa el botón Llegó junto al invitado correcto.':'No se encontró al invitado.';return;}await receive({guestId:guests[0].id});};
  window.doCheckin=function(){toast('El registro de llegada requiere el acceso del personal del salón.',1);};
  document.addEventListener('visibilitychange',function(){if(document.hidden)stopCamera();});window.addEventListener('pagehide',stopCamera);
  window.addEventListener('scroll',cardFrame,{passive:true});window.addEventListener('resize',cardFrame);
  function watchScreens(){if(!window.MutationObserver)return;var watch=new MutationObserver(cardFrame);['S2','p-mesas'].forEach(function(id){var node=document.getElementById(id);if(node)watch.observe(node,{attributes:true,attributeFilter:['class']});});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watchScreens);else watchScreens();
})();
