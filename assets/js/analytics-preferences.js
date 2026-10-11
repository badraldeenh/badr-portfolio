(() => {
  const status = document.getElementById('preference');
  const update = () => { try { status.textContent = 'Current preference: ' + (localStorage.getItem('badr-analytics-consent') === 'yes' ? 'allowed' : localStorage.getItem('badr-analytics-consent') === 'no' ? 'disabled' : 'enabled automatically'); } catch (_) { status.textContent = 'Local storage is unavailable; preferences apply to this visit only.'; } };
  document.getElementById('allow').onclick = () => { try { localStorage.setItem('badr-analytics-consent', 'yes'); } catch (_) {} update(); };
  document.getElementById('decline').onclick = () => { try { localStorage.setItem('badr-analytics-consent', 'no'); localStorage.removeItem('badr-analytics-visitor'); sessionStorage.removeItem('badr-visit-session-v3'); sessionStorage.removeItem('badr-visit-session-v4'); } catch (_) {} update(); };
  update();
})();
