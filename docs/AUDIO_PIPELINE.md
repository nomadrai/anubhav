# Audio pipeline

## Phase 0 boundary

The audio command is a stub contract: it produces no sound, performs no playback, downloads no model, and makes no runtime request. The repository currently has no `generate_audio.py` entrypoint; `scripts/README.md` records the intended dry-run interface:

```sh
python scripts/generate_audio.py --provider stub --dry-run --episode EPISODE.json
```

A future stub should emit a JSON dry-run plan with spoken text and SHA-256 content hashes, explicitly set `manifestGenerated: false`, and create no audio or manifest. `TODO(human): confirm the final CLI implementation and flags.` Phase 0 has no offline audio behavior.

## Future pipeline proposal (not selected or verified)

A later implementation may evaluate an Indic Parler-style text-to-speech model on GPU. This is a recommendation for investigation only; model availability, language quality, hardware requirements, weights, and licence have **not** been verified. No runtime model or dataset is included or claimed. Human review must approve the exact model, weights, voice data, privacy implications, and licence before work begins.

The future offline build could use `ffmpeg` to convert approved files to mono 24 kbps audio and apply `loudnorm`. The existing script notes specify mono 24 kbps Opus; `loudnorm`, exact container settings, and other normalization details remain future requirements, not completed output. Exact codec/container, loudness target, silence trimming, pronunciation, and Hindi quality need human sign-off.

Future incremental builds may hash normalized input text, language, voice/model version, and pipeline configuration. A changed hash must rebuild; identical verified inputs may reuse output. The hash must not include private participant responses. The repository’s current ignore contract covers `public/audio/manifest.json` and `public/audio/**/*.opus`; keep generated manifests/audio ignored and do not commit them.

## Accessibility and safety

Every audio item needs equivalent visible text and an accessible transcript. “Listen” must remain hidden or disabled until sound exists and has been reviewed. Never make audio the only route to a formula, warning, or consent statement. A missing file, unsupported language, or model failure must leave text usable and must not silently claim playback.
