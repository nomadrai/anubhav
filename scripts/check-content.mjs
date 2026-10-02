import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contentRoot = path.join(root, 'src/content');
const languages = fs.readdirSync(contentRoot).filter((name) => fs.statSync(path.join(contentRoot, name)).isDirectory());
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const files = [];
function walk(dir) { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { const full = path.join(dir, entry.name); if (entry.isDirectory()) walk(full); else if (entry.name.endsWith('.json')) files.push(full); } }
walk(contentRoot);
const allowlist = readJson(path.join(contentRoot, 'lint-allowlist.json'));
const rel = (file) => path.relative(root, file).replaceAll(path.sep, '/');
const allowed = (pattern, file) => allowlist.some((item) => item.pattern === pattern && rel(file).includes(item.file.replace('*', '')) && item.reason);
const failures = [];
const warnings = [];
const banned = [
  ['buy', /\bbuy\b/i], ['sell', /\bsell\b/i], ['hold', /\bhold\b/i], ['target price', /target\s+price/i], ['tip', /\btip\b/i], ['sure-shot', /sure[- ]shot/i], ['guaranteed', /guarantee[ds]?|guaranteed/i], ['risk-free', /risk[- ]free/i], ['will rise/fall', /\bwill\s+(rise|fall)\b/i], ['broker/app promotion', /\b(broker|premium|affiliate|sign[- ]?up)\b/i], ['recommendation Hindi', /खरीदें|बेचें|गारंटी|पक्का\s*मुनाफ़ा|टिप/],
];
for (const file of files) {
  if (file.endsWith('lint-allowlist.json')) continue;
  const value = readJson(file);
  const source = JSON.stringify(value);
  const textValues = [];
  const collectText = (item) => { if (typeof item === 'string') textValues.push(item); else if (Array.isArray(item)) item.forEach(collectText); else if (item && typeof item === 'object') Object.values(item).forEach(collectText); };
  collectText(value);
  const textSource = textValues.join(' ');
  for (const [name, pattern] of banned) if (pattern.test(textSource) && !allowed(name, file)) failures.push(`${rel(file)}: banned pattern ${name}`);
  for (const match of source.matchAll(/https?:\/\/[^"\\\s]+/g)) if (!file.endsWith('resources.json')) failures.push(`${rel(file)}: URL must live in resources.json (${match[0]})`);
  const strings = [];
  const collect = (item) => { if (typeof item === 'string') strings.push(item); else if (Array.isArray(item)) item.forEach(collect); else if (item && typeof item === 'object') Object.values(item).forEach(collect); };
  collect(value);
  for (const string of strings) if (!string.trim()) failures.push(`${rel(file)}: empty string`);
  if (file.endsWith('narration.json')) for (const entry of value) {
    if (/[0-9₹%]/.test(entry.spokenText) || (/[A-Za-z]/.test(entry.spokenText) && !allowed('Latin spoken script', file))) failures.push(`${rel(file)} ${entry.id}: spokenText contains unapproved symbols or Latin letters`);
    if ((entry.displayText.match(/\S+/g) ?? []).length > 25) warnings.push(`${rel(file)} ${entry.id}: displayText is over 25 words`);
  }
}
const parityTargets = ['ui.json', 'debrief.json', 'glossary.json', 'narration.json'];
function shape(value) { if (Array.isArray(value)) return value.map((item) => item && typeof item === 'object' ? item.id ?? item.termId ?? shape(item) : typeof item); if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, shape(child)])); return typeof value; }
if (languages.includes('en') && languages.includes('hi')) for (const target of parityTargets) {
  const en = readJson(path.join(contentRoot, 'en', target)); const hi = readJson(path.join(contentRoot, 'hi', target));
  if (JSON.stringify(shape(en)) !== JSON.stringify(shape(hi))) failures.push(`i18n parity mismatch: ${target}`);
}
const manifestFile = path.join(root, 'public/audio/manifest.json');
const ids = readJson(path.join(contentRoot, 'en/narration.json')).map((item) => item.id);
if (!fs.existsSync(manifestFile)) warnings.push(`audio manifest missing: ${ids.length} narration entries have no generated audio (Phase 0 warning)`);
else { const manifest = readJson(manifestFile); for (const id of ids) if (!manifest[id]) failures.push(`audio manifest missing narration id ${id}`); }
for (const warning of warnings) console.warn(`WARNING: ${warning}`);
if (failures.length) { console.error('Content check failed:'); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1); }
console.log(`Content check passed: ${languages.length} languages, ${ids.length} narration entries.`);
