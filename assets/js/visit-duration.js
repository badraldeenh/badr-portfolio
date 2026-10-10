(() => {
  if (typeof window.va !== 'function') return;

  const SESSION_KEY = 'badr_portfolio_session_v2';
  const ACTIVE_KEY = 'badr_portfolio_active_ms_v2';
  const CAMPAIGN_KEY = 'badr_portfolio_campaign_v2';

  const makeId = () => {
    try {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID().replace(/-/g, '').slice(0, 12);
      }
    } catch (_) {}
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`.slice(0, 12);
  };

  const clean = (value, fallback) => {
    const safe = String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48);
    return safe || fallback;
  };

  const params = new URLSearchParams(location.search);
  const campaignFromUrl = clean(params.get('utm_campaign'), 'direct');

  let sessionId = makeId();
  let campaign = campaignFromUrl;
  let accumulatedMs = 0;

  try {
    sessionId = sessionStorage.getItem(SESSION_KEY) || sessionId;
    sessionStorage.setItem(SESSION_KEY, sessionId);

    campaign = sessionStorage.getItem(CAMPAIGN_KEY) || campaignFromUrl;
    sessionStorage.setItem(CAMPAIGN_KEY, campaign);

    accumulatedMs = Number(sessionStorage.getItem(ACTIVE_KEY) || 0) || 0;
  } catch (_) {}

  let visibleSince = document.visibilityState === 'visible' ? performance.now() : null;
  let lastSentSeconds = -1;

  const currentActiveMs = () => {
    const liveMs = visibleSince === null ? 0 : performance.now() - visibleSince;
    return Math.max(0, accumulatedMs + liveMs);
  };

  const save = () => {
    try {
      sessionStorage.setItem(ACTIVE_KEY, String(Math.round(currentActiveMs())));
    } catch (_) {}
  };

  const sendDuration = () => {
    const seconds = Math.max(1, Math.floor(currentActiveMs() / 1000));
    if (seconds === lastSentSeconds) return;
    lastSentSeconds = seconds;

    const virtualPath = `/__engagement/${campaign}/${sessionId}/${seconds}s`;
    window.va('pageview', {
      route: '/__engagement/[campaign]/[session]/[duration]',
      path: virtualPath
    });
  };

  const pauseTimer = () => {
    if (visibleSince !== null) {
      accumulatedMs += performance.now() - visibleSince;
      visibleSince = null;
      save();
    }
  };

  const resumeTimer = () => {
    if (visibleSince === null) visibleSince = performance.now();
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      pauseTimer();
      sendDuration();
    } else {
      resumeTimer();
    }
  });

  window.addEventListener('pagehide', () => {
    pauseTimer();
    sendDuration();
  }, { capture: true });

  window.addEventListener('pageshow', () => {
    if (document.visibilityState === 'visible') resumeTimer();
  });
})();
