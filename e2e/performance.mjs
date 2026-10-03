import { spawn } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';

const url = 'http://127.0.0.1:4174';
const output = 'e2e/performance-results';
const preview = spawn(
  process.execPath,
  [
    'node_modules/vite/bin/vite.js',
    'preview',
    '--host',
    '127.0.0.1',
    '--port',
    '4174',
    '--strictPort',
  ],
  { stdio: 'ignore' },
);
let browser;
try {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (preview.exitCode !== null)
      throw new Error(
        'Preview server failed to start; port 4174 must be free.',
      );
    try {
      if ((await globalThis.fetch(url)).ok) break;
    } catch {
      /* Server startup only. */
    }
    if (attempt === 99) throw new Error('Preview server timeout');
    await delay(100);
  }
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--remote-debugging-port=9223'],
    headless: true,
  });
  const result = await lighthouse(url, {
    port: 9223,
    output: ['html', 'json'],
    logLevel: 'error',
    onlyCategories: ['performance', 'accessibility', 'best-practices'],
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      width: 360,
      height: 640,
      deviceScaleFactor: 1,
      disabled: false,
    },
    throttlingMethod: 'devtools',
    // Explicit slow-network profile, rather than an unlabeled default Lighthouse 4G run.
    throttling: {
      rttMs: 400,
      throughputKbps: 400,
      requestLatencyMs: 400,
      downloadThroughputKbps: 400,
      uploadThroughputKbps: 400,
      cpuSlowdownMultiplier: 4,
    },
    disableStorageReset: false,
  });
  if (!result) throw new Error('Lighthouse returned no result');
  if (result.lhr.runtimeError)
    throw new Error(JSON.stringify(result.lhr.runtimeError));
  await mkdir(output, { recursive: true });
  await writeFile(`${output}/report.html`, result.report[0]);
  await writeFile(`${output}/report.json`, result.report[1]);
  const files = (await readdir('dist/assets')).filter((file) =>
    /\.(js|css)$/.test(file),
  );
  const assets = await Promise.all(
    files.map(async (file) => {
      const bytes = await readFile(`dist/assets/${file}`);
      return {
        file,
        bytes: bytes.length,
        gzipBytes: gzipSync(bytes).length,
        sha256: createHash('sha256').update(bytes).digest('hex'),
      };
    }),
  );
  const lhr = result.lhr;
  const summary = {
    measuredAt: lhr.fetchTime,
    requestedUrl: lhr.requestedUrl,
    browser: await browser.version(),
    lighthouse: lhr.lighthouseVersion,
    userAgent: lhr.userAgent,
    settings: lhr.configSettings,
    scores: Object.fromEntries(
      Object.entries(lhr.categories).map(([key, value]) => [key, value.score]),
    ),
    metrics: Object.fromEntries(
      [
        'first-contentful-paint',
        'largest-contentful-paint',
        'speed-index',
        'total-blocking-time',
        'cumulative-layout-shift',
        'interactive',
      ]
        .filter((key) => lhr.audits[key])
        .map((key) => [
          key,
          {
            value: lhr.audits[key].numericValue,
            unit: lhr.audits[key].numericUnit,
            display: lhr.audits[key].displayValue,
          },
        ]),
    ),
    totalNetworkBytes: lhr.audits['total-byte-weight']?.numericValue,
    warnings: lhr.runWarnings,
    assets,
    scope:
      'One cold-cache local production navigation at 360x640, DevTools 400 kbps down/up, 400 ms added request latency, 4x CPU. Not a field result, listening review, native-speaker review, or screen-reader test. Gzip sizes are computed, not measured transfer compression.',
  };
  await writeFile(
    `${output}/summary.json`,
    `${JSON.stringify(summary, null, 2)}\n`,
  );
  console.log(JSON.stringify(summary, null, 2));
} finally {
  await browser?.close();
  preview.kill('SIGTERM');
}
