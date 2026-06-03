const crypto = require('crypto');
const { sign, isAuthed } = require('../lib/auth');

const COOKIE = 'nhm_admin';
const MAXAGE = 60 * 60 * 8; // 8 hours

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  if (x.length !== y.length) return false;
  return crypto.timingSafeEqual(x, y);
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return res.status(200).json({ authed: isAuthed(req) });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const secret = process.env.SESSION_SECRET;
  const pass = process.env.ADMIN_PASSWORD;
  if (!secret || !pass) return res.status(500).json({ error: 'Server not configured' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const supplied = (body && body.password) || '';

  if (!supplied || !safeEqual(supplied, pass)) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  const token = sign({ exp: Date.now() + MAXAGE * 1000, sub: 'admin' }, secret);
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${MAXAGE}`);
  return res.status(200).json({ ok: true });
};
