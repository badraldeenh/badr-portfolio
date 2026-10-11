(() => {
  if (window.badrFinalPolishLoaded) return;
  window.badrFinalPolishLoaded = true;

  const HOME = ['/', '/index.html'].includes(location.pathname);
  const SITE = 'https://badr-eldin-portfolio.vercel.app';
  const caseMap = {
    '/idh/': { name: 'IDH', next: '/avena.html', nextName: 'AVENA Medical Center' },
    '/idh/index.html': { name: 'IDH', next: '/avena.html', nextName: 'AVENA Medical Center' },
    '/avena.html': { name: 'AVENA Medical Center', next: '/vareno/', nextName: 'VARENO Barber Club' },
    '/vareno/': { name: 'VARENO Barber Club', next: '/aura/', nextName: 'AURA Athletics' },
    '/vareno/index.html': { name: 'VARENO Barber Club', next: '/aura/', nextName: 'AURA Athletics' },
    '/aura/': { name: 'AURA Athletics', next: '/hatan/', nextName: 'HATAN Fine Foods' },
    '/aura/index.html': { name: 'AURA Athletics', next: '/hatan/', nextName: 'HATAN Fine Foods' },
    '/hatan/': { name: 'HATAN Fine Foods', next: '/idh/', nextName: 'IDH' },
    '/hatan/index.html': { name: 'HATAN Fine Foods', next: '/idh/', nextName: 'IDH' }
  };
  const project = caseMap[location.pathname];

  const ensureMeta = (selector, attrs) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      document.head.appendChild(el);
    }
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    return el;
  };

  const canonicalUrl = SITE + (location.pathname === '/index.html' ? '/' : location.pathname);
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;
  ensureMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
  ensureMeta('meta[property="og:type"]', { property: 'og:type', content: HOME ? 'website' : 'article' });

  if (HOME) {
    document.title = 'BADR — Brand & Multimedia Designer | Portfolio';
    ensureMeta('meta[name="description"]', {
      name: 'description',
      content: 'BADR — portfolio of Badr Eldin Mohamed Alamin, a graphic designer and multimedia creator focused on brand identity, print production, advertising content and video editing.'
    });
    ensureMeta('meta[property="og:title"]', { property: 'og:title', content: 'BADR — Brand & Multimedia Designer' });
    ensureMeta('meta[property="og:description"]', { property: 'og:description', content: 'Brand identity, graphic design, advertising content, video editing and AI-assisted creative production.' });
    ensureMeta('meta[property="og:image"]', { property: 'og:image', content: SITE + '/assets/img/idh/hero.webp' });
  } else if (project) {
    document.title = document.title.replace(/\s*\|\s*BADR Magic/i, ' | BADR').replace(/BADR Magic/gi, 'BADR');
  }

  const style = document.createElement('style');
  style.id = 'badr-final-polish-style';
  style.textContent = `
    .final-capability-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:0 0 24px}
    .final-capability{padding:18px;border:1px solid var(--line,#2b2b30);border-radius:15px;background:#111114}
    .final-capability span{display:block;color:var(--accent,#c9a55a);font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px}
    .final-capability b{display:block;font-size:14px;line-height:1.35;color:#f3f2ed;margin-bottom:5px}
    .final-capability p{margin:0!important;color:#9f9e99!important;font-size:12px!important;line-height:1.5!important}
    .final-hire{padding:34px 0 12px}
    .final-hire-box{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:28px;align-items:center;padding:34px 36px;border:1px solid rgba(201,165,90,.28);border-radius:24px;background:radial-gradient(circle at 90% 10%,rgba(201,165,90,.11),transparent 34%),linear-gradient(135deg,#171719,#111113)}
    .final-hire-box h2{margin:6px 0 10px;font-size:clamp(28px,4vw,42px);line-height:1.05;letter-spacing:-.035em}
    .final-hire-box p{margin:0;color:#b7b5af;max-width:760px}
    .final-hire-actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}
    .final-hire-actions .btn{white-space:nowrap}
    #design .brandPriorityMedia img{object-position:center center}
    #design .brandPriorityCard{height:100%}
    #design .brandPriorityCard .cardBody{display:flex;flex-direction:column;height:100%}
    #design .brandPriorityCard .miniChips{margin-top:auto;padding-top:12px}

    .case-polish .brand{font-family:"Bodoni 72","Didot","Bodoni MT",Georgia,serif;font-weight:600;letter-spacing:.2em}
    .case-polish .brand span{letter-spacing:0;color:#c9a55a}
    .case-polish img[loading="lazy"]{content-visibility:auto}
    .case-final-cta{width:min(1180px,calc(100% - 36px));margin:40px auto 56px;padding:30px;border:1px solid rgba(201,165,90,.28);border-radius:22px;background:linear-gradient(135deg,#171719,#101012)}
    .case-final-cta .eyebrow{color:#c9a55a;font-size:11px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
    .case-final-cta h2{margin:8px 0 9px;font-size:clamp(26px,4vw,38px);line-height:1.08;letter-spacing:-.03em}
    .case-final-cta p{margin:0 0 18px;color:#aaa9a4;max-width:760px}
    .case-final-actions{display:flex;gap:10px;flex-wrap:wrap}
    .case-final-actions a{display:inline-flex;align-items:center;justify-content:center;padding:11px 15px;border-radius:10px;border:1px solid #34343a;background:#151518;color:#f5f4f0;font-weight:800;font-size:13px;text-decoration:none}
    .case-final-actions a.primary{background:#c9a55a;color:#111;border-color:#c9a55a}
    .case-final-actions a.next{margin-left:auto}

    @media(max-width:900px){
      .final-capability-strip{grid-template-columns:repeat(2,minmax(0,1fr))}
      .final-hire-box{grid-template-columns:1fr}
      .final-hire-actions{justify-content:flex-start}
    }
    @media(max-width:720px){
      .final-capability-strip{grid-template-columns:1fr;gap:9px;margin-bottom:16px}
      .final-capability{padding:14px 15px;border-radius:13px}
      .final-hire{padding:18px 0 4px}
      .final-hire-box{padding:22px 18px;border-radius:18px;gap:18px}
      .final-hire-box h2{font-size:27px}
      .final-hire-box p{font-size:12.8px;line-height:1.55}
      .final-hire-actions{display:grid;grid-template-columns:1fr;width:100%}
      .final-hire-actions .btn{width:100%;justify-content:center}
      .case-final-cta{width:calc(100% - 24px);margin:28px auto 38px;padding:22px 18px;border-radius:18px}
      .case-final-actions{display:grid;grid-template-columns:1fr}
      .case-final-actions a.next{margin-left:0}
    }
  `;
  document.head.appendChild(style);

  const optimizeMedia = () => {
    document.querySelectorAll('img').forEach((img, index) => {
      img.decoding = 'async';
      if (!img.hasAttribute('loading') && index > 1 && !img.closest('.hero')) img.loading = 'lazy';
    });

    const videos = [...document.querySelectorAll('video')];
    videos.forEach(video => {
      video.playsInline = true;
      if (HOME && video.closest('#work')) video.preload = 'none';
      else if (!video.hasAttribute('preload')) video.preload = 'metadata';
      if (!video.getAttribute('aria-label')) {
        const label = video.closest('.card,.showreelBox,.caseVideoFeature')?.querySelector('h3,h4')?.textContent?.trim();
        if (label) video.setAttribute('aria-label', label);
      }
    });

    if (matchMedia('(max-width:720px)').matches) {
      document.querySelectorAll('#reel video[autoplay]').forEach(video => {
        video.removeAttribute('autoplay');
        try { video.pause(); } catch (_) {}
      });
    }

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const video = entry.target;
          if (entry.isIntersecting) {
            if (video.preload === 'none') video.preload = 'metadata';
          } else if (!video.paused) {
            try { video.pause(); } catch (_) {}
          }
        });
      }, { rootMargin: '240px 0px', threshold: 0.01 });
      videos.forEach(video => io.observe(video));
    }
  };

  const polishHome = () => {
    if (!HOME) return;
    document.body.classList.add('final-home-polish');

    ['process', 'editing', 'marketing', 'ai-toolkit'].forEach(id => document.getElementById(id)?.remove());

    const hero = document.querySelector('header.hero');
    if (hero) {
      const primary = hero.querySelector('.actions .btn.primary');
      if (primary) { primary.href = '#design'; primary.textContent = 'View Design Work'; }
      const secondary = hero.querySelector('.actions .btn:not(.primary)');
      if (secondary && secondary.getAttribute('href')?.startsWith('mailto:')) secondary.textContent = 'Email BADR';
    }

    const production = document.getElementById('production-experience');
    if (production) {
      const h2 = production.querySelector('.sectionHead h2');
      const p = production.querySelector('.sectionHead p');
      if (h2) h2.textContent = 'Capabilities & Experience';
      if (p) p.textContent = 'A focused view of the skills I bring beyond the portfolio pieces — from branding and video to real production and marketing execution.';
      const wrap = production.querySelector('.wrap');
      if (wrap && !production.querySelector('.final-capability-strip')) {
        const strip = document.createElement('div');
        strip.className = 'final-capability-strip';
        strip.innerHTML = `
          <div class="final-capability"><span>01 • Design</span><b>Brand & Visual Systems</b><p>Identity, campaign visuals, print-ready artwork and social content.</p></div>
          <div class="final-capability"><span>02 • Video</span><b>Editing & Storytelling</b><p>Premiere Pro, pacing, short-form advertising and product storytelling.</p></div>
          <div class="final-capability"><span>03 • AI</span><b>AI-Assisted Production</b><p>Creative development using photography, Photoshop, ChatGPT and HappyHorse.</p></div>
          <div class="final-capability"><span>04 • Marketing</span><b>Campaign & E-commerce</b><p>Social campaign execution, reporting and product-content workflows.</p></div>`;
        const head = wrap.querySelector('.sectionHead');
        head?.insertAdjacentElement('afterend', strip);
      }
    }

    const about = document.getElementById('about');
    about?.querySelectorAll('p').forEach(p => {
      if (/^I combine AI-assisted production/i.test(p.textContent.trim())) p.remove();
    });

    const video = document.getElementById('video');
    if (video && !document.getElementById('hire-badr')) {
      const hire = document.createElement('section');
      hire.id = 'hire-badr';
      hire.className = 'final-hire';
      hire.innerHTML = `
        <div class="wrap"><div class="final-hire-box">
          <div><div class="eyebrow">Available for opportunities</div><h2>Need a designer who can take work from identity to campaign?</h2><p>Brand design, production-ready artwork, social content and video — with hands-on marketing and production experience.</p></div>
          <div class="final-hire-actions"><a class="btn primary" href="mailto:badrlooka90@gmail.com">Contact BADR</a><a class="btn" href="assets/docs/Badr_Eldin_Mohamed_Alamin_CV.pdf" target="_blank" rel="noopener">View CV</a></div>
        </div></div>`;
      video.insertAdjacentElement('afterend', hire);
    }

    const navExperience = document.querySelector('.links a[href="#production-experience"]');
    if (navExperience) navExperience.textContent = 'Experience';

    const contact = document.querySelector('#contact .contact');
    if (contact) {
      const eyebrow = contact.querySelector('.eyebrow');
      const h2 = contact.querySelector('h2');
      const p = contact.querySelector('p');
      if (eyebrow) eyebrow.textContent = 'Open to opportunities';
      if (h2) h2.textContent = 'Available for graphic design and multimedia roles.';
      if (p) p.textContent = 'Based in the UAE and available for remote interviews. Open to relocation and employer-supported work authorization for suitable roles in Canada and internationally.';
    }

    optimizeMedia();
  };

  const polishCase = () => {
    if (!project) return;
    document.body.classList.add('case-polish');

    const brand = document.querySelector('.brand');
    if (brand) brand.innerHTML = 'BADR<span>.</span>';

    document.querySelectorAll('.back').forEach(back => {
      back.href = '/#design';
      back.textContent = '← Back to Design';
    });

    document.querySelectorAll('footer a[href*="#design"], .footer a[href*="#design"]').forEach(link => {
      link.href = '/#design';
      link.textContent = 'Back to Design';
    });

    const footer = document.querySelector('footer,.footer');
    if (footer && !document.querySelector('.case-final-cta')) {
      const cta = document.createElement('section');
      cta.className = 'case-final-cta';
      cta.innerHTML = `
        <div class="eyebrow">Project complete</div>
        <h2>Like the thinking behind ${project.name}?</h2>
        <p>Explore the next case study or contact me about graphic design, brand identity, multimedia and campaign work.</p>
        <div class="case-final-actions">
          <a class="primary" href="mailto:badrlooka90@gmail.com">Contact BADR</a>
          <a href="/assets/docs/Badr_Eldin_Mohamed_Alamin_CV.pdf" target="_blank" rel="noopener">View CV</a>
          <a class="next" href="${project.next}">Next project — ${project.nextName} →</a>
        </div>`;
      footer.parentNode.insertBefore(cta, footer);
    }

    optimizeMedia();
  };

  const run = () => {
    if (HOME) polishHome();
    else polishCase();
  };

  run();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  setTimeout(run, 180);
  setTimeout(run, 650);
})();
