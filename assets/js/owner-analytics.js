(() => {
  const ownerName = [...document.querySelectorAll('.footer span, footer span')].find(el => /©.*Badr Eldin/i.test(el.textContent));
  if (ownerName) {
    let timer;
    let start;
    const cancel = () => { clearTimeout(timer); timer = undefined; start = undefined; };
    const open = () => { cancel(); window.location.assign('/analytics.html'); };
    ownerName.style.userSelect = 'none';
    ownerName.style.webkitUserSelect = 'none';
    ownerName.style.webkitTouchCallout = 'none';
    ownerName.style.touchAction = 'pan-y';
    ownerName.tabIndex = 0;
    ownerName.setAttribute('role', 'button');
    ownerName.setAttribute('aria-label', 'Owner sign-in');
    ownerName.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      cancel();
      start = { x: event.clientX, y: event.clientY };
      timer = setTimeout(open, 2000);
    });
    ownerName.addEventListener('pointermove', event => {
      if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) cancel();
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => ownerName.addEventListener(type, cancel));
    ownerName.addEventListener('contextmenu', event => event.preventDefault());
    ownerName.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
    });
    window.addEventListener('blur', cancel);
    document.addEventListener('visibilitychange', cancel);
  }

  const isHome = ['/', '/index.html'].includes(location.pathname);

  if (isHome) {
    document.body.classList.add('recruiter-polish');

    const style = document.createElement('style');
    style.id = 'portfolio-section-separation';
    style.textContent = `
      #design{scroll-margin-top:105px}
      #video{scroll-margin-top:105px;padding:62px 0 0}
      #video > .video-intro{padding-bottom:4px}
      #video > #reel{padding-top:22px}
      #video > #work{padding-top:42px}
      #design .sectionHead h2,#video .sectionHead h2{letter-spacing:-.04em}
      .hatan-feature-card .brandPriorityMedia{background:#0b0b0d}
      .hatan-feature-card .brandPriorityMedia img{width:100%;height:100%;object-fit:cover;object-position:center}

      /* Professional video portfolio layout */
      #work .sectionHead{margin-bottom:30px}
      #work .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;align-items:stretch}
      #work .grid>.card{display:grid;grid-template-columns:190px minmax(0,1fr);min-width:0;min-height:360px;border-radius:20px;overflow:hidden;background:linear-gradient(145deg,#171719,#121214);border:1px solid #2d2d32;box-shadow:0 16px 44px rgba(0,0,0,.16);transform:none}
      #work .grid>.card:hover{border-color:#4a4640;transform:translateY(-2px)}
      #work .grid>.card>.media{width:100%;height:100%;min-height:360px;aspect-ratio:auto;background:#080809;border-right:1px solid #29292e}
      #work .grid>.card>.media video,#work .grid>.card>.media img{width:100%;height:100%;object-fit:cover}
      #work .grid>.card>.cardBody{padding:22px;min-width:0;display:flex;flex-direction:column;align-items:flex-start}
      #work .grid>.card>.cardBody>p{font-size:13px;line-height:1.55}
      #work .grid>.card>.cardBody>.miniChips{margin-top:14px}
      #work .grid>.card>.cardBody>.projectFacts,#work .grid>.card>.cardBody>.ai-workflow-proof{display:none}
      #work .grid>.card>.cardBody>.project-rating{margin-top:auto;padding-top:18px}
      #work .grid>.card:first-child{grid-column:1/-1;grid-template-columns:minmax(280px,370px) minmax(0,1fr);min-height:500px;background:linear-gradient(135deg,#1a1815,#111113);border-color:rgba(201,165,90,.35)}
      #work .grid>.card:first-child>.media{min-height:500px}
      #work .grid>.card:first-child>.cardBody{padding:34px}
      #work .grid>.card:first-child>.cardBody h3{font-size:30px;line-height:1.1;margin-top:8px}
      #work .grid>.card:first-child>.cardBody>p{font-size:15px;max-width:680px}
      #work .grid>.card:first-child>.cardBody>.projectFacts{display:block;width:100%;margin-top:22px}
      #work .grid>.card:first-child>.cardBody>.ai-workflow-proof{display:block;width:100%}
      #work .grid>.card:first-child .rank{background:#c9a55a;color:#111;border-color:#c9a55a}

      #work .work-toggle-wrap{margin-top:30px;display:flex;justify-content:center}
      #work .work-toggle{min-width:min(100%,390px);justify-content:center;padding:15px 24px;border-radius:999px;background:#c9a55a;color:#111;border-color:#c9a55a;font-size:14px;font-weight:900;letter-spacing:.01em;box-shadow:0 12px 34px rgba(201,165,90,.12)}
      #work .work-toggle:hover{background:#d8b86f;border-color:#d8b86f;transform:translateY(-2px)}
      #work .work-toggle:focus-visible{outline:2px solid #f4dfad;outline-offset:4px}

      /* Desktop presentation polish — intentionally scoped away from mobile/tablet */
      @media(min-width:1180px){
        body.recruiter-polish .wrap{width:min(1360px,calc(100% - 80px));max-width:none}
        body.recruiter-polish .navin{height:76px}
        body.recruiter-polish .links{gap:28px;font-size:14px}
        body.recruiter-polish .hero{padding:96px 0 72px}
        body.recruiter-polish .heroGrid{max-width:1160px}
        body.recruiter-polish .heroName{font-size:clamp(96px,10vw,154px)!important}
        body.recruiter-polish .hero .lead{font-size:22px;line-height:1.5;max-width:850px}
        body.recruiter-polish .hero .micro{font-size:14px;margin-top:28px}
        body.recruiter-polish .stats{max-width:920px;gap:14px;margin-top:38px}
        body.recruiter-polish .stat{padding:17px 16px;border-radius:14px}
        body.recruiter-polish .stat b{font-size:14px}
        body.recruiter-polish .stat span{font-size:12px;line-height:1.45}
        body.recruiter-polish section{padding:76px 0}
        body.recruiter-polish .sectionHead{gap:46px;margin-bottom:34px}
        body.recruiter-polish .sectionHead h2{font-size:44px;line-height:1.08}
        body.recruiter-polish .sectionHead p{font-size:15.5px;line-height:1.65;max-width:700px}

        #design{padding-top:54px}
        #design .brandPriorityGrid{gap:24px}
        #design .brandPriorityCard{border-radius:22px;box-shadow:0 18px 50px rgba(0,0,0,.15)}
        #design .brandPriorityCard:hover{transform:translateY(-4px);border-color:#4a4740}
        #design .brandPriorityMedia{aspect-ratio:16/9}
        #design .brandPriorityCard .cardBody{padding:23px}
        #design .brandPriorityCard h3{font-size:22px;line-height:1.2;margin-top:8px}
        #design .brandPriorityCard p{font-size:14px;line-height:1.6}

        #video{padding-top:82px}
        #video>.video-intro{padding-bottom:10px}
        #video>#reel{padding-top:24px}
        #reel .showreelBox{border-radius:28px;box-shadow:0 26px 70px rgba(0,0,0,.22)}
        #reel .showreelInner{grid-template-columns:minmax(380px,480px) minmax(0,1fr)}
        #reel .showreelVideo video{max-height:760px}
        #reel .showreelCopy{padding:58px 64px}
        #reel .showreelCopy h3{font-size:40px;line-height:1.08}
        #reel .showreelCopy p{font-size:15px;line-height:1.7;max-width:720px}

        #video>#work{padding-top:54px}
        #work .grid{gap:24px}
        #work .grid>.card{grid-template-columns:220px minmax(0,1fr);min-height:390px;border-radius:22px}
        #work .grid>.card>.media{min-height:390px}
        #work .grid>.card>.cardBody{padding:26px}
        #work .grid>.card>.cardBody h3{font-size:22px;line-height:1.18}
        #work .grid>.card:first-child{grid-template-columns:minmax(360px,440px) minmax(0,1fr);min-height:560px}
        #work .grid>.card:first-child>.media{min-height:560px}
        #work .grid>.card:first-child>.cardBody{padding:42px 46px}
        #work .grid>.card:first-child>.cardBody h3{font-size:36px}
        #work .grid>.card:first-child>.cardBody>p{font-size:15.5px;line-height:1.7}

        #recruiter-summary .recruiter-summary-grid{gap:18px}
        #recruiter-summary .recruiter-summary-item{padding:22px;border-radius:16px}
        #production-experience .two{gap:26px}
        #production-experience .panel{padding:34px;border-radius:20px}
        #about .panel{padding:34px}
        #contact .contact{padding:46px 50px;border-radius:26px}
        #contact .contact h2{font-size:38px}
      }

      @media(min-width:1500px){
        body.recruiter-polish .wrap{width:min(1440px,calc(100% - 112px))}
        body.recruiter-polish .heroGrid{max-width:1240px}
        #design .brandPriorityGrid{gap:26px}
        #work .grid{gap:26px}
      }

      @media(max-width:980px){
        #work .grid{grid-template-columns:1fr}
        #work .grid>.card,#work .grid>.card:first-child{grid-column:auto;grid-template-columns:210px minmax(0,1fr);min-height:380px}
        #work .grid>.card>.media,#work .grid>.card:first-child>.media{min-height:380px}
        #work .grid>.card:first-child>.cardBody{padding:26px}
      }
      @media(max-width:620px){
        #video{padding-top:46px}#video > #reel{padding-top:14px}#video > #work{padding-top:34px}
        #work .grid{gap:16px}
        #work .grid>.card,#work .grid>.card:first-child{display:block;min-height:0}
        #work .grid>.card>.media,#work .grid>.card:first-child>.media{height:auto;min-height:0;aspect-ratio:9/16;max-height:620px;border-right:0;border-bottom:1px solid #29292e}
        #work .grid>.card>.cardBody,#work .grid>.card:first-child>.cardBody{padding:20px}
        #work .grid>.card:first-child>.cardBody h3{font-size:24px}
        #work .grid>.card:first-child>.cardBody>.projectFacts,#work .grid>.card:first-child>.cardBody>.ai-workflow-proof{display:none}
        #work .work-toggle{width:100%;min-width:0}
      }
    `;
    document.head.appendChild(style);

    const brand = document.querySelector('.brand');
    if (brand) brand.innerHTML = 'BADR<span>.</span>';

    const oldLongDesign = document.getElementById('design');
    if (oldLongDesign) oldLongDesign.remove();

    const featuredBranding = document.getElementById('featured-branding');
    if (featuredBranding) {
      featuredBranding.id = 'design';
      const h2 = featuredBranding.querySelector('.sectionHead h2');
      const p = featuredBranding.querySelector('.sectionHead p');
      if (h2) h2.textContent = 'Branding & Graphic Design';
      if (p) p.textContent = 'Selected brand identity, packaging, print and visual design projects.';

      const hatanCard = [...featuredBranding.querySelectorAll('a.card')].find(card => /hatan\/?$/i.test(card.getAttribute('href') || '') || /HATAN/i.test(card.textContent || ''));
      if (hatanCard) {
        hatanCard.classList.add('hatan-feature-card');
        const img = hatanCard.querySelector('.brandPriorityMedia img, img');
        if (img) {
          img.src = 'assets/img/hatan/hatan-storefront-delivery-mockup.webp';
          img.alt = 'HATAN premium food branding, storefront and delivery application';
        }
      }
    }

    const navLinks = document.querySelector('.links');
    if (navLinks) {
      navLinks.innerHTML = '<a href="#design">Design</a><a href="#video">Video</a><a href="#production-experience">Experience</a><a href="#about">About</a><a href="#contact">Contact</a>';
    }

    const reel = document.getElementById('reel');
    const work = document.getElementById('work');
    if (reel && work && !document.getElementById('video')) {
      const videoSection = document.createElement('div');
      videoSection.id = 'video';
      videoSection.innerHTML = '<div class="wrap video-intro"><div class="sectionHead"><h2>Video & Motion</h2><p>Showreel, advertising films, product videos and AI-assisted motion work.</p></div></div>';
      reel.parentNode.insertBefore(videoSection, reel);
      videoSection.appendChild(reel);
      videoSection.appendChild(work);
    }

    if (work) {
      const h2 = work.querySelector('.sectionHead h2');
      const p = work.querySelector('.sectionHead p');
      if (h2) h2.textContent = 'Selected Video Projects';
      if (p) p.textContent = 'A curated selection of advertising, product storytelling and AI-assisted video work. The strongest project is featured first, with additional films available below.';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!isHome) return;

    const design = document.getElementById('design');
    const recruiterSummary = document.getElementById('recruiter-summary');
    const video = document.getElementById('video');

    if (design && recruiterSummary) design.insertAdjacentElement('afterend', recruiterSummary);
    if (recruiterSummary && video) recruiterSummary.insertAdjacentElement('afterend', video);
    else if (design && video) design.insertAdjacentElement('afterend', video);

    document.querySelectorAll('#work [data-hatan-work-card="1"]').forEach(node => {
      const wrapper = node.closest('.card');
      if (wrapper) wrapper.remove();
      else node.remove();
    });

    document.querySelectorAll('#work .card').forEach(card => {
      const text = card.textContent || '';
      const linksToHatan = !!card.querySelector('a[href*="/hatan/"]');
      const isHatan = /HATAN\s*[—-]/i.test(text) || linksToHatan;
      const isEmpty = !card.querySelector('video, img, h3');
      if (isHatan || isEmpty) card.remove();
    });

    const work = document.getElementById('work');
    if (work) {
      const cards = [...work.querySelectorAll(':scope .grid > .card')];
      if (cards[0]) cards[0].classList.add('video-featured-card');

      const toggle = work.querySelector('.work-toggle');
      if (toggle) {
        const updateToggle = () => {
          const expanded = toggle.getAttribute('aria-expanded') === 'true';
          const hiddenCount = [...work.querySelectorAll(':scope .grid > .card')].filter(card => card.hidden).length;
          if (expanded) {
            toggle.innerHTML = 'Show Featured Videos Only <span aria-hidden="true">↑</span>';
            toggle.setAttribute('aria-label', 'Show featured video projects only');
          } else if (hiddenCount > 0) {
            toggle.innerHTML = `View All Video Projects <span aria-hidden="true">↓</span>`;
            toggle.setAttribute('aria-label', `View all video projects, including ${hiddenCount} additional videos`);
          } else {
            toggle.closest('.work-toggle-wrap')?.remove();
          }
        };
        updateToggle();
        toggle.addEventListener('click', () => requestAnimationFrame(updateToggle));
      }
    }
  }, { once: true });

  let button;
  let pending = false;
  async function check() {
    if (pending || document.hidden) return;
    pending = true;
    try {
      const response = await fetch('/api/visitor-analytics?action=owner', { cache: 'no-store', credentials: 'same-origin' });
      const status = response.ok ? await response.json() : {};
      if (status.authenticated === true) {
        if (!button) {
          button = document.createElement('a');
          button.href = '/analytics.html';
          button.textContent = 'الإحصائيات';
          button.lang = 'ar';
          button.dir = 'rtl';
          button.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:1000;padding:12px 20px;border-radius:999px;background:#172c24;color:#fff;border:1px solid #9dbb9f;font:600 16px system-ui;text-decoration:none;box-shadow:0 4px 16px #0003;';
          document.body.append(button);
        }
        button.hidden = false;
      } else if (button) button.hidden = true;
    } catch (_) { if (button) button.hidden = true; }
    finally { pending = false; }
  }
  window.addEventListener('pageshow', check);
  window.addEventListener('focus', check);
  document.addEventListener('visibilitychange', check);
  setInterval(check, 60000);
  check();
})();
