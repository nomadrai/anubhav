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

## ADR-0010 — Pinned offline tokenizers and limited voice audition

**Status:** accepted for local auditions, not release voice approval. **Decision:**
use the user-supplied Indic Parler checkpoint at
`7b527af5ee8ed1f9a28d80b19703ed9bb8ba10ca` and separately pin the FLAN-T5
**description tokenizer** to `0613663d0d48ea86ba8cb3d7a44f0f65dc596a2a`.
One explicit online command may cache only tokenizer files; generation/checks
stay offline. Compare six Hindi WAVs with one shared named-speaker template,
Rohit then Divya, greedy decoding and seed zero. The user selects the voice;
fixed-seed sampling is an explicit later config change. **Reason:** model and
tokenizer commits are different, discoverable packages can have broken native
imports, and a declared licence or valid WAV does not prove intelligible audio.
Only the supplied venv's CUDA `torchaudio` wheel was replaced by the same
version's CPU build; no web dependencies or model weights are deployed.
See `THIRD_PARTY.md` for the exact build-tool evidence and shipping boundary.

## ADR-0011 — User-authorized finish-session evidence rules (2026-10-03)

**Status:** accepted, supersedes the human-only advancement parts of ADR-0004,
0007, 0008 and 0010, not their truthfulness/privacy protections.

- Add `agent-checked` between `draft` and `reviewed`; agents may not assign
  `reviewed`. Release blocks draft, loudly lists every agent-checked string,
  and accepts reviewed content without that warning. Automated Hindi and
  back-translation checks are not native-speaker review and must be disclosed.
- Agents may resolve human TODOs using verifiable evidence. Unverifiable rights,
  listening, consent, and pilot outcomes remain open and are reported, not invented.
- Resources may be verified by the agent after an exact official-page fetch in
  this session with label/URL/date/evidence in `RESOURCE_CHECKS.md`. No unsupported
  helplines or procedures. Dataset redistribution terms must be explicit.
- Model defaults/sampling may replace failed greedy synthesis when experiments
  justify it. Objective quality/ASR gates may select a voice; disclose that no
  human has listened. No silent replacement assets or fake timing claims.
- Public downloads, dev/TTS package installation, and read-only use of existing
  Hugging Face auth are authorized; tokens never enter logs/files/commits.
- Local milestone commits are authorized; no pushes. Only an already-authenticated
  static-host CLI may create a preview, never a production-domain deployment,
  account, or payment without further user action.
- Continue independent work past blockers and batch final questions. Predictions
  and pilot answers remain in memory, not persistent financial/personal storage.
  Same-origin runtime-only requests, no advice/real instrument UI, no telemetry,
  and all remaining guardrails are unchanged.

## ADR-0012 — Evidence-led production paths and automated speech (2026-10-03)

**Status:** implemented; technical gates and remaining publication decisions
remain separate. Supersedes the synthetic-runtime-only and silent-stub scope of
ADR-0002/0006/0007, not their fixture/no-fabrication guarantees.

- Select two directly published ECB reference-observation windows under exact
  reuse/attribution conditions, not stock-index rights inferred from a website.
  Keep source observations unchanged, disclose app-calculated relative changes,
  preserve institution attribution and reveal only neutral episode copy. Leave
  EIA/Refinitiv candidates blocked outside runtime. Raw inputs remain ignored.
- Controlled model-card calls isolated the local cap-length near-silence to
  the greedy override. Retain pinned Transformers/model/tokenizers, CPU float32,
  four Torch threads, and fixed-seed **sampling**; no GPU or weight replacement
  was used as an assumed cure. Original failed evidence is preserved.
- Use per-ID/text/attempt seeds, full-input hash caches, explicit codec EOS,
  signal/duration/duplicate gates and max-three retries. Pinned Whisper-small
  is a build-time Apache-2.0 ASR/CER check, not a native or listening reviewer.
  Divya is selected by all-three-pass then lowest mean CER, not by taste.
  Complete schema-2 manifest requires all 58 current bilingual narration and
  glossary tracks; partial/error output remains a blocking content failure.
- Store only compact passed Opus + manifest in public assets; never commit
  model weights, raw downloaded data, audition/rejected WAVs or credentials.
- Add @playwright/test 1.63.0 and lighthouse 13.5.0 (Apache-2.0), plus
  @axe-core/playwright 4.13.0 (MPL-2.0), all **dev-only**, for repeatable
  browser/PWA/network/a11y/performance evidence using local Chrome.
  Installed Node licence metadata and runtime notices are recorded separately.
- App answers stay in reducer memory; only language/text-size preferences may
  persist. Service worker stores public static assets and requested same-origin
  audio, not answers. Full offline-audio availability is never implied.
- Content QA hashes every user-facing leaf; release enumerates agent-checked
  content/audio and every production reveal/source-label string. Editing a
  reviewed leaf invalidates its hash. No agent assigns human-reviewed status.

## ADR-0013 — Second-recogniser corroboration for a quantity-only ASR mismatch (2026-10-04)

**Status:** implemented; supersedes nothing and relaxes no threshold. **Decision:**
keep Whisper-small as the primary CER/quantity gate, and additionally allow a
quantity-only mismatch to be **corroborated** by a second, pinned, independently
trained recogniser (`openai/whisper-medium`, a larger checkpoint of the same
family) on the **same** WAV. Qualification is a pure, unit-tested predicate:
the primary CER must already be within its unchanged threshold, the *only*
failure must be the ASR gate, and the quantity must be unconfirmed. The build
records the raw small transcript, CER and prior decision, records the
corroborating transcript, and passes the track only if the second recogniser
confirms the exact protected quantity. The manifest gate validates the
corroboration object and still fails any unconfirmed quantity mismatch. **Reason:**
the Hindi five-percent line's protected number was the sole blocker; a bounded
single-variable diagnostic showed the primary recogniser's own acoustic model
preferred the correct nasalised number while greedy decode emitted a wrong
spelling, i.e. a recognition/decode disagreement rather than clear TTS error.
**Consequence:** the failure is resolved without fuzzy number mapping, threshold
relaxation, unlimited seeds, regenerated audio or silence. Corroboration is
recorded as a recogniser disagreement, not proof the audio is correct; the track
stays `agent-checked` and is never `reviewed`, and actual native listening
remains an open human action.

## ADR-0014 — Responsive two-pane teaching surface

**Status:** implemented in the UI redesign. **Decision:** use reusable AppShell,
StepHeader, SplitLayout, Pane and ActionBar components. At >=1024 CSS pixels,
reading/captions are left and choices/charts are right, using a viewport-height
CSS grid (`auto minmax(0,1fr) auto`) and independently scrolling panes. Below
1024 pixels use natural single-column scrolling, a sticky header/action area and
safe-area padding. The cream/green/neutral palette and system fonts remain;
wide screens use scaled type/charts/cards and a low-contrast background pattern.
No new dependencies, external fonts, decorative animation or profit rewards.
Engine, reducer and playback hook are unchanged. Back revisits earlier UI views,
never reruns or rewinds the engine; it is disabled at Run/Result boundaries.
Debrief uses local lesson navigation, retaining every engine-selected lesson.

## ADR-0015 — No document scroll and readable minimum viewport

**Status:** implemented; exact measured matrix is in ACCESSIBILITY_AND_PERFORMANCE.md.
**Decision:** desktop short steps must fit at >=1280x650 at standard/medium size;
1024x768 is additionally checked as the two-pane tablet boundary. Use compact
grouping and viewport/clamp spacing, not clipped text or unreadably reduced body
type. Largest text, lengthy lessons/reveal/resources and explicitly expanded
chart tables may scroll in a pane, never in the desktop document. A conditional
bottom fade signals remaining pane content. Mobile can scroll naturally but its
primary action stays reachable. Automated bounds/hit-target/overflow checks do
not substitute for physical-device, native-zoom or human typography review.

## ADR-0016 — Short privacy footer and accessible About disclosure

**Status:** implemented. **Decision:** replace repeated review/storage/cache and
browser-connectivity paragraphs with the requested bilingual, choices/answers-
scoped privacy line and one About button. About is a native modal dialog with
focus containment, Escape/Close and a scrollable body; it preserves storage,
reload, conditional offline/cached-audio, external-link and absent native/listening
review limits, plus ordinary host-log metadata. No navigator.onLine message or
unmeasured offline-ready chip is shown. The recorded-path explanation also lives
in About rather than duplicating the Run captions. Disclosures are moved, not
removed, and README/LIMITATIONS/PRIVACY remain accurate.

## ADR-0017 — Capability-driven user-data disclosure

**Status:** implemented and regression-tested. **Decision:**
`src/config/capabilities.ts` declares `userDataLeavesDevice:false`; the footer
selects local-only or sending-feature disclosure from that flag. The flag neither
implements nor authorizes transport. Any future sending feature requires its own
accurate screen-level disclosure and a renewed guardrail/network review before
enablement. Full-journey browser checks require same-origin, bodyless static GETs,
no query/payload carrying learner choices, no response persistence, and production
`connect-src 'self'`. Host request metadata and explicit outbound destinations
are not claimed to be anonymous or log-free.

## ADR-0018 — Defer teaching code, not the learner's answers

**Status:** implemented and measured. **Decision:** keep the language-entry shell
immediately available and lazy-load JourneyExperience only after a start gesture.
The PWA still precaches all public shell chunks, including that module. No engine,
data or reducer rules change, and no choices are encoded in module URLs. This
bounded split addresses the redesign's initial mobile-loading regression without
new dependencies or reducing readable text. Loading uses the existing entry as
an honest fallback, not an invented teaching sub-step; audio tests wait for the
actual Intro before requesting its clip. Native modal close occurs before React
unmount so About returns focus to its opener. Option-card accessible names are
explicit translated labels; decorative check marks never pollute their names.
Exact before/provisional/after build hashes and lab limitations are recorded in
UI_PERFORMANCE_EVIDENCE.json and ACCESSIBILITY_AND_PERFORMANCE.md.

## ADR-0019 — Scoped fixed-size header/footer and automatic narration

**Status:** implemented at the user's request, superseding the variable-text-size,
header progress and gesture-only auto-narration parts of prior UI decisions. Keep
former A+ sizing always; delete the retired preference. Persist only language and
explicit auto-speak. DEFAULT_AUTO_SPEAK in src/config/audio.ts is false. Queue stored
step/Run tracks through the existing manager, retain automatic ownership until end,
stop at scope exit/off and fail quietly when autoplay is blocked. Manual Listen
keeps its existing behavior and priority. Automatic playback uses its primary
control/progress without opening manual-only extra tools/status; no audio/text is
regenerated. Header is language → switch → inert TODO(chat) button. Footer keeps
its width and unchanged privacy line, with About directly below at bottom-left.
Fixed-size fit required compact caption/control grouping, not smaller body text.
No new dependencies, chat/network feature, engine or journey-rule change.

## Remaining human publication/pilot decisions

- `TODO(human)`: confirm the working title in `src/config/app.ts` and intended
  publication context; no trademark/legal clearance is inferred.
- `TODO(human)`: English listening and native Hindi pronunciation/meaning review
  remain unperformed. The user permits agent-checked previews, not a claim of
  human review. Never upgrade status without actual evidence.
- `TODO(human)`: resolve exact historical training-subset/voice/output terms
  where publisher evidence remains incomplete (THIRD_PARTY.md). Build-tool
  inventory is not a blanket redistribution clearance.
- `TODO(human)`: approve consent, contact route, recruitment and any facilitator
  notes/retention policy before an actual pilot. No participant work occurred.
- `TODO(human)`: choose/authenticate a preview host and review its access logging,
  applied CSP headers and assistive-technology behavior before publication.

Teaching maths/order, copy, source/calendar scope, direct resource pointers,
package metadata and local CSP/storage checks are now agent-checkable evidence,
not unverifiable human-only placeholders. Their exact disposition, remaining
limits and measured check results are in TODO_DISPOSITION.md and the linked
QA/browser/data records.
