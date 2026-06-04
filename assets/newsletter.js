// Submits our custom newsletter forms to HubSpot (no HubSpot iframe/branding).
(function () {
  var PORTAL = '51562168';
  var FORM = '1da95905-49cc-4103-8edf-d73e23e52c74';
  var ENDPOINT = 'https://api.hsforms.com/submissions/v3/integration/submit/' + PORTAL + '/' + FORM;

  function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

  document.querySelectorAll('form[data-newsletter]').forEach(function (form) {
    var input = form.querySelector('input[type="email"]');
    var btn = form.querySelector('button');
    var status = (form.parentElement && form.parentElement.querySelector('[data-nl-status]')) || null;
    if (!status) {
      status = document.createElement('div');
      status.className = 'nl-status';
      status.setAttribute('data-nl-status', '');
      form.parentElement.appendChild(status);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = (input.value || '').trim();
      status.className = 'nl-status';
      if (!validEmail(email)) { status.textContent = 'Please enter a valid email.'; status.classList.add('bad'); return; }

      var label = btn.textContent;
      btn.disabled = true; btn.textContent = '…';

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: [{ name: 'email', value: email }],
          context: { pageUri: location.href, pageName: document.title }
        })
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok) {
            form.style.display = 'none';
            status.textContent = "You're in. Watch your inbox.";
            status.classList.add('ok');
          } else {
            status.textContent = (res.j && res.j.message) || 'Something went wrong — please try again.';
            status.classList.add('bad');
          }
        })
        .catch(function () { status.textContent = 'Network error — please try again.'; status.classList.add('bad'); })
        .finally(function () { btn.disabled = false; btn.textContent = label; });
    });
  });
})();
