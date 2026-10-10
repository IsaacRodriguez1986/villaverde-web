/* Ambient CSS motion only: no frame loop, scroll handler or network requests. */
(() => {
  'use strict';
  function init() {
    if (window.VidelRoyalMagic || !document.getElementById('invitation')) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const gate = document.getElementById('gate');
    const root = document.documentElement;
    const overlay = document.createElement('div');
    overlay.className = 'videl-royal-magic';
    overlay.id = 'videl-royal-magic';
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');

    function add(kind, x, y, size, duration, delay, drift = 10) {
      const piece = document.createElement('span');
      piece.className = `videl-royal-${kind}`;
      piece.style.cssText = `--royal-x:${x}%;--royal-y:${y}%;--royal-size:${size}px;--royal-duration:${duration}s;--royal-delay:${delay}s;--royal-drift:${drift}px`;
      overlay.appendChild(piece);
    }
    [
      [7, 9, 14, 5.6, -2], [92, 13, 11, 6.3, -4.2],
      [15, 23, 9, 7.4, -1], [84, 29, 17, 5.3, -3.3],
      [4, 42, 12, 8.1, -4.5], [96, 47, 10, 6.6, -1.4],
      [11, 62, 18, 6.8, -4.8], [87, 69, 11, 7.1, -2.2],
      [5, 85, 12, 5.8, -3.9], [94, 91, 16, 8.3, -6],
      [19, 5, 8, 7.9, -5], [81, 4, 8, 8.5, -1.8],
      [4, 27, 7, 6.7, -2.7], [97, 32, 8, 7.6, -6.1],
      [17, 77, 8, 8.7, -5.5], [82, 84, 8, 6.2, -4.1],
      [12, 95, 7, 7.3, -2.3], [89, 56, 7, 8.8, -6.4]
    ].forEach(values => add('glint', ...values));
    [
      [5, 15, 37, 13, -7, 9], [91, 25, 48, 17, -3, -7],
      [10, 43, 31, 15, -12, 12], [86, 58, 42, 16, -8, -11],
      [3, 79, 51, 18, -4, 8], [93, 88, 35, 14, -10, -6]
    ].forEach(values => add('bokeh', ...values));
    [
      [3, 0, 11, 22, -7, 9], [12, 0, 9, 27, -21, -11],
      [18, 0, 8, 29, -13, 8], [80, 0, 9, 25, -4, -9],
      [91, 0, 12, 24, -17, 11], [97, 0, 8, 28, -11, -10]
    ].forEach(values => add('petal', ...values));
    document.body.appendChild(overlay);

    function sync() {
      const gated = document.body.classList.contains('locked') ||
        (root.classList.contains('enhanced') && gate && !gate.hidden);
      const disabled = reducedMotion.matches || Boolean(connection && connection.saveData);
      overlay.hidden = Boolean(gated || disabled);
      overlay.dataset.paused = String(gated || disabled || document.hidden || root.dataset.videlMotionPaused === 'true');
    }
    const observer = new MutationObserver(sync);
    observer.observe(document.body, {attributes: true, attributeFilter: ['class']});
    observer.observe(root, {attributes: true, attributeFilter: ['class', 'data-videl-motion-paused']});
    if (gate) observer.observe(gate, {attributes: true, attributeFilter: ['hidden']});
    document.addEventListener('visibilitychange', sync);
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', sync);
    else if (reducedMotion.addListener) reducedMotion.addListener(sync);
    if (connection && connection.addEventListener) connection.addEventListener('change', sync);
    window.VidelRoyalMagic = Object.freeze({
      destroy() {
        observer.disconnect();
        document.removeEventListener('visibilitychange', sync);
        if (reducedMotion.removeEventListener) reducedMotion.removeEventListener('change', sync);
        else if (reducedMotion.removeListener) reducedMotion.removeListener(sync);
        if (connection && connection.removeEventListener) connection.removeEventListener('change', sync);
        overlay.remove();
        delete window.VidelRoyalMagic;
      }
    });
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();
