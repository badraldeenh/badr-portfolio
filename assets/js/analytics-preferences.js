(() => {
  const status = document.getElementById('preference');
  const hardPrivacySignal = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  const get = () => { try { return localStorage.getItem('badr-analytics-consent'); } catch (_) { return null; } };
  const set = value => { try { localStorage.setItem('badr-analytics-consent', value); } catch (_) {} };
  const update = () => {
    const value = get();
    if (hardPrivacySignal) status.textContent = 'Current preference: blocked by your browser privacy signal.';
    else if (value === 'yes') status.textContent = 'Current preference: analytics allowed.';
    else if (value === 'no') status.textContent = 'Current preference: analytics rejected.';
    else status.textContent = 'Current preference: no choice yet. Detailed analytics remain off until you opt in.';
  };
  document.getElementById('allow').onclick = () => {
    if (hardPrivacySignal) return update();
    set('yes');
    update();
  };
  document.getElementById('decline').onclick = () => {
    set('no');
    try {
      localStorage.removeItem('badr-analytics-visitor');
      sessionStorage.removeItem('badr-visit-session-v3');
      sessionStorage.removeItem('badr-visit-session-v4');
    } catch (_) {}
    window.badrVisitAnalytics?.destroy?.();
    update();
  };
  update();
})();
