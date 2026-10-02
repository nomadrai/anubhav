import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
const root = process.cwd();
const budgets = { js: 150 * 1024, css: 20 * 1024 };
const dist = path.join(root, 'dist');
if (!fs.existsSync(dist)) { console.error('Bundle check needs dist/. Run npm run build first.'); process.exit(1); }
function files(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => { const full = path.join(dir, entry.name); return entry.isDirectory() ? files(full) : [full]; }); }
const totals = { js: 0, css: 0 };
for (const file of files(dist)) { const type = file.endsWith('.js') ? 'js' : file.endsWith('.css') ? 'css' : undefined; if (type) totals[type] += gzipSync(fs.readFileSync(file)).length; }
console.table([{ asset: 'JavaScript', gzipBytes: totals.js, budgetBytes: budgets.js, status: totals.js <= budgets.js ? 'OK' : 'OVER' }, { asset: 'CSS', gzipBytes: totals.css, budgetBytes: budgets.css, status: totals.css <= budgets.css ? 'OK' : 'OVER' }]);
if (totals.js > budgets.js || totals.css > budgets.css) { console.error('Bundle budget exceeded. Values are gzip bytes.'); process.exit(1); }
console.log('Bundle budgets passed.');
