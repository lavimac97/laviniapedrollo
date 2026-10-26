(() => {
  const portrait = document.querySelector('.hero-art');
  const ui = portrait.querySelector('.portrait-interface');
  const nodes = [...ui.querySelectorAll('.portrait-node')];
  const resetButton = ui.querySelector('.scan-reset');
  const title = ui.querySelector('.scan-title');
  const description = ui.querySelector('.scan-description');
  const code = ui.querySelector('.scan-code');
  const coordinates = ui.querySelector('.scan-coordinates');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const modes = {
    research: ['Learning to design.', 'Machine learning, verified designs, and the questions behind my PhD.', '01 / RESEARCH'],
    engineering: ['Built to hold up.', 'Pipes, ducts, cable trays. Designing the systems behind the scenes.', '02 / ENGINEERING'],
    art: ['A different kind of logic.', 'Ink, dots, imagined worlds. The same curiosity, drawn by hand.', '03 / ART']
  };
  let pinned = false, frame = 0, pointer = null;
  function select(mode) {
    if (portrait.dataset.mode === mode) return;
    portrait.dataset.mode = mode;
    const copy = modes[mode] || ['A few layers of me.', 'Move across the portrait or select a marker.', 'INTERACTIVE PORTRAIT / EXPLORE'];
    title.textContent = copy[0]; description.textContent = copy[1]; code.textContent = copy[2];
    nodes.forEach(node => node.setAttribute('aria-pressed', String(node.dataset.mode === mode)));
  }
  function neutralPosition() {
    portrait.style.setProperty('--tilt-x', '0deg');
    portrait.style.setProperty('--tilt-y', '0deg');
    portrait.classList.remove('is-scanning');
    coordinates.textContent = 'X — / Y —';
  }
  function reset() {
    pinned = false; pointer = null; cancelAnimationFrame(frame); frame = 0;
    resetButton.hidden = true; select(''); neutralPosition();
  }
  function scan() {
    frame = 0;
    if (!pointer) return;
    const x = pointer.x, y = pointer.y;
    portrait.style.setProperty('--pointer-x', `${x * 100}%`);
    portrait.style.setProperty('--pointer-y', `${y * 100}%`);
    portrait.style.setProperty('--tilt-x', reduced.matches ? '0deg' : `${(0.5 - y) * 4}deg`);
    portrait.style.setProperty('--tilt-y', reduced.matches ? '0deg' : `${(x - 0.5) * 4}deg`);
    coordinates.textContent = `X ${String(Math.round(x * 100)).padStart(2, '0')} / Y ${String(Math.round(y * 100)).padStart(2, '0')}`;
    if (!pinned && !ui.contains(document.activeElement)) select(y > .62 ? 'art' : x > .55 ? 'engineering' : 'research');
  }
  portrait.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    const bounds = portrait.getBoundingClientRect();
    pointer = {x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)), y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height))};
    portrait.classList.add('is-scanning');
    if (!frame) frame = requestAnimationFrame(scan);
  });
  portrait.addEventListener('pointerleave', () => {
    pointer = null; cancelAnimationFrame(frame); frame = 0; neutralPosition();
    if (!pinned && !ui.contains(document.activeElement)) select('');
  });
  nodes.forEach(node => {
    node.addEventListener('focus', () => { if (!pinned) select(node.dataset.mode); });
    node.addEventListener('click', () => { pinned = true; select(node.dataset.mode); resetButton.hidden = false; });
  });
  ui.addEventListener('focusout', () => queueMicrotask(() => {
    if (!ui.contains(document.activeElement) && !pinned && !pointer) select('');
  }));
  resetButton.addEventListener('click', () => { reset(); nodes[0].focus(); select(''); });
  portrait.addEventListener('keydown', event => { if (event.key === 'Escape') { reset(); } });
  reduced.addEventListener('change', neutralPosition);
  ui.hidden = false;
})();
