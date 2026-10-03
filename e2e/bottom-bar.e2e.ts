import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import enFeatures from '../src/content/en/features.json' with { type: 'json' };
import hiFeatures from '../src/content/hi/features.json' with { type: 'json' };

for (const width of [1280, 360])
  for (const language of ['en', 'hi'] as const) {
    test(`${width}px ${language}: compact whole bottom section and accessible Chat icon`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 650 });
      await page.addInitScript(
        (lang) => window.localStorage.setItem('learning.language', lang),
        language,
      );
      await page.goto('/');
      const f = language === 'en' ? enFeatures : hiFeatures;
      const measure = async () =>
        page.evaluate(() => {
          const rect = (selector: string) => {
            const r = document.querySelector(selector)!.getBoundingClientRect();
            return {
              width: r.width,
              height: r.height,
              top: r.top,
              bottom: r.bottom,
              left: r.left,
            };
          };
          return {
            bottom: rect('.shell-bottom'),
            main: rect('main'),
            action: rect('.primary-actions .big-button'),
            back: rect('.back-button'),
            notice: rect('.app-footer p'),
            about: rect('.about-link'),
          };
        });
      const results = [];
      for (let screen = 0; screen < 2; screen++) {
        const m = await measure();
        results.push(m);
        expect
          .soft(
            m.bottom.height,
            'Entire footer, including Back and primary action',
          )
          .toBeLessThanOrEqual(width >= 1024 ? 80 : 130);
        expect
          .soft(
            Math.abs(m.bottom.width - m.main.width),
            'Footer width unchanged',
          )
          .toBeLessThanOrEqual(1);
        expect.soft(m.action.height).toBeGreaterThanOrEqual(48);
        expect.soft(m.back.height).toBeGreaterThanOrEqual(48);
        expect.soft(m.about.top).toBeGreaterThanOrEqual(m.notice.bottom - 1);
        expect
          .soft(Math.abs(m.about.left - m.notice.left))
          .toBeLessThanOrEqual(1);
        expect.soft(m.action.bottom).toBeLessThanOrEqual(650);
        expect
          .soft(await page.evaluate(() => document.documentElement.scrollWidth))
          .toBeLessThanOrEqual(width);
        const chat = page.getByRole('button', { name: f.chat, exact: true });
        await expect.soft(chat.locator('svg')).toHaveCount(1);
        expect.soft(await chat.textContent()).toBe('');
        if (screen === 0) {
          await page.locator('.primary-actions .big-button').click();
          await expect(page.locator('.app-shell')).toHaveAttribute(
            'data-step',
            'Intro',
          );
        }
      }
      await mkdir('artifacts/ui/bottom-bar', { recursive: true });
      await writeFile(
        `artifacts/ui/bottom-bar/${width}-${language}.json`,
        JSON.stringify(results, null, 2),
      );
      await page.screenshot({
        path: `artifacts/ui/bottom-bar/${width}-${language}.png`,
      });
    });
  }
