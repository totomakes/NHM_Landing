// Minimal signed-session helpers (HMAC-SHA256), zero external deps.
const crypto = require('crypto');

function b64url(buf) {
  return Buffer.from(buf).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function sign(payloadObj, secret) {
  const payload = b64url(JSON.stringify(payloadObj));
  const sig = b64url(crypto.createHmac('sha256', secret).update(payload).digest());
  return payload + '.' + sig;
}

function verify(token, secret) {
  if (!token || typeof token !== 'string' || token.indexOf('.') < 0) return null;
  const [payload, sig] = token.split('.');
  const expected = b64url(crypto.createHmac('sha256', secret).update(payload).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let obj;
  try {
    obj = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
  } catch (e) { return null; }
  if (!obj || !obj.exp || obj.exp < Date.now()) return null;
  return obj;
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  header.split(';').forEach(part => {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function isAuthed(req) {
  const secret = process.env.SESSION_SECRET || '';
  if (!secret) return false;
  return !!verify(parseCookies(req)['nhm_admin'], secret);
}

module.exports = { sign, verify, parseCookies, isAuthed };
