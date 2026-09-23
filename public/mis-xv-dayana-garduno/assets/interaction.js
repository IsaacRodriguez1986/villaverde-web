(() => {
  const gate = document.querySelector('.envelope-gate');
  const trigger = document.querySelector('.envelope-trigger');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Keep hash navigation within the current page even with a clean-URL base.
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const hash = link.getAttribute('href');
      const section = document.getElementById(hash.slice(1));
      if (!section) return;
      event.preventDefault();
      history.replaceState(null, '', location.pathname + location.search + hash);
      section.scrollIntoView({behavior: reduced.matches ? 'instant' : 'smooth'});
    });
  });

  const siblings = [...document.body.children].filter(el => el !== gate && el.tagName !== 'SCRIPT');
  const motionTargets = [...document.querySelectorAll('.hero-copy > *, main h2, main .eyebrow, .special-date, .event-calendar, main .royal-flourish, .countdown-cell, .intro .quote, .person, .event-card, .venue-location, .venue-photos figure, .closing .name')];
  let observer;
  let opened = false;
  const motionPaused = () => reduced.matches || document.body.classList.contains('motion-paused');
  function showAll() {
    observer?.disconnect();
    motionTargets.forEach(el => el.classList.remove('waiting-entry'));
  }
  function watchEntrances() {
    if (motionPaused() || !('IntersectionObserver' in window)) { showAll(); return; }
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.remove('waiting-entry');
          observer.unobserve(entry.target);
        }
      }
    }, {threshold: .12});
    motionTargets.forEach(el => observer.observe(el));
  }
  // Content remains readable if JS or IntersectionObserver is unavailable.
  if (!motionPaused() && 'IntersectionObserver' in window) {
    motionTargets.forEach(el => el.classList.add('motion-enter', 'waiting-entry'));
    document.querySelectorAll('.countdown-cell,.venue-photos figure,.person').forEach((el,i) => el.style.setProperty('--entry-delay', `${(i % 4) * 110}ms`));
  }
  siblings.forEach(el => el.inert = true);
  document.body.classList.add('gate-locked');
  trigger.addEventListener('keydown',event => { if (event.key === 'Tab') { event.preventDefault(); trigger.focus(); } });
  gate.addEventListener('keydown',event => { if (event.key === 'Escape' && !opened) trigger.click(); });
  async function openInvitation() {
    if (opened) return;
    opened = true;
    // Start in the tap handler, before any image awaits or animation timers,
    // so mobile browsers retain the visitor's playback gesture.
    const music = document.querySelector('.music-section audio');
    if (music) {
      music.play().catch(() => {
        // Native controls remain available if the browser blocks playback.
        document.querySelector('#music-play-hint').hidden = false;
      });
    }
    trigger.setAttribute('aria-disabled','true');
    const openImage = gate.querySelector('.envelope-open-back');
    let imageReady = openImage.complete && openImage.naturalWidth > 0;
    if (!imageReady) {
      const hint = gate.querySelector('.gate-hint');
      hint.textContent = 'Preparando tu invitación…';
      imageReady = await Promise.race([openImage.decode().then(() => true, () => false),new Promise(resolve => setTimeout(() => resolve(false), 4000))]);
    }
    const finish = () => {
      gate.classList.add('leaving');
      siblings.forEach(el => el.inert = false);
      document.body.classList.remove('gate-locked');
      window.scrollTo({top:0,behavior:'instant'});
      const heading = document.querySelector('#name');
      heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});
      watchEntrances();
      setTimeout(() => { gate.hidden = true; }, reduced.matches ? 0 : 650);
    };
    if (reduced.matches || !imageReady) { finish(); return; }
    gate.classList.add('is-opening');
    trigger.classList.add('is-open');
    setTimeout(finish, 3300);
  }
  trigger.addEventListener('click',openInvitation);
  reduced.addEventListener('change', () => { if (reduced.matches) showAll(); });
  const pauseObserver = new MutationObserver(() => { if (motionPaused()) showAll(); });
  pauseObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
})();
