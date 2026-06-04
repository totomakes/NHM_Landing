// Applies editable copy from /api/content to any [data-edit="page.field"] element.
// Safe by design: only overrides text on success; pages keep built-in copy if the API is unavailable.
(function () {
  // In edit mode the editor script owns the content to avoid clobbering live edits.
  if (/[?&]edit=1(&|$)/.test(location.search)) return;
  fetch('/api/content', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data) return;
      document.querySelectorAll('[data-edit]').forEach(function (el) {
        var key = el.getAttribute('data-edit');
        var dot = key.indexOf('.');
        if (dot < 0) return;
        var page = key.slice(0, dot), field = key.slice(dot + 1);
        var val = data[page] && data[page][field];
        if (typeof val === 'string' && el.textContent !== val) el.textContent = val;
      });
    })
    .catch(function () {});
})();
