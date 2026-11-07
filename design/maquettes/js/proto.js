/* Outil de maquette : bascule direction A/B et thème sombre/clair, icônes embarquées,
   micro-interactions. Aucun appel réseau. Ne fait pas partie de l'application. */
(function () {
  var root = document.documentElement;
  var params = new URLSearchParams(location.search);
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  var dir = params.get('dir') || store('race-dir-v2') || 'b';
  var theme = params.get('theme') || store('race-theme') || 'dark';
  if (params.get('embed')) root.setAttribute('data-embed', '');

  function apply() {
    root.setAttribute('data-dir', dir);
    root.setAttribute('data-theme', theme);
    if (!params.get('embed')) { store('race-dir-v2', dir); store('race-theme', theme); }
    document.querySelectorAll('[data-set-dir]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.setDir === dir)); });
    document.querySelectorAll('[data-set-theme]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.setTheme === theme)); });
    document.querySelectorAll('a[data-raw-href], a[href$=".html"], a[href*=".html#"]').forEach(function (a) {
      if (a.closest('[data-keep-href]')) return;
      var raw = a.getAttribute('data-raw-href') || a.getAttribute('href');
      a.setAttribute('data-raw-href', raw);
      var parts = raw.split('#');
      a.setAttribute('href', parts[0].split('?')[0] + '?dir=' + dir + '&theme=' + theme + (parts[1] ? '#' + parts[1] : ''));
    });
  }
  apply();

  var ICONS = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4"/><path d="M12 13v4M8 21h8M9 17h6"/>',
    list: '<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c.8-3.5 3.5-5 7-5s6.2 1.5 7 5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2 .6 3.4 2.2 4 5"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    logout: '<path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    perf: '<path d="M7 17L17 7M9 7h8v8"/>',
    up: '<path d="M12 5l7 12H5z"/>',
    down: '<path d="M12 19L5 7h14z"/>',
    'chev-r': '<path d="M9 5l7 7-7 7"/>',
    'chev-d': '<path d="M5 9l7 7 7-7"/>',
    'chev-l': '<path d="M15 5l-7 7 7 7"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>',
    download: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 16v4h16v-4"/>',
    print: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M3 3l18 18"/><path d="M10.6 5.1A9.6 9.6 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.3 6.3A17 17 0 0 0 2 12s4 7 10 7a9.4 9.4 0 0 0 4.2-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 3v5h5"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 21v-5h-5"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    journal: '<path d="M6 3h11l3 3v15H6z"/><path d="M9 9h8M9 13h8M9 17h5"/>',
    ball: '<circle cx="12" cy="12" r="9"/><path d="M5.5 5.8c3 2.5 3 9.9 0 12.4M18.5 5.8c-3 2.5-3 9.9 0 12.4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
    offline: '<path d="M3 3l18 18"/><path d="M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 4.3-2.4M19 12.9a10 10 0 0 0-2.6-1.8M2 9.3a15 15 0 0 1 4-2.6M22 9.3A15 15 0 0 0 11 5.1"/><path d="M12 20h0"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v3M8 18h4"/>',
    archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v11h14V9M10 13h4"/>',
    play: '<path d="M7 4l13 8-13 8z"/>',
    tag: '<path d="M3 12V3h9l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    swap: '<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>'
  };
  var sprite = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">';
  Object.keys(ICONS).forEach(function (k) { sprite += '<symbol id="i-' + k + '" viewBox="0 0 24 24">' + ICONS[k] + '</symbol>'; });
  sprite += '</svg>';
  document.body.insertAdjacentHTML('afterbegin', sprite);

  // barre de maquette
  var screen = document.body.getAttribute('data-screen') || '';
  var bar = document.createElement('div');
  bar.className = 'proto-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Outils de maquette (hors application)');
  bar.innerHTML =
    '<strong>MAQUETTE</strong><span class="pb-note">' + screen + '</span>' +
    '<span class="pb-group">Direction <button type="button" data-set-dir="a">A · non retenue</button><button type="button" data-set-dir="b">B · Court (retenue)</button></span>' +
    '<span class="pb-group">Thème <button type="button" data-set-theme="dark">Sombre</button><button type="button" data-set-theme="light">Clair</button></span>' +
    '<a href="index.html">← Index</a>';
  var skip = document.querySelector('.skip');
  if (skip) skip.after(bar); else document.body.insertBefore(bar, document.body.children[1] || null);
  bar.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return;
    if (t.dataset.setDir) dir = t.dataset.setDir;
    if (t.dataset.setTheme) theme = t.dataset.setTheme;
    apply();
  });
  apply();

  // afficher / masquer le mot de passe
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-toggle-pw]');
    if (b) {
      var input = document.getElementById(b.getAttribute('data-toggle-pw'));
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      b.setAttribute('aria-pressed', String(show));
      b.setAttribute('aria-label', show ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
      b.querySelector('use').setAttribute('href', show ? '#i-eye-off' : '#i-eye');
    }
    var c = e.target.closest('[data-copy]');
    if (c) {
      var txt = document.getElementById(c.getAttribute('data-copy')).textContent.trim();
      var done = function () { var l = c.querySelector('.lbl'); if (l) { var o = l.textContent; l.textContent = 'Copié'; setTimeout(function () { l.textContent = o; }, 1500); } };
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, done); else done();
    }
    var p = e.target.closest('[data-print]');
    if (p) window.print();
    var seg = e.target.closest('.seg [data-tab]');
    if (seg) {
      var group = seg.closest('.seg');
      group.querySelectorAll('[data-tab]').forEach(function (x) { x.setAttribute('aria-selected', String(x === seg)); document.getElementById(x.dataset.tab).hidden = x !== seg; });
    }
    var st = e.target.closest('.stepper button');
    if (st) {
      var out = st.parentNode.querySelector('output');
      var v = Math.max(0, Math.min(7, parseInt(out.textContent, 10) + (st.dataset.step === '+' ? 1 : -1)));
      out.textContent = v;
    }
    var chip = e.target.closest('.chip[aria-pressed]');
    if (chip) chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true'));
  });
})();
