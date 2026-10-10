(() => {
  'use strict';

  function init() {
    const root = document.documentElement;
    const gate = document.getElementById('gate');
    const invitation = document.getElementById('invitation');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const targets = Array.from(document.querySelectorAll(
      '#gate-title, #videl-name, .hero-subtitle, #invitation h2, h3.venue-name, .blessing strong, .closing .script'
    ));
    if (!targets.length) return;

    const records = targets.map((element) => {
      const ink = document.createElement('span');
      ink.className = 'videl-title-ink';
      // Move the existing nodes, keeping the text, heading, IDs and accessible name.
      while (element.firstChild) ink.appendChild(element.firstChild);
      element.appendChild(ink);
      return { element, ink, seen: false, active: false, observed: false, timer: 0 };
    });
    const gateRecord = records.find((record) => record.element.id === 'gate-title');
    const mainRecords = records.filter((record) => record !== gateRecord);
    const byElement = new Map(records.map((record) => [record.element, record]));
    let observer = null;

    function allowed() {
      return !motion.matches && !(connection && connection.saveData) && !document.hidden &&
        root.dataset.videlMotionPaused !== 'true';
    }

    function gated() {
      return document.body.classList.contains('locked') || (invitation && invitation.inert) ||
        (root.classList.contains('enhanced') && gate && !gate.hidden);
    }

    function finish(record) {
      window.clearTimeout(record.timer);
      record.timer = 0;
      record.active = false;
      record.element.classList.remove('videl-title-active');
    }

    function start(record) {
      if (!record || record.seen) return;
      record.seen = true;
      if (observer) observer.unobserve(record.element);
      record.observed = false;
      if (!allowed()) return;
      record.active = true;
      record.element.classList.add('videl-title-active');
      // CSS also ends in a complete, visible state if this cleanup never runs.
      record.timer = window.setTimeout(() => finish(record), 3800);
    }

    records.forEach((record) => {
      record.ink.addEventListener('animationend', (event) => {
        if (event.target === record.ink && event.animationName === 'videl-title-rose-light') finish(record);
      });
    });

    if ('IntersectionObserver' in window) {
      try {
        observer = new IntersectionObserver((entries) => {
          if (gated()) return;
          entries.forEach((entry) => {
            if (entry.isIntersecting) start(byElement.get(entry.target));
          });
        }, { threshold: .25, rootMargin: '0px 0px -6% 0px' });
      } catch (_) {
        // Content remains visible when the observer is unavailable.
      }
    }

    function sync() {
      const canMove = allowed();
      const isGated = gated();
      records.forEach((record) => {
        if (record.active && (!canMove || (record === gateRecord ? gate &&
          (gate.hidden || gate.classList.contains('intro-running')) : isGated))) finish(record);
      });

      if (gateRecord && gate && root.classList.contains('enhanced') && !gate.hidden &&
          !gate.classList.contains('intro-running')) start(gateRecord);

      if (isGated) return;
      mainRecords.forEach((record) => {
        if (record.seen || record.observed) return;
        if (!observer) {
          // With no observer there is no waiting state and no deferred entrance.
          record.seen = true;
          return;
        }
        record.observed = true;
        observer.observe(record.element);
      });
    }

    const changes = new MutationObserver(sync);
    changes.observe(root, { attributes: true, attributeFilter: ['data-videl-motion-paused', 'class'] });
    changes.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    if (gate) changes.observe(gate, { attributes: true, attributeFilter: ['hidden', 'class'] });
    if (invitation) changes.observe(invitation, { attributes: true, attributeFilter: ['inert'] });
    document.addEventListener('visibilitychange', sync);
    if (motion.addEventListener) motion.addEventListener('change', sync);
    else if (motion.addListener) motion.addListener(sync);
    if (connection && connection.addEventListener) connection.addEventListener('change', sync);
    window.addEventListener('pageshow', sync);
    sync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
