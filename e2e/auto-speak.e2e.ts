import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import en from '../src/content/en/ui.json' with { type: 'json' };
import hi from '../src/content/hi/ui.json' with { type: 'json' };
import enFeatures from '../src/content/en/features.json' with { type: 'json' };
import hiFeatures from '../src/content/hi/features.json' with { type: 'json' };

type ObservedWindow = typeof window & {
  observedAudio: globalThis.HTMLAudioElement[];
  peakAudio: number;
};
const manifest = JSON.parse(
  readFileSync('public/audio/manifest.json', 'utf8'),
) as { tracks: { id: string; language: string; path: string }[] };
const pathFor = (id: string) =>
  manifest.tracks.find((track) => track.language === 'en' && track.id === id)!
    .path;
async function instrument(page: Page) {
  await page.addInitScript(() => {
    const w = window as ObservedWindow;
    w.observedAudio = [];
    w.peakAudio = 0;
    const NativeAudio = window.Audio;
    window.Audio = class extends NativeAudio {
      constructor(src?: string) {
        super(src);
        w.observedAudio.push(this);
        this.addEventListener('playing', () => {
          w.peakAudio = Math.max(
            w.peakAudio,
            w.observedAudio.filter((audio) => !audio.paused && !audio.ended)
              .length,
          );
        });
      }
    };
  });
}
async function playing(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as ObservedWindow).observedAudio.filter(
            (audio) => !audio.paused && !audio.ended,
          ).length,
      ),
    )
    .toBe(1);
}
async function endRealClip(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const audio = (window as ObservedWindow).observedAudio.find(
          (audio) => !audio.paused && !audio.ended,
        );
        return audio && Number.isFinite(audio.duration) ? audio.duration : 0;
      }),
    )
    .toBeGreaterThan(0);
  await page.evaluate(() => {
    const audio = (window as ObservedWindow).observedAudio.find(
      (audio) => !audio.paused && !audio.ended,
    )!;
    // Seek the real packaged clip; its native ended event advances the queue.
    audio.currentTime = Math.max(0, audio.duration - 0.02);
  });
}
for (const language of ['en', 'hi'] as const) {
  test(`${language} auto-speak defaults off, remembers opt-in, stops on leaving/off; Chat is inert`, async ({
    page,
    context,
  }) => {
    const ui = language === 'en' ? en : hi;
    const f = language === 'en' ? enFeatures : hiFeatures;
    const requests: { url: string; method: string; body: string | null }[] = [];
    context.on('request', (request) =>
      requests.push({
        url: request.url(),
        method: request.method(),
        body: request.postData(),
      }),
    );
    await instrument(page);
    await page.goto('/');
    await page
      .getByRole('button', {
        name:
          language === 'en'
            ? en.languageSelect.english
            : hi.languageSelect.hindi,
        exact: true,
      })
      .click();
    await expect(page.locator('.app-shell')).toHaveAttribute(
      'data-step',
      'Intro',
    );
    const toggle = page.getByRole('switch', { name: f.autoSpeak, exact: true });
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    const before = await page.locator('main').innerHTML();
    await page.getByRole('button', { name: f.chat, exact: true }).click();
    expect(await page.locator('main').innerHTML()).toBe(before);
    expect(
      requests.filter((request) => request.url.includes('/audio/')),
    ).toEqual([]);
    await expect(
      page
        .locator('.pane-reading')
        .getByRole('button', { name: f.listen, exact: true }),
    ).toBeVisible();
    await toggle.click();
    await playing(page);
    expect(
      await page.evaluate(() =>
        window.localStorage.getItem('learning.auto-speak'),
      ),
    ).toBe('true');
    const oldCount = await page.evaluate(
      () => (window as ObservedWindow).observedAudio.length,
    );
    await page
      .getByRole('button', { name: ui.intro.continue, exact: true })
      .click();
    await expect(page.locator('.app-shell')).toHaveAttribute(
      'data-step',
      'Setup',
    );
    await playing(page);
    await expect
      .poll(() =>
        page.evaluate(() => (window as ObservedWindow).observedAudio.length),
      )
      .toBeGreaterThan(oldCount);
    expect(
      await page.evaluate(
        (count) =>
          (window as ObservedWindow).observedAudio
            .slice(0, count)
            .every((audio) => audio.paused),
        oldCount,
      ),
    ).toBe(true);
    await page.getByRole('switch', { name: f.autoSpeak, exact: true }).click();
    await expect
      .poll(() =>
        page.evaluate(() =>
          (window as ObservedWindow).observedAudio.every(
            (audio) => audio.paused,
          ),
        ),
      )
      .toBe(true);
    await expect(
      page.getByRole('switch', { name: f.autoSpeak, exact: true }),
    ).toHaveAttribute('aria-checked', 'false');
    await page.reload();
    await expect(
      page.getByRole('switch', { name: f.autoSpeak, exact: true }),
    ).toHaveAttribute('aria-checked', 'false');
    await page.getByRole('switch', { name: f.autoSpeak, exact: true }).click();
    await page.reload();
    await expect(
      page.getByRole('switch', { name: f.autoSpeak, exact: true }),
    ).toHaveAttribute('aria-checked', 'true');
    expect(
      await page.evaluate(() => Object.keys(window.localStorage).sort()),
    ).toEqual(['learning.auto-speak', 'learning.language']);
    expect(
      await page.evaluate(() => (window as ObservedWindow).peakAudio),
    ).toBeLessThanOrEqual(1);
    for (const request of requests) {
      const url = new globalThis.URL(request.url);
      expect(url.origin).toBe('http://127.0.0.1:4173');
      expect(url.search).toBe('');
      expect(request.method).toBe('GET');
      expect(request.body).toBeNull();
      if (url.protocol === 'blob:') {
        // Local validated Opus bytes, not an HTTP upload or learner-data URL.
        const local = new globalThis.URL(url.pathname);
        expect(local.origin).toBe('http://127.0.0.1:4173');
        expect(local.pathname).toMatch(/^\/[a-f0-9-]{36}$/);
        continue;
      }
      expect(url.pathname).toMatch(
        /^\/(?:$|index\.html$|assets\/[^/]+$|icons\/[^/]+$|audio\/(?:manifest\.json|(?:en|hi)\/[a-f0-9]{64}\.opus)$|manifest\.webmanifest$|sw\.js$|cache-cleanup\.js$|workbox-[^/]+\.js$)/,
      );
    }
    await expect(page.locator('.app-footer')).toContainText(f.localNotice);
  });
}
test('browser-blocked automatic playback is quiet and leaves readable captions', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.HTMLMediaElement.prototype.play = () =>
      Promise.reject(
        new window.DOMException(
          'Blocked by test autoplay policy',
          'NotAllowedError',
        ),
      );
  });
  const audio: string[] = [];
  page.on('request', (request) => {
    if (/\/audio\/en\//.test(request.url())) audio.push(request.url());
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('.app-shell')).toHaveAttribute(
    'data-step',
    'Intro',
  );
  await page
    .getByRole('switch', { name: enFeatures.autoSpeak, exact: true })
    .click();
  await expect.poll(() => audio.length).toBe(1);
  await expect(
    page
      .locator('.pane-reading')
      .getByRole('button', { name: enFeatures.listen, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(enFeatures.audioUnavailable, { exact: true }),
  ).toHaveCount(0);
  await expect(page.locator('.caption')).toBeVisible();
  await page.waitForTimeout(400);
  expect(audio).toHaveLength(1);
});
test('Run queues actual stored event clips in order, without overlap, then cancels on exit', async ({
  page,
}) => {
  const files: string[] = [];
  page.on('request', (request) => {
    if (/\/audio\/en\//.test(request.url()))
      files.push(new globalThis.URL(request.url()).pathname);
  });
  await instrument(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await page
    .getByRole('button', { name: en.intro.continue, exact: true })
    .click();
  await page
    .getByRole('button', { name: en.setup.continue, exact: true })
    .click();
  await page
    .getByRole('button', { name: en.prediction.smallLoss, exact: true })
    .click();
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page
    .getByRole('switch', { name: enFeatures.autoSpeak, exact: true })
    .click();
  await page
    .getByRole('button', { name: en.prediction.continue, exact: true })
    .click();
  await expect(page.locator('.app-shell')).toHaveAttribute('data-step', 'Run');
  await playing(page);
  await expect.poll(() => files.includes(pathFor('run.main'))).toBe(true);
  // Each bar schedules its next timeout after a React commit; advance one at a time.
  for (let bar = 0; bar < 19; bar++) await page.clock.runFor(451);
  await expect(
    page.getByRole('button', { name: en.run.exit, exact: true }),
  ).toBeVisible();
  expect(files.includes(pathFor('ENTRY'))).toBe(false);
  expect(files.includes(pathFor('DRAWDOWN_5'))).toBe(false);
  await endRealClip(page);
  await expect.poll(() => files.includes(pathFor('ENTRY'))).toBe(true);
  await playing(page);
  await endRealClip(page);
  await expect.poll(() => files.includes(pathFor('DRAWDOWN_5'))).toBe(true);
  expect(await page.evaluate(() => (window as ObservedWindow).peakAudio)).toBe(
    1,
  );
  const runPlayers = await page.evaluate(
    () => (window as ObservedWindow).observedAudio.length,
  );
  await page.getByRole('button', { name: en.run.exit, exact: true }).click();
  await expect(page.locator('.app-shell')).toHaveAttribute(
    'data-step',
    'Result',
  );
  await playing(page);
  expect(
    await page.evaluate(
      (count) =>
        (window as ObservedWindow).observedAudio
          .slice(0, count)
          .every((audio) => audio.paused),
      runPlayers,
    ),
  ).toBe(true);
  expect(files.filter((file) => file === pathFor('ENTRY'))).toHaveLength(1);
  await page
    .getByRole('switch', { name: enFeatures.autoSpeak, exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as ObservedWindow).observedAudio.every((audio) => audio.paused),
      ),
    )
    .toBe(true);
});
