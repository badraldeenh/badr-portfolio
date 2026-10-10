const store = require('../lib/ratings');
const dashboard = require('../lib/ratings-dashboard');

module.exports = async (req, res) => {
  store.headers(res);
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('X-Frame-Options', 'DENY');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).send('Method not allowed'); }
  if ((process.env.RATINGS_ADMIN_PASSWORD || '').length < 16) return res.status(503).send('لوحة التقييمات غير مفعّلة بعد.');
  if (!store.isAdmin(req)) {
    res.setHeader('WWW-Authenticate', 'Basic realm="BADR Magic Ratings", charset="UTF-8"');
    return res.status(401).send('هذه اللوحة خاصة بصاحب الموقع. أدخل بيانات الدخول.');
  }
  if (!store.configured()) return res.status(503).send('لم يكتمل ربط قاعدة بيانات التقييمات.');
  try {
    const projects = await store.summaries();
    if (req.query?.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="badr-project-ratings.csv"');
      return res.status(200).send(dashboard.csv(projects));
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
    return res.status(200).send(dashboard.html(projects));
  } catch { return res.status(503).send('تعذر تحميل التقييمات الآن. حاول تحديث الصفحة لاحقًا.'); }
};
