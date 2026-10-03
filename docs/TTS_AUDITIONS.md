# Hindi CPU voice audition — 2026-10-03

## Result: six WAVs generated; not usable voice-selection evidence yet

Exactly six WAVs were synthesized locally. No full-set generation, sampled
extra clips, release audio, or browser playback was produced. Numerical
screening flags **every output**: extremely low signal and duration near the
configured generation cap. This is not a listening/native-speaker review.
Do not pick a voice or ship these files based on successful file creation.

Local, gitignored output directory:
`artifacts/tts-auditions/greedy-seed0/`.
`run.json` contains transcripts, IDs, hashes, exact timings, measured WAV
properties, generation configuration, pinned model/tokenizer provenance and
package versions. The waveform bytes were not normalized or trimmed. Numerical
quality flags were added after the six-clip run, without regenerating audio or
changing its timing/hash records; the runner also emits these flags for future
runs. There is no deployment manifest.

## Actual CPU measurements

- CPU: 13th Gen Intel Core i5-13420H; no NVIDIA GPU.
- Python: 3.12.3; Torch: 2.14.1+cpu; float32 local model loading.
- Four Torch intra-op threads, one inter-op thread; `OMP_NUM_THREADS=4`,
  `MKL_NUM_THREADS=4`.
- `doSample=false`, seed `0` reset per clip; `maxNewTokens=2048`.
- One model instance reused across speakers; no warmup.
- Model import/check/load: **14.20 seconds**, excluded from individual rows.
- Clip time: `perf_counter` wall time for tokenize + generate + PCM16 WAV write.
  Excludes model loading and later numerical analysis.
- Shared workstation, not an isolated performance lab. Other applications and
  CPU scheduling can affect times. Lightweight mock-based tests ran during the
  session; the web build/test suite ran only after synthesis finished.

| File | CPU wall time (s) | WAV duration (s) | Wall time / audio duration |
|---|---:|---:|---:|
| `rohit-short.wav` | 210.11 | 23.68435 | 8.87× |
| `rohit-medium.wav` | 201.97 | 23.68435 | 8.53× |
| `rohit-number-term.wav` | 199.98 | 23.68435 | 8.44× |
| `divya-short.wav` | 197.32 | 23.68435 | 8.33× |
| `divya-medium.wav` | 199.55 | 23.68435 | 8.43× |
| `divya-number-term.wav` | 201.85 | 23.68435 | 8.52× |

Total timed synthesis: **1,210.78 seconds (20 minutes 10.78 seconds)**.
All six are valid PCM16 mono WAVs at 44,100 Hz (independently checked with
`ffprobe`), with 1,044,480 frames each. All have RMS near **−78.20 dBFS**, peak
about **0.00803**, and no measured PCM clipping. That low signal is a serious
usability warning, not evidence of quiet-but-correct pronunciation.

The last four files (`rohit-number-term` and all three Divya outputs) are
byte-identical, SHA-256:
`c24c5da04ce4d70b9d1da95d0982e6031f417dcb0789a3accb4f2c5ae0c5133e`.
This is additional evidence that the run is not demonstrating speaker/text
variation. Identical durations near the token cap suggest degenerate decoding
or non-termination; the root cause is **not established** by waveform metrics.
Do not treat these values as throughput for usable speech or assume a GPU will
fix the output. No GPU timing has been measured.

## Exact audition content and description

Only `spokenText` from `src/content/hi/narration.json` was used; all Hindi
entries remain `draft`:

1. **Short**, `USER_EXIT`: “स्थिति आपकी पसंद से बंद हुई।”
2. **Medium**, `run.main`: “रास्ता देखें। हर रुकावट पर आप रुक सकते हैं या बाहर निकल सकते हैं।”
3. **Number and transliterated term**, `DRAWDOWN_10` + `reveal.main`:
   “रास्ता शुरुआत से दस प्रतिशत नीचे है। यह एपिसोड कृत्रिम शिक्षण उदाहरण है। एक एपिसोड भविष्य नहीं बताता।”

The third clip joins two existing entries to cover both “दस प्रतिशत” and
“एपिसोड”, without creating new teaching copy. Each speaker received the same
three texts. The only description change was the name in this fixed template,
kept in `scripts/config/tts.json`:

> {speaker} speaks in a clear, calm voice at a moderate pace with a neutral tone. The recording is close, clean, and free of background noise.

## Pins, environment repair and offline evidence

- Model: `ai4bharat/indic-parler-tts`, user-supplied revision
  `7b527af5ee8ed1f9a28d80b19703ed9bb8ba10ca` outside the repository.
- Description tokenizer: `google/flan-t5-large`, revision
  `0613663d0d48ea86ba8cb3d7a44f0f65dc596a2a`; official model-card/API declaration
  Apache-2.0. Only tokenizer/config files cached; no separate T5 weights.
- Both exact Git package pins, training-data attribution, supplied reports,
  licences and build-tool/non-deployment boundary: `THIRD_PARTY.md`.
- Initial import failed on CUDA `torchaudio` requiring `libcudart.so.13`.
  Replaced **only** `torchaudio==2.11.0` with `2.11.0+cpu` from the official
  PyTorch CPU index using `--no-deps`; Torch and all other packages unchanged.
- `--check` now imports dependencies and loads both pinned tokenizers. It
  passed with `HF_HUB_OFFLINE=1`; actual six-clip generation also ran with
  `HF_HUB_OFFLINE=1` and telemetry disabled. The provider always uses
  `local_files_only=True`.

## Next controlled experiment (not run)

Keep these six original files for comparison. Before generating a full set,
diagnose the greedy output using one short line. The requested sampling switch
is implemented: copy `scripts/config/tts.json`, set `generation.doSample=true`,
keep seed `0`, and use a new output directory. The existing audition runner
always makes six clips, so do not invoke it if the next decision is a one-clip
experiment without first adding/selecting an explicit bounded trial.

A fixed seed aids reproducibility within the same environment, not equivalence
across devices or package versions. The user will choose a voice after usable
Rohit/Divya outputs exist. No sampling run, free GPU upload/account, or audio
publication was performed here.

## Checks

- `python3 -m unittest discover -s scripts/tests -p 'test_*.py'`: 48 passed.
- `python3 -m py_compile scripts/audition_audio.py scripts/providers/indic_parler.py scripts/generate_audio.py`: passed.
- Offline provider prerequisite check in `/home/nomad_aadi/venvs/tts`: passed.
- `ffprobe` on all six WAVs: PCM16, 44,100 Hz, mono; durations as above.
- `npm run release`: lint, typecheck, 63 Vitest tests, content check, build and
  bundle checks passed; final release gate blocked as expected by existing
  draft Hindi, TODOs, unverified resources and placeholder episodes.
- Audition folder confirmed gitignored; no WAVs/model weights added to tracked
  files. Previous source/browser audit work was preserved.
