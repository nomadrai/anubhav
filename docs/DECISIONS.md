# Architecture decision records

## ADR-0001 — Use one app-name constant

**Status:** accepted for Phase 0. **Decision:** keep the working title in exactly one constant at `src/config/app.ts`; docs and participant-facing copy use **the app**. **Reason:** prevent inconsistent naming and make a later rename auditable. **Consequence:** no other file may become a product-name source of truth.

## ADR-0002 — Synthetic deterministic path first

**Status:** accepted. **Decision:** use a seeded `mulberry32` geometric fixture for repeatable plumbing and tests. **Reason:** Phase 0 must teach the boundary without fabricating market history. **Consequence:** fixtures require prominent synthetic labels and cannot support market claims.

## ADR-0003 — Hidden period until reveal

**Status:** accepted. **Decision:** the participant predicts before the period/reveal is shown. **Reason:** preserve a clear reflection sequence without implying forecasting validity. **Consequence:** route state and accessibility tree must not expose the hidden period early.

## ADR-0004 — Fail closed on release uncertainty

**Status:** accepted. **Decision:** draft copy, unverified resources, unknown licences, missing evidence, and unsafe configuration block release. **Reason:** trust and safety outrank a green demo. **Consequence:** `release` is expected to fail in the empty Phase 0 repository.

## ADR-0005 — No runtime external services

**Status:** accepted. **Decision:** only same-origin static asset requests are permitted at runtime. **Reason:** minimize privacy and availability risk. **Consequence:** no analytics, remote model, live source, or external font; production CSP must use `connect-src 'self'`.

## ADR-0006 — Audio remains a silent stub

**Status:** accepted. **Decision:** provide a schema-valid no-sound CLI contract and defer model/voice selection. **Reason:** licence, quality, GPU, and privacy evidence are not verified. **Consequence:** visible text is the only Phase 0 content route.

## Open decisions

- `TODO(human)`: review the working title in `src/config/app.ts` before participant-facing release; do not duplicate it in docs or copy.
- `TODO(human)`: approve the maintenance-warning predicate and event ordering: `equityLow ≤ 1.5 × (0.25 × capital)` once before forced settlement.
- `TODO(human)`: approve Hindi copy, analogies, accessibility evidence, source pointers, calendar policy, dependency licences, CSP, and pilot consent.
