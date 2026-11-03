/* ==========================================================
   Aruesthetics — panel comercial
   ========================================================== */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let csrf = $('meta[name="csrf"]').content;
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } } };

  const ICON = {
    wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
    tel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5h2.6l1.4 4-2 1.4a12 12 0 0 0 6.5 6.5l1.4-2 4 1.4v2.6a1.8 1.8 0 0 1-2 1.8A16.6 16.6 0 0 1 4.8 5.5a1.8 1.8 0 0 1 1.8-2Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
    web: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 9h17" stroke="currentColor" stroke-width="1.7"/></svg>',
  };
  const CANAL = { whatsapp: ['WhatsApp', ICON.wa], llamada: ['Llamada', ICON.tel], email: ['Email', ICON.mail], formulario: ['Formulario', ICON.web] };
  const ABIERTOS = ['nuevo', 'contactado', 'demo', 'propuesta'];

  let D = { pedidos: [], suscriptores: [], estados: {} };
  const F = { estado: store.get('aru-panel-estado') || 'abiertos', q: '', equipo: '', canal: '', prioridad: false };
  let abiertoId = null;

  /* ---------- Fechas ---------- */
  const tz = { timeZone: 'Europe/Madrid' };
  const fmtHora = new Intl.DateTimeFormat('es-ES', { ...tz, hour: '2-digit', minute: '2-digit' });
  const fmtDia = new Intl.DateTimeFormat('es-ES', { ...tz, day: 'numeric', month: 'short' });
  const fmtLargo = new Intl.DateTimeFormat('es-ES', { ...tz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const diaClave = (d) => new Intl.DateTimeFormat('en-CA', tz).format(d);
  const cuando = (iso) => {
    if (!iso) return '';
    const d = new Date(iso), ahora = new Date(), min = Math.round((ahora - d) / 60000);
    if (min < 1) return 'Ahora mismo';
    if (min < 60) return `Hace ${min} min`;
    const hoy = diaClave(ahora), ayer = diaClave(new Date(ahora - 86400000)), k = diaClave(d);
    if (k === hoy) return `Hoy, ${fmtHora.format(d)}`;
    if (k === ayer) return `Ayer, ${fmtHora.format(d)}`;
    return `${fmtDia.format(d).replace('.', '')}, ${fmtHora.format(d)}`;
  };
  const mesClave = (iso) => (iso ? diaClave(new Date(iso)).slice(0, 7) : '');

  /* ---------- Contacto ---------- */
  const numero = (tel) => {
    let d = String(tel || '').replace(/\D/g, '');
    if (d.startsWith('00')) d = d.slice(2);
    if (d.length === 9) d = '34' + d;
    return d.length >= 11 ? d : '';
  };
  const prioridad = (p) => p.plazo === 'Lo antes posible';
  const que = (p) => [p.motivo || 'Consulta', p.equipo].filter(Boolean).join(' · ');
  const saludo = (p) => {
    const motivo = (p.motivo || 'consulta').toLowerCase();
    return `Hola ${p.nombre}, te escribo de Aruesthetics por tu solicitud de ${motivo}${p.equipo ? ` del ${p.equipo}` : ''}.`;
  };
  const enlaces = (p) => {
    const n = numero(p.telefono);
    return {
      wa: n ? `https://wa.me/${n}?text=${encodeURIComponent(saludo(p))}` : '',
      tel: n ? `tel:+${n}` : '',
      mail: p.email ? `mailto:${p.email}?subject=${encodeURIComponent(`Tu solicitud de ${(p.motivo || 'información').toLowerCase()} · Aruesthetics`)}&body=${encodeURIComponent(saludo(p) + '\n\n')}` : '',
    };
  };

  /* ---------- Datos ---------- */
  async function cargar(silencioso = false) {
    try {
      const r = await fetch('api.php?accion=datos', { headers: { Accept: 'application/json' }, credentials: 'same-origin', cache: 'no-store' });
      if (r.status === 401) { location.reload(); return; }
      const j = await r.json();
      if (!j.ok) throw new Error(j.error);
      D = j;
      pintar();
      $('#actualizado').textContent = `Actualizado a las ${fmtHora.format(new Date())}`;
      if (abiertoId) { const p = D.pedidos.find((x) => x.id === abiertoId); if (p && !silencioso) abrirFicha(p.id); }
    } catch (e) {
      if (!silencioso) $('#lista').innerHTML = `<div class="vacio"><strong>No se han podido cargar los pedidos.</strong>Revisa la conexión y vuelve a intentarlo.<br><button class="boton boton--sec" type="button" id="reintentar">Reintentar</button></div>`;
    }
  }
  async function post(datos) {
    const r = await fetch('api.php', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-CSRF': csrf, Accept: 'application/json' }, body: JSON.stringify(datos) });
    if (r.status === 401) { location.reload(); throw new Error('sesión'); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) throw new Error(j.error || 'No se ha podido guardar.');
    return j;
  }

  /* ---------- Pintar ---------- */
  function pintar() {
    pintarKpis(); pintarEstados(); pintarEquipos(); pintarLista(); pintarSuscriptores();
    const nuevos = D.pedidos.filter((p) => p.estado === 'nuevo').length;
    document.title = `${nuevos ? `(${nuevos}) ` : ''}Panel comercial · Aruesthetics`;
  }

  function pintarKpis() {
    const P = D.pedidos, mes = mesClave(new Date().toISOString());
    const pasado = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return mesClave(d.toISOString()); })();
    const nuevos = P.filter((p) => p.estado === 'nuevo');
    const masViejo = nuevos.length ? nuevos[nuevos.length - 1] : null;
    const prio = P.filter((p) => prioridad(p) && ABIERTOS.includes(p.estado));
    const esteMes = P.filter((p) => mesClave(p.fecha) === mes).length, mesPasado = P.filter((p) => mesClave(p.fecha) === pasado).length;
    const ganados = P.filter((p) => p.estado === 'ganado').length, perdidos = P.filter((p) => p.estado === 'perdido').length;
    const tasa = ganados + perdidos ? Math.round((ganados / (ganados + perdidos)) * 100) : null;
    $('#kpis').innerHTML = `
      <button type="button" class="kpi ${nuevos.length ? 'kpi--alerta' : ''}" data-ir="nuevo">
        <p class="kpi__t">Sin atender</p><p class="kpi__n">${nuevos.length}</p>
        <p class="kpi__s">${masViejo ? `El más antiguo: ${esc(cuando(masViejo.fecha).toLowerCase())}` : 'Todo al día'}</p></button>
      <button type="button" class="kpi ${prio.length ? 'kpi--alerta' : ''}" data-ir="prioridad">
        <p class="kpi__t">Prioridad</p><p class="kpi__n">${prio.length}</p>
        <p class="kpi__s">Abiertos que lo quieren lo antes posible</p></button>
      <div class="kpi"><p class="kpi__t">Pedidos este mes</p><p class="kpi__n">${esteMes}</p>
        <p class="kpi__s">${mesPasado ? `${mesPasado} el mes pasado` : 'Sin datos del mes pasado'}</p></div>
      <button type="button" class="kpi" data-ir="ganado"><p class="kpi__t">Ventas cerradas</p><p class="kpi__n">${ganados}</p>
        <p class="kpi__s">${tasa === null ? 'Aún sin pedidos cerrados' : `${tasa}% de los pedidos ya decididos`}</p></button>`;
  }

  function pintarEstados() {
    const P = D.pedidos;
    const n = (k) => (k === 'abiertos' ? P.filter((p) => ABIERTOS.includes(p.estado)).length : k === 'todos' ? P.length : P.filter((p) => p.estado === k).length);
    const lista = [['abiertos', 'Abiertos'], ...Object.entries(D.estados), ['todos', 'Todos']];
    $('#estados').innerHTML = lista.map(([k, l]) => `<button type="button" class="estado-f" data-estado="${k}" aria-pressed="${F.estado === k}">${esc(l)} <span>${n(k)}</span></button>`).join('');
  }

  function pintarEquipos() {
    const sel = $('#f-equipo'), actual = sel.value;
    const equipos = [...new Set(D.pedidos.map((p) => p.equipo).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
    sel.innerHTML = '<option value="">Todos los equipos</option>' + equipos.map((e) => `<option${e === actual ? ' selected' : ''}>${esc(e)}</option>`).join('');
  }

  const filtrados = () => {
    const q = F.q.trim().toLowerCase();
    return D.pedidos.filter((p) => {
      if (F.estado === 'abiertos' && !ABIERTOS.includes(p.estado)) return false;
      if (F.estado !== 'abiertos' && F.estado !== 'todos' && p.estado !== F.estado) return false;
      if (F.equipo && p.equipo !== F.equipo) return false;
      if (F.canal && p.canal !== F.canal) return false;
      if (F.prioridad && !prioridad(p)) return false;
      if (q && ![p.nombre, p.provincia, p.email, p.telefono, p.centro, p.equipo, p.mensaje].join(' ').toLowerCase().includes(q)) return false;
      return true;
    });
  };

  function pintarLista() {
    const L = filtrados();
    if (!D.pedidos.length) {
      $('#lista').innerHTML = '<div class="vacio"><strong>Aún no hay pedidos.</strong>Cuando alguien use el asistente o el formulario de la web, aparecerá aquí y os llegará un aviso a comercial@aruesthetics.es.</div>';
      return;
    }
    if (!L.length) {
      $('#lista').innerHTML = '<div class="vacio"><strong>Ningún pedido coincide con los filtros.</strong><button class="boton boton--sec" type="button" id="quitar-filtros">Quitar filtros</button></div>';
      return;
    }
    $('#lista').innerHTML = `<table class="tabla">
      <thead><tr><th>Fecha</th><th>Contacto</th><th>Pedido</th><th>Canal</th><th>Estado</th><th><span class="sr">Acciones</span></th></tr></thead>
      <tbody>${L.map(fila).join('')}</tbody></table>`;
  }

  function fila(p) {
    const [cl, ci] = CANAL[p.canal] || ['—', ''];
    const l = enlaces(p);
    const canalTxt = p.canal === 'whatsapp' && !p.telefono ? 'WhatsApp · sin teléfono' : p.canal === 'llamada' && p.franja ? `Llamada · ${p.franja.replace(/\s*\(.*\)/, '').toLowerCase()}` : cl;
    return `<tr data-id="${p.id}" class="${p.estado === 'nuevo' ? 'es-nuevo' : ''}">
      <td class="c-fecha">${esc(cuando(p.fecha))}</td>
      <td class="c-contacto"><button type="button" class="nombre" data-abrir="${p.id}">${esc(p.nombre || 'Sin nombre')}</button>
        <p class="sub">${esc([p.centro, p.provincia].filter(Boolean).join(' · ') || '—')}</p></td>
      <td class="c-pedido">${esc(que(p))}
        <div class="badges">${prioridad(p) ? '<span class="badge badge--prio">Prioridad</span>' : ''}${/^Sí/.test(p.financiacion) ? '<span class="badge badge--fin">Financiación</span>' : ''}${p.origen === 'formulario' ? '<span class="badge badge--form">Formulario</span>' : ''}${p.notas.length ? `<span class="badge badge--form">${p.notas.length} nota${p.notas.length > 1 ? 's' : ''}</span>` : ''}</div></td>
      <td class="c-canal"><span class="canal">${ci}${esc(canalTxt)}</span></td>
      <td class="c-estado"><span class="pill e-${p.estado}">${esc(D.estados[p.estado])}</span></td>
      <td class="c-acciones"><div class="acciones">
        ${l.wa ? `<a class="acc acc--wa" href="${l.wa}" target="_blank" rel="noopener" aria-label="WhatsApp a ${esc(p.nombre)}" title="WhatsApp">${ICON.wa}</a>` : ''}
        ${l.tel ? `<a class="acc" href="${l.tel}" aria-label="Llamar a ${esc(p.nombre)}" title="Llamar">${ICON.tel}</a>` : ''}
        ${l.mail ? `<a class="acc" href="${l.mail}" aria-label="Email a ${esc(p.nombre)}" title="Email">${ICON.mail}</a>` : ''}
      </div></td></tr>`;
  }

  function pintarSuscriptores() {
    const S = D.suscriptores;
    $('#lista-susc').innerHTML = S.length ? `<table class="tabla"><thead><tr><th>Fecha</th><th>Email</th><th><span class="sr">Acciones</span></th></tr></thead><tbody>
      ${S.map((s) => `<tr data-susc="${s.id}"><td class="c-fecha">${esc(cuando(s.fecha))}</td><td class="c-contacto"><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></td>
        <td class="c-acciones"><div class="acciones"><button type="button" class="boton boton--peligro" data-borrar-susc="${s.id}">Eliminar</button></div></td></tr>`).join('')}
      </tbody></table>` : '<div class="vacio"><strong>Aún no hay suscriptores.</strong>Los emails que se apunten a las novedades desde el pie de la web aparecerán aquí.</div>';
  }

  /* ---------- Ficha ---------- */
  const ficha = $('#ficha');
  function abrirFicha(id) {
    const p = D.pedidos.find((x) => x.id === id); if (!p) return;
    abiertoId = id;
    const l = enlaces(p);
    $('#ficha-fecha').textContent = p.fecha ? fmtLargo.format(new Date(p.fecha)) : '';
    $('#ficha-t').textContent = p.nombre || 'Sin nombre';
    $('#ficha-sub').textContent = [p.centro, p.provincia].filter(Boolean).join(' · ');
    const dato = (k, v) => (v ? `<dt>${k}</dt><dd>${esc(v)}</dd>` : '');
    const canalTxt = (CANAL[p.canal] || [p.canal])[0];
    $('#ficha-cuerpo').innerHTML = `
      <section class="bloque" aria-labelledby="b-estado"><h3 id="b-estado">Estado</h3>
        <div class="pipeline" role="group" aria-label="Estado del pedido">${Object.entries(D.estados).map(([k, v]) => `<button type="button" data-set-estado="${k}" aria-pressed="${p.estado === k}" class="${p.estado === k ? `e-${k}` : ''}">${esc(v)}</button>`).join('')}</div>
        <p class="error-linea" id="err-estado" role="alert"></p></section>
      <section class="bloque" aria-labelledby="b-contactar"><h3 id="b-contactar">Contactar</h3>
        <div class="contactar">
          ${l.wa ? `<a class="boton boton--wa" href="${l.wa}" target="_blank" rel="noopener">${ICON.wa}WhatsApp</a>` : ''}
          ${l.tel ? `<a class="boton boton--sec" href="${l.tel}">${ICON.tel}Llamar</a>` : ''}
          ${l.mail ? `<a class="boton boton--sec" href="${l.mail}">${ICON.mail}Email</a>` : ''}
        </div>
        ${!l.wa && !l.mail ? `<p class="sin-dato">${p.canal === 'whatsapp' ? 'Abrió WhatsApp con el mensaje preparado, pero no dejó teléfono: si no os ha escrito, no hay forma de contactarle.' : 'No dejó teléfono ni email.'}</p>` : ''}
      </section>
      <section class="bloque" aria-labelledby="b-datos"><h3 id="b-datos">Pedido</h3>
        <dl class="datos">
          ${dato('Qué pide', p.motivo)}${dato('Equipo', p.equipo)}${dato('Contacto preferido', canalTxt)}${dato('Mejor hora', p.franja)}
          ${dato('Teléfono', p.telefono)}${dato('Email', p.email)}${dato('Tipo de centro', p.centro)}${dato('Provincia', p.provincia)}
          ${dato('Equipos que ya tiene', p.experiencia)}${dato('Plazo', p.plazo)}${dato('Financiación', p.financiacion)}${dato('Origen', p.origen === 'formulario' ? 'Formulario de la web' : 'Asistente de la web')}
        </dl>
        ${p.mensaje ? `<p class="mensaje">${esc(p.mensaje)}</p>` : ''}</section>
      <section class="bloque" aria-labelledby="b-notas"><h3 id="b-notas">Notas</h3>
        <div class="notas">${p.notas.length ? p.notas.slice().reverse().map((n) => `<div class="nota-i"><time>${esc(cuando(n.fecha))}</time><p>${esc(n.texto)}</p></div>`).join('') : '<p class="sin-dato">Sin notas todavía.</p>'}</div>
        <form class="nueva-nota" id="form-nota"><label class="sr" for="nota-txt">Nueva nota</label>
          <textarea id="nota-txt" placeholder="Por ejemplo: llamado, quiere la demo el martes por la mañana…"></textarea>
          <p class="error-linea" id="err-nota" role="alert"></p>
          <button class="boton boton--sec" type="submit">Añadir nota</button></form></section>
      ${p.historial.length ? `<section class="bloque" aria-labelledby="b-hist"><h3 id="b-hist">Historial</h3><div class="hist">${p.historial.slice().reverse().map((h) => `<p><time>${esc(cuando(h.fecha))}</time> · ${esc(D.estados[h.de] || h.de)} → <strong>${esc(D.estados[h.a] || h.a)}</strong></p>`).join('')}</div></section>` : ''}
      <section class="bloque" aria-labelledby="b-borrar"><h3 id="b-borrar">Eliminar</h3>
        <div class="peligro" id="zona-borrar"><button type="button" class="boton boton--peligro" id="pedir-borrar">Eliminar este pedido</button></div></section>`;
    if (!ficha.open) ficha.showModal();
  }

  async function cambiarEstado(id, estado) {
    const p = D.pedidos.find((x) => x.id === id); if (!p || p.estado === estado) return;
    try {
      const j = await post({ accion: 'estado', id, estado });
      p.estado = j.registro.estado; p.historial = j.registro.historial || p.historial;
      pintar(); abrirFicha(id);
    } catch (e) { const el = $('#err-estado'); if (el) el.textContent = e.message; }
  }

  /* ---------- Eventos ---------- */
  document.addEventListener('click', async (e) => {
    const t = e.target;
    const abrir = t.closest('[data-abrir]');
    if (abrir) { abrirFicha(abrir.dataset.abrir); return; }
    const filaEl = t.closest('tr[data-id]');
    if (filaEl && !t.closest('a, button')) { abrirFicha(filaEl.dataset.id); return; }
    const est = t.closest('[data-estado]');
    if (est) { F.estado = est.dataset.estado; store.set('aru-panel-estado', F.estado); pintarEstados(); pintarLista(); return; }
    const ir = t.closest('[data-ir]');
    if (ir) {
      const v = ir.dataset.ir;
      if (v === 'prioridad') { F.prioridad = true; $('#f-prioridad').checked = true; F.estado = 'abiertos'; } else { F.estado = v; F.prioridad = false; $('#f-prioridad').checked = false; }
      pintarEstados(); pintarLista(); $('#estados').scrollIntoView({ behavior: 'smooth', block: 'start' }); return;
    }
    if (t.closest('#quitar-filtros')) {
      Object.assign(F, { estado: 'todos', q: '', equipo: '', canal: '', prioridad: false });
      $('#buscar').value = ''; $('#f-equipo').value = ''; $('#f-canal').value = ''; $('#f-prioridad').checked = false;
      pintarEstados(); pintarLista(); return;
    }
    if (t.closest('#reintentar')) { cargar(); return; }
    const setE = t.closest('[data-set-estado]');
    if (setE && abiertoId) { cambiarEstado(abiertoId, setE.dataset.setEstado); return; }
    if (t.closest('#pedir-borrar')) {
      $('#zona-borrar').innerHTML = '<p>¿Seguro? El pedido y sus notas se borran para siempre.</p><button type="button" class="boton boton--peligro" id="si-borrar">Sí, eliminar</button><button type="button" class="boton boton--sec" id="no-borrar">Cancelar</button>';
      $('#no-borrar').focus(); return;
    }
    if (t.closest('#no-borrar')) { abrirFicha(abiertoId); return; }
    if (t.closest('#si-borrar')) {
      try { await post({ accion: 'eliminar', id: abiertoId }); D.pedidos = D.pedidos.filter((p) => p.id !== abiertoId); abiertoId = null; ficha.close(); pintar(); }
      catch (err) { $('#zona-borrar').insertAdjacentHTML('beforeend', `<p>${esc(err.message)}</p>`); }
      return;
    }
    const bs = t.closest('[data-borrar-susc]');
    if (bs) {
      if (bs.dataset.confirmar !== '1') { bs.dataset.confirmar = '1'; bs.textContent = '¿Seguro? Pulsa otra vez'; return; }
      try { await post({ accion: 'eliminar_suscriptor', id: bs.dataset.borrarSusc }); D.suscriptores = D.suscriptores.filter((s) => s.id !== bs.dataset.borrarSusc); pintarSuscriptores(); }
      catch (err) { bs.textContent = err.message; }
      return;
    }
    if (t.closest('[data-cerrar]')) { t.closest('dialog').close(); return; }
    const pes = t.closest('.pestana');
    if (pes) {
      $$('.pestana').forEach((b) => b.setAttribute('aria-pressed', String(b === pes)));
      $('#vista-pedidos').hidden = pes.dataset.vista !== 'pedidos';
      $('#vista-suscriptores').hidden = pes.dataset.vista !== 'suscriptores';
      return;
    }
    if (t.closest('#salir')) { try { await post({ accion: 'salir' }); } catch { /* da igual */ } location.href = './'; return; }
    if (t.closest('#cambiar-clave')) { $('#form-clave').reset(); $('#clave-nota').hidden = true; $('#dlg-clave').showModal(); }
  });

  $$('dialog').forEach((d) => d.addEventListener('click', (e) => { if (e.target === d) d.close(); }));
  ficha.addEventListener('close', () => { abiertoId = null; });

  document.addEventListener('submit', async (e) => {
    if (e.target.id === 'form-nota') {
      e.preventDefault();
      const txt = $('#nota-txt').value.trim();
      if (!txt) { $('#err-nota').textContent = 'Escribe la nota.'; return; }
      const btn = e.target.querySelector('button'); btn.disabled = true;
      try {
        const j = await post({ accion: 'nota', id: abiertoId, texto: txt });
        const p = D.pedidos.find((x) => x.id === abiertoId); p.notas = j.registro.notas || p.notas;
        pintarLista(); abrirFicha(abiertoId);
      } catch (err) { $('#err-nota').textContent = err.message; btn.disabled = false; }
    }
    if (e.target.id === 'form-clave') {
      e.preventDefault();
      const f = e.target, nota = $('#clave-nota');
      try {
        const j = await post({ accion: 'contrasena', actual: f.actual.value, nueva: f.nueva.value });
        csrf = j.csrf || csrf; $('meta[name="csrf"]').content = csrf;
        nota.className = 'nota nota--ok'; nota.textContent = 'Contraseña cambiada. Las demás sesiones abiertas se han cerrado.'; nota.hidden = false; f.reset();
      } catch (err) { nota.className = 'nota nota--error'; nota.textContent = err.message; nota.hidden = false; }
    }
  });

  $('#buscar').addEventListener('input', (e) => { F.q = e.target.value; pintarLista(); });
  $('#f-equipo').addEventListener('change', (e) => { F.equipo = e.target.value; pintarLista(); });
  $('#f-canal').addEventListener('change', (e) => { F.canal = e.target.value; pintarLista(); });
  $('#f-prioridad').addEventListener('change', (e) => { F.prioridad = e.target.checked; pintarLista(); });

  cargar();
  setInterval(() => { if (!document.hidden && !document.querySelector('dialog[open]')) cargar(true); }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) cargar(true); });
  setTimeout(() => $('#bienvenida')?.remove(), 6000);
})();
