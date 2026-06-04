// Analytics: Vercel Web Analytics (cookieless, always on) + GA4 (consent-gated) + a unified track().
(function () {
  if (/[?&]edit=1(&|$)/.test(location.search)) return; // never track admin edit sessions

  var GA_ID = 'G-5KBZMHDYFW';
  var CONSENT_KEY = 'nhm_analytics_consent';

  // ---- Vercel Web Analytics (no cookies, no consent needed) ----
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  var vs = document.createElement('script');
  vs.defer = true; vs.src = '/_vercel/insights/script.js';
  document.head.appendChild(vs);

  // ---- GA4 (cookies → only after consent) ----
  var gaReady = false;
  function loadGA() {
    if (gaReady) return; gaReady = true;
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  // ---- unified event tracker (sends to both, where available) ----
  window.nhmTrack = function (name, params) {
    params = params || {};
    try { va('event', { name: name, data: params }); } catch (e) {}
    try { if (gaReady && window.gtag) gtag('event', name, params); } catch (e) {}
  };

  // ---- consent ----
  var choice = null;
  try { choice = localStorage.getItem(CONSENT_KEY); } catch (e) {}
  if (choice === 'granted') loadGA();
  else if (choice !== 'denied') document.addEventListener('DOMContentLoaded', showBanner);

  function setConsent(v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {}
    if (v === 'granted') loadGA();
    var b = document.getElementById('nhm-consent'); if (b) b.remove();
  }

  function showBanner() {
    if (document.getElementById('nhm-consent')) return;
    var style = document.createElement('style');
    style.textContent =
      '#nhm-consent{position:fixed;left:0;right:0;bottom:0;z-index:9000;background:#0a0a0a;border-top:2px solid #da3123;color:#f5f4f1;font-family:Archivo,system-ui,sans-serif;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 20px;box-shadow:0 -8px 30px rgba(0,0,0,.5)}' +
      '#nhm-consent p{font-size:13px;line-height:1.5;color:#cfcdc9;margin:0;max-width:760px}' +
      '#nhm-consent .nhm-cc{display:flex;gap:10px;flex-shrink:0}' +
      '#nhm-consent button{font-family:inherit;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:10px 16px;border:1px solid #2a2a28;background:transparent;color:#f5f4f1;cursor:pointer;border-radius:4px;white-space:nowrap}' +
      '#nhm-consent button.ok{background:#fff;color:#0a0a0a;border-color:#fff}' +
      '@media(max-width:640px){#nhm-consent{flex-direction:column;align-items:stretch}#nhm-consent .nhm-cc{justify-content:space-between}}';
    document.head.appendChild(style);
    var bar = document.createElement('div');
    bar.id = 'nhm-consent';
    bar.innerHTML =
      '<p>We use analytics to understand how the site is used and make it better. No ads, no selling your data. You can decline and still use everything.</p>' +
      '<div class="nhm-cc"><button id="nhm-decline">Decline</button><button class="ok" id="nhm-accept">Accept</button></div>';
    document.body.appendChild(bar);
    document.getElementById('nhm-accept').addEventListener('click', function () { setConsent('granted'); });
    document.getElementById('nhm-decline').addEventListener('click', function () { setConsent('denied'); });
  }
})();
