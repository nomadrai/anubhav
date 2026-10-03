import fs from 'node:fs';
import { Buffer } from 'node:buffer';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkAudio, expectedAudioTracks } from './check-audio.mjs';
import { createFixture, markFixtureReviewed, mutateJson, projectRoot, readJson, writeJson } from './check-audio.fixtures.mjs';

const roots = [];
const manifestFile = 'public/audio/manifest.json';
function fixture() { const root = createFixture(); roots.push(root); return root; }
afterEach(() => roots.splice(0).forEach((root) => fs.rmSync(root, { recursive: true, force: true })));
const rejects = (root, text) => expect(checkAudio(root).failures.some((f) => f.includes(text))).toBe(true);

describe('schema-2 audio integrity gate (not a listening test)', () => {
  it('requires exactly the current 20 narration + 9 glossary IDs in both languages', () => {
    const expected = [...expectedAudioTracks(projectRoot).values()];
    expect(expected).toHaveLength(58);
    for (const language of ['en', 'hi']) {
      expect(expected.filter((t) => t.language === language && t.id.startsWith('glossary.'))).toHaveLength(9);
      expect(expected.filter((t) => t.language === language && !t.id.startsWith('glossary.'))).toHaveLength(20);
    }
    const result = checkAudio(fixture());
    expect(result).toMatchObject({ failures: [], expectedCount: 58 });
    expect(result.warnings).toHaveLength(58);
  });

  it('permits a hypothetical reviewed manifest cleanly; production status is untouched', () => {
    const root = fixture(); markFixtureReviewed(root);
    expect(checkAudio(root)).toMatchObject({ failures: [], warnings: [], expectedCount: 58 });
  });

  it.each([
    ['schemaVersion', (m) => { m.schemaVersion = 1; }, 'schemaVersion must be 2'],
    ['incomplete', (m) => { m.complete = false; }, 'complete must be true'],
    ['missing complete', (m) => { delete m.complete; }, 'complete must be true'],
    ['draft manifest', (m) => { m.status = 'draft'; }, 'draft or invalid review status'],
    ['provenance', (m) => { m.provenance = {}; }, 'provenance is required'],
    ['Hindi voice', (m) => { delete m.voices.hi; }, 'missing hi voice'],
    ['tracks object', (m) => { m.tracks = {}; }, 'tracks must be an array'],
    ['missing track', (m) => { m.tracks.pop(); }, 'missing track'],
    ['duplicate track', (m) => { m.tracks.push(m.tracks[0]); }, 'duplicate track'],
    ['unknown track', (m) => { m.tracks[0].id = 'removed.id'; }, 'stale or unknown track'],
    ['null track', (m) => { m.tracks[0] = null; }, 'invalid track object'],
    ['stale text', (m) => { m.tracks[0].spokenText += ' changed'; }, 'stale spokenText'],
    ['stale content hash', (m) => { m.tracks[0].contentSha256 = '0'.repeat(64); }, 'stale contentSha256'],
    ['bad input hash', (m) => { m.tracks[0].inputSha256 = 'not-a-hash'; }, 'invalid inputSha256'],
    ['bad asset hash', (m) => { delete m.tracks[0].assetSha256; }, 'invalid assetSha256'],
    ['draft track', (m) => { m.tracks[0].status = 'draft'; }, 'draft or invalid review status'],
    ['failed quality', (m) => { m.tracks[0].quality.passed = false; }, 'quality.passed and quality.eos'],
    ['missing quality', (m) => { delete m.tracks[0].quality; }, 'quality.passed and quality.eos'],
    ['no EOS', (m) => { m.tracks[0].quality.eos = false; }, 'quality.passed and quality.eos'],
    ['string EOS', (m) => { m.tracks[0].quality.eos = 'true'; }, 'quality.passed and quality.eos'],
    ['failed ASR', (m) => { m.tracks[0].quality.asr = { cer: 0.1, status: 'failed' }; }, 'invalid or failed ASR'],
    ['bad CER', (m) => { m.tracks[0].quality.asr = { cer: -1, status: 'passed' }; }, 'invalid or failed ASR'],
    ['over-threshold CER with false pass flag', (m) => { m.tracks[0].quality.asr = { cer: 0.9, status: 'passed' }; }, 'invalid or failed ASR'],
    ['wrong quantity with low CER', (m) => { m.tracks[0].quality.asr = { cer: 0.1, quantitiesMatch: false, status: 'passed' }; }, 'invalid or failed ASR'],
    ['string CER', (m) => { m.tracks[0].quality.asr = { cer: '0', status: 'passed' }; }, 'invalid or failed ASR'],
    ['null ASR', (m) => { m.tracks[0].quality.asr = null; }, 'invalid or failed ASR'],
    ['zero duration', (m) => { m.tracks[0].durationSeconds = 0; }, 'durationSeconds must be positive'],
    ['null duration', (m) => { m.tracks[0].durationSeconds = null; }, 'durationSeconds must be positive'],
    ['zero bytes', (m) => { m.tracks[0].bytes = 0; }, 'bytes must be a positive integer'],
    ['fractional bytes', (m) => { m.tracks[0].bytes = 1.5; }, 'bytes must be a positive integer'],
  ])('fails closed for %s', (_name, mutate, message) => {
    const root = fixture(); mutateJson(root, manifestFile, mutate); rejects(root, message);
  });

  it.each([
    'https://example.invalid/audio/en/' + 'a'.repeat(64) + '.opus',
    '//example.invalid/audio/en/' + 'a'.repeat(64) + '.opus',
    '/audio/en/../' + 'a'.repeat(64) + '.opus',
    '/audio/en/%2e%2e/' + 'a'.repeat(64) + '.opus',
    '/audio/en/' + 'a'.repeat(64) + '.opus?download=1',
    '/audio/en/' + 'a'.repeat(64) + '.opus#clip',
    '/audio/en/\\' + 'a'.repeat(64) + '.opus',
    '/audio/hi/' + 'a'.repeat(64) + '.opus',
  ])('rejects unsafe or wrong-language path %s', (assetPath) => {
    const root = fixture(); mutateJson(root, manifestFile, (m) => { m.tracks[0].path = assetPath; }); rejects(root, 'unsafe same-origin audio path');
  });

  it('rejects missing manifests, malformed JSON and non-object manifests', () => {
    const root = fixture(); fs.rmSync(path.join(root, manifestFile)); rejects(root, 'missing or invalid audio manifest');
    fs.writeFileSync(path.join(root, manifestFile), '{'); rejects(root, 'missing or invalid audio manifest');
    writeJson(root, manifestFile, []); rejects(root, 'expected an object');
  });

  it('rejects missing, truncated, corrupted and symlink-escaped assets', () => {
    const root = fixture();
    const track = readJson(root, manifestFile).tracks[0];
    const asset = path.join(root, 'public', track.path);
    const original = fs.readFileSync(asset);
    fs.rmSync(asset); rejects(root, 'audio asset missing');
    fs.writeFileSync(asset, original.subarray(1)); rejects(root, 'asset byte count mismatch');
    const corrupted = Buffer.from(original); corrupted[0] ^= 1;
    fs.writeFileSync(asset, corrupted); rejects(root, 'asset SHA256 mismatch');
    fs.rmSync(asset);
    const outside = path.join(root, 'outside.opus'); fs.writeFileSync(outside, original);
    fs.symlinkSync(outside, asset); rejects(root, 'audio asset escapes public root');
  });

  it('blocks stale or rejected assets left outside the manifest', () => {
    const root = fixture();
    fs.writeFileSync(path.join(root, 'public/audio/en', `${'f'.repeat(64)}.opus`), 'rejected old output');
    rejects(root, 'unlisted audio asset must not ship');
  });

  it('accepts optional passed ASR evidence but never requires or invents listening', () => {
    const root = fixture(); mutateJson(root, manifestFile, (m) => { m.tracks[0].quality.asr = { cer: 0.1, status: 'passed' }; });
    expect(checkAudio(root).failures).toEqual([]);
  });

  it('fails closed for malformed, unapproved or empty source collections instead of throwing', () => {
    const root = fixture();
    mutateJson(root, 'src/content/en/glossary.json', (v) => { delete v[0].termId; v[1].spokenText = 8; v[2].status = 'draft'; });
    rejects(root, 'audio entry lacks id or spokenText'); rejects(root, 'draft or invalid source review status');
    writeJson(root, 'src/content/en/narration.json', []); rejects(root, 'audio content cannot be empty');
  });
});
