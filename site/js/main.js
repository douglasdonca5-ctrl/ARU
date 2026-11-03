/* ==========================================================
   Aruesthetics — interacción de la página
   ========================================================== */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Marquesina de tecnologías: duplicar para el bucle continuo ---------- */
  const techs = $('.techs__list');
  if (techs) [...techs.children].forEach((li) => { const c = li.cloneNode(true); c.classList.add('dup'); c.setAttribute('aria-hidden', 'true'); techs.append(c); });

  /* ---------- Catálogo (datos en equipos.js) ---------- */
  const PRODUCTS = window.EQUIPOS || {};
  const CATS = window.CATEGORIAS || {};

  const card = (id) => {
    const p = PRODUCTS[id];
    return `<button type="button" class="pcard reveal" data-product="${id}" aria-label="${p.name}, ver ficha">
      <span class="pcard__img"><img src="${p.img}" alt="${p.name}, equipo de estética profesional" loading="lazy" width="1000" height="1250"></span>
      <span class="pcard__meta"><span>${p.no} ${p.name}${p.tag ? `<em class="pcard__tag">${p.tag}</em>` : ''}</span><span>${p.tech}</span></span>
    </button>`;
  };
  $$('[data-products]').forEach((el) => { el.innerHTML = el.dataset.products.split(',').map(card).join(''); });

  // Catálogo completo con filtros por familia
  const grid = $('#catalogo-grid'), filters = $('.filters');
  if (grid) {
    const ids = Object.keys(PRODUCTS);
    grid.innerHTML = ids.map((id) => card(id).replace('class="pcard reveal"', `class="pcard reveal" data-cat="${PRODUCTS[id].cat}"`)).join('');
    const chip = (key, label, n) => `<button type="button" class="chip" data-filter="${key}" aria-pressed="false">${label} <span>${n}</span></button>`;
    filters.innerHTML = chip('todos', 'Todos', ids.length)
      + Object.entries(CATS).map(([k, label]) => chip(k, label, ids.filter((id) => PRODUCTS[id].cat === k).length)).join('');
    const setFilter = (key) => {
      $$('.chip', filters).forEach((c) => { const on = c.dataset.filter === key; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', String(on)); });
      $$('.pcard', grid).forEach((c) => { c.hidden = key !== 'todos' && c.dataset.cat !== key; if (!c.hidden) c.classList.add('is-in'); });
    };
    setFilter('todos');
    // chips del catálogo y enlaces del resto de la página (pie, destacados)
    document.addEventListener('click', (e) => { const f = e.target.closest('[data-filter]'); if (f) setFilter(f.dataset.filter); });
  }

  const select = $('#equipo-select');
  Object.values(PRODUCTS).forEach((p) => select.insertAdjacentHTML('beforeend', `<option>${p.name}</option>`));

  /* ---------- Diálogos ---------- */
  const openDialog = (d) => { if (!d.open) d.showModal(); document.documentElement.style.overflow = 'hidden'; };
  const closeDialog = (d) => { if (d.open) d.close(); };
  $$('dialog').forEach((d) => {
    d.addEventListener('close', () => { document.documentElement.style.overflow = ''; });
    d.addEventListener('click', (e) => { if (e.target === d) closeDialog(d); });
    $$('[data-close]', d).forEach((b) => b.addEventListener('click', () => closeDialog(d)));
  });

  const goContact = (productName, message) => {
    $$('dialog[open]').forEach(closeDialog);
    if (productName) select.value = productName;
    if (message) $('#form-contacto [name="mensaje"]').value = message;
    $('#contacto').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    setTimeout(() => $('#form-contacto [name="nombre"]').focus({ preventScroll: true }), 700);
  };

  /* ---------- Ficha de producto ---------- */
  const sheet = $('#product-sheet');
  let current = null;
  const openProduct = (id) => {
    const p = PRODUCTS[id]; current = p;
    $('#ps-img').src = p.img; $('#ps-img').alt = p.name;
    $('#ps-no').textContent = p.no;
    $('#ps-name').textContent = p.name;
    $('#ps-tech').textContent = p.techLong || p.tech;
    $('#ps-desc').textContent = p.desc;
    $('#ps-specs').innerHTML = p.ventajas.map((v) => `<li>${v}</li>`).join('');
    $('#ps-ficha-t').innerHTML = p.ficha.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('');
    $('#ps-apl').innerHTML = p.aplicadores ? `<strong>Aplicadores:</strong> ${p.aplicadores}` : '';
    const thumbs = $('#ps-thumbs');
    thumbs.hidden = !p.extra;
    if (p.extra) {
      const fotos = [{ img: p.img, label: p.name }, p.extra];
      thumbs.innerHTML = fotos.map((f, k) => `<button type="button" aria-pressed="${k === 0}" data-src="${f.img}" data-label="${f.label}"><img src="${f.img}" alt="${f.label}"></button>`).join('');
    }
    $('.sheet__info', sheet).scrollTop = 0;
    openDialog(sheet);
  };
  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-product]');
    if (c) openProduct(c.dataset.product);
  });
  $('#ps-thumbs').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    $('#ps-img').src = b.dataset.src; $('#ps-img').alt = b.dataset.label;
    $$('#ps-thumbs button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  });
  $('#ps-demo').addEventListener('click', () => goContact(current.name));
  $('#ps-ficha').addEventListener('click', () => goContact(current.name, `Me gustaría recibir la ficha técnica del ${current.name}.`));

  /* ---------- Menú móvil ---------- */
  const burger = $('.nav__burger'), menu = $('#menu'), nav = $('#nav');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.hidden = !open; nav.classList.toggle('menu-open', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a, button')) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });

  /* ---------- Cabecera: fondo según la sección, se oculta al bajar ---------- */
  const darkSections = $$('[data-nav="dark"]');
  const navLinks = $$('.nav__left a[data-sections]').map((a) => ({ a, els: a.dataset.sections.split(',').map((id) => document.getElementById(id)).filter(Boolean) }));
  let lastY = scrollY, anchorY = scrollY, dir = 0, navTick = false;
  const updateNav = () => {
    navTick = false;
    const y = scrollY, probe = nav.offsetHeight / 2;
    const atTop = y < 8;
    const dark = darkSections.some((sec) => { const r = sec.getBoundingClientRect(); return r.top <= probe && r.bottom > probe; });
    nav.classList.toggle('is-top', atTop);
    nav.classList.toggle('is-dark', !atTop && dark);
    nav.classList.toggle('is-light', !atTop && !dark);
    // dirección acumulada: funciona igual con rueda que con trackpad lento
    const d = y - lastY;
    if (d) { const nd = Math.sign(d); if (nd !== dir) { dir = nd; anchorY = lastY; } }
    if (menu.hidden) {
      if (y <= 320) nav.classList.remove('is-hidden');
      else if (dir > 0 && y - anchorY > 48) nav.classList.add('is-hidden');
      else if (dir < 0 && anchorY - y > 24) nav.classList.remove('is-hidden');
    }
    lastY = y;
    const line = innerHeight * .4;
    navLinks.forEach(({ a, els }) => {
      const on = els.some((el) => { const r = el.getBoundingClientRect(); return r.top <= line && r.bottom > line; });
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  };
  addEventListener('scroll', () => { if (!navTick) { navTick = true; requestAnimationFrame(updateNav); } }, { passive: true });
  addEventListener('resize', updateNav);
  updateNav();

  /* ---------- Privacidad ---------- */
  $$('[data-open-privacy]').forEach((b) => b.addEventListener('click', () => openDialog($('#privacy'))));

  /* ---------- Entradas al hacer scroll ---------- */
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach((el) => (el.closest('.hero') ? setTimeout(() => el.classList.add('is-in'), 80) : io.observe(el)));

  /* ---------- Vídeos diferidos ---------- */
  const vio = new IntersectionObserver((entries) => entries.forEach((en) => {
    const v = en.target;
    if (en.isIntersecting) {
      const s = v.querySelector('source[data-src]');
      if (s) { s.src = s.dataset.src; s.removeAttribute('data-src'); v.load(); }
      if (!reduceMotion) v.play().catch(() => {});
    } else v.pause();
  }), { rootMargin: '200px 0px' });
  $$('.lazy-video').forEach((v) => vio.observe(v));
  const hero = $('.hero__media');
  if (reduceMotion && hero) { hero.removeAttribute('autoplay'); hero.pause(); }

  /* ---------- Acompañamiento: un paso y un medio a la vez ---------- */
  const care = $('.care');
  if (care) {
    const items = $$('.care__list li', care), layers = $$('.care__layer', care), count = $('.care__count b', care);
    const STEP_MS = 7000;
    let at = 0, visible = false, auto = !reduceMotion, timer = null;
    const loadVideo = (v) => { const s = v.querySelector('source[data-src]'); if (s) { s.src = s.dataset.src; s.removeAttribute('data-src'); v.load(); } };
    const syncMedia = () => layers.forEach((l, i) => {
      const v = l.querySelector('video'); if (!v) return;
      if (i === at && visible && !reduceMotion) { loadVideo(v); v.play().catch(() => {}); } else v.pause();
    });
    const schedule = () => {
      clearTimeout(timer);
      care.classList.toggle('is-auto', auto && visible);
      if (auto && visible) timer = setTimeout(() => show((at + 1) % items.length), STEP_MS);
    };
    function show(i) {
      at = i;
      items.forEach((li, k) => { li.classList.toggle('is-on', k === i); $('button', li).setAttribute('aria-expanded', String(k === i)); });
      layers.forEach((l, k) => l.classList.toggle('is-on', k === i));
      count.textContent = String(i + 1).padStart(2, '0');
      // reiniciar la barra de progreso del paso activo
      const bar = $('.care__bar', items[i]); bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
      syncMedia(); schedule();
    }
    care.style.setProperty('--care-t', `${STEP_MS}ms`);
    items.forEach((li, i) => $('button', li).addEventListener('click', () => { auto = false; show(i); }));
    // pausa mientras el usuario lee con el ratón o el teclado dentro de la sección
    const hold = () => { clearTimeout(timer); care.classList.remove('is-auto'); };
    care.addEventListener('mouseenter', hold); care.addEventListener('focusin', hold);
    care.addEventListener('mouseleave', schedule);
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; syncMedia(); schedule(); }, { threshold: .35 }).observe(care);
    show(0);
  }

  /* ---------- Para cada centro: el scroll vertical desplaza las tarjetas en horizontal ----------
     La altura de la sección y el recorrido no dependen de innerHeight: en el móvil la barra
     del navegador cambia innerHeight a mitad de gesto y eso hacía saltar las tarjetas. */
  const centers = $('.centers');
  if (centers) {
    const car = $('.carousel', centers), sticky = $('.centers__sticky', centers);
    const arrows = $$('.arrow', centers), cbar = $('.centers__progress span', centers);
    const sda = window.CSS && CSS.supports('animation-timeline: view()') && CSS.supports('animation-range: contain 0% contain 100%');
    let dist = 0, step = 1, lastW = 0, cTick = false;
    centers.classList.add('is-pinned');
    if (sda) centers.classList.add('is-sdt');

    const hold = () => sticky.offsetHeight * .12;           // igual que --hold: 12svh
    const startY = () => centers.getBoundingClientRect().top + scrollY + hold();
    const progress = () => (dist ? Math.min(1, Math.max(0, (scrollY + 0 - startY()) / dist)) : 0);
    const updateCenters = () => {
      cTick = false;
      const p = progress();
      if (!sda) { car.style.transform = `translate3d(${(-p * dist).toFixed(1)}px, 0, 0)`; cbar.style.transform = `scaleX(${p})`; }
      arrows[0].classList.toggle('is-on', p > .01);
      arrows[1].classList.toggle('is-on', p < .99);
    };
    const measureCenters = () => {
      if (innerWidth === lastW) return;                      // solo cambia con el ancho (giro del móvil)
      lastW = innerWidth;
      const first = car.querySelector('.ccard');
      step = first.getBoundingClientRect().width + parseFloat(getComputedStyle(car).columnGap || '16');
      dist = Math.max(0, car.scrollWidth - sticky.clientWidth);
      centers.style.setProperty('--dist', `${dist}px`);
      updateCenters();
    };
    // Ir a una tarjeta concreta (flechas y gesto horizontal): 1 px vertical = 1 px horizontal
    const goCard = (dir, force) => {
      const f = (scrollY - startY()) / step;
      const last = Math.ceil(dist / step);
      let i = force ? (dir > 0 ? Math.floor(f + .05) + 1 : Math.ceil(f - .05) - 1) : Math.round(f);
      i = Math.max(0, Math.min(last, i));
      scrollTo({ top: Math.round(startY() + Math.min(dist, i * step)), behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    arrows.forEach((a) => a.addEventListener('click', () => goCard(Number(a.dataset.dir), true)));

    // Deslizar el dedo en horizontal sobre las tarjetas también las mueve
    let sx = 0, sy = 0, sScroll = 0, mode = null;
    car.addEventListener('touchstart', (e) => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; sScroll = scrollY; mode = null; }, { passive: true });
    car.addEventListener('touchmove', (e) => {
      const t = e.touches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (!mode && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) mode = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
      if (mode === 'h') { e.preventDefault(); scrollTo({ top: sScroll - dx, behavior: 'instant' }); }
    }, { passive: false });
    car.addEventListener('touchend', (e) => {
      if (mode === 'h') { const dx = e.changedTouches[0].clientX - sx; goCard(dx < 0 ? 1 : -1, Math.abs(dx) > 40); }
      mode = null;
    });

    addEventListener('scroll', () => { if (!cTick) { cTick = true; requestAnimationFrame(updateCenters); } }, { passive: true });
    addEventListener('resize', measureCenters);
    addEventListener('load', () => { lastW = 0; measureCenters(); });
    measureCenters();
  }

  /* ---------- Vídeo scroll (secuencia de fotogramas en canvas) ---------- */
  const scrolly = $('.scrolly');
  if (scrolly) {
    const total = Number(scrolly.dataset.frames) || 0;
    const canvas = $('.scrolly__canvas', scrolly), ctx = canvas.getContext('2d');
    const intro = $('.scrolly__intro', scrolly), steps = $$('.scrolly__steps li', scrolly);
    const bar = $('.scrolly__progress span', scrolly);
    const dir = innerWidth < 768 ? 'm' : 'd';
    const focusX = dir === 'm' ? .5 : .52; // los fotogramas móviles ya vienen recortados en vertical
    const frames = new Array(total);
    let target = 0, shown = -1, smooth = 0, ticking = false;

    const src = (i) => `frames/${dir}/${String(i + 1).padStart(4, '0')}.webp`;
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (w === canvas.width && h === canvas.height) return;
      canvas.width = w; canvas.height = h;
      shown = -1; draw();
    };
    const nearest = (i) => {
      for (let d = 0; d < total; d++) {
        if (frames[i - d]?.complete && frames[i - d].naturalWidth) return frames[i - d];
        if (frames[i + d]?.complete && frames[i + d].naturalWidth) return frames[i + d];
      }
      return null;
    };
    function draw() {
      if (!total) return;
      const i = Math.max(0, Math.min(total - 1, Math.round(smooth)));
      const img = nearest(i);
      if (!img || i === shown) return;
      shown = i;
      const cw = canvas.width, ch = canvas.height, iw = img.naturalWidth, ih = img.naturalHeight;
      if (dir === 'm') {
        // Móvil: fotograma vertical a todo el ancho en la parte superior; el texto va debajo
        const w = cw, h = cw * ih / iw;
        ctx.fillStyle = '#0f0d0c'; ctx.fillRect(0, 0, cw, ch);
        ctx.drawImage(img, 0, Math.round(ch * .07), w, h);
      } else {
        const s = Math.max(cw / iw, ch / ih), w = iw * s, h = ih * s;
        const x = Math.min(0, Math.max(cw - w, cw / 2 - w * focusX));
        ctx.drawImage(img, x, (ch - h) / 2, w, h);
      }
      scrolly.classList.add('is-ready');
    }
    const stickyBox = $('.scrolly__sticky', scrolly);
    const progress = () => {
      const r = scrolly.getBoundingClientRect();
      const run = r.height - stickyBox.offsetHeight;
      return Math.max(0, Math.min(1, -r.top / run));
    };
    const loop = () => {
      smooth += (target - smooth) * (reduceMotion ? 1 : .22);
      if (Math.abs(target - smooth) < .05) smooth = target;
      draw();
      if (smooth !== target) requestAnimationFrame(loop); else ticking = false;
    };
    const onScroll = () => {
      const p = progress();
      target = p * (total - 1);
      bar.style.transform = `scaleX(${p})`;
      intro.classList.toggle('is-out', p > .14);
      steps.forEach((li) => li.classList.toggle('is-on', p >= Number(li.dataset.from) && p < Number(li.dataset.to)));
      if (!ticking) { ticking = true; requestAnimationFrame(loop); }
    };

    if (total) {
      // Primero el fotograma inicial, después el resto en paralelo limitado
      const load = (i) => new Promise((res) => { const im = new Image(); im.decoding = 'async'; im.onload = im.onerror = () => res(); im.src = src(i); frames[i] = im; });
      const queue = [...Array(total).keys()];
      const order = [queue.shift(), queue.pop(), ...queue.filter((i) => i % 8 === 0), ...queue.filter((i) => i % 8 !== 0)];
      const start = () => {
        let k = 0;
        const worker = async () => { while (k < order.length) { const i = order[k++]; await load(i); if (Math.abs(i - Math.round(smooth)) < 8) { shown = -1; draw(); } } };
        load(order[k++]).then(() => { size(); for (let w = 0; w < 6; w++) worker(); });
      };
      // Empezar a cargar cuando la sección se acerca
      const pre = new IntersectionObserver((en) => { if (en[0].isIntersecting) { pre.disconnect(); start(); } }, { rootMargin: '150% 0px' });
      pre.observe(scrolly);
      addEventListener('resize', size);
    }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Quiz ---------- */
  const quiz = $('#quiz');
  const qSteps = $$('.quiz__step', quiz), qBar = $('.quiz__bar span', quiz);
  const back = $('#quiz-back'), restart = $('#quiz-restart');
  let ans = {}, at = 0, rec = null;

  const WHY = {
    hidl: 'Tres longitudes de onda (755, 808 y 1064 nm) en un mismo diodo: atiendes todos los fototipos y zonas sin cambiar de equipo, con análisis del vello incluido.',
    dpl: 'Depilación DPL y, con sus nueve filtros, tratamientos de cuidado de la piel en el mismo equipo: ideal para sumar servicios.',
    pico500: 'Picosegundos de 500 ps con brazo coreano de 7 articulaciones, para tatuajes, melasma y carbon peel con el control que pide una consulta médica.',
    pico3: 'Tres modos Nd:YAG en uno: picosegundo para tatuajes y pigmento, pulso largo para depilación y vascular, y Genesis para rejuvenecer.',
    co2: 'CO₂ fraccional de 40 W con modos continuo, fraccional y ultra para resurfacing, y cabezales para ginecología.',
    erbio: 'Erbio de 2940 nm para resurfacing ligero o completo y lesiones pigmentadas benignas.',
    tulio: 'Tulio de 1927 nm, ablativo y no ablativo, para tono, melasma, poros y textura, sin consumibles en la fibra.',
    pinxel: 'Microagujas con radiofrecuencia monopolar y bipolar, de 0,4 a 4 mm, con vacío automático.',
    patrixr: 'Radiofrecuencia multidimensional: varias profundidades y energías en una sola pasada, con control de impedancia.',
    magshape: 'HI-EMT con radiofrecuencia para músculo y grasa en la misma sesión, con silla opcional para suelo pélvico.',
    cryo: 'Criolipólisis de 360° con cinco aplicadores para trabajar varias zonas con un solo equipo.',
    megashape: 'Vacío, radiofrecuencia, cavitación y 940 nm en una sola plataforma corporal.',
  };
  const recommend = ({ trat, centro, uso }) => {
    const medical = centro === 'clinica' || centro === 'derma';
    if (trat === 'depilacion') return centro === 'spa' ? ['dpl', 'hidl'] : ['hidl', 'dpl'];
    if (trat === 'pigmento') return medical ? ['pico500', 'pico3'] : ['pico3', 'pico500'];
    if (trat === 'rejuv') return centro === 'clinica' ? ['co2', 'erbio'] : centro === 'derma' ? ['erbio', 'tulio'] : centro === 'spa' ? ['pinxel', 'patrixr'] : ['tulio', 'patrixr'];
    return uso === 'volumen' ? ['magshape', 'cryo'] : uso === 'varias' ? ['cryo', 'megashape'] : ['megashape', 'cryo'];
  };
  const show = (n) => {
    at = n;
    qSteps.forEach((s) => s.classList.toggle('is-on', Number(s.dataset.step) === n));
    qBar.style.width = `${Math.min(100, (n / 4) * 100)}%`;
    back.hidden = n === 0 || n >= 3;
    restart.hidden = n < 4;
  };
  const resetQuiz = () => { ans = {}; $$('.opts button', quiz).forEach((b) => b.classList.remove('is-sel')); show(0); };
  $$('[data-open-quiz]').forEach((b) => b.addEventListener('click', () => { resetQuiz(); openDialog(quiz); }));
  $$('.opts', quiz).forEach((group) => group.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', group).forEach((x) => x.classList.toggle('is-sel', x === b));
    ans[group.dataset.key] = b.dataset.v;
    setTimeout(() => {
      if (at < 2) return show(at + 1);
      show(3);
      const [main, alt] = recommend(ans); rec = PRODUCTS[main];
      $('#qr-img').src = rec.img; $('#qr-img').alt = rec.name;
      $('#qr-name').textContent = rec.name;
      $('#qr-tech').textContent = rec.techLong || rec.tech;
      $('#qr-why').textContent = WHY[main];
      $('#qr-alt').textContent = `También encaja contigo: ${PRODUCTS[alt].name}.`;
      $('#qr-more').onclick = () => { closeDialog(quiz); setTimeout(() => openProduct(main), 50); };
      setTimeout(() => show(4), reduceMotion ? 0 : 1300);
    }, 260);
  }));
  back.addEventListener('click', () => show(Math.max(0, at - 1)));
  restart.addEventListener('click', resetQuiz);
  $('#qr-demo').addEventListener('click', () => goContact(rec.name));

  /* ---------- Formularios ---------- */
  const send = async (form, status, okMsg) => {
    if (form.dataset.busy) return;
    form.dataset.busy = '1';
    const btn = $('[type="submit"]', form), label = btn.textContent;
    btn.setAttribute('aria-busy', 'true'); btn.disabled = true; btn.textContent = 'Enviando…';
    status.className = status.className.replace(/\s?(ok|err)/g, '');
    status.textContent = 'Enviando…';
    try {
      const r = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || 'error');
      status.textContent = okMsg; status.classList.add('ok'); form.reset();
    } catch (err) {
      status.textContent = err.message && err.message !== 'error' && err.message !== 'Failed to fetch' ? err.message : 'No se ha podido enviar. Inténtalo de nuevo en unos minutos.';
      status.classList.add('err');
    } finally { delete form.dataset.busy; btn.removeAttribute('aria-busy'); btn.disabled = false; btn.textContent = label; }
  };

  const contact = $('#form-contacto');
  // Mensaje de error debajo de cada campo, anunciado por lectores de pantalla
  const check = (f) => {
    const wrap = f.closest('.field, .check');
    const invalid = f.type === 'checkbox' ? !f.checked : !f.value.trim() || !f.checkValidity();
    let msg = $('.field__msg', wrap);
    if (!msg) { msg = document.createElement('small'); msg.className = 'field__msg'; msg.id = `err-${f.name}`; wrap.append(msg); }
    wrap.classList.toggle('is-bad', invalid);
    f.setAttribute('aria-invalid', String(invalid));
    if (invalid) { msg.textContent = f.dataset.msg || 'Revisa este campo.'; f.setAttribute('aria-describedby', msg.id); }
    else { msg.textContent = ''; f.removeAttribute('aria-describedby'); }
    return !invalid;
  };
  $$('[required]', contact).forEach((f) => {
    f.addEventListener('blur', () => { if (f.value || f.dataset.touched) check(f); f.dataset.touched = '1'; });
    f.addEventListener(f.type === 'checkbox' ? 'change' : 'input', () => { if (f.closest('.is-bad')) check(f); });
  });
  contact.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = $$('[required]', contact).filter((f) => !check(f));
    const st = $('.form__status', contact);
    if (bad.length) { st.className = 'form__status err'; st.textContent = bad.length === 1 ? 'Revisa el campo marcado.' : `Revisa los ${bad.length} campos marcados.`; bad[0].focus(); return; }
    send(contact, st, 'Gracias. Hemos recibido tu solicitud y te contactaremos en breve.');
  });

  const news = $('.news');
  news.addEventListener('submit', (e) => {
    e.preventDefault();
    const st = $('.news__status');
    if (!news.email.value.trim() || !news.email.checkValidity()) { st.className = 'news__status err'; st.textContent = 'Introduce un email válido.'; return; }
    send(news, st, 'Listo. Te avisaremos de las novedades.');
  });
})();
