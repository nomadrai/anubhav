import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkRelease, productionEpisodeFiles } from './check-release.mjs';
import { createFixture, markFixtureReviewed, mutateJson, projectRoot } from './check-audio.fixtures.mjs';

const roots = [];
function fixture() {
  const root = createFixture(); roots.push(root);
  fs.cpSync(path.join(projectRoot, 'src/data/episodes'), path.join(root, 'src/data/episodes'), { recursive: true });
  fs.mkdirSync(path.join(root, 'src/config'), { recursive: true });
  fs.copyFileSync(path.join(projectRoot, 'src/config/episodes.ts'), path.join(root, 'src/config/episodes.ts'));
  return root;
}
afterEach(() => roots.splice(0).forEach((root) => fs.rmSync(root, { recursive: true, force: true })));

describe('release policy', () => {
  it('warns for each agent-checked content leaf/audio track without rejecting test-only synthetic JSON', () => {
    const root = fixture();
    const result = checkRelease(root);
    expect(result.failures).toEqual([]);
    expect(result.warnings.length).toBeGreaterThan(58);
    expect(result.warnings.filter((line) => line.includes('historical-') && line.includes('AGENT-CHECKED STRING'))).toHaveLength(12);
    expect(result.warnings.every((line) => line.includes('id=') && line.includes('language='))).toBe(true);
    const failures = [];
    expect(productionEpisodeFiles(root, failures).map((f) => path.basename(f))).toEqual(['historical-crash.json', 'historical-choppy.json']);
    expect(failures).toEqual([]);
  });

  it('passes a hypothetical reviewed fixture without agent-check warnings', () => {
    const root = fixture(); markFixtureReviewed(root);
    expect(checkRelease(root)).toEqual({ failures: [], warnings: [] });
  });

  it('invalidates episode-copy review when a revealed string changes', () => {
    const root = fixture();
    mutateJson(root, 'src/data/episodes/historical-crash.json', (v) => { v.reveal.whatHappenedText.hi += ' बदला'; });
    expect(checkRelease(root).failures.some((f) => f.includes('stale episode copy review hash'))).toBe(true);
  });

  it('blocks draft content even when audio and data are complete', () => {
    const root = fixture();
    mutateJson(root, 'src/content/review-status.json', (r) => { r.languages.hi['ui.json']['intro.body'].status = 'draft'; });
    expect(checkRelease(root).failures.some((f) => f.includes('draft content is not shippable'))).toBe(true);
  });

  it.each(['draft', 'planned'])('blocks %s narration', (status) => {
    const root = fixture(); mutateJson(root, 'src/content/hi/narration.json', (v) => { v[0].status = status; });
    expect(checkRelease(root).failures.some((f) => f.includes(`${status} content is not shippable`))).toBe(true);
  });

  it('blocks missing audio rather than turning it into a preview warning', () => {
    const root = fixture(); fs.rmSync(path.join(root, 'public/audio/manifest.json'));
    expect(checkRelease(root).failures).toEqual([expect.stringContaining('missing or invalid audio manifest')]);
  });

  it('blocks shipped placeholders but deliberately ignores synthetic test fixtures', () => {
    const root = fixture();
    mutateJson(root, 'src/data/episodes/historical-crash.json', (v) => { v.isPlaceholder = true; });
    expect(checkRelease(root).failures.some((f) => f.includes('historical-crash.json') && f.includes('placeholder episode'))).toBe(true);
  });

  it.each([
    ['unverified resource', (r) => { r.verified = false; }, 'unverified resource'],
    ['unsafe URL', (r) => { r.url = 'http://example.invalid'; }, 'invalid HTTPS resource URL'],
    ['URL credentials', (r) => { r.url = 'https://name:secret@example.invalid'; }, 'invalid HTTPS resource URL'],
    ['missing evidence', (r) => { delete r.evidence; }, 'missing verification evidence'],
    ['invalid date', (r) => { r.checkedOn = '2026-02-30'; }, 'invalid verification date'],
    ['missing date', (r) => { delete r.checkedOn; }, 'invalid verification date'],
  ])('blocks %s', (_label, mutate, error) => {
    const root = fixture(); mutateJson(root, 'src/content/resources.json', (v) => mutate(v[0]));
    expect(checkRelease(root).failures.some((f) => f.includes(error))).toBe(true);
  });

  it('blocks unresolved shipped TODOs, but does not scan unrelated fixture JSON or test sources', () => {
    const root = fixture();
    fs.writeFileSync(path.join(root, 'src/legacy.test.ts'), '// TODO(human): fixture only');
    fs.writeFileSync(path.join(root, 'src/data/episodes/test-only.json'), '{"isPlaceholder":true,"note":"TODO(human): fixture"}');
    expect(checkRelease(root).failures).toEqual([]);
    fs.writeFileSync(path.join(root, 'src/runtime.ts'), '// TODO(human): release blocker');
    expect(checkRelease(root).failures.some((f) => f.includes('runtime.ts: unresolved TODO(human)'))).toBe(true);
  });

  it('fails closed for dynamic registry shapes and a default not in shipped episodes', () => {
    const root = fixture();
    fs.writeFileSync(path.join(root, 'src/config/episodes.ts'), "export const DEFAULT_EPISODE_ID = 'missing';");
    expect(checkRelease(root).failures.some((f) => f.includes('default episode is not in'))).toBe(true);
    fs.writeFileSync(path.join(root, 'src/data/episodes/index.ts'), 'export const episodes = discoverEpisodes();');
    expect(checkRelease(root).failures.some((f) => f.includes('explicit production array'))).toBe(true);
  });
});
