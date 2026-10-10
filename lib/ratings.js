const { createHmac, randomBytes, timingSafeEqual } = require('node:crypto');

const PROJECTS = [
  ['video-showreel', 'Showreel', 'video'],
  ['video-project-01', 'Chocolate Craft Film', 'video'],
  ['video-project-02', 'Mango Beverage Commercial', 'video'],
  ['video-project-03', 'Chocolate Dessert Process', 'video'],
  ['video-project-04', 'Filled Chocolate Reveal', 'video'],
  ['video-project-05', 'Handcrafted Chocolate Process', 'video'],
  ['video-project-06', 'Croissant Detail Story', 'video'],
  ['video-project-07', 'Chocolate Box Hero Shot', 'video'],
  ['video-project-08', 'Character Narrative', 'video'],
  ['video-character-scene-01', 'Family Selfie', 'video'],
  ['video-character-scene-02', 'Living Room Reactions', 'video'],
  ['video-hatan-stadium-ad-final-15s-1080x1920', 'HATAN Stadium Delivery Campaign', 'video'],
  ['project-idh', 'IDH — Integrated Development Holdings', 'project'],
  ['project-aura', 'AURA Athletics', 'project'],
  ['project-avena', 'AVENA Medical Center', 'project'],
  ['project-vareno', 'VARENO Barber Club', 'project'],
  ['project-hatan', 'HATAN Patisserie', 'project']
].map(([id, title, type]) => ({ id, title, type }));
const COOKIE = '__Host-badr-rater';
const COOKIE_AGE = 180 * 24 * 60 * 60;

// One atomic read/update: retries and changed scores never increment voter count twice.
const VOTE_SCRIPT = `
local old = tonumber(redis.call('HGET', KEYS[1], ARGV[1]) or '0')
local score = tonumber(ARGV[2])
if old == score then return {0, old} end
local hits = redis.call('INCR', KEYS[3])
if hits == 1 then redis.call('EXPIRE', KEYS[3], 600) end
if hits > 120 then return {-1, old} end
if old > 0 then
  redis.call('HINCRBY', KEYS[2], 'stars' .. old, -1)
  redis.call('HINCRBY', KEYS[2], 'sum', -old)
else
  redis.call('HINCRBY', KEYS[2], 'count', 1)
end
redis.call('HSET', KEYS[1], ARGV[1], score)
redis.call('HINCRBY', KEYS[2], 'stars' .. score, 1)
redis.call('HINCRBY', KEYS[2], 'sum', score)
redis.call('HSET', KEYS[2], 'updatedAt', ARGV[3])
return {1, score}
`;

function configured(env = process.env) {
  try {
    const url = new URL(env.UPSTASH_REDIS_REST_URL || '');
    return url.protocol === 'https:' && /(^|\.)upstash\.(io|com)$/.test(url.hostname)
      && !!env.UPSTASH_REDIS_REST_TOKEN && (env.RATINGS_COOKIE_SECRET || '').length >= 32;
  } catch { return false; }
}

function digest(value, secret = process.env.RATINGS_COOKIE_SECRET) {
  return createHmac('sha256', secret).update(value).digest('hex');
}

function equal(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

function getVoter(req, secret = process.env.RATINGS_COOKIE_SECRET, now = Date.now()) {
  if (!secret) return null;
  const cookie = String(req.headers.cookie || '').split(';').find(item => item.trim().startsWith(COOKIE + '='));
  const token = cookie?.trim().slice(COOKIE.length + 1);
  if (!token || token.length > 200) return null;
  const parts = token.split('.');
  if (parts.length !== 3 || !/^[a-f0-9]{48}$/.test(parts[0]) || !/^\d{10}$/.test(parts[1])) return null;
  const age = Math.floor(now / 1000) - Number(parts[1]);
  if (age < -60 || age > COOKIE_AGE) return null;
  if (!equal(digest(parts[0] + '.' + parts[1], secret), parts[2])) return null;
  return digest('voter:' + parts[0], secret);
}

function issueVoter(res) {
  const payload = randomBytes(24).toString('hex') + '.' + Math.floor(Date.now() / 1000);
  res.setHeader('Set-Cookie', `${COOKIE}=${payload}.${digest(payload)}; Path=/; Max-Age=${COOKIE_AGE}; Secure; HttpOnly; SameSite=Lax`);
}

async function redis(commands, pipeline = false, fetcher = fetch) {
  const url = process.env.UPSTASH_REDIS_REST_URL.replace(/\/$/, '') + (pipeline ? '/pipeline' : '');
  const response = await fetcher(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands), signal: AbortSignal.timeout(6000)
  });
  if (!response.ok) throw new Error('Ratings storage request failed');
  const data = await response.json();
  const entries = pipeline ? data : [data];
  if (!Array.isArray(entries) || entries.some(item => !item || item.error || !Object.hasOwn(item, 'result'))) throw new Error('Invalid ratings storage response');
  return pipeline ? entries.map(item => item.result) : data.result;
}

function summary(project, raw) {
  const values = Array.isArray(raw) ? Object.fromEntries(Array.from({ length: Math.floor(raw.length / 2) }, (_, i) => [raw[i * 2], raw[i * 2 + 1]])) : raw || {};
  const count = Number(values.count || 0);
  const sum = Number(values.sum || 0);
  return { ...project, count, sum, average: count ? Number((sum / count).toFixed(2)) : null,
    distribution: [1, 2, 3, 4, 5].map(star => Number(values['stars' + star] || 0)),
    updatedAt: values.updatedAt ? new Date(Number(values.updatedAt)).toISOString() : null };
}

async function summaries(voter, execute = redis) {
  const commands = PROJECTS.flatMap(project => voter
    ? [['HGETALL', `badr:ratings:${project.id}:stats`], ['HGET', `badr:ratings:${project.id}:votes`, voter]]
    : [['HGETALL', `badr:ratings:${project.id}:stats`]]);
  const results = await execute(commands, true);
  return PROJECTS.map((project, index) => ({ ...summary(project, results[index * (voter ? 2 : 1)]),
    ...(voter ? { mine: Number(results[index * 2 + 1] || 0) } : {}) }));
}

async function vote(id, score, voter, req, execute = redis) {
  // Vercel overwrites x-vercel-forwarded-for; never store the raw address.
  const address = String(req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown').slice(0,150);
  const rateKey = 'badr:ratings:limit:' + digest('rate:' + address);
  return execute(['EVAL', VOTE_SCRIPT, 3, `badr:ratings:${id}:votes`, `badr:ratings:${id}:stats`, rateKey, voter, score, Date.now()]);
}

function isSameOrigin(req) {
  try {
    const origin = new URL(req.headers.origin || '');
    return origin.protocol === 'https:' && origin.host === req.headers.host;
  } catch { return false; }
}

function isAdmin(req) {
  const password = process.env.RATINGS_ADMIN_PASSWORD;
  if (!password || password.length < 16) return false;
  const auth = String(req.headers.authorization || '');
  if (!auth.startsWith('Basic ') || auth.length > 2048) return false;
  const pair = Buffer.from(auth.slice(6), 'base64').toString('utf8');
  const separator = pair.indexOf(':');
  return separator > 0 && equal(pair.slice(0, separator), 'admin') && equal(pair.slice(separator + 1), password);
}

function headers(res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
}

module.exports = { PROJECTS, COOKIE, COOKIE_AGE, VOTE_SCRIPT, configured, getVoter, issueVoter, redis, summaries, summary, vote, isSameOrigin, isAdmin, headers };
