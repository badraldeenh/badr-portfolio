(() => {
  if (!window.badrFinalPolishLoader) {
    window.badrFinalPolishLoader = true;
    const polish = document.createElement('script');
    polish.src = '/assets/js/final-polish.js?v=1';
    polish.async = false;
    document.head.appendChild(polish);
  }
  if (!window.badrFinalTouchLoader) {
    window.badrFinalTouchLoader = true;
    const touch = document.createElement('script');
    touch.src = '/assets/js/final-touch.js?v=1';
    touch.async = false;
    document.head.appendChild(touch);
  }
  if (!window.badrHatanCampaignLoader) {
    window.badrHatanCampaignLoader = true;
    const hatan = document.createElement('script');
    hatan.src = '/assets/js/restore-hatan-campaign.js?v=2';
    hatan.async = false;
    document.head.appendChild(hatan);
  }
  if (!window.badrVisitAnalyticsCoreLoader) {
    window.badrVisitAnalyticsCoreLoader = true;
    const analytics = document.createElement('script');
    analytics.src = '/assets/js/visit-duration-core.js?v=1';
    analytics.async = false;
    document.head.appendChild(analytics);
  }
})();
