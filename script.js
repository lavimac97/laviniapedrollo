(async function () {
  document.getElementById('year').textContent = new Date().getFullYear();

  // theme
  const root = document.documentElement;
  try { const t = localStorage.getItem('theme'); if (t) root.dataset.theme = t; } catch (e) {}
  document.getElementById('theme').onclick = () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  };

  // nav
  const nav = document.getElementById('nav');
  document.getElementById('menu').onclick = () => nav.classList.toggle('open');
  nav.addEventListener('click', e => { if (e.target.tagName === 'A') nav.classList.remove('open'); });
  const links = [...nav.querySelectorAll('a')];
  const spy = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-40% 0px -55% 0px' });
  links.forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s) spy.observe(s); });

  // reveal
  const rev = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); rev.unobserve(en.target); } }), { threshold: .12 });
  const watch = el => rev.observe(el);
  document.querySelectorAll('.reveal').forEach(watch);

  // art gallery with tabs
  const data = await (await fetch('art.json', { cache: 'no-store' })).json();
  const tabs = document.getElementById('tabs'), grid = document.getElementById('grid');
  const all = data.collections.flatMap(c => c.images.map(src => ({ src, title: c.title, slug: c.slug })));
  let shown = all;
  function render(filter) {
    shown = filter ? all.filter(i => i.slug === filter) : all;
    grid.innerHTML = '';
    shown.forEach((it, idx) => {
      const fig = document.createElement('figure'); fig.className = 'art-card'; fig.tabIndex = 0;
      fig.innerHTML = `<img src="${it.src}" alt="${it.title}"><figcaption>${it.title}</figcaption>`;
      fig.addEventListener('click', () => open(idx));
      fig.addEventListener('keydown', e => { if (e.key === 'Enter') open(idx); });
      grid.appendChild(fig);
    });
  }
  const mk = (label, slug) => { const b = document.createElement('button'); b.textContent = label; b.setAttribute('role', 'tab');
    b.onclick = () => { tabs.querySelectorAll('button').forEach(x => x.classList.remove('active')); b.classList.add('active'); render(slug); }; tabs.appendChild(b); return b; };
  mk('All', null).classList.add('active');
  data.collections.forEach(c => mk(c.title, c.slug));
  render(null);

  // lightbox
  const lb = document.getElementById('lightbox'), img = document.getElementById('lightbox-img'), cap = document.getElementById('caption');
  let cur = 0;
  function show(i) { cur = (i + shown.length) % shown.length; img.src = shown[cur].src; img.alt = shown[cur].title; cap.textContent = `${shown[cur].title} · ${cur + 1} / ${shown.length}`; }
  function open(i) { show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; }
  function close() { lb.hidden = true; document.body.style.overflow = ''; }
  document.getElementById('close').onclick = close;
  document.getElementById('prev').onclick = () => show(cur - 1);
  document.getElementById('next').onclick = () => show(cur + 1);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') show(cur - 1); else if (e.key === 'ArrowRight') show(cur + 1);
  });
})();
