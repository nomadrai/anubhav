import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkContent } from './check-content.mjs';
import { sha256 } from './check-audio.mjs';
import { createFixture, markFixtureReviewed, mutateJson, projectRoot, readJson } from './check-audio.fixtures.mjs';

const roots = [];
function fixture(mutator = () => {}) {
  const root = createFixture(); roots.push(root); mutator(root); return root;
}
afterEach(() => roots.splice(0).forEach((root) => fs.rmSync(root, { recursive: true, force: true })));

// No generated speech is required to run policy regression tests. Only temp roots get fixtures.
describe('content checker', () => {
  it('pins the QA table to every current localized file and includes every Hindi leaf path and value', () => {
    const qa = fs.readFileSync(path.join(projectRoot, 'docs/CONTENT_QA.md'), 'utf8');
    for (const filename of ['ui.json', 'debrief.json', 'features.json', 'narration.json', 'glossary.json']) {
      for (const language of ['en', 'hi']) {
        const file = `src/content/${language}/${filename}`;
        const hashRow = `| \`${file}\` | \`${sha256(fs.readFileSync(path.join(projectRoot, file)))}\` |`;
        expect(qa.includes(hashRow), `QA file hash is stale: ${file}`).toBe(true);
      }
      const section = qa.split(`## \`src/content/hi/${filename}\``)[1]?.split('\n## ')[0];
      expect(section).toBeDefined();
      const inspect = (value, location = '$') => {
        if (typeof value === 'string') {
          expect(section.includes(`| ${location}`), `Missing QA path: ${filename} ${location}`).toBe(true);
          expect(section.includes(`| ${value} |`), `Missing QA text: ${filename} ${location}`).toBe(true);
        } else if (Array.isArray(value)) value.forEach((v, index) => inspect(v, `${location}[${index}]`));
        else Object.entries(value).forEach(([key, v]) => inspect(v, `${location}.${key}`));
      };
      inspect(readJson(projectRoot, `src/content/hi/${filename}`));
    }
    for (const resource of readJson(projectRoot, 'src/content/resources.json')) expect(qa).toContain(`| ${resource.id} | ${resource.label.hi} |`);
  });

  it('accepts current bilingual content with complete test-only audio and warns for EVERY reviewed-by-agent leaf', () => {
    const root = fixture();
    const result = checkContent(root);
    expect(result.failures).toEqual([]);
    expect(result.languages).toEqual(['en', 'hi']);
    const registry = readJson(root, 'src/content/review-status.json');
    const leafCount = Object.values(registry.languages).flatMap(Object.values).reduce((n, leaves) => n + Object.keys(leaves).length, 0);
    const warnings = result.warnings.filter((line) => line.startsWith('AGENT-CHECKED STRING'));
    expect(warnings).toHaveLength(leafCount);
    expect(new Set(warnings).size).toBe(leafCount);
    expect(warnings.every((line) => /id=.+ language=(?:en|hi)$/u.test(line))).toBe(true);
    expect(result.warnings.filter((line) => line.startsWith('AGENT-CHECKED AUDIO'))).toHaveLength(58);
  });

  it('passes a hypothetical reviewed fixture cleanly without assigning production human approval', () => {
    const root = fixture(markFixtureReviewed);
    expect(checkContent(root)).toMatchObject({ failures: [], warnings: [] });
  });

  it.each(['en', 'hi'])('blocks draft dictionary, narration, glossary and feature copy in %s', (language) => {
    const root = fixture((root) => {
      mutateJson(root, 'src/content/review-status.json', (r) => { r.languages[language]['ui.json']['intro.body'].status = 'draft'; });
      mutateJson(root, `src/content/${language}/narration.json`, (v) => { v[0].status = 'draft'; });
      mutateJson(root, `src/content/${language}/glossary.json`, (v) => { v[0].status = 'draft'; });
      mutateJson(root, `src/content/${language}/features.json`, (v) => { v._meta.status = 'draft'; });
    });
    const failures = checkContent(root).failures;
    for (const filename of ['ui.json', 'narration.json', 'glossary.json', 'features.json']) {
      expect(failures.some((f) => f.includes(`${language}/${filename}`))).toBe(true);
    }
    expect(failures.some((f) => f.includes('draft content is not shippable'))).toBe(true);
  });

  it.each(['ui.json', 'features.json', 'narration.json', 'glossary.json'])('invalidates exact-hash evidence when a %s leaf changes', (filename) => {
    const root = fixture((root) => mutateJson(root, `src/content/hi/${filename}`, (value) => {
      if (filename === 'ui.json') value.intro.body += ' बदल गया।';
      else if (filename === 'features.json') value.preferences += ' बदल गया।';
      else value[0].displayText += ' बदल गया।';
    }));
    expect(checkContent(root).failures.some((f) => f.includes(filename) && f.includes('stale review contentSha256'))).toBe(true);
  });

  it('rejects missing registries, missing leaves, stale leaves and invalid statuses', () => {
    const root = fixture((root) => mutateJson(root, 'src/content/review-status.json', (r) => {
      delete r.languages.en['ui.json']['intro.body'];
      r.languages.hi['ui.json'].obsolete = { status: 'agent-checked', contentSha256: '0'.repeat(64) };
      r.languages.en['ui.json']['intro.title'].status = 'approved';
    }));
    const failures = checkContent(root).failures;
    expect(failures.some((f) => f.includes('missing or invalid review status'))).toBe(true);
    expect(failures.some((f) => f.includes('stale registry leaf'))).toBe(true);
    fs.rmSync(path.join(root, 'src/content/review-status.json'));
    expect(checkContent(root).failures.some((f) => f.includes('invalid review registry'))).toBe(true);
  });

  it('keeps missing audio a hard content failure', () => {
    const root = fixture((root) => fs.rmSync(path.join(root, 'public/audio/manifest.json')));
    expect(checkContent(root).failures).toEqual([expect.stringContaining('missing or invalid audio manifest')]);
  });

  it('honors only documented English Latin-script exemptions; no hold exemption remains', () => {
    const root = fixture((root) => mutateJson(root, 'src/content/lint-allowlist.json', (list) => { list.length = 0; }));
    expect(checkContent(root).failures.some((f) => f.includes('unapproved Latin letters'))).toBe(true);
    mutateJson(root, 'src/content/en/ui.json', (v) => { v.prediction.body = 'Hold this position.'; });
    expect(checkContent(root).failures.some((f) => f.includes('banned pattern hold'))).toBe(true);
  });

  it('fails closed when a Hindi spoken field is missing', () => {
    const root = fixture((root) => mutateJson(root, 'src/content/hi/narration.json', (v) => { delete v[0].spokenText; }));
    const failures = checkContent(root).failures;
    expect(failures.some((f) => f.includes('missing or empty spokenText'))).toBe(true);
    expect(failures.some((f) => f.includes('i18n parity mismatch: narration.json'))).toBe(true);
  });

  it('rejects overlong sentences and missing, duplicated or malformed placeholders', () => {
    const root = fixture((root) => {
      mutateJson(root, 'src/content/en/ui.json', (v) => { v.intro.body = 'one '.repeat(26) + '.'; });
      mutateJson(root, 'src/content/hi/ui.json', (v) => { v.run.stepStatus = '{other} {total} {total} {bad-key}'; });
    });
    const failures = checkContent(root).failures;
    for (const expected of ['sentence exceeds 25 words', 'placeholder mismatch in ui.json', 'malformed placeholder braces']) expect(failures.some((f) => f.includes(expected))).toBe(true);
  });

  it('rejects Latin/numeric Hindi speech and advice without blanket metadata exemptions', () => {
    const root = fixture((root) => {
      mutateJson(root, 'src/content/hi/glossary.json', (v) => { v[0].spokenText = 'यह English 10% है।'; });
      mutateJson(root, 'src/content/en/ui.json', (v) => { v.prediction.body = 'You should buy now.'; });
      mutateJson(root, 'src/content/resources.json', (v) => { v[0].label.en = 'Guaranteed profit'; });
    });
    const failures = checkContent(root).failures;
    for (const expected of ['Hindi spokenText contains Latin letters', 'spokenText contains numeric or symbol notation', 'banned pattern buy', 'banned pattern recommendation', 'banned pattern guaranteed']) expect(failures.some((f) => f.includes(expected))).toBe(true);
  });

  it('reports malformed JSON and missing languages without crashing', () => {
    const root = fixture((root) => fs.writeFileSync(path.join(root, 'src/content/hi/debrief.json'), '{'));
    expect(checkContent(root).failures.some((f) => f.includes('hi/debrief.json: invalid JSON'))).toBe(true);
    fs.rmSync(path.join(root, 'src/content/hi'), { recursive: true });
    expect(checkContent(root).failures.some((f) => f.includes('required language directory is missing'))).toBe(true);
  });
});
