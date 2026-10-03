# Agent instructions

This repository implements an offline-capable, investor-protection learning app. A first-time or retail learner experiences virtual-money leverage and volatility through a neutral, bilingual journey; it never gives investment advice or presents real instruments. The product name has one source of truth: `src/config/app.ts`.

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
- [ ] Content status progresses `draft` → `agent-checked` → `reviewed`. Agents may set `agent-checked` only after an evidenced QA/back-translation pass, never `reviewed`. Every user string comes from content files.
- [ ] Do not claim simulation, charts, audio playback, offline behavior or pilot UI before implemented.
- [ ] Do not fabricate facts, dates, sources, licences or performance; use `TODO(human)`.

## Conventions
Use strict TypeScript, React reducer state, plain JSON i18n, and a pure no-I/O engine. Keep content, data and config separate. Use the seeded `mulberry32` path only for synthetic deterministic input. Do not add dependencies without recording licence/purpose in `docs/THIRD_PARTY.md` and the decision in `docs/DECISIONS.md`. Read `README.md` and the relevant `docs/` file before changing behavior or copy.

## Commands
`npm install`; `npm run dev`; `npm run lint`; `npm run typecheck`; `npm run test`; `npm run check:content`; `npm run build`; `npm run check:bundle`; `npm run release`; `python3 scripts/prepare_episode.py --help`; `python3 scripts/generate_audio.py --help`.

## Definition of Done
Run and report lint, typecheck, tests, content check, and build (plus applicable bundle/release checks). Update relevant docs/tests. Do not report unmeasured performance numbers. Release blocks on shipped placeholders, draft copy, unresolved release-blocking TODOs, missing audio, or unverified resources. `agent-checked` content passes only with a loud warning listing every such string; `reviewed` content passes cleanly. Never claim human listening/native-speaker review or unmeasured accessibility/performance.

## Finish-session authorization (2026-10-03)

The user explicitly revised the earlier human-only workflow:
- Hindi native-speaker review no longer blocks implementation or an agent-checked preview. Keep the lack of native review visible in README, limitations, and the UI; never set `reviewed` as an agent.
- Resolve `TODO(human)` work when evidence permits; retain unverifiable items with an actionable final disposition. Do not merely delete blockers to get a green gate.
- Resources may be agent-verified after fetching the exact official page this session, confirming its label, and recording URL/date/evidence in `docs/RESOURCE_CHECKS.md`. No numbers/procedures from memory.
- Public artifact downloads and local dev/TTS package installs are authorized. Existing Hugging Face authentication may be used read-only; never print, copy, log, or commit credentials.
- Commit milestones on the current branch; never push. An already-authenticated static-host CLI may deploy a preview only. No new accounts, payments, or production-domain deploys.
- TTS voice selection may use objective signal/end-token/ASR gates, labeled automated with no listening review. Cache and quality-check generated speech; never substitute silence for speech.
- Predictions and pilot answers remain in-memory only (local to the journey), not browser-persisted. Only language/text-size preferences may persist.
- Park blockers and continue independent work. Batch remaining user actions/questions at the end. Real-data rights must be explicit; speculative licences, data, causal explanations, and measurements remain prohibited.

All other guardrails above remain unchanged. These permissions do not establish publisher rights, actual listening, native fluency, participant consent, or pilot efficacy.
