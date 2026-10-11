(() => {
  const videos = [...document.querySelectorAll('video[data-company-film]')];
  const style = document.createElement('style');
  style.textContent = '.company-sound{display:block;margin:12px auto;padding:10px 18px;border:1px solid #c9a55a;border-radius:999px;background:#151518;color:#f5f4f0;font:600 13px system-ui;cursor:pointer}.company-sound:focus-visible{outline:2px solid #f4dfad;outline-offset:4px}';
  document.head.append(style);
  videos.forEach((video) => {
    video.muted = true;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'company-sound';
    const update = () => {
      button.textContent = video.muted ? 'Enable sound' : 'Mute sound';
      button.setAttribute('aria-pressed', String(!video.muted));
    };
    button.addEventListener('click', () => {
      const enable = video.muted;
      videos.forEach((other) => { if (other !== video) other.muted = true; });
      video.muted = !enable;
      if (video.paused) video.play().catch(() => {});
      update();
    });
    video.addEventListener('volumechange', update);
    video.after(button);
    update();
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({target, isIntersecting}) => {
        if (isIntersecting && !target.dataset.previewStarted) {
          target.dataset.previewStarted = 'true';
          target.play().catch(() => {});
        } else if (!isIntersecting) target.pause();
      });
    }, {threshold: 0.55});
    videos.forEach(video => observer.observe(video));
  }
})();
