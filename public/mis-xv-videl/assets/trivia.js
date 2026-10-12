(() => {
  'use strict';

  // Independent vertical invitation module. Shares identities and API with cine.
  const root = document.getElementById('videl-trivia');
  if (!root) return;
  const byId = id => root.querySelector('#' + id);
  const required = ['quiz-start', 'quiz-start-form', 'quiz-name', 'quiz-start-button',
    'quiz-start-save-retry', 'quiz-identity-note', 'trivia-form', 'quiz-answers',
    'quiz-feedback', 'quiz-submit', 'quiz-result', 'quiz-leaderboard', 'ranking-me',
    'ranking-table-wrap', 'ranking-status', 'ranking-refresh', 'quiz-save-status',
    'quiz-save-retry', 'quiz-start-ranking', 'quiz-result-ranking', 'ranking-close',
    'quiz-other-guest', 'quiz-start-other-guest', 'ranking-other-guest', 'quiz-restart',
    'quiz-attempt-mode', 'quiz-counter', 'quiz-prompt', 'quiz-score', 'quiz-summary',
    'quiz-position', 'quiz-participants', 'ranking-title', 'ranking-total',
    'ranking-no-result', 'ranking-rows', 'ranking-me-name', 'ranking-me-position', 'ranking-me-score'];
  if (required.some(id => !byId(id))) return;
  let triviaVisible = !('IntersectionObserver' in window);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      triviaVisible = entries[0].isIntersecting;
      if (triviaVisible && !document.hidden && !rankingPanel.hidden) loadRanking({ quiet: true });
    }, { threshold: 0 });
    observer.observe(root);
  }

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
  let rankingReturnFocus = null;
  let storageAvailable = true;
  const participantStorageKey = 'videl-trivia-participants-v1';
  const participantStates = new Map();
  const postingParticipants = new Set();
  const quizStart = byId('quiz-start');
  const quizStartForm = byId('quiz-start-form');
  const quizName = byId('quiz-name');
  const quizStartButton = byId('quiz-start-button');
  const startSaveRetry = byId('quiz-start-save-retry');
  const quizIdentityNote = byId('quiz-identity-note');
  const triviaForm = byId('trivia-form');
  const quizAnswers = byId('quiz-answers');
  const quizFeedback = byId('quiz-feedback');
  const quizSubmit = byId('quiz-submit');
  const quizResult = byId('quiz-result');
  const rankingPanel = byId('quiz-leaderboard');
  rankingPanel.insertBefore(byId('ranking-me'), byId('ranking-table-wrap'));
  const rankingStatus = byId('ranking-status');
  const rankingRefresh = byId('ranking-refresh');
  const saveStatus = byId('quiz-save-status');
  const saveRetry = byId('quiz-save-retry');
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
    const rows = byId('ranking-rows');
    const tableWrap = byId('ranking-table-wrap');
    const tableScrollTop = tableWrap.scrollTop;
    rows.replaceChildren();
    const data = leaderboardData;
    byId('ranking-total').textContent = data ? participantCount(data.total) : '';
    byId('ranking-table-wrap').hidden = !data || data.top20.length === 0;
    byId('ranking-no-result').hidden = !data || Boolean(data.me);
    const me = byId('ranking-me');
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
      byId('ranking-me-name').textContent = data.me.name;
      byId('ranking-me-position').textContent = `Lugar ${data.me.rank} de ${data.total} participantes`;
      byId('ranking-me-score').textContent = `${data.me.score} de ${questions.length} puntos · Primer intento`;
    }
    tableWrap.scrollTop = tableScrollTop;
  }
  function renderResultStanding() {
    const state = quizParticipant ? participantState(quizParticipant.id) : null;
    const data = leaderboardData;
    byId('quiz-position').textContent = data?.me ? `Lugar ${data.me.rank} de ${data.total} participantes` : 'Tu lugar aparecerá al registrar tu primer resultado.';
    byId('quiz-participants').textContent = data ? `${participantCount(data.total)} en la clasificación` : '';
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
    quizStart.hidden = view !== 'start';
    triviaForm.hidden = view !== 'playing';
    quizResult.hidden = view !== 'result';
    rankingPanel.hidden = true;
  }
  function openRanking(trigger) {
    rankingReturnFocus = trigger;
    quizStart.hidden = true;
    triviaForm.hidden = true;
    quizResult.hidden = true;
    rankingPanel.hidden = false;
    byId('ranking-close').textContent = quizView === 'result' ? 'Volver a mi resultado ←' : 'Volver a la trivia ←';
    renderRanking();
    loadRanking();
    byId('ranking-title').tabIndex = -1;
    byId('ranking-title').focus({ preventScroll: true });
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
    byId('quiz-attempt-mode').textContent = asPractice ? 'Práctica · Tu primer resultado no cambia' : 'Primer intento oficial';
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
  byId('quiz-start-ranking').addEventListener('click', event => openRanking(event.currentTarget));
  byId('quiz-result-ranking').addEventListener('click', event => openRanking(event.currentTarget));
  byId('ranking-close').addEventListener('click', () => {
    setQuizView(quizView);
    rankingReturnFocus?.focus({ preventScroll: true });
  });
  rankingRefresh.addEventListener('click', () => loadRanking());
  saveRetry.addEventListener('click', submitOfficial);
  startSaveRetry.addEventListener('click', submitOfficial);
  ['quiz-other-guest', 'quiz-start-other-guest', 'ranking-other-guest'].forEach(id => byId(id).addEventListener('click', changeGuest));
  window.setInterval(() => {
    if (!document.hidden && triviaVisible && !rankingPanel.hidden) loadRanking({ quiet: true });
  }, 15000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && triviaVisible && !rankingPanel.hidden) loadRanking({ quiet: true });
  });
  function renderQuestion() {
    answered = false;
    const question = questions[questionIndex];
    byId('quiz-counter').textContent = `Pregunta ${questionIndex + 1} de ${questions.length}`;
    byId('quiz-prompt').textContent = question.prompt;
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
        byId('quiz-score').textContent = `${score} / ${questions.length}`;
        byId('quiz-summary').textContent = score === questions.length ? '¡Conoces muy bien a Videl! Nos vemos en la fiesta.' : 'Ahora conoces un poquito más a Videl. ¡Gracias por jugar!';
        if (!practiceMode && quizParticipant) {
          const state = participantState(quizParticipant.id);
          state.consumed = true;
          state.pending = { name: quizParticipant.name, answers: selectedAnswers.slice() };
          state.error = '';
          writeParticipants();
          submitOfficial();
        } else loadRanking({ quiet: true });
        renderResultStanding();
        byId('quiz-result-ranking').focus({ preventScroll: true });
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
  byId('quiz-restart').addEventListener('click', () => {
    if (quizParticipant) beginAttempt(true);
  });

  renderQuestion();
  updateIdentityNote();
  updateStartLabel();
})();
