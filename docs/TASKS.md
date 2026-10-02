# Phased task plan

Priority meanings: **P1 impact** = directly improves learner safety/outcome; **P2 Bharat** = bilingual/local-context reach; **P3 trust** = evidence, privacy, accessibility, and honest claims; **P4 tech** = maintainability and implementation quality; **P5 feasibility** = smallest practical delivery step. Each task has a primary owner: **agent** for implementation support, **human** for judgment/sign-off.

## Phase 1 — Safe scaffold (P1/P4/P5)

- **P1 / agent:** implement the route-like screen stubs: language, intro, setup, prediction, run, result, replay, reveal, debrief, postcheck, nextsteps, and `pilot=1` local summary.
- **P1 / human:** approve safety wording, hidden-period behavior, and no-advice boundaries.
- **P4 / agent:** add strict typed config with the sole app-name constant, content schema, and placeholder-state tests.
- **P3 / human:** run keyboard and screen-reader review at 360×640 and record evidence.

## Phase 2 — Bilingual content (P1/P2/P3)

- **P2 / agent:** implement English-first strings, separate spoken-number fields, draft-Hindi labels, and content-limit checks.
- **P2 / human:** review Hindi meaning, naturalness, cultural clarity, glossary, and analogies.
- **P1 / human:** approve the leverage, margin, forced-exit, and recovery explanations; reject recommendations or brands.

## Phase 3 — Deterministic engine plumbing (P1/P4)

- **P4 / agent:** implement and test `mulberry32`, geometric synthetic path, typed engine APIs, units/entry/close/equity math, intrabar low, warning-once, forced-exit simplification, recovery, and summary statistics.
- **P1 / human:** review the margin rule and 10×/7% worked example; confirm user-facing caveats.
- **P5 / agent:** implement the CSV CLI validation contract with crash, choppy, and paired rally/shakeout fixtures.
- **P3 / human:** verify every source, licence, date, calendar, and resource pointer before any is visible.

## Phase 4 — Quality and packaging (P3/P4/P5)

- **P4 / agent:** add Vitest, ESLint, Prettier, content, bundle, and release checks; keep release red for placeholders/unverified resources.
- **P3 / agent:** add CSP and same-origin request assertions; document storage keys and generated-artifact ignore rules.
- **P5 / agent:** implement the silent audio CLI only; no model, playback, or generated audio claim.
- **P3 / human:** inspect package metadata, transitive licences, accessibility matrix, performance measurements, and privacy behavior.

## Phase 5 — Evidence-led pilot readiness (P1/P2/P3)

- **P1 / human:** approve consent, information sheet, withdrawal, retention, and facilitator process for 5–10 people.
- **P2 / human:** conduct the small manual pre/post formative pilot; keep raw responses outside the repository.
- **P3 / agent:** produce a local summary scaffold that reports sample limits and missingness without causal claims.
- **P1 / human:** decide whether evidence justifies the next phase; no pilot result may become a recommendation or efficacy claim.
