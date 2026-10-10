const store = require('../lib/ratings');

module.exports = async (req, res) => {
  store.headers(res);
  if (!['GET', 'POST'].includes(req.method)) { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  if (!store.configured()) return res.status(503).json({ error: 'Ratings are not configured yet. Please try later.' });
  try {
    const voter = store.getVoter(req);
    if (req.method === 'GET') {
      if (!voter) store.issueVoter(res);
      const projects = await store.summaries(voter);
      return res.status(200).json({ projects });
    }
    if (!store.isSameOrigin(req)) return res.status(403).json({ error: 'Please rate from the portfolio website.' });
    if (!voter) return res.status(428).json({ error: 'Enable cookies and refresh the page to submit a rating.' });
    if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) return res.status(415).json({ error: 'JSON required' });
    if (Number(req.headers['content-length'] || 0) > 1024) return res.status(413).json({ error: 'Request too large' });
    let body = req.body;
    if (typeof body === 'string') { if (Buffer.byteLength(body) > 1024) return res.status(413).json({ error: 'Request too large' }); body = JSON.parse(body); }
    const { id, score } = body || {};
    if (!store.PROJECTS.some(project => project.id === id) || !Number.isInteger(score) || score < 1 || score > 5) return res.status(400).json({ error: 'Choose a valid project and 1–5 stars.' });
    const result = await store.vote(id, score, voter, req);
    if (!Array.isArray(result) || ![-1, 0, 1].includes(result[0]) || (result[0] !== -1 && Number(result[1]) !== score)) throw new Error('Invalid write acknowledgement');
    if (result[0] === -1) { res.setHeader('Retry-After', '600'); return res.status(429).json({ error: 'Too many changes. Please try again in 10 minutes.' }); }
    // Acknowledgement depends on the committed write, not the follow-up read.
    return res.status(200).json({ id, score, saved: true });
  } catch (error) {
    if (error instanceof SyntaxError) return res.status(400).json({ error: 'Invalid JSON' });
    return res.status(503).json({ error: 'Could not save or load ratings. Please try again.' });
  }
};
