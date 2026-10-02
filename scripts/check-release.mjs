import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const blockers = [];
function walk(dir) { if (!fs.existsSync(dir)) return []; return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => { const full = path.join(dir, entry.name); return entry.isDirectory() ? walk(full) : [full]; }); }
const jsonFiles = walk(path.join(root, 'src')).filter((file) => file.endsWith('.json') && !file.endsWith('lint-allowlist.json'));
for (const file of jsonFiles) {
  let value; try { value = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { continue; }
  const scan = (item, key = '') => { if (item && typeof item === 'object') for (const [name, child] of Object.entries(item)) { if (name === 'isPlaceholder' && child === true) blockers.push(`${path.relative(root, file)}: placeholder episode is not shippable`); if (name === 'verified' && child === false) blockers.push(`${path.relative(root, file)}: unverified resource is not shippable`); if (name === 'status' && child === 'draft') blockers.push(`${path.relative(root, file)}: draft content (${key || name})`); scan(child, name); } else if (typeof item === 'string' && item.includes('TODO(human)')) blockers.push(`${path.relative(root, file)}: TODO(human) remains`); };
  scan(value);
}
for (const file of walk(path.join(root, 'src'))) if (file.endsWith('.ts') || file.endsWith('.tsx')) { const source = fs.readFileSync(file, 'utf8'); if (source.includes('TODO(human)')) blockers.push(`${path.relative(root, file)}: TODO(human) remains`); }
if (blockers.length) { console.error('Release blocked by:'); [...new Set(blockers)].forEach((item) => console.error(`- ${item}`)); process.exit(1); }
console.log('Release checks passed: no placeholder, unverified, draft, or human TODO blockers.');
