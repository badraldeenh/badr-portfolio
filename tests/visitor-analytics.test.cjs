const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/visitor-analytics.js');
const originalFetch = global.fetch;
const keys = ['UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN','ANALYTICS_ADMIN_PASSWORD','KV_REST_API_URL','KV_REST_API_TOKEN'];
let originals, calls, rate;
beforeEach(() => {
  originals = Object.fromEntries(keys.map(k => [k, process.env[k]]));
  keys.forEach(k => delete process.env[k]);
  process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.test';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
  process.env.ANALYTICS_ADMIN_PASSWORD = 'only-for-tests-random-password';
  calls = []; rate = 1;
  global.fetch = async (url, options) => {
    const command = JSON.parse(options.body); calls.push(command);
    const result = command[0] === 'EVAL' ? (command[1].includes('INCR') ? rate : 1) : command[0] === 'ZREVRANGEBYSCORE' ? [] : [];
    return { ok: true, json: async () => ({ result }) };
  };
});
afterEach(() => { global.fetch = originalFetch; keys.forEach(k => originals[k] === undefined ? delete process.env[k] : process.env[k] = originals[k]); });
async function request(method, action, payload, extras = {}) {
  let status = 200, json, headers = {};
  const req = { method, query: { action }, body: payload, headers: { host: 'portfolio.test', origin: 'https://portfolio.test', 'user-agent':'Firefox/120.0', ...extras }, socket: { remoteAddress: '127.0.0.1' } };
  const res = { setHeader(k,v) { headers[k] = v; }, status(code) { status = code; return this; }, json(value) { json = value; return this; } };
  await handler(req, res); return { status, json, headers };
}
const sample = () => ({ id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', visitor:'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', pageId:'cccccccc-cccc-cccc-cccc-cccccccccccc', path:'/', title:'Portfolio', ref:'sienna', source:'mail.google.com', activeMs:20000, elapsedMs:40000, metrics: { 'project:aura': { title:'AURA', ms:15000, count:1 }, 'click:cv': { title:'CV opened', ms:0, count:1 } } });
test('missing setup fails closed and never exposes records', async () => {
  delete process.env.ANALYTICS_ADMIN_PASSWORD;
  assert.equal((await request('GET','status')).json.enabled, false);
  assert.equal((await request('GET','sessions')).status, 503);
  assert.equal(calls.length, 0);
});
test('anonymous users cannot read the dashboard API', async () => {
  assert.equal((await request('GET','sessions')).status, 401);
  assert.equal(calls.length, 0);
});
test('owner visibility requires a valid signed login and performs no storage reads', async () => {
  assert.equal((await request('GET', 'owner')).json.authenticated, false);
  const login = await request('POST', 'login', { password: process.env.ANALYTICS_ADMIN_PASSWORD });
  const cookie = login.headers['Set-Cookie'].split(';')[0];
  const before = calls.length;
  const owner = await request('GET', 'owner', undefined, { cookie });
  assert.deepEqual(owner.json, { authenticated: true });
  assert.equal(owner.headers['Cache-Control'], 'no-store');
  assert.equal((await request('GET', 'owner', undefined, { cookie: cookie + 'tampered' })).json.authenticated, false);
  delete process.env.ANALYTICS_ADMIN_PASSWORD;
  assert.equal((await request('GET', 'owner', undefined, { cookie })).json.authenticated, false);
  assert.equal(calls.length, before);
});
test('login sets a protected cookie, and a signed session can read', async () => {
  const login = await request('POST','login',{ password:process.env.ANALYTICS_ADMIN_PASSWORD });
  assert.equal(login.status, 200);
  assert.match(login.headers['Set-Cookie'], /HttpOnly; Secure; SameSite=Strict/);
  const cookie = login.headers['Set-Cookie'].split(';')[0];
  assert.equal((await request('GET','sessions',undefined,{cookie})).status, 200);
  assert.equal((await request('GET','sessions',undefined,{cookie:cookie + 'tampered'})).status, 401);
  process.env.ANALYTICS_ADMIN_PASSWORD = 'changed-test-only-password';
  assert.equal((await request('GET','sessions',undefined,{cookie})).status, 401);
});
test('bad password and cross-origin writes are rejected', async () => {
  assert.equal((await request('POST','login',{password:'bad'})).status, 401);
  const before = calls.length;
  assert.equal((await request('POST','collect',sample(),{origin:'https://other.test'})).status, 403);
  assert.equal(calls.length, before);
});
test('collection preserves ref and durations, normalizes geo, never saves raw IP', async () => {
  const r = await request('POST','collect',sample(), { 'x-vercel-ip-country':'CA','x-vercel-ip-city':'New%20York','x-vercel-forwarded-for':'192.0.2.50' });
  assert.equal(r.status, 202);
  const command = calls.find(x => x[0] === 'EVAL' && x[1].includes('incoming='));
  const value = JSON.parse(command[5]);
  assert.equal(value.ref,'sienna'); assert.equal(value.activeMs,20000); assert.equal(value.elapsedMs,40000); assert.equal(value.city,'New York');
  assert.ok(!JSON.stringify(calls).includes('192.0.2.50'));
  assert.equal(command.at(-1),90*86400);
});
test('invalid duration, oversized events, arbitrary paths and IDs are rejected', async () => {
  for (const change of [{activeMs:-1},{activeMs:50000},{path:'/secret?email=x'},{id:'invalid'},{metrics:{bad:{ms:0,count:0}}},{metrics:{'project:aura':{ms:0,count:-1}}}]) {
    assert.equal((await request('POST','collect',{...sample(),...change})).status,400);
  }
  assert.equal((await request('POST','collect',{...sample(),title:'x'.repeat(21000)})).status,400);
});
test('rate limits and storage failures are visible failures', async () => {
  rate = 241; assert.equal((await request('POST','collect',sample())).status,429);
  rate = 9; assert.equal((await request('POST','login',{password:'bad'})).status,429);
  global.fetch = async () => { throw new Error('network'); };
  assert.equal((await request('POST','collect',sample())).status,503);
});
