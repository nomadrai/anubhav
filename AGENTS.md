# Agent instructions

This repository is Phase 0 for an offline-capable, investor-protection learning app. A first-time or retail learner experiences virtual-money leverage and volatility through a neutral, bilingual journey; it never gives investment advice or presents real instruments. The product name has one source of truth: `src/config/app.ts`.

## Priority order
- P1 protective impact: prediction before/recheck after, same-path leverage contrast, plain-language debrief and recovery maths.
- P2 Bharat-first usability: Hindi + English, captions/audio contract, low bandwidth, large accessible controls.
- P3 guardrails and trust: honest uncertainty, privacy, no promotion.
- P4 technical execution: deterministic pure engine, checks, offline/PWA and reproducible audio in later phases.
- P5 feasibility: clean engine/data/content/UI boundaries.

## Guardrail checklist
- [ ] No buy/sell/hold recommendations, predictions, targets, brands, brokers, monetisation or profit gamification.
- [ ] No real instrument names in UI/audio; period stays hidden until reveal; one episode is not a forecast.
- [ ] No accounts, cookies, financial/personal storage, analytics, telemetry, SMS/contacts or runtime external requests.
- [ ] Only verified resources render; unverified resources remain `TODO(human)` and blocked by release.
- [ ] Hindi remains `draft` until native-speaker review; every user string comes from content files.
- [ ] Do not claim simulation, charts, audio playback, offline behavior or pilot UI before implemented.
- [ ] Do not fabricate facts, dates, sources, licences or performance; use `TODO(human)`.

## Conventions
Use strict TypeScript, React reducer state, plain JSON i18n, and a pure no-I/O engine. Keep content, data and config separate. Use the seeded `mulberry32` path only for synthetic deterministic input. Do not add dependencies without recording licence/purpose in `docs/THIRD_PARTY.md` and the decision in `docs/DECISIONS.md`. Read `README.md` and the relevant `docs/` file before changing behavior or copy.

## Commands
`npm install`; `npm run dev`; `npm run lint`; `npm run typecheck`; `npm run test`; `npm run check:content`; `npm run build`; `npm run check:bundle`; `npm run release`; `python3 scripts/prepare_episode.py --help`; `python3 scripts/generate_audio.py --help`.

## Definition of Done
Run and report lint, typecheck, tests, content check, and build (plus applicable bundle/release checks). Update relevant docs/tests. Do not report unmeasured performance numbers. Release is expected to fail while Phase 0 placeholders, draft copy, TODOs, or unverified resources remain. Before release, obtain human sign-off for safety/Hindi copy, accessibility, sources/licences, CSP and pilot consent.
