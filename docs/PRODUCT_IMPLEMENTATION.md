# Product implementation and integration evidence

T3 product/browser track, resumed 2026-10-03 after interruption. No commits, deployment, new board, or delegation. Parent-owned overview/decision/licence files are intentionally untouched.

## Implemented boundaries

- Reducer requires the prediction before playback, an actual engine result before leaving Run, and both reflection answers before NextSteps. Restart and reload clear the entire journey, including prediction, post-check and local summary. Only `learning.language` and `learning.text-size` may persist in localStorage; sessionStorage/cookies are unused.
- Setup selects neutral Episode 1/2 labels. Dates and neutral publisher attribution render only at Reveal. Raw provenance URLs/source names never enter the rendered DOM. Historical values are not presented as prices of a named financial instrument.
- One-times replay uses the identical full episode and starting amount; an early user exit does not shorten the comparison. The explanation explicitly discloses differing holding times. The final displayed comparison point is settled equity, not the raw below-maintenance close value. A closed line ends; it does not recover later.
- Both decision pauses and a manual pause stop the playback timer. Narration is independently controlled; it never starts from a screen transition, timer or language switch.
- Schema 2 audio is loaded only after Listen. Complete/agent-checked manifest, exact text/content hash, asset hash/byte size, passed/EOS quality and a same-origin content-addressed `.opus` path are required. Missing/incomplete/stale/corrupt/rejected playback has a visible text fallback. One player prevents overlap; leaving a narration/language or closing its glossary term cancels/stops it. Pause/resume/replay/mute/0.8× speed are available.
- Captions, glossary text and chart data tables do not depend on audio. Native details/summary supplies keyboard-accessible disclosure. Focus moves to the current heading. Reading preferences include language and 125% base text size. Controls are at least 48px high; chart/table/choice CSS reflows on narrow displays.
- PWA precaches the static shell, never audio. Same-origin manifest and requested clips are cached on demand, with bounded expiration and version-scoped cache cleanup. Only a warmed shell can reload offline; uncached audio/official links still need a connection. Static caches and Workbox cache-expiration metadata contain asset URLs, not learner answers.
- Production CSP is injected into HTML and configured for preview plus `public/_headers`: self-only scripts/connect/fonts/worker/manifest, same-origin/blob media, no objects/forms; inline styles remain allowed for React meter widths. Header additionally blocks framing. A deployed host must actually honor `_headers` or provide equivalent headers.
- Verified protective-resource labels come directly from T1's bilingual resource records. Links are explicit external navigations with `noopener noreferrer` and visible privacy disclosure; no destination is fetched/embedded by the app.
- The local summary is not research collection or proof of learning. Clipboard copy is explicit and optional; no answers are persisted or sent.

## Commands and artifacts

```sh
npm run lint
npm run typecheck
npm test
npm run check:content
npm run build
npm run check:bundle
npm run test:browser
npm run check:performance
```

Browser commands use installed Chrome `/usr/bin/google-chrome`, overridable by `CHROME_PATH`. Build before browser/performance checks; they inspect `dist`, not the development server. Playwright starts/stops a preview on 4173. Lighthouse starts/stops its preview on 4174 and Chrome debugging port 9223. Generated browser reports/screenshots/traces live in `e2e/results/`; Lighthouse HTML/JSON/build hashes live in `e2e/performance-results/`. Those folders are ignored by `e2e/.gitignore` and excluded from the lint command; generated JavaScript traces must not be linted as project source.

`src/App.test.tsx`, `src/journey/journeyReducer.test.ts` and `src/audio/AudioManager.test.ts` cover reducer gating, actual episode lengths, memory-only state, pauses, full-path contrasts, settled final values, official labels, neutral reveal, and fail-closed audio. Audio unit-test bytes are deliberately invalid stand-ins for testing hashing/player lifecycle only, never release assets or speech evidence. The production browser test for real audio skips unless `dist/audio/manifest.json` is complete; it never substitutes fixture audio.

### Final verification snapshot

- `npm run lint`: passed, no errors/warnings.
- `npm run typecheck`: passed.
- `npm test`: **146 passed across 12 files**, including the concurrent T2 checker tests. Before those checker tests were integrated, the scoped `npx vitest run src` passed **72 tests across 9 files**.
- `npm run build`: passed; production PWA generated with 13 shell precache entries. Audio is excluded from precache. Vite emits an advisory about the existing extensionless config import, not a build error.
- `npm run check:bundle`: passed; JavaScript 109,212 gzip bytes, CSS 1,974 gzip bytes.
- `npm run test:browser`: **6 passed / 2 explicitly skipped** (real en/hi packaged audio) in 52.2 seconds. Four 360×640 full-language/episode combinations plus warmed-offline/fallback and keyboard/zoom/preferences tests passed. The audited `dist` contained 17 of 58 generated tracks and correctly declared `complete:false`.
- `npm run check:performance`: passed with saved reports; mobile slow-network/4× CPU Lighthouse 88 performance / 100 automated accessibility / 100 best practices; LCP 3,134.171 ms. These are one-run local measurements, not field/compliance claims.
- `npm run check:content`: **blocked**, solely by the incomplete/missing audio set in the observed snapshot. Both frozen features dictionaries were enumerated as agent-checked with the intended warnings, not rejected or human-reviewed.
- `npm run check:release`: **blocked**, solely by incomplete/missing audio in the observed snapshot (public manifest had 24/58 tracks, `complete:false`; generation was still running). The combined `npm run release` was not called because the individual mandatory content/release gates already failed for the documented reason. No gate was weakened.
- `git diff --check`: passed. No commit or deployment performed by T3.

See [ACCESSIBILITY_AND_PERFORMANCE.md](ACCESSIBILITY_AND_PERFORMANCE.md) for measurement settings, asset hashes and honest limitations. Full release/audio gates remain parent/T2-owned; counts above identify this snapshot, not the eventual audio-complete build.

## Dependencies for parent consolidation

Read from installed package metadata on 2026-10-03; added by the interrupted T3 track and retained, with exact versions in package/lock. These are **dev-only**, absent from the runtime dependency graph. No further dependency was installed during this resume.

| Package | Installed version | Declared licence | Purpose |
|---|---|---|---|
| `@playwright/test` | 1.63.0 | Apache-2.0 | Reproducible production-Chrome journey/offline/keyboard tests and browser launch for measurement |
| `@axe-core/playwright` | 4.13.0 | MPL-2.0 | Automated per-screen accessibility rule checks, not screen-reader certification |
| `lighthouse` | 13.5.0 | Apache-2.0 | Local mobile navigation audit with explicitly recorded network/CPU settings |

`chrome-launcher` 1.2.2 / Apache-2.0 is installed transitively by Lighthouse but not imported by our runner; Chrome is launched through Playwright. Existing React/Vite/PWA/Workbox dependency licences remain in the parent's register. Chrome is the user's already installed browser, not a new runtime dependency. Parent should consolidate these rows into `THIRD_PARTY.md` and the tooling decision into `DECISIONS.md` before the milestone commit.

## Features dictionary QA — agent checked, not human reviewed

The following **62 leaf strings per language (124 total)** are frozen for T2 integration. Both dictionaries have `_meta.status: agent-checked`. No string is marked `reviewed`. This was a text-only automated semantic/back-translation pass, not native-speaker review, speech listening, user research or accessibility certification. The visible footer states those missing reviews.

Exact UTF-8 file SHA-256 at freeze:

- `src/content/en/features.json`: `de4c4f7a60bf1377cc6ab41c85a12cb888d36777adf1f8ea7ed93a201c3db0e9`
- `src/content/hi/features.json`: `f853aab57de99cc154cb5829c63999993ee3b3271679cc129dd5cd6753b40075`

Review method: read both dictionaries in full; independently render the Hindi meaning back into English below; compare each meaning to the English intent, negation, optionality, scope and placeholders. All 62 keys match. `{number}` is preserved exactly in both. Corrections during this pass: the hidden item is the **period**, not a promise to disclose instrument identity; offline opening requires already cached files; connection status is explicitly the browser's report (it is not a verified network probe). No new strings are scheduled after this freeze.

| Key(s) | Hindi back-translation / semantic check |
|---|---|
| preferences | Reading options. |
| language | Language. |
| textSize | Size of letters. |
| standardText / largeText | Normal / larger. |
| skip | Go to the current step. |
| reviewNotice | An automated agent checked English and Hindi, not a Hindi native speaker. Even if voice is available, no person has listened to check it. Both missing-review limits preserved. |
| privacy | Answers remain only in this open page; reopening or restarting removes them. Only language and letter size are saved. No account or tracking. No all-storage denial. |
| offline | Once this browser caches the app's files it can reopen without internet. Only already cached voice portions work offline; official links need internet. Conditional scope preserved. |
| online / disconnected | According to the browser, internet is available / off; available cached files are used. No guarantee of connectivity. |
| audio | Listening to voice is optional. |
| listen | Listen. |
| pauseAudio / resumeAudio | Stop/pause the voice / continue the voice. Distinct from stopping the practice path. |
| replayAudio | Listen to the voice again. |
| muteAudio / unmuteAudio | Make the voice mute / remove muting. |
| audioSpeed / normalSpeed / slowSpeed | Voice speed / normal / slow. |
| audioIdle | Press Listen to load this voice portion; its text stays visible. Explicit gesture and text availability preserved. |
| audioLoading / audioPlaying / audioPaused / audioEnded | Voice portion is loading / playing / paused / finished. No unsupported success claim on failure. |
| audioUnavailable | This voice portion could not play. Read the text; voice is unnecessary to continue. |
| episodeChoice / episode | Choose a hidden example / example `{number}`. No source or dates leaked. |
| historical | Path of recorded values; its period is hidden until reveal. Only virtual money and explanatory rules. |
| introBody | Practise with virtual money, not a real transaction. Choose an expectation, see the path, then compare the same path at less exposure. |
| setupTitle / setupBody | Choose your virtual practice. More exposure changes each movement's effect on virtual money; these options are not advice. |
| predictionBody | Choose an expectation before starting the path. After the contrast you may reconsider; this is not an exam or prediction of the future. |
| postQuestion | Would you like borrowed exposure explained more clearly? Does not ask for an investment action. |
| settlement | When the explanatory rule closes a position its line ends at the settled amount. Later changes cannot recover that closed position's money. |
| comparisonLimit | Both practices share recorded path and starting amount; one-times runs to the end. If you exited early, duration differs too; this does not label a choice better. |
| pausePath / resumePath / pausedPath | Stop/pause the path / continue the path / the path is paused; take time to think. |
| glossary / glossaryClose | Press a word for a simple meaning / close the meaning. Native disclosure currently provides closing; reserved label does not imply a separate button. |
| sourceNote | Full source and permission-to-reuse evidence are in project documentation. No actual financial instrument is named in this practice. |
| revealNeutral | These recorded values form a simple practice. The path alone does not explain why values changed; one example does not predict the next. |
| nextBody | An automated agent checked these official protective resources. They are not advice. A link leaves the app; destination privacy rules apply. |
| resourceFallback | If a link fails, connect to the internet and use the official organisation's site. Never share passwords, one-use codes or account details in reply to unsolicited messages. No invented phone/procedure. |
| noResources | No verified link is available in this version; read the explanations here rather than trusting an unchecked contact. |
| externalLink | External website opens in a new tab. |
| pilotOpen / pilotTitle | View this session's local summary / your reflection only on this page. |
| pilotBody | Your session summary is not collected research or evidence of learning. Copying is optional and puts text on this device's clipboard; reopening/restarting clears answers. |
| pilotBefore / pilotAfter | Before seeing the path / after seeing the contrast. Temporal order preserved. |
| pilotExplanation / pilotExposure / pilotOutcome | Want a clearer explanation? / exposure multiplier / how practice ended. |
| pilotCopy / pilotCopied / pilotCopyFailed | Copy local summary / copied to device clipboard / could not copy; read/select the summary here. Failure remains distinct from success. |
| pilotBack / pilotMissing | Back to resources / not answered. |
| restart | Start again and erase answers. |

### Explicit limitations / remaining integration work

- Parent/T2 owns the 58-track generation, full manifest integrity/ASR gate and content/release checks. Browser playback of the complete real set must be rerun after a fresh production build. A partial manifest must remain unavailable rather than be treated as successful complete audio.
- No human Hindi, speech-listening, screen-reader, physical-device or real-user study was performed. Automated axe and Lighthouse results do not establish WCAG conformance or learning efficacy.
- Browser-reported online status can be inaccurate. Chrome 149 resets `navigator.onLine` after a service-worker offline reload even while new requests fail. The offline test independently verifies an uncached request fails; it uses CDP `Network.overrideNetworkState` to additionally exercise the browser-report notice. No network probe is added to the app.
- Shell caching requires service-worker support and a successful first online cache fill; browser eviction/private mode can remove it. Audio is not bulk precached. External resources are not offline content.
