(() => {
  const portrait = document.querySelector('.hero-art');
  const ui = portrait.querySelector('.ai-interface');
  const buttons = [...ui.querySelectorAll('[data-filter]')];
  const images = [...portrait.querySelectorAll('[data-variant]')];
  const caption = ui.querySelector('.ai-caption');
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
    current = mode;
    portrait.dataset.mode = mode;
    images.forEach(image => image.classList.toggle('is-visible', image.dataset.variant === mode));
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
    if (event.pointerType !== 'mouse' || pinned || ui.contains(event.target) || ui.contains(document.activeElement)) return;
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
  // Images use opacity transitions only; reduced-motion is handled in CSS.
  reduced.addEventListener('change', () => { clearTimeout(timer); select(current); });
  ui.hidden = false;
})();
