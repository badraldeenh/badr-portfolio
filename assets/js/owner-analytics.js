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

  // Final homepage hierarchy for recruiter review.
  if (['/', '/index.html'].includes(location.pathname)) {
    document.body.classList.add('recruiter-polish');

    // Keep the public identity as BADR only.
    const brand = document.querySelector('.brand');
    if (brand) brand.innerHTML = 'BADR<span>.</span>';

    // A short navigation that maps directly to the information recruiters need.
    const navLinks = document.querySelector('.links');
    if (navLinks) {
      navLinks.innerHTML = '<a href="#featured-branding">Portfolio</a><a href="#reel">Video</a><a href="#production-experience">Experience</a><a href="#about">About</a><a href="#contact">Contact</a>';
    }

    const featuredBranding = document.getElementById('featured-branding');
    const recruiterSummary = document.getElementById('recruiter-summary');
    if (featuredBranding && recruiterSummary) featuredBranding.insertAdjacentElement('afterend', recruiterSummary);

    // The complete identity projects already have dedicated case-study pages.
    // Remove the duplicated long-form branding section from the homepage only.
    document.getElementById('design')?.remove();

    const work = document.getElementById('work');
    if (work) {
      const h2 = work.querySelector('.sectionHead h2');
      const p = work.querySelector('.sectionHead p');
      if (h2) h2.textContent = 'Selected Campaign & Video Work';
      if (p) p.textContent = 'Five focused projects showing professional advertising, AI-assisted content and video editing. Use “View more video work” for the additional projects.';
    }
  }

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
