// Test-only contract fixtures. These bytes are NOT speech and never enter public/.
// The checker verifies manifest/content/asset integrity; signal quality is producer evidence.
import fs from 'node:fs';
import { Buffer } from 'node:buffer';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expectedAudioTracks, sha256 } from './check-audio.mjs';

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const readJson = (root, file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
export const writeJson = (root, file, value) => {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), JSON.stringify(value, null, 2) + '\n');
};
export function mutateJson(root, file, mutate) {
  const value = readJson(root, file);
  mutate(value);
  writeJson(root, file, value);
}
export function writeAudioFixture(root) {
  const tracks = [...expectedAudioTracks(root).values()].map((source) => {
    const bytes = Buffer.from(`TEST CONTRACT ONLY, NOT AUDIO: ${source.language}:${source.id}`);
    const inputSha256 = sha256(`test-only:${source.language}:${source.spokenText}`);
    const assetPath = `/audio/${source.language}/${inputSha256}.opus`;
    fs.mkdirSync(path.join(root, 'public/audio', source.language), { recursive: true });
    fs.writeFileSync(path.join(root, 'public', assetPath), bytes);
    return { ...source, path: assetPath, contentSha256: sha256(source.spokenText), inputSha256,
      assetSha256: sha256(bytes), durationSeconds: 1, bytes: bytes.length,
      status: 'agent-checked', quality: { passed: true, eos: true } };
  });
  writeJson(root, 'public/audio/manifest.json', { schemaVersion: 2, complete: true,
    status: 'agent-checked', voices: { en: 'test-en', hi: 'test-hi' },
    provenance: { fixture: 'Test contract only; not generated speech or listening evidence.' }, tracks });
}
export function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'content-contract-'));
  fs.cpSync(path.join(projectRoot, 'src/content'), path.join(root, 'src/content'), { recursive: true });
  writeAudioFixture(root);
  return root;
}
export function markFixtureReviewed(root) {
  // A hypothetical already-human-reviewed fixture tests clean policy. Never production approval.
  const replaceStatus = (value) => {
    if (!value || typeof value !== 'object') return;
    if (value.status === 'agent-checked') value.status = 'reviewed';
    Object.values(value).forEach(replaceStatus);
  };
  for (const language of ['en', 'hi']) {
    for (const file of fs.readdirSync(path.join(root, 'src/content', language))) {
      mutateJson(root, `src/content/${language}/${file}`, replaceStatus);
    }
  }
  for (const file of ['src/content/review-status.json', 'src/content/resources.json', 'public/audio/manifest.json']) mutateJson(root, file, replaceStatus);
  for (const file of ['historical-crash.json', 'historical-choppy.json']) {
    const relative = `src/data/episodes/${file}`;
    if (fs.existsSync(path.join(root, relative))) mutateJson(root, relative, replaceStatus);
  }
}
