(() => {
  if (window.badrFinalTouchLoaded) return;
  window.badrFinalTouchLoaded = true;

  const HOME = ['/', '/index.html', '/home-v4.html'].includes(location.pathname);
  const CASE = /\/(idh|vareno|aura|hatan)\/?(?:index\.html)?$/.test(location.pathname) || location.pathname === '/avena.html';

  const style = document.createElement('style');
  style.id = 'badr-final-touch-style';
  style.textContent = `
    /* Balanced project covers */
    @media(min-width:1101px){
      #design .brandPriorityGrid{display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:24px!important}
      #design .brandPriorityCard,#design .brandPriorityWide{grid-column:span 2!important}
      #design .brandPriorityCard:nth-child(n+4),#design .brandPriorityWide:nth-child(n+4){grid-column:span 3!important}
    }
    @media(min-width:721px) and (max-width:1100px){
      #design .brandPriorityGrid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      #design .brandPriorityCard,#design .brandPriorityWide{grid-column:auto!important}
      #design .brandPriorityCard:last-child{grid-column:1/-1!important;max-width:720px;width:100%;justify-self:center}
    }
    #design .brandPriorityMedia{aspect-ratio:16/9!important;background:#09090b!important}
    #design .brandPriorityMedia img{width:100%!important;height:100%!important;object-fit:cover!important;filter:saturate(.97) contrast(1.015)}
    #design a[href*="idh"] .brandPriorityMedia img{object-position:center 48%!important}
    #design a[href*="avena"] .brandPriorityMedia img{object-position:center 46%!important}
    #design a[href*="vareno"] .brandPriorityMedia img{object-position:center 50%!important}
    #design a[href*="aura"] .brandPriorityMedia img{object-position:center 44%!important}
    #design a[href*="hatan"] .brandPriorityMedia img{object-position:center 48%!important}

    /* Case-study consistency */
    .case-polish img{max-width:100%;height:auto}
    .case-polish .caseHero,.case-polish .shot,.case-polish .imageFrame{overflow:hidden}
    .case-polish .caseCaption,.case-polish .cap,.case-polish .caseLabel{line-height:1.4}
    .case-polish video{background:#050506}

    @media(max-width:720px){
      .case-polish .topin,.case-polish .navin,.case-polish .wrap{width:calc(100% - 24px)!important;max-width:none!important}
      .case-polish .topin,.case-polish .navin{min-height:62px!important;height:auto!important;padding:9px 0!important}
      .case-polish .brand{font-size:15px!important;letter-spacing:.18em!important}
      .case-polish .back{font-size:11px!important;padding:8px 10px!important;white-space:nowrap}
      .case-polish .hero{padding:42px 0 24px!important}
      .case-polish .hero h1{font-size:clamp(38px,12vw,56px)!important;line-height:.94!important;overflow-wrap:anywhere}
      .case-polish .hero h1 span,.case-polish .hero h1 em{font-size:.52em!important;line-height:1.18!important;margin-top:10px!important}
      .case-polish .lead{font-size:16px!important;line-height:1.55!important}
      .case-polish .facts{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important}
      .case-polish .fact,.case-polish .facts span{min-width:0!important;font-size:10.5px!important}
      .case-polish .overview,.case-polish .closingBox,.case-polish .promise,.case-polish .panel{padding:20px!important;border-radius:17px!important}
      .case-polish .overview,.case-polish .introGrid,.case-polish .duo,.case-polish .two,.case-polish .caseVideoFeature{grid-template-columns:1fr!important;gap:16px!important}
      .case-polish .overviewGrid,.case-polish .pillars{grid-template-columns:1fr!important}
      .case-polish .section,.case-polish .intro,.case-polish .closing{padding-top:34px!important;padding-bottom:34px!important;margin-top:0!important}
      .case-polish .sectionHead{grid-template-columns:1fr!important;gap:12px!important;margin-bottom:18px!important}
      .case-polish .sectionHead h2,.case-polish .intro h2,.case-polish .closingBox h2{font-size:29px!important;line-height:1.08!important}
      .case-polish .shot,.case-polish .imageFrame,.case-polish .caseHero,.case-polish .caseShot{border-radius:15px!important;margin-bottom:20px!important}
      .case-polish .caseGrid{columns:1!important;column-count:1!important;display:block!important}
      .case-polish .caseCaption,.case-polish .cap,.case-polish .caseLabel{display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:4px!important;font-size:11.5px!important}
      .case-polish .caseVideoFeature{padding:16px!important;border-radius:18px!important}
      .case-polish .caseVideoFrame{width:min(100%,360px)!important;margin:auto!important;padding:7px!important;border-radius:15px!important}
      .case-polish .caseVideoFrame video{max-height:72vh!important;width:100%!important;object-fit:contain!important}
      .case-polish .caseVideoCopy h4{font-size:24px!important}
      .case-polish .caseStages{grid-template-columns:1fr!important;gap:10px!important}
      .case-polish footer,.case-polish .footer{flex-direction:column!important;align-items:flex-start!important;gap:8px!important}
      .case-final-cta{margin-top:20px!important}
    }
    @media(max-width:390px){
      .case-polish .facts{grid-template-columns:1fr!important}
      .case-polish .hero h1{font-size:37px!important}
    }
  `;
  document.head.appendChild(style);

  function improveHomeCovers(){
    if (!HOME) return;
    const design = document.getElementById('design');
    if (!design) return;
    [...design.querySelectorAll('.brandPriorityCard,.brandPriorityWide')].forEach(card => card.classList.add('final-cover-card'));
  }

  const observedVideos = new WeakSet();
  let videoObserver;

  function lazyVideos(){
    const videos = [...document.querySelectorAll('video')];
    if (!videos.length) return;

    videos.forEach(video => {
      video.setAttribute('playsinline','');
      if (CASE) video.preload = 'metadata';
    });

    if (HOME) {
      const workVideos = [...document.querySelectorAll('#work video')];
      workVideos.forEach((video, index) => {
        if (index < 1 || video.dataset.finalDeferred === '1' || video.dataset.deferredSrc) return;
        const src = video.getAttribute('src');
        if (!src) return;
        video.dataset.finalDeferred = '1';
        video.dataset.finalSrc = src;
        video.removeAttribute('src');
        video.preload = 'none';
        try { video.load(); } catch (_) {}
      });

      const showreel = document.querySelector('#reel video');
      if (showreel && matchMedia('(max-width:720px)').matches) {
        showreel.removeAttribute('autoplay');
        showreel.preload = 'metadata';
        try { showreel.pause(); } catch (_) {}
      }
    }

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('video[data-final-src]').forEach(v => {v.src=v.dataset.finalSrc; delete v.dataset.finalSrc;});
      return;
    }

    const io = videoObserver || (videoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting && video.dataset.finalSrc) {
          video.src = video.dataset.finalSrc;
          delete video.dataset.finalSrc;
          video.preload = 'metadata';
          try { video.load(); } catch (_) {}
          io.unobserve(video);
        } else if (!entry.isIntersecting && !video.paused && !video.hasAttribute('autoplay')) {
          try { video.pause(); } catch (_) {}
        }
      });
    }, {rootMargin:'160px 0px',threshold:.01}));
    document.querySelectorAll('video[data-final-src]').forEach(v => {
      if (observedVideos.has(v)) return;
      observedVideos.add(v);
      io.observe(v);
    });
  }

  function accessibility(){
    document.querySelectorAll('img').forEach((img,index)=>{
      img.decoding='async';
      if (!img.hasAttribute('loading') && index > 1 && !img.closest('.hero')) img.loading='lazy';
    });
    document.querySelectorAll('a[target="_blank"]').forEach(a=>{
      const rel = new Set((a.rel||'').split(/\s+/).filter(Boolean)); rel.add('noopener'); a.rel=[...rel].join(' ');
    });
  }

  function metaRuntime(){
    const image='https://badr-eldin-portfolio.vercel.app/api/og-image';
    let og=document.querySelector('meta[property="og:image"]');
    if(!og){og=document.createElement('meta');og.setAttribute('property','og:image');document.head.appendChild(og)}
    if(HOME) og.setAttribute('content',image);
  }

  function run(){
    improveHomeCovers();
    lazyVideos();
    accessibility();
    metaRuntime();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(run,60),{once:true});
  else setTimeout(run,60);
  setTimeout(run,650);
})();
