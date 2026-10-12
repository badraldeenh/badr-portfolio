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
  loadScript('badrHatanCampaignLoader', '/assets/js/restore-hatan-campaign.js?v=4');
  loadScript('badrKettloHomeLoader', '/assets/js/kettlo-home.js?v=1');

  const privacyBlocked = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || (() => { try { return localStorage.getItem('badr-analytics-consent') === 'no'; } catch (_) { return false; } })();
  if (!privacyBlocked) {
    loadScript('badrVisitCoreLoader', '/assets/js/visit-duration-core.js?v=5');
    loadScript('badrVercelAnalyticsLoader', '/_vercel/insights/script.js');
  }
})();
