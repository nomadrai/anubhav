# App knowledge coverage and bilingual QA

## Scope and evidence boundary

`app.json` contains **70 original bilingual entries**, all `category: app`, IDs beginning `app-`, and status **agent-checked**, never `reviewed`. Each language has a short explanation, not a copied UI dictionary or repeated paragraph template. English, Devanagari Hindi, and common Hinglish query aliases support retrieval. `appears_in_steps` uses the exact names from `src/journey/steps.ts`; shared controls list their relevant journey contexts, not a fabricated Chat/Pilot step. `sources: []` is intentional: these are explanations of this app, not sourced investment rules.

**No native Hindi speaker reviewed these entries. No human listening, usability, assistive-technology, participant, or efficacy review is claimed.** Agent bilingual checking is not a release certification or publisher credential.

Inspected: `README.md`, `docs/CONTENT_GUIDE.md`, `docs/SIMULATION_SPEC.md`, `docs/DATA_SOURCES.md`, `docs/ACCESSIBILITY_AND_PERFORMANCE.md`; `src/content/{en,hi}/{ui,features,glossary}.json`, English debrief and narration; `src/JourneyExperience.tsx`; `src/screens/{LanguageEntry,Run,Debrief,PilotSummary}.tsx`; journey steps/reducer/preferences/playback; shell/header/About/audio/charts; simulation config and engine simulation/comparison. Thin screen re-exports delegate the actual implementation to `JourneyExperience.tsx`.

### Chat integration exception — authorized, not observed as implemented

At inspection, `src/components/StepHeader.tsx` still had the inert `TODO(chat)` handler, and README described the earlier no-network stub. **Entries `app-chat`, `app-chat-privacy`, `app-chat-limits`, plus Chat references in privacy/offline/language entries, describe the newly authorized integration contract**, not a claim that this content-only task implemented or tested Chat. Contract: browser → same-origin app server → Groq model; no question-text logging/storage; visible conversation memory-only; no personal/financial inputs; fallible explanations, no personal advice. Same-origin does **not** mean questions stay on-device. External provider retention and actual host configuration are not verified here. Integration must enforce and disclose this contract before claiming those behaviours. No provider policy, publisher identity, or credential is invented.

## All 11 actual journey steps: what and why

| Code step | Primary entry | Supporting IDs and purpose |
|---|---|---|
| `LanguageSelect` | `app-step-language` | `app-language`, `app-preferences`: choose readable language, not identity or a different result. |
| `Intro` | `app-step-intro` | `app-virtual-money`, `app-simulation-assumptions`, `app-privacy`: establish practice-only scope and predict/watch/compare/reflect sequence. |
| `Setup` | `app-step-setup` | `app-stake`, `app-capital`, `app-exposure`, `app-leverage`, `app-borrowed-amount`, `app-percentage-change`, `app-hidden-period`: choose episode/share/multiplier and understand the live summary. |
| `Prediction` | `app-step-prediction` | `app-gains-losses`, `app-uncertainty`: record expectation before the path; no right-answer score. |
| `Run` | `app-step-run` | `app-path-chart`, `app-observation-steps`, `app-equity`, `app-margin`, `app-maintenance`, `app-warning`, `app-teaching-events`, `app-pause-stop`, `app-continue-hold`, `app-exit`: observe effects and distinguish pause/decision/closure. |
| `Result` | `app-step-result` | `app-gains-losses`, `app-position-status`, `app-settlement`: ending amount, starting-base percentage, and cause of ending. |
| `Replay` | `app-step-replay` | `app-same-path`, `app-comparison-limit`, `app-comparison-chart`, `app-recovery`: identical inputs, one-times exposure, duration caveat, recovery arithmetic. |
| `Reveal` | `app-step-reveal` | `app-hidden-period`, `app-data-source`, `app-historical-synthetic`, `app-path-statistics`, `app-drawdown`, `app-uncertainty`: period/source/measurements, not a causal story or forecast. |
| `Debrief` | `app-step-debrief` | `app-lessons-glossary`, `app-forced-exit`, `app-settlement`, `app-recovery`, all nine glossary concept entries: explain this outcome in short lessons. |
| `PostCheck` | `app-step-postcheck` | `app-step-prediction`, `app-pilot-summary`: second expectation plus desire for clearer explanation; both responses required, neither scored. |
| `NextSteps` | `app-step-nextsteps` | `app-resources`, `app-pilot-summary`, `app-restart`: checked external learning links, optional local summary, fresh journey. |

## Meaningful terms and controls → entry IDs

The eleven primary step entries are above. The remaining **59 entries** are mapped below.

| UI/glossary concept or query family | Entry IDs |
|---|---|
| Virtual money, fake money, rupee display, no payment/withdrawal/reward | `app-virtual-money` |
| Capital, selected starting amount, base versus selected share | `app-capital` |
| Amount choice, stake, 25/50/100 percent buttons | `app-stake` |
| Exposure, affected amount, position size | `app-exposure` |
| Borrowed amount/exposure, extra exposure, no actual loan or repayment | `app-borrowed-amount` |
| Leverage, multiplier, two/five/ten times, larger effect both ways | `app-leverage` |
| Equity, remaining virtual money, not ownership/shareholding | `app-equity` |
| Margin, deposit/reserve, teaching margin meter, no top-up request | `app-margin` |
| Maintenance/teaching level, model boundary, not a real provider requirement | `app-maintenance` |
| Warning point/level, near maintenance, no guaranteed reaction time | `app-warning` |
| Forced exit, automatic rule closure, not a real liquidation procedure | `app-forced-exit` |
| Settlement, line ends, later rebound cannot reopen a closed position | `app-settlement` |
| Position open/warning/closed by choice/closed by rule, survived does not mean no loss | `app-position-status` |
| Gain/loss, ending amount, total change, virtual outcome not a grade | `app-gains-losses` |
| Recovery maths, required gain, smaller base, no positive recovery base from zero | `app-recovery` |
| Drawdown, previous peak, largest fall from a high, not endpoint loss | `app-drawdown` |
| Volatility, swings, choppy path, movement not predicted direction | `app-volatility` |
| Diversification, separate risk sources, falls together, no portfolio feature | `app-diversification` |
| Compounding, changing percentage base, not continuous engine rebalancing | `app-compounding` |
| Fees/charges, omitted interest/taxes/costs, not an after-cost balance | `app-fees` |
| Replay/contrast, identical observations, one-times exposure | `app-same-path` |
| Comparison difference, unequal holding duration after early end, no decision score | `app-comparison-limit` |
| Neutral episode numbers, period hidden until Reveal, not encrypted data | `app-hidden-period` |
| Source, attribution, preparation/reuse evidence, not endorsement | `app-data-source` |
| Recorded reference observations versus synthetic test fixtures | `app-historical-synthetic` |
| Uncertainty, no forecast/causal inference/representativeness/recovery time promise | `app-uncertainty` |
| Pure deterministic calculator, entry-fixed exposure, simplified rules and omissions | `app-simulation-assumptions` |
| Path chart, first-value indexing, order not quoted price, no inferred intraday path | `app-path-chart` |
| Dashed leveraged and solid unbroken one-times lines; solid is not straight | `app-comparison-chart` |
| Show data table, units, Closed is not zero, non-colour alternative | `app-data-table` |
| Measured on this path, maximum drawdown, worst step, down-step count, observation count | `app-path-statistics` |
| Bar/path step versus journey screen, missing daily dates, unavailable intraday low | `app-observation-steps` |
| Stop/pause path/resume path versus position exit and audio pause | `app-pause-stop` |
| Hold/continue watching/resume decision, no real-world hold recommendation | `app-continue-hold` |
| Exit now/manual exit/user exit, decision-only availability, no points | `app-exit` |
| Back/rereading, not engine rewind or undo, not available everywhere | `app-back` |
| Start again/reset, in-memory answer clearing, not clearing preferences/cache/clipboard | `app-restart` |
| Lesson count/dots/previous/next, tap term/close explanation, glossary inside Learn | `app-lessons-glossary` |
| Listen/pause/resume/replay narration, progress, unavailable text fallback | `app-manual-audio` |
| Mute/unmute, normal/slower, loading/playing/paused/ended/unavailable; not path speed | `app-audio-tools` |
| Auto-speak on/off, default OFF, explicit opt-in, queue/no overlap/step cleanup/blocked autoplay | `app-auto-speak` |
| Caption/readable narration, not word-timed subtitles, text authoritative | `app-captions` |
| Header English/Hindi language switch, current answers/results retained | `app-language` |
| Read and listen / Explore and choose panes, fixed former A+ style, no sizes control, scrolling | `app-reading-accessibility` |
| Tab/Enter/Space, skip current step, heading focus, Escape closes About, no trading shortcuts | `app-keyboard` |
| Journey memory-only choices/answers, no automatic submission, no accounts/cookies/analytics | `app-privacy` |
| Only language and explicit auto-speak persist, retired text-size key, disabled storage fallback | `app-preferences` |
| Cache/PWA/offline/low bandwidth, warmed shell and cached clips only, links/Chat need connection | `app-offline` |
| Agent-checked versus human-reviewed, no Hindi native review or human listening, generated speech limits | `app-audio-review` |
| Pilot/session summary, before/after/explanation/multiplier/outcome, optional clipboard, not research | `app-pilot-summary` |
| Verified official protective links, new tab/external privacy, unavailable-link fallback | `app-resources` |
| About/Close, unknown publisher identity, product name is not a credential, ordinary host metadata | `app-about-publisher` |
| Chat/help/concept questions, same-origin server forwards to Groq, not engine control | `app-chat` |
| Chat question/context transfer, no app question logs/storage, memory-only conversation, sensitive inputs barred | `app-chat-privacy` |
| Model fallibility, no personal investment decisions or predictions, confident tone is not evidence | `app-chat-limits` |
| Forwarded-message promise as fictional lesson material, not sent/offered by this app | `app-forwarded-message` |
| Percentages and named bases: path exposure versus starting capital versus remaining amount | `app-percentage-change` |
| Entry observation and fixed arithmetic units, not real assets bought | `app-entry-units` |
| Entry/fall/warning/closure events and stored narration; planned decisions separate from events | `app-teaching-events` |

Older strings `textSize`, `standardText`, `mediumText`, `largeText`, the older investment-position question `postCheck.wouldTake`, and the forwarded-message setup title remain in dictionaries. They are **not** described as current controls. Current shell fixes large text; current `PostCheck` asks whether a clearer explanation is wanted. The fictional forwarded-message concept remains explainable without claiming its legacy title is rendered. Header progress was removed; journey step order, Run observation progress, audio progress, and debrief lesson progress are distinct.

## App-specific numerical rules and data evidence

The prose mostly avoids exact toy thresholds. Button aliases preserve implemented choices, not recommended settings.

| Assumption/fact used by entries | Repository evidence and limitation |
|---|---|
| Base virtual amount 10,000; selectable shares 25/50/100 percent; multipliers 2/5/10, contrast 1 | `src/config/simulation.ts`, `src/JourneyExperience.tsx`, `src/engine/compare.ts`. Result uses selected capital, not unused base money. |
| Exposure = capital × multiplier; units = exposure / entry; equity = capital + units × (observation − entry) | `src/engine/position.ts`, `src/engine/simulate.ts`, `docs/SIMULATION_SPEC.md`. Entry exposure/units remain fixed, not a continuously rebalanced product. |
| Maintenance = 25% of selected capital for leverage above one; warning buffer = 1.5 × maintenance | `src/config/simulation.ts`, `src/engine/simulate.ts`. Teaching assumptions only, not a legal/provider/exchange rule. |
| Forced closure settles exactly at maintenance; low falls back to observation if unavailable; warning ordered before closure on a crossing | `src/engine/simulate.ts`, `src/journey/useSimulationRun.ts`, `src/journey/displayEquity.ts`. Simplified settlement, not executable-price assurance or guaranteed time to exit. |
| Planned decisions around quarter/half/three-quarter positions; entry-relative 5/10/20 percent fall events | `src/journey/useSimulationRun.ts`, `src/engine/simulate.ts`, `src/content/en/narration.json`. Fall-event names do not mean maximum peak-based drawdown. |
| Recovery gain from a loss fraction x is x/(1−x); no gain needed at/above start; no positive base at zero | `src/engine/position.ts`, `src/engine/compare.ts`, `src/JourneyExperience.tsx`. Arithmetic only, not recovery timing or reopening a closed run. |
| Comparison uses full identical path/capital at one-times exposure; difference is leveraged final minus one-times final | `src/engine/compare.ts`, `src/journey/useSimulationRun.ts`. Early exit/forced closure creates differing durations. |
| Reveal measurements belong to recorded path; first observation counts but is not a down step | `src/engine/stats.ts`, `src/JourneyExperience.tsx`. UI rounding is not engine precision. |
| Production data is two ECB reference-observation windows; no intraday lows; synthetic files are fixtures | `src/data/episodes/index.ts`, `src/data/episodes/historical-{crash,choppy}.json`, `docs/DATA_SOURCES.md`. Not stock prices, executable quotes, or an Indian-market sample. Exact attribution/reuse evidence stays in the existing data documentation; no additional licence or rights claim is invented. |
| No fees, interest, taxes, real orders, depth or borrowing contracts in engine | `src/engine/{position,simulate,compare}.ts`, glossary fees entry. These omissions limit transfer to real after-cost outcomes. |
| Fixed large text; preference keys only language/auto-speak; automatic narration default OFF | `src/components/AppShell.tsx`, `src/journey/preferences.ts`, `src/config/audio.ts`, `src/audio/AutoSpeakController.ts`. No old size selector/storage claim. |
| Cached shell/previously cached clips offline; local session summary and optional clipboard | `vite.config.ts`, `src/screens/PilotSummary.tsx`, `src/content/{en,hi}/features.json`. No full audio preinstallation, research collection, or pilot outcome claim. |

## Bilingual agent QA and back-translation

Agent pass covered all 70 English/Hindi title/text pairs and aliases. Checked definition-first wording; numerical base and direction; negation; condition/time ordering; app versus real-world scope; no promises, recommendation, scoring, instrument names, invented publisher, or invented rights. Hindi back-translation checks reconstructed meaning rather than matching English word order. Neither language copies whole UI paragraphs. Entries retain the approved plain meanings: उधार की ताकत, जमा रकम, बची आभासी रकम, ज़बरन बाहर निकलना, उतार-चढ़ाव, गिरावट, वापसी का गणित. Mathematical exposition is confined to this model and its observed inputs.

Representative spot checks (Hindi meaning translated back to English):

| IDs | Hindi → English meaning check | QA result |
|---|---|---|
| `app-capital`, `app-stake` | The selected share, not the whole base, is used for ending and recovery comparisons; unused money is not added. | Preserves denominator and scope. |
| `app-borrowed-amount`, `app-exposure`, `app-equity` | Extra affected amount is total exposure less starting capital; no actual loan; remaining money is a different quantity. | No loan/deposit/equity conflation. |
| `app-maintenance`, `app-warning`, `app-forced-exit` | The toy boundary closes the virtual position; crossing may leave no reaction time; not a real-world rule. | Preserves simplification and uncertainty. |
| `app-settlement`, `app-comparison-limit` | Later values cannot affect a closed run; the one-times replay continues longer; difference does not grade exit quality. | No implied reopening or advice. |
| `app-recovery`, `app-percentage-change` | Recovery gain applies to remaining money; equal percentages do not cancel; zero lacks a positive base. | Preserves asymmetry; no promised recovery. |
| `app-compounding`, `app-entry-units` | Successive percentages use the changed base, but this engine fixes entry units; glossary does not claim automatic reinvestment. | Distinguishes glossary from implementation. |
| `app-drawdown`, `app-teaching-events`, `app-path-statistics` | Reveal measures earlier-high decline; fall events compare to entry; equal values are not down steps. | No peak/entry/endpoint conflation. |
| `app-comparison-chart`, `app-data-table` | Unbroken does not mean straight or rising; Closed means no later position value, not zero. | Preserves graphical and table meaning. |
| `app-step-postcheck` | Two responses are needed; the second asks for clearer explanation, not whether to take a real position. | Matches implemented question, not retired dictionary key. |
| `app-pause-stop`, `app-continue-hold`, `app-exit` | Pause stops display; continue leaves the virtual run open; Exit ends it at a decision point. | Explicit interface semantics, no hold advice. |
| `app-auto-speak`, `app-manual-audio`, `app-audio-tools` | Opt-in queued stored audio, initially off; manual playback remains; audio pace/mute do not change the run. | Preserves separate playback and simulation controls. |
| `app-privacy`, `app-preferences`, `app-restart`, `app-pilot-summary` | Answers are in memory; only two preferences save; restart does not erase cache or copied clipboard text. | Avoids false nothing-is-stored claim. |
| `app-chat`, `app-chat-privacy`, `app-chat-limits` | Server forwards questions outside the device; app does not store question text; no personal inputs; model can be wrong. | Preserves authorized network disclosure, not provider-policy guarantees. |
| `app-historical-synthetic`, `app-data-source` | Recorded reference values are not stock prices or executable prices; created test data is separate; attribution is not endorsement. | No fabricated rights, instruments, or history. |
| `app-audio-review`, `app-about-publisher`, `app-reading-accessibility` | Agent checks are not native/listening approval; product name is not identity; controls do not prove universal accessibility. | Review/publisher/accessibility uncertainty remains visible. |

**Remaining review gap:** a Hindi native speaker can review naturalness and learner comprehension later; do not relabel these entries `reviewed` without that evidence. Chat transport/storage/privacy enforcement and runtime retrieval wiring belong to integration, not these two content files.

## Validation performed for these files

A local Python schema/reference/length check parsed the JSON, required the requested fields and app status, rejected duplicate IDs/aliases, and verified exact step names. Every `related` target is either in this file or in the explicitly authorized planned set. Both text fields stay within 40–120 whitespace-delimited words; sentences are at most 25 words by a punctuation-based check. This count is a consistency aid, not a Hindi linguistic measure. A coverage audit confirms all 70 IDs occur in this document and every actual journey step has its dedicated entry. No broad `lintAllow` exemptions were added.

Measured consistency results: **70 unique entries**, **11 dedicated step entries**; English text **54–66 words**, Hindi text **52–66 words**, maximum sentence **24 words**. Total explanation words: English 4,179; Hindi 4,240. All IDs are mapped here; every related target is allowed. These measurements describe authored text, not learning efficacy.

Repository checks were also run against the shared, actively changing workspace: `npm run lint`, `npm run typecheck`, `npm run build`, and `npm run check:bundle` passed. `npm run test` reported **190 passed / 7 failed** (content/release policy tests). `npm run check:content` and `npm run check:release` failed with **85 content-policy issues** outside these two files: 84 review-registry/status/hash issues for concurrently added `src/content/en/chat.json`, plus missing `src/content/hi/chat.json` at that check's snapshot. Existing agent-checked content/audio warnings remain expected and do not indicate human review. Logs: `/tmp/anubhav-app-kb-checks.NnohgY/`. No policy bypass or unrelated registry edits were made; integration must rerun these checks after finishing that work.

This delegated change writes only `knowledge/app.json` and `knowledge/APP_COVERAGE.md`. Existing app content/audio, review registry, engine, screens, dependencies, deployment, and publisher metadata are untouched by this task. Existing application tests are not evidence that a new KB is retrieved or that the authorized Chat is implemented; final whole-application checks remain an integration responsibility.
