const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const store = require('../lib/ratings');
const dashboard = require('../lib/ratings-dashboard');
const handler = require('../api/ratings');
const admin = require('../api/ratings-dashboard');
const secret = 'test-only-cookie-secret-0123456789abcdef';
const previousEnv = { ...process.env };
const originalFetch = global.fetch;

function cookie(time = Math.floor(Date.now()/1000), payload = 'a'.repeat(48)) {
  const token = payload + '.' + time;
  const signature = crypto.createHmac('sha256', secret).update(token).digest('hex');
  return store.COOKIE + '=' + token + '.' + signature;
}
function req(overrides = {}) {
  return { method: 'GET', headers: { host: 'badr-eldin-portfolio.vercel.app', origin: 'https://badr-eldin-portfolio.vercel.app', cookie: cookie(), 'content-type':'application/json' }, ...overrides };
}
function res() {
  return { code:0, data:null, headers:{}, setHeader(key,value){this.headers[key.toLowerCase()]=value;}, status(code){this.code=code;return this;}, json(data){this.data=data;return this;}, send(data){this.data=data;return this;} };
}
test.beforeEach(() => {
  process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-not-real';
  process.env.RATINGS_COOKIE_SECRET = secret;
  process.env.RATINGS_ADMIN_PASSWORD = 'test-dashboard-password-012345';
});
test.afterEach(() => { global.fetch = originalFetch; });
test.after(() => { process.env = previousEnv; });

test('known catalog has 12 videos and five projects without duplicate IDs', () => {
  assert.equal(store.PROJECTS.filter(p=>p.type==='video').length,12);
  assert.equal(store.PROJECTS.filter(p=>p.type==='project').length,5);
  assert.equal(new Set(store.PROJECTS.map(p=>p.id)).size,17);
});
test('configuration requires secure storage and a signing secret', () => {
  assert.equal(store.configured(),true);
  assert.equal(store.configured({...process.env,UPSTASH_REDIS_REST_URL:'http://test.upstash.io'}),false);
  assert.equal(store.configured({...process.env,RATINGS_COOKIE_SECRET:'short'}),false);
});
test('valid cookies recover a stable keyed anonymous voter', () => {
  assert.match(store.getVoter(req()),/^[a-f0-9]{64}$/);
  assert.equal(store.getVoter(req()),store.getVoter(req()));
  assert.notEqual(store.getVoter(req()),'a'.repeat(48));
});
test('tampered, malformed, old and future cookies are rejected', () => {
  assert.equal(store.getVoter(req({headers:{cookie:cookie().replace('aaaa','bbbb')}})),null);
  assert.equal(store.getVoter(req({headers:{cookie:store.COOKIE+'=broken'}})),null);
  assert.equal(store.getVoter(req({headers:{cookie:cookie(Math.floor(Date.now()/1000)-store.COOKIE_AGE-10)}})),null);
  assert.equal(store.getVoter(req({headers:{cookie:cookie(Math.floor(Date.now()/1000)+120)}})),null);
});
test('cookie issuance uses HttpOnly, Secure and a host-only scope', () => {
  const response=res();store.issueVoter(response);
  assert.match(response.headers['set-cookie'],/Secure; HttpOnly; SameSite=Lax/);
  assert.ok(!response.headers['set-cookie'].includes('Domain='));
  assert.ok(store.getVoter(req({headers:{cookie:response.headers['set-cookie']}})));
});
test('POST origin must match the portfolio host over HTTPS', () => {
  assert.equal(store.isSameOrigin(req()),true);
  assert.equal(store.isSameOrigin(req({headers:{host:'badr-eldin-portfolio.vercel.app',origin:'https://attacker.example'}})),false);
  assert.equal(store.isSameOrigin(req({headers:{host:'badr-eldin-portfolio.vercel.app'}})),false);
});
test('empty aggregates show zero ratings and no average', () => {
  const data=store.summary(store.PROJECTS[0],[]);
  assert.equal(data.count,0);assert.equal(data.average,null);assert.deepEqual(data.distribution,[0,0,0,0,0]);
});
test('aggregates and dashboard overall averages use weighted rating counts', () => {
  const a=store.summary(store.PROJECTS[0],['count','2','sum','8','stars3','1','stars5','1']);
  const b=store.summary(store.PROJECTS[1],['count','1','sum','1','stars1','1']);
  assert.equal(a.average,4);assert.deepEqual(a.distribution,[0,0,1,0,1]);
  assert.deepEqual(dashboard.totals([a,b]),{count:3,rated:2,average:'3.00'});
});
test('summary reads return only the caller’s scores and public aggregates', async () => {
  const data=await store.summaries('anonymous-hash',async commands=>commands.map((command,index)=>index%2 ? (index===1?'5':null):[]));
  assert.equal(data[0].mine,5);assert.equal(data[1].mine,0);assert.equal(data.length,17);
  assert.ok(!JSON.stringify(data).includes('anonymous-hash'));
});
test('invalid scores and unknown project IDs never reach storage', async () => {
  global.fetch=()=>{throw new Error('must not reach storage');};
  for(const body of [{id:'invented',score:5},{id:'project-aura',score:6},{id:'project-aura',score:2.5},{id:'project-aura',score:'5'}]){
    const response=res();await handler(req({method:'POST',body}),response);assert.equal(response.code,400);
  }
});
test('cross-origin posts and unsigned voters cannot write ratings', async () => {
  const response=res();await handler(req({method:'POST',headers:{host:'portfolio.example',origin:'https://attacker.example'},body:{id:'project-aura',score:5}}),response);assert.equal(response.code,403);
  const unsigned=res();await handler(req({method:'POST',headers:{host:'portfolio.example',origin:'https://portfolio.example','content-type':'application/json'},body:{id:'project-aura',score:5}}),unsigned);assert.equal(unsigned.code,428);
});
test('valid votes use one EVAL request and acknowledge its committed result', async () => {
  let calls=0;
  global.fetch=async(url,options)=>{calls++;const command=JSON.parse(options.body);assert.equal(command[0],'EVAL');assert.equal(command[2],3);assert.equal(command[7],5);return {ok:true,json:async()=>({result:[1,5]})};};
  const response=res();await handler(req({method:'POST',body:{id:'project-aura',score:5}}),response);
  assert.equal(response.code,200);assert.deepEqual(response.data,{id:'project-aura',score:5,saved:true});assert.equal(calls,1);
});
test('idempotent stored vote is acknowledged without treating it as an error', async () => {
  global.fetch=async()=>({ok:true,json:async()=>({result:[0,3]})});
  const response=res();await handler(req({method:'POST',body:{id:'project-aura',score:3}}),response);
  assert.equal(response.code,200);assert.equal(response.data.saved,true);
});
test('rate limits return a retry delay without a success message', async () => {
  global.fetch=async()=>({ok:true,json:async()=>({result:[-1,0]})});
  const response=res();await handler(req({method:'POST',body:{id:'project-aura',score:5}}),response);
  assert.equal(response.code,429);assert.equal(response.headers['retry-after'],'600');assert.ok(!response.data.saved);
});
test('storage errors never claim that a rating was saved', async () => {
  global.fetch=async()=>({ok:false});
  const response=res();await handler(req({method:'POST',body:{id:'project-aura',score:5}}),response);
  assert.equal(response.code,503);assert.ok(!response.data.saved);
});
test('missing database configuration returns a clear unavailable response', async () => {
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  const response=res();await handler(req(),response);assert.equal(response.code,503);
});
test('new visitor GET assigns a cookie and returns no personal data', async () => {
  global.fetch=async()=>({ok:true,json:async()=>store.PROJECTS.map(()=>({result:[]}))});
  const response=res();await handler(req({headers:{host:'portfolio.example'}}),response);
  assert.equal(response.code,200);assert.ok(response.headers['set-cookie']);assert.equal(response.data.projects.length,17);
  assert.ok(response.data.projects.every(p=>!Object.hasOwn(p,'mine')));
});
test('dashboard denies anonymous and wrong-password access', async () => {
  for(const authorization of [undefined,'Basic '+Buffer.from('admin:wrong').toString('base64')]){
    const response=res();await admin(req({headers:{authorization}}),response);assert.equal(response.code,401);assert.match(response.headers['www-authenticate'],/^Basic /);
  }
});
test('dashboard authenticates configured owner credentials', async () => {
  global.fetch=async()=>({ok:true,json:async()=>store.PROJECTS.map(()=>({result:[]}))});
  const response=res();await admin(req({headers:{authorization:'Basic '+Buffer.from('admin:'+process.env.RATINGS_ADMIN_PASSWORD).toString('base64')}}),response);
  assert.equal(response.code,200);assert.match(response.data,/لا توجد تقييمات مشتركة بعد/);assert.equal(response.headers['x-frame-options'],'DENY');
});
test('dashboard HTML escapes titles and CSV escapes quotation marks', () => {
  const p={...store.summary(store.PROJECTS[0],[]),title:'<script>"test"</script>'};
  assert.ok(!dashboard.html([p]).includes('<script>"test"</script>'));
  assert.ok(dashboard.csv([p]).includes('"<script>""test""</script>"'));
});
