/* ==========================================================
   Aruesthetics — botón de WhatsApp y asistente
   Guía al visitante (presupuesto, demostración o consulta),
   le prepara el mensaje y lo abre en WhatsApp. Alternativa:
   «Prefiero que me llaméis», que guarda el pedido en el servidor.
   Sin JavaScript, el botón es un enlace directo a WhatsApp.
   ========================================================== */
(() => {
  'use strict';

  const NUMERO = '34605927468';
  const EQ = window.EQUIPOS || {};
  const CATS = window.CATEGORIAS || {};
  const fab = document.querySelector('.wa-fab');
  if (!fab) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const waUrl = (texto) => `https://wa.me/${NUMERO}?text=${encodeURIComponent(texto)}`;
  const store = { get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* sin almacenamiento */ } } };

  const ICONO_WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
  const ICONO_ENVIAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const LOGO = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="20" cy="20" r="11" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M1.5 20h37" stroke="currentColor" stroke-width="1.6"/><circle cx="20" cy="20" r="3" fill="#e5432d"/></svg>';

  const CENTROS = [
    ['estetica', 'Centro de estética', 'de un centro de estética'],
    ['clinica', 'Clínica médico-estética', 'de una clínica médico-estética'],
    ['spa', 'Spa o wellness', 'de un spa'],
    ['derma', 'Consulta de dermatología', 'de una consulta de dermatología'],
    ['nuevo', 'Estoy abriendo mi centro', 'y estoy abriendo mi centro'],
  ];

  /* ---------- Panel ---------- */
  const panel = document.createElement('section');
  panel.className = 'chat';
  panel.id = 'chat';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'chat-t');
  panel.innerHTML = `
    <div class="chat__head">
      <span class="chat__avatar">${LOGO}</span>
      <div class="chat__who">
        <h2 class="chat__t" id="chat-t">Aruesthetics</h2>
        <p class="chat__s">Asistente · L–V, 9–14&nbsp;h y 15–19&nbsp;h</p>
      </div>
      <button type="button" class="chat__close" aria-label="Cerrar el asistente"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
    </div>
    <div class="chat__log" aria-live="polite"></div>
    <div class="chat__input" hidden></div>
    <p class="chat__legal">Al escribirnos aceptas la <button type="button" class="linklike u" data-chat-privacy>política de privacidad</button>.</p>`;
  const zona = fab.closest('.wa') || document.body;
  zona.append(panel);
  const log = panel.querySelector('.chat__log');
  const inputBox = panel.querySelector('.chat__input');

  /* ---------- Piezas de la conversación ---------- */
  let run = 0;          // cada conversación nueva invalida la anterior
  let s = {};           // respuestas: motivo, equipo, cat, centro, provincia, nombre, texto, telefono
  const nunca = () => new Promise(() => {});
  const bajar = () => { log.scrollTop = log.scrollHeight; };

  const say = (html, who = 'bot', extra = '') => {
    const b = document.createElement('div');
    b.className = `msg msg--${who} ${extra}`.trim();
    b.innerHTML = html;
    log.append(b); bajar();
    return b;
  };
  const bot = async (html) => {
    const t = run;
    if (!reduce) {
      const dots = say('<span class="dots" aria-label="Escribiendo"><i></i><i></i><i></i></span>', 'bot', 'msg--typing');
      await wait(Math.min(900, 380 + html.length * 6));
      dots.remove();
    }
    if (t !== run) return nunca();
    say(html);
  };
  const choices = (opts) => new Promise((res) => {
    const box = document.createElement('div');
    box.className = 'chat__chips';
    opts.forEach(([v, label]) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chat__chip'; b.textContent = label;
      b.addEventListener('click', () => { box.remove(); say(esc(label), 'me'); res(v); });
      box.append(b);
    });
    log.append(box); bajar();
    box.querySelector('button')?.focus({ preventScroll: true });
  });
  const ask = ({ label, placeholder = label, type = 'text', autocomplete = 'off', optional = false, multiline = false, check }) => new Promise((res) => {
    inputBox.hidden = false;
    const campo = multiline
      ? `<textarea id="chat-in" rows="3" placeholder="${placeholder}" maxlength="1000"></textarea>`
      : `<input id="chat-in" type="${type}" placeholder="${placeholder}" autocomplete="${autocomplete}" maxlength="120"${type === 'tel' ? ' inputmode="tel"' : ''}>`;
    inputBox.innerHTML = `
      <form class="chat__form" novalidate>
        <label class="sr" for="chat-in">${label}</label>${campo}
        <button type="submit" class="chat__send" aria-label="Enviar">${ICONO_ENVIAR}</button>
      </form>
      <p class="chat__err" role="alert"></p>
      ${optional ? '<button type="button" class="linklike chat__skip">Prefiero no decirlo</button>' : ''}`;
    const form = inputBox.querySelector('form'), field = inputBox.querySelector('#chat-in'), err = inputBox.querySelector('.chat__err');
    const done = (value) => { inputBox.hidden = true; inputBox.innerHTML = ''; if (value) say(esc(value).replace(/\n/g, '<br>'), 'me'); res(value); };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = field.value.trim();
      const problema = !v ? (optional ? '' : 'Escribe una respuesta para seguir.') : (check ? check(v) : '');
      if (!v && optional) return done('');
      if (problema) { err.textContent = problema; field.setAttribute('aria-invalid', 'true'); field.focus(); return; }
      done(v);
    });
    if (multiline) field.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
    inputBox.querySelector('.chat__skip')?.addEventListener('click', () => done(''));
    field.focus({ preventScroll: true });
  });

  /* ---------- Horario de atención (lunes a viernes, 9–14 y 15–19, hora de Madrid) ---------- */
  const HORARIO = 'de lunes a viernes, de 9:00 a 14:00 y de 15:00 a 19:00';
  const madrid = () => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date()).map((x) => [x.type, x.value]));
    return { d: { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }[p.weekday], m: +p.hour * 60 + +p.minute };
  };
  const abierto = () => { const { d, m } = madrid(); return d <= 5 && ((m >= 540 && m < 840) || (m >= 900 && m < 1140)); };
  const diaSiguiente = () => { const { d, m } = madrid(); return d <= 5 && m < 1140 ? 'hoy' : d <= 4 ? 'mañana' : 'el lunes'; };
  const proximo = () => {
    const { d, m } = madrid();
    if (d <= 5 && m < 540) return 'hoy a partir de las 9:00';
    if (d <= 5 && m >= 840 && m < 900) return 'hoy a partir de las 15:00';
    return d <= 4 ? 'mañana a partir de las 9:00' : 'el lunes a partir de las 9:00';
  };

  /* ---------- Opciones ---------- */
  const MOTIVOS = { presupuesto: 'Presupuesto', demo: 'Demostración', otra: 'Consulta' };
  const EXPERIENCIA = [['primero', 'No, sería el primero', 'Sería nuestro primer equipo de este tipo.'], ['ampliar', 'Sí, y queremos ampliar', 'Ya trabajamos con equipos de este tipo y queremos ampliar.'], ['renovar', 'Sí, y queremos renovarlo', 'Queremos renovar el equipo que tenemos.']];
  const PLAZOS = [['ya', 'Lo antes posible', 'Lo necesitaría lo antes posible.'], ['pronto', 'En 1–3 meses', 'Lo necesitaría en los próximos 1–3 meses.'], ['info', 'Más adelante, me estoy informando', '']];
  const FRANJAS = [['manana', 'Por la mañana (9–14 h)', ' por la mañana'], ['tarde', 'Por la tarde (15–19 h)', ' por la tarde'], ['igual', 'Me da igual', '']];
  const de = (lista, k, i = 1) => (lista.find((x) => x[0] === k) || [])[i] || '';
  const okTel = (v) => { const d = v.replace(/\D/g, ''); return d.length < 9 || d.length > 15 ? 'Revisa el teléfono: debe tener al menos 9 cifras.' : ''; };
  const okEmail = (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Revisa el email, por ejemplo nombre@centro.es.');

  // Ficha mínima del equipo dentro de la conversación
  const tarjeta = (id) => {
    const e = EQ[id]; if (!e) return '';
    return `<span class="msg__eq"><img src="${e.img}" alt="" width="56" height="70" loading="lazy"><span><strong>${esc(e.name)}</strong><span>${esc(e.techLong || e.tech)}</span></span></span>`
      + `<span class="msg__list">${e.ventajas.slice(0, 2).map((v) => `<span>${esc(v)}</span>`).join('')}</span>`;
  };

  /* ---------- Mensaje para WhatsApp ---------- */
  const mensaje = () => {
    const centro = CENTROS.find((c) => c[0] === s.centro);
    const quien = `Soy ${s.nombre}${centro ? `, ${centro[2]}` : ''}${s.provincia ? ` (${s.provincia})` : ''}.`;
    const equipo = s.equipo ? `del ${EQ[s.equipo].name}` : s.cat ? `de equipos de ${CATS[s.cat].toLowerCase()}` : '';
    const pide = {
      presupuesto: equipo ? `Me gustaría recibir un presupuesto ${equipo}.` : 'Me gustaría recibir un presupuesto y que me asesoréis sobre qué equipo me conviene.',
      demo: equipo ? `Me gustaría organizar una demostración ${equipo} en mi centro.` : 'Me gustaría organizar una demostración en mi centro y que me asesoréis sobre qué equipo me conviene.',
    }[s.motivo] || s.texto || '';
    const lineas = [`Hola, Aruesthetics. ${quien}`, pide];
    if (s.experiencia && s.centro !== 'nuevo') lineas.push(de(EXPERIENCIA, s.experiencia, 2));
    if (s.plazo) lineas.push(de(PLAZOS, s.plazo, 2));
    if (s.financiacion === 'si') lineas.push('Me interesa información sobre financiación o renting.');
    lineas.push('(Desde aruesthetics.es)');
    return lineas.filter(Boolean).join('\n');
  };

  /* ---------- Guardar el contacto ---------- */
  const datosContacto = (canal) => {
    const fd = new FormData();
    Object.entries({
      tipo: 'asistente', canal, web: '', privacidad: canal === 'whatsapp' ? '' : 'on',
      motivo: MOTIVOS[s.motivo] || '', equipo: s.equipo ? EQ[s.equipo].name : (s.cat ? CATS[s.cat] : ''),
      centro: de(CENTROS, s.centro), experiencia: de(EXPERIENCIA, s.experiencia), plazo: de(PLAZOS, s.plazo),
      financiacion: { si: 'Sí, quiere información', no: 'No' }[s.financiacion] || '',
      provincia: s.provincia || '', nombre: s.nombre || '', telefono: s.telefono || '', franja: de(FRANJAS, s.franja), email: s.email || '',
      mensaje: mensaje(),
    }).forEach(([k, v]) => fd.append(k, v));
    return fd;
  };
  // Al abrir WhatsApp la página puede quedar en segundo plano: sendBeacon llega igualmente
  const avisarWhatsApp = () => {
    const fd = datosContacto('whatsapp');
    if (!(navigator.sendBeacon && navigator.sendBeacon('enviar.php', fd))) fetch('enviar.php', { method: 'POST', body: fd, keepalive: true }).catch(() => {});
  };
  const enviarContacto = async (canal) => {
    try {
      const r = await fetch('enviar.php', { method: 'POST', body: datosContacto(canal), headers: { Accept: 'application/json' } });
      const j = await r.json().catch(() => ({}));
      return { ok: r.ok && j.ok, error: j.error || '' };
    } catch { return { ok: false, error: '' }; }
  };
  const consentir = (label) => new Promise((res) => {
    inputBox.hidden = false;
    inputBox.innerHTML = `
      <form class="chat__consent" novalidate>
        <label class="check"><input type="checkbox" id="chat-ok"> <span>Acepto la <button type="button" class="linklike u" data-chat-privacy>política de privacidad</button>.</span></label>
        <button type="submit" class="btn btn--ink chat__submit">${label}</button>
      </form>
      <p class="chat__err" role="alert"></p>`;
    const f = inputBox.querySelector('form'), ok = inputBox.querySelector('#chat-ok'), err = inputBox.querySelector('.chat__err');
    ok.focus({ preventScroll: true });
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!ok.checked) { err.textContent = 'Marca la casilla para poder enviarla.'; ok.focus(); return; }
      const btn = f.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = 'Enviando…';
      res(() => { inputBox.hidden = true; inputBox.innerHTML = ''; });
    });
  });
  const otraVez = async () => { const v = await choices([['otra', 'Hacer otra consulta']]); if (v) flujo(); };

  /* ---------- Conversación ---------- */
  async function flujo(pre = {}) {
    run += 1;
    log.innerHTML = ''; inputBox.hidden = true; inputBox.innerHTML = '';
    s = { ...pre };
    const eq = s.equipo && EQ[s.equipo];
    if (eq) {
      await bot(`Hola. Veo que te interesa el <strong>${esc(eq.name)}</strong>:${tarjeta(s.equipo)}¿Qué necesitas?`);
      s.motivo = await choices([['presupuesto', 'Un presupuesto'], ['demo', 'Una demostración en mi centro'], ['otra', 'Tengo otra consulta']]);
    } else {
      await bot('Hola, soy el asistente de Aruesthetics. ¿En qué te podemos ayudar?');
      s.motivo = await choices([['presupuesto', 'Pedir un presupuesto'], ['demo', 'Pedir una demostración'], ['elegir', 'Ayúdame a elegir equipo'], ['otra', 'Otra consulta']]);
    }

    if (s.motivo === 'elegir') {
      await bot('Te hago tres preguntas rápidas y te recomiendo el equipo que mejor encaja con tu centro.');
      await wait(900);
      cerrar(false);
      document.querySelector('.match [data-open-quiz], [data-open-quiz]')?.click();
      return;
    }

    if (s.motivo === 'otra') {
      await bot('Cuéntanos tu consulta.');
      s.texto = await ask({ label: 'Tu consulta', placeholder: 'Escribe tu consulta…', multiline: true });
    } else {
      if (!s.equipo) {
        await bot('¿Qué tipo de equipo te interesa?');
        const c = await choices([...Object.entries(CATS), ['nose', 'Aún no lo sé']]);
        if (c !== 'nose') {
          s.cat = c;
          const ids = Object.keys(EQ).filter((id) => EQ[id].cat === c);
          if (ids.length === 1) s.equipo = ids[0];
          else {
            await bot('¿Cuál de estos?');
            const e = await choices([...ids.map((id) => [id, EQ[id].name]), ['varios', 'Me interesan varios']]);
            if (e !== 'varios') s.equipo = e;
          }
          if (s.equipo) await bot(`Buena elección. Esto es lo principal:${tarjeta(s.equipo)}`);
        }
      }
      await bot('¿Qué tipo de centro tienes?');
      s.centro = await choices(CENTROS.map(([k, label]) => [k, label]));
      if (s.centro !== 'nuevo') {
        await bot('¿Ya trabajáis con algún equipo de este tipo?');
        s.experiencia = await choices(EXPERIENCIA.map(([k, l]) => [k, l]));
      }
      await bot(s.motivo === 'demo' ? '¿Para cuándo te gustaría tenerlo funcionando en tu centro?' : '¿Para cuándo lo necesitarías?');
      s.plazo = await choices(PLAZOS.map(([k, l]) => [k, l]));
      await bot('Ofrecemos financiación y renting para los equipos. ¿Quieres que te informemos?');
      s.financiacion = await choices([['si', 'Sí, me interesa'], ['no', 'No, gracias']]);
      await bot(s.motivo === 'demo' ? '¿En qué provincia está tu centro? Así organizamos la demostración.' : '¿En qué provincia estás?');
      s.provincia = await ask({ label: 'Provincia', placeholder: 'Por ejemplo, Madrid', autocomplete: 'address-level1', optional: true });
    }

    await bot('¿Cómo te llamas?');
    s.nombre = await ask({ label: 'Tu nombre', placeholder: 'Nombre', autocomplete: 'given-name' });
    await bot(`Gracias, ${esc(s.nombre)}. ¿Cómo prefieres que te contactemos?`);
    s.canal = await choices([['whatsapp', 'Por WhatsApp'], ['llamada', 'Que me llaméis'], ['email', 'Por email']]);
    if (s.canal === 'llamada') return porLlamada();
    if (s.canal === 'email') return porEmail();
    return porWhatsApp();
  }

  async function porWhatsApp() {
    const t = run, texto = mensaje(), url = waUrl(texto);
    await bot('Te hemos preparado el mensaje:');
    if (t !== run) return;
    say(`<p class="msg__label">Mensaje para WhatsApp</p><p>${esc(texto).replace(/\n/g, '<br>')}</p>`, 'bot', 'msg--preview');
    const box = document.createElement('div');
    box.className = 'chat__chips';
    box.innerHTML = `
      <a class="chat__chip chat__chip--wa" href="${url}" target="_blank" rel="noopener">${ICONO_WA}<span>Enviar por WhatsApp</span></a>
      <button type="button" class="chat__chip" data-v="llamada">Mejor que me llaméis</button>
      <button type="button" class="chat__chip chat__chip--link" data-v="otra">Empezar de nuevo</button>`;
    log.append(box); bajar();
    box.querySelector('a').focus({ preventScroll: true });
    box.addEventListener('click', async (e) => {
      const a = e.target.closest('a, button'); if (!a) return;
      box.remove();
      if (a.tagName === 'A') {
        avisarWhatsApp();
        say('Enviar por WhatsApp', 'me');
        const cuando = abierto() ? 'Estamos en horario de atención, así que te contestamos pronto.' : `Ahora estamos fuera de horario: te contestamos ${proximo()}.`;
        await bot(`Hemos abierto WhatsApp con tu mensaje: solo tienes que pulsar <strong>Enviar</strong>. ${cuando}<br>Si no se ha abierto, <a href="${url}" target="_blank" rel="noopener">pulsa aquí</a>.`);
        otraVez();
      } else if (a.dataset.v === 'llamada') {
        say('Mejor que me llaméis', 'me');
        s.canal = 'llamada';
        porLlamada();
      } else {
        say('Empezar de nuevo', 'me');
        flujo();
      }
    });
  }

  async function porLlamada() {
    await bot('¿A qué teléfono te llamamos?');
    s.telefono = await ask({ label: 'Teléfono', placeholder: '600 000 000', type: 'tel', autocomplete: 'tel', check: okTel });
    await bot(`¿Cuándo te viene mejor? Llamamos ${HORARIO}.`);
    s.franja = await choices(FRANJAS.map(([k, l]) => [k, l]));
    await bot('Para guardar tu solicitud necesitamos tu permiso.');
    const t = run, listo = await consentir('Enviar solicitud');
    const r = await enviarContacto('llamada');
    if (t !== run) return;
    listo();
    const fr = de(FRANJAS, s.franja, 2);
    if (r.ok) await bot(abierto()
      ? `Recibido, ${esc(s.nombre)}. Te llamaremos${fr || ' lo antes posible'} al ${esc(s.telefono)}.`
      : `Recibido, ${esc(s.nombre)}. Ahora estamos fuera de horario: te llamaremos al ${esc(s.telefono)} ${diaSiguiente()}${fr}.`);
    else await bot(`${r.error ? esc(r.error) : 'No hemos podido guardar tu solicitud.'} Si lo prefieres, <a href="${waUrl(mensaje())}" target="_blank" rel="noopener">escríbenos por WhatsApp</a>.`);
    otraVez();
  }

  async function porEmail() {
    await bot('¿A qué email te escribimos?');
    s.email = await ask({ label: 'Email', placeholder: 'nombre@centro.es', type: 'email', autocomplete: 'email', check: okEmail });
    await bot('¿Nos dejas también un teléfono, por si hay que aclarar algo?');
    s.telefono = await ask({ label: 'Teléfono (opcional)', placeholder: '600 000 000', type: 'tel', autocomplete: 'tel', optional: true, check: okTel });
    await bot('Para guardar tu solicitud necesitamos tu permiso.');
    const t = run, listo = await consentir('Enviar solicitud');
    const r = await enviarContacto('email');
    if (t !== run) return;
    listo();
    const que = s.motivo === 'presupuesto' ? 'con el presupuesto' : s.motivo === 'demo' ? 'para organizar la demostración' : 'con la respuesta';
    if (r.ok) await bot(`Recibido, ${esc(s.nombre)}. Te escribimos a <strong>${esc(s.email)}</strong> ${que}${abierto() ? ' lo antes posible' : `, ${proximo()}`}.`);
    else await bot(`${r.error ? esc(r.error) : 'No hemos podido guardar tu solicitud.'} Si lo prefieres, <a href="${waUrl(mensaje())}" target="_blank" rel="noopener">escríbenos por WhatsApp</a>.`);
    otraVez();
  }

  /* ---------- Abrir y cerrar ---------- */
  function abrir(pre) {
    document.querySelectorAll('dialog[open]').forEach((d) => d.close());
    teaserFuera();
    panel.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
    document.body.classList.add('chat-open');
    requestAnimationFrame(() => panel.classList.add('is-open'));
    if (pre || !log.children.length) flujo(pre || {});
    else (panel.querySelector('.chat__input:not([hidden]) input, .chat__input:not([hidden]) textarea, .chat__chips > *') || panel.querySelector('.chat__close')).focus({ preventScroll: true });
  }
  function cerrar(devolverFoco = true) {
    panel.classList.remove('is-open');
    fab.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('chat-open');
    setTimeout(() => { if (!panel.classList.contains('is-open')) panel.hidden = true; }, reduce ? 0 : 220);
    if (devolverFoco) fab.focus({ preventScroll: true });
  }
  fab.setAttribute('aria-controls', 'chat');
  fab.setAttribute('aria-expanded', 'false');
  fab.addEventListener('click', (e) => { e.preventDefault(); panel.hidden ? abrir() : cerrar(); });
  panel.querySelector('.chat__close').addEventListener('click', () => cerrar());
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
  panel.addEventListener('click', (e) => { if (e.target.closest('[data-chat-privacy]')) document.getElementById('privacy')?.showModal(); });
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-open-chat]');
    if (!t) return;
    e.preventDefault();
    abrir(t.dataset.equipo ? { equipo: t.dataset.equipo } : undefined);
  });
  window.aruChat = { open: (pre) => abrir(pre || {}) };

  /* ---------- Aparición del botón y aviso ---------- */
  const hero = document.querySelector('.hero'), scrolly = document.querySelector('.scrolly');
  let tick = false;
  const ubicar = () => {
    tick = false;
    const pasadoHero = !hero || scrollY > hero.offsetHeight * 0.6;
    const r = scrolly && scrolly.getBoundingClientRect();
    const enScrolly = r && r.top < 0 && r.bottom > innerHeight;
    fab.classList.toggle('is-on', pasadoHero && !enScrolly);
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(ubicar); } }, { passive: true });
  ubicar();

  let teaser = null;
  function teaserFuera() { if (teaser) { teaser.remove(); teaser = null; store.set('aru-teaser', '1'); } }
  const mostrarTeaser = () => {
    if (teaser || store.get('aru-teaser') || !panel.hidden || !fab.classList.contains('is-on')) return;
    teaser = document.createElement('div');
    teaser.className = 'wa-teaser';
    teaser.innerHTML = `<button type="button" class="wa-teaser__txt">¿Te preparamos un <strong>presupuesto</strong> o una <strong>demostración</strong>?</button><button type="button" class="wa-teaser__x" aria-label="Cerrar el aviso">×</button>`;
    teaser.querySelector('.wa-teaser__txt').addEventListener('click', () => abrir());
    teaser.querySelector('.wa-teaser__x').addEventListener('click', teaserFuera);
    zona.append(teaser);
    requestAnimationFrame(() => teaser && teaser.classList.add('is-on'));
  };
  const catalogo = document.querySelector('#catalogo');
  // el catálogo es más alto que la pantalla en el móvil: basta con que su parte de arriba entre en la mitad superior
  if (catalogo) new IntersectionObserver((en, o) => { if (en[0].isIntersecting) { o.disconnect(); setTimeout(mostrarTeaser, 1500); } }, { rootMargin: '0px 0px -50% 0px' }).observe(catalogo);
  setTimeout(mostrarTeaser, 30000);
})();
