# Evidence-led implementation status — 2026-10-03

Priority: protective impact → Bharat usability → guardrails/trust → technical
execution → feasibility. Status here describes actual work, not a claim of
human review, legal clearance, deployed release or pilot efficacy.

## Completed locally

- [x] Record current user authorization in AGENTS.md and ADR-0011. Local
  milestones committed; no pushes. Preserve historical audit/failed TTS evidence.
- [x] Pure deterministic engine, prediction-before/recheck-after, true pauses,
  user/forced exits, same-observation replay, correct settled chart endpoints,
  recovery maths and plain debrief. Regression/unit/browser evidence retained.
- [x] Replace runtime synthetic placeholders with two single-source ECB
  historical reference-observation windows; exact reuse quotes, hashes,
  offline prepare_episode reproduction, stats and absent-calendar-date limits.
  EIA/Refinitiv candidates remain unapproved outside runtime.
- [x] Four direct official protective links fetched/checked this session with
  URL/date/body hashes, neutral bilingual labels and external privacy disclosure.
- [x] Review every current Hindi leaf/back-translation; correct semantic drift,
  finish nine glossary terms, move NAV/nomination out of shipped scope.
  Hash-bound review and explicit **agent-checked, not native-reviewed** status.
- [x] Release enumerates every agent-checked string, blocks draft/planned/shipped
  TODO/placeholder/unverified/missing-or-stale audio, accepts genuinely reviewed
  fixtures cleanly. Agents never set production `reviewed`.
- [x] Diagnose near-silent greedy TTS outside provider with default English/Hindi
  examples; isolate decode-mode variable, benchmark four vs eight threads,
  record wall/signal/peak RSS. Keep pinned stack/weights/tokenizers offline.
- [x] Add fixed per-ID/text seeds, exact-input caching, all-codebook EOS,
  signal/duration/duplicate/quantity/CER gates, three-attempt bound, compact
  normalized mono Opus + schema-2 manifest. Pinned permissive ASR installed/cached.
- [x] Six actual Rohit/Divya auditions; Divya selected objectively. **No human
  listened.** CPU selected clips 12.50–62.45s, no measured >90s synthesis clip;
  optional unexecuted free-GPU notebook recipe retained.
- [x] Gesture-only fail-closed audio player, readable captions/fallback, glossary,
  text size, language attributes, focus/keyboard/reduced motion and local summary.
- [x] Production PWA shell and requested-audio cache policy, same-origin CSP,
  cache cleanup and no participant persistence. Real warmed-shell offline proof.
- [x] English/Hindi × two episodes at 360×640, no external runtime traffic,
  prediction/post-check memory, same-series contrast, keyboard/reflow/axe checks.
- [x] Mobile Lighthouse Slow-3G-shaped/4×-CPU measured; exact build hashes,
  bundle/audio sizes, clean-clone npm-ci/build and expected release failure recorded.
- [x] Package/notice inventory and every original human-TODO disposition recorded.

## Audio blocker resolved — technical gates green, review still agent-checked

- [x] **`hi:DRAWDOWN_5` audio:** resolved with evidence, not by weakening a gate.
  All three retained fixed-seed WAVs passed signal/EOS but Whisper-small's greedy
  decode could not spell the protected “पाँच”. A bounded, single-variable
  diagnostic (same WAVs, same seed, only the recogniser changed) showed
  Whisper-small's *own* acoustic model scores the correct nasalised sentence
  lowest, and the independently trained, pinned `openai/whisper-medium`
  (`abdf7c39ab9d0397620ccaea8974cc764cd0953e`, Apache-2.0) recovers `पाँच`/`5`
  on the real WAVs while keeping in-context non-nasal controls non-nasal. The
  build therefore corroborates a **quantity-only** mismatch on the *same* WAV:
  the Whisper-small CER threshold is unchanged, the raw transcript/CER/prior
  decision are retained, and no WAV was regenerated. No fuzzy number mapping,
  threshold relaxation, unlimited retries or silence substitution.
- [x] Full manifest is `complete:true`, **58/58** bilingual tracks. No track was
  regenerated; only the failed track's cache row was enriched with the retained
  corroboration evidence. Every track remains `agent-checked` with a loud
  release warning — never `reviewed`.
- [x] `npm run release` now **passes** the fail-closed gates (lint, typecheck,
  tests, content, build, bundle, release). The two real packaged-audio browser
  cases are no longer skipped and must be re-run to confirm playback/offline.
  No human listened; native review and publication decisions below are unchanged.

## Publication / human-only actions

- [ ] Working title and publication context owner decision.
- [ ] Actual English listening/native Hindi pronunciation/meaning review;
  no `reviewed` status without evidence.
- [ ] Resolve exact historical training-subset/voice/output attribution where
  official terms are still incomplete; don't revive EIA without separate rights.
- [ ] Real assistive-technology/physical low-end-device/native-zoom review.
- [ ] Choose/authenticate static preview host and inspect HTTPS/CSP/logging;
  no authenticated CLI was available, no preview/deployment occurred.
- [ ] Actual-setting pilot consent/contact/recruitment/external-note retention;
  no participants or efficacy results fabricated.

Evidence and exact commands/results: [FINISH_REPORT](FINISH_REPORT.md),
[AUDIO_BUILD](AUDIO_BUILD.md), [TODO_DISPOSITION](TODO_DISPOSITION.md),
[RELEASE_WARNINGS](RELEASE_WARNINGS.md), [TTS_DIAGNOSTICS](TTS_DIAGNOSTICS.md).
Technical gates now pass, but that is not a claim of human/native review, legal
clearance, deployment or pilot efficacy; those remain the human actions above.
