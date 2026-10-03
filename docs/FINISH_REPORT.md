# Finish-session report — 2026-10-03

## Outcome

**Implementation and evidence work is committed locally, but this is NOT a
release-ready or deployed app.** One specific audio-quality blocker remains:
`hi:DRAWDOWN_5`. **57/58** required tracks passed; manifest stays
`complete:false`. The app intentionally falls back to text for this incomplete
set. No gate was weakened, silent asset substituted, review invented, push
performed or public preview deployed.

The bilingual text journey, real episodes/resources, glossary, reflection,
local summary, warmed-shell offline behavior and protective checks work in the
recorded automated browser suite. Full packaged audio playback/offline proof
remains blocked and explicitly skipped. No human listened, no native speaker
reviewed Hindi, no participant pilot occurred, and no legal/accessibility
certification is claimed.

## TTS diagnosis, choice and actual output

Standalone model-card calls bypassed the provider and kept the same pinned
checkpoint, tokenizers, masks, dtype, attention defaults and Transformers 4.46.1:

| Setting | English synthesis / duration / RMS | Hindi synthesis / duration / RMS |
|---|---|---|
| Defaults, 4 threads | 9.371s / 1.602s / −21.962dBFS | 10.229s / 1.892s / −36.885dBFS |
| Defaults, 8 threads | 11.310s / 1.602s / −21.962dBFS | 12.350s / 1.892s / −36.885dBFS |
| Only greedy override, 4 threads | 228.680s / 30.198s / −66.936dBFS | 230.514s / 30.198s / −77.484dBFS |

This establishes greedy decoding as the observed cause in the controlled local
cases, not a universal theorem or checkpoint-integrity certificate. Four
threads were faster on both non-silent short lines. No GPU, new weights or
Transformers upgrade was used to claim a fix. Peak RSS/waveform hashes/load
and timing scope: [TTS_DIAGNOSTICS.md](TTS_DIAGNOSTICS.md).

Actual six-clip re-audition: both Rohit and Divya passed all three broad gates;
mean Hindi CER **.212874 vs .165522**, so **Divya** won the predefined
all-three-pass → lowest-CER → wall-time tie-break rule. A slower mean synthesis
was not hidden: Rohit 29.97s vs Divya 33.20s per audition. No human listened.
English uses the selected narrator, individually gated, not separately ranked.

Production quality pipeline includes per-text/ID/attempt seeds, full input-hash
caches, EOS on every codec codebook before cap, signal/duration/duplicate gates,
three-attempt bound, pinned permissively licensed local Whisper-small ASR,
CER and protected quantities, mono normalized target-24kbps Opus and exact
text/input/asset hashes. **No signal-only fallback** was used.

- Selected tracks: **12.50–62.45s** CPU TTS, median **30.40s**, total **1802.31s**.
- All **70 production attempts** (including rejected/numeric-format retries):
  **2038.90s** synthesis. None exceeded 90s. Highest sampled process RSS:
  **7,029,870,592 bytes** (loaded TTS+ASR included).
- **57 Opus files: 937,707 bytes, 313.609s audio**; manifest 130,577 bytes.
- Original six cap-length silent WAVs remain unchanged/ignored.
- Initial English percentage failures were checker formatting errors (`5%`
  vs `five percent`). Versioned reassessment retained raw transcripts/CER and
  original decisions, normalized exact numeric spellings, **did not relax
  thresholds**, and separately rejected wrong/unconfirmed protected quantities.
- Hindi five-percent line failed quantity confirmation for all three seeds.
  Five-beam ASR on the same WAVs also failed. It remains unknown whether TTS
  pronunciation, ASR recognition or both are responsible. No more seeds or
  fuzzy-number substitution were used to manufacture success.

All clip texts/timings/RSS/transcripts/retries/quality decisions are recorded in
[AUDIO_BUILD.md](AUDIO_BUILD.md) and [AUDIO_BUILD_EVIDENCE.json](AUDIO_BUILD_EVIDENCE.json).
Optional exact user-run free-GPU steps are in [GPU_AUDIO.md](GPU_AUDIO.md);
none were executed or needed for the measured speed boundary. A GPU is not a
pronunciation fix.

## Real data, resources and content

Only two real ECB paths are exported at runtime:

| ID | Observed window | Count | Total change | Maximum drawdown |
|---|---|---:|---:|---:|
| historical-crash | 2008-07-15..2008-10-28 | 76 | −21.66354% | −22.07630% |
| historical-choppy | 2019-01-02..2019-02-28 | 42 | +0.16671% | −2.38405% |

**Deviation:** these are ECB-authored daily reference observations, not stock
closes or an Indian-market sample. Explicit reuse terms were prioritized over
unverified stock-index rights. Exact publisher text requires accurate reuse,
ECB source citation and disclosure of modifications/calculated growth rates.
UI neutral source labels/notices retain attribution and calculation disclosure.
No CC/public-domain claim is invented. No intraday values, holidays, causal
stories or missing-session classification were fabricated. Original values,
raw/normalized hashes and observed-date gaps are recorded; source statistics
and offline prepare_episode reproduction matched.
[DATA_SOURCES.md](DATA_SOURCES.md), [DATA_REVIEW.md](DATA_REVIEW.md).

EIA/Refinitiv candidates remain unapproved research outside runtime. Four
protective official destinations—SCORES, SEBI support, scam/pressure guidance,
and the government cybercrime portal—have session URL/date/body-hash and label
checks in [RESOURCE_CHECKS.md](RESOURCE_CHECKS.md). No forms/reports were
submitted and no helpline/procedure was invented.

Every current Hindi leaf has exact-text QA/back-translation evidence. Fixed
step current/total reversal, solid-vs-straight legend, end-vs-ever recovery,
intrabar scope and stop-vs-continue, plus overly broad privacy claims. Nine
substantive glossary terms remain; NAV/nomination were moved to future scope,
not shipped as planned filler. Agent-checked is clearly disclosed; no production
string was assigned reviewed. [CONTENT_QA.md](CONTENT_QA.md).

## Actual verification results

| Command / check | Final result |
|---|---|
| `npm run lint` | pass |
| `npm run typecheck` | pass |
| `npm run test` | **151 passed, 12 files** |
| Python discovery + ECB/resources modules | **56 + 10 = 66 passed** |
| Offline ECB regeneration + committed-file comparison | pass; later added reveal-review hashes independently tested |
| Python script compilation | pass |
| `npm run check:content` | **FAIL**: incomplete manifest, missing Hindi DRAWDOWN_5 |
| `npm run build` | pass, production PWA; 13 shell precache entries |
| `npm run check:bundle` | pass: **109,224 gzip JS B**, **1,974 gzip CSS B** |
| `npm run test:browser` | **6 passed, 2 explicit real-audio skips, 41.0s** |
| `npm run check:performance` | pass; actual measurements below |
| `npm run check:release` | **FAIL**, same two audio blockers; no other current technical failures |
| `npm run release` | **FAIL at content gate**, after lint/types/151 tests passed |
| Clean local clone at `2390e00`: npm-ci/build/bundle | pass; 612 installed packages, no model/cache/venv copied |
| Clean-clone `npm run release` | same expected audio failure after 151 tests |
| `npm audit --json` | zero reported advisories; not a complete security guarantee |
| `git diff --check` | pass |

The clean install still emits glob@11.1.0's deprecation warning. No unreviewed
upgrade was substituted. Installed package licence declarations/notices were
inventoried (612 packages, no UNKNOWN declarations), not every transitive
source file legally audited. Python/native/model training/output limitations
are recorded in THIRD_PARTY.md; none of those tools/weights ship in the app.

Browser proof covers English/Hindi × both episodes at **360×640**, prediction
and reflection gating, true pause, settled forced exit, same-series comparison,
hidden period/source, captions/glossary, verified links, explicit clipboard,
reset/reload memory-only answers, same-origin-only requests, no automatic audio
requests, warmed-shell offline reload, readable audio fallback, keyboard,
large text/reduced motion and 200%-equivalent CSS reflow. Axe found zero
violations in checked states. **No human screen-reader or physical-device
conformance claim.** [ACCESSIBILITY_AND_PERFORMANCE.md](ACCESSIBILITY_AND_PERFORMANCE.md).

## Performance and deployment

Final local Chrome/Lighthouse, cold navigation, 360×640, DevTools 400kbps down/up,
400ms added latency, 4× CPU at `2026-10-03T14:13:46.386Z`:

- Performance **89**, automated accessibility **100**, best practices **100**.
- FCP/LCP/interactive **2,987.057ms**, speed index **2,587ms**.
- TBT **0ms**, CLS **0**, reported network **108,032 bytes**, no audit warnings.
- Same-origin public assets only; audio is gesture-loaded, not in first load.
- Exact settings/build hashes: [PERFORMANCE_EVIDENCE.json](PERFORMANCE_EVIDENCE.json).

These are one-run local lab values, not a physical phone, field percentile,
measured production host or human-observed first-usable time. Earlier product
run measured 88/3,134ms; no optimization speedup is inferred from normal variance.

No vercel/netlify/wrangler/firebase CLI was available, so no existing
authenticated preview could be deployed. **No public URL, push, new account,
payment, login or production deployment.** Dedicated-origin static `dist/`,
HTTPS/compression/header/cache/404 requirements and actual clean-clone evidence:
[DEPLOYMENT.md](DEPLOYMENT.md). Host logging/retention still needs owner choice.

## Release warnings and every original TODO

Current release emits **671 individual warnings: 614 content/reveal strings +
57 audio entries**. The exact complete list, not a sample, is committed in
[RELEASE_WARNINGS.md](RELEASE_WARNINGS.md). Draft/placeholder/unverified/stale or
failed audio still block. Genuinely reviewed fixtures pass cleanly; an agent
cannot create human approval by changing metadata.

All **52 original TODO grep hits** have individual dispositions in
[TODO_DISPOSITION.md](TODO_DISPOSITION.md), anchored to
[TODO_BASELINE.json](TODO_BASELINE.json). Some were standing safeguards/checker
code or excluded test/research data, not missing approvals. Verifiable work was
completed; unavoidable human/publication decisions were not erased.

### Exact next actions, batched

1. **Audio blocker:** target only Hindi `DRAWDOWN_5` and its three retained WAVs
   for native listening or an independently justified recognizer/voice fix.
   Establish the correct five-percent quantity without threshold relaxation,
   fake approval or unlimited retries. Then rebuild and rerun all gates plus
   the two real packaged-audio browser cases.
2. **Publication owner:** confirm working title/audience and resolve remaining
   exact historical training-subset/voice/output attribution questions with
   relevant publishers where required. EIA can remain excluded.
3. **Language/listening review:** English listening and native Hindi meaning,
   pronunciation, number/negation and cultural clarity. Record actual evidence
   before any reviewed status. Current preview copy is only agent-checked.
4. **Accessibility reviewer:** real devices, native browser zoom, assistive
   technology and spoken announcements; automated scores are not certification.
5. **Host owner:** choose/authenticate a preview host, inspect access logging,
   applied HTTPS/CSP/media/service-worker behavior and rerun checks there.
6. **Pilot facilitator:** approve actual-setting consent/contact/recruitment
   and any external-note retention; no participants were recruited or measured.

## Local milestones

- `d9f0434` checkpoint prior TTS/audit work without losing evidence.
- `8aa5c11` finish-session rules and standalone reproduction.
- `14c85bf` real ECB runtime paths and official protective-resource evidence.
- `442945f` agent-checked bilingual QA, per-string and missing-audio gates.
- `b6faef9` accessible journey, gesture-only player, measured offline PWA/tooling.
- `2390e00` controlled TTS fix, 57 gated files and explicit final blocker.
- Final documentation/handoff commit follows these measurements; see git log.

No background generation/agents/preview/browser are required to keep this work
alive. Scripts and the committed evidence are resumable; the next task is the
single parked audio-quality issue, not redoing all earlier implementation.
