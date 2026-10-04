# Investor-protection learning app

An English/Hindi, virtual-money lesson about leverage, loss, forced exit and
recovery—not an investment simulator, recommendation, forecast or trading
product. The product name has one source of truth: `src/config/app.ts`.

## Current implementation

- Prediction **before** the path; pause/continue/exit at teaching events;
  deterministic virtual-money engine and plain charts/meters.
- Result → **same-input-path** unleveraged comparison → hidden-period reveal
  → plain-language debrief/recovery maths → post-check → protective resources.
- Two real, single-source historical windows, replacing shipped synthetic
  placeholders. ECB reference observations were chosen for explicit reuse
  terms; they are **not stock prices, executable quotes or an Indian-market
  sample**. Exact terms, counts, gaps, hashes and selection limitations:
  [DATA_SOURCES](docs/DATA_SOURCES.md), [DATA_REVIEW](docs/DATA_REVIEW.md).
- Every shipped Hindi string has an agent QA/back-translation record. **No
  native Hindi speaker reviewed it.** `agent-checked` is not `reviewed`.
  [CONTENT_QA](docs/CONTENT_QA.md) records corrections and remaining limits.
- Local-only, fixed-seed sampled TTS with cached inputs, natural-EOS/signal/
  duration/duplicate/ASR-CER gates and bounded retries. Original greedy silence
  was reproduced and isolated: [TTS_DIAGNOSTICS](docs/TTS_DIAGNOSTICS.md).
  The complete 58/58 bilingual set now passes; the last Hindi quantity-only ASR
  mismatch was corroborated by a second pinned recogniser on the same WAV
  without relaxing the CER gate. Actual produced assets and measurements—not an
  assumed full set—are recorded in [AUDIO_BUILD](docs/AUDIO_BUILD.md).
- Desktop two-pane reading/interaction layout with pinned actions; single-column
  mobile layout with a sticky action area. The former A+ text size is always used;
  lesson-by-lesson debrief and glossary explanations in the interaction pane.
- Left-pane Listen controls with real playback progress, readable text fallback,
  glossary/captions, same-origin PWA caching and an in-memory pilot summary.
  Optional auto-speak defaults OFF; its local setting enables queued stored narration.
  Offline audio is **only previously cached audio**, not a promise that every
  clip is preinstalled. Auto-speak is opt-in; there is no remote TTS service.
- Four official protective links checked against official pages this session:
  [RESOURCE_CHECKS](docs/RESOURCE_CHECKS.md). Links leave this app; destination
  privacy rules apply. Unverified pointers remain hidden.

**No human listened to the generated voices.** Automated Divya selection and
CER checks do not prove natural pronunciation, comfort, or every word's
semantic fidelity. Text is authoritative. No pilot was conducted, no participant
results exist, and no efficacy claim is made. See [LIMITATIONS](docs/LIMITATIONS.md)
and the exact unresolved actions in [TODO_DISPOSITION](docs/TODO_DISPOSITION.md).

## Run and check

Use the Node/npm versions recorded in [DEPLOYMENT](docs/DEPLOYMENT.md) and the
committed lockfile. Python 3.10+ and PyYAML are needed for data preparation/tests,
not to use or deploy the already-built web app. TTS has a separate external venv.

```sh
npm ci
npm run dev
# Production checks:
npm run lint
npm run typecheck
npm run test
npm run check:content
npm run build
npm run check:bundle
npm run release
# Build-time Python regression tests:
python3 -m unittest discover -s scripts/tests
python3 -m unittest scripts.data_ecb_test scripts.data_resources_test
```

The browser journey is:
`language → intro → setup → prediction → run → result → replay → reveal → debrief → postcheck → nextsteps`.
Pilot mode (`?pilot=1`) offers a local summary, **not a participant database**.
A refresh/reset discards answers; no account or research submission is created.
The short footer refers to in-app choices/answers; **About this app** contains the
full preferences/cache/offline, absent native/listening review and ordinary host-
log disclosures. No browser-reported connectivity is presented as verified.

```sh
npm run test:layout       # 10 viewports × 2 languages × fixed A+ size × 11 steps
npm run screenshots:contact  # artifacts/ui/contact-sheet.html and per-case PNG boards
```

Screenshots/reports under `artifacts/ui/` are local, gitignored automated evidence.
The first teaching module is loaded after language choice; the PWA still caches
all public app-shell chunks. No learner state is serialized for that loading.

The revised gate blocks draft content, runtime placeholders, unverified
resources, stale/missing audio and unsafe content. It allows `agent-checked`
with **loud warnings listing every such string**, and accepts genuinely
human-`reviewed` content without that warning. Agents never assign `reviewed`.
Do not bypass an audio/content failure to obtain a green release. A passing
technical gate is not legal advice, human listening approval or pilot consent.

## Privacy and safety

No buy/sell/hold calls, real instrument names in UI/audio, promotion, brands of
financial providers, monetisation, profit gamification, accounts, cookies,
analytics, personal/financial persistence or external runtime APIs. Only
language and auto-speak preferences may persist. The retired text-size key is removed.
The Chat icon opens a disclosed learning chat backed by 212 original bilingual KB entries.
Submitted general questions and language go through `/api/chat` to Groq; advice requests
are refused locally and again on the server. The model never receives journey answers.
Missing/failed model calls use library text. See [PRIVACY](docs/PRIVACY.md) and
[DEPLOYMENT](docs/DEPLOYMENT.md); set `GROQ_API_KEY` only in the server environment.
The one on/off flag is `CHAT_ENABLED` in `shared/chat-config.mjs`. Static assets/audio are
same-origin; source/model downloads happen **only during explicit build-time
preparation**, never in the participant app. See [PRIVACY](docs/PRIVACY.md) and
[GUARDRAILS](docs/GUARDRAILS.md). Real provenance is in the client bundle for
transparency, not encrypted against deliberate developer-tool inspection.

## Evidence and operations

- [WALKTHROUGH](docs/WALKTHROUGH.md): actual learner flow.
- [ACCESSIBILITY_AND_PERFORMANCE](docs/ACCESSIBILITY_AND_PERFORMANCE.md): measured
  browser/mobile/Lighthouse evidence and explicitly untested assistive technology.
- [DEPLOYMENT](docs/DEPLOYMENT.md): clean-checkout build, static hosting, CSP,
  preview-deployment disposition. No push or production deployment is implied.
- [AUDIO_PIPELINE](docs/AUDIO_PIPELINE.md), [scripts README](scripts/README.md):
  offline reproducible speech/data tools; weights/raw WAVs never ship.
- [THIRD_PARTY](docs/THIRD_PARTY.md), [runtime notices](public/THIRD_PARTY_NOTICES.txt):
  exact packages, model pins, data terms, attribution and upstream uncertainty.
- [TASKS](docs/TASKS.md), [DECISIONS](docs/DECISIONS.md),
  [TODO_DISPOSITION](docs/TODO_DISPOSITION.md): completed scope, deviations and
  human-only decisions. Historical audits remain preserved, not rewritten as
  evidence of checks they did not perform.
