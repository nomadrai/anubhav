import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { checkContent } from './check-content.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporaryRoots = [];

function copiedContent(mutator) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'content-check-'));
  temporaryRoots.push(root);
  fs.cpSync(path.join(projectRoot, 'src/content'), path.join(root, 'src/content'), { recursive: true });
  mutator(path.join(root, 'src/content'));
  return checkContent(root);
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

describe('content checker', () => {
  it('accepts the current bilingual contract and keeps the intended allowlist active', () => {
    const result = checkContent(projectRoot);
    expect(result.failures).toEqual([]);
    expect(result.languages).toEqual(['en', 'hi']);
  });

  it('honors the allowlist only while its documented entry remains present', () => {
    const result = copiedContent((contentRoot) => {
      const file = path.join(contentRoot, 'lint-allowlist.json');
      const allowlist = JSON.parse(fs.readFileSync(file, 'utf8')).filter((item) => item.pattern !== 'hold');
      fs.writeFileSync(file, JSON.stringify(allowlist));
    });
    expect(result.failures.some((failure) => failure.includes('banned pattern hold'))).toBe(true);
  });

  it('fails closed when a Hindi spoken field is missing', () => {
    const result = copiedContent((contentRoot) => {
      const file = path.join(contentRoot, 'hi/narration.json');
      const narration = JSON.parse(fs.readFileSync(file, 'utf8'));
      delete narration[0].spokenText;
      fs.writeFileSync(file, JSON.stringify(narration));
    });
    expect(result.failures.some((failure) => failure.includes('missing or empty spokenText'))).toBe(true);
    expect(result.failures.some((failure) => failure.includes('i18n parity mismatch: narration.json'))).toBe(true);
  });

  it('fails closed for overlong sentences and interpolation mismatch', () => {
    const result = copiedContent((contentRoot) => {
      const enFile = path.join(contentRoot, 'en/ui.json');
      const hiFile = path.join(contentRoot, 'hi/ui.json');
      const en = JSON.parse(fs.readFileSync(enFile, 'utf8'));
      const hi = JSON.parse(fs.readFileSync(hiFile, 'utf8'));
      en.intro.body = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twenty-one twenty-two twenty-three twenty-four twenty-five twenty-six.';
      hi.run.stepStatus = '{other} में से {total} कदम';
      fs.writeFileSync(enFile, JSON.stringify(en));
      fs.writeFileSync(hiFile, JSON.stringify(hi));
    });
    expect(result.failures.some((failure) => failure.includes('sentence exceeds 25 words'))).toBe(true);
    expect(result.failures.some((failure) => failure.includes('placeholder mismatch in ui.json'))).toBe(true);
  });

  it('rejects Latin or numeric notation in Hindi spoken text and advice copy', () => {
    const result = copiedContent((contentRoot) => {
      const hiFile = path.join(contentRoot, 'hi/glossary.json');
      const enFile = path.join(contentRoot, 'en/ui.json');
      const hi = JSON.parse(fs.readFileSync(hiFile, 'utf8'));
      const en = JSON.parse(fs.readFileSync(enFile, 'utf8'));
      hi[0].spokenText = 'यह English 10% है।';
      en.prediction.body = 'You should buy now.';
      fs.writeFileSync(hiFile, JSON.stringify(hi));
      fs.writeFileSync(enFile, JSON.stringify(en));
    });
    expect(result.failures.some((failure) => failure.includes('Hindi spokenText contains Latin letters'))).toBe(true);
    expect(result.failures.some((failure) => failure.includes('spokenText contains numeric or symbol notation'))).toBe(true);
    expect(result.failures.some((failure) => failure.includes('banned pattern buy'))).toBe(true);
    expect(result.failures.some((failure) => failure.includes('banned pattern recommendation'))).toBe(true);
  });

  it('reports malformed JSON instead of continuing with partial content', () => {
    const result = copiedContent((contentRoot) => {
      fs.writeFileSync(path.join(contentRoot, 'hi/debrief.json'), '{');
    });
    expect(result.failures.some((failure) => failure.includes('hi/debrief.json: invalid JSON'))).toBe(true);
    expect(result.failures.some((failure) => failure.includes('missing JSON file'))).toBe(false);
  });
});
