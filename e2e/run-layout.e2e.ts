import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import en from '../src/content/en/ui.json' with { type: 'json' };
import hi from '../src/content/hi/ui.json' with { type: 'json' };
import enFeatures from '../src/content/en/features.json' with { type: 'json' };
import hiFeatures from '../src/content/hi/features.json' with { type: 'json' };

for (const language of ['en', 'hi'] as const)
  for (const size of ['standard', 'medium'] as const) {
    test(`1280x650 ${language} ${size}: changing captions and warning pause fit at ten-times exposure`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 650 });
      const ui = language === 'en' ? en : hi;
      const f = language === 'en' ? enFeatures : hiFeatures;
      const records: unknown[] = [];
      await page.addInitScript(
        ({ language, size }) => {
          window.localStorage.setItem('learning.language', language);
          window.localStorage.setItem('learning.text-size', size);
        },
        { language, size },
      );
      await page.clock.install();
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
      await page
        .getByRole('button', { name: ui.intro.continue, exact: true })
        .click();
      await page
        .getByRole('button', { name: ui.setup.leverage10, exact: true })
        .click();
      await page
        .getByRole('button', { name: ui.setup.continue, exact: true })
        .click();
      await page
        .getByRole('button', { name: ui.prediction.smallLoss, exact: true })
        .click();
      await page
        .getByRole('button', { name: ui.prediction.continue, exact: true })
        .click();
      let warningSeen = false;
      for (let n = 0; n < 80; n++) {
        if (await page.locator('[data-step="Result"]').count()) break;
        const measured = await page.evaluate(() => ({
          document: document.documentElement.scrollHeight,
          caption: document.querySelector('.caption')?.textContent,
          panes: [...document.querySelectorAll('.pane-scroll')].map((node) => ({
            height: node.clientHeight,
            scrollHeight: node.scrollHeight,
          })),
          action: document
            .querySelector('.primary-actions button:last-child')!
            .getBoundingClientRect().bottom,
        }));
        records.push(measured);
        expect.soft(measured.document).toBeLessThanOrEqual(650);
        expect.soft(measured.action).toBeLessThanOrEqual(650);
        for (const pane of measured.panes)
          expect
            .soft(pane.scrollHeight, measured.caption!)
            .toBeLessThanOrEqual(pane.height + 2);
        const resume = page.getByRole('button', {
          name: ui.run.resume,
          exact: true,
        });
        if (await resume.count()) {
          if (
            await page.getByText(ui.run.warningPoint, { exact: true }).count()
          ) {
            warningSeen = true;
            const directory = `artifacts/ui/screenshots/1280x650/${language}-${size}`;
            await mkdir(directory, { recursive: true });
            await page.screenshot({ path: `${directory}/04-Run-warning.png` });
          }
          await resume.click();
        } else await page.clock.runFor(451);
      }
      expect(warningSeen).toBe(true);
      await expect(page.locator('[data-step="Result"]')).toBeVisible();
      await expect(page.locator('.outcome-line')).toHaveText(
        ui.result.forcedExitLine,
      );
      await mkdir('artifacts/ui/stress', { recursive: true });
      await writeFile(
        `artifacts/ui/stress/${language}-${size}.json`,
        JSON.stringify({ language, size, records }, null, 2),
      );
      await expect(page.locator('.app-footer')).toContainText(f.localNotice);
    });
  }
