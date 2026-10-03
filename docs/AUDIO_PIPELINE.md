# Offline audio pipeline

## Phase 3 boundary

The repository now has an optional **build-time** audio path. It does not add
runtime network requests, model downloads, playback, or a UI claim that audio
exists. The checked-in app continues to use visible text; the caller's model
checkpoint stays outside git, while temporary WAV files and generated Opus/
manifest artifacts remain local (the default `public/audio` output is ignored).

The selected open-source candidate is `ai4bharat/indic-parler-tts`. Its model
card declares Apache-2.0, supports English and Hindi among its multilingual
languages, and requires gated model access. It is a large local dependency
(about 0.9B parameters). Those facts do not mean that this checkout contains
the model or that generated speech has been reviewed. See the focused
requirements note in [`THIRD_PARTY.md`](THIRD_PARTY.md).

## CLI contract

The stub remains deterministic and planning-only:

```sh
python3 scripts/generate_audio.py \
  --provider stub --dry-run --episode EPISODE.json
```

The plan contains the exact spoken text and its UTF-8 SHA-256
`contentSha256`. It always sets `manifestGenerated: false` and
`assetsGenerated: false`; it writes no audio and no manifest.

Indic Parler can also produce a plan without importing PyTorch or inspecting a
model. This is useful for checking text and hashes, but is not evidence that a
model is available:

```sh
python3 scripts/generate_audio.py \
  --provider indic_parler --dry-run --episode EPISODE.json \
  --model-id ai4bharat/indic-parler-tts --model-revision LOCAL_REVISION
```

A real build is explicitly local-only. The caller must first obtain and review
the gated checkpoint outside this repository, then pass its directory and an
immutable revision or other locally recorded revision:

```sh
python3 scripts/generate_audio.py \
  --provider indic_parler \
  --episode EPISODE.json \
  --model-dir /absolute/path/to/local/checkpoint \
  --model-revision MODEL_COMMIT \
  --output-dir public/audio
```

`--check` validates the local directory, imports the real optional stack, and
loads **both tokenizers at their recorded revisions**, without loading model
weights or generating tracks. Missing tokenizer caches or broken native wheels
now fail the check; `ready: true` means prerequisites pass, not voice approval:

```sh
python3 scripts/generate_audio.py \
  --provider indic_parler --check --episode EPISODE.json \
  --model-dir /absolute/path/to/local/checkpoint \
  --model-revision MODEL_COMMIT
```

No model or dependency is added to `package.json` or the default Python
requirements. The supplied external venv and exact source pins are recorded in
`THIRD_PARTY.md`, including the correction from CUDA to CPU `torchaudio`.
The generation environment uses `torch`, `transformers`, `parler-tts`
(imported as `parler_tts`), `soundfile`, and the `ffmpeg` executable for Opus
encoding. Native notices and final output review remain open. `from_pretrained` is always called with
`local_files_only=True`, and a missing/incomplete gated checkpoint is an
error rather than a fallback to a network request or fake audio.

## Deterministic inputs and manifest

Each track is the English or Hindi `periodText` or `whatHappenedText` from the
prepared episode. `contentSha256` hashes the exact stripped spoken text.
`inputSha256` hashes a canonical JSON object containing:

- the content hash and language;
- provider name; and
- generation configuration: model id/revision, separately pinned description
  tokenizer id/revision, tokenizer file hashes once checked, voice-description
  prompt, device, seed, `doSample`, and `maxNewTokens`.

It does not contain participant responses or other private data. A successful
build writes `public/audio/manifest.json` (or the selected output directory)
only after all tracks succeed. The manifest contains `schemaVersion: 1`, the
provider, explicit `provenance` (`modelId`, `modelRevision`, local-only source,
and generation `config`), and an `entries` array. Every entry records the
track id, spoken text, both hashes, relative `.opus` path, sample rate, output
SHA-256, and this format contract:

```json
{"container":"ogg","codec":"opus","channels":1,"bitrate":"24k"}
```

Output components are restricted to safe filename characters. The output
directory cannot be a symlink and must be separate from the model directory.
WAV intermediates are created in a temporary directory and removed after the
build. Existing assets and manifests are not overwritten unless
`--overwrite` is explicit. The manifest is written atomically after conversion
succeeds.

## Six-clip Hindi auditions (not the full audio set)

Configuration lives in `scripts/config/tts.json`. It pins:

- Indic Parler: `7b527af5ee8ed1f9a28d80b19703ed9bb8ba10ca`;
- `google/flan-t5-large` description tokenizer:
  `0613663d0d48ea86ba8cb3d7a44f0f65dc596a2a`;
- speaker order: Rohit, then Divya;
- one shared description template, changing only `{speaker}`;
- CPU threads: four; inter-op threads: one; seed zero; `doSample: false`;
- `maxNewTokens: 2048`, a generation safety cap, not a target length.

The exact Hindi `spokenText` is read from `src/content/hi/narration.json`:
`USER_EXIT` (short), `run.main` (medium), and the concatenation of `DRAWDOWN_10`
with `reveal.main` (number in words plus the transliterated term “एपिसोड”). The
third clip combines existing entries rather than inventing an extra lesson.
All remain draft, and the listener chooses the voice; no approval is inferred.

First cache only the public description-tokenizer files online (no FLAN weights,
no gated-account token needed). This is separate from generation:

```sh
/home/nomad_aadi/venvs/tts/bin/python scripts/audition_audio.py --cache-tokenizer
```

Then check and generate entirely offline:

```sh
HF_HUB_OFFLINE=1 /home/nomad_aadi/venvs/tts/bin/python scripts/audition_audio.py \
  --check --model-dir /home/nomad_aadi/Documents/Projects/models/indic-parler-tts

HF_HUB_OFFLINE=1 OMP_NUM_THREADS=4 MKL_NUM_THREADS=4 \
  /home/nomad_aadi/venvs/tts/bin/python scripts/audition_audio.py \
  --model-dir /home/nomad_aadi/Documents/Projects/models/indic-parler-tts
```

The output is six PCM16 mono WAVs and `run.json` under the gitignored
`artifacts/tts-auditions/greedy-seed0/`, **not** `src/`, `public/`, or a deployment
manifest. The runner refuses to overwrite a nonempty output folder. A single
model instance is reused for both speakers. `modelLoadSeconds` is separate;
each `generationSeconds` measures text tokenization, inference, and WAV writing
using `perf_counter` wall time, excluding loading and post-generation metrics.
There is no warmup; the first clip can include first-inference overhead.
`durationSeconds`, real-time factor, WAV hash, RMS, peak, clipping fraction,
package versions, transcripts, and effective configuration are recorded per run.
These numerical checks cannot assess pronunciation or naturalness.

To try sampling **later**, copy the config, set `generation.doSample` to `true`,
keep an explicit fixed seed, and choose a new output directory:

```sh
HF_HUB_OFFLINE=1 /home/nomad_aadi/venvs/tts/bin/python scripts/audition_audio.py \
  --config /path/to/your/sampling-config.json \
  --model-dir /home/nomad_aadi/Documents/Projects/models/indic-parler-tts \
  --output-dir artifacts/tts-auditions/sampling-seed0
```

The seed resets before every clip. The existing episode CLI also accepts
`--do-sample`/`--no-do-sample`; both default greedy. Neither a fixed seed nor
greedy decoding promises byte-identical output across devices/package versions.
No full-set generation or runtime playback is part of this audition task.

## Conversion and review boundary

The provider first writes a temporary WAV. If `ffmpeg` is available, the CLI
converts it with mono, `libopus`, and 24 kbps settings. Missing `ffmpeg`, a
failed conversion, an empty file, a bad model, missing tokenizer, or failed
optional import stops the command with a non-zero error. It never creates a
silent placeholder or marks a failed track as available.

The generated files are not release assets merely because a command succeeded.
Before any asset is copied into a reviewed release set, a human must verify
English/Hindi pronunciation, naturalness, intelligibility, voice consistency,
number/symbol reading, safety wording, accessibility transcripts, output
licence/notice obligations, and the model's gated-access terms. Native-speaker
review is required for Hindi. Do not expose a “Listen” control or change the
UI's unavailable-audio state until reviewed assets and the release manifest
actually exist; this implementation deliberately does not modify UI/content
files.

Visible text and an accessible transcript remain the authoritative route for
every warning, formula, consent statement, and teaching explanation. Audio is
never the only route. No participant response, account data, telemetry, or
runtime external request enters this build.
