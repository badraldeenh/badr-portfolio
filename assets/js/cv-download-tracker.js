(() => {
  const addEducation = () => {
    const aboutPanel = document.querySelector('#about .panel');
    if (!aboutPanel || aboutPanel.querySelector('[data-education="it-diploma"]')) return;

    const languages = [...aboutPanel.querySelectorAll('p')].find(p =>
      p.textContent.trim().startsWith('Languages:')
    );

    const education = document.createElement('p');
    education.dataset.education = 'it-diploma';
    education.innerHTML = '<span class="highlight">Education:</span> Diploma in Information Technology (Accounting &amp; Commercial IT) • Three-year diploma.';

    if (languages) languages.before(education);
    else aboutPanel.append(education);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addEducation, { once: true });
  } else {
    addEducation();
  }

  const isCvLink = href => {
    const value = String(href || '');
    return /Badr_Eldin_Mohamed_Alamin_CV\.pdf(?:[?#]|$)/i.test(value) || /\/assets\/docs\/[^/?#]*cv[^/?#]*\.pdf(?:[?#]|$)/i.test(value);
  };

  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || !isCvLink(link.getAttribute('href'))) return;
    try {
      fetch('/api/cv-download?action=record', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
      }).catch(() => {});
    } catch (_) {}
  }, { capture: true });
})();
