const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require.resolve('../assets/js/visit-duration-core.js'),'utf8');
function browser(options = {}) {
  let now = 0, interval, id = 0;
  const listeners = {}, payloads = [], appended = [];
  const memory = values => { const map = new Map(Object.entries(values)); return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)}; };
  const localStorage = memory(options.consent === undefined ? {'badr-analytics-consent':'yes'} : {'badr-analytics-consent':options.consent});
  const sessionStorage = options.sessionStorage || memory({});
  const eventTarget = prefix => ({addEventListener(type, listener) { (listeners[prefix+type] ||= []).push(listener); }});
  const element = tag => ({tagName:tag.toUpperCase(),style:{},children:[],setAttribute(){},append(...children){this.children.push(...children)},appendChild(child){this.children.push(child);appended.push(child)},remove(){this.removed=true},getBoundingClientRect(){return {top:0,bottom:600,left:0,right:1000}}});
  const doc = {...eventTarget('document:'),body:element('body'),head:element('head'),visibilityState:'visible',title:'Portfolio',referrer:'https://mail.google.com/',querySelectorAll:()=>[],querySelector:()=>null,createElement:element};
  const window = {...eventTarget('window:')};
  const fetch = async (url, req) => {
    if (url.includes('status')) return {ok:true,json:async()=>({enabled:options.enabled !== false})};
    payloads.push(JSON.parse(req.body)); return {ok:true};
  };
  const context = {window,document:doc,fetch,performance:{now:()=>now},Date:class extends Date {static now(){return 1700000000000+now}},crypto:{randomUUID:()=>`${(++id).toString().padStart(8,'0')}-0000-0000-0000-000000000000`},localStorage,sessionStorage,location:{search:options.search || '?ref=sienna',pathname:'/',origin:'https://portfolio.test'},navigator:{globalPrivacyControl:options.gpc || false,sendBeacon:(_,blob)=>{blob.text().then(s=>payloads.push(JSON.parse(s)));return true}},URL,URLSearchParams,AbortController,Blob,Node:{DOCUMENT_POSITION_FOLLOWING:4},innerHeight:600,innerWidth:1000,setInterval:cb=>{interval=cb;return 1},clearInterval:()=>{interval=undefined}};
  vm.runInNewContext(source,context);
  return {doc,window,payloads,appended,localStorage,sessionStorage,ready:()=>new Promise(r=>setImmediate(r)),advance(ms){now+=ms;interval?.()},event(target,type,event={target:doc}){for(const callback of listeners[target+':'+type] || [])callback(event);},now:(ms)=>{now+=ms;}};
}
test('company attribution, heartbeat and hidden-tab timing stay consistent', async () => {
  const b=browser(); await b.ready();
  b.advance(20000); assert.equal(b.payloads.at(-1).activeMs,20000); assert.equal(b.payloads.at(-1).ref,'sienna');
  b.now(500); b.doc.visibilityState='hidden'; b.event('document','visibilitychange'); await b.ready();
  b.now(60000); b.doc.visibilityState='visible'; b.event('document','visibilitychange'); await b.ready();
  assert.equal(b.payloads.at(-1).activeMs,20500); assert.equal(b.payloads.at(-1).elapsedMs,80500);
  b.advance(15000); assert.equal(b.payloads.at(-1).activeMs,35500);
});
test('declining or privacy signals never start the detailed tracker', async () => {
  for (const options of [{consent:'no'},{gpc:true}]) {const b=browser(options);await b.ready();b.advance(30000);assert.equal(b.payloads.length,0);assert.equal(b.appended.length,0);}
});
test('unconfigured backend never injects synthetic duration pageviews', async () => {
  const b=browser({enabled:false});await b.ready();assert.equal(b.payloads.length,0);assert.equal(b.appended.length,0);b.advance(30000);assert.equal(b.payloads.length,0);
});
test('new visits record automatically without a consent prompt or persistent visitor ID', async () => {
  const b=browser({consent:''});await b.ready();assert.equal(b.payloads.length,1);
  assert.equal(b.appended.length,0);
  assert.equal(b.localStorage.getItem('badr-analytics-visitor'),null);
});
test('attribution survives internal navigation, new document IDs avoid double counting', async () => {
  const first=browser();await first.ready();first.advance(20000);
  const second=browser({search:'',sessionStorage:first.sessionStorage});await second.ready();
  assert.equal(second.payloads[0].id,first.payloads[0].id);assert.equal(second.payloads[0].ref,'sienna');assert.equal(second.payloads[0].visitor,first.payloads[0].visitor);
});
test('BFCache restoration does not count the away interval', async () => {
  const b=browser();await b.ready();b.advance(10000);b.event('window','pagehide');await b.ready();b.now(60000);b.event('window','pageshow');b.advance(15000);
  assert.equal(b.payloads.at(-1).activeMs,25000);
});
test('visible project, video playback and CV clicks are recorded separately', async () => {
  const b=browser();await b.ready();
  const video={tagName:'VIDEO',paused:false,ended:false,readyState:3,getAttribute:k=>k==='src'?'assets/video/project-01.mp4':null,getBoundingClientRect:()=>({top:0,bottom:500,left:0,right:500}),closest:()=>({querySelector:()=>({textContent:'Chocolate Craft Film'})})};
  const card={querySelector:s=>s==='video'?video:{textContent:'Chocolate Craft Film'},getBoundingClientRect:()=>({top:0,bottom:500,left:0,right:500})};
  b.doc.querySelectorAll=s=>s==='.card'?[card]:s==='video'?[video]:[];
  b.advance(15000);
  const m=b.payloads.at(-1).metrics;
  assert.equal(m['project:project-01'].ms,15000);assert.equal(m['video:project-01'].ms,15000);
  video.paused=true;b.advance(15000);
  assert.equal(b.payloads.at(-1).metrics['video:project-01'].ms,15000);
  const link={getAttribute:()=>'/assets/docs/CV.pdf',href:'https://portfolio.test/assets/docs/CV.pdf'};
  b.event('document','click',{target:{closest:()=>link}});await b.ready();
  assert.equal(b.payloads.at(-1).metrics['click:cv'].count,1);
});
test('presence distinguishes visible, hidden and departed pages', async () => {
  const b=browser({consent:''}); await b.ready();
  assert.equal(b.payloads.at(-1).visible,true);
  b.doc.visibilityState='hidden'; b.event('document','visibilitychange'); await b.ready();
  assert.equal(b.payloads.at(-1).visible,false);
  b.doc.visibilityState='visible'; b.event('document','visibilitychange'); await b.ready();
  assert.equal(b.payloads.at(-1).visible,true);
  b.event('window','pagehide'); await b.ready();
  assert.equal(b.payloads.at(-1).visible,false);
});
