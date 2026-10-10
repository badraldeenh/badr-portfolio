(() => {
  if (window.badrProjectRatingsBody === document.body) return;
  window.badrProjectRatingsBody = document.body;
  const prefix = 'badr-rating-v2:';
  const memory = new Map();
  const widgets = new Map();
  const summaries = new Map();
  let loadPromise = null;
  let ready = false;
  const api = '/api/ratings';
  const renderSummary = (widget, data) => {
    widget.querySelector('.rating-summary').textContent = data.count
      ? `★ ${data.average.toFixed(1)}/5 · ${data.count} ${data.count === 1 ? 'rating' : 'ratings'}`
      : 'No ratings yet';
  };
  const loadRatings = (force = false) => {
    if (loadPromise && !force) return loadPromise;
    loadPromise = fetch(api, { credentials: 'same-origin', cache: 'no-store' })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load ratings.');
        if (!Array.isArray(data.projects)) throw new Error('Could not load ratings.');
        ready = true;
        data.projects.forEach(project => {
          summaries.set(project.id, project);
          (widgets.get(project.id) || []).forEach(widget => renderSummary(widget, project));
        });
        return data;
      })
      .catch(error => { loadPromise = null; throw error; });
    return loadPromise;
  };
  let serial = 0;
  const slug = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const read = id => {
    try {
      const value = Number(localStorage.getItem(prefix + id));
      return Number.isInteger(value) && value >= 1 && value <= 5 ? value : 0;
    } catch (_) { return memory.get(id) || 0; }
  };
  const update = (widget, score) => {
    widget.querySelector('.rating-toggle').textContent = score ? `★ Your rating: ${score}/5` : '☆ Rate';
    widget.querySelectorAll('.rating-star').forEach((star, i) => {
      star.classList.toggle('is-filled', i < score);
      star.setAttribute('aria-pressed', String(i + 1 === score));
    });
  };
  const add = (host, id, title, padded = false) => {
    if (!host || Array.from(host.children).some(child => child.dataset.ratingId === id)) return;
    const widget = document.createElement('div');
    widget.className = 'project-rating' + (padded ? ' rating-padded' : '');
    widget.dataset.ratingId = id;
    const summary = document.createElement('span');
    summary.className = 'rating-summary';
    summary.textContent = 'Loading ratings…';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'rating-toggle';
    toggle.setAttribute('aria-label', `Rate ${title}`);
    toggle.setAttribute('aria-expanded', 'false');
    const panel = document.createElement('div');
    panel.className = 'rating-panel';
    panel.id = `project-rating-${++serial}`;
    panel.hidden = true;
    toggle.setAttribute('aria-controls', panel.id);
    const stars = document.createElement('div');
    stars.className = 'rating-stars';
    stars.setAttribute('role', 'group');
    stars.setAttribute('aria-label', `Choose a rating for ${title}`);
    const status = document.createElement('p');
    status.className = 'rating-status';
    status.setAttribute('role', 'status');
    status.textContent = 'Choose 1–5 stars. One rating per browser; you can change it later.';
    for (let score = 1; score <= 5; score++) {
      const star = document.createElement('button');
      star.type = 'button';
      star.className = 'rating-star';
      star.textContent = '★';
      star.setAttribute('aria-label', `${score} ${score === 1 ? 'star' : 'stars'}`);
      star.title = `${score}/5`;
      star.addEventListener('click', async () => {
        const related = (widgets.get(id) || []).filter(other => other.isConnected);
        related.forEach(other => {
          other.querySelectorAll('.rating-star').forEach(button => { button.disabled = true; });
          other.setAttribute('aria-busy', 'true');
          other.querySelector('.rating-status').textContent = 'Saving your rating…';
        });
        try {
          if (!ready) await loadRatings();
          const response = await fetch(api, { method: 'POST', credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, score }) });
          const data = await response.json();
          if (!response.ok || !data.saved) throw new Error(data.error || 'Could not save your rating. Please try again.');
          memory.set(id, score);
          try { localStorage.setItem(prefix + id, String(score)); } catch (_) {}
          related.forEach(other => {
            update(other, score);
            other.querySelector('.rating-status').textContent = `Thank you! Your ${score}/5 rating has been received. You can change it anytime.`;
          });
          // A refresh failure must not turn an acknowledged vote into a failed vote.
          loadRatings(true).catch(() => {});
        } catch (error) {
          related.forEach(other => { other.querySelector('.rating-status').textContent = error.message || 'Could not save your rating. Please try again.'; });
        } finally {
          related.forEach(other => {
            other.querySelectorAll('.rating-star').forEach(button => { button.disabled = false; });
            other.removeAttribute('aria-busy');
          });
        }
      });
      stars.appendChild(star);
    }
    panel.append(stars, status);
    widget.append(toggle, summary, panel);
    toggle.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      toggle.setAttribute('aria-expanded', String(!panel.hidden));
      if (!panel.hidden) (stars.querySelector('[aria-pressed="true"]') || stars.firstElementChild).focus();
    });
    widget.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        panel.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
      if (event.target.matches('.rating-star') && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const buttons = Array.from(stars.children);
        const index = buttons.indexOf(event.target);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? 4 : (index + (event.key === 'ArrowRight' ? 1 : 4)) % 5;
        buttons[next].focus();
      }
    });
    host.appendChild(widget);
    if (!widgets.has(id)) widgets.set(id, []);
    widgets.set(id, widgets.get(id).filter(other => other.isConnected).concat(widget));
    update(widget, read(id));
    if (summaries.has(id)) renderSummary(widget, summaries.get(id));
  };
  const scan = () => {
    document.querySelectorAll('a.card').forEach(link => {
      const wrapper = document.createElement('article');
      wrapper.className = link.className;
      if (link.id) { wrapper.id = link.id; link.removeAttribute('id'); }
      link.classList.remove('card');
      link.classList.add('rating-project-link');
      link.replaceWith(wrapper);
      wrapper.appendChild(link);
    });
    document.querySelectorAll('.card').forEach(card => {
      const title = card.querySelector('h3')?.textContent.trim();
      if (!title) return;
      const video = card.querySelector('video');
      const link = card.querySelector('.rating-project-link');
      const path = link ? new URL(link.href).pathname.replace(/\/$/, '') : '';
      const id = video ? `video-${slug(new URL(video.currentSrc || video.src, location.href).pathname.split('/').pop().replace(/\.[^.]+$/, ''))}` : `project-${slug(path || title)}`;
      add(link ? card : card.querySelector('.cardBody') || card, id, title, !!link);
    });
    document.querySelectorAll('video').forEach(video => {
      if (video.closest('.card')) return;
      const feature = video.closest('.showreelBox, .caseVideoFeature') || video.parentElement;
      const title = feature.querySelector('h3, h4')?.textContent.trim() || video.getAttribute('aria-label') || 'Video';
      const id = `video-${slug(new URL(video.currentSrc || video.src, location.href).pathname.split('/').pop().replace(/\.[^.]+$/, ''))}`;
      add(feature.querySelector('.showreelCopy, .caseVideoCopy') || feature, id, title);
    });
    const projects = [
      ['#avena-feature .caseIntro, #avena-design .caseIntro', 'avena', 'AVENA Medical Center'],
      ['#idh-design .caseIntro', 'idh', 'IDH — Integrated Development Holdings'],
      ['#vareno-case, #vareno-feature .vf-head, #vareno-showcase .vr-title', 'vareno', 'VARENO Barber Club'],
      ['#hatan .caseIntro', 'hatan', 'HATAN Patisserie']
    ];
    projects.forEach(([selector, id, title]) => document.querySelectorAll(selector).forEach(intro => add(intro.firstElementChild || intro, `project-${id}`, title)));
    document.querySelectorAll('.caseIntro').forEach(intro => {
      if (intro.querySelector('.eyebrow')?.textContent.includes('HATAN')) add(intro.firstElementChild || intro, 'project-hatan', 'HATAN Patisserie');
    });
    const path = location.pathname.replace(/\/$/, '');
    const pageId = { '/aura': 'aura', '/aura/index.html': 'aura', '/vareno': 'vareno', '/vareno/index.html': 'vareno', '/idh': 'idh', '/idh/index.html': 'idh', '/avena.html': 'avena' }[path];
    if (pageId) {
      const hero = document.querySelector('main .hero .wrap, main .hero, main header');
      add(hero, `project-${pageId}`, document.querySelector('h1')?.textContent.trim() || pageId.toUpperCase());
    }
  };
  let scheduled = false;
  const observe = () => {
    scan();
    loadRatings().then(data => {
      data.projects.forEach(project => {
        // The server is authoritative; do not upload old browser-only votes.
        const score = project.mine || 0;
        memory.set(project.id, score);
        try { localStorage.setItem(prefix + project.id, String(score)); } catch (_) {}
        (widgets.get(project.id) || []).forEach(widget => update(widget, score));
      });
    }).catch(() => {
      document.querySelectorAll('.rating-summary').forEach(summary => { summary.textContent = 'Ratings unavailable'; });
    });
    new MutationObserver(records => {
      if (scheduled || !records.some(record => Array.from(record.addedNodes).some(node => node.nodeType === 1 && !node.matches('.project-rating, .rating-star, .rating-panel, .rating-status')))) return;
      scheduled = true;
      requestAnimationFrame(() => { scheduled = false; scan(); });
    }).observe(document.body, { childList: true, subtree: true });
  };
  window.addEventListener('storage', event => {
    if (event.key === null) widgets.forEach((list, id) => list.forEach(widget => update(widget, read(id))));
    else if (event.key.startsWith(prefix)) (widgets.get(event.key.slice(prefix.length)) || []).forEach(widget => update(widget, read(event.key.slice(prefix.length))));
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observe, { once: true });
  else observe();
})();
