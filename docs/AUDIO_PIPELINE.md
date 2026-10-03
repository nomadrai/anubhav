# Offline narration pipeline and browser audio

## Current boundary

Speech is generated **at build time**, never on a learner's device or an external
runtime service. The app fetches only same-origin, hash-validated Opus after a
Listen gesture. Captions/text remain available independently; a missing,
incomplete, stale or corrupt manifest/asset produces readable fallback.

The production entry point is **`scripts/build_narration.py`**, not the older
schema-1 episode-reveal fixture builder. It builds the 20 narration + 9 glossary
entries for each language from exact current content, using pinned local
Indic Parler and a separately pinned FLAN description tokenizer. It also uses
pinned local Whisper-small for ASR/CER checking. Build-time tools/models are
not deployed. Full pin/licence/attribution evidence: [THIRD_PARTY](THIRD_PARTY.md).

Current copied/generated assets and actual failures/timings are reported in
[AUDIO_BUILD](AUDIO_BUILD.md). No audio or Hindi string has a fabricated human
`reviewed` status. **No human listened and no native Hindi review occurred.**

## Prerequisites and explicit cache step

The supplied tested venv is `/home/nomad_aadi/venvs/tts`; model directory is
`/home/nomad_aadi/Documents/Projects/models/indic-parler-tts`. The model revision
is `7b527af5ee8ed1f9a28d80b19703ed9bb8ba10ca`, not floating main. Inspect actual
imports—not merely package discovery. Keep the compatible CPU torchaudio wheel
recorded in THIRD_PARTY; do not silently replace Torch/Transformers.

Cache the separate tokenizer explicitly online if missing:

```sh
/home/nomad_aadi/venvs/tts/bin/python scripts/audition_audio.py --cache-tokenizer
```

Cache only the pinned ASR artifacts online (no dataset download, no new account):

```sh
HF_HUB_DISABLE_TELEMETRY=1 /home/nomad_aadi/venvs/tts/bin/python - <<'PY'
from huggingface_hub import snapshot_download
snapshot_download('openai/whisper-small',
    revision='973afd24965f72e36ca33b3055d56a652f456b4d',
    allow_patterns=['config.json','generation_config.json','preprocessor_config.json',
      'tokenizer.json','tokenizer_config.json','special_tokens_map.json',
      'added_tokens.json','normalizer.json','vocab.json','merges.txt',
      'model.safetensors','README.md'])
PY
```

The explicit cache command may use the user's existing authentication read-only.
Never print/copy credentials, log a token, or embed it in a notebook/command.
All subsequent model/tokenizer/ASR loading is `local_files_only=True`.

## Diagnose and build offline

The original greedy failure and the standalone one-variable diagnosis are
preserved in [TTS_AUDITIONS](TTS_AUDITIONS.md) and
[TTS_DIAGNOSTICS](TTS_DIAGNOSTICS.md). `scripts/config/tts.json` retains the
historical greedy experiment; `tts-production.json` is the sampled production
policy. The shared voice-description template changes only the speaker name.

```sh
HF_HUB_OFFLINE=1 /home/nomad_aadi/venvs/tts/bin/python scripts/audition_audio.py \
  --check --model-dir /home/nomad_aadi/Documents/Projects/models/indic-parler-tts

HF_HUB_OFFLINE=1 OMP_NUM_THREADS=4 MKL_NUM_THREADS=4 \
  /home/nomad_aadi/venvs/tts/bin/python -u scripts/build_narration.py \
  --model-dir /home/nomad_aadi/Documents/Projects/models/indic-parler-tts
# Add --audition-only to stop after the controlled six-clip comparison.
```

Rerunning the build verifies/reuses cached waveforms/transcripts rather than
resynthesizing identical inputs. Per-ID/text/attempt seeds and hashes cover the
model/tokenizer configuration, speaker, generation settings, exact text, policy
and package versions. Changed text invalidates its entry. There are at most
three attempts for each text/voice. Files are never approved because they merely
exist; codec EOS, signal/duration/duplicate checks and ASR must pass. Cached
quality assessments are versioned; the numeric-format CER repair preserves
original raw scores/transcripts and reevaluates without new inference.

Use the actual observed four-vs-eight-thread evidence, not core count intuition.
No speed guarantee is inferred for a different computer. Optional user-run GPU
instructions: [GPU_AUDIO](GPU_AUDIO.md); no hosted job/account was started.

## Artifact contract and gates

- Ignored `artifacts/audio-build/<input-sha>/speech.wav` + `quality.json` retain
  passed and rejected candidates. `auditions.json`, `progress.json` and
  `build-report.json` record measurements, transcripts, retries and selection.
- Only passed mono normalized Opus enters
  `public/audio/{en,hi}/<input-sha>.opus`, target 24kbps, loudnorm target −18 LUFS,
  true-peak target −2dB, LRA 7. These are targets; actual bytes/durations are
  measured and encoded clipping/finite-signal checks run.
- `public/audio/manifest.json`, schemaVersion 2, declares `complete`, review
  status, voices, build/model/tokenizer provenance and all tracks. Each includes
  language/ID/exact spoken text, content/input/asset SHA-256, bytes/duration,
  seed and actual EOS/signal/ASR metrics. It contains no participant data,
  credentials or local filesystem paths.
- Manifest writes are atomic. Partial builds explicitly have `complete:false`
  and failed/missing tracks; release remains red. No silence or fixture bytes
  are inserted to fill a gap. All required IDs and both languages must match
  current source. Audio files are intentionally committed only after checks,
  so a clean web build does not need model downloads or TTS hardware.

```sh
node scripts/check-audio.mjs
npm run check:content
npm run check:release
python3 -m unittest discover -s scripts/tests
```

The audio check verifies paths, completeness, exact current spoken hashes,
asset bytes/SHA, quality/EOS and bounded ASR-CER results; content/release also
verify hash-bound text review. Changing a status to `reviewed` requires actual
human evidence, never a successful command. Original greedy WAVs remain ignored
and unchanged. Schema-1 fixture/stub output is not accepted for release.

## Playback and offline scope

`src/audio/AudioManager.ts` is one player shared by narration and glossary. It
loads no audio automatically, cancels old requests, validates manifest/text/
bytes/hash, supports pause/resume/replay/mute/0.8× speed, and stops on screen or
language change. It accepts permitted agent-checked or genuinely reviewed
assets and refuses draft. Controls disclose loading/failure; no audio is needed
to continue. Captions are utterance text, not word-timed subtitles.

The service worker precaches the shell but **not audio**. It caches only
requested same-origin files, with cleanup/expiry limits. Offline reopening
requires a warmed successful cache; unrequested clips still need a connection.
Browser playback/offline proof is separate from synthesis success and is
recorded in [ACCESSIBILITY_AND_PERFORMANCE](ACCESSIBILITY_AND_PERFORMANCE.md).
