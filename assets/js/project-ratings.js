(() => {
  if (window.badrProjectRatingsBody === document.body) return;
  window.badrProjectRatingsBody = document.body;

  const prefix = 'badr-rating-v1:';
  const memory = new Map();
  const widgets = new Map();
  let serial = 0;

  const slug = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const projectId = path => ({
    '/avena.html': 'avena',
    '/aura': 'aura',
    '/aura/index.html': 'aura',
    '/vareno': 'vareno',
    '/vareno/index.html': 'vareno',
    '/idh': 'idh',
    '/idh/index.html': 'idh'
  }[path] || path);

  const isHome = () => ['/', '/index.html'].includes(location.pathname);

  const addPolishStyles = () => {
    if (document.getElementById('badr-home-polish-styles')) return;
    const style = document.createElement('style');
    style.id = 'badr-home-polish-styles';
    style.textContent = `
      .work-toggle-wrap{display:flex;justify-content:center;margin-top:24px}
      .work-toggle{cursor:pointer}
      .production-proof{margin-top:22px}
      .production-proof .two{align-items:stretch}
      .production-proof .panel{height:100%}
      .production-proof .eyebrow{margin-bottom:8px}
      .production-proof h3{margin-top:0}
      .production-proof .chips{margin-top:18px}
      #avena-feature{max-width:980px;margin-left:auto;margin-right:auto}
      #avena-feature .caseHero{box-shadow:0 24px 70px rgba(0,0,0,.28)}
      @media(max-width:620px){
        #avena-feature{margin-bottom:28px!important}
        .work-toggle-wrap{margin-top:18px}
      }
    `;
    document.head.appendChild(style);
  };

  const optimizeVideos = () => {
    if (!('IntersectionObserver' in window)) return;
    const videos = Array.from(document.querySelectorAll('#work .card video, #character-scenes video'));
    if (!videos.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const video = entry.target;
        const deferredSrc = video.dataset.deferredSrc;
        if (deferredSrc) {
          video.src = deferredSrc;
          delete video.dataset.deferredSrc;
          video.load();
        }
        observer.unobserve(video);
      });
    }, { rootMargin: '650px 0px' });

    videos.forEach(video => {
      if (video.autoplay || !video.getAttribute('src')) return;
      video.preload = 'none';
      video.dataset.deferredSrc = video.getAttribute('src');
      video.removeAttribute('src');
      video.load();
      observer.observe(video);
    });
  };

  const addProductionExperience = () => {
    if (document.getElementById('production-experience')) return;
    const about = document.getElementById('about');
    if (!about) return;

    const section = document.createElement('section');
    section.id = 'production-experience';
    section.className = 'production-proof';
    section.innerHTML = `
      <div class="wrap">
        <div class="sectionHead">
          <h2>Print & Production Experience</h2>
          <p>Hands-on design experience that connects screen-based creative work with real production requirements.</p>
        </div>
        <div class="two">
          <div class="panel">
            <div class="eyebrow">Apparel & custom production</div>
            <h3>Design prepared for real-world output.</h3>
            <p>Practical experience preparing artwork for T-shirt and apparel printing, working with production constraints and turning design files into finished custom products.</p>
            <div class="chips"><span class="chip">T-shirt Printing</span><span class="chip">Artwork Preparation</span><span class="chip">Custom Apparel</span><span class="chip">Production Files</span></div>
          </div>
          <div class="panel">
            <div class="eyebrow">Acrylic & custom fabrication</div>
            <h3>From design file to physical product.</h3>
            <p>Previous stationery-production experience includes acrylic product design, cutting equipment and custom stamp design and production — useful for roles that combine design with fabrication.</p>
            <div class="chips"><span class="chip">Acrylic Design</span><span class="chip">Cutting Equipment</span><span class="chip">Custom Stamps</span><span class="chip">Production Workflow</span></div>
          </div>
        </div>
      </div>`;
    about.parentNode.insertBefore(section, about);
  };

  const polishHome = () => {
    if (!isHome() || document.documentElement.dataset.homePolished === '1') return;
    document.documentElement.dataset.homePolished = '1';
    addPolishStyles();

    // AVENA and IDH already have strong previews in Selected Work; keep their full details on project pages.
    document.querySelector('#avena-design')?.remove();
    document.querySelector('#idh-design')?.remove();

    // Remove legacy duplicate VARENO blocks if an older build leaves them behind.
    document.querySelector('#vareno-feature')?.remove();
    document.querySelector('#vareno-showcase')?.remove();

    const workHead = document.querySelector('#work .sectionHead');
    if (workHead) {
      const heading = workHead.querySelector('h2');
      const copy = workHead.querySelector('p');
      if (heading) heading.textContent = 'Selected Work — Highlights';
      if (copy) copy.textContent = 'A focused selection of brand identity, AI-assisted product advertising and video editing. Additional video work is available below on demand.';
    }

    // Keep the homepage concise: AVENA feature + five strongest cards = six primary projects.
    const grid = document.querySelector('#work .grid');
    if (grid) {
      const cards = Array.from(grid.children).filter(node => node.matches('.card'));
      const hiddenCards = cards.slice(5);
      hiddenCards.forEach(card => { card.hidden = true; card.dataset.secondaryWork = '1'; });

      if (hiddenCards.length) {
        const wrap = document.createElement('div');
        wrap.className = 'work-toggle-wrap';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn work-toggle';
        button.setAttribute('aria-expanded', 'false');
        button.textContent = `View more video work (${hiddenCards.length})`;
        button.addEventListener('click', () => {
          const expanded = button.getAttribute('aria-expanded') === 'true';
          hiddenCards.forEach(card => { card.hidden = expanded; });
          button.setAttribute('aria-expanded', String(!expanded));
          button.textContent = expanded ? `View more video work (${hiddenCards.length})` : 'Show fewer projects';
        });
        wrap.appendChild(button);
        grid.insertAdjacentElement('afterend', wrap);
      }
    }

    addProductionExperience();
    optimizeVideos();
  };

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
      if (link.hidden) wrapper.hidden = true;
      if (link.dataset.secondaryWork) wrapper.dataset.secondaryWork = link.dataset.secondaryWork;
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
      const id = video
        ? `video-${slug(new URL(video.dataset.deferredSrc || video.currentSrc || video.src, location.href).pathname.split('/').pop().replace(/\.[^.]+$/, ''))}`
        : `project-${slug(projectId(path) || title)}`;
      add(link ? card : card.querySelector('.cardBody') || card, id, title, !!link);
    });

    document.querySelectorAll('video').forEach(video => {
      if (video.closest('.card')) return;
      const feature = video.closest('.showreelBox, .caseVideoFeature') || video.parentElement;
      const title = feature.querySelector('h3, h4')?.textContent.trim() || video.getAttribute('aria-label') || 'Video';
      const src = video.dataset.deferredSrc || video.currentSrc || video.src;
      const id = `video-${slug(new URL(src, location.href).pathname.split('/').pop().replace(/\.[^.]+$/, ''))}`;
      add(feature.querySelector('.showreelCopy, .caseVideoCopy') || feature, id, title);
    });

    const projects = [
      ['#avena-feature .caseIntro', 'avena', 'AVENA Medical Center'],
      ['#idh-design .caseIntro', 'idh', 'IDH — Integrated Development Holdings'],
      ['#vareno-case', 'vareno', 'VARENO Barber Club']
    ];
    projects.forEach(([selector, id, title]) => {
      document.querySelectorAll(selector).forEach(intro => add(intro.firstElementChild || intro, `project-${id}`, title));
    });

    // HATAN is identified only by its own title to prevent a rating widget from inheriting another project label.
    document.querySelectorAll('#design .caseIntro').forEach(intro => {
      const eyebrow = intro.querySelector('.eyebrow')?.textContent || '';
      if (eyebrow.includes('HATAN')) add(intro.firstElementChild || intro, 'project-hatan', 'HATAN — Fine Foods & Confections');
    });

    const path = location.pathname.replace(/\/$/, '');
    const pageId = {
      '/aura': 'aura', '/aura/index.html': 'aura',
      '/vareno': 'vareno', '/vareno/index.html': 'vareno',
      '/idh': 'idh', '/idh/index.html': 'idh',
      '/avena.html': 'avena'
    }[path];
    if (pageId) {
      const hero = document.querySelector('main .hero .wrap, main .hero, main header');
      add(hero, `project-${pageId}`, document.querySelector('h1')?.textContent.trim() || pageId.toUpperCase());
    }
  };

  let scheduled = false;
  const observe = () => {
    polishHome();
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
