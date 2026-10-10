(() => {
  'use strict';
  const section = document.getElementById('retrato-videl');
  const video = document.getElementById('portrait-video');
  const button = document.getElementById('portrait-toggle');
  if (!section || !video || !button) return;
  const frame = video.closest('.portrait-film');
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let visible = false;
  let userPaused = false;
  let failed = false;

  function allowed() {
    return visible && !document.hidden && !userPaused && !failed &&
      !document.body.classList.contains('locked') && !reduced.matches &&
      !(connection && connection.saveData) && root.dataset.videlMotionPaused !== 'true';
  }

  function updateControl() {
    button.hidden = failed || reduced.matches || Boolean(connection && connection.saveData);
    const playing = !video.paused;
    button.textContent = playing ? 'Pausar video' : 'Reproducir video';
    button.setAttribute('aria-pressed', String(playing));
  }

  function sync() {
    if (!allowed()) {
      video.pause();
      updateControl();
      return;
    }
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    if (video.paused) {
      const playback = video.play();
      if (playback && playback.catch) playback.catch(() => {
        userPaused = true;
        updateControl();
      });
    }
    updateControl();
  }

  video.addEventListener('playing', () => {
    frame.classList.add('is-playing-video');
    updateControl();
  });
  video.addEventListener('pause', updateControl);
  video.addEventListener('error', () => {
    failed = true;
    frame.classList.remove('is-playing-video');
    updateControl();
  });
  button.addEventListener('click', () => {
    userPaused = !video.paused;
    sync();
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      sync();
    }, {threshold: .1});
    observer.observe(frame);
  } else {
    // The image is visible by default; playback remains an explicit choice.
    visible = true;
    userPaused = true;
  }
  const changes = new MutationObserver(sync);
  changes.observe(root, {attributes: true, attributeFilter: ['data-videl-motion-paused']});
  changes.observe(document.body, {attributes: true, attributeFilter: ['class']});
  document.addEventListener('visibilitychange', sync);
  if (reduced.addEventListener) reduced.addEventListener('change', sync);
  if (connection && connection.addEventListener) connection.addEventListener('change', sync);
  sync();
})();
