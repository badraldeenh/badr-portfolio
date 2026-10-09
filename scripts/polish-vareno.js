const fs = require('fs');
const path = require('path');

const out = 'dist';
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const entry of fs.readdirSync('.')) {
  if (['dist', '.git', '.github', 'scripts'].includes(entry)) continue;
  fs.cpSync(entry, path.join(out, entry), { recursive: true });
}

const sourcePath = 'index.html';
let html = fs.readFileSync(sourcePath, 'utf8');

const start = html.indexOf('<div id="vareno-case"');
const end = html.indexOf('<div class="caseIntro">', start + 1);
if (start === -1 || end === -1) throw new Error('VARENO block not found');

const previewCss = `
    /* VARENO SAFE PREVIEW — scoped only to this project */
    #vareno-case{scroll-margin-top:90px}
    .varenoPreview{margin:18px 0 56px;border:1px solid var(--line);border-radius:24px;overflow:hidden;background:linear-gradient(135deg,#171719,#111113)}
    .varenoPreviewMedia{background:#0a0a0b;border-bottom:1px solid var(--line)}
    .varenoPreviewMedia img{display:block;width:100%;height:auto}
    .varenoPreviewBody{padding:28px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:end}
    .varenoPreviewBody h3{margin:4px 0 10px;font-size:30px;letter-spacing:-.025em}
    .varenoPreviewBody p{margin:0;color:var(--muted);max-width:760px}
    .varenoPreviewMeta{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}
    .varenoPreviewMeta span{font-size:11px;color:#d7d5ce;padding:6px 9px;border:1px solid #323238;border-radius:999px;background:#101012}
    .varenoPreviewAction{white-space:nowrap}
    @media(max-width:760px){.varenoPreviewBody{grid-template-columns:1fr}.varenoPreviewAction{justify-self:start}.varenoPreviewBody h3{font-size:26px}}
`;
html = html.replace('  </style>', previewCss + '  </style>');

const preview = `
        <article id="vareno-case" class="varenoPreview" aria-labelledby="vareno-preview-title">
          <div class="varenoPreviewMedia">
            <img data-vareno-image="hero" alt="VARENO Barber Club premium identity showcase" loading="lazy">
          </div>
          <div class="varenoPreviewBody">
            <div>
              <div class="eyebrow">VARENO — Barber Club</div>
              <h3 id="vareno-preview-title">Luxury Grooming Brand Identity</h3>
              <p>A complete premium barber-club identity spanning strategy, logo architecture, environmental branding, uniforms, grooming products, stationery and digital touchpoints.</p>
              <div class="varenoPreviewMeta"><span>Brand Strategy</span><span>Visual Identity</span><span>Art Direction</span><span>Digital</span></div>
            </div>
            <a class="btn primary varenoPreviewAction" href="vareno/">View full case study →</a>
          </div>
        </article>

`;

html = html.slice(0, start) + preview + html.slice(end);
fs.writeFileSync(path.join(out, 'index.html'), html, 'utf8');

const varenoDir = path.join(out, 'vareno');
fs.mkdirSync(varenoDir, { recursive: true });
const varenoPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="VARENO Barber Club — premium grooming brand identity case study by Badr Eldin Mohamed Alamin.">
  <meta name="theme-color" content="#0b0b0c">
  <title>VARENO Barber Club — Brand Identity Case Study</title>
  <style>
    :root{--bg:#0b0b0c;--panel:#141416;--text:#f4f1e9;--muted:#aaa69d;--gold:#c9a55a;--line:#2a2927;--max:1220px}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.6}a{color:inherit;text-decoration:none}img{display:block;max-width:100%}
    .top{position:sticky;top:0;z-index:20;background:rgba(11,11,12,.86);backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,255,255,.06)}
    .topin{width:min(var(--max),calc(100% - 36px));height:68px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:18px}.brand{font-weight:900;letter-spacing:.08em}.brand span{color:var(--gold)}.back{font-size:13px;color:#ddd;border:1px solid var(--line);padding:9px 12px;border-radius:999px}
    .wrap{width:min(var(--max),calc(100% - 36px));margin:auto}.hero{padding:74px 0 34px}.eyebrow{font-size:12px;color:var(--gold);font-weight:900;letter-spacing:.16em;text-transform:uppercase}.hero h1{font-size:clamp(46px,8vw,96px);line-height:.92;letter-spacing:-.055em;margin:14px 0 22px}.hero h1 span{color:var(--gold)}.lead{max-width:820px;font-size:20px;color:#c8c3b8;margin:0}.facts{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:30px}.fact{padding:15px;border:1px solid var(--line);border-radius:14px;background:#111113}.fact b{display:block;font-size:12px;color:var(--gold);margin-bottom:5px}.fact span{font-size:13px;color:#c5c0b7}
    .shot{margin:26px 0 52px;border:1px solid var(--line);border-radius:24px;overflow:hidden;background:#101011}.shot img{width:100%;height:auto}.cap{padding:15px 18px;display:flex;justify-content:space-between;gap:16px;color:#c8c3ba;font-size:13px;border-top:1px solid var(--line)}.cap b{color:#fff}.cap span{color:var(--gold);font-size:11px;text-transform:uppercase;letter-spacing:.09em}
    .section{padding:14px 0 10px}.sectionHead{display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:start;margin:0 0 22px}.num{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(201,165,90,.4);color:var(--gold);font-size:12px;font-weight:900}.sectionHead h2{font-size:32px;letter-spacing:-.03em;margin:0 0 6px}.sectionHead p{margin:0;color:var(--muted);max-width:800px}
    .overview{margin:22px 0 50px;padding:34px;border:1px solid var(--line);border-radius:20px;background:linear-gradient(135deg,#171719,#111113)}.overview h2{margin:0 0 12px;font-size:30px}.overview p{margin:0;color:#c5c0b7;max-width:900px}.promise{font-size:clamp(28px,4vw,50px);line-height:1.05;letter-spacing:-.035em;margin:14px 0 16px}.chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px}.chip{border:1px solid var(--line);border-radius:999px;padding:7px 10px;font-size:11px;color:#d3cec5;background:#101012}
    footer{padding:24px 0 56px;color:#777;font-size:13px;border-top:1px solid #1e1e20;margin-top:70px;display:flex;justify-content:space-between;gap:20px}
    @media(max-width:780px){.facts{grid-template-columns:1fr 1fr}.cap{flex-direction:column;gap:5px}.overview{padding:24px}.sectionHead h2{font-size:27px}}
    @media(max-width:520px){.wrap,.topin{width:calc(100% - 22px)}.hero{padding-top:46px}.facts{grid-template-columns:1fr}.shot{border-radius:16px;margin-bottom:38px}.overview{padding:20px}.sectionHead{gap:12px}.num{width:38px;height:38px}}
  </style>
</head>
<body>
  <nav class="top"><div class="topin"><a class="brand" href="../#design">BADR<span> Magic</span></a><a class="back" href="../#design">← Back to portfolio</a></div></nav>
  <main>
    <header class="hero wrap">
      <div class="eyebrow">Brand Identity Case Study • Self-initiated Concept</div>
      <h1>VARENO<br><span>BARBER CLUB</span></h1>
      <p class="lead">A premium grooming identity built around European elegance, contemporary masculine luxury and the idea that grooming is a personal ritual.</p>
      <div class="facts"><div class="fact"><b>ROLE</b><span>Brand Strategy • Visual Identity • Art Direction</span></div><div class="fact"><b>POSITIONING</b><span>Premium Grooming • Modern Heritage</span></div><div class="fact"><b>AUDIENCE</b><span>Style-conscious men • 25–45</span></div><div class="fact"><b>SCOPE</b><span>Environment • Packaging • Digital</span></div></div>
    </header>

    <div class="wrap"><figure class="shot"><img data-vareno-page="hero" alt="VARENO premium barber club hero showcase"><figcaption class="cap"><b>Hero Brand Experience</b><span>Crafted for the Modern Gentleman</span></figcaption></figure></div>

    <section class="section wrap"><div class="overview"><div class="eyebrow">Brand Overview</div><h2>Crafted for the modern gentleman.</h2><p>VARENO transforms the traditional barbershop into a refined club experience. The identity balances heritage craftsmanship with contemporary luxury, using a restrained visual system designed to feel precise, confident and exclusive across every customer touchpoint.</p><div class="chips"><span class="chip">Craftsmanship</span><span class="chip">Confidence</span><span class="chip">Modern Heritage</span><span class="chip">Premium Experience</span></div></div></section>

    <section class="section wrap"><div class="sectionHead"><div class="num">01</div><div><h2>Identity System</h2><p>Primary logo, VB monogram, color palette, typography, clear-space rules and the supporting brand pattern.</p></div></div><figure class="shot"><img data-vareno-page="identity" alt="VARENO identity system including logo, typography, colors and pattern"><figcaption class="cap"><b>Identity System</b><span>Logo • Color • Typography • Pattern</span></figcaption></figure></section>

    <section class="section wrap"><div class="sectionHead"><div class="num">02</div><div><h2>Brand Applications</h2><p>Exterior and interior branding, uniforms, stationery, grooming products, retail accessories and digital touchpoints.</p></div></div><figure class="shot"><img data-vareno-page="applications" alt="VARENO barber club brand applications"><figcaption class="cap"><b>Brand Applications</b><span>Environment • Uniform • Packaging • Digital</span></figcaption></figure></section>

    <section class="section wrap"><div class="overview"><div class="eyebrow">Brand Promise</div><div class="promise">More than a haircut.<br>A higher standard of grooming.</div><p>The visual identity is designed to remain consistent from the storefront and interior to staff uniforms, product packaging, appointment materials and digital booking.</p></div></section>

    <section class="section wrap"><div class="sectionHead"><div class="num">03</div><div><h2>Final Brand Showcase</h2><p>A closing view that brings the physical and digital identity together into one coherent premium brand world.</p></div></div><figure class="shot"><img data-vareno-page="final" alt="VARENO final brand showcase"><figcaption class="cap"><b>Final Brand Showcase</b><span>Complete Visual Identity</span></figcaption></figure></section>

    <footer class="wrap"><span>VARENO Barber Club — Self-initiated portfolio concept</span><a href="../#design">Back to BADR Magic portfolio ↑</a></footer>
  </main>
  <script>
    (() => {
      const assets = {hero:'hero.txt',identity:'identity.txt',applications:'applications.txt',final:'final.txt'};
      Object.entries(assets).forEach(async ([key,file]) => {
        try {
          const r = await fetch('../assets/vareno-data/' + file);
          if (!r.ok) throw new Error('HTTP ' + r.status);
          const base64 = (await r.text()).trim();
          document.querySelectorAll('[data-vareno-page="' + key + '"]').forEach(img => img.src = 'data:image/webp;base64,' + base64);
        } catch (e) {
          console.warn('VARENO asset failed', key, e);
        }
      });
    })();
  </script>
</body>
</html>`;
fs.writeFileSync(path.join(varenoDir, 'index.html'), varenoPage, 'utf8');

console.log('Built portfolio with scoped VARENO preview and dedicated case-study page.');
