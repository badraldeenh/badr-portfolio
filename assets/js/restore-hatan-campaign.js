(() => {
  const isHome = ['/', '/index.html', '/home-v4.html'].includes(location.pathname);
  if (!isHome) return;

  function updateHatanPortfolioCopy() {
    const featuredCard = document.querySelector('#featured-branding a[href="hatan/"], #featured-branding a[href="/hatan/"]');
    if (featuredCard) {
      featuredCard.setAttribute('aria-label', 'Open HATAN AI-assisted brand identity case study');
      const title = featuredCard.querySelector('h3');
      const summary = featuredCard.querySelector('.cardBody > p:not(.projectContribution)');
      const context = featuredCard.querySelector('.projectContext');
      const contribution = featuredCard.querySelector('.projectContribution');
      const chips = featuredCard.querySelector('.miniChips');

      if (title) title.textContent = 'HATAN — Brand Identity';
      if (summary) summary.textContent = 'AI-assisted premium food brand concept refined in Adobe Illustrator across packaging, retail and takeaway applications.';
      if (context) context.textContent = 'Self-initiated AI-assisted concept';
      if (contribution) contribution.innerHTML = '<strong>My role:</strong> Creative direction, AI-assisted visual development & Illustrator refinement.';
      if (chips) chips.innerHTML = '<span>AI-Assisted</span><span>Illustrator</span><span>Packaging</span>';
    }

    const film = document.getElementById('hatan-film');
    if (film) {
      const intro = film.previousElementSibling;
      if (intro?.classList.contains('caseIntro')) {
        const eyebrow = intro.querySelector('.eyebrow');
        const heading = intro.querySelector('h3');
        const paragraph = intro.querySelector('p');
        const tag = intro.querySelector('.caseTag');
        if (eyebrow) eyebrow.textContent = 'HATAN — AI-Assisted Brand Concept';
        if (heading) heading.textContent = 'Premium Food Brand Identity';
        if (paragraph) paragraph.textContent = 'A self-initiated premium food brand concept developed through AI-assisted visual exploration, then manually refined in Adobe Illustrator across identity, packaging, retail and takeaway applications.';
        if (tag) tag.textContent = 'AI-Assisted • Illustrator • Packaging';
      }

      const videoCopy = film.querySelector('.caseVideoCopy');
      if (videoCopy) {
        const eyebrow = videoCopy.querySelector('.eyebrow');
        const paragraph = videoCopy.querySelector('p');
        const meta = videoCopy.querySelector('.caseVideoMeta');
        const note = videoCopy.querySelector('.caseVideoSound');
        if (eyebrow) eyebrow.textContent = 'AI-Assisted Campaign Concept';
        if (paragraph) paragraph.textContent = 'A 15-second vertical concept extending the HATAN identity into a fictional stadium-delivery scenario. The visuals are AI-assisted, while the HATAN brand elements and presentation were manually refined in Adobe Illustrator.';
        if (meta) meta.innerHTML = '<span>Independent Concept</span><span>AI-Assisted Visuals</span><span>Illustrator Refinement</span><span>9:16 Social Film</span><span>15 Seconds</span>';
        if (note) note.textContent = 'AI-assisted visual exploration with HATAN brand elements refined manually in Adobe Illustrator.';
      }

      const campaignCase = film.nextElementSibling;
      if (campaignCase?.classList.contains('campaignCase')) {
        const eyebrow = campaignCase.querySelector('.eyebrow');
        const heading = campaignCase.querySelector('h3');
        const summary = campaignCase.querySelector('.caseSummary');
        const facts = campaignCase.querySelector('.projectFacts');
        const stages = [...campaignCase.querySelectorAll('.caseStages li')];

        if (eyebrow) eyebrow.textContent = 'AI-assisted case study • Independent concept';
        if (heading) heading.textContent = 'From AI exploration to a refined brand system.';
        if (summary) summary.textContent = 'HATAN uses AI to explore visual directions and applications, then applies manual Adobe Illustrator refinement to improve brand consistency, typography, proportions and presentation across the final system.';
        if (facts) facts.innerHTML = '<div><dt>Tools</dt><dd>AI Creative Tools • Adobe Illustrator</dd></div><div><dt>Role</dt><dd>Creative direction • AI-assisted visual development • Illustrator refinement</dd></div><div><dt>Deliverables</dt><dd>Brand identity • Packaging • Retail • Social applications</dd></div>';

        const stageCopy = [
          ['Concept', 'Define a premium food-brand direction and the applications needed to present it as a complete visual system.'],
          ['AI Generation', 'Use AI-assisted generation to explore brand applications, mockups and supporting visual directions.'],
          ['Illustrator', 'Refine brand elements, typography, proportions and visual details manually in Adobe Illustrator.'],
          ['Brand System', 'Align the selected applications so the identity stays consistent across packaging, retail and digital touchpoints.'],
          ['Final', 'Present the refined AI-assisted concept as a cohesive premium food brand case study.']
        ];
        stages.forEach((stage, index) => {
          const [label, copy] = stageCopy[index] || [];
          if (!label) return;
          const h4 = stage.querySelector('h4');
          const p = stage.querySelector('p');
          if (h4) h4.textContent = label;
          if (p) p.textContent = copy;
        });
      }
    }
  }

  function restoreHatanCampaign() {
    updateHatanPortfolioCopy();

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
          poster="assets/img/hatan/matchday-delivery-poster.jpg"
          src="assets/video/HATAN_Stadium_Ad_Final_15s_1080x1920.mp4"
          controls
          playsinline
          preload="none"
          aria-label="HATAN Stadium Delivery Campaign — 15 second vertical concept">
        </video>
      </div>
      <div class="cardBody">
        <div class="kicker">AI-Assisted Campaign Concept</div>
        <h3>HATAN — Stadium Delivery Concept</h3>
        <p>A 15-second vertical concept extending the HATAN identity into a fictional delivery scenario using AI-assisted visuals and Illustrator-refined branding.</p>
        <div class="miniChips"><span>15 Seconds</span><span>9:16</span><span>AI Visuals</span><span>Illustrator Refinement</span></div>
        <dl class="projectFacts">
          <div><dt>Context</dt><dd>Independent AI-assisted portfolio concept</dd></div>
          <div><dt>Format</dt><dd>1080 × 1920 • 15-second vertical concept</dd></div>
          <div><dt>Role</dt><dd>Creative direction, AI-assisted visual development & Illustrator refinement</dd></div>
          <div><dt>Tools</dt><dd>AI Creative Tools • Adobe Illustrator</dd></div>
        </dl>
      </div>`;

    grid.prepend(card);

    const heading = work.querySelector('.sectionHead h2');
    const sub = work.querySelector('.sectionHead p');
    if (heading) heading.textContent = 'Selected Video Projects';
    if (sub) sub.textContent = 'Advertising films, product storytelling and AI-assisted visual concepts, led by the HATAN stadium-delivery concept.';

    const cards = [...grid.querySelectorAll(':scope > .card')];
    cards.forEach((item, index) => {
      if (item.querySelector('.rank')) {
        const rank = item.querySelector('.rank');
        if (item.id === 'hatan-campaign-video-card') rank.textContent = '01 • Featured';
        else rank.textContent = String(index + 1).padStart(2, '0');
      }
    });

    return true;
  }

  const run = () => {
    updateHatanPortfolioCopy();
    if (restoreHatanCampaign()) return;
    setTimeout(restoreHatanCampaign, 300);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      updateHatanPortfolioCopy();
      setTimeout(restoreHatanCampaign, 250);
      setTimeout(restoreHatanCampaign, 900);
    }, { once: true });
  } else {
    setTimeout(run, 250);
    setTimeout(restoreHatanCampaign, 900);
  }
})();
