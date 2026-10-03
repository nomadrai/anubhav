# Architecture decision records

## ADR-0001 — Use one app-name constant

**Status:** accepted for Phase 0. **Decision:** keep the working title in exactly one constant at `src/config/app.ts`; docs and participant-facing copy use **the app**. **Reason:** prevent inconsistent naming and make a later rename auditable. **Consequence:** no other file may become a product-name source of truth.

## ADR-0002 — Synthetic deterministic path first

**Status:** accepted. **Decision:** use a seeded `mulberry32` geometric fixture for repeatable plumbing and tests. **Reason:** Phase 0/1 need repeatable input without fabricating market history. **Consequence:** fixtures require prominent synthetic labels and cannot support market claims.

## ADR-0003 — Hidden period until reveal

**Status:** accepted. **Decision:** the participant predicts before the period/reveal is shown. **Reason:** preserve a clear reflection sequence without implying forecasting validity. **Consequence:** route state and accessibility tree must not expose the hidden period early.

## ADR-0004 — Fail closed on release uncertainty

**Status:** accepted. **Decision:** draft copy, unverified resources, unknown licences, missing evidence, and unsafe configuration block release. **Reason:** trust and safety outrank a green demo. **Consequence:** `release` remains red while synthetic placeholders and draft/unverified content exist.

## ADR-0005 — No runtime external services

**Status:** accepted. **Decision:** only same-origin static asset requests are permitted at runtime. **Reason:** minimize privacy and availability risk. **Consequence:** no analytics, remote model, live source, or external font; production CSP must use `connect-src 'self'`.

## ADR-0006 — Audio remains a silent stub

**Status:** accepted. **Decision:** provide a schema-valid no-sound CLI contract and defer model/voice selection. **Reason:** licence, quality, GPU, and privacy evidence are not verified. **Consequence:** visible text is the only Phase 0 content route.

## ADR-0007 — Keep acquired candidates outside runtime

**Status:** accepted for Phase 2. **Decision:** downloaded episode candidates remain under `data/candidates/`, with raw/prepared hashes and provenance, until human rights, source, calendar, copy, and safety review is complete. Runtime imports only the checked-in synthetic fixtures. **Reason:** acquisition evidence must not be mistaken for approval or a market claim.

## ADR-0008 — Filter protective resources at render time

**Status:** accepted for Phase 2. **Decision:** resources render only when `verified` is true; automated HTTP success is recorded separately from human approval. **Reason:** a reachable page is not proof of relevance, accessibility, licensing, or suitability.

## ADR-0009 — Optional local-only bilingual TTS candidate

**Status:** accepted for Phase 3 implementation; release approval pending. **Decision:** use `ai4bharat/indic-parler-tts` as an optional build-time candidate for English/Hindi speech, requiring a caller-provided local checkpoint and immutable revision. The provider never downloads weights, makes runtime requests, or falls back to fake audio. **Reason:** the model card declares Apache-2.0 and multilingual English/Hindi support, while gated access, model/data terms, optional dependency licences, and native-speaker quality still require human review.

## Open decisions

- `TODO(human)`: review the working title in `src/config/app.ts` before participant-facing release; do not duplicate it in docs or copy.
- `TODO(human)`: review the implemented teaching rule and wording: for leverage greater than one, warning on close equity `≤ 1.5 × (0.25 × capital)` once; forced settlement uses intrabar low `≤ 0.25 × capital`, with warning before forced exit.
- `TODO(human)`: approve Hindi copy, analogies, accessibility evidence, source pointers, calendar policy, dependency licences, CSP, and pilot consent.
