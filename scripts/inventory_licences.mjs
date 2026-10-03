import fs from 'node:fs';
import path from 'node:path';

// Installed metadata evidence, not an assertion of legal/security clearance.
const root = process.cwd();
const rows = [];
function visitModules(directory) {
  if (!fs.existsSync(directory)) return;
  for (const name of fs.readdirSync(directory).sort()) {
    if (name.startsWith('.')) continue;
    const target = path.join(directory, name);
    if (!fs.statSync(target).isDirectory()) continue;
    if (name.startsWith('@')) {
      for (const child of fs.readdirSync(target).sort()) inspect(path.join(target, child));
    } else inspect(target);
  }
}
function inspect(directory) {
  const filename = path.join(directory, 'package.json');
  if (!fs.existsSync(filename)) return;
  const pkg = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const files = fs.readdirSync(directory).filter((name) => /^(licen[cs]e|copying|notice)([.-]|$)/iu.test(name) && fs.statSync(path.join(directory, name)).isFile());
  rows.push({ name: pkg.name, version: pkg.version, licence: typeof pkg.license === 'string' ? pkg.license : pkg.license?.type ?? 'UNKNOWN',
    metadata: path.relative(root, filename), notices: files.map((file) => path.relative(root, path.join(directory, file))) });
  visitModules(path.join(directory, 'node_modules'));
}
visitModules(path.join(root, 'node_modules'));
rows.sort((a, b) => `${a.name}@${a.version}:${a.metadata}`.localeCompare(`${b.name}@${b.version}:${b.metadata}`));
fs.writeFileSync('docs/NODE_DEPENDENCIES.json', `${JSON.stringify({ method: 'Installed package.json licence declarations and local notice-file paths; build-time and runtime dependencies are distinguished in THIRD_PARTY.md. Not a legal or security clearance.', packages: rows }, null, 2)}\n`);
const shipped = rows.filter((row) => ['react', 'react-dom', 'scheduler'].includes(row.name) || row.name.startsWith('workbox-'));
let text = 'THIRD-PARTY NOTICES\n\nRuntime libraries and service-worker tooling. Licence notices copied from installed packages; this file is not an endorsement.\n\n';
for (const row of shipped) {
  text += `\n=== ${row.name} ${row.version} (${row.licence}) ===\n`;
  if (!row.notices.length) throw new Error(`Missing notice: ${row.name}`);
  for (const file of row.notices) text += `\n${path.basename(file)}\n${fs.readFileSync(file, 'utf8')}\n`;
}
text += '\n=== Historical data ===\nSource: European Central Bank (ECB). Source observations are unchanged; relative changes and virtual-money teaching outcomes are app calculations, not ECB outputs. No endorsement. The source is free of charge.\nSource: https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.xml\nTerms: https://www.ecb.europa.eu/services/using-our-site/disclaimer/html/index.en.html\n"When such information is distributed or reproduced, it must appear accurately and the ECB must be cited as the source."\n"If the information is modified by the user (e.g. by seasonal adjustment of statistical data or calculation of growth rates) this must be stated explicitly."\n\nAudio build provenance and remaining upstream uncertainty: see docs/THIRD_PARTY.md and the audio manifest. Model weights and build-time tools are not part of this web app.\n';
fs.writeFileSync('public/THIRD_PARTY_NOTICES.txt', text);
console.log(`${rows.length} installed packages inventoried; ${shipped.length} runtime/service-worker notice groups. Unknown declarations: ${rows.filter((row) => row.licence === 'UNKNOWN').map((row) => row.name).join(', ') || 'none'}`);
