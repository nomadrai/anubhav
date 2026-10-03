# Third-party dependencies and licences

## Current status

The fixed stack is installed for local checks. Package metadata below was read from the installed lockfile/package manifests, but human licence/notice review is still pending. Two EIA candidate snapshots exist as non-runtime research artifacts under `data/candidates/`; no model, dataset, font, audio asset, or runtime external service has been approved. A package SPDX field is recorded as evidence, not as a substitute for legal review.

Before release, inspect installed package metadata and lockfiles, including transitive dependencies, and record exact versions and licence evidence. Mark every unknown as **pending**; do not infer a licence from a package name or a registry summary. `TODO(human): complete package metadata review after installation.`

## Direct dependency inventory (human review pending)

| Package | Installed version | Declared licence | Purpose / location | Runtime request? | Review |
|---|---:|---|---|---|---|
| React / React DOM | 19.3.0 | MIT | UI runtime, `src/` | no | TODO(human): review notice |
| Vite | 8.3.2 | MIT | dev server/build | no | TODO(human): review notice |
| `@vitejs/plugin-react` | 6.1.1 | MIT | Vite JSX transform | no | TODO(human): review notice |
| `vite-plugin-pwa` | 1.3.0 | MIT | disabled PWA stub, `vite.config.ts` | no in Phase 2 | TODO(human): review notice |
| Tailwind CSS / `@tailwindcss/postcss` | 4.3.3 | MIT | CSS build | no | TODO(human): review notice |
| TypeScript | 6.0.3 | Apache-2.0 | type checking | no | TODO(human): review notice |
| Vitest | 5.0.3 | MIT | tests | no | TODO(human): review notice |
| ESLint | 10.11.0 | MIT | lint | no | TODO(human): review notice |
| Prettier | 3.9.9 | MIT | formatting contract | no | TODO(human): review notice |
| PostCSS / Autoprefixer | 8.5.28 / 10.6.1 | MIT / MIT | CSS processing | no | TODO(human): review notice |
| `PyYAML` | >=6.0 (Python environment) | TODO(human) | metadata parsing in `scripts/prepare_episode.py` | no | verify installed version and licence |
| Indic Parler model/voice | candidate only; not bundled | Model card declares Apache-2.0; human review pending | optional offline `scripts/providers/indic_parler.py` | no | gated access, exact checkpoint/revision, voice/data terms, and native-speaker review required |
| EIA RWTC candidate snapshots | EIA reuse statement; upstream rights pending | TODO(human) | non-runtime `data/candidates/`; see `docs/DATA_SOURCES.md` | no | human redistribution review required |

For every transitive dependency, future models, voices, datasets, icons, and fonts record direct/transitive status, licence source, notice obligations, security status, bundle contribution, runtime request, redistribution, attribution, privacy, and language restrictions.

No runtime model, dataset, external font, remote icon, analytics library, or telemetry provider is approved. The EIA candidates are not imported into `src/data/episodes/`. The Indic Parler entry is a Phase 3 **offline build candidate**, not a bundled model, reviewed voice, or released audio asset.

## Phase 3 offline Indic Parler requirements

**Decision:** keep `ai4bharat/indic-parler-tts` as the optional open-source TTS path for an offline build, while keeping it unavailable to the app until evidence is complete. The model card declares Apache-2.0 and lists English and Hindi support; it also requires gated access and describes a large roughly 0.9B-parameter checkpoint. A model-card licence declaration is evidence for the model repository, not approval of the training data, voice outputs, dependent libraries, or redistribution terms.

**Required before a real build or release:**

- a human-approved gated-access record and a locally stored checkpoint outside git;
- an immutable model revision, model id, local model path, voice-description configuration, seed/device, and converter settings recorded in the generated manifest;
- compatible local versions and notices for `torch`, `transformers`, `parler-tts`/`parler_tts`, `soundfile`, and the system `ffmpeg` binary; these remain optional and are not added to the web bundle;
- review of the model card, code, model dependencies, training-data/voice provenance, Apache-2.0 notice obligations, and any gated terms; and
- native-speaker Hindi review plus accessibility, pronunciation, safety-copy, and output-quality review for every released asset.

The provider uses `local_files_only=True`, requires a caller-supplied checkpoint and revision, and fails closed when an optional dependency, tokenizer, model file, or `ffmpeg` converter is absent. It performs no runtime request and does not commit weights, WAV files, Opus files, or manifests. `TODO(human)`: record exact dependency versions, platform/native-library evidence, model-access receipt, and final licence/voice decision before release.

## Release evidence

Store a human-reviewed inventory with the release artifacts, not private credentials or downloaded assets. The release gate must fail for missing notices, incompatible terms, unknown provenance, or an unreviewed external request. A passing typecheck or bundle build does not prove licence compliance.
