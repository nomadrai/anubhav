import { test, expect, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import en from '../src/content/en/ui.json' with { type: 'json' };
import hi from '../src/content/hi/ui.json' with { type: 'json' };
import enFeatures from '../src/content/en/features.json' with { type: 'json' };
import hiFeatures from '../src/content/hi/features.json' with { type: 'json' };
import { JOURNEY_STEPS } from '../src/journey/steps';
import { formatRupees } from '../src/i18n/format';

// Every case owns an isolated context and a unique artifact path.
test.describe.configure({ mode: 'parallel' });

const viewports = [
  [1280, 650],
  [1366, 657],
  [1440, 800],
  [1536, 730],
  [1920, 890],
  [2560, 1300],
  [1024, 768],
  [768, 1024],
  [390, 844],
  [360, 640],
] as const;
const noInnerScroll = new Set([
  'LanguageSelect',
  'Intro',
  'Setup',
  'Prediction',
  'Run',
  'Result',
  'Replay',
  'PostCheck',
]);
const output = 'artifacts/ui/fixed-size';
async function click(page: Page, name: string) {
  await page.getByRole('button', { name, exact: true }).click();
}

for (const [width, height] of viewports)
  for (const language of ['en', 'hi'] as const) {
    const size = 'large';
    test(`${width}x${height} ${language} ${size}: all eleven steps, pinned actions, readable panes`, async ({
      page,
    }) => {
      test.setTimeout(180_000);
      await page.setViewportSize({ width, height });
      const ui = language === 'en' ? en : hi;
      const f = language === 'en' ? enFeatures : hiFeatures;
      const directory = `${output}/screenshots/${width}x${height}/${language}-${size}`;
      await mkdir(directory, { recursive: true });
      const measurements: unknown[] = [];
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.addInitScript(
        ({ language }) => {
          window.localStorage.setItem('learning.language', language);
          window.localStorage.setItem('learning.text-size', 'standard');
        },
        { language },
      );
      await page.clock.install();
      await page.goto('/');
      await expect(page.locator('html')).toHaveCSS('font-size', '20px');
      expect(
        await page.evaluate(() =>
          window.localStorage.getItem('learning.text-size'),
        ),
      ).toBeNull();
      await expect(
        page.locator('.step-progress, .text-size-control'),
      ).toHaveCount(0);
      await expect(
        page
          .locator('header')
          .getByRole('switch', { name: f.autoSpeak, exact: true }),
      ).toHaveAttribute('aria-checked', 'false');
      await expect(
        page
          .locator('header')
          .getByRole('button', { name: f.chat, exact: true }),
      ).toBeVisible();
      const response = await page.request.get('/');
      expect(response.headers()['content-security-policy']).toContain(
        "connect-src 'self'",
      );

      const capture = async (step: string, suffix = '') => {
        await expect(page.locator('.app-shell')).toHaveAttribute(
          'data-step',
          step,
        );
        await expect(page.locator('html')).toHaveAttribute(
          'data-text-size',
          size,
        );
        const measurement = await page.evaluate(() => {
          const box = (selector: string) => {
            const node = document.querySelector(selector)!;
            const r = node.getBoundingClientRect();
            return {
              top: r.top,
              bottom: r.bottom,
              left: r.left,
              right: r.right,
              width: r.width,
              height: r.height,
            };
          };
          const pane = (selector: string) => {
            const el = document.querySelector(selector)!;
            return {
              height: el.clientHeight,
              scrollHeight: el.scrollHeight,
              width: el.clientWidth,
              scrollWidth: el.scrollWidth,
            };
          };
          const clipped = [
            ...document.querySelectorAll(
              'h1, h2, button, legend, .caption, .notice, .summary-tile p, .progress-name, .app-footer p',
            ),
          ]
            .filter((node) => (node as globalThis.HTMLElement).offsetWidth > 0)
            .filter(
              (node) =>
                node.scrollWidth > node.clientWidth + 2 ||
                node.scrollHeight > node.clientHeight + 2,
            )
            .map((node) => ({
              tag: node.tagName,
              text: node.textContent,
              width: node.clientWidth,
              scrollWidth: node.scrollWidth,
              height: node.clientHeight,
              scrollHeight: node.scrollHeight,
            }));
          const keyNodes = [
            ...document.querySelectorAll(
              'h1, h2, button, legend, .caption, .notice, .step-body, .summary-tile p, .progress-name, .app-footer p',
            ),
          ].filter((node) => (node as globalThis.HTMLElement).offsetWidth > 0);
          const overlaps: string[] = [];
          for (let i = 0; i < keyNodes.length; i++)
            for (let j = i + 1; j < keyNodes.length; j++) {
              const a = keyNodes[i],
                b = keyNodes[j];
              if (
                a.contains(b) ||
                b.contains(a) ||
                a.closest('.pane-content, .app-header, .shell-bottom') !==
                  b.closest('.pane-content, .app-header, .shell-bottom')
              )
                continue;
              const x = a.getBoundingClientRect(),
                y = b.getBoundingClientRect();
              if (
                Math.min(x.right, y.right) - Math.max(x.left, y.left) > 2 &&
                Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top) > 2
              )
                overlaps.push(
                  `${a.tagName}:${a.textContent} / ${b.tagName}:${b.textContent}`,
                );
            }
          const a = document.querySelector(
            '.primary-actions button:last-child',
          )!;
          const r = a.getBoundingClientRect();
          const top = Math.max(0, r.top),
            bottom = Math.min(window.innerHeight, r.bottom);
          const target = document.elementFromPoint(
            r.left + r.width / 2,
            (top + bottom) / 2,
          );
          return {
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight,
            },
            document: {
              height: document.documentElement.scrollHeight,
              width: document.documentElement.scrollWidth,
            },
            header: box('.app-header'),
            actions: box('.action-bar'),
            primary: box('.primary-actions button:last-child'),
            reading: pane('.pane-reading .pane-scroll'),
            interaction: pane('.pane-interaction .pane-scroll'),
            primaryHit: !!target && (a === target || a.contains(target)),
            clipped,
            overlaps,
          };
        });
        measurements.push({ step, suffix, ...measurement });
        expect
          .soft(
            measurement.document.width,
            `${step}: horizontal document overflow`,
          )
          .toBeLessThanOrEqual(width);
        expect
          .soft(measurement.primary.top, `${step}: action above viewport`)
          .toBeGreaterThanOrEqual(0);
        expect
          .soft(measurement.primary.bottom, `${step}: action below viewport`)
          .toBeLessThanOrEqual(height + 1);
        expect
          .soft(measurement.primaryHit, `${step}: primary action is covered`)
          .toBe(true);
        expect
          .soft(measurement.clipped, `${step}: clipped key text`)
          .toEqual([]);
        expect
          .soft(measurement.overlaps, `${step}: overlapping key elements`)
          .toEqual([]);
        if (width >= 1024) {
          expect
            .soft(
              measurement.document.height,
              `${step}: desktop document scroll`,
            )
            .toBeLessThanOrEqual(height);
          expect
            .soft(measurement.header.top, `${step}: header above viewport`)
            .toBeGreaterThanOrEqual(0);
          expect
            .soft(measurement.header.bottom, `${step}: header below viewport`)
            .toBeLessThanOrEqual(height);
          expect
            .soft(measurement.reading.scrollWidth)
            .toBeLessThanOrEqual(measurement.reading.width + 1);
          expect
            .soft(measurement.interaction.scrollWidth)
            .toBeLessThanOrEqual(measurement.interaction.width + 1);
          if (noInnerScroll.has(step)) {
            expect
              .soft(
                measurement.reading.scrollHeight,
                `${step}: reading pane needs scroll at ${size}`,
              )
              .toBeLessThanOrEqual(measurement.reading.height + 2);
            expect
              .soft(
                measurement.interaction.scrollHeight,
                `${step}: interaction pane needs scroll at ${size}`,
              )
              .toBeLessThanOrEqual(measurement.interaction.height + 2);
          }
        }
        if (width >= 1024 && size === 'large') {
          await page.locator('.pane-scroll').evaluateAll((nodes) =>
            nodes.forEach((node) => {
              node.scrollTop = node.scrollHeight;
            }),
          );
          const pinned = await page.evaluate(() => ({
            header: document
              .querySelector('.app-header')!
              .getBoundingClientRect().top,
            action: document
              .querySelector('.action-bar')!
              .getBoundingClientRect().bottom,
            document: document.documentElement.scrollHeight,
          }));
          expect.soft(pinned.header).toBeGreaterThanOrEqual(0);
          expect.soft(pinned.action).toBeLessThanOrEqual(height);
          expect.soft(pinned.document).toBeLessThanOrEqual(height);
          await page.locator('.pane-scroll').evaluateAll((nodes) =>
            nodes.forEach((node) => {
              node.scrollTop = 0;
            }),
          );
        }
        await page.screenshot({
          path: `${directory}/${String(JOURNEY_STEPS.indexOf(step as (typeof JOURNEY_STEPS)[number])).padStart(2, '0')}-${step}${suffix}.png`,
        });
      };
      await capture('LanguageSelect');
      await click(
        page,
        language === 'en' ? en.languageSelect.english : hi.languageSelect.hindi,
      );
      await capture('Intro');
      await click(page, ui.intro.continue);
      await capture('Setup');
      await click(page, ui.setup.stake100);
      await click(page, ui.setup.leverage10);
      await expect(page.locator('.summary-tile')).toContainText(
        formatRupees(100000, language),
      );
      await capture('Setup', '-updated');
      await click(page, ui.setup.stake25);
      await click(page, ui.setup.leverage2);
      await click(page, ui.setup.continue);
      await expect(
        page.locator('.primary-actions button:last-child'),
      ).toBeDisabled();
      await click(page, ui.prediction.smallLoss);
      await capture('Prediction');
      await click(page, ui.prediction.continue);
      await click(page, f.pausePath);
      await capture('Run');
      await click(page, f.resumePath);
      let capturedDecision = false;
      for (let n = 0; n < 90; n++) {
        if (await page.locator('.app-shell[data-step="Result"]').count()) break;
        if (
          await page
            .getByRole('button', { name: ui.run.resume, exact: true })
            .count()
        ) {
          if (!capturedDecision) {
            await capture('Run', '-decision');
            capturedDecision = true;
          }
          await click(page, ui.run.resume);
        } else await page.clock.runFor(451);
      }
      await capture('Result');
      await click(page, ui.result.continue);
      await capture('Replay');
      // Optional tables are allowed to scroll inside the pane, not the document.
      await page.getByText(ui.common.chartData, { exact: true }).click();
      if (width >= 1024)
        expect(
          await page.evaluate(() => document.documentElement.scrollHeight),
        ).toBeLessThanOrEqual(height);
      await page.getByText(ui.common.chartData, { exact: true }).click();
      await click(page, ui.replay.continue);
      await capture('Reveal');
      await click(page, ui.reveal.continue);
      await capture('Debrief');
      await page.locator('.term-chips button').first().click();
      await expect(
        page.locator('.pane-interaction .glossary-card'),
      ).toBeVisible();
      await capture('Debrief', '-glossary');
      await click(page, f.glossaryClose);
      let lesson = 0;
      while (
        await page
          .getByRole('button', { name: f.nextLesson, exact: true })
          .count()
      ) {
        await click(page, f.nextLesson);
        await capture('Debrief', `-lesson-${++lesson}`);
      }
      await click(page, ui.debrief.continue);
      await click(page, ui.prediction.almostEverything);
      await click(page, ui.postCheck.notSure);
      await capture('PostCheck');
      await click(page, ui.postCheck.continue);
      await capture('NextSteps');
      await click(page, f.pilotOpen);
      await capture('NextSteps', '-summary');
      await page.locator('.about-link').click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('dialog')).toContainText(f.reviewNotice);
      await expect(page.getByRole('dialog')).toContainText(f.privacy);
      await expect(page.getByRole('dialog')).toContainText(f.offline);
      await expect(page.getByRole('dialog')).toContainText(f.hostLogs);
      const dialog = await page.getByRole('dialog').boundingBox();
      expect(dialog!.x).toBeGreaterThanOrEqual(0);
      expect(dialog!.x + dialog!.width).toBeLessThanOrEqual(width);
      expect(dialog!.y).toBeGreaterThanOrEqual(0);
      expect(dialog!.y + dialog!.height).toBeLessThanOrEqual(height);
      await page.screenshot({ path: `${directory}/12-About.png` });
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(page.locator('.about-link')).toBeFocused();
      expect(errors).toEqual([]);
      await mkdir(`${output}/matrix`, { recursive: true });
      await writeFile(
        `${output}/matrix/${width}x${height}-${language}-${size}.json`,
        JSON.stringify(
          { width, height, language, size, measurements, errors },
          null,
          2,
        ),
      );
    });
  }
