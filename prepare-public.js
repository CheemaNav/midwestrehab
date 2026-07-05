const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'public');
const FILES = ['index.html', 'hero-bg.jpg', 'hero-bg.mp4', 'logo.png'];

fs.mkdirSync(OUT, { recursive: true });

for (const file of FILES) {
  const src = path.join(ROOT, file);
  if (!fs.existsSync(src)) {
    console.warn('Skipping missing file:', file);
    continue;
  }
  fs.copyFileSync(src, path.join(OUT, file));
  console.log('Copied', file, '→ public/');
}

console.log('Prepared public/ for Vercel');
