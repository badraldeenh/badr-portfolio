(() => {
  if (window.badrProjectRatingsBody === document.body) return;
  window.badrProjectRatingsBody = document.body;
  const prefix = 'badr-rating-v1:';
  const memory = new Map();
  const widgets = new Map();
  let serial = 0;
  const projectId = path => ({ '/avena.html': 'avena', '/aura': 'aura', '/aura/index.html': 'aura', '/vareno': 'vareno', '/vareno/index.html': 'vareno', '/idh': 'idh', '/idh/index.html': 'idh', '/hatan': 'hatan', '/hatan/index.html': 'hatan' }[path] || path);
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
    status.textContent = 'Choose 1–5 stars. Your choice is saved in this browser.';
    for (let score = 1; score <= 5; score++) {
      const star = document.createElement('button');
      star.type = 'button';
      star.className = 'rating-star';
      star.textContent = '★';
      star.setAttribute('aria-label', `${score} ${score === 1 ? 'star' : 'stars'}`);
      star.title = `${score}/5`;
      star.addEventListener('click', () => {
        let persisted = true;
        memory.set(id, score);
        try { localStorage.setItem(prefix + id, String(score)); }
        catch (_) { persisted = false; }
        (widgets.get(id) || []).forEach(other => {
          update(other, score);
          other.querySelector('.rating-status').textContent = persisted
            ? `Thank you! Your ${score}/5 rating is saved in this browser.`
            : `Thank you! Your ${score}/5 rating is kept for this visit.`;
        });
      });
      stars.appendChild(star);
    }
    panel.append(stars, status);
    widget.append(toggle, panel);
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
      const id = video ? `video-${slug(new URL(video.currentSrc || video.getAttribute('src') || video.dataset.src, location.href).pathname.split('/').pop().replace(/\.[^.]+$/, ''))}` : `project-${slug(projectId(path) || title)}`;
      add(link ? card : card.querySelector('.cardBody') || card, id, title, !!link);
    });
    document.querySelectorAll('video').forEach(video => {
      if (video.closest('.card')) return;
      const feature = video.closest('.showreelBox, .caseVideoFeature') || video.parentElement;
      const title = feature.querySelector('h3, h4')?.textContent.trim() || video.getAttribute('aria-label') || 'Video';
      const id = `video-${slug(new URL(video.currentSrc || video.getAttribute('src') || video.dataset.src, location.href).pathname.split('/').pop().replace(/\.[^.]+$/, ''))}`;
      add(feature.querySelector('.showreelCopy, .caseVideoCopy') || feature, id, title);
    });
    const projects = [
      ['#avena-feature .caseIntro, #avena-design .caseIntro', 'avena', 'AVENA Medical Center'],
      ['#idh-design .caseIntro', 'idh', 'IDH — Integrated Development Holdings'],
      ['#vareno-case, #vareno-feature .vf-head, #vareno-showcase .vr-title', 'vareno', 'VARENO Barber Club'],
      ['#hatan .caseIntro', 'hatan', 'HATAN Patisserie']
    ];
    projects.forEach(([selector, id, title]) => document.querySelectorAll(selector).forEach(intro => add(intro.firstElementChild || intro, `project-${id}`, title)));
    document.querySelectorAll('[data-project-id]').forEach(card => {
      const title = card.querySelector('h3')?.textContent.trim();
      if (title) add(card.querySelector('.identityCopy') || card, `project-${card.dataset.projectId}`, title);
    });
    document.querySelectorAll('.caseIntro').forEach(intro => {
      if (intro.querySelector('.eyebrow')?.textContent.includes('HATAN')) add(intro.firstElementChild || intro, 'project-hatan', 'HATAN Patisserie');
    });
    const path = location.pathname.replace(/\/$/, '');
    const pageId = { '/aura': 'aura', '/aura/index.html': 'aura', '/vareno': 'vareno', '/vareno/index.html': 'vareno', '/idh': 'idh', '/idh/index.html': 'idh', '/hatan': 'hatan', '/hatan/index.html': 'hatan', '/avena.html': 'avena' }[path];
    if (pageId) {
      const hero = document.querySelector('main .hero .wrap, main .hero, main header');
      add(hero, `project-${pageId}`, document.querySelector('h1')?.textContent.trim() || pageId.toUpperCase());
    }
  };
  let scheduled = false;
  const observe = () => {
    scan();
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
