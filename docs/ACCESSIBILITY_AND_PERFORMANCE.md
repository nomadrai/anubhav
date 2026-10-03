# Accessibility and performance — measured product track

## Evidence scope (2026-10-03)

Production Vite build, local Google Chrome **149.0.7827.102**, Playwright **1.63.0**, axe-core Playwright **4.13.0**, Lighthouse **13.5.0**. These are automated desktop-hosted Chromium measurements, not a physical phone, human screen-reader session, native-speaker review, listening review or participant study. The parent was separately generating speech during this session; the host is not an isolated performance laboratory.

The final product-browser invocation, `npm run test:browser`, returned **6 passed, 2 explicitly skipped** in **52.2 s**. The skips are the English and Hindi **real packaged audio** playback/offline tests: the built manifest was still incomplete. No fake or silent audio was substituted. Rebuild and rerun after the parent finishes the 58-track manifest. Automated player lifecycle/hash/failure behavior is covered separately by unit tests.

The six passing scenarios:

1. English, 360×640, first recorded episode at ten-times exposure, forced exit, comparison, reveal, debrief, post-check, official links and local summary.
2. English, 360×640, second episode at two-times exposure, completion and the same full end-to-end journey.
3. Hindi equivalent of scenario 1.
4. Hindi equivalent of scenario 2.
5. Warmed production service-worker shell reload with networking disabled; uncached request failure; visible uncached-audio fallback with captions; continuation to setup.
6. Keyboard activation/skip-link/heading focus; larger text; Hindi language change; 200% CSS-zoom-equivalent reflow; reduced-motion preference; preference persistence; restrictive response CSP.

All four full flows additionally verify:

- a selected prediction is required before playback; both reflection answers are required afterwards;
- manual pause does not advance even after 60 seconds of the controlled browser clock;
- forced-exit settlement is ₹625 with the tested initial amount/exposure; two comparison lines use the full recorded path with a table for all observations;
- source dates/publisher are absent from pre-reveal DOM; neutral publisher attribution appears at Reveal without a raw provenance URL;
- glossary disclosure opens with Enter and closes with Space;
- verified bilingual resource labels/URLs match checked resource records; links are not visited by the automated journey;
- clipboard copy contains the chosen before/after answers only after an explicit Copy gesture;
- only `learning.language` persists during the default journey, sessionStorage is empty, cookies are empty, and restart/reload do not restore answers;
- all observed runtime requests are same-origin, and **zero audio requests occur without Listen**;
- zero browser page errors; no horizontal document overflow at 360×640 in the checked states;
- axe reports **zero violations** at the checked language, run, result, replay, reveal, debrief, post-check, resource and summary states, and at larger-text/Hindi/zoomed reading settings. This is not a claim that automated rules cover all accessibility requirements.

## Issues found and fixed by the browser pass

- Reading preferences initially sat outside landmarks when expanded. They now belong to the page banner, and the expanded-controls axe check passes.
- The test initially queried a wrapped select by its full label text, which included option text. Tests now use its actual accessible combobox name. Font-size/persistence assertions retry until the React preference effect commits.
- Chrome 149 returns `navigator.onLine === true` after a service-worker-served offline reload even though uncached requests fail. The app accurately calls this the **browser's report**, not verified connectivity. The offline test independently checks an uncached request fails, then uses CDP `Network.overrideNetworkState` to exercise the offline-report notice. The application itself adds no connectivity probe or runtime external request.
- Tailwind source discovery is now restricted to `src/`, so generated browser traces cannot change the CSS output of a later build.

## Reflow and keyboard limitations

Default viewport is 360×640 CSS pixels. The larger-text preference changes the root size from 16px to 20px. The 200% check sets CSS `zoom: 2` on a 720×1280 viewport, exercising a 360×640-equivalent layout with larger text and Hindi. This is **not** a claim that a human tested OS scaling or every browser's native zoom UI. Native browser zoom, screen-reader speech/announcements, switch control, iOS/Android hardware and human Hindi typography/pronunciation remain untested.

Reduced-motion emulation is active; stylesheet transitions/animation durations collapse under that preference. Focusable controls have visible focus styling, headings receive transition focus, and native buttons/selects/details provide keyboard operation. Charts have text descriptions and data tables; line styles distinguish exposure without relying on color. Automated axe/Lighthouse cannot prove comfortable reading, comprehension, correct pronunciation or WCAG conformance.

## Production bundle budgets

Measured by `npm run check:bundle` on the audited build:

| Asset class | Actual gzip bytes | Budget bytes | Result |
|---|---:|---:|---|
| JavaScript, including service-worker scripts | 109,212 | 153,600 | pass |
| CSS | 1,974 | 20,480 | pass |

These are locally computed gzip sizes, not a promise that every deployment serves gzip/Brotli. The deployment should enable compression. Audio is gesture-loaded and is excluded from the first-navigation result below; no model, remote font, source-data request or audio is preloaded.

## Lighthouse mobile slow-network + 4× CPU result

Command: `npm run check:performance`. The runner launches/cleans up its own production preview and Chrome, saves the complete HTML/JSON report, and records asset SHA-256 identifiers. Measurement timestamp: **2026-10-03T13:45:52.102Z**. Navigation URL: `http://127.0.0.1:4174/`.

Explicit profile: mobile **360×640**, device scale factor 1, cold storage/cache reset, **DevTools** throttling (not Lighthouse's default simulated 4G), **400 kbps down / 400 kbps up**, **400 ms added request latency**, **4× CPU slowdown**. This is a recorded Slow-3G-shaped laboratory profile; network labels vary between tool versions. It does not model all real radio behavior. The test is the initial language-selection page, not a full journey timing or an audio measurement.

| Metric | Actual result |
|---|---:|
| Lighthouse performance score | 88 / 100 |
| Lighthouse accessibility score | 100 / 100 |
| Lighthouse best practices score | 100 / 100 |
| First contentful paint | 3,134.171 ms |
| Largest contentful paint | 3,134.171 ms |
| Speed index | 2,715 ms |
| Total blocking time | 0 ms |
| Cumulative layout shift | 0 |
| Lighthouse interactive audit | 3,134.171 ms |
| Total network bytes reported by Lighthouse | 108,020 |
| Lighthouse run warnings | none |

No score is represented as a compliance certificate or a field percentile. A single run is not a distribution, performance improvement baseline, or a human-observed first-usable-interaction measurement. Run again on the deployed host and an actual low-end device before making broader speed claims.

Audited production assets:

| Asset | Uncompressed bytes | Locally computed gzip bytes | SHA-256 |
|---|---:|---:|---|
| `assets/index-D6E8oCyn.js` | 333,075 | 97,937 | `cb4bc1b7b64c3fff7d5038160f9b76e0f4abf4351e900a102728690de18d5262` |
| `assets/index-exgQwJw-.css` | 5,580 | 1,974 | `c94425683a5349bfd0b6158d0bd456e5c06982739ffaaa17f6383a3eb28fdcb7` |
| `assets/workbox-window.prod.es5-Bd17z0YL.js` | 5,653 | 2,199 | `17bcc17d60dc78f927834b880c39649b03af46fd1f5cdbb8c42c5ae2b515dce9` |

The bundle budget includes generated service-worker scripts outside `assets/`, hence the larger aggregate JavaScript figure. Subsequent content/audio integration can change the build: the hashes identify what was actually measured rather than implying an unbuilt future release was audited.

## Reproduction and retained artifacts

```sh
npm run build
npm run test:browser
npm run check:bundle
npm run check:performance
```

- Browser test source/config: `e2e/journey.e2e.ts`, `playwright.config.ts`.
- Local generated browser results: `e2e/results/report.json`, per-flow paused-run/reveal/summary PNGs; traces on failure.
- Measurement runner: `e2e/performance.mjs`.
- Local generated Lighthouse artifacts: `e2e/performance-results/report.html`, `report.json`, `summary.json` (full settings and build hashes).
- Chrome path override: `CHROME_PATH=/absolute/path/to/chrome`; no downloaded Playwright browser is required here.
- Both commands close their browsers and owned preview servers. If a compatible 4173 preview is already running, Playwright reuses it; its owner must stop it afterwards.

## Offline and release boundary

The warmed-shell offline reload is **implemented and tested**, unlike the older scaffold. Static content is precached; audio is cached only after an explicit request. Storage eviction, private mode, unsupported service workers, a failed first cache fill or a host that does not serve the generated worker correctly can prevent offline reopening. Official links are outside the app and require a connection.

Full lint/typecheck/unit/build/bundle results and the incomplete-audio content-gate disposition are in [PRODUCT_IMPLEMENTATION.md](PRODUCT_IMPLEMENTATION.md). The release gate must remain blocked on incomplete/missing/failed audio or other unresolved blockers; a passing product-browser suite does not waive it.
