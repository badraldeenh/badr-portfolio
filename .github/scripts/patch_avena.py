from pathlib import Path

path = Path('index.html')
html = path.read_text(encoding='utf-8')

marker = '<div class="sectionHead"><h2>Selected work</h2><p>Product advertising built from real product photography and AI-assisted production, alongside motion and narrative experiments.</p></div>'
block = marker + '''
        <div id="avena-feature" style="scroll-margin-top:90px;margin-bottom:38px">
          <div class="caseIntro" style="margin-top:0">
            <div>
              <div class="eyebrow">AVENA — Medical Center</div>
              <h3>Healthcare Brand Identity</h3>
              <p>A complete medical-center identity system covering logo presentation, typography, stationery, uniforms, interior and exterior branding, digital booking UI, vehicle branding and campaign applications.</p>
            </div>
            <span class="caseTag">Healthcare • Identity • Digital</span>
          </div>
          <a class="caseHero" href="avena.html" aria-label="View AVENA Medical Center case study">
            <img src="assets/img/avena-hero-4k.webp" alt="AVENA Medical Center brand identity case study" loading="eager">
          </a>
          <div class="panel">
            <div class="eyebrow">Featured Case Study</div>
            <h3>AVENA Medical Center</h3>
            <p>Explore the full visual identity from the core brand system through environmental, uniform, vehicle, digital and social-media applications.</p>
            <div class="actions" style="margin-top:18px"><a class="btn primary" href="avena.html">View AVENA Case Study</a></div>
          </div>
        </div>'''

if 'id="avena-feature"' not in html:
    if marker not in html:
        raise SystemExit('Selected Work marker not found; refusing unsafe edit')
    html = html.replace(marker, block, 1)

nav_old = '<a href="#reel">Showreel</a><a href="#work">Work</a><a href="#design">Design</a>'
nav_new = '<a href="#reel">Showreel</a><a href="#work">Work</a><a href="#avena-feature">AVENA</a><a href="#design">Design</a>'
nav_area = html.split('</nav>', 1)[0]
if nav_old in html and 'href="#avena-feature"' not in nav_area:
    html = html.replace(nav_old, nav_new, 1)

path.write_text(html, encoding='utf-8')
