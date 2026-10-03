import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL, URL } from 'node:url';

export const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const hashPattern = /^[a-f0-9]{64}$/u;
const accepted = new Set(['agent-checked', 'reviewed']);
const cerLimits = JSON.parse(fs.readFileSync(new URL('./config/tts-production.json', import.meta.url), 'utf8')).quality.maximumCer;

/** Exact current content is authoritative; generated assets never establish content approval. */
export function expectedAudioTracks(root, failures = []) {
  const expected = new Map();
  for (const language of ['en', 'hi']) {
    for (const filename of ['narration.json', 'glossary.json']) {
      const relative = `src/content/${language}/${filename}`;
      let entries;
      try { entries = JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8')); }
      catch { failures.push(`${relative}: audio content cannot be read`); continue; }
      if (!Array.isArray(entries)) { failures.push(`${relative}: audio content must be an array`); continue; }
      if (!entries.length) failures.push(`${relative}: audio content cannot be empty`);
      for (const entry of entries) {
        if (entry?.status === 'planned') continue;
        const rawId = filename === 'glossary.json' ? entry?.termId : entry?.id;
        const id = filename === 'glossary.json' ? `glossary.${rawId}` : rawId;
        if (typeof rawId !== 'string' || !rawId.trim() || typeof entry?.spokenText !== 'string' || !entry.spokenText.trim()) {
          failures.push(`${relative}: audio entry lacks id or spokenText`); continue;
        }
        if (!accepted.has(entry.status)) failures.push(`${relative} id=${id}: draft or invalid source review status`);
        const key = `${language}:${id}`;
        if (expected.has(key)) failures.push(`${relative}: duplicate audio id ${id}`);
        expected.set(key, { id, language, spokenText: entry.spokenText.trim() });
      }
    }
  }
  if (!expected.size) failures.push('Audio content: no current tracks found');
  return expected;
}

export function checkAudio(root = process.cwd()) {
  const failures = [];
  const warnings = [];
  const expected = expectedAudioTracks(root, failures);
  const manifestPath = 'public/audio/manifest.json';
  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(path.join(root, manifestPath), 'utf8')); }
  catch (error) {
    failures.push(`${manifestPath}: missing or invalid audio manifest (${error.code ?? 'invalid JSON'}); ${expected.size} tracks required`);
    return { failures, warnings, expectedCount: expected.size };
  }
  if (!object(manifest)) return { failures: [...failures, `${manifestPath}: expected an object`], warnings, expectedCount: expected.size };
  if (manifest.schemaVersion !== 2) failures.push(`${manifestPath}: schemaVersion must be 2`);
  if (manifest.complete !== true) failures.push(`${manifestPath}: complete must be true`);
  if (!accepted.has(manifest.status)) failures.push(`${manifestPath}: draft or invalid review status`);
  if (!object(manifest.provenance) || Object.keys(manifest.provenance).length === 0) failures.push(`${manifestPath}: provenance is required`);
  for (const language of ['en', 'hi']) if (typeof manifest.voices?.[language] !== 'string' || !manifest.voices[language].trim()) failures.push(`${manifestPath}: missing ${language} voice`);
  if (!Array.isArray(manifest.tracks)) return { failures: [...failures, `${manifestPath}: tracks must be an array`], warnings, expectedCount: expected.size };
  const seen = new Set();
  for (const track of manifest.tracks) {
    if (!object(track)) { failures.push(`${manifestPath}: invalid track object`); continue; }
    const key = `${track.language}:${track.id}`;
    const label = `${manifestPath} id=${track.id} language=${track.language}`;
    if (seen.has(key)) failures.push(`${label}: duplicate track`);
    seen.add(key);
    const source = expected.get(key);
    if (!source) failures.push(`${label}: stale or unknown track`);
    if (source && track.spokenText !== source.spokenText) failures.push(`${label}: stale spokenText`);
    if (source && track.contentSha256 !== sha256(source.spokenText)) failures.push(`${label}: stale contentSha256`);
    for (const field of ['contentSha256', 'inputSha256', 'assetSha256']) if (typeof track[field] !== 'string' || !hashPattern.test(track[field])) failures.push(`${label}: invalid ${field}`);
    if (!accepted.has(track.status)) failures.push(`${label}: draft or invalid review status`);
    if (track.status === 'agent-checked') warnings.push(`AGENT-CHECKED AUDIO (automated; no human listening claimed): ${label}`);
    if (!object(track.quality) || track.quality.passed !== true || track.quality.eos !== true) failures.push(`${label}: quality.passed and quality.eos must both be true`);
    const asr = track.quality?.asr;
    if (asr !== undefined) {
      // A primary quantity mismatch may be overridden only by an independent
      // pinned second recogniser that confirms the protected quantity; its
      // identity is validated and the raw primary result is retained.
      const corroboration = object(asr) && object(asr.corroboration) ? asr.corroboration : null;
      const corroborationValid = corroboration === null || (
        typeof corroboration.modelId === 'string' && corroboration.modelId.trim().length > 0 &&
        typeof corroboration.revision === 'string' && /^[a-f0-9]{40}$/u.test(corroboration.revision) &&
        typeof corroboration.transcript === 'string' &&
        typeof corroboration.quantitiesMatch === 'boolean'
      );
      const quantityOk = object(asr) && (asr.quantitiesMatch !== false || corroboration?.quantitiesMatch === true);
      if (!object(asr) || !Number.isFinite(asr.cer) || asr.cer < 0 || asr.cer > (cerLimits[track.language] ?? 0) || !quantityOk || !corroborationValid || !['passed', 'pass'].includes(asr.status)) failures.push(`${label}: invalid or failed ASR quality result`);
    }
    if (!Number.isFinite(track.durationSeconds) || track.durationSeconds <= 0) failures.push(`${label}: durationSeconds must be positive`);
    if (!Number.isSafeInteger(track.bytes) || track.bytes <= 0) failures.push(`${label}: bytes must be a positive integer`);
    // Restrict raw spelling, not URL-normalized spelling: encoded traversal, query, fragment,
    // credentials, protocols, backslashes and protocol-relative paths are all rejected.
    if (typeof track.path !== 'string' || !new RegExp(`^/audio/${track.language === 'hi' ? 'hi' : 'en'}/[a-f0-9]{64}\\.opus$`, 'u').test(track.path) || !['en', 'hi'].includes(track.language)) {
      failures.push(`${label}: unsafe same-origin audio path`); continue;
    }
    const asset = path.join(root, 'public', track.path.slice(1));
    try {
      const publicRoot = fs.realpathSync(path.join(root, 'public'));
      const realAsset = fs.realpathSync(asset);
      if (!realAsset.startsWith(`${publicRoot}${path.sep}`)) { failures.push(`${label}: audio asset escapes public root`); continue; }
      if (!fs.statSync(asset).isFile()) { failures.push(`${label}: audio asset is not a file`); continue; }
      const bytes = fs.readFileSync(asset);
      if (bytes.length !== track.bytes) failures.push(`${label}: asset byte count mismatch`);
      if (sha256(bytes) !== track.assetSha256) failures.push(`${label}: asset SHA256 mismatch`);
    } catch { failures.push(`${label}: audio asset missing or unreadable`); }
  }
  for (const [key, track] of expected) if (!seen.has(key)) failures.push(`${manifestPath}: missing track id=${track.id} language=${track.language}`);
  const allowedFiles = new Set(manifest.tracks.map((track) => track?.path));
  for (const language of ['en', 'hi']) {
    const directory = path.join(root, 'public/audio', language);
    if (fs.existsSync(directory)) for (const file of fs.readdirSync(directory)) {
      if (file.endsWith('.opus') && !allowedFiles.has(`/audio/${language}/${file}`)) failures.push(`public/audio/${language}/${file}: unlisted audio asset must not ship`);
    }
  }
  return { failures, warnings, expectedCount: expected.size };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = checkAudio();
  result.warnings.forEach((warning) => console.warn(`WARNING: ${warning}`));
  result.failures.forEach((failure) => console.error(`ERROR: ${failure}`));
  if (result.failures.length) process.exitCode = 1;
  else console.log(`Audio check passed: ${result.expectedCount} current bilingual tracks.`);
}
