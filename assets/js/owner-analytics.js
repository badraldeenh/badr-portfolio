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
      @media(max-width:620px){#video{padding-top:46px}#video > #reel{padding-top:14px}#video > #work{padding-top:34px}}
    `;
    document.head.appendChild(style);

    const brand = document.querySelector('.brand');
    if (brand) brand.innerHTML = 'BADR<span>.</span>';

    // Remove the old duplicated long-form branding block from the homepage.
    const oldLongDesign = document.getElementById('design');
    if (oldLongDesign) oldLongDesign.remove();

    // The featured identity grid becomes the dedicated Design section.
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
      if (h2) h2.textContent = 'Selected Campaign & Video Work';
      if (p) p.textContent = 'Professional advertising, product storytelling, AI-assisted content and video editing. Additional videos are available below.';
    }
  }

  // project-ratings.js finishes its homepage enhancements on DOMContentLoaded.
  // Run after it so Design and Video stay cleanly separated.
  document.addEventListener('DOMContentLoaded', () => {
    if (!isHome) return;

    const design = document.getElementById('design');
    const recruiterSummary = document.getElementById('recruiter-summary');
    const video = document.getElementById('video');

    if (design && recruiterSummary) design.insertAdjacentElement('afterend', recruiterSummary);
    if (recruiterSummary && video) recruiterSummary.insertAdjacentElement('afterend', video);
    else if (design && video) design.insertAdjacentElement('afterend', video);

    // HATAN is a branding/packaging case study, not a video-grid item.
    document.querySelectorAll('#work [data-hatan-work-card="1"]').forEach(card => card.remove());
    document.querySelectorAll('#work .card').forEach(card => {
      if (/HATAN\s*[—-]/i.test(card.textContent || '') && /Brand|Packaging/i.test(card.textContent || '')) card.remove();
    });

    const work = document.getElementById('work');
    if (work) {
      const cards = [...work.querySelectorAll(':scope .grid > .card')];
      const visible = cards.filter(card => !card.hidden);
      const toggle = work.querySelector('.work-toggle');
      if (toggle && cards.length > visible.length) {
        const hiddenCount = cards.length - visible.length;
        toggle.textContent = `View more video work (${hiddenCount})`;
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
