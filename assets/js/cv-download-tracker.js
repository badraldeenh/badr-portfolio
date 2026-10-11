(() => {
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
