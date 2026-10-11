(() => {
  const load = video => {
    if (!video.dataset.src) return;
    video.src = video.dataset.src;
    delete video.dataset.src;
    video.preload = 'metadata';
    video.load();
  };
  const videos = Array.from(document.querySelectorAll('video[data-src]'));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        load(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '180px 0px' });
    videos.forEach(video => observer.observe(video));
  } else videos.forEach(load);
  document.addEventListener('play', event => {
    if (event.target.tagName !== 'VIDEO') return;
    document.querySelectorAll('video').forEach(video => {
      if (video !== event.target && !video.paused) video.pause();
    });
  }, true);
  const revealHash = () => {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    const target = document.getElementById(id);
    if (!target) return;
    let parent = target.parentElement;
    let revealed = false;
    while (parent) {
      if (parent.tagName === 'DETAILS' && !parent.open) { parent.open = true; revealed = true; }
      parent = parent.parentElement;
    }
    if (revealed) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  };
  window.addEventListener('hashchange', revealHash);
  revealHash();
})();
