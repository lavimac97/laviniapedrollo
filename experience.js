(() => {
  const root = document.documentElement;
  let progressFrame = 0;
  const updateProgress = () => {
    progressFrame = 0;
    const distance = root.scrollHeight - innerHeight;
    root.style.setProperty('--reading-progress', Math.max(0, Math.min(1, distance > 0 ? scrollY / distance : 0)));
  };
  const queueProgress = () => { if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress); };
  addEventListener('scroll', queueProgress, {passive:true});
  addEventListener('resize', queueProgress);
  addEventListener('load', queueProgress);
  if ('ResizeObserver' in window) new ResizeObserver(queueProgress).observe(document.body);
  updateProgress();

  // Render the real Studio at desktop size inside the responsive preview card.
  const studio = document.querySelector('.studio-viewport');
  if (studio) {
    const fitStudio = () => studio.style.setProperty('--studio-scale', studio.clientWidth / 1100);
    if ('ResizeObserver' in window) new ResizeObserver(fitStudio).observe(studio);
    else addEventListener('resize', fitStudio);
    fitStudio();
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('#projects .card').forEach(card => {
    let frame = 0, point;
    card.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || reduced.matches) return;
      point = {x:event.clientX, y:event.clientY};
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--spot-x', `${point.x - bounds.left}px`);
        card.style.setProperty('--spot-y', `${point.y - bounds.top}px`);
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame); frame = 0;
      card.style.removeProperty('--spot-x'); card.style.removeProperty('--spot-y');
    });
  });
})();
