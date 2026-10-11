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

  // Detailed per-visitor analytics are intentionally disabled.
  // This avoids consent pop-ups and individual session tracking while
  // leaving the portfolio experience unchanged for every visitor.
  window.badrVisitAnalytics?.destroy?.();
  document.getElementById('badr-analytics-consent-banner')?.remove();
})();
