// Returns the visitor's country from Vercel's edge geo header (used to decide if a consent banner is needed).
module.exports = (req, res) => {
  var country = req.headers['x-vercel-ip-country'] || '';
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ country: country });
};
