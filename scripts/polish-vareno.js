const fs = require('fs');
const path = require('path');

const out = 'dist';
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const entry of fs.readdirSync('.')) {
  if (['dist', '.git', '.github', 'scripts'].includes(entry)) continue;
  fs.cpSync(entry, path.join(out, entry), { recursive: true });
}

let html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf('<div id="vareno-case"');
const end = html.indexOf('<div class="caseIntro">', start + 1);
if (start === -1 || end === -1) throw new Error('VARENO block not found');

const previewCss = `
    /* VARENO SAFE PREVIEW — scoped to this project only */
    #vareno-case{scroll-margin-top:90px}.varenoPreview{margin:18px 0 56px;border:1px solid var(--line);border-radius:24px;overflow:hidden;background:linear-gradient(135deg,#171719,#111113)}.varenoPreviewMedia{background:#0a0a0b;border-bottom:1px solid var(--line)}.varenoPreviewMedia img{display:block;width:100%;height:auto}.varenoPreviewBody{padding:28px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:end}.varenoPreviewBody h3{margin:4px 0 10px;font-size:30px;letter-spacing:-.025em}.varenoPreviewBody p{margin:0;color:var(--muted);max-width:760px}.varenoPreviewMeta{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}.varenoPreviewMeta span{font-size:11px;color:#d7d5ce;padding:6px 9px;border:1px solid #323238;border-radius:999px;background:#101012}.varenoPreviewAction{white-space:nowrap}@media(max-width:760px){.varenoPreviewBody{grid-template-columns:1fr}.varenoPreviewAction{justify-self:start}.varenoPreviewBody h3{font-size:26px}}
`;
html = html.replace('  </style>', previewCss + '  </style>');

const preview = `
        <article id="vareno-case" class="varenoPreview" aria-labelledby="vareno-preview-title">
          <a class="varenoPreviewMedia" href="vareno/" aria-label="View VARENO Barber Club case study"><img data-vareno-image="hero" alt="VARENO Barber Club premium identity showcase" loading="lazy"></a>
          <div class="varenoPreviewBody"><div><div class="eyebrow">VARENO — Barber Club</div><h3 id="vareno-preview-title">Luxury Grooming Brand Identity</h3><p>A complete premium barber-club identity spanning strategy, logo architecture, environmental branding, uniforms, grooming products, stationery and digital touchpoints.</p><div class="varenoPreviewMeta"><span>Brand Strategy</span><span>Visual Identity</span><span>Art Direction</span><span>Digital</span></div></div><a class="btn primary varenoPreviewAction" href="vareno/">View full case study →</a></div>
        </article>

`;
html = html.slice(0, start) + preview + html.slice(end);
fs.writeFileSync(path.join(out, 'index.html'), html, 'utf8');
console.log('Built portfolio with scoped VARENO preview and standalone English case study.');
