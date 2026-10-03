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
