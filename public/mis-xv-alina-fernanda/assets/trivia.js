(() => {
  'use strict';

  const section = document.getElementById('trivia');
  if (!section) return;
  const byId = id => document.getElementById(id);
  const endpoint = '/api/alina-trivia';
  const storageKey = 'alina-trivia-attempt-v1';
  const startForm = byId('trivia-start-form');
  const nameInput = byId('trivia-name');
  const startButton = byId('trivia-start');
  const questionForm = byId('trivia-question-form');
  const nextButton = byId('trivia-next');
  const optionList = byId('trivia-options');
  const questionTitle = byId('trivia-question-title');
  const status = byId('trivia-status');
  const retryButton = byId('trivia-retry');
  const refreshButton = byId('trivia-refresh');
  const boardStatus = byId('trivia-board-status');
  const resultPanel = byId('trivia-result');
  let questions = [];
  let version = '';
  let questionIndex = 0;
  let playerName = '';
  let answers = [];
  let attemptId = '';
  let phase = 'welcome';
  let loadPromise = null;
  let saving = false;
  let activated = false;
  let storedAttempt = readAttempt();

  function readAttempt() {
    try {
      const value = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
      if (!value || typeof value.version !== 'string' || typeof value.attemptId !== 'string' ||
          !/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(value.attemptId) ||
          typeof value.name !== 'string' || value.name.length < 2 || value.name.length > 32 ||
          !Array.isArray(value.answers) || value.answers.length !== 8 ||
          value.answers.some(answer => typeof answer.questionId !== 'string' || typeof answer.optionId !== 'string')) return null;
      return value;
    } catch { return null; }
  }

  function rememberAttempt(payload) {
    try { sessionStorage.setItem(storageKey, JSON.stringify(payload)); } catch { /* Playing also works when browser storage is unavailable. */ }
    storedAttempt = payload;
  }

  function createAttemptId() {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  async function request(method, payload) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(endpoint, {
        method,
        cache: 'no-store',
        credentials: 'same-origin',
        signal: controller.signal,
        ...(payload ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) } : {}),
      });
      if (!response.ok) {
        const error = new Error('The trivia service could not complete this request.');
        error.status = response.status;
        throw error;
      }
      return await response.json();
    } finally { clearTimeout(timeout); }
  }

  function validQuestions(data) {
    return typeof data?.version === 'string' && data.pointsPerCorrect === 100 &&
      Array.isArray(data.questions) && data.questions.length === 8 &&
      new Set(data.questions.map(question => question.id)).size === 8 &&
      data.questions.every(question => typeof question.id === 'string' && typeof question.text === 'string' &&
        Array.isArray(question.options) && question.options.length === 4 &&
        new Set(question.options.map(option => option.id)).size === 4 &&
        question.options.every(option => typeof option.id === 'string' && typeof option.text === 'string'));
  }

  function renderLeaderboard(data) {
    if (!Array.isArray(data.leaderboard) || !Number.isSafeInteger(data.totalPlayers) || data.totalPlayers < 0) {
      throw new Error('The shared leaderboard was not received.');
    }
    const rows = document.createDocumentFragment();
    for (const entry of data.leaderboard.slice(0, 20)) {
      if (typeof entry.name !== 'string' || !Number.isSafeInteger(entry.score) || entry.score < 0 || entry.score > 800 ||
          !Number.isSafeInteger(entry.rank) || entry.rank < 1) throw new Error('An invalid leaderboard entry was received.');
      const row = document.createElement('tr');
      for (const value of [`${entry.rank}.`, entry.name, String(entry.score)]) {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      }
      rows.append(row);
    }
    byId('trivia-board-rows').replaceChildren(rows);
    byId('trivia-board-table-wrap').hidden = data.leaderboard.length === 0;
    boardStatus.textContent = data.leaderboard.length ? 'Los empates comparten lugar.' : 'El primer lugar está esperando. ¡Sé el primero en jugar!';
    byId('trivia-total-players').textContent = `${data.totalPlayers} ${data.totalPlayers === 1 ? 'invitado ha jugado' : 'invitados han jugado'}`;
  }

  async function loadTrivia({ refresh = false } = {}) {
    if (loadPromise) return loadPromise;
    if (questions.length && !refresh) return;
    activated = true;
    refreshButton.disabled = true;
    if (phase === 'welcome') {
      status.textContent = 'Preparando las preguntas…';
      startButton.disabled = true;
      retryButton.hidden = true;
    }
    boardStatus.textContent = 'Actualizando el marcador…';
    loadPromise = (async () => {
      try {
        const data = await request('GET');
        if (!validQuestions(data)) throw new Error('The questions were not received.');
        // Keep a game already in progress stable while the shared board refreshes.
        if (phase === 'welcome') {
          questions = data.questions;
          version = data.version;
        }
        renderLeaderboard(data);
        if (phase === 'welcome') {
          startButton.disabled = false;
          status.textContent = '';
          if (storedAttempt && storedAttempt.version === version) {
            startForm.hidden = true;
            phase = 'pending';
            status.textContent = 'Recuperando tu resultado guardado…';
            void saveResult(storedAttempt);
          }
        }
      } catch (error) {
        boardStatus.textContent = error.status === 429 ? 'Espera un momento antes de actualizar el marcador.' : 'El marcador no pudo cargar. Puedes intentar de nuevo.';
        if (phase === 'welcome') {
          status.textContent = 'La trivia no pudo cargar. Intenta de nuevo en un momento.';
          retryButton.textContent = 'Cargar la trivia';
          retryButton.hidden = false;
          startButton.disabled = true;
        }
      } finally {
        refreshButton.disabled = false;
        loadPromise = null;
      }
    })();
    return loadPromise;
  }

  function focusHeading(heading) {
    heading.focus({ preventScroll: true });
  }

  function renderQuestion() {
    const question = questions[questionIndex];
    status.textContent = '';
    byId('trivia-progress-label').textContent = `Pregunta ${questionIndex + 1} de ${questions.length}`;
    byId('trivia-player').textContent = playerName;
    byId('trivia-progress').value = questionIndex + 1;
    questionTitle.textContent = question.text;
    const options = document.createDocumentFragment();
    for (const option of question.options) {
      const label = document.createElement('label');
      label.className = 'trivia-option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'trivia-answer';
      input.value = option.id;
      input.required = true;
      const text = document.createElement('span');
      text.textContent = option.text;
      label.append(input, text);
      options.append(label);
    }
    optionList.replaceChildren(options);
    nextButton.disabled = true;
    nextButton.firstChild.textContent = questionIndex === questions.length - 1 ? 'Ver mi resultado ' : 'Siguiente pregunta ';
    focusHeading(questionTitle);
  }

  function showResult(data) {
    const result = data.result;
    if (!result || typeof result.name !== 'string' || result.totalQuestions !== 8 ||
        !Number.isSafeInteger(result.correctCount) || result.correctCount < 0 || result.correctCount > 8 ||
        result.score !== result.correctCount * 100 || !Number.isSafeInteger(result.rank) || result.rank < 1) {
      throw new Error('The saved result was not received.');
    }
    renderLeaderboard(data);
    byId('trivia-result-name').textContent = result.name;
    byId('trivia-result-score').textContent = String(result.score);
    byId('trivia-result-detail').textContent = `${result.correctCount} de ${result.totalQuestions} respuestas correctas`;
    byId('trivia-result-rank').textContent = `Tu lugar al terminar: ${result.rank}º`;
    startForm.hidden = true;
    questionForm.hidden = true;
    resultPanel.hidden = false;
    retryButton.hidden = true;
    status.textContent = '';
    phase = 'complete';
    focusHeading(byId('trivia-result-title'));
  }

  async function saveResult(payload) {
    if (saving) return;
    saving = true;
    rememberAttempt(payload);
    phase = 'pending';
    nextButton.disabled = true;
    optionList.querySelectorAll('input').forEach(input => { input.disabled = true; });
    retryButton.hidden = true;
    status.textContent = 'Guardando tus respuestas en el marcador…';
    try {
      const data = await request('POST', payload);
      showResult(data);
    } catch (error) {
      status.textContent = error.status === 429 ? 'Espera un momento y vuelve a guardar tu resultado.' :
        error.status === 409 ? 'Este intento no pudo recuperarse. Actualiza la página para consultar tu resultado.' :
          'Tu resultado todavía no se ha guardado. Tus respuestas siguen aquí; intenta guardarlo de nuevo.';
      retryButton.textContent = 'Guardar mi resultado';
      retryButton.hidden = false;
    } finally { saving = false; }
  }

  startForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!questions.length) { await loadTrivia(); return; }
    const name = nameInput.value.replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim();
    if (name.length < 2 || name.length > 32 || /[\u0000-\u001f\u007f<>]/.test(nameInput.value)) {
      nameInput.setAttribute('aria-invalid', 'true');
      status.textContent = 'Escribe un nombre o apodo de 2 a 32 caracteres.';
      nameInput.focus();
      return;
    }
    nameInput.removeAttribute('aria-invalid');
    playerName = name;
    questionIndex = 0;
    answers = [];
    attemptId = createAttemptId();
    phase = 'playing';
    startForm.hidden = true;
    questionForm.hidden = false;
    renderQuestion();
  });

  questionForm.addEventListener('change', () => {
    if (phase === 'playing') nextButton.disabled = !questionForm.querySelector('input[name="trivia-answer"]:checked');
  });

  questionForm.addEventListener('submit', event => {
    event.preventDefault();
    if (phase !== 'playing') return;
    const checked = questionForm.querySelector('input[name="trivia-answer"]:checked');
    if (!checked) return;
    answers.push({ questionId: questions[questionIndex].id, optionId: checked.value });
    if (questionIndex < questions.length - 1) {
      questionIndex += 1;
      renderQuestion();
    } else {
      void saveResult({ version, attemptId, name: playerName, answers });
    }
  });

  retryButton.addEventListener('click', () => {
    if (phase === 'pending' && storedAttempt) void saveResult(storedAttempt);
    else void loadTrivia({ refresh: true });
  });
  refreshButton.addEventListener('click', () => { void loadTrivia({ refresh: true }); });
  section.addEventListener('focusin', () => { if (!activated) void loadTrivia(); });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        if (!activated) void loadTrivia();
      }
    }, { rootMargin: '100px 0px', threshold: 0 });
    observer.observe(section);
  } else {
    // A visitor can still prepare the game by focusing the name field or updating the board.
    status.textContent = 'Escribe tu nombre para preparar la trivia.';
  }
})();
