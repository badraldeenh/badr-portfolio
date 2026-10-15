(() => {
  if (window.badrRatingsBody === document.body) return;
  window.badrRatingsBody = document.body;

  const PREFIX = 'badr-rating-v1:';
  const widgets = new Map();
  let serial = 0;
  const slug = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const isHome = () => ['/', '/index.html'].includes(location.pathname);

  function addHomeStyles() {
    if (document.getElementById('badr-home-polish')) return;
    const style = document.createElement('style');
    style.id = 'badr-home-polish';
    style.textContent = `
      .card[hidden]{display:none!important}
      .work-toggle-wrap{display:flex;justify-content:center;margin-top:24px}
      .work-toggle{cursor:pointer}
      .production-proof{margin-top:22px}
      .production-proof .two{align-items:stretch}
      .production-proof .panel{height:100%}
      .production-proof .chips{margin-top:18px}
      #avena-feature{max-width:980px;margin-left:auto;margin-right:auto}
      #avena-feature .caseHero{box-shadow:0 24px 70px rgba(0,0,0,.28)}
      .recruiter-summary{padding:0 0 28px}
      .recruiter-summary-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
      .recruiter-summary-item{padding:18px;border:1px solid var(--line,#2b2b30);border-radius:14px;background:#111114}
      .recruiter-summary-item span{display:block;color:var(--accent,#c9a55a);font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px}
      .recruiter-summary-item b{display:block;font-size:14px;line-height:1.35;margin-bottom:5px;color:#f3f2ed}
      .recruiter-summary-item p{margin:0;color:#9e9d98;font-size:12px;line-height:1.5}
      .hatanPreview{margin:34px 0 0;border:1px solid var(--line,#2b2b30);border-radius:22px;overflow:hidden;background:linear-gradient(135deg,#171719,#111113)}
      .hatanPreviewMedia{display:block;background:#0a0a0b}
      .hatanPreviewMedia img{width:100%;height:auto;object-fit:contain}
      .hatanPreviewBody{padding:26px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:22px;align-items:end}
      .hatanPreviewBody h3{margin:5px 0 10px;font-size:28px}
      .hatanPreviewBody p{margin:0;color:#aaa9a4;max-width:760px}
      .hatanPreviewMeta{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
      .hatanPreviewMeta span{font-size:11px;color:#d7d5ce;padding:6px 9px;border:1px solid #323238;border-radius:999px;background:#101012}
      .ai-workflow-proof{margin-top:18px;padding-top:16px;border-top:1px solid var(--line,#2b2b30)}
      .ai-workflow-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px}
      .ai-workflow-head strong{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#f4dfad}
      .ai-workflow-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;border:1px solid rgba(201,165,90,.42);background:rgba(201,165,90,.09);color:#f4dfad;font-size:11px;font-weight:850;white-space:nowrap}
      .ai-workflow-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
      .ai-workflow-step{min-width:0;padding:10px;border:1px solid #29292e;border-radius:12px;background:#111114}
      .ai-workflow-step span{display:block;color:var(--accent,#c9a55a);font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px}
      .ai-workflow-step b{display:block;font-size:12px;line-height:1.3;margin-bottom:4px;color:#f0efe9}
      .ai-workflow-step p{margin:0!important;font-size:11px!important;line-height:1.45;color:#9f9e99!important}
      .ai-workflow-note{margin:10px 0 0!important;font-size:11px!important;line-height:1.5;color:#8f8e89!important}
      @media(max-width:760px){.recruiter-summary-grid{grid-template-columns:1fr}.hatanPreviewBody{grid-template-columns:1fr}.hatanPreviewBody .btn{justify-self:start}}
      @media(max-width:420px){.ai-workflow-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function applyCanadaPositioning() {
    document.title = 'Badr Eldin Mohamed Alamin — Graphic Designer & Multimedia Creator';
    const setMeta = (selector, value) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute('content', value);
    };
    setMeta('meta[name="description"]', 'Portfolio of Badr Eldin Mohamed Alamin — Graphic Designer, Multimedia Content Creator and Video Editor with branding, print production, social content and AI-assisted video experience. Open to opportunities in Canada.');
    setMeta('meta[property="og:title"]', 'Badr Eldin Mohamed Alamin — Creative Portfolio');
    setMeta('meta[property="og:description"]', 'Graphic Designer • Multimedia Content Creator • Video Editor');

    const brand = document.querySelector('.brand');
    if (brand) brand.innerHTML = 'BADR <span>ELDIN</span>';

    const hero = document.querySelector('header.hero');
    if (hero) {
      const eyebrow = hero.querySelector('.eyebrow');
      const lead = hero.querySelector('.lead');
      const micro = hero.querySelector('.micro');
      if (eyebrow) eyebrow.textContent = 'Graphic Designer • Multimedia Content Creator • Video Editor';
      if (lead) lead.textContent = 'Brand identity, print-ready design, social content and AI-assisted video — combining creative execution with hands-on production and marketing experience.';
      if (micro) micro.textContent = 'Based in the United Arab Emirates • Open to relocation to Canada • Available for remote interviews • Seeking employer-supported work authorization where required';
      const stats = [...hero.querySelectorAll('.stat')];
      const values = [
        ['Graphic Design', 'Brand identity, advertising & social content'],
        ['Print & Production', 'Print-ready artwork & custom production'],
        ['Video Editing', 'Premiere Pro & short-form advertising'],
        ['AI-Assisted Content', 'Creative development & visual production']
      ];
      stats.forEach((stat, index) => {
        if (!values[index]) return;
        const b = stat.querySelector('b');
        const span = stat.querySelector('span');
        if (b) b.textContent = values[index][0];
        if (span) span.textContent = values[index][1];
      });
    }

    const auraNav = document.querySelector('.links a[href="aura/"]');
    if (auraNav) {
      auraNav.href = '#production-experience';
      auraNav.textContent = 'Production';
    }

    const contact = document.querySelector('#contact .contact');
    if (contact) {
      const eyebrow = contact.querySelector('.eyebrow');
      const h2 = contact.querySelector('h2');
      const p = contact.querySelector('p');
      if (eyebrow) eyebrow.textContent = 'Canada opportunities';
      if (h2) h2.textContent = 'Open to graphic design and multimedia roles in Canada.';
      if (p) p.textContent = 'Based in the UAE and available for remote interviews.';
    }
  }

  function addRecruiterSummary() {
    if (document.getElementById('recruiter-summary')) return;
    const hero = document.querySelector('header.hero');
    if (!hero) return;
    const section = document.createElement('section');
    section.id = 'recruiter-summary';
    section.className = 'recruiter-summary';
    section.innerHTML = `
      <div class="wrap">
        <div class="recruiter-summary-grid" aria-label="Professional experience summary">
          <div class="recruiter-summary-item"><span>Current role</span><b>Marketing, Graphic Design & Social Media</b><p>MALEH & HELOW SWEETS — Abu Dhabi, UAE • 2025–Present</p></div>
          <div class="recruiter-summary-item"><span>Business scope</span><b>Creative support across six branches</b><p>Advertising visuals, social content, campaign execution and e-commerce product content.</p></div>
          <div class="recruiter-summary-item"><span>Hands-on production</span><b>Design that reaches real output</b><p>Print preparation, apparel printing, acrylic design, cutting equipment and custom stamp production.</p></div>
        </div>
      </div>`;
    hero.insertAdjacentElement('afterend', section);
  }

  function addProductionExperience() {
    if (document.getElementById('production-experience')) return;
    const about = document.getElementById('about');
    if (!about) return;
    const section = document.createElement('section');
    section.id = 'production-experience';
    section.className = 'production-proof';
    section.innerHTML = `
      <div class="wrap">
        <div class="sectionHead"><h2>Print & Production Experience</h2><p>Hands-on production knowledge that complements my digital design work and helps me prepare artwork for real-world output.</p></div>
        <div class="two">
          <div class="panel"><div class="eyebrow">Apparel & print production</div><h3>Production-ready artwork, not just screen design.</h3><p>Practical experience preparing artwork for T-shirt and apparel printing, working with print constraints and turning design files into finished custom products.</p><div class="chips"><span class="chip">T-shirt Printing</span><span class="chip">Artwork Preparation</span><span class="chip">Custom Apparel</span><span class="chip">Production Files</span></div></div>
          <div class="panel"><div class="eyebrow">Acrylic & custom fabrication</div><h3>From design file to physical product.</h3><p>Previous stationery-production experience includes acrylic product design, operating cutting equipment and custom stamp design and production.</p><div class="chips"><span class="chip">Acrylic Design</span><span class="chip">Cutting Equipment</span><span class="chip">Custom Stamps</span><span class="chip">Production Workflow</span></div></div>
        </div>
      </div>`;
    about.parentNode.insertBefore(section, about);
  }

  function addHatanWorkCard() {
    const grid = document.querySelector('#work .grid');
    if (!grid || grid.querySelector('[data-hatan-work-card="1"]')) return;
    const card = document.createElement('a');
    card.className = 'card';
    card.href = '/hatan/';
    card.dataset.hatanWorkCard = '1';
    card.setAttribute('aria-label', 'Open HATAN food brand and campaign case study');
    card.innerHTML = `<div class="media" style="aspect-ratio:16/9;background:#0a0a0b"><img src="/assets/img/hatan/hatan-brand-flatlay-mockup.webp" alt="HATAN premium food brand identity and packaging" loading="lazy" style="width:100%;height:100%;object-fit:contain"><span class="rank">Brand + Campaign Case Study</span></div><div class="cardBody"><div class="kicker">Branding • Packaging • AI-Assisted Video</div><h3>HATAN — Fine Foods & Confections</h3><p>A complete self-initiated food identity extended into packaging, retail touchpoints and a 15-second stadium-delivery campaign film.</p><div class="miniChips"><span>Brand Identity</span><span>Packaging</span><span>AI Video</span><span>Social Campaign</span></div><div class="actions" style="margin-top:14px"><span class="btn">View full case study →</span></div></div>`;
    grid.insertBefore(card, grid.firstElementChild);
  }

  function condenseHatanOnHome() {
    const designWrap = document.querySelector('#design .wrap');
    if (!designWrap || document.getElementById('hatan-preview')) return;
    const start = [...designWrap.children].find(el => el.classList?.contains('caseIntro') && /HATAN/i.test(el.textContent || ''));
    if (!start) return;
    const preview = document.createElement('article');
    preview.id = 'hatan-preview';
    preview.className = 'hatanPreview';
    preview.innerHTML = `
      <a class="hatanPreviewMedia" href="/hatan/" aria-label="View HATAN full case study"><img src="/assets/img/hatan/hatan-brand-flatlay-mockup.webp" alt="HATAN premium food brand identity showcase" loading="lazy"></a>
      <div class="hatanPreviewBody"><div><div class="eyebrow">HATAN — Fine Foods & Confections</div><h3>Premium Food Brand + Campaign</h3><p>Brand identity, packaging and retail applications extended into a 15-second AI-assisted stadium delivery campaign. The full case study is now separated from the homepage for faster review.</p><div class="hatanPreviewMeta"><span>Branding</span><span>Packaging</span><span>Retail</span><span>AI-Assisted Video</span></div></div><a class="btn primary" href="/hatan/">View full HATAN case study →</a></div>`;
    designWrap.insertBefore(preview, start);
    let node = start;
    while (node) {
      const next = node.nextElementSibling;
      node.remove();
      node = next;
    }
  }

  function addAiWorkflowProof() {
    const projects = [
      {
        title: 'Chocolate Craft Film',
        kicker: 'AI-Assisted Product Commercial',
        role: 'AI-assisted visual development & video editing',
        concept: 'Premium chocolate storytelling focused on texture, pouring and product detail.',
        ai: 'AI-assisted scene development for cinematic pouring, break-apart and texture visuals.',
        edit: 'Shot selection, pacing, continuity and final polish in Adobe Premiere Pro.',
        final: 'Finished chocolate product film for a premium social-ad presentation.'
      },
      {
        title: 'Mango Beverage Commercial',
        kicker: 'AI-Assisted Beverage Commercial',
        role: 'AI-assisted visual development & video editing',
        concept: 'Fresh vertical beverage concept built around mango, motion and a clean summer mood.',
        ai: 'AI-assisted development of fruit motion, product-focused scenes and supporting visuals.',
        edit: 'Vertical sequencing, pacing, transitions and final social-ad finish.',
        final: 'Finished 9:16 beverage commercial for portfolio presentation.'
      }
    ];

    const cards = [...document.querySelectorAll('#work .card')];
    projects.forEach(project => {
      const card = cards.find(item => item.querySelector('h3')?.textContent?.trim() === project.title);
      if (!card || card.dataset.aiWorkflow === '1') return;
      const body = card.querySelector('.cardBody');
      if (!body) return;
      card.dataset.aiWorkflow = '1';
      const kicker = body.querySelector('.kicker');
      if (kicker) kicker.textContent = project.kicker;
      body.querySelectorAll('.projectFacts div').forEach(row => {
        if (row.querySelector('dt')?.textContent?.trim() === 'Role') {
          const dd = row.querySelector('dd');
          if (dd) dd.textContent = project.role;
        }
      });
      const proof = document.createElement('div');
      proof.className = 'ai-workflow-proof';
      proof.setAttribute('aria-label', `${project.title} AI-assisted workflow`);
      proof.innerHTML = `
        <div class="ai-workflow-head"><strong>Concept → Process → Final</strong><span class="ai-workflow-badge">✦ AI-Assisted</span></div>
        <div class="ai-workflow-grid">
          <div class="ai-workflow-step"><span>01 • Concept</span><b>Creative Direction</b><p>${project.concept}</p></div>
          <div class="ai-workflow-step"><span>02 • Process</span><b>AI Visual Development</b><p>${project.ai}</p></div>
          <div class="ai-workflow-step"><span>03 • Process</span><b>Edit & Finish</b><p>${project.edit}</p></div>
          <div class="ai-workflow-step"><span>04 • Final</span><b>Final Film</b><p>${project.final}</p></div>
        </div>
        <p class="ai-workflow-note">AI is used as part of the creative workflow. The video above is the actual final project shown in this portfolio.</p>`;
      body.appendChild(proof);
    });
  }

  function lazyLoadVideos() {
    if (!('IntersectionObserver' in window)) return;
    const videos = [...document.querySelectorAll('#work .card video')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const video = entry.target;
        if (video.dataset.deferredSrc) {
          video.src = video.dataset.deferredSrc;
          delete video.dataset.deferredSrc;
          video.load();
        }
        observer.unobserve(video);
      });
    }, { rootMargin: '160px 0px' });
    videos.forEach(video => {
      const src = video.getAttribute('src');
      if (!src || video.autoplay) return;
      video.preload = 'none';
      video.dataset.deferredSrc = src;
      video.removeAttribute('src');
      observer.observe(video);
    });
  }

  function polishHome() {
    if (!isHome() || document.documentElement.dataset.badrPolished === '1') return;
    document.documentElement.dataset.badrPolished = '1';
    addHomeStyles();
    applyCanadaPositioning();
    addRecruiterSummary();

    document.getElementById('avena-design')?.remove();
    document.getElementById('idh-design')?.remove();
    document.getElementById('vareno-showcase')?.remove();
    document.getElementById('character-scenes')?.remove();

    addHatanWorkCard();
    condenseHatanOnHome();

    const head = document.querySelector('#work .sectionHead');
    if (head) {
      const h2 = head.querySelector('h2');
      const p = head.querySelector('p');
      if (h2) h2.textContent = 'Selected Work — Hiring Highlights';
      if (p) p.textContent = 'Six focused projects showing brand identity, packaging, multimedia advertising, AI-assisted content and professional video work. Additional video work is available below.';
    }

    const grid = document.querySelector('#work .grid');
    if (grid) {
      const cards = [...grid.children].filter(node => node.matches('.card'));
      const hiddenCards = cards.slice(5);
      hiddenCards.forEach(card => { card.hidden = true; });
      if (hiddenCards.length && !grid.nextElementSibling?.classList.contains('work-toggle-wrap')) {
        const wrap = document.createElement('div');
        wrap.className = 'work-toggle-wrap';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn work-toggle';
        button.textContent = `View more video work (${hiddenCards.length})`;
        button.setAttribute('aria-expanded', 'false');
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

    addAiWorkflowProof();
    addProductionExperience();
    lazyLoadVideos();
  }

  function read(id) {
    try {
      const score = Number(localStorage.getItem(PREFIX + id));
      return score >= 1 && score <= 5 ? score : 0;
    } catch (_) { return 0; }
  }

  function paint(widget, score) {
    const toggle = widget.querySelector('.rating-toggle');
    if (toggle) toggle.textContent = score ? `★ Your rating: ${score}/5` : '☆ Rate';
    widget.querySelectorAll('.rating-star').forEach((star, index) => star.classList.toggle('is-filled', index < score));
  }

  function addRating(host, id, title, padded = false) {
    if (!host || host.querySelector(`:scope > .project-rating[data-rating-id="${id}"]`)) return;
    const widget = document.createElement('div');
    widget.className = 'project-rating' + (padded ? ' rating-padded' : '');
    widget.dataset.ratingId = id;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'rating-toggle';
    toggle.textContent = '☆ Rate';
    toggle.setAttribute('aria-label', `Rate ${title}`);
    const panel = document.createElement('div');
    panel.className = 'rating-panel';
    panel.id = `project-rating-${++serial}`;
    panel.hidden = true;
    const stars = document.createElement('div');
    stars.className = 'rating-stars';
    const status = document.createElement('p');
    status.className = 'rating-status';
    status.textContent = 'Choose 1–5 stars. Your choice is saved in this browser.';
    for (let score = 1; score <= 5; score++) {
      const star = document.createElement('button');
      star.type = 'button';
      star.className = 'rating-star';
      star.textContent = '★';
      star.setAttribute('aria-label', `${score} stars`);
      star.addEventListener('click', () => {
        try { localStorage.setItem(PREFIX + id, String(score)); } catch (_) {}
        (widgets.get(id) || []).forEach(item => paint(item, score));
        status.textContent = `Thank you! Your ${score}/5 rating is saved in this browser.`;
      });
      stars.appendChild(star);
    }
    panel.append(stars, status);
    widget.append(toggle, panel);
    toggle.addEventListener('click', () => { panel.hidden = !panel.hidden; });
    host.appendChild(widget);
    if (!widgets.has(id)) widgets.set(id, []);
    widgets.set(id, widgets.get(id).filter(item => item.isConnected).concat(widget));
    paint(widget, read(id));
  }

  function cardId(card) {
    const video = card.querySelector('video');
    if (video) {
      const src = video.dataset.deferredSrc || video.currentSrc || video.src || '';
      return 'video-' + slug(src.split('/').pop()?.replace(/\.[^.]+$/, ''));
    }
    const link = card.querySelector('.rating-project-link');
    if (link) return 'project-' + slug(new URL(link.href).pathname.replace(/^\/|\/$/g, '').replace('/index.html', ''));
    return 'project-' + slug(card.querySelector('h3')?.textContent);
  }

  function scan() {
    document.querySelectorAll('a.card').forEach(link => {
      const wrapper = document.createElement('article');
      wrapper.className = link.className;
      if (link.hidden) wrapper.hidden = true;
      link.classList.remove('card');
      link.classList.add('rating-project-link');
      link.replaceWith(wrapper);
      wrapper.appendChild(link);
    });

    document.querySelectorAll('.card').forEach(card => {
      const title = card.querySelector('h3')?.textContent?.trim();
      if (!title) return;
      addRating(card.querySelector('.rating-project-link') ? card : card.querySelector('.cardBody') || card, cardId(card), title, !!card.querySelector('.rating-project-link'));
    });

    const projectBlocks = [
      ['#avena-feature .caseIntro', 'project-avena', 'AVENA Medical Center'],
      ['#vareno-feature .vf-head', 'project-vareno', 'VARENO Barber Club'],
      ['#vareno-case .varenoPreviewBody', 'project-vareno', 'VARENO Barber Club'],
      ['#hatan-preview .hatanPreviewBody', 'project-hatan', 'HATAN — Fine Foods & Confections']
    ];
    projectBlocks.forEach(([selector, id, title]) => document.querySelectorAll(selector).forEach(block => addRating(block.firstElementChild || block, id, title)));

    document.querySelectorAll('#design .caseIntro').forEach(block => {
      const eyebrow = block.querySelector('.eyebrow')?.textContent || '';
      if (eyebrow.includes('HATAN')) addRating(block.firstElementChild || block, 'project-hatan', 'HATAN — Fine Foods & Confections');
    });

    document.querySelectorAll('video').forEach(video => {
      if (video.closest('.card')) return;
      const feature = video.closest('.showreelBox, .caseVideoFeature');
      if (!feature) return;
      const src = video.dataset.deferredSrc || video.currentSrc || video.src || '';
      const title = feature.querySelector('h3, h4')?.textContent?.trim() || video.getAttribute('aria-label') || 'Video';
      addRating(feature.querySelector('.showreelCopy, .caseVideoCopy') || feature, 'video-' + slug(src.split('/').pop()?.replace(/\.[^.]+$/, '')), title);
    });

    const path = location.pathname.replace(/\/$/, '');
    const pageId = { '/aura': 'aura', '/aura/index.html': 'aura', '/vareno': 'vareno', '/vareno/index.html': 'vareno', '/idh': 'idh', '/idh/index.html': 'idh', '/hatan': 'hatan', '/hatan/index.html': 'hatan', '/avena.html': 'avena' }[path];
    if (pageId) addRating(document.querySelector('main .hero .wrap, main .hero, main header'), 'project-' + pageId, document.querySelector('h1')?.textContent?.trim() || pageId.toUpperCase());
  }

  function start() {
    polishHome();
    scan();
    let queued = false;
    new MutationObserver(records => {
      if (queued || !records.some(record => [...record.addedNodes].some(node => node.nodeType === 1 && !node.classList?.contains('project-rating')))) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; scan(); });
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
