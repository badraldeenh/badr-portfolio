(() => {
  const isHome = ['/', '/index.html', '/home-v4.html'].includes(location.pathname);
  if (!isHome) return;

  function restoreHatanCampaign() {
    const work = document.getElementById('work');
    if (!work || document.getElementById('hatan-campaign-video-card')) return false;
    const grid = work.querySelector(':scope .grid') || work.querySelector('.grid');
    if (!grid) return false;

    const card = document.createElement('article');
    card.className = 'card hatan-campaign-video-card';
    card.id = 'hatan-campaign-video-card';
    card.dataset.hatanCampaign = '1';
    card.innerHTML = `
      <div class="media">
        <span class="rank">01 • Featured</span>
        <video
          poster="assets/img/hatan/hatan-product-key-visual.webp"
          src="assets/video/HATAN_Stadium_Ad_Final_15s_1080x1920.mp4"
          controls
          playsinline
          preload="none"
          aria-label="HATAN Stadium Delivery Campaign — 15 second vertical advertising film">
        </video>
      </div>
      <div class="cardBody">
        <div class="kicker">AI Campaign Film • Independent Concept</div>
        <h3>HATAN — Stadium Delivery Campaign</h3>
        <p>A 15-second vertical advertising concept combining AI-assisted visual production, cinematic direction, brand continuity and stadium sound design.</p>
        <div class="miniChips"><span>15 Seconds</span><span>9:16</span><span>AI Video</span><span>Art Direction</span><span>Sound Design</span></div>
        <dl class="projectFacts">
          <div><dt>Context</dt><dd>Independent HATAN portfolio campaign</dd></div>
          <div><dt>Format</dt><dd>1080 × 1920 • 15-second vertical film</dd></div>
          <div><dt>Role</dt><dd>AI-assisted visual production, direction, editing & sound design</dd></div>
          <div><dt>Tools</dt><dd>Adobe Photoshop • ChatGPT • HappyHorse • Adobe Premiere Pro</dd></div>
        </dl>
      </div>`;

    grid.prepend(card);

    const heading = work.querySelector('.sectionHead h2');
    const sub = work.querySelector('.sectionHead p');
    if (heading) heading.textContent = 'Selected Video Projects';
    if (sub) sub.textContent = 'HATAN Stadium Delivery Campaign, advertising films, product storytelling and AI-assisted video work.';

    const cards = [...grid.querySelectorAll(':scope > .card')];
    cards.forEach((item, index) => {
      if (item.querySelector('.rank')) {
        const rank = item.querySelector('.rank');
        if (item.id === 'hatan-campaign-video-card') rank.textContent = '01 • Featured';
        else if (/Featured/i.test(rank.textContent || '')) rank.textContent = String(index + 1).padStart(2, '0');
      }
    });

    return true;
  }

  const run = () => {
    if (restoreHatanCampaign()) return;
    setTimeout(restoreHatanCampaign, 300);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(restoreHatanCampaign, 250);
      setTimeout(restoreHatanCampaign, 900);
    }, { once: true });
  } else {
    setTimeout(run, 250);
    setTimeout(restoreHatanCampaign, 900);
  }
})();
