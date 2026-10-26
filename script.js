(async function () {
  document.getElementById('year').textContent = new Date().getFullYear();

  // theme
  const root = document.documentElement;
  try { const t = localStorage.getItem('theme'); root.dataset.theme = t || 'light'; } catch (e) {}
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
    if (en.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
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

  // art gallery with tabs
  let data;
  try { const response = await fetch('art.json'); if (!response.ok) throw new Error('Gallery unavailable'); data = await response.json(); } catch (error) { document.getElementById('gallery-status').textContent = 'The gallery could not load. Please refresh to try again.'; return; }
  const tabs = document.getElementById('tabs'), grid = document.getElementById('grid');
  const all = data.collections.flatMap(c => c.images.map(src => ({ src, title: c.title, slug: c.slug })));
  let shown = all;
  function render(filter) {
    shown = filter ? all.filter(i => i.slug === filter) : all;
    grid.innerHTML = '';
    document.getElementById('gallery-status').textContent = `${shown.length} drawings · Select a work to view it full size`;
    shown.forEach((it, idx) => {
      const fig = document.createElement('figure'); fig.className = 'art-card'; fig.tabIndex = 0; fig.setAttribute('role', 'button'); fig.setAttribute('aria-label', `View ${it.title}, drawing ${idx + 1}`);
      fig.innerHTML = `<img loading="lazy" decoding="async" src="${it.src}" alt="${it.title}"><figcaption>${it.title}</figcaption>`;
      fig.addEventListener('click', () => open(idx));
      fig.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(idx); } });
      grid.appendChild(fig);
    });
  }
  const mk = (label, slug) => { const b = document.createElement('button'); b.textContent = label; b.setAttribute('aria-pressed', 'false');
    b.onclick = () => { tabs.querySelectorAll('button').forEach(x => { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); }); b.classList.add('active'); b.setAttribute('aria-pressed', 'true'); render(slug); }; tabs.appendChild(b); return b; };
  const allButton = mk('All', null); allButton.classList.add('active'); allButton.setAttribute('aria-pressed', 'true');
  data.collections.forEach(c => mk(c.title, c.slug));
  render(null);

  // lightbox
  const lb = document.getElementById('lightbox'), img = document.getElementById('lightbox-img'), cap = document.getElementById('caption');
  let cur = 0, returnFocus;
  function show(i) { cur = (i + shown.length) % shown.length; img.src = shown[cur].src; img.alt = shown[cur].title; cap.textContent = `${shown[cur].title} · ${cur + 1} / ${shown.length}`; }
  function open(i) { returnFocus = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; document.querySelectorAll('header, main, footer').forEach(el => el.inert = true); document.getElementById('close').focus(); }
  function close() { lb.hidden = true; document.body.style.overflow = ''; document.querySelectorAll('header, main, footer').forEach(el => el.inert = false); returnFocus?.focus(); }
  document.getElementById('close').onclick = close;
  document.getElementById('prev').onclick = () => show(cur - 1);
  document.getElementById('next').onclick = () => show(cur + 1);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Tab') { const buttons = [...lb.querySelectorAll('button')]; const index = buttons.indexOf(document.activeElement); e.preventDefault(); buttons[(index + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus(); }
    if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') show(cur - 1); else if (e.key === 'ArrowRight') show(cur + 1);
  });
})();
