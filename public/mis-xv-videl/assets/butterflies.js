/* Self-contained decoration: no scroll listeners, downloads, or frame loop. */
(() => {
  'use strict';
  if (window.VidelButterflies) return;

  function init() {
    if (window.VidelButterflies || !document.body) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const gate = document.getElementById('gate');
    const overlay = document.createElement('div');
    overlay.id = 'videl-flight-overlay';
    overlay.className = 'videl-flight-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.hidden = true;

    const paths = '<path d="M49 44C43 25 27 4 13 7C-1 11 2 28 9 37C17 46 33 49 48 49Z"/><path d="M47 49C30 46 16 48 18 64C20 77 30 81 38 72C44 65 48 55 47 49Z"/>';
    const veins = '<path d="M48 46 14 13M45 44 24 19M45 47 10 33M44 53 24 70M45 51 21 57M33 32l-12 3M32 42l-8-9M34 59l-4-7" fill="none" stroke="#b87993" stroke-width=".8" opacity=".55"/>';
    const flecks = '<g fill="#fff2f6" opacity=".68"><ellipse cx="13" cy="15" rx="2" ry="1.2" transform="rotate(-22 13 15)"/><ellipse cx="8" cy="25" rx="1.5" ry="1"/><ellipse cx="23" cy="69" rx="1.4" ry="1"/><ellipse cx="31" cy="75" rx="1.2" ry=".8"/></g>';
    const flights = [
      {size:72, route:'a', duration:20, delay:-3, opacity:.84, flap:1.2},
      {size:61, route:'b', duration:23, delay:-13, opacity:.76, flap:1.45},
      {size:67, route:'c', duration:22, delay:-8, opacity:.8, flap:1.15},
      {size:30, route:'d', duration:24, delay:-19, opacity:.48, flap:1.5},
      {size:40, route:'a', duration:18, delay:-12, opacity:.65, flap:1.3},
      {size:27, route:'b', duration:19, delay:-5, opacity:.5, flap:1.6},
      {size:48, route:'d', duration:23, delay:-10, opacity:.64, flap:1.1, desktop:true},
      {size:30, route:'c', duration:20, delay:-17, opacity:.48, flap:1.4, desktop:true},
      {size:34, route:'b', duration:24, delay:-21, opacity:.5, flap:1.2, desktop:true}
    ];
    function createButterfly(flight, index, burst = false) {
      const butterfly = document.createElement('span');
      butterfly.className = 'videl-flight-butterfly' + (flight.desktop ? ' videl-flight-desktop' : '');
      butterfly.style.cssText = `--videl-flight-size:${flight.size}px;--videl-flight-route:videl-flight-cross-${flight.route};--videl-flight-duration:${flight.duration}s;--videl-flight-delay:${flight.delay}s;--videl-flight-opacity:${flight.opacity};--videl-flight-flap:${flight.flap}s`;
      const gradient = `videl-flight-pink-${burst ? 'burst-' : ''}${index}`;
      butterfly.innerHTML = `<span class="videl-flight-drift"><svg class="videl-flight-wing videl-flight-wing--left" viewBox="0 0 50 85" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gradient}" x1=".05" y1=".1" x2=".9" y2=".8" gradientUnits="objectBoundingBox"><stop stop-color="#fff1f6"/><stop offset=".36" stop-color="#e7a7c0"/><stop offset=".72" stop-color="#f9dce7"/><stop offset="1" stop-color="#bb7894"/></linearGradient></defs><g fill="url(#${gradient})" stroke="#b67b94" stroke-width=".7">${paths}</g>${veins}${flecks}</svg><svg class="videl-flight-wing videl-flight-wing--right" viewBox="50 0 50 85" xmlns="http://www.w3.org/2000/svg"><g transform="translate(100 0) scale(-1 1)"><g fill="url(#${gradient})" stroke="#b67b94" stroke-width=".7">${paths}</g>${veins}${flecks}</g></svg><svg class="videl-flight-body" viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg"><path d="M49 42C47 36 44 33 42 31M51 42C53 36 56 33 58 31" fill="none" stroke="#a55e7c" stroke-width="1" stroke-linecap="round"/><path d="M50 40C46 43 47 52 49 62C50 65 51 62 52 54C53 47 53 42 50 40Z" fill="#a3657e"/></svg></span>`;
      return butterfly;
    }
    flights.forEach((flight, index) => overlay.appendChild(createButterfly(flight, index)));
    [
      [8,22,8,-2,3], [91,34,11,-8,3], [22,69,10,-4,2],
      [80,83,12,-10,3], [14,89,9,-6,2], [87,12,11,-3,2]
    ].forEach(([x, y, duration, delay, size]) => {
      const sparkle = document.createElement('span');
      sparkle.className = 'videl-flight-sparkle';
      sparkle.style.cssText = `--videl-flight-x:${x}%;--videl-flight-y:${y}%;--videl-flight-duration:${duration}s;--videl-flight-delay:${delay}s;--videl-flight-dot:${size}px`;
      overlay.appendChild(sparkle);
    });

    const control = document.createElement('button');
    control.type = 'button';
    control.className = 'videl-flight-control';
    control.setAttribute('aria-controls', overlay.id);
    control.hidden = true;
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 12 12');
    icon.setAttribute('aria-hidden', 'true');
    const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    icon.appendChild(iconPath);
    const label = document.createElement('span');
    control.append(icon, label);
    document.body.append(overlay);
    (document.querySelector('.hero-inner') || document.body).appendChild(control);

    let pausedByUser = false;
    let destroyed = false;
    let sawClosedGate = false;
    let burstPlayed = false;
    let burst = null;
    function removeBurst() {
      if (!burst) return;
      burst.removeEventListener('animationend', onBurstEnd);
      burst.remove();
      burst = null;
    }
    function onBurstEnd(event) {
      if (event.target === burst && event.animationName === 'videl-flight-burst-clock') removeBurst();
    }
    function startBurst() {
      burst = document.createElement('div');
      burst.className = 'videl-flight-burst';
      const halo = document.createElement('span');
      halo.className = 'videl-flight-halo';
      burst.appendChild(halo);
      const routes = [
        [76,-14,-17,-35,-39,-64,-68,-32,0],
        [64,18,-25,40,-48,66,-78,26,.12],
        [58,-4,-33,7,-63,-15,-84,-9,.3],
        [70,25,-12,48,-27,67,-30,42,.22],
        [52,-25,-6,-45,-17,-66,-30,-52,.42],
        [60,11,-18,28,-42,43,-80,12,.55],
        [48,-20,7,-39,16,-65,34,-116,.36],
        [56,20,8,44,21,68,38,116,.65]
      ];
      routes.forEach(([size,mx,my,lx,ly,ex,ey,turn,delay], index) => {
        const butterfly = createButterfly({size,route:'a',duration:5.2,delay,opacity:.9,flap:.86 + index*.045}, index, true);
        butterfly.style.cssText += `;--videl-flight-mid-x:${mx}vw;--videl-flight-mid-y:${my}vh;--videl-flight-late-x:${lx}vw;--videl-flight-late-y:${ly}vh;--videl-flight-end-x:${ex}vw;--videl-flight-end-y:${ey}vh;--videl-flight-turn:${turn}deg`;
        burst.appendChild(butterfly);
      });
      [
        [-43,-46],[-26,-63],[-7,-77],[17,-69],[35,-53],[49,-31],
        [-49,-23],[-30,-35],[-11,-52],[10,-48],[29,-30],[46,-13],
        [-42,14],[-21,28],[26,23],[48,15]
      ].forEach(([x,y], index) => {
        const star = document.createElement('span');
        star.className = 'videl-flight-burst-star';
        star.style.cssText = `--videl-flight-star-x:${x}vw;--videl-flight-star-y:${y}vh;--videl-flight-delay:${(index%6)*.16}s;--videl-flight-dot:${index%3 === 0 ? 5 : 3}px`;
        burst.appendChild(star);
      });
      burst.addEventListener('animationend', onBurstEnd);
      overlay.appendChild(burst);
    }
    function sync() {
      if (destroyed) return;
      const gated = document.body.classList.contains('locked') ||
        (document.documentElement.classList.contains('enhanced') && gate && !gate.hidden);
      const disabled = motion.matches || Boolean(connection && connection.saveData);
      if (gated) sawClosedGate = true;
      overlay.hidden = Boolean(gated || disabled);
      control.hidden = Boolean(gated || disabled);
      overlay.dataset.paused = String(pausedByUser || document.hidden || gated || disabled);
      document.documentElement.dataset.videlMotionPaused = String(pausedByUser || document.hidden || disabled);
      control.setAttribute('aria-pressed', String(pausedByUser));
      label.textContent = pausedByUser ? 'Activar animación' : 'Pausar animación';
      iconPath.setAttribute('d', pausedByUser ? 'M3 1.5 10 6 3 10.5Z' : 'M2 1h3v10H2Zm5 0h3v10H7Z');
      if (disabled && burst) removeBurst();
      if (!gated && gate && gate.hidden && sawClosedGate && !burstPlayed) {
        burstPlayed = true;
        if (!disabled && !pausedByUser) startBurst();
      }
    }
    function toggle() { pausedByUser = !pausedByUser; sync(); }
    control.addEventListener('click', toggle);
    document.addEventListener('visibilitychange', sync);
    const observer = new MutationObserver(sync);
    observer.observe(document.body, {attributes:true, attributeFilter:['class']});
    observer.observe(document.documentElement, {attributes:true, attributeFilter:['class']});
    if (gate) observer.observe(gate, {attributes:true, attributeFilter:['hidden']});
    if (motion.addEventListener) motion.addEventListener('change', sync);
    else if (motion.addListener) motion.addListener(sync);
    if (connection && connection.addEventListener) connection.addEventListener('change', sync);

    window.VidelButterflies = Object.freeze({
      pause() { pausedByUser = true; sync(); },
      resume() { pausedByUser = false; sync(); },
      isPaused() { return pausedByUser; },
      destroy() {
        destroyed = true;
        observer.disconnect();
        document.removeEventListener('visibilitychange', sync);
        control.removeEventListener('click', toggle);
        if (motion.removeEventListener) motion.removeEventListener('change', sync);
        else if (motion.removeListener) motion.removeListener(sync);
        if (connection && connection.removeEventListener) connection.removeEventListener('change', sync);
        removeBurst();
        overlay.remove();
        control.remove();
        delete document.documentElement.dataset.videlMotionPaused;
        delete window.VidelButterflies;
      }
    });
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
