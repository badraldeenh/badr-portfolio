(() => {
  let button;
  let pending = false;
  async function check() {
    if (pending || document.hidden) return;
    pending = true;
    try {
      const response = await fetch('/api/visitor-analytics?action=owner', { cache: 'no-store', credentials: 'same-origin' });
      const status = response.ok ? await response.json() : {};
      if (status.authenticated === true) {
        if (!button) {
          button = document.createElement('a');
          button.href = '/analytics.html';
          button.textContent = 'الإحصائيات';
          button.lang = 'ar';
          button.dir = 'rtl';
          button.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:1000;padding:12px 20px;border-radius:999px;background:#172c24;color:#fff;border:1px solid #9dbb9f;font:600 16px system-ui;text-decoration:none;box-shadow:0 4px 16px #0003;';
          document.body.append(button);
        }
        button.hidden = false;
      } else if (button) button.hidden = true;
    } catch (_) { if (button) button.hidden = true; }
    finally { pending = false; }
  }
  window.addEventListener('pageshow', check);
  window.addEventListener('focus', check);
  document.addEventListener('visibilitychange', check);
  setInterval(check, 60000);
  check();
})();
