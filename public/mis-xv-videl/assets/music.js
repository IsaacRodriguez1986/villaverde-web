(() => {
  'use strict';

  const audio = document.getElementById('invitation-music');
  const buttons = Array.from(document.querySelectorAll('[data-music-toggle]'));
  const status = document.getElementById('music-status');
  if (!audio || !buttons.length) return;

  let wanted = false;
  let pending = false;
  let token = 0;
  let opened = false;
  let chosen = false;
  audio.volume = 0.55;

  function sync() {
    const playing = !audio.paused && !audio.ended;
    buttons.forEach(button => {
      const label = playing || pending ? 'Pausar música' : 'Reproducir música';
      button.setAttribute('aria-label', label);
      button.setAttribute('aria-pressed', String(playing));
      button.title = `${label} · Te Regalo, Carla Morrison`;
      button.classList.toggle('is-playing', playing);
      const text = button.querySelector('[data-music-label]');
      if (text) text.textContent = label;
    });
  }

  function showRetry() {
    if (!status) return;
    status.textContent = 'Para escuchar Te Regalo, toca el botón de música. También puedes abrir la canción en YouTube.';
    status.hidden = false;
  }

  async function play() {
    wanted = true;
    if (document.hidden) return;
    const attempt = ++token;
    pending = true;
    if (status) status.hidden = true;
    if (!audio.hasAttribute('src') || audio.error) {
      audio.src = audio.dataset.src;
      audio.load();
    }
    sync();
    try {
      // Called in the opening click, before waiting for the silent intro video.
      await audio.play();
      if (!wanted || document.hidden) audio.pause();
    } catch {
      if (attempt === token && wanted && !document.hidden) {
        wanted = false;
        showRetry();
      }
    } finally {
      if (attempt === token) pending = false;
      sync();
    }
  }

  function pause() {
    wanted = false;
    pending = false;
    token += 1;
    audio.pause();
    if (status) status.hidden = true;
    sync();
  }

  function openMusic() {
    if (opened) return;
    opened = true;
    if (!chosen) void play();
  }

  buttons.forEach(button => button.addEventListener('click', () => {
    chosen = true;
    if (!audio.paused || pending) pause();
    else void play();
  }));
  document.querySelectorAll('[data-music-start]').forEach(button => {
    button.addEventListener('click', openMusic, { capture: true });
  });
  document.addEventListener('keydown', event => {
    const gate = document.getElementById('cinema-gate') || document.getElementById('gate');
    if (event.key === 'Escape' && gate && !gate.hidden) openMusic();
  }, { capture: true });
  ['playing', 'pause', 'ended'].forEach(event => audio.addEventListener(event, sync));
  audio.addEventListener('error', () => {
    if (!wanted) return;
    wanted = false;
    pending = false;
    token += 1;
    showRetry();
    sync();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      token += 1;
      pending = false;
      audio.pause();
      sync();
    } else if (wanted) void play();
  });
  window.addEventListener('pagehide', () => {
    token += 1;
    pending = false;
    audio.pause();
    sync();
  });
  window.addEventListener('pageshow', () => {
    if (wanted && !document.hidden) void play();
  });
  sync();
})();
