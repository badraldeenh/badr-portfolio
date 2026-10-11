(() => {
  if (!window.badrFinalPolishLoader) {
    window.badrFinalPolishLoader = true;
    const polish = document.createElement('script');
    polish.src = '/assets/js/final-polish.js?v=1';
    polish.async = false;
    document.head.appendChild(polish);
  }
  if (!window.badrVisitAnalyticsCoreLoader) {
    window.badrVisitAnalyticsCoreLoader = true;
    const analytics = document.createElement('script');
    analytics.src = '/assets/js/visit-duration-core.js?v=1';
    analytics.async = false;
    document.head.appendChild(analytics);
  }
})();
