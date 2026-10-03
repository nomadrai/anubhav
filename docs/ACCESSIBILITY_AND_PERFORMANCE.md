# Accessibility and performance — measured product track

## Scoped header/footer follow-up — fixed A+ and opt-in auto-speak

Current follow-up checks: **197 unit/policy tests and 34 browser tests passed**, none
skipped. Layout now runs the same 10 viewports × two languages at the single fixed
A+ size (220 required step samples); short desktop steps fit, with inner scrolling
reserved for longer content/expanded data. Run warning cases also fit at 1280×650.
Native packaged-audio tests cover ordered Run playback with peak concurrency one,
step/opt-out cleanup, saved settings, manual Listen and a simulated blocked-autoplay
policy with silent fallback. Chat is inert. Footer/link are stacked left; header
progress and text-size controls are removed. Old text-size storage is retired.

Lint, typecheck, content/audio, build, bundle and release gates pass. Aggregate gzip
JS **115,075 B** / CSS **4,197 B**, within unchanged budgets. No new Lighthouse or
contact-board run was requested/performed for this follow-up; the measurements and
three-size contact boards below describe the **prior** redesign, not this build.
No human/native/listening review, deployment or engine/narrated-text change occurred.

## Prior UI redesign evidence

**Implemented and checked locally; not deployed or human-reviewed.** The older
integration sections below are historical snapshots, not the current audio or
layout status. Current audio remains complete at **58/58**, and both real
English/Hindi packaged playback/offline tests pass. No audio was regenerated.

### Layout and browser matrix

Command: `npm run test:browser -- --workers=3`. Final result: **72 passed,
0 skipped, 0 unexpected, 0 flaky** in approximately **2.2 minutes**. The 60
independent layout cases may run in parallel; the existing full-journey file
remains sequential to avoid shared clipboard races. Each case has an isolated
browser context and its own artifact path.

- **60 complete matrix journeys:** 10 viewports × English/Hindi × standard,
  medium and largest text, covering **660 required step samples**.
- **360 extra state samples:** updated setup choices/summary, decision pause,
  glossary card, additional debrief lessons and local summary.
- Four extra smallest-desktop standard/medium warning/ten-times exposure cases
  check changing captions and true warning pauses through forced exit.
- Eight existing tests cover both languages/episodes, exact replay series,
  settled forced exit, reflection gating, preference-only storage/reset/reload,
  keyboard/reflow/axe, warmed shell, readable audio failure and real cached audio.
- **1,084 raw PNGs and 60 PNG contact boards** generated under gitignored
  `artifacts/ui/`. The browsable gallery is `artifacts/ui/contact-sheet.html`;
  boards are `artifacts/ui/contact-sheets/<viewport>-<language>-<size>.png`.
  Captures are automated viewport views, not physical-device/human reviews.

| Viewports | Standard/medium | Largest | Horizontal overflow / action reachability |
|---|---|---|---|
| 1280×650, 1366×657, 1440×800, 1536×730 | All eight short steps fit in both panes; no document scroll on any of the eleven steps | Header/actions pinned; only panes may scroll | Pass in both languages |
| 1920×890, 2560×1300 | Same result, with scaled type/charts/cards and background structure | Header/actions pinned; only panes may scroll | Pass in both languages |
| 1024×768 two-pane tablet boundary | All eight short steps fit; no document scroll | Inner scrolling permitted | Pass in both languages |
| 768×1024, 390×844, 360×640 | Natural single-column scrolling with sticky actions | Same, with larger text | Pass in both languages |

Short steps are LanguageSelect, Intro, Setup, Prediction, Run, Result, Replay and
PostCheck. Reveal, Debrief, NextSteps, About and deliberately expanded chart data
may use internal scrolling on desktop. Largest-size tests actually scroll panes
and recheck the pinned header/actions. Key-text overflow and within-region element
overlap checks passed; primary-action hit tests ensure it is not covered. About
fits each viewport, preserves disclosures and returns focus to its opener on
Escape. Axe reports zero violations in the existing checked states; this does
not establish WCAG conformance or human reading comfort.

Full-journey request assertions require **same-origin, static, bodyless GETs,
no query payload**, empty cookies/session storage and preference-only localStorage.
A same-origin POST is not silently accepted. Production `connect-src 'self'`
remains intact. No automatic narration requests occur. Explicit outbound resource
navigation and ordinary host request metadata are outside the local-only answer
claim and remain disclosed.

Machine summary and exact asset identities: [UI_LAYOUT_EVIDENCE.json](UI_LAYOUT_EVIDENCE.json).
Raw per-pane bounds and screenshots remain local in `artifacts/ui/matrix/` and
`artifacts/ui/screenshots/`. No unresolved tested layout failure remains.

### Actual failures and corrections

Earlier passes found compact-height medium-text overflow, cramped mobile progress
labels, font-descender overflow, a missing action landmark, decorative check marks
polluting accessible names, and About focus-return timing. These were fixed, not
hidden by relaxing assertions. Lazy loading also required audio tests to wait for
the actual Intro rather than activate the visible language-entry fallback clip.
A later full pass was 71/72: medium English Replay at 1920×890 needed **3 pixels**
of inner scrolling. Its wide-screen chart was adjusted via clamp/viewport sizing;
the final **full** 72-case suite then passed. Initial and aborted logs remain in
`artifacts/ui/provisional/`. The sticky header is opaque so scrolled mobile text
does not ghost through it.

### Before and after — measured, not assumed

Both use local Chrome 149.0.7827.102 / Lighthouse 13.5.0, cold 360×640 navigation,
DevTools 400 kbps down/up, 400 ms added request latency and 4× CPU. Before:
`2026-10-03T20:55:24.386Z`; final after: `2026-10-03T22:19:50.526Z`.

| Metric | Before | Final after |
|---|---:|---:|
| Aggregate gzip JavaScript (all chunks + worker scripts) | 109,224 B | 114,340 B |
| Gzip CSS | 1,974 B | 4,321 B |
| JS / CSS budgets | 153,600 / 20,480 B | Both pass |
| Lighthouse performance | 89 | 91 |
| Automated accessibility / best practices | 100 / 100 | 100 / 100 |
| FCP / LCP / interactive | 3,014.667 ms | 2,854.072 ms |
| Speed index | 2,613 ms | 2,610 ms |
| Total blocking time | 0 ms | 0 ms |
| Cumulative layout shift | 0 | 0 |
| Lighthouse-reported network bytes | 108,032 B | 98,106 B |
| Run warnings | none | none |

The initial unsplit redesign measured **87** performance / **3,211.330 ms**
FCP/LCP, with a browser suite running concurrently. It is retained as provisional,
not a fair isolated comparison. Deferring teaching code until a start gesture
reduced initial navigation payload; the PWA still precaches the public chunks.
Before and final after were run without parallel browser suites. These remain
independent one-run laboratory observations on a non-isolated host, not a proved
statistical speedup, field percentile, physical phone or deployed-host result.
The 3 ms speed-index difference is not evidence of a meaningful improvement.

Exact settings, asset hashes and all three observations:
[UI_PERFORMANCE_EVIDENCE.json](UI_PERFORMANCE_EVIDENCE.json). Full raw reports:
`artifacts/ui/baseline/`, `artifacts/ui/after/` and `e2e/performance-results/`.

### Other checks and reproduction

`npm run release` passed lint, typecheck, **178 tests in 14 files**, content/audio,
build, bundle and release checks; Python discovery and ECB/resources modules:
**57 + 10 = 67 passed**. All current copy/audio remains agent-checked, never
human-reviewed. New chrome copy has explicit bilingual back-translations and
file/leaf hashes in UI_CONTENT_QA.json and review-status.json. No dependencies,
engine/reducer/playback-hook/data or narrated text/assets changed.

```sh
npm run release
npm run test:browser -- --workers=3
npm run screenshots:contact
npm run check:performance
```

Real assistive technology, physical low-end phones, native browser zoom, Hindi
native review, listening, pilot outcomes and production hosting remain unmeasured.
The remaining historical sections retain their original measured evidence.

## Final integration rerun (2026-10-03)

After the final audio/gate integration at `2390e00`, the production build and
browser suite were rerun: **6 passed, 2 explicit audio skips in 41.0s**. The
manifest is **57/58, complete:false**, not the earlier in-progress snapshot.
`hi:DRAWDOWN_5` is parked after bounded synthesis/quantity-check failure.
Journey playback deliberately rejects the incomplete manifest; no real
packaged Listen/offline-clip pass is claimed. Unit tests include genuinely
reviewed-status acceptance and draft/unsafe/stale/corrupt/failed rejection.

Final bundle: **109,224 gzip JS bytes**, **1,974 gzip CSS bytes**. Final local
Lighthouse run (same explicit 360×640 / 400kbps down+up / 400ms / 4× CPU profile)
at `2026-10-03T14:13:46.386Z`: **89 performance / 100 automated accessibility /
100 best practices**, FCP/LCP/interactive **2,987.057ms**, speed index **2,587ms**,
TBT **0ms**, CLS **0**, reported network bytes **108,032**, no run warnings.
This is not an optimization speedup claim; independent one-run results vary.
TTS was no longer generating during this rerun, but the host was not isolated.

Final main asset: `index-BrO9AhIS.js`, 333,119 raw / 97,949 gzip bytes,
SHA256 `48906ce4253f460659d5bf46600035091d83f24faa983ee2a9c0b85be7d1914b`.
CSS/Workbox-window hashes match the earlier table. Full final settings/metrics/
asset identifiers are committed in [PERFORMANCE_EVIDENCE.json](PERFORMANCE_EVIDENCE.json).
Raw browser/Lighthouse reports remain ignored. All review/device/host limitations
below continue to apply. No actual deployed host was measured.

## Earlier product-track evidence scope (2026-10-03)

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
