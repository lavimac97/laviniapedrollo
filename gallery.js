(async () => {
  const grid = document.getElementById('grid');
  const tabs = document.getElementById('tabs');
  const status = document.getElementById('gallery-status');
  const rail = document.getElementById('collection-rail');
  const descriptions = {
    'da-vinci-just-dots': ['Da Vinci', 'Just dots', 'A closer look at faces, built one mark at a time.'],
    'naruto-skate-edition': ['Naruto', 'Skate edition', 'An imagined world finds a new canvas: a skateboard.'],
    'abstract-playing-with-the-forest': ['Abstract', 'Playing with the forest', 'Color, texture, and a little room to get lost.'],
    'lost-a-snake-s-odyssey': ['Lost', 'A snake’s odyssey', 'Follow the line into an intricate, imagined world.'],
    'portrait-dots-again': ['Portrait', 'Dots again?', 'Back to the face. Back to the smallest marks.']
  };
  let data;
  try {
    const response = await fetch('art.json');
    if (!response.ok) throw Error();
    data = await response.json();
  } catch {
    status.textContent = 'The drawings could not load. Refresh to try again.';
    return;
  }
  const all = data.collections.flatMap((collection, c) => collection.images.map((src, i) => ({src, title:collection.title, slug:collection.slug, number:i + 1, collection:c + 1})));
  const favourite = {src:data.home.favourite, title:'Da Vinci — My favourite', number:1};
  let shown = all, items = all, index = 0, returnFocus, serial = 0;
  const dialog = document.getElementById('lightbox');
  const image = document.getElementById('lightbox-img');
  const stage = document.getElementById('viewer-stage');
  const zoom = document.getElementById('art-zoom');
  const closeButton = document.getElementById('close');
  const previous = document.getElementById('prev'), next = document.getElementById('next');
  const pad = value => String(value).padStart(2, '0');
  function resetZoom() {
    dialog.classList.remove('is-zoomed'); zoom.textContent = 'Zoom in +'; zoom.setAttribute('aria-pressed','false');
    stage.scrollTop = 0; stage.scrollLeft = 0;
  }
  async function show(nextIndex) {
    index = (nextIndex + items.length) % items.length;
    const item = items[index], ticket = ++serial;
    resetZoom();
    document.getElementById('viewer-title').textContent = item.title;
    document.getElementById('caption').textContent = `${pad(index + 1)} / ${pad(items.length)} · Drawing ${pad(item.number)}`;
    document.getElementById('art-original').href = item.src;
    previous.disabled = next.disabled = items.length < 2;
    stage.classList.add('is-loading');
    const loaded = new Image(); loaded.src = item.src;
    try { await loaded.decode(); }
    catch { if (ticket === serial) { stage.classList.remove('is-loading'); document.getElementById('caption').textContent = 'Image could not load. Try Original ↗ or another drawing.'; image.removeAttribute('src'); image.alt = 'Artwork unavailable'; } return; }
    if (ticket !== serial || !dialog.open) return;
    image.src = item.src; image.alt = `${item.title}, drawing ${item.number}`;
    stage.classList.remove('is-loading');
  }
  function open(indexToOpen, selection = shown) {
    returnFocus = document.activeElement;
    items = selection;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    show(indexToOpen);
    closeButton.focus();
  }
  dialog.addEventListener('close', () => {
    ++serial; document.body.style.overflow = ''; resetZoom();
    returnFocus?.focus({preventScroll:true});
  });
  closeButton.onclick = () => dialog.close();
  previous.onclick = () => show(index - 1); next.onclick = () => show(index + 1);
  zoom.onclick = () => {
    const active = dialog.classList.toggle('is-zoomed');
    zoom.textContent = active ? 'Fit to screen −' : 'Zoom in +'; zoom.setAttribute('aria-pressed',String(active));
    if (!active) { stage.scrollTop = 0; stage.scrollLeft = 0; }
  };
  dialog.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' && !dialog.classList.contains('is-zoomed')) { e.preventDefault(); show(index - 1); }
    if (e.key === 'ArrowRight' && !dialog.classList.contains('is-zoomed')) { e.preventDefault(); show(index + 1); }
    if (e.key === 'Home') { e.preventDefault(); show(0); }
    if (e.key === 'End') { e.preventDefault(); show(items.length - 1); }
  });
  let touchStart;
  stage.addEventListener('pointerdown', e => { if (e.pointerType === 'touch' && !dialog.classList.contains('is-zoomed')) touchStart = {x:e.clientX,y:e.clientY}; });
  stage.addEventListener('pointerup', e => {
    if (!touchStart || e.pointerType !== 'touch') return;
    const dx = e.clientX - touchStart.x, dy = e.clientY - touchStart.y; touchStart = null;
    if (Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)*1.5) show(index + (dx<0 ? 1 : -1));
  });
  stage.addEventListener('pointercancel', () => {touchStart = null;});
  function render(slug = '') {
    shown = slug ? all.filter(item => item.slug === slug) : all;
    grid.replaceChildren();
    const collection = data.collections.find(c => c.slug === slug);
    document.getElementById('gallery-title').textContent = collection ? descriptions[slug][0] + ' / ' + descriptions[slug][1] : 'All drawings.';
    document.getElementById('collection-description').textContent = collection ? descriptions[slug][2] : 'Five collections. Eighteen works. Open a drawing and take a closer look.';
    status.textContent = `${pad(shown.length)} ${shown.length === 1 ? 'work' : 'works'} on view`;
    tabs.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.collection === slug)));
    rail.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.collection === slug)));
    shown.forEach((item,i) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'art-card';
      button.setAttribute('aria-label',`View ${item.title}, drawing ${item.number}`);
      const picture = document.createElement('img'); picture.src = item.src; picture.loading = 'lazy'; picture.decoding = 'async'; picture.alt = `${item.title}, drawing ${item.number}`;
      const label = document.createElement('span'); label.className = 'art-card-label';
      const text = document.createElement('span'); text.textContent = descriptions[item.slug][0];
      const number = document.createElement('span'); number.textContent = `${pad(item.collection)} / ${pad(item.number)} ↗`;
      label.append(text,number); button.append(picture,label); button.onclick = () => open(i); grid.append(button);
    });
  }
  function makeFilter(label,slug,count) {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.collection = slug;
    button.textContent = `${label} ${pad(count)}`; button.setAttribute('aria-pressed','false');
    button.onclick = () => render(slug); tabs.append(button);
  }
  makeFilter('All','',all.length);
  data.collections.forEach((collection,i) => {
    const [title,subtitle] = descriptions[collection.slug];
    makeFilter(title,collection.slug,collection.images.length);
    const card = document.createElement('button'); card.type='button'; card.className='collection-card'; card.dataset.collection=collection.slug;
    card.setAttribute('aria-label',`Explore ${collection.title}, ${collection.images.length} ${collection.images.length === 1 ? 'drawing' : 'drawings'}`);
    card.setAttribute('aria-pressed','false');
    const img = document.createElement('img'); img.src=collection.images[collection.images.length-1]; img.alt=''; img.loading='lazy';
    const label = document.createElement('span'); label.className='collection-card-copy';
    const small = document.createElement('span'); small.textContent = `${pad(i+1)} / ${pad(collection.images.length)} WORKS`;
    const heading = document.createElement('strong'); heading.textContent = title;
    const sub = document.createElement('span'); sub.textContent = subtitle+' ↗';
    label.append(small,heading,sub); card.append(img,label);
    card.onclick=()=> { render(collection.slug); document.getElementById('artworks').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}); };
    rail.append(card);
  });
  document.getElementById('featured-art').addEventListener('click', e => { e.preventDefault(); open(0,[favourite,...all]); });
  render();
})();
