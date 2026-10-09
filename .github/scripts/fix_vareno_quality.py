from pathlib import Path

path = Path('index.html')
html = path.read_text(encoding='utf-8')

css_marker = '      #character-scenes .media{max-height:600px}#character-scenes .media video{object-fit:contain}'
css_block = css_marker + '''\n      .varenoQualityHero,.varenoQualityShot{background:radial-gradient(circle at 50% 35%,#211d17 0,#111113 58%,#0b0b0d 100%);display:grid;grid-template-columns:1fr;place-items:center;padding:clamp(20px,4vw,48px);overflow:hidden}\n      .varenoQualityHero img,.varenoQualityShot img{width:auto!important;height:auto!important;max-width:100%;object-fit:contain;image-rendering:auto;filter:contrast(1.04) saturate(1.03);box-shadow:0 18px 48px rgba(0,0,0,.34);border-radius:12px}\n      .varenoQualityHero img{max-width:420px}\n      .varenoQualityShot img{max-width:320px}\n      .varenoQualityHero .caseCaption,.varenoQualityShot .caseCaption{width:100%;justify-self:stretch;margin-top:18px;padding-left:0;padding-right:0}\n      @media(max-width:620px){.varenoQualityHero,.varenoQualityShot{padding:18px}.varenoQualityHero img,.varenoQualityShot img{max-width:100%}}'''

if '.varenoQualityHero' not in html:
    if css_marker not in html:
        raise SystemExit('CSS marker not found')
    html = html.replace(css_marker, css_block, 1)

replacements = {
    '<figure class="caseHero"><img data-vareno-image="hero"': '<figure class="caseHero varenoQualityHero"><img data-vareno-image="hero"',
    '<figure class="caseShot"><img data-vareno-image="identity"': '<figure class="caseShot varenoQualityShot"><img data-vareno-image="identity"',
    '<figure class="caseShot"><img data-vareno-image="applications"': '<figure class="caseShot varenoQualityShot"><img data-vareno-image="applications"',
    '<figure class="caseHero"><img data-vareno-image="final"': '<figure class="caseHero varenoQualityHero"><img data-vareno-image="final"',
}

for old, new in replacements.items():
    if old in html:
        html = html.replace(old, new, 1)

path.write_text(html, encoding='utf-8')
