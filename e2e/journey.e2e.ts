import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { existsSync, readFileSync } from 'node:fs';
import en from '../src/content/en/ui.json' with { type: 'json' };
import hi from '../src/content/hi/ui.json' with { type: 'json' };
import enFeatures from '../src/content/en/features.json' with { type: 'json' };
import hiFeatures from '../src/content/hi/features.json' with { type: 'json' };
import resources from '../src/content/resources.json' with { type: 'json' };
import crash from '../src/data/episodes/historical-crash.json' with { type: 'json' };
import choppy from '../src/data/episodes/historical-choppy.json' with { type: 'json' };

const texts = { en, hi };
const features = { en: enFeatures, hi: hiFeatures };
const languages = ['en', 'hi'] as const;
const origin = 'http://127.0.0.1:4173';
async function click(page: Page, name: string) {
  await page.getByRole('button', { name, exact: true }).click();
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
}
async function accessible(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations,
    JSON.stringify(results.violations, null, 2),
  ).toEqual([]);
  await noOverflow(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
}
async function choose(
  page: Page,
  language: 'en' | 'hi',
  leverage: 2 | 10,
  episode = 1,
) {
  const t = texts[language];
  const f = features[language];
  await click(
    page,
    language === 'en' ? en.languageSelect.english : hi.languageSelect.hindi,
  );
  await click(page, t.intro.continue);
  await click(page, f.episode.replace('{number}', String(episode)));
  await click(page, t.setup[leverage === 2 ? 'leverage2' : 'leverage10']);
  await click(page, t.setup.continue);
  await expect(
    page.getByRole('button', { name: t.prediction.continue, exact: true }),
  ).toBeDisabled();
  await click(page, t.prediction.smallLoss);
  await click(page, t.prediction.continue);
}
async function finish(page: Page, language: 'en' | 'hi') {
  const t = texts[language];
  for (let i = 0; i < 90; i += 1) {
    if (
      await page
        .getByRole('heading', { name: t.result.title, exact: true })
        .count()
    )
      return;
    const resume = page.getByRole('button', {
      name: t.run.resume,
      exact: true,
    });
    if (await resume.count()) await resume.click();
    else await page.clock.runFor(451);
  }
  throw new Error('Playback did not finish');
}
async function hiddenSource(page: Page) {
  const html = await page.locator('main').innerHTML();
  expect(html).not.toMatch(
    /2008-07-15|2019-01-02|European Central Bank|यूरोपीय केंद्रीय बैंक/,
  );
  expect(html).not.toContain(crash.provenance.sourceUrl);
}

for (const language of languages) {
  for (const episodeNumber of [1, 2]) {
    test(`${language} 360x640 complete episode ${episodeNumber}, memory-only reflections and neutral reveal`, async ({
      page,
      context,
    }, testInfo) => {
      const t = texts[language];
      const f = features[language];
      const requests: string[] = [];
      const errors: string[] = [];
      context.on('request', (request) => requests.push(request.url()));
      page.on('pageerror', (error) => errors.push(error.message));
      await page.clock.install();
      await page.goto('/');
      await accessible(page);
      await choose(page, language, episodeNumber === 1 ? 10 : 2, episodeNumber);
      await hiddenSource(page);
      await accessible(page);
      await click(page, f.pausePath);
      const paused = await page.locator('.run-status').textContent();
      await page.clock.runFor(60_000);
      await expect(page.locator('.run-status')).toHaveText(paused!);
      await page.screenshot({
        path: testInfo.outputPath('run-paused.png'),
        fullPage: true,
      });
      await click(page, f.resumePath);
      await finish(page, language);
      await hiddenSource(page);
      await accessible(page);
      if (episodeNumber === 1) {
        await expect(
          page.getByText(t.result.forcedExitLine, { exact: true }),
        ).toBeVisible();
        await expect(page.locator('.result-grid')).toContainText('625');
      } else
        await expect(
          page.getByText(t.result.survivedLine, { exact: true }),
        ).toBeVisible();
      await click(page, t.result.continue);
      await hiddenSource(page);
      await accessible(page);
      await expect(page.locator('polyline')).toHaveCount(2);
      await page.getByText(t.common.chartData, { exact: true }).click();
      await noOverflow(page);
      const source = episodeNumber === 1 ? crash : choppy;
      await expect(page.locator('tbody tr')).toHaveCount(source.bars.length);
      await click(page, t.replay.continue);
      await accessible(page);
      await expect(
        page.getByText(source.sourceLabel[language], { exact: true }),
      ).toBeVisible();
      await expect(page.locator('main')).toContainText(source.bars[0].date);
      expect(await page.locator('main').innerHTML()).not.toContain(
        source.provenance.sourceUrl,
      );
      await page.screenshot({
        path: testInfo.outputPath('reveal.png'),
        fullPage: true,
      });
      await click(page, t.reveal.continue);
      await accessible(page);
      const term = page.locator('.glossary summary').first();
      await term.focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('.glossary details').first()).toHaveAttribute(
        'open',
        '',
      );
      await expect(
        page
          .locator('.glossary details')
          .first()
          .getByRole('button', { name: f.listen, exact: true }),
      ).toBeVisible();
      await page.keyboard.press('Space');
      await expect(
        page.locator('.glossary details').first(),
      ).not.toHaveAttribute('open', '');
      await click(page, t.debrief.continue);
      await accessible(page);
      await expect(
        page.getByRole('button', { name: t.postCheck.continue, exact: true }),
      ).toBeDisabled();
      await click(page, t.prediction.almostEverything);
      await expect(
        page.getByRole('button', { name: t.postCheck.continue, exact: true }),
      ).toBeDisabled();
      await click(page, t.postCheck.notSure);
      await click(page, t.postCheck.continue);
      await accessible(page);
      for (const resource of resources.filter((item) => item.verified)) {
        await expect(
          page.getByRole('link', {
            name: resource.label[language],
            exact: true,
          }),
        ).toHaveAttribute('href', resource.url);
      }
      await click(page, f.pilotOpen);
      await accessible(page);
      await expect(page.locator('.pilot-summary')).toContainText(
        t.prediction.smallLoss,
      );
      await expect(page.locator('.pilot-summary')).toContainText(
        t.prediction.almostEverything,
      );
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await click(page, f.pilotCopy);
      await expect(
        page.getByText(f.pilotCopied, { exact: true }),
      ).toBeVisible();
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(copied).toContain(t.prediction.smallLoss);
      expect(copied).toContain(t.prediction.almostEverything);
      await page.screenshot({
        path: testInfo.outputPath('session-summary.png'),
        fullPage: true,
      });
      expect(
        await page.evaluate(() => Object.keys(window.localStorage)),
      ).toEqual(['learning.language']);
      expect(await page.evaluate(() => window.sessionStorage.length)).toBe(0);
      expect(await context.cookies()).toEqual([]);
      expect(
        requests.filter(
          (url) =>
            !url.startsWith('blob:') &&
            new globalThis.URL(url).origin !== origin,
        ),
      ).toEqual([]);
      expect(requests.filter((url) => url.includes('/audio/'))).toEqual([]);
      expect(errors).toEqual([]);
      await click(page, f.restart);
      await choose(page, language, 2);
      // Restart forced a new answer; reload must drop it again, not resume the journey.
      await page.reload();
      await expect(
        page.getByRole('heading', {
          name: t.languageSelect.title,
          exact: true,
        }),
      ).toBeVisible();
      await click(
        page,
        language === 'en' ? en.languageSelect.english : hi.languageSelect.hindi,
      );
      await click(page, t.intro.continue);
      await click(page, t.setup.continue);
      await expect(
        page.getByRole('button', { name: t.prediction.continue, exact: true }),
      ).toBeDisabled();
    });
  }
}

test('warmed production shell reloads offline; audio failure stays readable and gesture-only', async ({
  page,
  context,
}) => {
  const requests: string[] = [];
  context.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          () => resolve(),
          { once: true },
        ),
      );
  });
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'English', exact: true }),
  ).toBeVisible();
  await click(page, 'English');
  // Chrome 149 resets navigator.onLine on a SW-served reload, even though requests remain offline.
  // Assert the actual network failure independently, then emulate the browser-reported status explicitly.
  expect(
    await page.evaluate(() =>
      window
        .fetch('/offline-probe-not-cached.json')
        .then(() => false)
        .catch(() => true),
    ),
  ).toBe(true);
  const session = await context.newCDPSession(page);
  await session.send('Network.overrideNetworkState', {
    offline: true,
    latency: 0,
    downloadThroughput: 0,
    uploadThroughput: 0,
  });
  await expect(
    page.getByText(enFeatures.disconnected, { exact: true }),
  ).toBeVisible();
  expect(requests.filter((url) => url.includes('/audio/'))).toEqual([]);
  await click(page, enFeatures.listen);
  await expect(
    page.getByText(enFeatures.audioUnavailable, { exact: true }),
  ).toBeVisible();
  await expect(page.locator('.caption')).toBeVisible();
  await click(page, en.intro.continue);
  await expect(
    page.getByRole('heading', { name: enFeatures.setupTitle }),
  ).toBeVisible();
  expect(await page.evaluate(() => Object.keys(window.localStorage))).toEqual([
    'learning.language',
  ]);
});

test('keyboard, large text, 200% equivalent reflow, reduced motion and CSP', async ({
  page,
}) => {
  const response = await page.goto('/');
  expect(response?.headers()['content-security-policy']).toContain(
    "connect-src 'self'",
  );
  expect(response?.headers()['content-security-policy']).toContain(
    "frame-ancestors 'none'",
  );
  await page.getByRole('button', { name: 'English', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.locator('.skip-link').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.getByText(enFeatures.preferences, { exact: true }).click();
  await page
    .getByRole('combobox', { name: enFeatures.textSize, exact: true })
    .selectOption('large');
  await expect(page.locator('html')).toHaveCSS('font-size', '20px');
  await page
    .getByRole('combobox', { name: enFeatures.language, exact: true })
    .selectOption('hi');
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
  await accessible(page);
  // Chromium CSS zoom exercises 200% reflow; not a claim of a manual OS/browser zoom audit.
  await page.setViewportSize({ width: 720, height: 1280 });
  await page.evaluate(() => {
    document.documentElement.style.zoom = '2';
  });
  await accessible(page);
  expect(
    await page.evaluate(
      () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    ),
  ).toBe(true);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-text-size', 'large');
  expect(
    await page.evaluate(() => Object.keys(window.localStorage).sort()),
  ).toEqual(['learning.language', 'learning.text-size']);
});

for (const language of languages) {
  test(`${language} actual packaged narration plays after gesture, pauses, and warmed clip plays offline`, async ({
    page,
    context,
  }) => {
    const f = features[language];
    const languageLabel =
      language === 'en' ? en.languageSelect.english : hi.languageSelect.hindi;
    const manifestPath = 'dist/audio/manifest.json';
    const complete =
      existsSync(manifestPath) &&
      JSON.parse(readFileSync(manifestPath, 'utf8')).complete === true;
    test.skip(
      !complete,
      'Build does not yet contain the parent’s complete real schema2 audio manifest. No replacement audio is used.',
    );
    await page.goto('/');
    await click(page, languageLabel);
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller)
        await new Promise<void>((resolve) =>
          navigator.serviceWorker.addEventListener(
            'controllerchange',
            () => resolve(),
            { once: true },
          ),
        );
    });
    await click(page, f.listen);
    await expect(page.getByText(f.audioPlaying, { exact: true })).toBeVisible();
    await click(page, f.pauseAudio);
    await expect(page.getByText(f.audioPaused, { exact: true })).toBeVisible();
    await click(page, f.resumeAudio);
    await expect(page.getByText(f.audioPlaying, { exact: true })).toBeVisible();
    await context.setOffline(true);
    await page.reload();
    await click(page, languageLabel);
    await click(page, f.listen);
    await expect(page.getByText(f.audioPlaying, { exact: true })).toBeVisible();
    await click(page, f.pauseAudio);
  });
}
