(() => {
  window.badrVisitAnalytics?.destroy();
  const controller = new AbortController();
  const signal = controller.signal;
  const currentBody = document.body;
  let interval, notice, started = false, stopped = false;
  let finish = () => {};
  window.badrVisitAnalytics = { destroy() { finish(); stopped = true; controller.abort(); clearInterval(interval); notice?.remove(); } };
  const storage = (store, key, value) => { try { if (value === undefined) return store.getItem(key); store.setItem(key, value); } catch (_) {} };
  const uuid = () => crypto.randomUUID();
  const slug = v => String(v || '').toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 64);
  const text = el => el?.textContent?.trim().replace(/\s+/g, ' ').slice(0, 160) || '';
  const optedOut = () => navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || storage(localStorage, 'badr-analytics-consent') === 'no';
  async function begin() {
    if (started || stopped || optedOut()) return;
    started = true;
    notice?.remove();
    const stamp = Date.now();
    const params = new URLSearchParams(location.search);
    const explicitRef = slug(params.get('ref') || params.get('utm_campaign'));
    let session;
    try { session = JSON.parse(storage(sessionStorage, 'badr-visit-session-v3') || 'null'); } catch (_) {}
    if (!session || stamp - session.lastSeen > 1800000 || (explicitRef && explicitRef !== session.ref)) {
      let source = 'direct';
      try { source = document.referrer ? new URL(document.referrer).hostname : 'direct'; } catch (_) {}
      session = { id: uuid(), ref: explicitRef || 'direct', source, lastSeen: stamp };
    }
    const visitor = storage(localStorage, 'badr-analytics-visitor') || uuid();
    storage(localStorage, 'badr-analytics-visitor', visitor);
    const pageId = uuid(), path = location.pathname, title = document.title;
    const metrics = Object.create(null);
    let activeMs = 0, elapsedMs = 0, lastTick = performance.now(), lastSend = 0, activeProject = '', activeSection = '', wasVisible = document.visibilityState === 'visible';
    const get = (key, label) => metrics[key] || (metrics[key] = { title: label, ms: 0, count: 0 });
    const visibleArea = el => {
      const r = el.getBoundingClientRect();
      return Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) * Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0));
    };
    const projects = () => {
      const items = Array.from(document.querySelectorAll('.card')).map(el => ({ el, key: slug((el.querySelector('video')?.getAttribute('src') || el.querySelector('video')?.getAttribute('data-src'))?.split('/').pop().replace(/\.[^.]+$/, '') || text(el.querySelector('h3'))), title: text(el.querySelector('h3')) }));
      document.querySelectorAll('#idh-design,#avena-feature,#avena-design').forEach(el => items.push({ el, key: el.id.startsWith('avena') ? 'avena' : 'idh', title: el.id.startsWith('avena') ? 'AVENA Medical Center' : 'IDH Real Estate' }));
      // Some long case studies use a heading followed by sibling images instead of a wrapper.
      document.querySelectorAll('.caseIntro').forEach(el => {
        const label = text(el.querySelector('.eyebrow'));
        const key = /VARENO/i.test(label) ? 'vareno' : /HATAN/i.test(label) ? 'hatan' : '';
        if (!key) return;
        const end = Array.from(el.parentElement.querySelectorAll('.caseIntro')).find(other => other !== el && (el.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING));
        const top = el.getBoundingClientRect().top;
        const bottom = (end || el.closest('section') || el.parentElement).getBoundingClientRect()[end ? 'top' : 'bottom'];
        items.push({ key, title: label, area: Math.max(0, Math.min(bottom, innerHeight) - Math.max(top, 0)) * innerWidth });
      });
      document.querySelectorAll('[data-project-id]').forEach(el => items.push({ el, key: el.dataset.projectId, title: text(el.querySelector('h3')) }));
      const pageProject = { '/aura': 'aura', '/vareno': 'vareno', '/idh': 'idh', '/aura/': 'aura', '/aura/index.html': 'aura', '/vareno/': 'vareno', '/vareno/index.html': 'vareno', '/idh/': 'idh', '/idh/index.html': 'idh', '/hatan': 'hatan', '/hatan/': 'hatan', '/hatan/index.html': 'hatan', '/avena.html': 'avena' }[path];
      if (pageProject) items.push({ key: pageProject, title: text(document.querySelector('h1')) || pageProject.toUpperCase(), area: innerWidth * innerHeight });
      return items.map(x => ({ ...x, area: x.area ?? visibleArea(x.el) })).filter(x => x.key && x.area > 0).sort((a, b) => b.area - a.area)[0];
    };
    function tick() {
      const now = performance.now();
      const delta = Math.max(0, now - lastTick);
      lastTick = now;
      elapsedMs += delta;
      const countVisible = wasVisible;
      wasVisible = document.visibilityState === 'visible';
      if (!countVisible) return;
      activeMs += delta;
      const project = projects();
      if (project) {
        const metric = get('project:' + project.key, project.title);
        metric.ms += delta;
        if (activeProject !== project.key) metric.count++;
      }
      activeProject = project?.key || '';
      const sections = Array.from(document.querySelectorAll('section[id]')).map(el => ({ el, area: visibleArea(el) })).filter(x => x.area > 0).sort((a, b) => b.area - a.area);
      const section = sections[0]?.el;
      if (section) {
        const metric = get('section:' + slug(section.id), text(section.querySelector('h2')) || section.id);
        metric.ms += delta;
        if (activeSection !== section.id) metric.count++;
      }
      activeSection = section?.id || '';
      document.querySelectorAll('video').forEach(video => {
        if (video.paused || video.ended || video.readyState < 2 || !visibleArea(video)) return;
        const key = slug((video.getAttribute('src') || video.getAttribute('data-src') || video.querySelector('source')?.getAttribute('src') || '').split('/').pop().replace(/\.[^.]+$/, ''));
        if (key) get('video:' + key, video.getAttribute('aria-label') || text(video.closest('.card,.caseVideoFeature,.showreelBox')?.querySelector('h3,h4')) || key).ms += delta;
      });
    }
    function send(beacon = false) {
      if (stopped || optedOut()) return;
      tick();
      session.lastSeen = Date.now();
      storage(sessionStorage, 'badr-visit-session-v3', JSON.stringify(session));
      const selectedMetrics = Object.fromEntries(Object.entries(metrics).slice(0, 80).map(([k, v]) => [k, { title: v.title, ms: Math.round(v.ms), count: v.count }]));
      const payload = JSON.stringify({ id: session.id, visitor, pageId, ref: session.ref, source: session.source, path, title, activeMs: Math.round(activeMs), elapsedMs: Math.round(elapsedMs), metrics: selectedMetrics });
      lastSend = performance.now();
      const url = '/api/visitor-analytics';
      if (beacon && navigator.sendBeacon?.(url, new Blob([payload], { type: 'application/json' }))) return;
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
    }
    finish = () => { if (!stopped) send(true); };
    document.addEventListener('visibilitychange', () => { send(document.visibilityState === 'hidden'); }, { signal });
    window.addEventListener('pagehide', () => send(true), { signal });
    window.addEventListener('pageshow', () => { lastTick = performance.now(); wasVisible = document.visibilityState === 'visible'; }, { signal });
    document.addEventListener('click', event => {
      const link = event.target.closest?.('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      const action = /\.pdf(?:$|\?)/i.test(href) ? 'cv' : /^(mailto:|https:\/\/wa.me\/)/i.test(href) ? 'contact' : '';
      if (action) { get('click:' + action, action === 'cv' ? 'CV opened' : 'Contact clicked').count++; send(true); }
      // Preserve the company label across explicitly opened internal project tabs.
      try { const url = new URL(link.href); if (session.ref !== 'direct' && url.origin === location.origin && /(?:aura|idh|vareno|avena|hatan)/i.test(url.pathname)) { url.searchParams.set('ref', session.ref); link.href = url.href; } } catch (_) {}
    }, { signal });
    document.addEventListener('play', event => {
      const video = event.target;
      if (video.tagName !== 'VIDEO') return;
      const key = slug((video.getAttribute('src') || video.getAttribute('data-src') || '').split('/').pop().replace(/\.[^.]+$/, ''));
      if (key) get('video:' + key, video.getAttribute('aria-label') || key).count++;
    }, { capture: true, signal });
    interval = setInterval(() => {
      if (optedOut()) { clearInterval(interval); controller.abort(); return; }
      tick();
      if (document.visibilityState === 'visible' && performance.now() - lastSend >= 15000) send();
    }, 1000);
    send();
  }
  function consent() {
    if (optedOut() || stopped) return;
    if (storage(localStorage, 'badr-analytics-consent') === 'yes') return begin();
    notice = document.createElement('aside');
    notice.setAttribute('aria-label', 'Anonymous analytics preferences');
    notice.style.cssText = 'position:fixed;bottom:16px;left:16px;right:16px;max-width:520px;z-index:90;padding:16px;border:1px solid #66532c;border-radius:12px;background:#171719;color:#f5f4f0;font:14px/1.5 system-ui;box-shadow:0 8px 32px #0008';
    const message = document.createElement('p'); message.style.margin = '0 0 12px';
    message.textContent = 'Allow anonymous visit analytics? This helps me understand time spent on projects and visits from application links.';
    const privacy = document.createElement('a'); privacy.href = '/privacy.html'; privacy.textContent = 'Privacy details'; privacy.style.cssText = 'text-decoration:underline;margin-right:12px';
    const button = (label, choice) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.style.cssText = 'padding:8px 12px;margin-right:8px;border:1px solid #c9a55a;border-radius:6px;background:#29251c;color:#f5f4f0;cursor:pointer;font:inherit'; b.onclick = () => { storage(localStorage, 'badr-analytics-consent', choice); notice.remove(); if (choice === 'yes') begin(); }; return b; };
    notice.append(message, privacy, button('Allow', 'yes'), button('Decline', 'no'));
    document.body.appendChild(notice);
  }
  fetch('/api/visitor-analytics?action=status', { cache: 'no-store', signal }).then(r => r.ok ? r.json() : { enabled: false }).then(status => {
    if (stopped || currentBody !== document.body) return;
    if (status.enabled) consent();
    // Duration reporting stays off until central storage is configured.
    // Synthetic pageviews would inflate real pageview and visitor reports.
  }).catch(() => {});
})();
