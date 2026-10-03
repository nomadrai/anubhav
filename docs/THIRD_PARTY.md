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
| Indic Parler model/voice | local audition checkpoint; pinned below; not bundled | Model card declares Apache-2.0; human review pending | optional offline `scripts/providers/indic_parler.py` | no | user reports gated conditions accepted; output/voice/data terms and native-speaker review remain pending |
| EIA RWTC candidate snapshots | EIA reuse statement; upstream rights pending | TODO(human) | non-runtime `data/candidates/`; see `docs/DATA_SOURCES.md` | no | human redistribution review required |

For every transitive dependency, future models, voices, datasets, icons, and fonts record direct/transitive status, licence source, notice obligations, security status, bundle contribution, runtime request, redistribution, attribution, privacy, and language restrictions.

No runtime model, dataset, external font, remote icon, analytics library, or telemetry provider is approved. The EIA candidates are not imported into `src/data/episodes/`. The Indic Parler entry is a Phase 3 **offline build candidate**, not a bundled model, reviewed voice, or released audio asset.

## Phase 3 offline Indic Parler provenance

**Decision and shipping boundary:** use `ai4bharat/indic-parler-tts` for optional local, build-time TTS auditions. Python packages, native converters, tokenizers, and model weights are **build-time tools, not shipped with the web app**. Models/tokenizers and upstream training sources are third-party components in the provenance of eventual shipped audio, not deployed weights or datasets. This distinction does not settle output rights or remove applicable notice obligations. Audio generated now is **audition material, not release-approved audio**; no listening, native-speaker, accessibility, safety, or legal approval is claimed.

### Local evidence and immutable model/tokenizer pins

The user reports accepting the gated model conditions and downloading the checkpoint below. The local public `README.md` and `config.json` were read; this is not an independent verification of the download's weight hashes or a retained access receipt. No credentials are part of this record.

| Component | Recorded identity / location | Evidence and scope |
|---|---|---|
| Indic Parler checkpoint and prompt tokenizer | `ai4bharat/indic-parler-tts` at `7b527af5ee8ed1f9a28d80b19703ed9bb8ba10ca`; local directory `/home/nomad_aadi/Documents/Projects/models/indic-parler-tts` | Local model card declares Apache-2.0 and English/Hindi support; [pinned upstream card](https://huggingface.co/ai4bharat/indic-parler-tts/blob/7b527af5ee8ed1f9a28d80b19703ed9bb8ba10ca/README.md). Revision/download and gated acceptance are user-reported, not release sign-off. |
| Separate description tokenizer | `google/flan-t5-large` at `0613663d0d48ea86ba8cb3d7a44f0f65dc596a2a` | Official [Hugging Face API](https://huggingface.co/api/models/google/flan-t5-large) returned this current immutable SHA and `license: apache-2.0`; its [pinned card](https://huggingface.co/google/flan-t5-large/blob/0613663d0d48ea86ba8cb3d7a44f0f65dc596a2a/README.md) also declares Apache-2.0. This pin is for the description tokenizer, not a request to download separate FLAN-T5 weights. |
| Local Python environment | `/home/nomad_aadi/venvs/tts`, Python `3.12.3` | Supplied package versions and VCS pins below were read in full. Actual imports exposed a CUDA `torchaudio` wheel on this CPU-only machine; the same release's CPU wheel was substituted as recorded below. |

The checkpoint's `config.json` names `google/flan-t5-large` at `text_encoder._name_or_path`; the model card explicitly uses different prompt and description tokenizers. The description tokenizer therefore has its own provenance pin rather than inheriting the Indic Parler revision. The same config names `ylacombe/dac_44khz` as audio-encoder provenance; no separate codec checkpoint download or deployment is approved by this record.

### Supplied build-environment package evidence

The complete user-authorized reports were read: `/home/nomad_aadi/anubhav-tts-requirements.txt` (103 entries) and `/home/nomad_aadi/anubhav-tts-licences.md` (101 package rows). This focused TTS inventory records their actual supplied versions, not suggested versions or proof that the environment runs successfully. Licence strings below are package-report declarations unless explicitly identified as source evidence. The full transitive notice/security audit remains pending; these local report paths are evidence references, not app dependencies.

| Build-time package | Supplied version / source pin | Licence evidence | Purpose |
|---|---|---|---|
| `torch` | `2.14.1+cpu` | Report: `Apache-2.0 AND Apache-2.0 WITH LLVM-exception AND BSD-2-Clause AND BSD-3-Clause AND BSL-1.0 AND MIT` | CPU tensor/model inference |
| `transformers` | `4.46.1` | Report: Apache Software License | Model/tokenizer loading |
| `parler_tts` / `parler-tts` | `0.2.2`; `git+https://github.com/huggingface/parler-tts.git@d108732cd57788ec86bc857d99a6cabd66663d68` | Report: **UNKNOWN**; independently read [LICENSE at this exact commit](https://github.com/huggingface/parler-tts/blob/d108732cd57788ec86bc857d99a6cabd66663d68/LICENSE): **Apache-2.0**, copyright 2024 The HuggingFace Inc. team | Parler synthesis implementation |
| `descript-audiotools` | `0.7.4`; `git+https://github.com/descriptinc/audiotools@348ebf2034ce24e2a91a553e3171cb00c0c71678` | Report: MIT | Audio tooling dependency |
| `descript-audio-codec` | `1.0.0` | Report: MIT | Audio codec implementation |
| `torchaudio` | Supplied: `2.11.0`; audition environment: **`2.11.0+cpu`** | Report: BSD License; CPU wheel from the official PyTorch CPU index | Replaced the CUDA wheel with the same release's CPU wheel using `--no-deps`; Torch was not changed. Imports now succeed. Real audition results remain separate compatibility evidence. |
| `soundfile` | `0.14.0` | Report: BSD License | Temporary WAV writing; native libsndfile evidence is separate |
| `huggingface_hub` | `0.36.2` | Report: Apache Software License | Build-time artifact/cache tooling; no runtime service |
| `tokenizers` | `0.20.3` | Report: Apache Software License | Text tokenization |
| `sentencepiece` | `0.2.2` | Report: Apache-2.0 | SentencePiece tokenizer support |
| `safetensors` | `0.8.0` | Report: Apache Software License | Checkpoint serialization |
| `numpy` | `2.5.3` | Report: `BSD-3-Clause AND 0BSD AND MIT AND Zlib AND CC0-1.0` | Audio/tensor array conversion |
| `scipy` | `1.18.1` | Report: BSD License | Numerical/audio dependency |
| `librosa` | `1.0.0` | Report: ISC License (ISCL) | Audio-analysis dependency |
| `soxr` | `1.1.0` | Report: LGPL-2.1-or-later | Resampling dependency; native-library/notice review remains pending |
| `einops` | `0.8.2` | Report: MIT License | Tensor rearrangement dependency |
| `protobuf` | `4.25.9` | Report: 3-Clause BSD License | Serialization/tokenizer support |
| `PyYAML` | `6.0.3` in this TTS environment | Report: MIT License | Metadata support; does not establish the separate episode-preparation environment's version |
| `ffmpy` | `1.0.0` | Report: MIT | Python FFmpeg wrapper dependency; not evidence for the actual FFmpeg binary |
| `setuptools` | `78.1.0` | **pending**: requirements entry, absent from supplied licence report | Python packaging tooling |
| `wcwidth` | `0.9.1` | **pending**: requirements entry, absent from supplied licence report | Terminal-width dependency |
| System `ffmpeg` | User reported `6.1.1`; observed `6.1.1-3ubuntu5`, built with `--enable-gpl` and `--enable-libopus` | Build flags are evidence, not a complete native notice review | Future WAV/Opus conversion; the six auditions are WAV-only, with no FFmpeg encoding |
| `libopus`, `libsndfile`, other native libraries | `TODO(human)`: full native inventory | Terms/notices must be inventoried separately from Python wrappers | Native audio I/O/conversion |

Supplied-report SHA-256 anchors (original files were not modified):

- `anubhav-tts-requirements.txt`: `cd7beafe91865323cacf15206f9e524cc048e7d5da883844ba62876d1d970a99`
- `anubhav-tts-licences.md`: `b735e475536272a30a8e26ec6423daa886d4da34c83634a8c40619a027ea0816`

The pinned `parler-tts` source LICENSE resolves the repository's licence evidence; it does **not** change what `pip-licenses` reported or approve every transitive component. Keep applicable licence copies, copyright/attribution notices, and any upstream NOTICE obligations in the human-reviewed release evidence. Do not infer FFmpeg's licence from `ffmpy`, or native-library terms solely from Python wrappers.

### Local environment correction and offline tokenizer preparation

The original `--check` tested package discoverability rather than successful imports.
A real `import parler_tts` failed through `torchaudio` on missing `libcudart.so.13`.
Only `torchaudio==2.11.0` was replaced with `torchaudio==2.11.0+cpu`, from
`https://download.pytorch.org/whl/cpu`, using `--no-deps --no-cache-dir` in the supplied
venv. PyTorch `2.14.1+cpu`, Parler and Transformers were left unchanged. The supplied
freeze/licence reports remain the original evidence, not silently overwritten inventories.

`google/flan-t5-large` tokenizer files were cached at the immutable pin above using
`scripts/audition_audio.py --cache-tokenizer`. Only `config.json`, `tokenizer.json`,
`tokenizer_config.json`, `special_tokens_map.json`, and `spiece.model` were requested;
no separate FLAN model weights were downloaded. The strengthened `--check` passed
with `HF_HUB_OFFLINE=1`, after importing the actual optional stack and loading both
tokenizers offline. Tokenizer hashes and both pins enter generation provenance.

### Training-data and upstream attribution

The local Indic Parler model card credits the **AI4Bharat and Hugging Face audio teams**, describes this checkpoint as a fine-tune of `ai4bharat/indic-parler-tts-pretrained`, and identifies the Parler-TTS Mini lineage. Its training-data table names the following upstream sources. These are **model-card claims**, not independently audited dataset licences or a blanket licence for generated speech:

| Training source named by the model card | Card's licence text | Attribution/review status |
|---|---|---|
| GLOBE (front matter points to `ai4b-hf/GLOBE-annotated`) | `CC V1` | Ambiguous label; do not silently interpret it as CC0 or another specific licence. `TODO(human)`: resolve original licence and attribution evidence. |
| IndicTTS | `CC BY 4.0` | `TODO(human)`: retain original source, author and attribution evidence and review applicability to outputs. |
| LIMMITS | `CC BY 4.0` | `TODO(human)`: retain original source, author and attribution evidence and review applicability to outputs. |
| Rasa | `CC BY 4.0` | `TODO(human)`: retain original source, author and attribution evidence and review applicability to outputs. |

The card requests citation of Sankar et al., *Rasmalai: Resources for Adaptive Speech Modeling in IndiAn Languages with Accents and Intonations* (Interspeech 2025, DOI `10.21437/Interspeech.2025-2758`); Lacombe, Srivastav and Gandhi, *Parler-TTS* (2024); and Lyth and King, *Natural language guidance of high-fidelity text-to-speech with synthetic annotations* (2024, arXiv `2402.01912`). These attribution pointers come from the local card; bibliography and final required notices still need human review. No training dataset has been downloaded or approved for redistribution through this documentation update.

### Remaining build and release requirements

The provider must remain local-only (`local_files_only=True`) and fail closed on missing dependencies, either tokenizer, model files, or the converter. Acquiring public build artifacts separately is not permission for app/runtime external requests. Weights and generated audition artifacts remain outside committed release assets.

- Record both tokenizer identities/revisions, the model revision, voice description, spoken-text hashes, seed/device, package versions, converter settings, and output hashes in build provenance; inventory alone is not proof of deterministic output or successful generation.
- `TODO(human)`: retain the gated-access acceptance record without credentials; confirm applicable terms, model/codec/training-source provenance, voice/output rights, and Apache-2.0/other licence and notice obligations.
- `TODO(human)`: finish the transitive and platform/native-library inventory and compatibility checks. The supplied reports are not a security or redistribution clearance.
- `TODO(human)`: obtain English listening review, native-speaker Hindi review, pronunciation/number/symbol checks, safety-copy review, accessibility/transcript checks, and output-quality approval for every released asset. Hindi remains draft until that review; a successful audition command must not mark audio release-ready.

## Release evidence

Store a human-reviewed inventory with the release artifacts, not private credentials or downloaded assets. The release gate must fail for missing notices, incompatible terms, unknown provenance, or an unreviewed external request. A passing typecheck or bundle build does not prove licence compliance.
