const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require.resolve('../assets/js/analytics-dashboard.js'), 'utf8');
test('background refresh reports failures and then clears stale state on recovery', async () => {
  const elements = new Map();
  const el = id => {
    if (!elements.has(id)) elements.set(id, { hidden: true, value: id === 'days' ? '7' : '', options: [], addEventListener() {}, replaceChildren(...children) { this.options = children; }, append(child) { this.options.push(child); } });
    return elements.get(id);
  };
  let fail = false, timer;
  vm.runInNewContext(source, {
    document: { getElementById: el, hidden: false },
    navigator: {}, localStorage: { getItem: () => 'no' },
    AbortSignal, Date, Number, Map, Set, Error,
    Option: function(text, value) { this.text = text; this.value = value; },
    setInterval(callback) { timer = callback; },
    fetch: async url => url.includes('status') ? { ok: true, json: async () => ({ enabled: true }) } : fail ? { ok: false, status: 503, json: async () => ({ error: 'storage_unavailable' }) } : { ok: true, json: async () => ({ sessions: [], days: 7, limit: 500 }) }
  });
  const settle = () => new Promise(resolve => setImmediate(resolve));
  await settle();
  assert.equal(el('dashboard').hidden, false);
  assert.match(el('state').textContent, /آخر تحديث ناجح/);
  assert.match(el('tracking-preference').textContent, /رفض/);
  fail = true; timer(); await settle();
  assert.match(el('state').textContent, /تعذّر الاتصال بقاعدة/);
  assert.match(el('state').className, /error/);
  fail = false; timer(); await settle();
  assert.match(el('state').textContent, /آخر تحديث ناجح/);
  assert.ok(!el('state').className.includes('error'));
});
test('presence excludes hidden and stale pages but retains another active page in the same session', async () => {
  const elements = new Map();
  const make = () => ({hidden:true,value:'',options:[],children:[],addEventListener(){},append(...children){this.children.push(...children);this.options.push(...children);},replaceChildren(...children){this.children=[...children];this.options=[...children];}});
  const el=id=>{if(!elements.has(id))elements.set(id,make());return elements.get(id);};
  el('days').value='7';
  const stamp=Date.now();
  const page=(visible,age)=>({visible,lastSeen:stamp-age,path:'/',activeMs:5000,elapsedMs:5000,metrics:{}});
  const sessions=[{pages:{a:page(true,1000)}},{pages:{a:page(false,1000)}},{pages:{a:page(true,46000)}},{pages:{a:page(false,1000),b:page(true,1000)}}].map((s,i)=>({...s,id:String(i),visitor:'visitor-'+i,ref:'direct',startedAt:stamp-60000,lastSeen:stamp,device:'Desktop',browser:'Chrome'}));
  vm.runInNewContext(source,{document:{getElementById:el,createElement:make,hidden:false},navigator:{},localStorage:{getItem:()=>''},location:{origin:'https://test.local'},AbortSignal,Date,Number,Map,Set,Error,Option:function(text,value){this.text=text;this.value=value;},setInterval(){},fetch:async url=>({ok:true,json:async()=>url.includes('status')?{enabled:true}:{sessions,serverNow:stamp,onlineWindowMs:45000,days:7,limit:500}})});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(el('online').textContent,Number(2).toLocaleString('ar-AE'));
  const labels=el('sessions').children.map(row=>row.children[0].textContent);
  assert.deepEqual(labels,['● أونلاين','○ أوفلاين','○ أوفلاين','● أونلاين']);
});
