(() => {
  const $ = id => document.getElementById(id);
  let refreshing = false;
  const num = n => Number(n || 0).toLocaleString('ar-AE');
  const time = stamp => stamp ? new Date(stamp).toLocaleString('ar-AE', { timeZone: 'Asia/Dubai' }) : 'لا توجد بيانات بعد';

  function state(text, error = false) {
    $('state').textContent = text;
    $('state').className = 'state ' + (error ? 'error' : '');
  }

  async function api(action, method = 'GET', payload) {
    const r = await fetch('/api/cv-download?action=' + action, {
      method,
      headers: payload ? { 'Content-Type': 'application/json' } : {},
      body: payload ? JSON.stringify(payload) : undefined,
      cache: 'no-store',
      credentials: 'same-origin',
      signal: AbortSignal.timeout(15000)
    });
    const json = await r.json();
    if (!r.ok) { const e = new Error(json.error); e.status = r.status; throw e; }
    return json;
  }

  function render(data) {
    $('total').textContent = num(data.total);
    $('period').textContent = num(data.period);
    $('last').textContent = time(data.last);
    $('daily').replaceChildren();
    data.daily.slice().reverse().forEach(item => {
      const tr = document.createElement('tr');
      const date = document.createElement('td'); date.textContent = item.date;
      const count = document.createElement('td'); count.textContent = num(item.count);
      tr.append(date, count); $('daily').append(tr);
    });
    $('empty').hidden = data.period > 0;
    $('scope').textContent = `يتم تسجيل ضغطات رابط السيرة الذاتية فقط. لا يتم تسجيل زيارات الصفحات أو مدة التصفح أو الدولة أو الجهاز أو المتصفح.`;
  }

  async function refresh(silent = false) {
    if (refreshing) return;
    refreshing = true;
    $('refresh').disabled = true;
    if (!silent) state('جارٍ تحميل عدد ضغطات CV…');
    try {
      const data = await api('stats&days=' + $('days').value);
      $('login').hidden = true;
      $('dashboard').hidden = false;
      render(data);
      state('آخر تحديث ناجح: ' + time(Date.now()));
    } catch (e) {
      if (e.status === 401) {
        $('dashboard').hidden = true;
        $('login').hidden = false;
        state('أدخل كلمة المرور الخاصة باللوحة.');
      } else {
        state(e.message === 'setup_required' ? 'إعداد عداد CV غير مكتمل.' : 'تعذّر تحميل عدد ضغطات CV. أعد المحاولة.', true);
      }
    } finally {
      refreshing = false;
      $('refresh').disabled = false;
    }
  }

  $('login').addEventListener('submit', async e => {
    e.preventDefault();
    const button = e.target.querySelector('button');
    button.disabled = true;
    try {
      await api('login', 'POST', { password: $('password').value });
      $('password').value = '';
      await refresh();
    } catch (e) {
      state(e.status === 401 ? 'كلمة المرور غير صحيحة.' : e.status === 429 ? 'محاولات كثيرة؛ حاول بعد قليل.' : 'تعذّر الاتصال بالخادم.', true);
    } finally { button.disabled = false; }
  });

  $('refresh').onclick = () => refresh(false);
  $('days').onchange = () => refresh(false);
  $('logout').onclick = async () => {
    try {
      await api('logout', 'POST');
      $('dashboard').hidden = true;
      $('login').hidden = false;
      state('تم تسجيل الخروج.');
    } catch (_) { state('تعذّر تسجيل الخروج؛ أعد المحاولة.', true); }
  };

  setInterval(() => {
    if (!document.hidden && !$('dashboard').hidden && !refreshing) refresh(true);
  }, 30000);

  api('status').then(async status => {
    if (!status.enabled) {
      $('setup').hidden = false;
      state('الإعداد المطلوب غير مكتمل.', true);
      return;
    }
    await refresh();
  }).catch(() => state('تعذّر الوصول إلى عداد CV. أعد تحميل الصفحة.', true));
})();
