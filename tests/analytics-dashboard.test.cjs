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
