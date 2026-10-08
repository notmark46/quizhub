// Scans public/files/*.json and writes public/files/index.json (the list of subjects).
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, 'public', 'files');
const out = [];
for (const f of fs.readdirSync(dir).sort()) {
  if (!f.endsWith('.json') || f === 'index.json') continue;
  try {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const name = j._name || f.replace(/\.json$/, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    out.push({ file: f, name, icon: j._icon || '📘' });
  } catch (e) { console.warn('Skipping', f, '-', e.message); }
}
fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(out, null, 2));
console.log('Subjects:', out.map(o => o.name).join(', ') || '(none)');
