# Controlled TTS diagnosis and build policy — 2026-10-03

## Finding, not an assumed fix

The original six greedy auditions in [TTS_AUDITIONS.md](TTS_AUDITIONS.md) remain
unchanged local evidence: approximately −78 dBFS, capped lengths, repeated
hashes. They were never voice-approved and their ~200-second times were not a
real-speech benchmark.

`scripts/diagnose_tts.py` reproduces the **model card outside the provider**:
English random-voice example and Hindi named-Divya example, exact public texts
and descriptions, model and both tokenizer pins, `torch.manual_seed(0)` before
each clip, CPU float32, no generation overrides in default mode. All loading
uses `local_files_only=True` with `HF_HUB_OFFLINE=1`; no weights were changed.
The model's saved defaults are sampling, temperature 1, top-k 50, top-p 1,
`max_length=2610`. The greedy comparison changes **only `do_sample=False`**.
The eight-thread comparison changes **only Torch thread count**.

Hardware: Intel i5-13420H; Torch 2.14.1+cpu, Transformers 4.46.1, Parler 0.2.2,
Python 3.12.3. One inter-op thread. No NVIDIA GPU. Wall time uses perf_counter
around generation (not model load); peak RSS uses psutil sampling every 20ms
and includes already-loaded model memory. These are one-pass sequential
workstation observations, not isolated/repeated laboratory benchmarks. Other
implementation work existed in the session; no universal speedup claim.

| Run | Language | Generation wall s | Audio s | RMS dBFS | Peak | Peak RSS bytes |
|---|---|---:|---:|---:|---:|---:|
| Defaults, 4 threads | en | 9.3713 | 1.60218 | -21.9624 | 0.473031 | 4590927872 |
| Defaults, 4 threads | hi | 10.2289 | 1.89243 | -36.8851 | 0.076310 | 4619268096 |
| Defaults, 8 threads | en | 11.3099 | 1.60218 | -21.9624 | 0.473031 | 4623699968 |
| Defaults, 8 threads | hi | 12.3497 | 1.89243 | -36.8851 | 0.076310 | 4653506560 |
| Greedy, 4 threads | en | 228.6804 | 30.19755 | -66.9358 | 0.006924 | 7991234560 |
| Greedy, 4 threads | hi | 230.5142 | 30.19755 | -77.4838 | 0.007982 | 7991881728 |

Model-load times were 6.9637s / 6.9532s / 6.8902s respectively. The eight-thread
waveforms have essentially matching duration/RMS but **different byte hashes**
(minute floating-point differences); fixed seeds do not promise identical bytes
across threads/hardware/backends. Four threads were faster for both actual
non-silent lines and were retained. The greedy intervention alone reproduced
near-silence/cap-length output for both languages, establishing the decode-mode
cause **for these local cases**, not a universal claim that greedy TTS always
fails or a claim of audited checkpoint integrity.

No tokenizer, mask, dtype, attention backend, weights or Transformers change
was needed. Both paths use the checkpoint prompt tokenizer, separately pinned
FLAN description tokenizer and both attention masks. The library emits an
internal attention-mask warning despite the explicit arguments; it occurs in
both successful/default and failed/greedy cases and is not by itself evidence
of the cause. Further eager/SDPA/version permutations were not run because the
single-variable reproduction isolated the observed failure. No GPU cure was
assumed. Original run directories/metrics remain gitignored under
`artifacts/tts-auditions/diagnose-{default-4,default-8,greedy-4}`.

## Reproduction

Use a **new empty** output directory; commands deliberately refuse overwrites:

```sh
HF_HUB_OFFLINE=1 /home/nomad_aadi/venvs/tts/bin/python scripts/diagnose_tts.py \
  --model-dir /home/nomad_aadi/Documents/Projects/models/indic-parler-tts \
  --output-dir artifacts/tts-auditions/repeat-default-4 --threads 4 --mode default
# Compare only --threads 8 in a different empty directory.
# Compare only --mode greedy at --threads 4 in another empty directory.
```

## Production algorithm (automated, never native/listening review)

`scripts/build_narration.py` uses one TTS model and one offline ASR model:

1. Source exact current `spokenText` from 20 narration and 9 glossary entries
   in **each** language. Draft text is rejected. No participant data is input.
2. Re-audition Rohit/Divya on short, medium and combined number/term lines.
   A shared description template changes only speaker; text/ID-derived seed
   is identical between speakers for each attempt.
3. Seed = first 32 bits of SHA256 of base seed, language, ID, exact trimmed
   text, and retry index. Input/cache hash also covers full generation settings,
   model/tokenizer pins and tokenizer hashes, policy and package versions.
4. Cap = ceil((0.7 × word count + 3) × 44100 / 512) + 9, clamped to
   384..2580 codec steps. This is a fail-closed allowance, not a promised speech
   duration. At most **three fixed-seed attempts** per text/voice.
5. Observe codec EOS on **all nine codebooks**, excluding initial delay-mask
   tokens, and require termination before the cap. Do not infer EOS merely
   from WAV length. Reject nonfinite/empty/non-mono output; RMS below −48dBFS,
   peak below .01, silence-sample fraction above .85, or clipping fraction
   above .002. Duration must be within max(.35, .1×words)..min(30, 1.2×words+4)
   seconds. Reject byte-identical WAVs for different texts.
6. For signal-passing clips, run pinned **Whisper-small**, Hindi/English
   transcription, greedy ASR, 16kHz scipy polyphase resampling. CER is codepoint
   Levenshtein after NFKC/casefold/punctuation-to-spaces/collapsed whitespace;
   retain Hindi marks. Version-2 assessment normalizes explicit numeric/%
   spellings into matching number words and additionally checks protected
   quantities. Raw pre-normalization CER is retained. Thresholds set before auditions: English
   ≤.20, Hindi ≤.35. Do not lower thresholds after failures. ASR is present;
   **no silent signal-only fallback** is used in this build.
7. Select among voices passing all three lines by lowest mean CER, then mean
   TTS wall time. **Divya** won this automated comparison; no human listened.
   English uses the same chosen narrator but every English file independently
   passes its own gates; no English voice-ranking experiment is claimed.
8. Cache passed/rejected attempts by full input hash; reuse only when cached
   WAV SHA and input SHA match. Changed text invalidates its own entry.
   Record real synthesis/ASR times, sampled peak RSS, retries, transcripts,
   token counts/EOS flags, hashes and metrics in ignored build evidence.
9. Encode passed files with FFmpeg loudnorm target −18 LUFS, true peak −2dB,
   LRA 7, mono 48kHz **Opus target 24kbps** (variable bitrate). Check finite PCM
   and clipping again after encoding. A target is not a per-file achieved
   loudness/bitrate measurement; final byte/duration values are in the manifest.
10. Schema-2 manifest is complete only if every required current ID/language
    passed. Missing/stale/hash-mismatched/unsafe-path/failed entries block
    content/release. Rejected WAVs never enter `public/audio/`.

Config: `scripts/config/tts-production.json`. The original `tts.json` retains
its **historical greedy audition settings** so the earlier experiment remains
reproducible; the production builder explicitly uses sampled settings.
`scripts/generate_audio.py` is a legacy schema-1 reveal-fixture builder, not the
production speech-quality gate. Its output does not satisfy schema-2 release.

### Recognizer and review limits

The six audition transcripts have spelling/word errors. For example, Divya's
short-line CER is .2143, not zero. A threshold pass is not proof that every
negation/number was pronounced correctly, of natural Hindi, or of listening
comfort. ASR can misrecognize or hallucinate; see its documented poor Hindi
benchmark/limitations in THIRD_PARTY.md. **No person listened, no native
speaker reviewed, and no content is marked `reviewed`.** Captions/text remain
authoritative and audio failure must preserve the readable journey.

### Evidence-led correction to the ASR checker

The initial full pass produced 55/58 accepted tracks: the three English
percentage lines failed only because Whisper wrote `5%`, `10%`, `20%` while
the reference used number words (raw CER .30/.2821/.3333). This was a measured
**representation mismatch**, not evidence of wrong spoken numbers. The second
pass reuses exactly those WAVs/transcripts, records `previousAssessment` and
`rawCer`, maps a small explicit bilingual numeric lexicon plus `%` into words,
and checks protected quantities separately. It does not lower the .20/.35 CER
thresholds, equate different numbers, perform broad fuzzy substitutions, or
ignore missing quantities. Regression tests assert a correct `5%` has zero
normalized CER and changed `20%` fails quantity matching even with low CER.
Hindi quantity outputs that cannot establish the expected number now fail;
those receive only the remaining bounded seed attempts, not unlimited retries.

### Second-recogniser corroboration for a quantity-only mismatch

The Hindi five-percent line (`hi:DRAWDOWN_5`) was the one remaining blocker.
All three fixed-seed WAVs passed signal/EOS/duration but Whisper-small's greedy
decode could not spell the protected number `पाँच`. Rather than lower a
threshold, fuzzy-map the number, run more seeds or publish silence, the failure
was diagnosed as a recogniser **decode/recognition** disagreement:

- A bounded, single-variable diagnostic (`scripts/diagnose_number.py`,
  `scripts/diagnose_number_asr.py`) reused the **same** production WAVs and the
  **same** seed, changing only the recogniser. It wrote only to the ignored
  `artifacts/` tree; it is not a production build or a release gate.
- On each real WAV, Whisper-small's *own* acoustic model assigned the **lowest**
  forced-label cross-entropy to the correct nasalised `पाँच` sentence (e.g.
  3.299 vs 3.349 anusvara vs 3.363 non-nasal vs 3.766 ten), i.e. the acoustic
  model preferred the correct number even when greedy decode emitted a wrong
  spelling. This is suggestive evidence of a decode error, not proof.
- The independently trained, pinned `openai/whisper-medium`
  (`abdf7c39ab9d0397620ccaea8974cc764cd0953e`, Apache-2.0) recovers `पाँच`/`5`
  on the three real WAVs. In-context sentence controls validate the method: the
  non-nasal control stayed non-nasal and both nasal-mark controls read as
  nasal/numeral.

Because of that evidence the build may **corroborate a quantity-only**
mismatch: when the primary Whisper-small CER is already inside its unchanged
threshold and the *sole* failure is the protected-quantity sub-check, the same
WAV is re-transcribed by the second recogniser. The build records the raw
small transcript/CER and prior decision, records the corroborating transcript,
and passes the track only if the second recogniser confirms the exact quantity.
The pure predicate `quantity_corroboration_needed` is unit-tested and never
qualifies an over-threshold CER or a signal/duration/duplicate failure. Two
Hindi tracks were corroborated (`hi:DRAWDOWN_5`, `hi:DRAWDOWN_20`). The manifest
gate (`scripts/check-audio.mjs`) validates the corroboration object and still
fails an unconfirmed quantity mismatch; a corroborated track remains
`agent-checked`, never `reviewed`. This is automated evidence, not a claim that
a person heard or approved the audio.

Final per-track generation evidence and any exhausted retries are recorded
in [AUDIO_BUILD.md](AUDIO_BUILD.md), not extrapolated from these two short
benchmark lines. The complete build is resumable; no accuracy/performance
claim is derived from the prior cap-length silent files.
