// In-place "edit mode" for admins. Activates only with ?edit=1 AND a valid session.
// Normal visitors never load any of this (early return).
(function () {
  if (!/[?&]edit=1(&|$)/.test(location.search)) return;

  var full = {};
  var dirty = {};
  var statusEl;

  fetch('/api/login').then(function (r) { return r.json(); }).then(function (d) {
    if (!d || !d.authed) { location.href = '/adminlog'; return; }
    loadAndEnable();
  }).catch(function () { location.href = '/adminlog'; });

  function loadAndEnable() {
    fetch('/api/content', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        full = data || {};
        injectStyles();
        buildBar();

        document.querySelectorAll('[data-edit]').forEach(function (el) {
          var key = el.getAttribute('data-edit');
          var dot = key.indexOf('.'); if (dot < 0) return;
          var page = key.slice(0, dot), field = key.slice(dot + 1);
          var val = full[page] && full[page][field];
          if (typeof val === 'string') el.textContent = val;
          el.setAttribute('data-orig', el.textContent);
          el.classList.add('nhm-editable');

          el.contentEditable = 'plaintext-only';
          if (el.contentEditable !== 'plaintext-only') el.contentEditable = 'true';

          el.addEventListener('input', function () {
            if (el.textContent !== el.getAttribute('data-orig')) dirty[key] = true;
            else delete dirty[key];
            updateStatus();
          });
          // Enter = commit (no line breaks in these fields)
          el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
          });
        });

        // Stop in-page click handlers (e.g. donate tier buttons) while editing text.
        document.addEventListener('click', function (e) {
          if (e.target.closest('[data-edit]')) e.stopPropagation();
        }, true);

        updateStatus();
      });
  }

  function injectStyles() {
    var s = document.createElement('style');
    s.textContent =
      '.nhm-editable{outline:1px dashed rgba(218,49,35,.65);outline-offset:3px;cursor:text;border-radius:2px;transition:background .15s}' +
      '.nhm-editable:hover{background:rgba(218,49,35,.10)}' +
      '.nhm-editable:focus{outline:2px solid #da3123;background:rgba(218,49,35,.12)}' +
      '#nhm-bar{position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#0a0a0a;border-top:2px solid #da3123;color:#f5f4f1;' +
      'font-family:Archivo,system-ui,sans-serif;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 18px;box-shadow:0 -8px 30px rgba(0,0,0,.55)}' +
      '#nhm-bar .nhm-l{display:flex;align-items:center;gap:12px;font-size:13px;flex-wrap:wrap}' +
      '#nhm-bar .dot{width:9px;height:9px;border-radius:50%;background:#da3123;box-shadow:0 0 0 4px rgba(218,49,35,.25);flex-shrink:0}' +
      '#nhm-bar .nhm-status{font-size:12px;color:#8a8784}' +
      '#nhm-bar .nhm-r{display:flex;align-items:center;gap:10px}' +
      '#nhm-bar button,#nhm-bar a{font-family:inherit;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:10px 16px;border:1px solid #2a2a28;background:transparent;color:#f5f4f1;cursor:pointer;border-radius:4px;text-decoration:none;white-space:nowrap}' +
      '#nhm-bar button.primary{background:#fff;color:#0a0a0a;border-color:#fff}' +
      '#nhm-bar button[disabled]{opacity:.5;cursor:default}' +
      '@media(max-width:640px){#nhm-bar{flex-direction:column;align-items:stretch}#nhm-bar .nhm-r{justify-content:space-between}}';
    document.head.appendChild(s);
    document.body.style.paddingBottom = '90px';
  }

  function buildBar() {
    var bar = document.createElement('div');
    bar.id = 'nhm-bar';
    bar.innerHTML =
      '<div class="nhm-l"><span class="dot"></span><span><b>Edit mode</b> — click any highlighted text to change it</span>' +
      '<span class="nhm-status" id="nhm-status"></span></div>' +
      '<div class="nhm-r">' +
      '<a href="/adminlog">All pages</a>' +
      '<button id="nhm-exit">Exit</button>' +
      '<button id="nhm-save" class="primary">Save &amp; publish</button>' +
      '</div>';
    document.body.appendChild(bar);
    statusEl = document.getElementById('nhm-status');
    document.getElementById('nhm-exit').addEventListener('click', function () {
      if (Object.keys(dirty).length && !confirm('Discard unsaved changes?')) return;
      location.href = location.pathname;
    });
    document.getElementById('nhm-save').addEventListener('click', save);
  }

  function updateStatus() {
    var n = Object.keys(dirty).length;
    statusEl.textContent = n ? (n + ' unsaved change' + (n > 1 ? 's' : '')) : 'All changes saved';
  }

  function save() {
    if (!Object.keys(dirty).length) return;
    var btn = document.getElementById('nhm-save');
    btn.disabled = true; statusEl.textContent = 'Saving…';

    document.querySelectorAll('[data-edit]').forEach(function (el) {
      var key = el.getAttribute('data-edit');
      if (!dirty[key]) return;
      var dot = key.indexOf('.'); var page = key.slice(0, dot), field = key.slice(dot + 1);
      if (!full[page]) full[page] = {};
      full[page][field] = el.textContent;
    });

    fetch('/api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: full }) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j.ok) {
          document.querySelectorAll('[data-edit]').forEach(function (el) { el.setAttribute('data-orig', el.textContent); });
          dirty = {}; statusEl.textContent = 'Saved — live in ~30s';
        } else {
          statusEl.textContent = (res.j && res.j.error) || 'Save failed';
        }
      })
      .catch(function () { statusEl.textContent = 'Network error'; })
      .finally(function () { btn.disabled = false; setTimeout(updateStatus, 3000); });
  }

  window.addEventListener('beforeunload', function (e) {
    if (Object.keys(dirty).length) { e.preventDefault(); e.returnValue = ''; }
  });
})();
