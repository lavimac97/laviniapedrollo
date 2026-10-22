(async function () {
  document.getElementById('year').textContent = new Date().getFullYear();
  const nav = document.getElementById('nav');
  document.getElementById('menu').onclick = () => nav.classList.toggle('open');
  nav.addEventListener('click', e => { if (e.target.tagName === 'A') nav.classList.remove('open'); });

  const data = await (await fetch('art.json', { cache: 'no-store' })).json();
  const root = document.getElementById('collections'), all = [];
  data.collections.forEach(c => {
    const sec = document.createElement('div'); sec.className = 'collection';
    sec.innerHTML = `<h3>${c.title}</h3><div class="grid"></div>`;
    const grid = sec.querySelector('.grid');
    c.images.forEach(src => {
      const idx = all.push({ src, title: c.title }) - 1;
      const fig = document.createElement('figure'); fig.className = 'art-card'; fig.tabIndex = 0;
      fig.innerHTML = `<img src="${src}" alt="${c.title}">`;
      fig.addEventListener('click', () => open(idx));
      fig.addEventListener('keydown', e => { if (e.key === 'Enter') open(idx); });
      grid.appendChild(fig);
    });
    root.appendChild(sec);
  });

  const lb = document.getElementById('lightbox'), img = document.getElementById('lightbox-img'), cap = document.getElementById('caption');
  let cur = 0;
  function show(i) { cur = (i + all.length) % all.length; img.src = all[cur].src; img.alt = all[cur].title; cap.textContent = all[cur].title; }
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
