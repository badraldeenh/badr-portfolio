const crypto = require('node:crypto');

const TTL = 30 * 86400;
const PREFIX = 'badr:analytics:v1:';
const COOKIE = 'badr_analytics_admin';
const ADMIN_MAX_AGE = 30 * 86400;
const LIMIT = 500;
const idPattern = /^[a-f0-9-]{32,36}$/;
const metricPattern = /^(page|section|project|video|click):[a-zA-Z0-9_./-]{1,160}$/;
const clean = (v, n = 160) => String(v || '').replace(/[\x00-\x1f<>]/g, '').slice(0, n);
const equal = (a, b) => {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
};

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

function body(req) {
  if (typeof req.body === 'string') {
    if (Buffer.byteLength(req.body) > 20000) throw new Error('invalid_body');
    return JSON.parse(req.body);
  }
  if (Buffer.byteLength(JSON.stringify(req.body || {})) > 20000) throw new Error('invalid_body');
  return req.body || {};
}

function signature(value, password) {
  return crypto.createHmac('sha256', password).update('admin:' + value).digest('hex');
}

function authorized(req, c) {
  const raw = String(req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
  if (!raw) return false;
  const [until, nonce, sig] = raw.split('.');
  return /^\d+$/.test(until || '') && Number(until) > Date.now() && Number(until) <= Date.now() + ADMIN_MAX_AGE * 1000 && /^[a-f0-9]{32}$/.test(nonce || '') && equal(sig || '', signature(until + '.' + nonce, c.password));
}

function rememberOwner(res, c) {
  const token = (Date.now() + ADMIN_MAX_AGE * 1000) + '.' + crypto.randomBytes(16).toString('hex');
  res.setHeader('Set-Cookie', `${COOKIE}=${token}.${signature(token, c.password)}; Path=/api/visitor-analytics; HttpOnly; Secure; SameSite=Strict; Max-Age=${ADMIN_MAX_AGE}`);
}

async function rateLimit(req, c, action, maximum) {
  const ip = String(req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0];
  const key = PREFIX + 'rate:' + action + ':' + crypto.createHmac('sha256', c.password).update(ip).digest('hex').slice(0, 24);
  const count = await redis(['EVAL', "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],60) end; return n", 1, key], c);
  return Number(count) <= maximum;
}

const UPSERT = `
local incoming=cjson.decode(ARGV[1])
local raw=redis.call('GET',KEYS[1])
local s
if raw then
  s=cjson.decode(raw)
  s.city=nil
else
  s={id=incoming.id,visitor=incoming.visitor,ref=incoming.ref,source=incoming.source,country=incoming.country,device=incoming.device,browser=incoming.browser,startedAt=tonumber(ARGV[2]),lastSeen=tonumber(ARGV[2]),pages={}}
end
if s.visitor~=incoming.visitor then return 0 end
local p=s.pages[incoming.pageId]
if not p then
  local count=0; for _ in pairs(s.pages) do count=count+1 end
  if count>=100 then return 0 end
  p={path=incoming.path,title=incoming.title,activeMs=0,elapsedMs=0,metrics={}}
  s.pages[incoming.pageId]=p
end
p.lastSeen=tonumber(ARGV[2])
p.visible=incoming.visible
p.activeMs=math.max(p.activeMs,incoming.activeMs)
p.elapsedMs=math.max(p.elapsedMs,incoming.elapsedMs)
local metricCount=0; for _ in pairs(p.metrics) do metricCount=metricCount+1 end
for k,v in pairs(incoming.metrics) do
  local existing=p.metrics[k]
  if not existing and metricCount<80 then
    existing={title=v.title,ms=0,count=0}; p.metrics[k]=existing; metricCount=metricCount+1
  end
  if existing then
    existing.ms=math.max(existing.ms,v.ms); existing.count=math.max(existing.count,v.count)
  end
end
s.lastSeen=tonumber(ARGV[2])
redis.call('SET',KEYS[1],cjson.encode(s),'EX',ARGV[3])
redis.call('ZADD',KEYS[2],s.lastSeen,s.id)
redis.call('ZREMRANGEBYSCORE',KEYS[2],'-inf',tonumber(ARGV[2])-tonumber(ARGV[3])*1000)
return 1`;

function validate(input, req) {
  for (const key of ['id', 'visitor', 'pageId']) if (!idPattern.test(input[key] || '')) throw new Error('invalid_id');
  if (!/^\/[a-zA-Z0-9_./%-]*$/.test(input.path || '') || input.path.length > 180) throw new Error('invalid_path');
  const number = (v, max) => { if (!Number.isFinite(v) || v < 0 || v > max) throw new Error('invalid_metric'); return Math.round(v); };
  const activeMs = number(input.activeMs, 86400000);
  const elapsedMs = number(input.elapsedMs, 86400000);
  if (activeMs > elapsedMs + 1000) throw new Error('invalid_time');
  const entries = Object.entries(input.metrics || {});
  if (entries.length > 80) throw new Error('invalid_metrics');
  const metrics = Object.create(null);
  for (const [key, v] of entries) {
    if (!metricPattern.test(key) || !v || typeof v !== 'object') throw new Error('invalid_metric');
    metrics[key] = { title: clean(v.title), ms: number(v.ms, activeMs + 1000), count: number(v.count, 10000) };
  }
  const ua = String(req.headers['user-agent'] || '');
  return {
    id: input.id,
    visitor: input.visitor,
    pageId: input.pageId,
    path: input.path,
    title: clean(input.title),
    ref: /^[a-z0-9_-]{1,64}$/.test(input.ref || '') ? input.ref : 'direct',
    source: clean(input.source, 100),
    activeMs,
    elapsedMs,
    visible: input.visible === true,
    metrics,
    country: clean(req.headers['x-vercel-ip-country'], 2),
    device: /iPad|Tablet/i.test(ua) ? 'Tablet' : /Mobile|Android|iPhone/i.test(ua) ? 'Mobile' : 'Desktop',
    browser: /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Other'
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const c = settings();
  const action = req.query?.action || 'collect';

  if (action === 'status' && req.method === 'GET') return res.status(200).json({ enabled: configured(c), retentionDays: 30, locationPrecision: 'country' });
  if (action === 'owner' && req.method === 'GET') {
    const authenticated = configured(c) && authorized(req, c);
    if (authenticated) rememberOwner(res, c);
    return res.status(200).json({ authenticated });
  }
  if (!configured(c)) return res.status(503).json({ error: 'setup_required' });

  try {
    if (req.method === 'POST' && !originAllowed(req)) return res.status(403).json({ error: 'invalid_origin' });
    if (action === 'login' && req.method === 'POST') {
      if (!await rateLimit(req, c, 'login', 8)) return res.status(429).json({ error: 'rate_limited' });
      if (!equal(body(req).password || '', c.password)) return res.status(401).json({ error: 'invalid_password' });
      rememberOwner(res, c);
      return res.status(200).json({ ok: true });
    }
    if (action === 'logout' && req.method === 'POST') {
      res.setHeader('Set-Cookie', `${COOKIE}=; Path=/api/visitor-analytics; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
      return res.status(200).json({ ok: true });
    }
    if (action === 'sessions' && req.method === 'GET') {
      if (!authorized(req, c)) return res.status(401).json({ error: 'authentication_required' });
      rememberOwner(res, c);
      const days = [7, 30].includes(Number(req.query.days)) ? Number(req.query.days) : 7;
      const ids = await redis(['ZREVRANGEBYSCORE', PREFIX + 'sessions', '+inf', Date.now() - days * 86400000, 'LIMIT', 0, LIMIT + 1], c);
      let sessions = [];
      if (ids.length) {
        const records = await redis(['MGET', ...ids.slice(0, LIMIT).map(id => PREFIX + 'session:' + id)], c);
        sessions = records.filter(Boolean).map(x => {
          const s = JSON.parse(x);
          delete s.city;
          return s;
        });
      }
      return res.status(200).json({ serverNow: Date.now(), onlineWindowMs: 45000, sessions, truncated: ids.length > LIMIT, limit: LIMIT, days });
    }
    if (action !== 'collect' || req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
    const input = validate(body(req), req);
    if (!await rateLimit(req, c, 'collect', 240)) return res.status(429).json({ error: 'rate_limited' });
    if (/bot|crawler|spider|headless/i.test(req.headers['user-agent'] || '')) return res.status(202).json({ ok: true, ignored: true });
    const result = await redis(['EVAL', UPSERT, 2, PREFIX + 'session:' + input.id, PREFIX + 'sessions', JSON.stringify(input), Date.now(), TTL], c);
    return res.status(202).json({ ok: result === 1 });
  } catch (error) {
    const bad = /invalid_|JSON/.test(error.message);
    return res.status(bad ? 400 : 503).json({ error: bad ? 'invalid_payload' : 'storage_unavailable' });
  }
};
