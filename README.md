# Investor-protection learning scaffold

This repository is documentation-first Phase 0 plus Phase 1 engine/data plumbing and Phase 2 journey integration for a working-title investor-protection web app. The product name is intentionally not repeated here: the only product-name constant is `src/config/app.ts`; documentation and new copy use **the app**.

## Current status: Phase 2 real journey integration

Phase 2 connects the bilingual journey to the Phase 1 teaching engine:

- deterministic playback pauses at decision points and warnings, with a user exit action;
- accessible price, equity, and teaching-margin views with text labels and reduced-motion CSS;
- result, same-path replay contrast, reveal-after-prediction, debrief, and post-check screens;
- verified-resource filtering that keeps unverified resource pointers hidden;
- synthetic crash/choppy fixtures remain clearly marked `isPlaceholder: true` and are not market data;
- candidate data acquisition and provenance remain separate from checked-in runtime episodes until source, licence, and safety review are complete.

The journey now runs the checked-in synthetic teaching path. Production audio playback, PWA/offline behavior, and verified real episodes remain later work. Synthetic paths are not market data or forecasts. See [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md).

## Screen contract

A clickable stub may move through these screens in order:

`language → intro → setup → prediction → run → result → replay → reveal → debrief → postcheck → nextsteps`

`pilot=1` is a separate local summary route/state for the small pilot scaffold. The period stays hidden until reveal; the run, replay, and result use synthetic teaching data and do not make market claims. No screen recommends an instrument, brand, trade, or allocation.

## Safety boundary

There are no recommendations, brands, real instruments, monetisation, profit gamification, accounts, cookies, financial storage, or external runtime telemetry. Resource pointers are shown only after human verification; false or unverified pointers remain hidden. Production must use a restrictive CSP with `connect-src 'self'`. Read [`docs/GUARDRAILS.md`](docs/GUARDRAILS.md) before adding UI or content.

## Intended stack and checks

The fixed stack is Vite + React + strict TypeScript + Tailwind + Vitest + ESLint + Prettier + `vite-plugin-pwa`, with Python 3.10+ scripts. The repository now has a bilingual journey, a deterministic simulation engine, runtime episode validation, synthetic episode fixtures, content/release/bundle checks, and preparation/audio CLI stubs. Audio playback, PWA/offline behavior, verified real episodes, and polished pilot workflow remain unimplemented. The commands below are the local checks. Python checks use `python3` or `.venv/bin/python` (this checkout has no `python` executable):

```sh
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run check:content
npm run build
npm run check:bundle
npm run release
```

`release` is deliberately expected to fail while the placeholder episode, draft Hindi content, TODOs, or unverified candidate resources remain. Do not turn that failure into a green check by weakening the gate. `check:content` warns about the not-yet-generated audio manifest because audio remains a later phase. The preparation-script contract is documented in [`scripts/README.md`](scripts/README.md) and [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md); the audio stub contract is documented in [`docs/AUDIO_PIPELINE.md`](docs/AUDIO_PIPELINE.md).

## Documentation map

- [`docs/PRODUCT.md`](docs/PRODUCT.md) — audience, outcome, and phase boundaries.
- [`docs/GUARDRAILS.md`](docs/GUARDRAILS.md) — prohibited claims and release safety rules.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — layers, routes, data flow, and Mermaid diagram.
- [`docs/SIMULATION_SPEC.md`](docs/SIMULATION_SPEC.md) — future deterministic math and API contracts.
- [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md) — bilingual writing, glossary, and analogy drafts.
- [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md) — candidate source register, row/date evidence, and CSV preparation contract.
- [`docs/RESOURCE_REVIEW.md`](docs/RESOURCE_REVIEW.md) — automated protective-resource checks and human approval boundary.
- [`docs/AUDIO_PIPELINE.md`](docs/AUDIO_PIPELINE.md) — silent stub and future audio boundary.
- [`docs/ACCESSIBILITY_AND_PERFORMANCE.md`](docs/ACCESSIBILITY_AND_PERFORMANCE.md) — targets and test matrix.
- [`docs/PRIVACY.md`](docs/PRIVACY.md) — permitted storage and network behavior.
- [`docs/PILOT.md`](docs/PILOT.md) — consent, manual measures, and sample limits.
- [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md) — explicit non-claims.
- [`docs/THIRD_PARTY.md`](docs/THIRD_PARTY.md) — dependency and licence verification.
- [`docs/WALKTHROUGH.md`](docs/WALKTHROUGH.md) — honest 3–5 minute walkthrough.
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — ADRs and unresolved choices.
- [`docs/TASKS.md`](docs/TASKS.md) — Phases 1–5, priorities, and ownership.

## Truthfulness rule

The Phase 2 checks are run locally; see the task report for exact outcomes. Installed package metadata was inspected for the direct dependency table, but human licence/notice review, model/dataset choices, real-episode selection, and performance measurements remain open. Use `TODO(human)` for facts requiring human evidence; never fill a gap with invented data, holidays, results, or citations.
