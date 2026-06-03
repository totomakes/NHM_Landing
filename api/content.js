// Public read of content.json straight from GitHub, so edits go live without a redeploy.
const OWNER  = process.env.GH_OWNER  || 'totomakes';
const REPO   = process.env.GH_REPO   || 'NHM_Landing';
const BRANCH = process.env.GH_BRANCH || 'main';
const FILE   = 'content.json';

module.exports = async (req, res) => {
  try {
    const token = process.env.GITHUB_TOKEN;
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}?ref=${BRANCH}`;
    const headers = { 'Accept': 'application/vnd.github+json', 'User-Agent': 'nhm-admin' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const r = await fetch(url, { headers });
    if (!r.ok) return res.status(200).json({}); // fallback: pages keep their built-in text

    const j = await r.json();
    const content = Buffer.from(j.content, 'base64').toString('utf8');
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send(content);
  } catch (e) {
    return res.status(200).json({});
  }
};
