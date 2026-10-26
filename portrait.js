(() => {
  const portrait = document.querySelector('.hero-art');
  const ui = portrait.querySelector('.ai-interface');
  const buttons = [...ui.querySelectorAll('[data-filter]')];
  const images = [...portrait.querySelectorAll('[data-variant]')];
  const caption = ui.querySelector('.ai-caption');
  const motionButton = ui.querySelector('.portrait-motion');
  const scenes = [...portrait.querySelectorAll('.portrait-scene')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const labels = {tech:'Neon research studio', art:'Ink & gouache illustration', monsters:'My kawaii universe'};
  let pinned = false, pending = 0, timer, requested = '', current = '';
  async function select(mode) {
    requested = mode;
    const token = ++pending;
    if (mode) {
      const image = images.find(image => image.dataset.variant === mode);
      try { await image.decode(); }
      catch { if (token === pending) { caption.textContent = 'This edit could not load. Try another style.'; } return; }
    }
    if (token !== pending) return;
    const changed = current !== mode;
    current = mode;
    portrait.dataset.mode = mode;
    images.forEach(image => image.classList.toggle('is-visible', image.dataset.variant === mode));
    scenes.forEach(scene => {
      const active = scene.dataset.scene === mode;
      scene.classList.toggle('is-visible', active);
      if (changed) {
        scene.classList.remove('is-entering');
        if (active && !reduced.matches && !portrait.classList.contains('portrait-motion-paused')) {
          void scene.offsetWidth;
          scene.classList.add('is-entering');
        }
      }
    });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === mode)));
    caption.textContent = mode ? `${labels[mode]} · AI-edited${pinned ? ' · Escape to reset' : ''}` : 'Hover to transform · Click a style to keep it';
  }
  const queue = mode => {
    clearTimeout(timer);
    if (mode === requested) return;
    timer = setTimeout(() => select(mode), 140);
  };
  buttons.forEach(button => {
    button.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' && !pinned) { clearTimeout(timer); select(button.dataset.filter); }
    });
    button.addEventListener('focus', () => { if (!pinned) { clearTimeout(timer); select(button.dataset.filter); } });
    button.addEventListener('click', () => {
      clearTimeout(timer); pinned = Boolean(button.dataset.filter); select(button.dataset.filter);
    });
  });
  portrait.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    const origin = portrait.getBoundingClientRect();
    portrait.style.setProperty('--reveal-x', `${Math.max(0, Math.min(100, (event.clientX - origin.left) / origin.width * 100))}%`);
    portrait.style.setProperty('--reveal-y', `${Math.max(0, Math.min(100, (event.clientY - origin.top) / origin.height * 100))}%`);
    if (pinned || ui.contains(event.target) || ui.contains(document.activeElement)) return;
    const bounds = portrait.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    queue(x < .34 ? 'tech' : x < .67 ? 'art' : 'monsters');
  });
  portrait.addEventListener('pointerleave', () => {
    clearTimeout(timer);
    if (!pinned && !ui.contains(document.activeElement)) select('');
  });
  ui.addEventListener('focusout', () => queueMicrotask(() => {
    if (!pinned && !ui.contains(document.activeElement)) select('');
  }));
  portrait.addEventListener('keydown', event => {
    if (event.key === 'Escape') { clearTimeout(timer); pinned = false; select(''); }
  });
  scenes.forEach(scene => scene.addEventListener('animationend', event => {
    if (event.animationName === 'portrait-liquid-reveal') scene.classList.remove('is-entering');
  }));
  function updateMotion() {
    const paused = portrait.classList.contains('portrait-motion-paused');
    motionButton.textContent = reduced.matches ? 'Reduced motion' : paused ? 'Play motion' : 'Pause motion';
    motionButton.disabled = reduced.matches;
    motionButton.setAttribute('aria-pressed', String(paused || reduced.matches));
    if (paused || reduced.matches) scenes.forEach(scene => scene.classList.remove('is-entering'));
  }
  motionButton.addEventListener('click', () => { portrait.classList.toggle('portrait-motion-paused'); updateMotion(); });
  const visibility = new IntersectionObserver(entries => {
    portrait.classList.toggle('portrait-offscreen', !entries[0].isIntersecting);
  }, {threshold:0});
  visibility.observe(portrait);
  document.addEventListener('visibilitychange', () => portrait.classList.toggle('portrait-page-hidden', document.hidden));
  reduced.addEventListener('change', () => { clearTimeout(timer); updateMotion(); select(current); });
  updateMotion();
  ui.hidden = false;
})();
