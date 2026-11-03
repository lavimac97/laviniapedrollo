(async function () {
  document.getElementById('year').textContent = new Date().getFullYear();

  // theme
  const root = document.documentElement;
  try { const t = localStorage.getItem('theme'); root.dataset.theme = t || 'dark'; } catch (e) {}
  document.getElementById('theme').onclick = () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  };

  // nav
  const nav = document.getElementById('nav');
  const menu = document.getElementById('menu');
  const closeMenu = () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); };
  menu.onclick = () => { menu.setAttribute('aria-expanded', String(nav.classList.toggle('open'))); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  nav.addEventListener('click', e => { if (e.target.tagName === 'A') closeMenu(); });
  const links = [...nav.querySelectorAll('a')];
  const spy = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) links.forEach(a => { const active = a.getAttribute('href') === '#' + en.target.id; a.classList.toggle('active', active); if (active) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
  }), { rootMargin: '-40% 0px -55% 0px' });
  links.forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s) spy.observe(s); });

  // A reversible, scroll-scrubbed transition without scroll hijacking.
  const threshold = document.querySelector('.threshold');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let scheduled = false;
  function updateTransition() {
    const bounds = threshold.getBoundingClientRect();
    const progress = reduced.matches ? 1 : Math.max(0, Math.min(1, -bounds.top / Math.max(1, bounds.height - innerHeight)));
    threshold.style.setProperty('--progress', progress.toFixed(4));
    threshold.classList.toggle('in-color', progress > .35);
    scheduled = false;
  }
  function queueTransition() { if (!scheduled) { scheduled = true; requestAnimationFrame(updateTransition); } }
  addEventListener('scroll', queueTransition, { passive: true });
  addEventListener('resize', queueTransition);
  reduced.addEventListener('change', queueTransition);
  updateTransition();
  document.documentElement.classList.add('motion-ready');

  // reveal
  const rev = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); rev.unobserve(en.target); } }), { threshold: .12 });
  const watch = el => rev.observe(el);
  document.querySelectorAll('.reveal').forEach(watch);

})();
