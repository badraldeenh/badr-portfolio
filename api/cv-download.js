const crypto = require('node:crypto');

const PREFIX = 'badr:cv:v1:';
const COOKIE = 'badr_cv_admin';
const ADMIN_MAX_AGE = 30 * 86400;
const DAY_TTL = 400 * 86400;

function settings() {
  return {
    url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
    password: process.env.ANALYTICS_ADMIN_PASSWORD
  };
}

const configured = c => !!(c.url && c.token && c.password && c.password.length >= 16);

async function redis(command, c) {
  const r = await fetch(c.url.replace(/\/$/, ''), {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(7000)
  });
  if (!r.ok) throw new Error('storage_unavailable');
  const result = await r.json();
  if (result.error) throw new Error('storage_unavailable');
  return result.result;
}

function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return false;
  try { return new URL(origin).host === req.headers.host; } catch (_) { return false; }
}

function equal(a, b) {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}

function signature(value, password) {
  return crypto.createHmac('sha256', password).update('cv-admin:' + value).digest('hex');
}

function authorized(req, c) {
  const raw = String(req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
  if (!raw) return false;
  const [until, nonce, sig] = raw.split('.');
  return /^\d+$/.test(until || '') && Number(until) > Date.now() && Number(until) <= Date.now() + ADMIN_MAX_AGE * 1000 && /^[a-f0-9]{32}$/.test(nonce || '') && equal(sig || '', signature(until + '.' + nonce, c.password));
}

function rememberOwner(res, c) {
  const token = (Date.now() + ADMIN_MAX_AGE * 1000) + '.' + crypto.randomBytes(16).toString('hex');
  res.setHeader('Set-Cookie', `${COOKIE}=${token}.${signature(token, c.password)}; Path=/api/cv-download; HttpOnly; Secure; SameSite=Strict; Max-Age=${ADMIN_MAX_AGE}`);
}

async function rateLimit(req, c, action, maximum) {
  const ip = String(req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0];
  const key = PREFIX + 'rate:' + action + ':' + crypto.createHmac('sha256', c.password).update(ip).digest('hex').slice(0, 24);
  const count = await redis(['EVAL', "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],60) end; return n", 1, key], c);
  return Number(count) <= maximum;
}

function body(req) {
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return req.body || {};
}

function dubaiDay(ts = Date.now()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(ts));
  const get = type => parts.find(p => p.type === type)?.value || '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const c = settings();
  const action = req.query?.action || 'status';

  if (action === 'status' && req.method === 'GET') return res.status(200).json({ enabled: configured(c), mode: 'cv-only' });
  if (!configured(c)) return res.status(503).json({ error: 'setup_required' });

  try {
    if (req.method === 'POST' && !originAllowed(req)) return res.status(403).json({ error: 'invalid_origin' });

    if (action === 'record' && req.method === 'POST') {
      if (/bot|crawler|spider|headless/i.test(req.headers['user-agent'] || '')) return res.status(202).json({ ok: true, ignored: true });
      if (!await rateLimit(req, c, 'record', 30)) return res.status(429).json({ error: 'rate_limited' });
      const day = dubaiDay();
      const result = await redis(['EVAL', "local t=redis.call('INCR',KEYS[1]); local d=redis.call('INCR',KEYS[2]); redis.call('EXPIRE',KEYS[2],ARGV[1]); redis.call('SET',KEYS[3],ARGV[2]); return {t,d}", 3, PREFIX + 'total', PREFIX + 'day:' + day, PREFIX + 'last', DAY_TTL, Date.now()], c);
      return res.status(202).json({ ok: true, count: Number(result?.[0] || 0) });
    }

    if (action === 'login' && req.method === 'POST') {
      if (!await rateLimit(req, c, 'login', 8)) return res.status(429).json({ error: 'rate_limited' });
      if (!equal(body(req).password || '', c.password)) return res.status(401).json({ error: 'invalid_password' });
      rememberOwner(res, c);
      return res.status(200).json({ ok: true });
    }

    if (action === 'logout' && req.method === 'POST') {
      res.setHeader('Set-Cookie', `${COOKIE}=; Path=/api/cv-download; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
      return res.status(200).json({ ok: true });
    }

    if (action === 'stats' && req.method === 'GET') {
      if (!authorized(req, c)) return res.status(401).json({ error: 'authentication_required' });
      rememberOwner(res, c);
      const days = [7, 30].includes(Number(req.query.days)) ? Number(req.query.days) : 7;
      const dates = [];
      for (let i = days - 1; i >= 0; i--) dates.push(dubaiDay(Date.now() - i * 86400000));
      const total = Number(await redis(['GET', PREFIX + 'total'], c) || 0);
      const values = dates.length ? await redis(['MGET', ...dates.map(d => PREFIX + 'day:' + d)], c) : [];
      const daily = dates.map((date, i) => ({ date, count: Number(values?.[i] || 0) }));
      const period = daily.reduce((n, x) => n + x.count, 0);
      const last = Number(await redis(['GET', PREFIX + 'last'], c) || 0) || null;
      return res.status(200).json({ mode: 'cv-only', total, period, days, last, daily });
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (error) {
    return res.status(/JSON/.test(error.message) ? 400 : 503).json({ error: /JSON/.test(error.message) ? 'invalid_payload' : 'storage_unavailable' });
  }
};
