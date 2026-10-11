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

  // Recruiter-first homepage presentation. The HTML already prioritizes brand identity;
  // this keeps the strongest case studies first and shortens the secondary video grid.
  const featuredBranding = document.getElementById('featured-branding');
  const work = document.getElementById('work');
  if (featuredBranding && work) {
    document.body.classList.add('recruiter-polish');

    const grid = work.querySelector('.grid');
    if (grid) {
      const cards = [...grid.children].filter(el => el.matches('.card'));
      const extras = cards.slice(3);
      extras.forEach(el => el.classList.add('portfolio-extra'));

      if (extras.length) {
        const controls = document.createElement('div');
        controls.className = 'portfolio-more-row';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn portfolio-more-btn';
        button.textContent = 'View all video projects';
        button.setAttribute('aria-expanded', 'false');
        controls.append(button);
        grid.insertAdjacentElement('afterend', controls);

        const setExpanded = expanded => {
          extras.forEach(el => el.classList.toggle('is-visible', expanded));
          button.textContent = expanded ? 'Show fewer video projects' : 'View all video projects';
          button.setAttribute('aria-expanded', String(expanded));
        };
        button.addEventListener('click', () => setExpanded(button.getAttribute('aria-expanded') !== 'true'));

        const revealHashTarget = () => {
          if (!location.hash) return;
          let target;
          try { target = document.querySelector(location.hash); } catch (_) { return; }
          if (target && target.closest('.portfolio-extra')) setExpanded(true);
        };
        revealHashTarget();
        window.addEventListener('hashchange', revealHashTarget);
      }
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
