# Investor-protection learning scaffold

This repository is documentation-first Phase 0 for a working-title investor-protection web app. The product name is intentionally not repeated here: the only product-name constant is `src/config/app.ts`; documentation and new copy use **the app**.

## What Phase 0 is

Phase 0 defines a bilingual, clickable scaffold for learning and reflection. It includes the contracts for:

- English-first, draft-Hindi content and a language toggle;
- a deterministic seeded `mulberry32` geometric synthetic path;
- engine API stubs and a CSV-preparation CLI contract;
- content, bundle, and release checks;
- a no-sound audio CLI stub.

The scaffold is **not** a trading simulator, adviser, charting product, broker, market-data product, or audio player. It has no actual simulation, charts, audio playback, offline support, or pilot UI beyond the scaffold. See [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md).

## Screen contract

A clickable stub may move through these screens in order:

`language → intro → setup → prediction → run → result → replay → reveal → debrief → postcheck → nextsteps`

`pilot=1` is a separate local summary route/state for the small pilot scaffold. “Run”, “reveal”, and result controls must be visibly labeled as placeholders until their underlying behavior is implemented. The period stays hidden until reveal. No screen recommends an instrument, brand, trade, or allocation.

## Safety boundary

There are no recommendations, brands, real instruments, monetisation, profit gamification, accounts, cookies, financial storage, or external runtime telemetry. Resource pointers are shown only after human verification; false or unverified pointers remain hidden. Production must use a restrictive CSP with `connect-src 'self'`. Read [`docs/GUARDRAILS.md`](docs/GUARDRAILS.md) before adding UI or content.

## Intended stack and checks

The fixed stack is Vite + React + strict TypeScript + Tailwind + Vitest + ESLint + Prettier + `vite-plugin-pwa`, with Python 3.10+ scripts. The repository now has a clickable bilingual journey scaffold, typed engine contracts, deterministic path generator, content/release/bundle checks, and preparation/audio CLI stubs. The simulation engine, charts, audio playback, PWA registration, real episodes, and polished pilot workflow remain unimplemented. The commands below are the local checks. Phase 0 has been run with `python3` (the checkout has no `python` executable):

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

`release` is deliberately expected to fail while the placeholder episode, draft Hindi content, TODOs, or unverified candidate resources remain. Do not turn that failure into a green check by weakening the gate. `check:content` warns about the not-yet-generated audio manifest in Phase 0. The preparation-script contract is documented in [`scripts/README.md`](scripts/README.md) and [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md); the audio stub contract is documented in [`docs/AUDIO_PIPELINE.md`](docs/AUDIO_PIPELINE.md).

## Documentation map

- [`docs/PRODUCT.md`](docs/PRODUCT.md) — audience, outcome, and Phase 0 acceptance boundary.
- [`docs/GUARDRAILS.md`](docs/GUARDRAILS.md) — prohibited claims and release safety rules.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — layers, routes, data flow, and Mermaid diagram.
- [`docs/SIMULATION_SPEC.md`](docs/SIMULATION_SPEC.md) — future deterministic math and API contracts.
- [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md) — bilingual writing, glossary, and analogy drafts.
- [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md) — candidate source register and CSV preparation contract.
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

No command has been run in this task. Declared dependencies and source/configuration files exist, but installed package metadata, model/dataset licences, and performance measurements have not been verified here. Use `TODO(human)` for facts requiring human evidence; never fill a gap with invented data, holidays, results, or citations.
