(() => {
  if (!['/', '/index.html'].includes(location.pathname)) return;
  if (document.getElementById('kettlo-feature-card')) return;

  const grid = document.querySelector('#featured-branding .brandPriorityGrid');
  if (!grid) return;

  const style = document.createElement('style');
  style.id = 'kettlo-home-style';
  style.textContent = `
    .kettloHomeMedia{background:#0f3d2e!important;display:grid;place-items:center;padding:0!important;overflow:hidden}
    .kettloHomeMedia svg{width:100%;height:100%;display:block}
    #kettlo-feature-card .projectContext{display:inline-block;margin-top:10px;color:#9f9e99;font-size:12px}
  `;
  document.head.appendChild(style);

  const card = document.createElement('a');
  card.id = 'kettlo-feature-card';
  card.className = 'card brandPriorityCard';
  card.href = '/kettlo/';
  card.setAttribute('aria-label', 'Open KETTLO branding and packaging case study');
  card.innerHTML = `
    <div class="brandPriorityMedia kettloHomeMedia">
      <svg viewBox="0 0 900 560" role="img" aria-label="KETTLO kettle cooked potato chips packaging system" xmlns="http://www.w3.org/2000/svg">
        <rect width="900" height="560" fill="#0f3d2e"/>
        <circle cx="780" cy="80" r="190" fill="#f4c430" opacity=".12"/>
        <text x="54" y="92" fill="#f7e9d7" font-family="Georgia,serif" font-size="76" font-weight="900" letter-spacing="-4">KETTLO</text>
        <text x="58" y="126" fill="#e2c56f" font-family="Arial,sans-serif" font-size="14" font-weight="700" letter-spacing="5">KETTLE COOKED POTATO CHIPS</text>
        <text x="58" y="185" fill="#ffffff" font-family="Arial,sans-serif" font-size="28" font-weight="800">REAL POTATOES.</text>
        <text x="58" y="220" fill="#f4c430" font-family="Arial,sans-serif" font-size="28" font-weight="800">BOLDER FLAVORS.</text>
        <g transform="translate(250 110)">
          <g transform="rotate(-3 95 180)"><rect x="0" y="35" width="165" height="340" rx="14" fill="#13543f"/><rect x="0" y="35" width="165" height="13" fill="#0c3327"/><text x="82.5" y="104" text-anchor="middle" fill="#fff8ea" font-family="Georgia,serif" font-size="30" font-weight="900">KETTLO</text><text x="82.5" y="164" text-anchor="middle" fill="#fff8ea" font-family="Arial,sans-serif" font-size="13" font-weight="800">SOUR CREAM</text><text x="82.5" y="181" text-anchor="middle" fill="#fff8ea" font-family="Arial,sans-serif" font-size="13" font-weight="800">&amp; ONION</text><ellipse cx="58" cy="300" rx="33" ry="20" fill="#f4bd2e"/><ellipse cx="105" cy="315" rx="34" ry="21" fill="#f0a51f" transform="rotate(18 105 315)"/></g>
          <g transform="translate(145 -7) rotate(1 95 180)"><rect x="0" y="35" width="165" height="360" rx="14" fill="#f4c430"/><rect x="0" y="35" width="165" height="13" fill="#d9a616"/><text x="82.5" y="104" text-anchor="middle" fill="#0f3d2e" font-family="Georgia,serif" font-size="30" font-weight="900">KETTLO</text><text x="82.5" y="164" text-anchor="middle" fill="#0f3d2e" font-family="Arial,sans-serif" font-size="13" font-weight="800">CLASSIC SEA SALT</text><ellipse cx="58" cy="310" rx="33" ry="20" fill="#f9df72"/><ellipse cx="108" cy="326" rx="34" ry="21" fill="#eda926" transform="rotate(-15 108 326)"/></g>
          <g transform="translate(295 5) rotate(-1 95 180)"><rect x="0" y="35" width="165" height="350" rx="14" fill="#c83a2e"/><rect x="0" y="35" width="165" height="13" fill="#9d261f"/><text x="82.5" y="104" text-anchor="middle" fill="#fff8ea" font-family="Georgia,serif" font-size="30" font-weight="900">KETTLO</text><text x="82.5" y="164" text-anchor="middle" fill="#fff8ea" font-family="Arial,sans-serif" font-size="14" font-weight="800">BBQ</text><ellipse cx="56" cy="302" rx="33" ry="20" fill="#f08b26"/><ellipse cx="108" cy="318" rx="34" ry="21" fill="#dc6c1d" transform="rotate(17 108 318)"/></g>
          <g transform="translate(445 15) rotate(3 95 180)"><rect x="0" y="35" width="165" height="340" rx="14" fill="#e77f21"/><rect x="0" y="35" width="165" height="13" fill="#bd5e12"/><text x="82.5" y="104" text-anchor="middle" fill="#0f3d2e" font-family="Georgia,serif" font-size="30" font-weight="900">KETTLO</text><text x="82.5" y="164" text-anchor="middle" fill="#0f3d2e" font-family="Arial,sans-serif" font-size="14" font-weight="800">CHEESE</text><ellipse cx="55" cy="295" rx="33" ry="20" fill="#f4bd2e"/><ellipse cx="107" cy="312" rx="34" ry="21" fill="#eda526" transform="rotate(-12 107 312)"/></g>
        </g>
      </svg>
    </div>
    <div class="cardBody">
      <div class="kicker">06 • Packaging &amp; Branding</div>
      <h3>KETTLO — Kettle Cooked Potato Chips</h3>
      <p>A controlled four-flavor brand system developed from identity and packaging architecture through retail, social and outdoor applications.</p>
      <span class="projectContext">Self-initiated portfolio concept</span>
      <p class="projectContribution"><strong>My role:</strong> Concept direction, visual system &amp; presentation.</p>
      <div class="miniChips"><span>Brand Identity</span><span>Packaging</span><span>Retail</span></div>
    </div>`;

  const hatan = [...grid.querySelectorAll('a')].find(el => (el.getAttribute('href') || '').includes('hatan'));
  if (hatan) hatan.insertAdjacentElement('afterend', card);
  else grid.appendChild(card);

  const maleh = document.getElementById('maleh-helow-design');
  const transformer = document.getElementById('transformer-design');
  if (maleh) {
    const kicker = maleh.querySelector('.kicker');
    if (kicker) kicker.textContent = '07 • Food Advertising';
  }
  if (transformer) {
    const kicker = transformer.querySelector('.kicker');
    if (kicker) kicker.textContent = '08 • Automotive Advertising';
  }
})();
