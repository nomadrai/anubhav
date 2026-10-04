import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { checkAudio, sha256 } from './check-audio.mjs';
import { checkKnowledge } from './check-knowledge.mjs';

const CONTENT_FILES = ['ui.json', 'debrief.json', 'glossary.json', 'narration.json'];
const CONTENT_STATUSES = new Set(['draft', 'agent-checked', 'reviewed', 'planned']);
const PLACEHOLDER_PATTERN = /\{([A-Za-z][A-Za-z0-9]*)\}/g;
const BANNED_PATTERNS = [
  ['buy', /\bbuy\b/i],
  ['sell', /\bsell\b/i],
  ['hold', /\bhold\b/i],
  ['target price', /target\s+price/i],
  ['tip', /\btip\b/i],
  ['recommendation', /\b(?:recommend(?:ation|ed)?|you\s+should|advised\s+to|consider)\b/i],
  ['sure-shot', /sure[- ]?shot/i],
  ['guaranteed', /guarantee[ds]?|guaranteed/i],
  ['risk-free', /risk[- ]free/i],
  ['will rise/fall', /\bwill\s+(?:rise|fall)\b/i],
  ['broker/app promotion', /\b(?:broker|premium|affiliate|sign[- ]?up|subscribe|referral|cashback|bonus)\b/i],
  ['profit promotion', /\b(?:easy|quick|guaranteed|sure[- ]?shot)\s+(?:profit|return|returns|money)\b/i],
  ['Hindi advice', /खरीदें|बेचें|खरीदना\s+चाहिए|बेचना\s+चाहिए|निवेश\s+करें|निवेश\s+करना\s+चाहिए|सलाह\s+(?:ले|लें|मानें)|गारंटी|पक्का\s*मुनाफ़ा|पक्का\s*मुनाफा|सिफारिश/],
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function globMatches(pattern, value) {
  const expression = `^${pattern.split('*').map(escapeRegExp).join('.*')}$`;
  return new RegExp(expression).test(value);
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function relative(root, file) {
  return path.relative(root, file).replaceAll(path.sep, '/');
}

function wordCount(text) {
  return text.match(/[\p{L}\p{M}\p{N}]+(?:['’\u2010-\u2011][\p{L}\p{M}\p{N}]+)*/gu)?.length ?? 0;
}

function sentenceParts(text) {
  return text.split(/[.!?।॥]+/u).map((part) => part.trim()).filter(Boolean);
}

function isUserFacingFile(file) {
  return /src\/content\/(?:en|hi)\/[^/]+\.json$/u.test(file);
}

function isUserFacingField(file, key) {
  if (!isUserFacingFile(file)) return false;
  if (['id', 'termId', 'trigger', 'status'].includes(key)) return false;
  return true;
}

function collectStrings(value, callback, location = '$') {
  if (typeof value === 'string') {
    callback(value, location);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => collectStrings(item, callback, `${location}[${index}]`));
  } else if (isPlainObject(value)) {
    Object.entries(value).forEach(([key, child]) => collectStrings(child, callback, `${location}.${key}`));
  }
}

function collectPlaceholders(value, failures, file, location = '$', found = new Map()) {
  if (typeof value === 'string') {
    const matches = [...value.matchAll(PLACEHOLDER_PATTERN)];
    const remainder = value.replace(PLACEHOLDER_PATTERN, '');
    if (/[{}]/u.test(remainder)) failures.push(`${file} ${location}: malformed placeholder braces`);
    for (const match of matches) {
      const key = `${location}:${match[1]}`;
      found.set(key, (found.get(key) ?? 0) + 1);
    }
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => collectPlaceholders(item, failures, file, `${location}[${index}]`, found));
  } else if (isPlainObject(value)) {
    Object.entries(value).forEach(([key, child]) => collectPlaceholders(child, failures, file, `${location}.${key}`, found));
  }
  return found;
}

function shape(value) {
  if (Array.isArray(value)) return value.map(shape);
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, shape(value[key])]));
  }
  if (value === null) return 'null';
  return typeof value;
}

function identityShape(value) {
  if (Array.isArray(value)) return value.map(identityShape);
  if (isPlainObject(value)) {
    const identity = value.id ?? value.termId;
    return identity === undefined ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, identityShape(value[key])])) : identity;
  }
  return null;
}

function validateEntryCollection(value, file, failures) {
  const basename = path.basename(file);
  const required = basename === 'narration.json'
    ? ['id', 'displayText', 'spokenText', 'trigger', 'status']
    : ['termId', 'term', 'displayText', 'short', 'analogy', 'spokenText', 'status'];
  if (!Array.isArray(value)) {
    failures.push(`${file}: expected an array of bilingual entries`);
    return;
  }
  const ids = new Set();
  value.forEach((entry, index) => {
    if (!isPlainObject(entry)) {
      failures.push(`${file}[${index}]: expected an entry object`);
      return;
    }
    for (const field of required) {
      if (typeof entry[field] !== 'string' || !entry[field].trim()) failures.push(`${file}[${index}]: missing or empty ${field}`);
    }
    const id = entry.id ?? entry.termId;
    if (typeof id === 'string') {
      if (ids.has(id)) failures.push(`${file}: duplicate entry id ${id}`);
      ids.add(id);
    }
    if (typeof entry.status === 'string') {
      if (!CONTENT_STATUSES.has(entry.status)) failures.push(`${file}[${index}]: invalid status ${entry.status}`);
      if (['draft', 'planned'].includes(entry.status)) failures.push(`${file}[${index}]: ${entry.status} content is not shippable`);
    }
  });
}

function validateUserFacingLimits(value, file, failures, latinAllowed) {
  collectStrings(value, (text, location) => {
    const key = location.split('.').at(-1)?.replace(/\].*$/u, '') ?? '';
    if (!isUserFacingField(file, key) || location.startsWith('$._meta.')) return;
    for (const sentence of sentenceParts(text)) {
      if (wordCount(sentence) > 25) failures.push(`${file} ${location}: sentence exceeds 25 words`);
    }
    if (key !== 'spokenText') return;
    const withoutPlaceholders = text.replace(PLACEHOLDER_PATTERN, '');
    if (/[\p{N}₹%×÷=+*/<>|]/u.test(withoutPlaceholders)) failures.push(`${file} ${location}: spokenText contains numeric or symbol notation`);
    const language = file.split('/').at(-2);
    if (/\p{Script=Latin}/u.test(withoutPlaceholders) && language === 'hi') failures.push(`${file} ${location}: Hindi spokenText contains Latin letters`);
    if (/\p{Script=Latin}/u.test(withoutPlaceholders) && language === 'en' && !latinAllowed) failures.push(`${file} ${location}: spokenText contains unapproved Latin letters`);
  });
}

export function checkContent(root = process.cwd()) {
  const contentRoot = path.join(root, 'src/content');
  const failures = [];
  const warnings = [];
  const parsed = new Map();
  const readJson = (file) => {
    if (parsed.has(file)) return parsed.get(file);
    if (!fs.existsSync(file)) {
      failures.push(`${relative(root, file)}: missing JSON file`);
      parsed.set(file, undefined);
      return undefined;
    }
    try {
      const value = JSON.parse(fs.readFileSync(file, 'utf8'));
      parsed.set(file, value);
      return value;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'invalid JSON';
      failures.push(`${relative(root, file)}: invalid JSON (${message})`);
      parsed.set(file, undefined);
      return undefined;
    }
  };

  if (!fs.existsSync(contentRoot)) {
    failures.push('src/content: content directory is missing');
    return { failures, warnings, languages: [], narrationCount: 0 };
  }

  const allowlistFile = path.join(contentRoot, 'lint-allowlist.json');
  const allowlistValue = readJson(allowlistFile);
  const allowlist = Array.isArray(allowlistValue) ? allowlistValue : [];
  if (!Array.isArray(allowlistValue)) failures.push('src/content/lint-allowlist.json: expected an array');
  allowlist.forEach((item, index) => {
    if (!isPlainObject(item) || typeof item.pattern !== 'string' || typeof item.file !== 'string' || typeof item.reason !== 'string' || !item.reason.trim()) {
      failures.push(`src/content/lint-allowlist.json[${index}]: each allowlist item needs pattern, file, and reason`);
    }
  });
  const allowed = (pattern, file) => allowlist.some((item) => isPlainObject(item) && item.pattern === pattern && typeof item.file === 'string' && globMatches(item.file, relative(root, file)) && typeof item.reason === 'string' && Boolean(item.reason.trim()));

  const languageDirectories = fs.readdirSync(contentRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  for (const language of ['en', 'hi']) if (!languageDirectories.includes(language)) failures.push(`src/content/${language}: required language directory is missing`);
  const languages = languageDirectories.filter((language) => ['en', 'hi'].includes(language));
  const files = walk(contentRoot).filter((file) => file.endsWith('.json') && !file.endsWith('lint-allowlist.json') && !file.endsWith('review-status.json'));
  const registry = readJson(path.join(contentRoot, 'review-status.json'));
  if (!isPlainObject(registry) || registry.schemaVersion !== 1 || !isPlainObject(registry.languages)) failures.push('src/content/review-status.json: invalid review registry');
  const seenRegistry = new Set();
  const checkStatus = (status, label) => {
    if (!['draft', 'agent-checked', 'reviewed'].includes(status)) failures.push(`${label}: missing or invalid review status`);
    else if (status === 'draft') failures.push(`${label}: draft content is not shippable`);
    else if (status === 'agent-checked') warnings.push(`AGENT-CHECKED STRING (not human/native-reviewed): ${label}`);
  };

  const checkLeaf = (text, language, filename, id, label, declaredStatus) => {
    const review = registry?.languages?.[language]?.[filename]?.[id];
    seenRegistry.add(`${language}/${filename}/${id}`);
    checkStatus(review?.status, label);
    if (review?.contentSha256 !== sha256(text)) failures.push(`${label}: missing or stale review contentSha256`);
    if (declaredStatus !== undefined && declaredStatus !== review?.status) failures.push(`${label}: entry and registry review status mismatch`);
  };

  for (const file of files) {
    const value = readJson(file);
    if (value === undefined) continue;
    const fileRelative = relative(root, file);
    const source = JSON.stringify(value);
    const textValues = [];
    // Resources render only bilingual labels. Source/evidence quotations are not UI copy;
    // they may describe prohibited claims critically, and are not a broad lint exemption.
    if (path.basename(file) === 'resources.json' && Array.isArray(value)) {
      for (const resource of value) {
        for (const language of ['en', 'hi']) {
          const label = resource?.label?.[language];
          if (typeof label !== 'string' || !label.trim()) failures.push(`${fileRelative} id=${resource?.id}: missing ${language} label`);
          else {
            textValues.push(label);
            const labelLocation = `${fileRelative} $.label.${language} id=${resource.id} language=${language}`;
            checkStatus(resource.status, labelLocation);
            checkLeaf(label, language, 'resources.json', `${resource.id}.label`, labelLocation, resource.status);
            for (const sentence of sentenceParts(label)) if (wordCount(sentence) > 25) failures.push(`${fileRelative} id=${resource.id}: label exceeds 25 words`);
          }
        }
      }
    } else collectStrings(value, (text) => textValues.push(text));
    const textSource = textValues.join(' ');
    for (const [name, pattern] of BANNED_PATTERNS) {
      if (pattern.test(textSource) && !allowed(name, file)) failures.push(`${fileRelative}: banned pattern ${name}`);
    }
    for (const match of source.matchAll(/https?:\/\/[^"\\\s]+/gu)) if (!file.endsWith('resources.json')) failures.push(`${fileRelative}: URL must live in resources.json (${match[0]})`);
    collectStrings(value, (text, location) => {
      if (!text.trim()) failures.push(`${fileRelative} ${location}: empty string`);
      if (text.includes('TODO(human)')) failures.push(`${fileRelative} ${location}: unresolved TODO(human)`);
    });
    if (isUserFacingFile(fileRelative)) {
      validateUserFacingLimits(value, fileRelative, failures, allowed('Latin spoken script', file));
      const language = fileRelative.split('/')[2];
      const filename = path.basename(file);
      if (['narration.json', 'glossary.json'].includes(filename)) {
        validateEntryCollection(value, fileRelative, failures);
        if (Array.isArray(value)) value.forEach((entry, index) => {
          if (!isPlainObject(entry) || entry.status === 'planned') return;
          collectStrings(entry, (text, location) => {
            const key = location.split('.').at(-1);
            if (['id', 'termId', 'trigger', 'status'].includes(key)) return;
            const label = `${fileRelative} $[${index}]${location.slice(1)} id=${entry.id ?? entry.termId} language=${language}`;
            checkLeaf(text, language, filename, `${entry.id ?? entry.termId}.${location.slice(2)}`, label, entry.status);
          });
        });
      } else {
        collectStrings(value, (text, location) => {
          if (location.startsWith('$._meta.')) return;
          const id = location.slice(2);
          const label = `${fileRelative} ${location} id=${id} language=${language}`;
          if (filename === 'features.json' && !['draft', 'agent-checked', 'reviewed'].includes(value?._meta?.status)) failures.push(`${label}: missing or invalid feature review status`);
          checkLeaf(text, language, filename, id, label, value?._meta?.status);
        });
      }
    }
  }

  for (const [language, languageFiles] of Object.entries(registry?.languages ?? {})) {
    for (const [filename, leaves] of Object.entries(languageFiles ?? {})) {
      for (const id of Object.keys(leaves ?? {})) if (!seenRegistry.has(`${language}/${filename}/${id}`)) failures.push(`src/content/review-status.json: stale registry leaf ${language}/${filename}/${id}`);
    }
  }
  const targets = new Set([...CONTENT_FILES, ...files.filter((file) => isUserFacingFile(relative(root, file))).map((file) => path.basename(file))]);
  for (const target of targets) {
    const enFile = path.join(contentRoot, 'en', target);
    const hiFile = path.join(contentRoot, 'hi', target);
    const en = readJson(enFile);
    const hi = readJson(hiFile);
    if (en === undefined || hi === undefined) continue;
    if (JSON.stringify(shape(en)) !== JSON.stringify(shape(hi))) failures.push(`i18n parity mismatch: ${target}`);
    if (JSON.stringify(identityShape(en)) !== JSON.stringify(identityShape(hi))) failures.push(`i18n entry identity mismatch: ${target}`);
    const enPlaceholders = collectPlaceholders(en, failures, `src/content/en/${target}`);
    const hiPlaceholders = collectPlaceholders(hi, failures, `src/content/hi/${target}`);
    const keys = new Set([...enPlaceholders.keys(), ...hiPlaceholders.keys()]);
    for (const key of keys) {
      if (enPlaceholders.get(key) !== hiPlaceholders.get(key)) failures.push(`placeholder mismatch in ${target}: ${key}`);
    }
  }

  const enNarration = readJson(path.join(contentRoot, 'en/narration.json'));
  const ids = Array.isArray(enNarration) ? enNarration.map((item) => item?.id).filter((id) => typeof id === 'string') : [];
  const audio = checkAudio(root);
  failures.push(...audio.failures);
  warnings.push(...audio.warnings);
  const knowledge = checkKnowledge(root);
  failures.push(...knowledge.failures);
  warnings.push(...knowledge.warnings);
  return { failures: [...new Set(failures)], warnings: [...new Set(warnings)], languages, narrationCount: ids.length };
}

const invokedFile = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (invokedFile === pathToFileURL(fileURLToPath(import.meta.url)).href) {
  const result = checkContent();
  for (const warning of result.warnings) console.warn(`WARNING: ${warning}`);
  if (result.failures.length) {
    console.error('Content check failed:');
    [...new Set(result.failures)].forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }
  console.log(`Content check passed: ${result.languages.length} languages, ${result.narrationCount} narration entries.`);
}
