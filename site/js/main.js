/* ==========================================================
   Arulaser — interacción de la página
   ========================================================== */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Marquesina de tecnologías: duplicar para el bucle continuo ---------- */
  const techs = $('.techs__list');
  if (techs) [...techs.children].forEach((li) => { const c = li.cloneNode(true); c.classList.add('dup'); c.setAttribute('aria-hidden', 'true'); techs.append(c); });

  /* ---------- Catálogo ---------- */
  const PRODUCTS = {
    trio: {
      no: 'No. 01', name: 'Aru Trio', tech: 'Diodo · 755 / 808 / 1064 nm', img: 'img/p01.webp',
      desc: 'Plataforma de diodo con tres longitudes de onda combinadas en un mismo disparo. Pensada para cabinas de depilación con mucha agenda: un solo equipo para trabajar todos los fototipos y todas las zonas.',
      specs: ['Tres longitudes de onda combinadas: 755, 808 y 1064 nm', 'Pieza de mano con ventana de zafiro refrigerada', 'Pantalla táctil con protocolos por fototipo y zona', 'Formato torre con ruedas ocultas'],
    },
    compact: {
      no: 'No. 02', name: 'Aru Compact', tech: 'Diodo · 808 nm', img: 'img/p02.webp', tag: 'Nuevo',
      desc: 'Diodo de sobremesa para centros que empiezan con el láser o necesitan una segunda cabina. Todo el protocolo de depilación en un formato que cabe en cualquier espacio.',
      specs: ['Formato sobremesa, fácil de mover entre cabinas', 'Pieza de mano con punta de zafiro', 'Interfaz táctil frontal con modos guiados', 'Ideal como primer equipo o cabina de apoyo'],
    },
    alex: {
      no: 'No. 03', name: 'Aru Alex 755', tech: 'Alejandrita · 755 nm', img: 'img/p03.webp',
      desc: 'Láser de alejandrita para vello fino y claro en fototipos bajos, con pieza de mano de spot redondo y refrigeración integrada.',
      specs: ['Longitud de onda de 755 nm', 'Pieza de mano de spot redondo', 'Refrigeración integrada en la pieza de mano', 'Mueble con ruedas y soporte lateral'],
    },
    ipl: {
      no: 'No. 04', name: 'Aru IPL·SHR', tech: 'Luz pulsada · SHR', img: 'img/p04.webp',
      desc: 'Luz pulsada intensa con modo SHR de barrido para depilación progresiva y fotorrejuvenecimiento. Dos piezas de mano en el mismo equipo.',
      specs: ['Dos piezas de mano con cristal guía de luz', 'Modo SHR de barrido', 'Filtros para depilación y fotorrejuvenecimiento', 'Consola sobre pedestal'],
    },
    pico: {
      no: 'No. 05', name: 'Aru Pico', tech: 'Picosegundo', img: 'img/p05.webp',
      desc: 'Láser de picosegundos para eliminación de tatuajes y pigmento. Brazo articulado de siete articulaciones para llegar a cualquier zona sin forzar la postura.',
      specs: ['Pulsos en el rango de los picosegundos', 'Brazo articulado de siete articulaciones', 'Indicado para tatuajes multicolor y lesiones pigmentadas', 'Pantalla táctil con parámetros guardables'],
    },
    qs: {
      no: 'No. 06', name: 'Aru Q-Switch', tech: 'Nd:YAG · 1064 / 532 nm', img: 'img/p06.webp',
      desc: 'Nd:YAG Q-Switched para tatuajes, manchas y carbon peel. Pieza de mano con zoom para ajustar el spot sin cambiar de cabezal.',
      specs: ['Longitudes de onda de 1064 y 532 nm', 'Pieza de mano con zoom de spot', 'Protocolos de carbon peel', 'Mueble compacto con ruedas'],
    },
    co2: {
      no: 'No. 07', name: 'Aru CO₂ Fraccional', tech: 'CO₂ · 10.600 nm', img: 'img/p07.webp',
      desc: 'CO₂ fraccionado con escáner para resurfacing, textura y cicatrices. Brazo de espejos articulado y patrones de escaneo configurables.',
      specs: ['Longitud de onda de 10.600 nm', 'Escáner con patrones configurables', 'Brazo articulado de espejos', 'Indicado para textura, poros y cicatrices'],
    },
    vascular: {
      no: 'No. 08', name: 'Aru Vascular 980', tech: 'Diodo · 980 nm', img: 'img/p08.webp', tag: 'Nuevo',
      desc: 'Diodo de 980 nm de sobremesa para arañas vasculares y lesiones vasculares finas. Pieza de mano tipo lápiz con fibra para trabajar con precisión.',
      specs: ['Longitud de onda de 980 nm', 'Pieza de mano tipo lápiz con fibra', 'Formato sobremesa', 'Indicado para arañas vasculares y puntos rubí'],
    },
  };

  const card = (id) => {
    const p = PRODUCTS[id];
    return `<button type="button" class="pcard reveal" data-product="${id}" aria-label="${p.name}, ver ficha">
      <span class="pcard__img"><img src="${p.img}" alt="${p.name}, equipo láser profesional" loading="lazy" width="1000" height="1250"></span>
      <span class="pcard__meta"><span>${p.no} ${p.name}${p.tag ? `<em class="pcard__tag">${p.tag}</em>` : ''}</span><span>${p.tech}</span></span>
    </button>`;
  };
  $$('[data-products]').forEach((el) => { el.innerHTML = el.dataset.products.split(',').map(card).join(''); });

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
    $('#ps-tech').textContent = p.tech;
    $('#ps-desc').textContent = p.desc;
    $('#ps-specs').innerHTML = p.specs.map((s) => `<li>${s}</li>`).join('');
    openDialog(sheet);
  };
  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-product]');
    if (c) openProduct(c.dataset.product);
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

  /* ---------- Carrusel ---------- */
  const car = $('.carousel');
  const arrows = $$('.arrow');
  const step = () => { const c = car.querySelector('.ccard'); return c.getBoundingClientRect().width + 16; };
  arrows.forEach((a) => a.addEventListener('click', () => car.scrollBy({ left: step() * Number(a.dataset.dir), behavior: 'smooth' })));
  const syncArrows = () => {
    arrows[0].classList.toggle('is-on', car.scrollLeft > 4);
    arrows[1].classList.toggle('is-on', car.scrollLeft + car.clientWidth < car.scrollWidth - 4);
  };
  car.addEventListener('scroll', syncArrows, { passive: true }); syncArrows();

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
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
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
    const progress = () => {
      const r = scrolly.getBoundingClientRect();
      const run = r.height - innerHeight;
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
    trio: 'Tres longitudes de onda en un mismo equipo: atiendes todos los fototipos y zonas sin cambiar de máquina, ideal para una agenda llena.',
    compact: 'Formato de sobremesa que se mueve contigo: depilación láser completa en cualquier cabina, sin ocupar espacio fijo.',
    ipl: 'Luz pulsada con dos piezas de mano: depilación y fotorrejuvenecimiento en el mismo equipo, perfecto para sumar servicios.',
    pico: 'Pulsos de picosegundos para tatuajes y pigmento con el nivel de control que pide una consulta médica.',
    qs: 'Q-Switch versátil para manchas, tatuajes y carbon peel: el tratamiento de pigmento más fácil de incorporar en un centro estético.',
    co2: 'CO₂ fraccionado para textura, poros y cicatrices, con escáner configurable para cada indicación.',
    vascular: 'Diodo de 980 nm de sobremesa, preciso y compacto, para arañas vasculares y lesiones vasculares finas.',
  };
  const recommend = ({ trat, centro, uso }) => {
    const medical = centro === 'clinica' || centro === 'derma';
    if (trat === 'depilacion') return uso === 'movil' || centro === 'spa' ? ['compact', 'trio'] : uso === 'varias' ? ['trio', 'compact'] : ['trio', 'alex'];
    if (trat === 'pigmento') return medical ? ['pico', 'qs'] : ['qs', 'pico'];
    if (trat === 'rejuv') return medical ? ['co2', 'ipl'] : ['ipl', 'co2'];
    return ['vascular', medical ? 'qs' : 'ipl'];
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
      $('#qr-tech').textContent = rec.tech;
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
    } finally { delete form.dataset.busy; }
  };

  const contact = $('#form-contacto');
  contact.addEventListener('submit', (e) => {
    e.preventDefault();
    let bad = null;
    $$('[required]', contact).forEach((f) => {
      const wrap = f.closest('.field, .check');
      const invalid = f.type === 'checkbox' ? !f.checked : !f.value.trim() || !f.checkValidity();
      wrap.classList.toggle('is-bad', invalid);
      if (invalid && !bad) bad = f;
    });
    const st = $('.form__status', contact);
    if (bad) { st.className = 'form__status err'; st.textContent = 'Revisa los campos marcados.'; bad.focus(); return; }
    send(contact, st, 'Gracias. Hemos recibido tu solicitud y te contactaremos en breve.');
  });
  contact.addEventListener('input', (e) => e.target.closest('.is-bad')?.classList.remove('is-bad'));

  const news = $('.news');
  news.addEventListener('submit', (e) => {
    e.preventDefault();
    const st = $('.news__status');
    if (!news.email.value.trim() || !news.email.checkValidity()) { st.className = 'news__status err'; st.textContent = 'Introduce un email válido.'; return; }
    send(news, st, 'Listo. Te avisaremos de las novedades.');
  });
})();
