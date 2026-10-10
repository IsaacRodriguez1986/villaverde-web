(() => {
  'use strict';
  function init() {
    if (window.VidelTitles) return;
    const root = document.documentElement;
    const gate = document.getElementById('gate');
    const invitation = document.getElementById('invitation');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const targets = Array.from(document.querySelectorAll('#videl-name, .hero-subtitle, #invitation h2, h3.venue-name, .blessing strong, .closing .script'));
    if (!targets.length) return;
    const svgNS = 'http://www.w3.org/2000/svg';
    const records = targets.map(element => {
      const ink = document.createElement('span');
      ink.className = 'videl-title-ink';
      while (element.firstChild) ink.appendChild(element.firstChild);
      const text = ink.textContent;
      const walker = document.createTreeWalker(ink, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);
      let words = 0;
      textNodes.forEach(node => {
        const fragment = document.createDocumentFragment();
        (node.textContent.match(/\S+|\s+/gu) || []).forEach(token => {
          if (/^\s+$/u.test(token)) { fragment.appendChild(document.createTextNode(token)); return; }
          const word = document.createElement('span');
          word.className = 'videl-title-word';
          word.textContent = token;
          const count = Array.from(token).length;
          word.style.cssText = '--title-word-delay:' + words * 125 + 'ms;--title-word-duration:' + Math.min(1450, 800 + count * 55) + 'ms';
          fragment.appendChild(word);
          words += 1;
        });
        node.replaceWith(fragment);
      });
      const complete = Math.min(1450, 800 + Math.max(...text.split(/\s+/u).map(word => Array.from(word).length)) * 55) + Math.max(0, words - 1) * 125;
      element.style.setProperty('--title-complete', complete + 'ms');
      const sheen = document.createElement('span');
      sheen.className = 'videl-title-sheen';
      sheen.setAttribute('aria-hidden', 'true');
      sheen.textContent = text;
      const butterfly = document.createElement('span');
      butterfly.className = 'videl-title-butterfly';
      butterfly.setAttribute('aria-hidden', 'true');
      const butterflySvg = document.createElementNS(svgNS, 'svg');
      butterflySvg.setAttribute('viewBox', '0 0 80 65');
      const use = document.createElementNS(svgNS, 'use');
      use.setAttribute('href', '#butterfly');
      butterflySvg.appendChild(use);
      butterfly.appendChild(butterflySvg);
      const stars = document.createElement('span');
      stars.className = 'videl-title-stars';
      stars.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < 5; i += 1) stars.appendChild(document.createElement('i'));
      ink.append(sheen, butterfly, stars);
      element.appendChild(ink);
      return {element, ink, text, complete, seen: false, active: false, observed: false, timer: 0, signature: null, signatureState: element.id === 'videl-name' ? 'waiting' : 'none'};
    });
    const hero = records.find(record => record.element.id === 'videl-name');
    const byElement = new Map(records.map(record => [record.element, record]));
    let observer = null;
    let fetchingSignature = false;
    function disabled() { return motion.matches || Boolean(connection && connection.saveData); }
    function allowed() { return !disabled() && !document.hidden && root.dataset.videlMotionPaused !== 'true'; }
    function gated() { return document.body.classList.contains('locked') || Boolean(invitation && invitation.inert) || Boolean(root.classList.contains('enhanced') && gate && !gate.hidden); }
    function inView(record) {
      const rect = record.element.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight * .94 && rect.width > 0 && rect.height > 0;
    }
    function finish(record) {
      window.clearTimeout(record.timer);
      record.timer = 0;
      record.active = false;
      record.element.classList.remove('videl-title-active');
    }
    function start(record) {
      if (!record || record.seen || !allowed() || gated()) return;
      if (record === hero && record.signatureState === 'waiting') return;
      record.seen = true;
      if (observer) observer.unobserve(record.element);
      record.observed = false;
      // A failed vector or unsupported font metrics leave the entire real name visible.
      if (record === hero && record.signatureState === 'fallback') return;
      record.active = true;
      record.element.classList.add('videl-title-active');
      record.timer = window.setTimeout(() => finish(record), record.complete + 1700);
    }
    function createPenlight(path, delay, duration) {
      const d = path.getAttribute('d');
      if (!d || !/^[MmLlHhVvCcSsQqTtAaZz\d\s.,+\-eE]+$/u.test(d)) return null;
      const point = document.createElementNS(svgNS, 'g');
      point.setAttribute('class', 'videl-signature-penlight');
      point.style.cssText = "offset-path:path('" + d + "');--draw-delay:" + delay + 'ms;--draw-duration:' + duration + 'ms';
      const halo = document.createElementNS(svgNS, 'circle');
      halo.setAttribute('r', '13');
      halo.setAttribute('fill', '#fff9ed');
      halo.setAttribute('opacity', '.2');
      const sparkle = document.createElementNS(svgNS, 'path');
      sparkle.setAttribute('d', 'M0-12 3-3 12 0 3 3 0 12-3 3-12 0-3-3Z');
      sparkle.setAttribute('fill', '#fff');
      sparkle.setAttribute('stroke', '#c4aec2');
      sparkle.setAttribute('stroke-width', '.7');
      point.append(halo, sparkle);
      return point;
    }
    function placeSignature() {
      if (!hero || !hero.signature || !document.fonts || !document.fonts.check('16px VidelScript')) return false;
      const style = getComputedStyle(hero.ink);
      const size = parseFloat(style.fontSize);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context || !Number.isFinite(size)) return false;
      context.font = style.fontStyle + ' ' + style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily;
      if ('letterSpacing' in context) context.letterSpacing = style.letterSpacing;
      const metrics = context.measureText(hero.text);
      const box = hero.signature.querySelector('#videl-signature-ink').getBBox();
      const rect = hero.ink.getBoundingClientRect();
      const ascent = metrics.actualBoundingBoxAscent;
      const descent = metrics.actualBoundingBoxDescent;
      const left = metrics.actualBoundingBoxLeft;
      const right = metrics.actualBoundingBoxRight;
      const fontAscent = metrics.fontBoundingBoxAscent;
      const fontDescent = metrics.fontBoundingBoxDescent;
      if (![ascent, descent, left, right, fontAscent, fontDescent, box.width, box.height].every(Number.isFinite) || box.width <= 0 || box.height <= 0) return false;
      const scaleX = (left + right) / box.width;
      const scaleY = (ascent + descent) / box.height;
      const view = hero.signature.viewBox.baseVal;
      const baseline = (rect.height - fontAscent - fontDescent) / 2 + fontAscent;
      hero.signature.style.width = view.width * scaleX + 'px';
      hero.signature.style.height = view.height * scaleY + 'px';
      hero.signature.style.left = -left - box.x * scaleX + 'px';
      hero.signature.style.top = baseline - ascent - box.y * scaleY + 'px';
      hero.signature.setAttribute('preserveAspectRatio', 'none');
      hero.element.classList.add('videl-signature-ready');
      return true;
    }
    async function requestSignature() {
      if (!hero || fetchingSignature || hero.signatureState !== 'waiting' || disabled() || document.hidden) return;
      fetchingSignature = true;
      try {
        const response = await fetch('/mis-xv-videl/assets/videl-signature.svg', {credentials: 'same-origin', cache: 'force-cache'});
        if (!response.ok) throw new Error('Signature unavailable');
        const source = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
        const svg = source.documentElement;
        if (svg.localName !== 'svg' || source.querySelector('parsererror') || !svg.querySelector('#videl-signature-ink') || !svg.querySelector('.videl-signature-stroke')) throw new Error('Signature incomplete');
        const permitted = new Set(['svg', 'g', 'defs', 'mask', 'clipPath', 'use', 'path', 'linearGradient', 'radialGradient', 'stop', 'rect', 'circle', 'ellipse']);
        Array.from(svg.querySelectorAll('*')).forEach(node => {
          if (!permitted.has(node.localName)) { node.remove(); return; }
          Array.from(node.attributes).forEach(attribute => {
            if (/^on/iu.test(attribute.name) || attribute.name === 'style' || (/href$/iu.test(attribute.name) && !attribute.value.startsWith('#'))) node.removeAttribute(attribute.name);
          });
        });
        Array.from(svg.attributes).forEach(attribute => { if (/^on/iu.test(attribute.name) || attribute.name === 'style') svg.removeAttribute(attribute.name); });
        svg.classList.add('videl-signature-svg');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        hero.signature = document.importNode(svg, true);
        hero.ink.appendChild(hero.signature);
        const strokes = Array.from(hero.signature.querySelectorAll('.videl-signature-stroke'));
        hero.signature.querySelectorAll('mask').forEach(mask => { mask.style.maskType = 'luminance'; });
        const lengths = strokes.map(path => path.getTotalLength());
        const weights = strokes.map((path, index) => Number(path.dataset.duration) || lengths[index]);
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        if (!Number.isFinite(totalWeight) || totalWeight <= 0) throw new Error('Signature has no strokes');
        let delay = 0;
        strokes.forEach((path, index) => {
          const duration = weights[index] / totalWeight * 3800;
          path.removeAttribute('pathLength');
          // A <use> shadow tree does not inherit the referenced path's defs parent.
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke', '#fff');
          path.setAttribute('stroke-linecap', 'round');
          path.setAttribute('stroke-linejoin', 'round');
          path.style.setProperty('--signature-length', String(lengths[index]));
          path.style.setProperty('--draw-delay', delay + 'ms');
          path.style.setProperty('--draw-duration', duration + 'ms');
          const point = createPenlight(path, delay, duration);
          if (point) hero.signature.appendChild(point);
          delay += duration;
        });
        // Animate actual paths in masks: Chromium does not reliably repaint CSS
        // animations inside a <use> shadow tree when their source lives in defs.
        hero.signature.querySelectorAll('mask use').forEach(use => {
          const reference = use.getAttribute('href');
          const sourcePath = strokes.find(path => '#' + path.id === reference);
          if (!sourcePath) throw new Error('Signature mask has no matching stroke');
          const livePath = sourcePath.cloneNode(true);
          livePath.removeAttribute('id');
          use.replaceWith(livePath);
        });
        strokes.forEach(path => {
          path.classList.remove('videl-signature-stroke');
          path.classList.add('videl-signature-pen-guide');
        });
        hero.complete = 3800;
        hero.element.style.setProperty('--title-complete', '3800ms');
        const silver = hero.signature.querySelector('#videl-signature-ink').cloneNode(true);
        silver.removeAttribute('id');
        silver.removeAttribute('mask');
        silver.classList.add('videl-signature-sheen');
        silver.setAttribute('fill', '#eeeef5');
        silver.setAttribute('stroke', '#d3c1d2');
        silver.setAttribute('stroke-width', '.7');
        silver.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
        silver.querySelectorAll('[fill]').forEach(node => node.setAttribute('fill', '#eeeef5'));
        hero.signature.appendChild(silver);
        if (document.fonts) await document.fonts.ready;
        if (!placeSignature()) { hero.signature.remove(); hero.signature = null; }
        hero.signatureState = hero.signature ? 'ready' : 'fallback';
      } catch (_) {
        if (hero.signature) hero.signature.remove();
        hero.signature = null;
        hero.signatureState = 'fallback';
        hero.element.classList.remove('videl-signature-ready');
      }
      sync();
    }
    if ('IntersectionObserver' in window) {
      try {
        observer = new IntersectionObserver(entries => {
          if (gated() || !allowed()) return;
          entries.forEach(entry => { if (entry.isIntersecting) start(byElement.get(entry.target)); });
        }, {threshold: .25, rootMargin: '0px 0px -6% 0px'});
      } catch (_) { /* Complete, unanimated text remains readable. */ }
    }
    function sync() {
      const canMove = allowed();
      const isGated = gated();
      records.forEach(record => { if (record.active && (!canMove || isGated)) finish(record); });
      if (!disabled() && !document.hidden) requestSignature();
      if (isGated || !canMove) return;
      records.forEach(record => {
        if (record.seen) return;
        if (observer && !record.observed) { record.observed = true; observer.observe(record.element); }
        if (observer && inView(record)) start(record);
      });
    }
    const changes = new MutationObserver(sync);
    changes.observe(root, {attributes: true, attributeFilter: ['data-videl-motion-paused', 'class']});
    changes.observe(document.body, {attributes: true, attributeFilter: ['class']});
    if (gate) changes.observe(gate, {attributes: true, attributeFilter: ['hidden', 'class']});
    if (invitation) changes.observe(invitation, {attributes: true, attributeFilter: ['inert']});
    document.addEventListener('visibilitychange', sync);
    if (motion.addEventListener) motion.addEventListener('change', sync);
    else if (motion.addListener) motion.addListener(sync);
    if (connection && connection.addEventListener) connection.addEventListener('change', sync);
    window.addEventListener('pageshow', sync);
    const resize = typeof ResizeObserver === 'function' && hero ? new ResizeObserver(() => { if (hero.signature) placeSignature(); }) : null;
    if (resize) resize.observe(hero.ink);
    window.VidelTitles = Object.freeze({
      finish() { records.forEach(finish); },
      destroy() {
        changes.disconnect();
        if (observer) observer.disconnect();
        if (resize) resize.disconnect();
        document.removeEventListener('visibilitychange', sync);
        window.removeEventListener('pageshow', sync);
        if (motion.removeEventListener) motion.removeEventListener('change', sync);
        else if (motion.removeListener) motion.removeListener(sync);
        if (connection && connection.removeEventListener) connection.removeEventListener('change', sync);
        records.forEach(finish);
        delete window.VidelTitles;
      }
    });
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();
