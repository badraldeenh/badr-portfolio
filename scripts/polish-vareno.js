const fs = require('node:fs');
const path = require('node:path');
// Only public files belong in the static output. Vercel packages source api/ separately.
const out = 'dist';
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const publicFiles = ['index.html', 'home-v3.html', 'home-v4.html', 'avena.html',
  'analytics.html', 'privacy.html', 'favicon.ico', 'favicon.svg',
  'favicon-32x32.png', 'apple-touch-icon.png'];
publicFiles.forEach(file => fs.copyFileSync(file, path.join(out, file)));
for (const directory of ['aura', 'idh', 'vareno', 'hatan']) {
  fs.mkdirSync(path.join(out, directory), { recursive: true });
  fs.copyFileSync(path.join(directory, 'index.html'), path.join(out, directory, 'index.html'));
}
const publicExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg', '.ico', '.mp4', '.pdf', '.css', '.js']);
function copyAssets(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const source = path.join(directory, item.name);
    if (item.isDirectory()) copyAssets(source);
    else if (item.isFile() && publicExtensions.has(path.extname(item.name).toLowerCase())) {
      const target = path.join(out, source);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(source, target);
    }
  }
}
copyAssets('assets');
console.log('Built professional portfolio, complete case studies and public assets.');
