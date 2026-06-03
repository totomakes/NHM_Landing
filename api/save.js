const { isAuthed } = require('../lib/auth');

const OWNER  = process.env.GH_OWNER  || 'totomakes';
const REPO   = process.env.GH_REPO   || 'NHM_Landing';
const BRANCH = process.env.GH_BRANCH || 'main';
const FILE   = 'content.json';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isAuthed(req)) return res.status(401).json({ error: 'Not authorized' });

  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: 'GITHUB_TOKEN is not set' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  const content = body && body.content;
  if (!content || typeof content !== 'object') return res.status(400).json({ error: 'Invalid content' });

  const newText = JSON.stringify(content, null, 2) + '\n';
  const api = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'nhm-admin',
    'Content-Type': 'application/json'
  };

  try {
    let sha;
    const getR = await fetch(`${api}?ref=${BRANCH}`, { headers });
    if (getR.ok) { const j = await getR.json(); sha = j.sha; }

    const putR = await fetch(api, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: 'Update site copy via /adminlog',
        content: Buffer.from(newText, 'utf8').toString('base64'),
        branch: BRANCH,
        sha
      })
    });

    if (!putR.ok) {
      const t = await putR.text();
      return res.status(502).json({ error: 'GitHub save failed', detail: t.slice(0, 300) });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: String(e).slice(0, 300) });
  }
};
