(() => {
  'use strict';

  const app = document.getElementById('cinema-app');
  const gate = document.getElementById('cinema-gate');
  const stage = document.getElementById('cinema-stage');
  const scenes = Array.from(document.querySelectorAll('.scene'));
  const next = document.getElementById('next-chapter');
  const previous = document.getElementById('previous-chapter');
  const screenNext = document.getElementById('screen-next');
  const playbackControls = document.getElementById('playback-controls');
  const playbackStatus = document.getElementById('playback-status');
  const pauseButton = document.getElementById('pause-video');
  const replayButton = document.getElementById('replay-video');
  const progress = document.getElementById('chapter-progress');
  const label = document.getElementById('chapter-label');
  const counter = document.getElementById('chapter-counter');
  const announcement = document.getElementById('chapter-announcement');
  const menuToggle = document.getElementById('options-toggle');
  const menu = document.getElementById('options-menu');
  const motionToggle = document.getElementById('motion-toggle');
  const introVideo = document.getElementById('intro-video');
  const openButton = document.getElementById('open-invitation');
  const envelopeButton = document.getElementById('envelope-open');
  const skipButton = document.getElementById('skip-intro');
  const introStatus = document.getElementById('intro-status');
  if (!app || !gate || !stage || !scenes.length || !next || !previous || !introVideo) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  let preferStatic = false;
  let current = 0;
  let entered = false;
  let transitionToken = 0;
  let introState = 'closed';
  let startTimer = 0;
  let endTimer = 0;
  let introFinishTimer = 0;
  let playbackTimer = 0;
  let pausedForVisibility = null;
  let resumeWhenVisible = false;
  let pageSnapshot = null;
  const staticMode = () => preferStatic || reducedMotion.matches || Boolean(connection && connection.saveData);
  const activeScene = () => scenes[current];
  const activeVideo = () => activeScene().querySelector('.scene-video');

  scenes.forEach((scene, index) => {
    const item = document.createElement('li');
    item.setAttribute('aria-label', `Capítulo ${index + 1}: ${scene.dataset.title}`);
    progress.appendChild(item);
    const video = scene.querySelector('.scene-video');
    if (!video) return;
    video.addEventListener('playing', () => {
      if (scene !== activeScene() || !entered || staticMode()) {
        video.pause();
        return;
      }
      clearTimeout(playbackTimer);
      scene.classList.remove('is-paused', 'is-ended', 'is-fallback');
      scene.classList.add('is-playing');
      playbackStatus.hidden = true;
      setPauseState(false);
    });
    video.addEventListener('pause', () => {
      if (scene !== activeScene() || video.ended || staticMode()) return;
      scene.classList.remove('is-playing');
      scene.classList.add('is-paused');
      setPauseState(true);
    });
    video.addEventListener('ended', () => {
      if (scene !== activeScene()) return;
      scene.classList.remove('is-playing', 'is-paused');
      scene.classList.add('is-ended');
      setPauseState(true);
      playbackStatus.hidden = true;
    });
    video.addEventListener('error', () => {
      if (scene === activeScene() && entered && !staticMode()) showFallback(scene);
    });
    const still = scene.querySelector('.scene-still');
    still.addEventListener('error', () => {
      scene.dataset.posterError = 'true';
      if (scene === activeScene() && (staticMode() || !scene.classList.contains('is-playing'))) showFallback(scene);
    });
  });

  function setPauseState(isPaused) {
    pauseButton.setAttribute('aria-label', isPaused ? 'Reproducir video' : 'Pausar video');
    pauseButton.innerHTML = `<span aria-hidden="true">${isPaused ? '▶' : 'Ⅱ'}</span>`;
  }

  function releaseVideo(video) {
    if (!video || !video.hasAttribute('src')) return;
    video.pause();
    video.removeAttribute('src');
    video.preload = 'none';
    video.load();
    video.closest('.scene')?.classList.remove('is-playing', 'is-ended', 'is-paused');
  }

  function showFallback(scene) {
    clearTimeout(playbackTimer);
    const video = scene.querySelector('.scene-video');
    if (video) video.pause();
    scene.classList.remove('is-playing', 'is-paused', 'is-ended');
    scene.classList.add('is-fallback');
    playbackControls.hidden = true;
    playbackStatus.hidden = true;
  }

  function ensureSource(video, preload) {
    if (!video) return;
    video.preload = preload;
    if (!video.hasAttribute('src')) {
      video.src = video.dataset.src;
      video.load();
    }
  }

  function prepareNext() {
    const wanted = scenes[current + 1]?.querySelector('.scene-video');
    scenes.forEach((scene, index) => {
      const video = scene.querySelector('.scene-video');
      if (index !== current && video !== wanted) releaseVideo(video);
    });
    if (!staticMode() && wanted) ensureSource(wanted, 'metadata');
  }

  async function playCurrent() {
    const scene = activeScene();
    const video = activeVideo();
    const token = transitionToken;
    if (!video || !entered || !gate.hidden || staticMode()) return;
    if (document.hidden) {
      resumeWhenVisible = true;
      return;
    }
    playbackControls.hidden = false;
    scene.classList.remove('is-fallback', 'is-ended', 'is-paused', 'is-playing');
    playbackStatus.hidden = true;
    ensureSource(video, 'auto');
    setPauseState(false);
    clearTimeout(playbackTimer);
    playbackTimer = window.setTimeout(() => {
      if (token === transitionToken && scene === activeScene() && !scene.classList.contains('is-playing')) showFallback(scene);
    }, 12000);
    try {
      await video.play();
      if (token !== transitionToken || staticMode() || scene !== activeScene()) video.pause();
    } catch {
      if (token === transitionToken && scene === activeScene()) showFallback(scene);
    }
  }

  function updateMotionPreference() {
    document.documentElement.classList.toggle('is-static', staticMode());
    motionToggle.setAttribute('aria-pressed', String(staticMode()));
    motionToggle.textContent = staticMode() ? 'Activar los videos' : 'Ver sin animación';
    // The system preference remains authoritative; the control explains it without overriding it.
    if (reducedMotion.matches || Boolean(connection && connection.saveData)) {
      motionToggle.textContent = 'Animación desactivada en tu dispositivo';
      motionToggle.disabled = true;
    } else {
      motionToggle.disabled = false;
      motionToggle.textContent = preferStatic ? 'Activar los videos' : 'Ver sin animación';
    }
    if (!entered && introState === 'opening' && staticMode()) finishIntro();
    if (!entered) return;
    transitionToken += 1;
    clearTimeout(playbackTimer);
    scenes.forEach(scene => releaseVideo(scene.querySelector('.scene-video')));
    playbackControls.hidden = staticMode() || !activeVideo();
    const scene = activeScene();
    if (scene.dataset.posterError === 'true') showFallback(scene);
    else scene.classList.remove('is-fallback');
    if (!staticMode() && activeVideo()) playCurrent();
    prepareNext();
  }

  function goTo(index, moveFocus = true) {
    if (!entered || index < 0 || index >= scenes.length) return;
    transitionToken += 1;
    clearTimeout(playbackTimer);
    pausedForVisibility = null;
    const oldVideo = activeVideo();
    if (oldVideo) oldVideo.pause();
    current = index;
    scenes.forEach((scene, sceneIndex) => {
      scene.hidden = sceneIndex !== current;
      scene.classList.remove('is-playing', 'is-ended', 'is-paused');
    });
    const scene = activeScene();
    const isVideo = Boolean(activeVideo());
    label.textContent = scene.dataset.title;
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${scenes.length}`;
    announcement.textContent = `Capítulo ${current + 1} de ${scenes.length}: ${scene.dataset.title}`;
    Array.from(progress.children).forEach((item, progressIndex) => {
      item.classList.toggle('is-complete', progressIndex < current);
      if (progressIndex === current) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    previous.disabled = current === 0;
    next.innerHTML = current === scenes.length - 1 ? 'Volver al inicio <span aria-hidden="true">↻</span>' : 'Siguiente <span aria-hidden="true">→</span>';
    screenNext.hidden = !isVideo || current === scenes.length - 1;
    // Keep tap and chapter links in the same stacking context during the entrance.
    if (isVideo) scene.appendChild(screenNext);
    screenNext.setAttribute('aria-label', `Ir al capítulo siguiente: ${scenes[current + 1]?.dataset.title || 'inicio'}`);
    document.getElementById('tap-hint').textContent = isVideo ? (current === scenes.length - 1 ? 'Una noche para recordar' : 'Toca la invitación para continuar') : 'Continúa cuando quieras con Siguiente';
    playbackControls.hidden = !isVideo || staticMode();
    playbackStatus.hidden = true;
    scene.classList.toggle('is-fallback', scene.dataset.posterError === 'true');
    if (oldVideo && oldVideo !== activeVideo()) releaseVideo(oldVideo);
    if (isVideo && !staticMode()) playCurrent();
    prepareNext();
    if (moveFocus) scene.querySelector('h2')?.focus({ preventScroll: true });
    if (scene.id === 'chapter-09') onTriviaChapterEnter();
  }

  function clearIntroTimers() {
    clearTimeout(startTimer);
    clearTimeout(endTimer);
    clearTimeout(introFinishTimer);
  }

  function finishIntro() {
    if (introState === 'revealed') return;
    introState = 'revealed';
    clearIntroTimers();
    introVideo.pause();
    introVideo.removeAttribute('src');
    introVideo.load();
    gate.hidden = true;
    app.inert = false;
    entered = true;
    goTo(0);
  }

  function beginReveal() {
    if (introState === 'revealed' || introState === 'leaving') return;
    introState = 'leaving';
    clearIntroTimers();
    gate.classList.add('is-leaving');
    if (staticMode()) finishIntro();
    else introFinishTimer = window.setTimeout(finishIntro, 310);
  }

  async function openInvitation() {
    if (introState !== 'closed') return;
    introState = 'opening';
    openButton.disabled = true;
    envelopeButton.disabled = true;
    gate.classList.add('is-running');
    skipButton.hidden = false;
    skipButton.focus({ preventScroll: true });
    if (staticMode()) {
      finishIntro();
      return;
    }
    introVideo.src = introVideo.dataset.src;
    introVideo.load();
    startTimer = window.setTimeout(beginReveal, 3500);
    endTimer = window.setTimeout(beginReveal, 9000);
    try {
      await introVideo.play();
      if (introState === 'revealed' || introState === 'leaving') introVideo.pause();
    } catch { beginReveal(); }
  }

  introVideo.addEventListener('playing', () => {
    if (introState !== 'opening') return;
    clearTimeout(startTimer);
    gate.classList.add('is-playing');
  });
  introVideo.addEventListener('ended', beginReveal);
  introVideo.addEventListener('error', () => { if (introState === 'opening') beginReveal(); });
  openButton.addEventListener('click', openInvitation);
  envelopeButton.addEventListener('click', openInvitation);
  skipButton.addEventListener('click', finishIntro);
  next.addEventListener('click', () => goTo(current === scenes.length - 1 ? 0 : current + 1));
  previous.addEventListener('click', () => goTo(current - 1));
  screenNext.addEventListener('click', () => goTo(current + 1));
  pauseButton.addEventListener('click', () => {
    const video = activeVideo();
    if (!video) return;
    if (video.paused || video.ended) {
      if (video.ended) video.currentTime = 0;
      playCurrent();
    } else video.pause();
  });
  replayButton.addEventListener('click', () => {
    const video = activeVideo();
    if (!video) return;
    video.currentTime = 0;
    playCurrent();
  });
  motionToggle.addEventListener('click', () => {
    preferStatic = !preferStatic;
    updateMotionPreference();
  });

  function closeMenu(returnFocus = false) {
    menu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) menuToggle.focus();
  }
  menuToggle.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    menuToggle.setAttribute('aria-expanded', String(!menu.hidden));
    if (!menu.hidden) menu.querySelector('button')?.focus();
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.menu-wrap')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (!gate.hidden) {
      if (event.key === 'Escape') {
        event.preventDefault();
        finishIntro();
      } else if (event.key === 'Tab') {
        const buttons = Array.from(gate.querySelectorAll('button')).filter(button => !button.disabled && !button.hidden && button.getClientRects().length);
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && (document.activeElement === first || !buttons.includes(document.activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !buttons.includes(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      }
      return;
    }
    if (event.key === 'Escape' && !menu.hidden) {
      event.preventDefault();
      closeMenu(true);
      return;
    }
    if (!menu.hidden || event.target.closest('input,textarea,select,form,[contenteditable="true"]')) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); goTo(current + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(current - 1); }
  });

  reducedMotion.addEventListener('change', () => {
    if (!gate.hidden && introState === 'opening' && staticMode()) finishIntro();
    updateMotionPreference();
  });
  connection?.addEventListener?.('change', updateMotionPreference);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      const video = activeVideo();
      if (video && !video.paused && !video.ended) {
        pausedForVisibility = video;
        video.pause();
      }
      if (!gate.hidden && introState === 'opening') finishIntro();
    } else if ((resumeWhenVisible || (pausedForVisibility && pausedForVisibility === activeVideo())) && !staticMode()) {
      pausedForVisibility = null;
      resumeWhenVisible = false;
      playCurrent();
    }
  });
  window.addEventListener('pagehide', () => {
    const video = activeVideo();
    pageSnapshot = video && entered ? { index: current, time: video.currentTime, playing: !video.paused || pausedForVisibility === video, ended: video.ended } : null;
    clearIntroTimers();
    clearTimeout(playbackTimer);
    introVideo.pause();
    scenes.forEach(scene => releaseVideo(scene.querySelector('.scene-video')));
  });
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    if (!entered) {
      if (introState !== 'closed') finishIntro();
      return;
    }
    const video = activeVideo();
    const scene = activeScene();
    const snapshot = pageSnapshot;
    if (!video || staticMode()) return;
    ensureSource(video, 'auto');
    const restoreFrame = () => {
      if (video !== activeVideo() || !entered || staticMode()) return;
      if (snapshot && snapshot.index === current && Number.isFinite(video.duration)) video.currentTime = Math.min(snapshot.time, Math.max(0, video.duration - .05));
      if (snapshot?.playing || resumeWhenVisible) {
        resumeWhenVisible = false;
        playCurrent();
      } else {
        video.pause();
        scene.classList.add(snapshot?.ended ? 'is-ended' : 'is-paused');
        setPauseState(true);
      }
    };
    if (video.readyState >= 1) restoreFrame();
    else video.addEventListener('loadedmetadata', restoreFrame, { once: true });
    prepareNext();
  });

  const countdownTarget = Date.parse('2026-11-21T18:30:00-06:00');
  function updateCountdown() {
    let seconds = Math.max(0, Math.floor((countdownTarget - Date.now()) / 1000));
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    ['days', 'hours', 'minutes', 'seconds'].forEach((id, index) => {
      document.getElementById(id).textContent = String([days, hours, minutes, seconds][index]).padStart(2, '0');
    });
  }
  updateCountdown();
  window.setInterval(() => { if (!document.hidden && current === 4) updateCountdown(); }, 1000);

  const rsvpForm = document.getElementById('rsvp-form');
  const guestCount = document.getElementById('guest-count');
  const guestCountWrap = document.getElementById('guest-count-wrap');
  const confirmationPreview = document.getElementById('confirmation-preview');
  rsvpForm.addEventListener('change', () => {
    const attending = new FormData(rsvpForm).get('asistencia') === 'si';
    guestCountWrap.hidden = !attending;
    guestCount.disabled = !attending;
    guestCount.required = attending;
  });
  rsvpForm.addEventListener('submit', event => {
    event.preventDefault();
    const name = document.getElementById('guest-name').value.trim();
    if (!name) {
      document.getElementById('guest-name').setCustomValidity('Escribe tu nombre para preparar el mensaje.');
      rsvpForm.reportValidity();
      return;
    }
    document.getElementById('guest-name').setCustomValidity('');
    const data = new FormData(rsvpForm);
    const attending = data.get('asistencia') === 'si';
    const count = Number(data.get('personas'));
    if (attending && (!Number.isInteger(count) || count < 1 || count > 30)) { rsvpForm.reportValidity(); return; }
    const message = attending
      ? `Hola Claudia, soy ${name}. Confirmo mi asistencia a los XV años de Videl el 21 de noviembre de 2026, a las 6:30 p. m. en Salón Villa Verde. Asistiremos ${count} ${count === 1 ? 'persona' : 'personas'}, incluyéndome. ¡Gracias por la invitación!`
      : `Hola Claudia, soy ${name}. Gracias por invitarme a los XV años de Videl el 21 de noviembre de 2026. Lamentablemente no podré asistir. Les deseo una hermosa celebración.`;
    document.getElementById('confirmation-message').textContent = message;
    document.getElementById('whatsapp-confirm').href = `https://wa.me/525548614656?text=${encodeURIComponent(message)}`;
    rsvpForm.hidden = true;
    confirmationPreview.hidden = false;
    document.getElementById('whatsapp-confirm').focus({ preventScroll: true });
  });
  document.getElementById('guest-name').addEventListener('input', event => event.target.setCustomValidity(''));
  document.getElementById('edit-confirmation').addEventListener('click', () => {
    confirmationPreview.hidden = true;
    rsvpForm.hidden = false;
    document.getElementById('guest-name').focus({ preventScroll: true });
  });

  const questions = [
    { prompt: '¿Cuáles son sus colores favoritos?', answers: ['Azul, morado y rojo', 'Negro, blanco y verde', 'Rosa, amarillo y naranja'], correct: 1, detail: 'Sus colores favoritos son negro, blanco y verde.' },
    { prompt: '¿Cuál es su comida favorita?', answers: ['Tacos o pozole', 'Sushi o sashimi', 'Pasta italiana o lasaña'], correct: 2, detail: 'Le encanta la pasta italiana o una rica lasaña.' },
    { prompt: '¿Qué antojo le encanta?', answers: ['Esquites', 'Waffles', 'Brownies'], correct: 0, detail: '¡Los esquites están entre sus favoritos!' },
    { prompt: '¿Qué cantantes están entre sus favoritas?', answers: ['Taylor Swift, Olivia Rodrigo y Billie Eilish', 'Shakira, Karol G y Dua Lipa', 'Kali Uchis, Ariana Grande y Mon Laferte'], correct: 2, detail: 'Sus favoritas son Kali Uchis, Ariana Grande y Mon Laferte.' },
    { prompt: '¿Cuáles son sus canciones favoritas?', answers: ['“Luna” y “Provenza”', '“2:12am” de Rauw Alejandro y “bby Romeo” de rusowsky', '“Flowers” y “Cruel Summer”'], correct: 1, detail: 'Sus favoritas son “2:12am” de Rauw Alejandro o “bby Romeo” de rusowsky.' },
    { prompt: '¿Qué películas le fascinan?', answers: ['Son como niños o Una esposa de mentiras', 'Mean Girls o Legalmente rubia', 'Titanic o El diario de una pasión'], correct: 0, detail: 'Le gustan Son como niños o Una esposa de mentiras. También disfruta la serie Welcome to Derry.' },
    { prompt: '¿Qué hace en su tiempo libre?', answers: ['Leer o dibujar', 'Cocinar o jugar videojuegos', 'Salir a caminar o ver películas'], correct: 2, detail: 'Le gusta salir a caminar o ver películas.' },
    { prompt: '¿Cuál es su animal favorito?', answers: ['Gato o perro', 'Pantera o jaguar', 'León o tigre'], correct: 1, detail: 'Sus favoritos son la pantera o el jaguar.' },
    { prompt: '¿Qué países le gustaría conocer?', answers: ['Italia, Francia o Inglaterra', 'Japón, Corea del Sur o Tailandia', 'Canadá, Estados Unidos o Australia'], correct: 0, detail: 'Le gustaría conocer Italia, Francia o Inglaterra.' },
    { prompt: '¿Cuál es su salida perfecta con amigos?', answers: ['Únicamente ir al cine', 'Cualquier salida es perfecta', 'Solo ir a un concierto'], correct: 1, detail: 'No tiene una salida perfecta específica: cualquier salida con sus amigos es perfecta para ella.' }
  ];
  let questionIndex = 0;
  let score = 0;
  let answered = false;
  let selectedAnswers = [];
  let quizView = 'start';
  let practiceMode = false;
  let leaderboardData = null;
  let rankingRequest = 0;
  let startingQuiz = false;
  let startRequest = 0;
  let skipGuestPrefill = false;
  let rankingReturnFocus = null;
  let storageAvailable = true;
  const participantStorageKey = 'videl-trivia-participants-v1';
  const participantStates = new Map();
  const postingParticipants = new Set();
  const quizStart = document.getElementById('quiz-start');
  const quizStartForm = document.getElementById('quiz-start-form');
  const quizName = document.getElementById('quiz-name');
  const quizStartButton = document.getElementById('quiz-start-button');
  const startSaveRetry = document.getElementById('quiz-start-save-retry');
  const quizIdentityNote = document.getElementById('quiz-identity-note');
  const triviaForm = document.getElementById('trivia-form');
  const quizAnswers = document.getElementById('quiz-answers');
  const quizFeedback = document.getElementById('quiz-feedback');
  const quizSubmit = document.getElementById('quiz-submit');
  const quizResult = document.getElementById('quiz-result');
  const rankingPanel = document.getElementById('quiz-leaderboard');
  rankingPanel.insertBefore(document.getElementById('ranking-me'), document.getElementById('ranking-table-wrap'));
  const rankingStatus = document.getElementById('ranking-status');
  const rankingRefresh = document.getElementById('ranking-refresh');
  const saveStatus = document.getElementById('quiz-save-status');
  const saveRetry = document.getElementById('quiz-save-retry');
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const cleanName = value => value.normalize('NFKC').trim().replace(/\s+/g, ' ');
  const nameKey = value => cleanName(value).toLocaleLowerCase('es');

  function readParticipants() {
    try {
      const value = JSON.parse(window.localStorage.getItem(participantStorageKey) || 'null');
      if (!value || !Array.isArray(value.participants)) return { participants: [], activeId: null };
      return {
        participants: value.participants.filter(item => item && uuidPattern.test(item.id) && typeof item.name === 'string' && item.name.trim() && item.name.length <= 50).map(item => ({
          id: item.id, name: item.name, consumed: item.consumed === true,
          pending: item.pending && typeof item.pending.name === 'string' && item.pending.name.trim() && item.pending.name.length <= 50 && Array.isArray(item.pending.answers) && item.pending.answers.length === questions.length && item.pending.answers.every(answer => Number.isInteger(answer) && answer >= 0 && answer <= 2) ? { name: item.pending.name, answers: item.pending.answers.slice() } : null
        })),
        activeId: uuidPattern.test(value.activeId || '') ? value.activeId : null
      };
    } catch {
      storageAvailable = false;
      return { participants: [], activeId: null };
    }
  }
  const participantRegistry = readParticipants();
  let quizParticipant = participantRegistry.participants.find(item => item.id === participantRegistry.activeId) || null;
  if (quizParticipant) quizName.value = quizParticipant.name;

  function writeParticipants() {
    participantRegistry.participants.forEach(participant => {
      const state = participantStates.get(participant.id);
      if (!state) return;
      participant.consumed = state.consumed;
      participant.pending = state.pending ? { name: state.pending.name, answers: state.pending.answers.slice() } : null;
    });
    try { window.localStorage.setItem(participantStorageKey, JSON.stringify(participantRegistry)); }
    catch { storageAvailable = false; }
    updateIdentityNote();
  }
  function updateIdentityNote(message = '') {
    const storageNote = storageAvailable ? '' : 'Este navegador no puede recordar tu identidad. Evita recargar para conservar tu primer intento en este dispositivo.';
    const sameName = quizParticipant && nameKey(quizName.value) === nameKey(quizParticipant.name);
    const state = sameName ? participantState(quizParticipant.id) : null;
    const pendingNote = state?.pending ? 'Tu primer resultado está pendiente de confirmación. Puedes reintentar guardarlo con las mismas respuestas. Las siguientes partidas son de práctica.' : '';
    quizIdentityNote.textContent = [message, pendingNote, storageNote].filter(Boolean).join(' ');
    quizIdentityNote.hidden = !quizIdentityNote.textContent;
  }
  function newParticipantId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    if (window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
    else bytes.forEach((_, index) => { bytes[index] = Math.floor(Math.random() * 256); });
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  function participantState(id) {
    if (!participantStates.has(id)) {
      const stored = participantRegistry.participants.find(item => item.id === id);
      participantStates.set(id, { consumed: stored?.consumed === true || Boolean(stored?.pending), official: null, pending: stored?.pending ? { name: stored.pending.name, answers: stored.pending.answers.slice() } : null, error: '' });
    }
    return participantStates.get(id);
  }
  function resolveParticipant(name) {
    let participant = participantRegistry.participants.find(item => nameKey(item.name) === nameKey(name));
    if (!participant) {
      participant = { id: newParticipantId(), name };
      participantRegistry.participants.push(participant);
    } else participant.name = name;
    participantRegistry.activeId = participant.id;
    writeParticipants();
    return participant;
  }
  function participantCount(total) { return `${total} ${total === 1 ? 'participante' : 'participantes'}`; }
  function validStanding(item, total) {
    return Boolean(item && Number.isInteger(item.rank) && item.rank > 0 && item.rank <= total && typeof item.name === 'string' && Number.isInteger(item.score) && item.score >= 0 && item.score <= questions.length);
  }
  function validateRanking(data) {
    if (!data || !Number.isInteger(data.total) || data.total < 0 || !Array.isArray(data.top20) || !data.top20.every(item => validStanding(item, data.total)) || (data.me !== null && !validStanding(data.me, data.total))) throw new Error('No pudimos leer la clasificación. Intenta de nuevo.');
    return { total: data.total, top20: data.top20.slice(0, 20), me: data.me, recorded: data.recorded };
  }
  async function rankingApi(path, options = {}) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    try {
      const response = await window.fetch(path, { ...options, cache: 'no-store', credentials: 'same-origin', signal: controller.signal });
      if (!response.ok) throw new Error(response.status === 429 ? 'Espera un momento antes de intentar de nuevo.' : 'La clasificación no está disponible por ahora. Intenta de nuevo.');
      return validateRanking(await response.json());
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('La conexión tardó demasiado. Intenta de nuevo.');
      if (error instanceof TypeError || error instanceof SyntaxError) throw new Error('No pudimos conectar con la clasificación. Intenta de nuevo.');
      throw error;
    } finally { window.clearTimeout(timeout); }
  }
  function applyRanking(data, participantId) {
    if ((quizParticipant?.id || null) !== participantId) return;
    leaderboardData = data;
    if (participantId) {
      const state = participantState(participantId);
      state.official = data.me;
      if (data.me) {
        state.consumed = true;
        state.pending = null;
        state.error = '';
        writeParticipants();
      }
    }
    renderRanking();
    renderResultStanding();
    updateStartLabel();
  }
  function updateStartLabel() {
    if (startingQuiz) return;
    const sameName = quizParticipant && nameKey(quizName.value) === nameKey(quizParticipant.name);
    const state = sameName ? participantState(quizParticipant.id) : null;
    quizStartButton.textContent = state?.consumed ? 'Comenzar práctica →' : 'Comenzar trivia →';
    startSaveRetry.hidden = !state?.pending;
    startSaveRetry.disabled = Boolean(sameName && postingParticipants.has(quizParticipant.id));
    updateIdentityNote();
  }
  function renderRanking() {
    const rows = document.getElementById('ranking-rows');
    const tableWrap = document.getElementById('ranking-table-wrap');
    const tableScrollTop = tableWrap.scrollTop;
    rows.replaceChildren();
    const data = leaderboardData;
    document.getElementById('ranking-total').textContent = data ? participantCount(data.total) : '';
    document.getElementById('ranking-table-wrap').hidden = !data || data.top20.length === 0;
    document.getElementById('ranking-no-result').hidden = !data || Boolean(data.me);
    const me = document.getElementById('ranking-me');
    me.hidden = !data?.me;
    if (!data) return;
    data.top20.forEach(item => {
      const row = document.createElement('tr');
      if (data.me && item.rank === data.me.rank) row.classList.add('is-me');
      [String(item.rank).padStart(2, '0'), item.name, `${item.score}/${questions.length}`].forEach(value => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
      });
      rows.appendChild(row);
    });
    if (data.me) {
      document.getElementById('ranking-me-name').textContent = data.me.name;
      document.getElementById('ranking-me-position').textContent = `Lugar ${data.me.rank} de ${data.total} participantes`;
      document.getElementById('ranking-me-score').textContent = `${data.me.score} de ${questions.length} puntos · Primer intento`;
    }
    tableWrap.scrollTop = tableScrollTop;
  }
  function renderResultStanding() {
    const state = quizParticipant ? participantState(quizParticipant.id) : null;
    const data = leaderboardData;
    document.getElementById('quiz-position').textContent = data?.me ? `Lugar ${data.me.rank} de ${data.total} participantes` : 'Tu lugar aparecerá al registrar tu primer resultado.';
    document.getElementById('quiz-participants').textContent = data ? `${participantCount(data.total)} en la clasificación` : '';
    saveRetry.hidden = !state?.pending;
    saveRetry.disabled = Boolean(quizParticipant && postingParticipants.has(quizParticipant.id));
    if (!state) { saveStatus.textContent = ''; return; }
    if (postingParticipants.has(quizParticipant.id)) {
      saveStatus.textContent = 'Guardando tu primer resultado…';
    } else if (state.pending) {
      saveStatus.textContent = `${practiceMode ? 'Este intento es una práctica. ' : ''}Todavía no pudimos confirmar el guardado de tu primer resultado. ${state.error || 'Puedes reintentar con las mismas respuestas.'}`;
    } else if (state.official) {
      saveStatus.textContent = practiceMode ? `Práctica: tu primer resultado oficial sigue siendo ${state.official.score}/${questions.length}.` : `Tu primer resultado oficial está guardado: ${state.official.score}/${questions.length} puntos.`;
    } else if (practiceMode) {
      saveStatus.textContent = 'Este intento es una práctica y no cambia tu primer resultado oficial.';
    } else {
      saveStatus.textContent = 'Tu resultado aún no está registrado en la clasificación.';
    }
  }
  async function loadRanking({ quiet = false } = {}) {
    const participantId = quizParticipant?.id || null;
    if (participantId && postingParticipants.has(participantId)) return null;
    const request = ++rankingRequest;
    rankingRefresh.disabled = true;
    if (!quiet || !leaderboardData) rankingStatus.textContent = leaderboardData ? 'Actualizando clasificación…' : 'Cargando clasificación…';
    try {
      const data = await rankingApi(`/api/videl-trivia${participantId ? `?participantId=${encodeURIComponent(participantId)}` : ''}`);
      if (request !== rankingRequest || participantId !== (quizParticipant?.id || null)) return null;
      applyRanking(data, participantId);
      rankingStatus.textContent = data.total === 0 ? 'La clasificación está vacía. ¡Tu primer resultado puede abrir la lista!' : '';
      return data;
    } catch (error) {
      if (request === rankingRequest && participantId === (quizParticipant?.id || null)) rankingStatus.textContent = error.message;
      return null;
    } finally {
      if (request === rankingRequest) rankingRefresh.disabled = false;
    }
  }
  async function submitOfficial() {
    if (!quizParticipant) return;
    const participantId = quizParticipant.id;
    const state = participantState(participantId);
    if (!state.pending || postingParticipants.has(participantId)) return;
    const payload = { participantId, name: state.pending.name, answers: state.pending.answers.slice() };
    postingParticipants.add(participantId);
    rankingRequest += 1;
    updateStartLabel();
    renderResultStanding();
    try {
      const data = await rankingApi('/api/videl-trivia', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!data.me) throw new Error('No pudimos confirmar que tu resultado quedara guardado. Reintenta.');
      state.official = data.me;
      state.pending = null;
      state.error = '';
      state.consumed = true;
      writeParticipants();
      applyRanking(data, participantId);
      if (participantId === quizParticipant?.id) rankingStatus.textContent = '';
    } catch (error) {
      state.error = error.message;
    } finally {
      postingParticipants.delete(participantId);
      if (participantId === quizParticipant?.id) {
        rankingRefresh.disabled = false;
        renderResultStanding();
        updateStartLabel();
      }
    }
  }
  function setQuizView(view) {
    quizView = view;
    document.getElementById('chapter-09').classList.remove('is-ranking');
    quizStart.hidden = view !== 'start';
    triviaForm.hidden = view !== 'playing';
    quizResult.hidden = view !== 'result';
    rankingPanel.hidden = true;
    resetQuizScroll();
  }
  function openRanking(trigger) {
    rankingReturnFocus = trigger;
    quizStart.hidden = true;
    triviaForm.hidden = true;
    quizResult.hidden = true;
    rankingPanel.hidden = false;
    document.getElementById('chapter-09').classList.add('is-ranking');
    document.getElementById('ranking-close').textContent = quizView === 'result' ? 'Volver a mi resultado ←' : 'Volver a la trivia ←';
    renderRanking();
    resetQuizScroll();
    loadRanking();
    document.getElementById('ranking-title').tabIndex = -1;
    document.getElementById('ranking-title').focus({ preventScroll: true });
  }
  function onTriviaChapterEnter() {
    if (quizView === 'start' && !quizName.value.trim() && !skipGuestPrefill) quizName.value = cleanName(document.getElementById('guest-name').value).slice(0, 50);
    updateStartLabel();
    loadRanking();
  }
  function resetQuizScroll() {
    document.querySelector('#chapter-09 .interactive-scroll').scrollTop = 0;
  }
  function changeGuest() {
    rankingRequest += 1;
    startRequest += 1;
    startingQuiz = false;
    quizStartButton.disabled = false;
    quizName.disabled = false;
    quizParticipant = null;
    participantRegistry.activeId = null;
    leaderboardData = null;
    quizName.value = '';
    quizName.setCustomValidity('');
    skipGuestPrefill = true;
    writeParticipants();
    setQuizView('start');
    updateStartLabel();
    renderRanking();
    loadRanking();
    quizName.focus({ preventScroll: true });
  }
  function beginAttempt(asPractice) {
    questionIndex = 0;
    score = 0;
    answered = false;
    selectedAnswers = [];
    practiceMode = asPractice;
    document.getElementById('quiz-attempt-mode').textContent = asPractice ? 'Práctica · Tu primer resultado no cambia' : 'Primer intento oficial';
    setQuizView('playing');
    renderQuestion();
    quizAnswers.querySelector('input')?.focus({ preventScroll: true });
  }
  quizStartForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (startingQuiz) return;
    const name = cleanName(quizName.value);
    if (!name || name.length > 50) {
      quizName.setCustomValidity('Escribe un nombre o apodo de hasta 50 caracteres.');
      quizStartForm.reportValidity();
      return;
    }
    quizName.setCustomValidity('');
    quizName.value = name;
    const request = ++startRequest;
    startingQuiz = true;
    quizStartButton.disabled = true;
    quizName.disabled = true;
    quizStartButton.textContent = 'Consultando tu primer intento…';
    const participant = resolveParticipant(name);
    if (quizParticipant?.id !== participant.id) leaderboardData = null;
    quizParticipant = participant;
    skipGuestPrefill = false;
    const data = await loadRanking();
    if (request !== startRequest) return;
    startingQuiz = false;
    quizStartButton.disabled = false;
    quizName.disabled = false;
    if (quizParticipant?.id !== participant.id) { updateStartLabel(); return; }
    const state = participantState(participant.id);
    updateIdentityNote(data ? '' : 'No pudimos consultar tu lugar. Al terminar intentaremos registrar tu primer resultado.');
    beginAttempt(Boolean(state.consumed || data?.me));
    updateStartLabel();
  });
  quizName.addEventListener('input', () => { quizName.setCustomValidity(''); updateStartLabel(); });
  document.getElementById('quiz-start-ranking').addEventListener('click', event => openRanking(event.currentTarget));
  document.getElementById('quiz-result-ranking').addEventListener('click', event => openRanking(event.currentTarget));
  document.getElementById('ranking-close').addEventListener('click', () => {
    setQuizView(quizView);
    rankingReturnFocus?.focus({ preventScroll: true });
  });
  rankingRefresh.addEventListener('click', () => loadRanking());
  saveRetry.addEventListener('click', submitOfficial);
  startSaveRetry.addEventListener('click', submitOfficial);
  ['quiz-other-guest', 'quiz-start-other-guest', 'ranking-other-guest'].forEach(id => document.getElementById(id).addEventListener('click', changeGuest));
  window.setInterval(() => {
    if (!document.hidden && entered && current === 8 && !rankingPanel.hidden) loadRanking({ quiet: true });
  }, 15000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && entered && current === 8 && !rankingPanel.hidden) loadRanking({ quiet: true });
  });
  function renderQuestion() {
    answered = false;
    const question = questions[questionIndex];
    document.getElementById('quiz-counter').textContent = `Pregunta ${questionIndex + 1} de ${questions.length}`;
    document.getElementById('quiz-prompt').textContent = question.prompt;
    quizAnswers.replaceChildren();
    question.answers.forEach((text, index) => {
      const answerLabel = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'trivia';
      input.value = String(index);
      input.required = true;
      answerLabel.append(input, document.createTextNode(` ${text}`));
      quizAnswers.appendChild(answerLabel);
    });
    quizFeedback.hidden = true;
    quizFeedback.classList.remove('is-correct');
    quizSubmit.innerHTML = 'Comprobar respuesta <span aria-hidden="true">→</span>';
    resetQuizScroll();
  }
  triviaForm.addEventListener('submit', event => {
    event.preventDefault();
    if (answered) {
      if (questionIndex < questions.length - 1) {
        questionIndex += 1;
        renderQuestion();
        quizAnswers.querySelector('input')?.focus({ preventScroll: true });
      } else {
        setQuizView('result');
        document.getElementById('quiz-score').textContent = `${score} / ${questions.length}`;
        document.getElementById('quiz-summary').textContent = score === questions.length ? '¡Conoces muy bien a Videl! Nos vemos en la fiesta.' : 'Ahora conoces un poquito más a Videl. ¡Gracias por jugar!';
        if (!practiceMode && quizParticipant) {
          const state = participantState(quizParticipant.id);
          state.consumed = true;
          state.pending = { name: quizParticipant.name, answers: selectedAnswers.slice() };
          state.error = '';
          writeParticipants();
          submitOfficial();
        } else loadRanking({ quiet: true });
        renderResultStanding();
        document.getElementById('quiz-result-ranking').focus({ preventScroll: true });
      }
      return;
    }
    const selected = triviaForm.querySelector('input[name="trivia"]:checked');
    if (!selected) { triviaForm.reportValidity(); return; }
    const correct = Number(selected.value) === questions[questionIndex].correct;
    selectedAnswers[questionIndex] = Number(selected.value);
    if (correct) score += 1;
    answered = true;
    quizAnswers.querySelectorAll('input').forEach(input => { input.disabled = true; });
    quizFeedback.textContent = `${correct ? '¡Correcto!' : 'La pista era…'} ${questions[questionIndex].detail}`;
    quizFeedback.classList.toggle('is-correct', correct);
    quizFeedback.hidden = false;
    quizSubmit.innerHTML = questionIndex === questions.length - 1 ? 'Ver mi resultado <span aria-hidden="true">→</span>' : 'Siguiente pregunta <span aria-hidden="true">→</span>';
  });
  document.getElementById('quiz-restart').addEventListener('click', () => {
    if (quizParticipant) beginAttempt(true);
  });

  renderQuestion();
  updateIdentityNote();
  updateStartLabel();
  // Only collapse the readable document once all interactive handlers are ready.
  scenes.forEach((scene, index) => { scene.hidden = index !== 0; });
  document.documentElement.classList.add('enhanced');
  document.querySelector('.cinema-navigation').hidden = false;
  app.inert = true;
  gate.hidden = false;
  updateMotionPreference();
  window.requestAnimationFrame(() => envelopeButton.focus({ preventScroll: true }));
})();
