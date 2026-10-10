(() => {
  const $ = id => document.getElementById(id);
  let data = { sessions: [] };
  let displayed = [];
  const seconds = ms => Math.round(ms / 1000);
  const num = n => Number(n).toLocaleString('ar-AE');
  const time = stamp => new Date(stamp).toLocaleString('ar-AE', { timeZone: 'Asia/Dubai' });
  const pageList = s => Object.values(s.pages || {});
  const active = s => pageList(s).reduce((n, p) => n + p.activeMs, 0);
  const allMetrics = s => pageList(s).flatMap(p => Object.entries(p.metrics || {}));
  function state(text, error = false) { $('state').textContent = text; $('state').className = 'state ' + (error ? 'error' : ''); }
  async function api(action, method = 'GET', body) {
    const r = await fetch('/api/visitor-analytics?action=' + action, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
    const json = await r.json();
    if (!r.ok) { const e = new Error(json.error); e.status = r.status; throw e; }
    return json;
  }
  function node(tag, text) { const el = document.createElement(tag); el.textContent = text; return el; }
  function render() {
    displayed = data.sessions.filter(s => !$('ref').value || s.ref === $('ref').value);
    const visitorCount = new Map();
    data.sessions.forEach(s => visitorCount.set(s.visitor, (visitorCount.get(s.visitor) || 0) + 1));
    $('visits').textContent = num(displayed.length);
    $('people').textContent = num(new Set(displayed.map(s => s.visitor)).size);
    $('average').textContent = num(displayed.length ? seconds(displayed.reduce((n, s) => n + active(s), 0) / displayed.length) : 0);
    $('cv').textContent = num(displayed.reduce((n, s) => n + allMetrics(s).filter(([k]) => k === 'click:cv').reduce((a, [, v]) => a + v.count, 0), 0));
    $('scope').textContent = `النتائج تخص الزيارات المحمّلة ضمن آخر ${data.days} أيام (حتى ${data.limit} زيارة). الأوقات بتوقيت الإمارات. ` + (data.truncated ? 'توجد زيارات أقدم لم تُحمّل؛ الملخص يخص هذه العينة فقط.' : '') + ' لا تُظهر كلمة «آخر تحديث» وقت خروج مؤكدًا.';
    $('sessions').replaceChildren();
    const totals = new Map();
    displayed.forEach(s => {
      const row = document.createElement('tr');
      const dates = document.createElement('td'); dates.append(node('div', time(s.startedAt)), node('div', time(s.lastSeen)));
      const source = document.createElement('td'); source.append(node('b', s.ref === 'direct' ? 'رابط عام' : s.ref), node('div', s.source || 'direct'));
      const area = node('td', [s.country, s.city].filter(Boolean).join(' / ') || 'غير متاح');
      const browser = node('td', s.device + ' / ' + s.browser);
      const duration = node('td', num(seconds(active(s))) + ' ثانية');
      const person = document.createElement('td'); person.append(node('div', s.visitor.slice(0, 8)), node('div', `${num(visitorCount.get(s.visitor))} زيارة ضمن النتائج المحمّلة`));
      const detail = document.createElement('td'), list = document.createElement('details'); list.append(node('summary', 'الصفحات والمشاريع والتفاعل'));
      pageList(s).forEach(p => { const line = node('div', `${p.path} — ${num(seconds(p.activeMs))} ثانية ظهور / ${num(seconds(p.elapsedMs))} ثانية منقضية`); line.className = 'detail'; list.append(line); });
      const perVisit = new Map();
      allMetrics(s).forEach(([key, v]) => {
        const item = perVisit.get(key) || { title: v.title, ms: 0, count: 0 }; item.ms += v.ms; item.count += v.count; perVisit.set(key, item);
      });
      perVisit.forEach((v, key) => {
        const label = key.startsWith('click:') ? `${v.title}: ${num(v.count)} ضغطة` : `${v.title}: ${num(seconds(v.ms))} ثانية${key.startsWith('video:') ? ' تشغيل مرئي' : ' ظهور'}`;
        list.append(node('div', label));
        if (!/^(project|video):/.test(key)) return;
        const total = totals.get(key) || { title: v.title, ms: 0, visits: 0, video: key.startsWith('video:') };
        total.ms += v.ms; total.visits++; totals.set(key, total);
      });
      detail.append(list); row.append(dates, source, area, browser, duration, person, detail); $('sessions').append(row);
    });
    $('projects').replaceChildren();
    [...totals.values()].sort((a, b) => b.ms - a.ms).forEach(v => { const tr = document.createElement('tr'); tr.append(node('td', (v.video ? 'فيديو: ' : '') + v.title), node('td', num(seconds(v.ms))), node('td', num(v.visits))); $('projects').append(tr); });
    $('empty').hidden = displayed.length > 0;
  }
  async function refresh() {
    $('refresh').disabled = true;
    state('جارٍ تحميل النتائج…');
    try {
      data = await api('sessions&days=' + $('days').value);
      const priorRef = $('ref').value;
      $('ref').replaceChildren(new Option('جميع المصادر', ''));
      [...new Set(data.sessions.map(s => s.ref))].sort().forEach(ref => $('ref').append(new Option(ref === 'direct' ? 'الرابط العام' : ref, ref)));
      if ([...$('ref').options].some(o => o.value === priorRef)) $('ref').value = priorRef;
      $('login').hidden = true; $('dashboard').hidden = false;
      render(); state('تم تحديث النتائج.');
    } catch (e) {
      if (e.status === 401) { $('dashboard').hidden = true; $('login').hidden = false; state('أدخل كلمة المرور الخاصة باللوحة.'); }
      else state('تعذّر تحميل النتائج. تحقق من اتصال التخزين ثم أعد المحاولة.', true);
    } finally { $('refresh').disabled = false; }
  }
  $('login').addEventListener('submit', async e => {
    e.preventDefault(); const button = e.target.querySelector('button'); button.disabled = true;
    try { await api('login', 'POST', { password: $('password').value }); $('password').value = ''; await refresh(); }
    catch (e) { state(e.status === 401 ? 'كلمة المرور غير صحيحة.' : e.status === 429 ? 'محاولات كثيرة؛ انتظر دقيقة ثم حاول.' : 'تعذّر الاتصال بالخادم.', true); }
    finally { button.disabled = false; }
  });
  $('refresh').onclick = refresh; $('days').onchange = refresh; $('ref').onchange = render;
  $('logout').onclick = async () => { try { await api('logout', 'POST'); data = { sessions: [] }; $('sessions').replaceChildren(); $('projects').replaceChildren(); $('dashboard').hidden = true; $('login').hidden = false; state('تم تسجيل الخروج.'); } catch (_) { state('تعذّر تسجيل الخروج؛ أعد المحاولة.', true); } };
  $('generate').onclick = () => { const code = $('company').value.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 64); if (!code) return state('اكتب رمز الشركة بالإنجليزية.', true); const url = new URL('/', location.origin); url.searchParams.set('ref', code); $('link').textContent = url.href; $('copy').hidden = false; };
  $('copy').onclick = async () => { try { await navigator.clipboard.writeText($('link').textContent); state('تم نسخ رابط الشركة.'); } catch (_) { state('حدد الرابط الظاهر وانسخه يدويًا.'); } };
  $('export').onclick = () => {
    const escape = value => { let v = String(value ?? ''); if (/^[=+@-]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
    const rows = [['session', 'anonymous_browser', 'ref', 'source', 'country', 'city', 'started_utc', 'last_update_utc', 'visible_seconds', 'pages']];
    displayed.forEach(s => rows.push([s.id, s.visitor, s.ref, s.source, s.country, s.city, new Date(s.startedAt).toISOString(), new Date(s.lastSeen).toISOString(), seconds(active(s)), pageList(s).map(p => p.path).join(' | ')]));
    const blob = new Blob(['\uFEFF' + rows.map(r => r.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = 'badr-visits.csv'; a.click(); URL.revokeObjectURL(url);
  };
  api('status').then(async status => { if (!status.enabled) { $('setup').hidden = false; state('الإعداد المطلوب غير مكتمل.', true); return; } await refresh(); }).catch(() => state('تعذّر الوصول إلى خدمة التحليلات. ربما لم يُنشر التحديث بعد.', true));
})();
