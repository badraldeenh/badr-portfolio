const fs = require('fs');
const path = require('path');

const out = 'dist';
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const entry of fs.readdirSync('.')) {
  if (['dist', '.git', '.github', 'scripts'].includes(entry)) continue;
  fs.cpSync(entry, path.join(out, entry), { recursive: true });
}

console.log('Built portfolio unchanged to dist/.');
