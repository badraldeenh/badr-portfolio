(() => {
  const loadScript = (flag, src) => {
    if (window[flag]) return;
    window[flag] = true;
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    document.head.appendChild(s);
  };

  loadScript('badrFinalPolishLoader', '/assets/js/final-polish.js?v=2');
  loadScript('badrFinalTouchLoader', '/assets/js/final-touch.js?v=1');
  loadScript('badrExperienceUpdateLoader', '/assets/js/experience-update.js?v=1');
  loadScript('badrHatanCampaignLoader', '/assets/js/restore-hatan-campaign.js?v=3');

  const storageGet = key => { try { return localStorage.getItem(key); } catch (_) { return null; } };
  const storageSet = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
  const hardPrivacySignal = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  if (hardPrivacySignal) storageSet('badr-analytics-consent', 'no');

  const loadDetailedAnalytics = () => {
    if (storageGet('badr-analytics-consent') !== 'yes' || hardPrivacySignal) return;
    loadScript('badrVisitAnalyticsCoreLoader', '/assets/js/visit-duration-core.js?v=3');
  };

  const removeBanner = () => document.getElementById('badr-analytics-consent-banner')?.remove();
  const setChoice = value => {
    storageSet('badr-analytics-consent', value);
    removeBanner();
    if (value === 'yes') loadDetailedAnalytics();
    else {
      try {
        localStorage.removeItem('badr-analytics-visitor');
        sessionStorage.removeItem('badr-visit-session-v3');
        sessionStorage.removeItem('badr-visit-session-v4');
      } catch (_) {}
      window.badrVisitAnalytics?.destroy?.();
    }
  };

  const showBanner = () => {
    if (hardPrivacySignal || storageGet('badr-analytics-consent') || document.getElementById('badr-analytics-consent-banner')) return;
    const el = document.createElement('aside');
    el.id = 'badr-analytics-consent-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Analytics preferences');
    el.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:760px;margin:auto;padding:18px;border:1px solid #3a3a40;border-radius:14px;background:#151518;color:#f5f4f0;box-shadow:0 16px 45px #0008;font:14px/1.55 system-ui,sans-serif';
    el.innerHTML = '<strong style="display:block;font-size:16px;margin-bottom:7px">Privacy choices</strong><div style="color:#c9c7c1;margin-bottom:13px">With your permission, this portfolio uses privacy-minimized analytics to measure visit duration, viewed projects and general country. No detailed analytics are sent until you choose Allow. You can change this later in the Privacy page.</div><div style="display:flex;gap:9px;flex-wrap:wrap"><button type="button" data-choice="yes" style="padding:10px 14px;border:0;border-radius:999px;background:#c9a55a;color:#111;font:700 14px system-ui;cursor:pointer">Allow analytics</button><button type="button" data-choice="no" style="padding:10px 14px;border:1px solid #55555d;border-radius:999px;background:#202023;color:#fff;font:700 14px system-ui;cursor:pointer">Reject analytics</button><a href="/privacy.html" style="padding:10px 8px;color:#e0c37f;text-decoration:underline">Privacy details</a></div>';
    el.querySelector('[data-choice="yes"]').addEventListener('click', () => setChoice('yes'));
    el.querySelector('[data-choice="no"]').addEventListener('click', () => setChoice('no'));
    document.body.appendChild(el);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showBanner, { once: true });
  else showBanner();
  loadDetailedAnalytics();
})();
