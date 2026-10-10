(() => {
  const analytics = window.va;
  if (typeof analytics !== 'function') return;

  const SESSION_KEY = 'badr_portfolio_session_v1';
  const ACTIVE_KEY = 'badr_portfolio_active_ms_v1';
  const HEARTBEAT_MS = 15000;

  const makeId = () => {
    try {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID().replace(/-/g, '').slice(0, 12);
      }
    } catch (_) {}
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`.slice(0, 12);
  };

  let sessionId = makeId();
  let accumulatedMs = 0;

  try {
    sessionId = sessionStorage.getItem(SESSION_KEY) || sessionId;
    sessionStorage.setItem(SESSION_KEY, sessionId);
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

  const durationBucket = (seconds) => {
    if (seconds < 10) return '0-9s';
    if (seconds < 30) return '10-29s';
    if (seconds < 60) return '30-59s';
    if (seconds < 120) return '60-119s';
    if (seconds < 300) return '120-299s';
    return '300s+';
  };

  const sendDuration = (reason, force = false) => {
    const seconds = Math.floor(currentActiveMs() / 1000);
    if (!force && (seconds <= 0 || seconds === lastSentSeconds)) return;
    lastSentSeconds = seconds;

    window.va('event', {
      name: 'Visit Duration',
      data: {
        seconds,
        bucket: durationBucket(seconds),
        reason,
        session: sessionId,
        path: location.pathname || '/'
      }
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
      sendDuration('hidden', true);
    } else {
      resumeTimer();
    }
  });

  window.addEventListener('pagehide', () => {
    pauseTimer();
    sendDuration('pagehide', true);
  }, { capture: true });

  window.addEventListener('pageshow', () => {
    if (document.visibilityState === 'visible') resumeTimer();
  });

  window.setInterval(() => {
    if (document.visibilityState === 'visible') {
      save();
      sendDuration('heartbeat');
    }
  }, HEARTBEAT_MS);
})();
