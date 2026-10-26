(() => {
  const portrait = document.querySelector('.hero-art');
  const ui = portrait.querySelector('.portrait-interface');
  const nodes = [...ui.querySelectorAll('.portrait-node')];
  const resetButton = ui.querySelector('.scan-reset');
  const title = ui.querySelector('.scan-title');
  const description = ui.querySelector('.scan-description');
  const code = ui.querySelector('.scan-code');
  const coordinates = ui.querySelector('.scan-coordinates');
  const pets = [...ui.querySelectorAll('[data-pet]')];
  const announcement = ui.querySelector('.pet-announcement');
  let reactionTimer;
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
    clearTimeout(reactionTimer);
    pets.forEach(pet => { pet.hidden = pet.dataset.pet !== mode; pet.classList.remove('is-reacting'); });
    const copy = modes[mode] || ['A few layers of me.', 'Move across the portrait or select a marker.', 'INTERACTIVE PORTRAIT / EXPLORE'];
    title.textContent = copy[0]; description.textContent = copy[1]; code.textContent = copy[2];
    nodes.forEach(node => node.setAttribute('aria-pressed', String(node.dataset.mode === mode)));
  }
  function neutralPosition() {
    portrait.style.setProperty('--tilt-x', '0deg');
    portrait.style.setProperty('--tilt-y', '0deg');
    portrait.classList.remove('is-scanning');
    coordinates.textContent = 'X — / Y —';
    pets.forEach(pet => { pet.style.setProperty('--eye-x', '0px'); pet.style.setProperty('--eye-y', '0px'); });
  }
  function reset() {
    pinned = false; pointer = null; cancelAnimationFrame(frame); frame = 0;
    resetButton.hidden = true; select(''); neutralPosition();
  }
  function scan() {
    frame = 0;
    if (!pointer) return;
    const x = pointer.x, y = pointer.y;
    pets.filter(pet => !pet.hidden).forEach(pet => {
      const box = pet.getBoundingClientRect();
      const dx = (pointer.clientX - box.left - box.width / 2) / Math.max(1, box.width);
      const dy = (pointer.clientY - box.top - box.height / 2) / Math.max(1, box.height);
      pet.style.setProperty('--eye-x', reduced.matches ? '0px' : `${Math.max(-3, Math.min(3, dx * 3))}px`);
      pet.style.setProperty('--eye-y', reduced.matches ? '0px' : `${Math.max(-2, Math.min(2, dy * 2))}px`);
    });
    portrait.style.setProperty('--pointer-x', `${x * 100}%`);
    portrait.style.setProperty('--pointer-y', `${y * 100}%`);
    portrait.style.setProperty('--tilt-x', reduced.matches ? '0deg' : `${(0.5 - y) * 4}deg`);
    portrait.style.setProperty('--tilt-y', reduced.matches ? '0deg' : `${(x - 0.5) * 4}deg`);
    coordinates.textContent = `X ${String(Math.round(x * 100)).padStart(2, '0')} / Y ${String(Math.round(y * 100)).padStart(2, '0')}`;
    if (!pinned && !ui.contains(document.activeElement)) select(pointer.petMode || (y > .62 ? 'art' : x > .55 ? 'engineering' : 'research'));
  }
  portrait.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    const bounds = portrait.getBoundingClientRect();
    pointer = {clientX: event.clientX, clientY: event.clientY, petMode: event.target.closest('[data-pet]')?.dataset.pet, x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)), y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height))};
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
  const reactions = { research: 'The alien beams up a little star. Curiosity collected!', engineering: 'The robot built a tiny structure. Assembly complete!', art: 'The art monster splashed mint, blue and lilac ink. A tiny masterpiece!' };
  pets.forEach(pet => pet.addEventListener('click', () => {
    pinned = true;
    select(pet.dataset.pet);
    resetButton.hidden = false;
    clearTimeout(reactionTimer);
    pet.classList.remove('is-reacting');
    void pet.offsetWidth;
    pet.classList.add('is-reacting');
    announcement.textContent = reactions[pet.dataset.pet];
    reactionTimer = setTimeout(() => pet.classList.remove('is-reacting'), 1400);
  }));
  ui.addEventListener('focusout' , () => queueMicrotask(() => {
    if (!ui.contains(document.activeElement) && !pinned && !pointer) select('');
  }));
  resetButton.addEventListener('click', () => { reset(); nodes[0].focus(); select(''); });
  portrait.addEventListener('keydown', event => { if (event.key === 'Escape') { if (event.target.closest('[data-pet]')) nodes[0].focus(); reset(); } });
  reduced.addEventListener('change', neutralPosition);
  ui.hidden = false;
})();
