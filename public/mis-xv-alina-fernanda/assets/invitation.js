(() => {
  'use strict';
  const event = window.ALINA_EVENT;
  if (!event) return;
  const byId = id => document.getElementById(id);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const params = new URLSearchParams(location.search);
  const guestName = (params.get('para') || params.get('p') || '')
    .replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
  const rawPasses = params.get('pases') || params.get('n') || '';
  const passes = /^(?:[1-9]|1\d|20)$/.test(rawPasses) ? Number(rawPasses) : null;

  if (guestName) {
    byId('guest-name').textContent = `Para ${guestName}`;
    byId('guest-name').hidden = false;
    byId('rsvp-name').value = guestName;
  }
  if (passes) {
    byId('guest-passes').textContent = `${passes} ${passes === 1 ? 'lugar reservado para ti' : 'lugares reservados para ustedes'}`;
    byId('guest-passes').hidden = false;
    byId('rsvp-guests').max = String(passes);
    byId('rsvp-guests').value = String(passes);
  }

  const audio = byId('invitation-audio');
  const musicToggle = byId('music-toggle');
  const musicLabel = byId('music-toggle-label');
  const musicStatus = byId('music-status');
  // Accept local media paths only; a URL parameter can never override the song.
  const musicReady = typeof event.music?.src === 'string' && /^assets\/[\w./-]+$/.test(event.music.src);
  musicToggle.hidden = !musicReady;
  if (musicReady) {
    audio.src = event.music.src;
    audio.preload = 'metadata';
    audio.hidden = false;
    musicToggle.disabled = false;
    byId('music-title').textContent = event.music.title || 'La canción de este momento';
    musicStatus.textContent = 'Toca reproducir para acompañar este momento con música.';
  } else {
    audio.hidden = true;
    musicToggle.disabled = true;
    byId('music-title').textContent = 'La canción de este momento';
    musicStatus.textContent = 'Pronto compartiremos la música de esta celebración.';
  }
  function updateMusic() {
    const playing = !audio.paused && !audio.ended;
    musicToggle.setAttribute('aria-pressed', String(playing));
    musicToggle.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
    musicLabel.textContent = playing ? 'Pausar música' : 'Escuchar música';
  }
  async function playMusic() {
    if (!musicReady) return;
    try {
      await audio.play();
      musicStatus.textContent = 'Puedes pausar la música cuando quieras.';
    } catch {
      musicStatus.textContent = 'Toca reproducir para escuchar la canción.';
    }
    updateMusic();
  }
  musicToggle.addEventListener('click', () => {
    if (audio.paused) void playMusic();
    else audio.pause();
  });
  audio.addEventListener('play', updateMusic);
  audio.addEventListener('pause', updateMusic);
  audio.addEventListener('ended', updateMusic);
  audio.addEventListener('error', () => {
    musicStatus.textContent = 'La canción no pudo cargar. Puedes intentar reproducirla de nuevo.';
    updateMusic();
  });

  const gate = byId('envelope-gate');
  const trigger = byId('open-invitation');
  const content = byId('invitation-content');
  const introPoster = byId('intro-poster');
  const introVideo = byId('intro-video');
  const skipIntroButton = byId('skip-intro');
  const introStatus = byId('intro-status');
  const videoSource = introVideo?.dataset.src || '';
  const saveDataEnabled = () => Boolean(navigator.connection?.saveData);
  let opened = false;
  let invitationRevealed = false;
  let introFinishing = false;
  let posterReady = false;
  let introStartedAt = 0;
  let introLoadTimer = 0;
  let introStallTimer = 0;
  let introDeadlineTimer = 0;
  let introRevealTimer = 0;
  let musicPrime = null;
  let motionPaused = false;
  let entranceObserver;
  let floralObserver;
  let entrancesPrepared = false;
  const motionToggle = byId('motion-toggle');
  const motionLabel = byId('motion-toggle-label');
  const floralTargets = [...document.querySelectorAll('[data-floral-motion]')];
  const entranceTargets = [...document.querySelectorAll(
    '.reveal .eyebrow, .reveal h2, .reveal .section-intro, .person-name, .program h3, .closing-message, .closing-signature, [data-ornament-entry]',
  )];
  function showAllText() {
    entranceObserver?.disconnect();
    entranceTargets.forEach(el => el.classList.remove('waiting-entry'));
  }
  function prepareTextEntrances() {
    if (entrancesPrepared || motionPaused || reducedMotion.matches || !('IntersectionObserver' in window)) return;
    entrancesPrepared = true;
    entranceObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.remove('waiting-entry');
        entranceObserver.unobserve(entry.target);
      }
    }, { threshold: 0.12 });
    entranceTargets.forEach((el, i) => {
      el.style.setProperty('--text-delay', `${(i % 3) * 90}ms`);
      el.classList.add('text-motion', 'waiting-entry');
      entranceObserver.observe(el);
    });
  }
  function prepareFloralMotion() {
    if (floralObserver || !('IntersectionObserver' in window)) return;
    floralObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        entry.target.classList.toggle('is-in-view', entry.isIntersecting);
        if (entry.isIntersecting) entry.target.classList.add('has-entered');
      }
    }, { threshold: 0.05 });
    floralTargets.forEach(el => floralObserver.observe(el));
    document.body.classList.add('effects-ready');
  }
  function syncMotionControl() {
    if (!motionToggle) return;
    motionToggle.hidden = reducedMotion.matches;
    motionToggle.setAttribute('aria-pressed', String(motionPaused));
    const label = motionPaused ? 'Reanudar animación' : 'Pausar animación';
    motionToggle.setAttribute('aria-label', label);
    motionLabel.textContent = label;
    document.body.classList.toggle('motion-paused', motionPaused);
  }
  motionToggle?.addEventListener('click', () => {
    motionPaused = !motionPaused;
    if (motionPaused) {
      showAllText();
      floralTargets.forEach(el => el.classList.add('has-entered'));
    }
    syncMotionControl();
  });
  syncMotionControl();
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      showAllText();
      if (opened && !invitationRevealed) finishIntro({ immediate: true });
    }
    syncMotionControl();
  });
  function syncPageVisibility() {
    document.body.classList.toggle('page-hidden', document.hidden);
  }
  document.addEventListener('visibilitychange', syncPageVisibility);
  syncPageVisibility();

  const readingProgress = byId('reading-progress');
  let progressFrame = 0;
  function updateReadingProgress() {
    progressFrame = 0;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    if (readingProgress) readingProgress.style.transform = `scaleX(${progress})`;
  }
  function requestProgressUpdate() {
    if (!progressFrame) progressFrame = requestAnimationFrame(updateReadingProgress);
  }
  window.addEventListener('scroll', requestProgressUpdate, { passive: true });
  window.addEventListener('resize', requestProgressUpdate);
  window.addEventListener('load', requestProgressUpdate);
  function clearIntroTimers() {
    clearTimeout(introLoadTimer);
    clearTimeout(introStallTimer);
    clearTimeout(introDeadlineTimer);
    clearTimeout(introRevealTimer);
  }
  function stopIntroVideo() {
    if (!introVideo) return;
    introVideo.pause();
    if (introVideo.hasAttribute('src')) {
      introVideo.removeAttribute('src');
      introVideo.load();
    }
  }
  // Unlock this audio element from the original gesture, without audible music
  // during the film. A rejected unlock still leaves the regular player usable.
  function primeMusicForIntro() {
    if (!musicReady) return;
    const previousMuted = audio.muted;
    audio.muted = true;
    musicPrime = new Promise(resolve => {
      let settled = false;
      let timer;
      function settle() {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        audio.pause();
        try { audio.currentTime = 0; } catch { /* Media may not have a timeline yet. */ }
        audio.muted = previousMuted;
        resolve();
      }
      timer = setTimeout(settle, 1200);
      try { Promise.resolve(audio.play()).then(settle, settle); } catch { settle(); }
    });
  }
  function revealInvitation() {
    clearIntroTimers();
    gate.hidden = true;
    content.inert = false;
    document.body.classList.remove('gate-locked');
    stopIntroVideo();
    if (invitationRevealed) return;
    invitationRevealed = true;
    document.body.classList.add('invitation-open');
    introStatus.hidden = true;
    skipIntroButton.hidden = true;
    byId('name').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
    prepareTextEntrances();
    prepareFloralMotion();
    requestProgressUpdate();
    if (!document.hidden) {
      if (musicPrime) void musicPrime.then(() => { if (!document.hidden) void playMusic(); });
      else void playMusic();
    }
  }
  function finishIntro({ immediate = false, fallback = false } = {}) {
    if (invitationRevealed || (introFinishing && !immediate)) return;
    introFinishing = true;
    clearIntroTimers();
    if (immediate || reducedMotion.matches || saveDataEnabled()) {
      revealInvitation();
      return;
    }
    const timeLeft = Math.max(0, 9800 - (performance.now() - introStartedAt));
    if (fallback) {
      stopIntroVideo();
      gate.classList.remove('has-cinematic-poster', 'intro-running', 'intro-loading', 'intro-playing');
      gate.classList.add('is-opening');
      introStatus.hidden = true;
      introRevealTimer = setTimeout(revealInvitation, Math.min(1100, timeLeft));
    } else {
      gate.classList.add('is-film-ending');
      introRevealTimer = setTimeout(revealInvitation, Math.min(350, timeLeft));
    }
  }
  function skipIntro() {
    opened = true;
    finishIntro({ immediate: true });
  }
  function markPosterReady() {
    posterReady = introPoster.naturalWidth > 0;
    if (posterReady && !opened) gate.classList.add('has-cinematic-poster');
  }
  function openInvitation() {
    if (opened) return;
    opened = true;
    introStartedAt = performance.now();
    trigger.setAttribute('aria-disabled', 'true');
    trigger.disabled = true;
    if (reducedMotion.matches || saveDataEnabled()) {
      finishIntro({ immediate: true });
      return;
    }
    primeMusicForIntro();
    skipIntroButton.hidden = false;
    skipIntroButton.focus({ preventScroll: true });
    introDeadlineTimer = setTimeout(() => finishIntro({ immediate: true }), 9800);
    if (!posterReady || !introVideo || !/^assets\/[\w./-]+\.mp4$/.test(videoSource)) {
      finishIntro({ fallback: true });
      return;
    }
    gate.classList.add('intro-running', 'intro-loading');
    introStatus.textContent = 'Preparando un momento especial…';
    introStatus.hidden = false;
    introVideo.muted = true;
    introVideo.defaultMuted = true;
    introVideo.playsInline = true;
    // No video src or preload is set until this explicit guest gesture.
    introVideo.src = videoSource;
    introLoadTimer = setTimeout(() => finishIntro({ fallback: true }), 3500);
    try {
      Promise.resolve(introVideo.play()).catch(() => finishIntro({ fallback: true }));
    } catch {
      finishIntro({ fallback: true });
    }
  }
  introPoster?.addEventListener('load', markPosterReady);
  introPoster?.addEventListener('error', () => {
    posterReady = false;
    gate.classList.remove('has-cinematic-poster');
    if (opened && !invitationRevealed) finishIntro({ fallback: true });
  });
  if (introPoster?.complete) markPosterReady();
  introVideo?.addEventListener('playing', () => {
    if (introFinishing || invitationRevealed) return;
    clearTimeout(introLoadTimer);
    clearTimeout(introStallTimer);
    gate.classList.remove('intro-loading');
    gate.classList.add('intro-playing');
    introStatus.hidden = true;
  });
  function onIntroStall() {
    if (!opened || introFinishing || !gate.classList.contains('intro-playing')) return;
    clearTimeout(introStallTimer);
    introStatus.textContent = 'Enseguida abrimos la invitación…';
    introStatus.hidden = false;
    introStallTimer = setTimeout(() => finishIntro({ fallback: true }), 2500);
  }
  introVideo?.addEventListener('waiting', onIntroStall);
  introVideo?.addEventListener('stalled', onIntroStall);
  introVideo?.addEventListener('ended', () => finishIntro());
  introVideo?.addEventListener('error', () => { if (opened) finishIntro({ fallback: true }); });
  navigator.connection?.addEventListener?.('change', () => {
    if (saveDataEnabled() && opened && !invitationRevealed) finishIntro({ immediate: true });
  });
  skipIntroButton.addEventListener('click', skipIntro);
  gate.hidden = false;
  content.inert = true;
  document.body.classList.add('gate-locked');
  trigger.focus({ preventScroll: true });
  trigger.addEventListener('click', openInvitation);
  gate.addEventListener('pointerdown', () => gate.classList.remove('keyboard-navigation'));
  gate.addEventListener('keydown', e => {
    gate.classList.add('keyboard-navigation');
    if (e.key === 'Escape') { e.preventDefault(); skipIntro(); }
    if (e.key === 'Tab') {
      const controls = [...gate.querySelectorAll('button')].filter(el => !el.disabled && !el.hidden && el.getClientRects().length);
      if (!controls.length) { e.preventDefault(); return; }
      const first = controls[0];
      const last = controls[controls.length - 1];
      const active = document.activeElement;
      if ((e.shiftKey && (active === first || !controls.includes(active))) || (!e.shiftKey && (active === last || !controls.includes(active)))) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    }
  });
  // Avoid leaving a restored browser history entry under an inert overlay.
  window.addEventListener('pageshow', e => { if (e.persisted && opened) revealInvitation(); });

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const hash = link.getAttribute('href');
      const target = byId(hash.slice(1));
      if (!target) return;
      e.preventDefault();
      history.replaceState(null, '', location.pathname + location.search + hash);
      if (link.classList.contains('skip-link')) target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    });
  });

  const targetDate = new Date(event.ceremonyDate).getTime();
  function updateCountdown() {
    const remaining = Math.max(0, Math.floor((targetDate - Date.now()) / 1000));
    const values = {
      days: Math.floor(remaining / 86400), hours: Math.floor((remaining % 86400) / 3600),
      minutes: Math.floor((remaining % 3600) / 60), seconds: remaining % 60,
    };
    for (const [unit, value] of Object.entries(values)) {
      document.querySelector(`[data-countdown="${unit}"]`).textContent = String(value).padStart(2, '0');
    }
    if (!remaining) byId('countdown-message').textContent = '¡La celebración ha comenzado!';
  }
  updateCountdown();
  setInterval(() => { if (!document.hidden) updateCountdown(); }, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateCountdown(); });

  byId('reception-name').textContent = event.reception.name;
  byId('reception-address').textContent = event.reception.address;
  const receptionMap = byId('reception-map');
  receptionMap.href = event.reception.map;
  receptionMap.hidden = false;
  byId('venue-gallery').hidden = false;

  // All-day reminder avoids inventing an end time for the actual celebration.
  const calendar = new URL('https://calendar.google.com/calendar/render');
  const calendarFields = {
    action: 'TEMPLATE', text: `Mis XV años · ${event.name}`,
    dates: '20261128/20261129', ctz: 'America/Mexico_City',
    location: `San José Obrero, Col. Jiménez Cantú, Ixtapaluca; ${event.reception.name}, ${event.reception.address}`,
    details: `Sábado 28 de noviembre de 2026 (hora de Ciudad de México).\nMisa: 3:45 p. m., San José Obrero, C. San José Obrero S/N, Col. Jiménez Cantú, Ixtapaluca.\nRecepción: 6:00 p. m., ${event.reception.name}.\nVestimenta: elegante sport. Azul cielo reservado para la quinceañera.\n${event.invitationURL}`,
  };
  Object.entries(calendarFields).forEach(([key, value]) => calendar.searchParams.set(key, value));
  byId('calendar-google').href = calendar.href;
  byId('calendar-google').hidden = false;

  const form = byId('rsvp-form');
  const guests = byId('rsvp-guests');
  const rsvpStatus = byId('rsvp-status');
  const rsvpReady = typeof event.rsvpPhone === 'string' && /^52\d{10}$/.test(event.rsvpPhone);
  byId('rsvp-submit').disabled = !rsvpReady;
  if (rsvpReady) rsvpStatus.textContent = 'Tu confirmación se enviará desde tu WhatsApp.';
  function updateAttendance() {
    const attending = form.querySelector('input[name="attendance"]:checked')?.value !== 'no';
    byId('rsvp-guests-field').hidden = !attending;
    guests.disabled = !attending;
    guests.required = attending;
  }
  form.querySelectorAll('input[name="attendance"]').forEach(input => input.addEventListener('change', updateAttendance));
  updateAttendance();
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!rsvpReady) return;
    const nameInput = byId('rsvp-name');
    const name = nameInput.value.trim();
    nameInput.setCustomValidity(name ? '' : 'Escribe tu nombre o el de tu familia.');
    if (!form.reportValidity()) return;
    const attending = form.querySelector('input[name="attendance"]:checked')?.value === 'yes';
    const count = Number(guests.value);
    if (attending && (!Number.isInteger(count) || count < 1 || count > (passes || 20))) return;
    const message = byId('rsvp-message').value.trim();
    const reply = attending
      ? `¡Hola! Soy ${name}. Confirmo mi asistencia a los XV años de Alina Fernanda el 28 de noviembre de 2026. Asistimos ${count} ${count === 1 ? 'persona' : 'personas'}.`
      : `¡Hola! Soy ${name}. Lamento no poder acompañarlos en los XV años de Alina Fernanda el 28 de noviembre de 2026. ¡Muchas felicidades!`;
    const url = `https://wa.me/${event.rsvpPhone}?text=${encodeURIComponent(reply + (message ? `\n\n${message}` : ''))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    const fallback = document.createElement('a');
    fallback.href = url;
    fallback.target = '_blank';
    fallback.rel = 'noopener noreferrer';
    fallback.textContent = 'Abrir WhatsApp';
    rsvpStatus.replaceChildren('Envía el mensaje en WhatsApp para completar tu confirmación. ', fallback);
  });
  byId('rsvp-name').addEventListener('input', e => e.target.setCustomValidity(''));
})();
