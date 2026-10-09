from pathlib import Path

path = Path('index.html')
html = path.read_text(encoding='utf-8')

if 'id="avena-design"' not in html:
    marker = '''        <div class="sectionHead"><h2>Brand Identity & Design</h2><p>Selected identity, packaging and retail applications developed as complete visual systems.</p></div>'''
    block = marker + '''

        <div id="avena-design" style="scroll-margin-top:90px">
          <div class="caseIntro">
            <div><div class="eyebrow">AVENA — Medical Center</div><h3>Healthcare Brand Identity</h3><p>A complete medical-center identity system built around precision, trust and contemporary patient care, extending from the core logo and typography to stationery, uniforms, environmental branding, digital booking, vehicle graphics and campaign applications.</p></div>
            <span class="caseTag">Healthcare • Identity • Digital</span>
          </div>
          <a class="caseHero" href="avena.html" aria-label="Open AVENA Medical Center full case study"><img src="assets/img/avena-hero-4k.webp" alt="AVENA Medical Center healthcare brand identity" loading="lazy"><div class="caseCaption"><b>AVENA Medical Center</b><span class="caseMeta">Healthcare Brand System</span></div></a>
          <div class="panel campaignCase">
            <div class="eyebrow">Complete Identity System</div>
            <h3>Care, Precisely.</h3>
            <p>AVENA combines a calm clinical palette with a precise visual language designed for a modern medical environment. The system covers physical, environmental and digital touchpoints while keeping the brand clear, premium and human.</p>
            <div class="chips"><span class="chip">Logo System</span><span class="chip">Typography</span><span class="chip">Stationery</span><span class="chip">Medical Uniforms</span><span class="chip">Interior & Exterior</span><span class="chip">Booking UI</span><span class="chip">Vehicle Branding</span><span class="chip">Campaign Visuals</span></div>
            <div class="actions" style="margin-top:20px"><a class="btn primary" href="avena.html">View Full AVENA Case Study</a></div>
          </div>
          <div class="caseGrid">
            <a class="caseShot" href="avena.html"><img src="assets/img/avena-case-study-part-1-4k.webp" alt="AVENA identity system and brand applications part one" loading="lazy"><div class="caseCaption"><b>Identity & Core Applications</b><span class="caseMeta">Logo • Type • Stationery • Uniforms</span></div></a>
            <a class="caseShot" href="avena.html"><img src="assets/img/avena-case-study-part-2-4k.webp" alt="AVENA environmental digital and campaign applications part two" loading="lazy"><div class="caseCaption"><b>Environmental & Digital Applications</b><span class="caseMeta">Interior • Exterior • Digital • Campaign</span></div></a>
          </div>
          <p class="caseNote">Self-initiated portfolio concept created to demonstrate a complete healthcare identity system across physical and digital touchpoints.</p>
        </div>
        <div style="height:1px;background:var(--line);margin:56px 0"></div>'''
    if marker not in html:
        raise SystemExit('Brand Identity & Design marker not found; refusing unsafe edit')
    html = html.replace(marker, block, 1)

path.write_text(html, encoding='utf-8')
