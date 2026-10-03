import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const root = 'artifacts/ui';
const escape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('"', '&quot;');
const css = `body{margin:0;padding:24px;background:#f7f1e8;color:#29251f;font:16px system-ui}h1{font-size:28px}h2{font-size:20px}nav{display:flex;gap:12px;flex-wrap:wrap}a{color:#386b57}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}figure{margin:0;border:1px solid #ded4c6;background:#fffdf9;padding:8px;border-radius:8px}img{width:100%;display:block}figcaption{font-size:12px;padding-top:6px}section{margin-top:28px}p{max-width:90ch}`;
const sections = [];
const records = [];
for (const viewport of (await readdir(`${root}/screenshots`)).sort()) {
  for (const setting of (
    await readdir(`${root}/screenshots/${viewport}`)
  ).sort()) {
    const files = (await readdir(`${root}/screenshots/${viewport}/${setting}`))
      .filter((file) => file.endsWith('.png'))
      .sort();
    const cards = files
      .map(
        (file) =>
          `<figure><a href="screenshots/${escape(viewport)}/${escape(setting)}/${escape(file)}"><img loading="lazy" src="screenshots/${escape(viewport)}/${escape(setting)}/${escape(file)}" alt="${escape(`${viewport} ${setting} ${file}`)}"></a><figcaption>${escape(file.replace('.png', ''))}</figcaption></figure>`,
      )
      .join('');
    sections.push({
      id: `${viewport}-${setting}`,
      title: `${viewport} · ${setting}`,
      cards,
    });
  }
}
const html = `<!doctype html><meta charset="utf-8"><title>UI contact sheets</title><style>${css}</style><h1>UI redesign — screenshot contact sheets</h1><p>Actual production-Chrome captures, with predefined test choices. These are not human-reviewed designs or physical-device results. Click a thumbnail for the full-resolution image. Includes every step, configuration update, decision pause, lesson, glossary, summary and About.</p><nav>${sections.map((s) => `<a href="#${s.id}">${s.title}</a>`).join('')}</nav>${sections.map((s) => `<section id="${s.id}"><h2>${s.title}</h2><div class="grid">${s.cards}</div></section>`).join('')}`;
await writeFile(`${root}/contact-sheet.html`, html);
// Separate, reasonably sized PNG boards for every viewport/language/text setting.
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
  args: ['--no-sandbox'],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  await mkdir(`${root}/contact-sheets`, { recursive: true });
  await page.goto(pathToFileURL(path.resolve(root, 'contact-sheet.html')).href);
  for (const section of sections) {
    const board = `<!doctype html><meta charset="utf-8"><base href="${pathToFileURL(`${path.resolve(root)}/`).href}"><style>${css}</style><h1>${section.title}</h1><div class="grid">${section.cards.replaceAll('loading="lazy"', '')}</div>`;
    await page.setContent(board);
    await page.evaluate(async () => {
      await Promise.all([...document.images].map((img) => img.decode()));
    });
    await page.screenshot({
      path: `${root}/contact-sheets/${section.id}.png`,
      fullPage: true,
    });
  }
} finally {
  await browser.close();
}
for (const file of (await readdir(`${root}/matrix`))
  .filter((file) => file.endsWith('.json'))
  .sort())
  records.push(JSON.parse(await readFile(`${root}/matrix/${file}`, 'utf8')));
const summary = {
  source: 'e2e/layout.e2e.ts',
  scope:
    'Production desktop-hosted Chrome, synthetic viewport emulation and controlled playback clock; not human/native/listening/device conformance.',
  scenarios: records.length,
  requiredStepSamples: records.reduce(
    (n, r) => n + new Set(r.measurements.map((m) => m.step)).size,
    0,
  ),
  additionalStateSamples: records.reduce(
    (n, r) => n + r.measurements.filter((m) => m.suffix).length,
    0,
  ),
  results: records.map((r) => ({
    viewport: `${r.width}x${r.height}`,
    language: r.language,
    textSize: r.size,
    documentNoScroll:
      r.width >= 1024
        ? r.measurements.every((m) => m.document.height <= r.height)
        : 'mobile natural scroll',
    noHorizontalOverflow: r.measurements.every(
      (m) => m.document.width <= r.width,
    ),
    pinnedPrimaryActions: r.measurements.every(
      (m) =>
        m.primary.top >= 0 && m.primary.bottom <= r.height + 1 && m.primaryHit,
    ),
    noClippedKeyText: r.measurements.every((m) => !m.clipped.length),
    noOverlappingKeyElements: r.measurements.every((m) => !m.overlaps.length),
    shortStepPaneOverflow:
      r.width >= 1024 && r.size !== 'large'
        ? r.measurements.flatMap((m) =>
            [
              'LanguageSelect',
              'Intro',
              'Setup',
              'Prediction',
              'Run',
              'Result',
              'Replay',
              'PostCheck',
            ].includes(m.step)
              ? ['reading', 'interaction']
                  .filter((k) => m[k].scrollHeight > m[k].height + 2)
                  .map((k) => `${m.step}${m.suffix}:${k}`)
              : [],
          )
        : 'inner pane scroll permitted / mobile',
  })),
};
await writeFile(
  `${root}/matrix-summary.json`,
  `${JSON.stringify(summary, null, 2)}\n`,
);
console.log(
  `Contact sheets: ${sections.length}; scenarios: ${summary.scenarios}; required step samples: ${summary.requiredStepSamples}; additional states: ${summary.additionalStateSamples}.`,
);
