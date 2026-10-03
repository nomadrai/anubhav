# Third-party components, notices and remaining uncertainty

## Shipping boundary and evidence (2026-10-03)

The web app ships React/UI code, service-worker code, two ECB-derived episode
JSONs, original local icons, local content, and only quality-gated compact Opus
assets listed in `public/audio/manifest.json`. It does **not** ship Python,
FFmpeg, model weights, tokenizers, ASR weights, raw datasets, audition WAVs,
third-party fonts, analytics, or an external runtime service. Build-time
components and training sources remain part of the provenance of generated
audio; exclusion of weights does not automatically resolve output/voice rights.

This inventory is **agent-checked evidence, not legal clearance**. The user
reports accepting the Indic Parler gated conditions and reading its terms.
No token, credential, acceptance receipt, or private report is committed.
Unresolved training-subset/voice/output questions remain in the final human
handoff; no publisher approval is invented.

## Node/runtime inventory

`node scripts/inventory_licences.mjs` inspects installed package manifests and
notice paths, recording direct/transitive evidence in
[`NODE_DEPENDENCIES.json`](NODE_DEPENDENCIES.json). The session inventory found
**612 installed packages, no UNKNOWN licence declarations**. Declarations are
not an audit of every source file. Runtime React/scheduler and all installed
Workbox notice groups are copied verbatim into
[`public/THIRD_PARTY_NOTICES.txt`](../public/THIRD_PARTY_NOTICES.txt), together
with ECB attribution and modification disclosure. No third-party logo/font is
used; the app icon is original simple geometry.

| Component | Installed version | Declared licence | Role |
|---|---|---|---|
| React / React DOM | 19.3.0 | MIT | UI runtime, no external requests |
| Vite / React plugin | 8.3.2 / 6.1.1 | MIT | build/dev only |
| vite-plugin-pwa | 1.3.0 | MIT | build-time Workbox generation; generated SW ships |
| Tailwind CSS / PostCSS plugin | 4.3.3 | MIT | CSS build only |
| TypeScript | 6.0.3 | Apache-2.0 | type checking only |
| Vitest | 5.0.3 | MIT | tests only |
| ESLint | 10.11.0 | MIT | lint only |
| Prettier | 3.9.9 | MIT | formatting only |
| PostCSS / Autoprefixer | 8.5.28 / 10.6.1 | MIT | CSS processing only |
| @playwright/test | 1.63.0 | Apache-2.0 | new browser/e2e tests; uses installed Chrome, not shipped |
| @axe-core/playwright | 4.13.0 | MPL-2.0 | new automated accessibility rules in browser tests, not shipped; not WCAG certification |
| lighthouse | 13.5.0 | Apache-2.0 | new local mobile/performance audits, not shipped |

`npm audit --json` on 2026-10-03 reported **zero** advisories at every severity.
This is a package-advisory snapshot, not proof of absence of vulnerabilities.
No automatic dependency upgrades or paid services were used.

## Data and direct links

- Runtime ECB observations: exact source, receipt/hashes, conditions and quotes
  in [DATA_SOURCES.md](DATA_SOURCES.md), numeric review in
  [DATA_REVIEW.md](DATA_REVIEW.md). ECB permits accurate reuse with attribution
  and explicit notice of calculated modifications. This is **not** a claim of
  CC licensing/public domain. UI attribution and shipped notices retain it.
- EIA RWTC/Refinitiv candidates: remain unapproved research outside runtime;
  upstream redistribution terms are still unresolved. Their existing candidate
  `humanApproved: false` flags and source audit are preserved. No licence was
  inferred from EIA's general government-data policy.
- Official SEBI/government resources: direct pointers only; no official PDF,
  page copy, logo or script is embedded. Current official-page fetch evidence
  and bilingual label QA: [RESOURCE_CHECKS.md](RESOURCE_CHECKS.md). Link
  verification does not approve the destination's privacy or accessibility.

## Immutable TTS and ASR components

| Component | Exact identity | Evidence / purpose |
|---|---|---|
| Indic Parler model + prompt tokenizer | `ai4bharat/indic-parler-tts@7b527af5ee8ed1f9a28d80b19703ed9bb8ba10ca` | [Pinned card](https://huggingface.co/ai4bharat/indic-parler-tts/blob/7b527af5ee8ed1f9a28d80b19703ed9bb8ba10ca/README.md) declares Apache-2.0; user-supplied local checkpoint, offline TTS only. No independent weight-download receipt claimed. |
| Description tokenizer | `google/flan-t5-large@0613663d0d48ea86ba8cb3d7a44f0f65dc596a2a` | [Pinned card](https://huggingface.co/google/flan-t5-large/blob/0613663d0d48ea86ba8cb3d7a44f0f65dc596a2a/README.md) and official API declare Apache-2.0. Tokenizer/config only cached, **no separate FLAN weights**. Model config identifies this encoder. |
| Audio-codec lineage | `ylacombe/dac_44khz` | Identity is in the Indic Parler config; no separate codec checkpoint downloaded. Not an independent historical weight audit. |
| Hindi/English ASR | `openai/whisper-small@973afd24965f72e36ca33b3055d56a652f456b4d` | [Pinned card](https://huggingface.co/openai/whisper-small/blob/973afd24965f72e36ca33b3055d56a652f456b4d/README.md), official API fetched 2026-10-03: Apache-2.0, Hindi supported. Used only for build-time transcription/CER; cached weights are not deployed. |

Whisper's card attributes the model to OpenAI / Radford et al., *Robust Speech
Recognition via Large-Scale Weak Supervision* (2022), arXiv:2212.04356. It reports
680,000 hours of weakly supervised internet speech and warns about hallucination
and uneven language accuracy. Its Hindi Common Voice 11 WER entry is **87.3,
unverified**: this is a warning about limitations, not this app's measured WER.
ASR errors may reflect recognizer spelling/accent errors, TTS errors, or both.
CER is a bounded diagnostic, never native-speaker or semantic approval.

## Local build environment and licence evidence

The supplied reports were read and preserved unchanged:

- `/home/nomad_aadi/anubhav-tts-requirements.txt`, 103 entries,
  SHA-256 `cd7beafe91865323cacf15206f9e524cc048e7d5da883844ba62876d1d970a99`.
- `/home/nomad_aadi/anubhav-tts-licences.md`, 101 package rows,
  SHA-256 `b735e475536272a30a8e26ec6423daa886d4da34c83634a8c40619a027ea0816`.

Python environment: `/home/nomad_aadi/venvs/tts`, Python 3.12.3. Report licence
strings below are declarations, not retrospective amendments to those reports.

| Build-only component | Observed version / pin | Licence evidence / role |
|---|---|---|
| torch | 2.14.1+cpu | report: Apache-2.0, Apache-2.0 WITH LLVM-exception, BSD-2-Clause, BSD-3-Clause, BSL-1.0, MIT; tensor inference |
| transformers | 4.46.1 | Apache Software License; unchanged pinned loader |
| parler-tts | 0.2.2; `d108732cd57788ec86bc857d99a6cabd66663d68` | report UNKNOWN; [exact source LICENSE](https://github.com/huggingface/parler-tts/blob/d108732cd57788ec86bc857d99a6cabd66663d68/LICENSE) resolves Apache-2.0, copyright HuggingFace 2024 |
| descript-audiotools | 0.7.4; `348ebf2034ce24e2a91a553e3171cb00c0c71678` | MIT, supplied VCS pin |
| descript-audio-codec | 1.0.0 | MIT, report |
| torchaudio | 2.11.0+cpu | BSD, CPU wheel from official PyTorch index; see correction below |
| soundfile | 0.14.0 | BSD, WAV/Opus inspection |
| huggingface_hub | 0.36.2 | Apache, explicit build-time caching only |
| tokenizers / sentencepiece / safetensors | 0.20.3 / 0.2.2 / 0.8.0 | Apache; tokenization/checkpoint tools |
| numpy | 2.5.3 | BSD-3-Clause AND 0BSD AND MIT AND Zlib AND CC0-1.0, report |
| scipy | 1.18.1 | BSD, report; ASR resample_poly |
| librosa / soxr / einops | 1.0.0 / 1.1.0 / 0.8.2 | ISC / LGPL-2.1-or-later / MIT, report |
| protobuf | 4.25.9 | BSD-3-Clause, report |
| PyYAML | 6.0.3 TTS; **6.0.1 system episode CLI** | MIT, both actual installed metadata inspected |
| ffmpy | 1.0.0 | MIT; wrapper licence does not describe FFmpeg |
| psutil | 7.2.2 | BSD-3-Clause, actual metadata; peak RSS polling |
| setuptools | 78.1.0 | previously missing report entry; actual `setuptools-78.1.0.dist-info/licenses/LICENSE` inspected: MIT permission text |
| wcwidth | 0.9.1 | previously missing report entry; actual `wcwidth-0.9.1.dist-info/licenses/LICENSE`: MIT (Jeff Quast) plus Markus Kuhn permissive notice |
| system ffmpeg | 6.1.1-3ubuntu5 | observed GPL-enabled distribution build with libopus; build-time converter only |
| native libopus0 | 1.4-1build1 | `/usr/share/doc/libopus0/copyright`: BSD-2/BSD-3 clauses and contributor-specific sections |
| native libsndfile1 | 1.2.2-1ubuntu5.24.04.1 | installed distribution copyright record; LGPL and per-file terms, not inferred from Python wrapper |
| native libsoxr0 | 0.1.3-4build3 | distribution copyright: LGPL-2.1+, Spherepack/permissive FFT portions |

The native inventory above is focused on the conversion path, **not a complete
redistribution audit of the OS or every dynamically linked codec**. Those
binaries are not redistributed with the web app. If packaging a TTS executable,
container, notebook image or weights later, perform a separate complete audit.

The earlier prerequisite check only discovered packages; actual import failed
on CUDA `torchaudio` missing `libcudart.so.13`. Replaced only `torchaudio==2.11.0`
with `2.11.0+cpu` using `--no-deps --no-cache-dir` from the official CPU index.
Torch/Transformers/Parler were not upgraded. Imports and pip checks passed.
Both tokenizers then passed offline checks. The later TTS silence failure was
isolated to greedy decoding in controlled local experiments, not fixed by a GPU
or another unrecorded dependency change; see [TTS_DIAGNOSTICS.md](TTS_DIAGNOSTICS.md).

## Training attribution and uncertainty

Indic Parler's card credits **AI4Bharat and the Hugging Face audio team**, the
`ai4bharat/indic-parler-tts-pretrained` lineage, and Parler-TTS Mini. Model-card
training claims are not an audit of every training item or a blanket output
rights grant. No training dataset was downloaded or republished.

| Named upstream source | Evidence fetched/read this session | Remaining uncertainty |
|---|---|---|
| GLOBE | Model card's ambiguous `CC V1` remains verbatim historical evidence. [Original publisher card](https://huggingface.co/datasets/MushanW/GLOBE/raw/main/README.md) declares **CC0-1.0**, Common Voice 14 lineage; authors Wenbin Wang, Yang Song, Sanjay Jha, arXiv:2406.14875. | Annotated training fork `ai4b-hf/GLOBE-annotated@fc987baba5624d7b90bcf7e44593c861059325c0` API has **no licence field**. Original licence is now identified, but exact fork/subset mapping is not independently established. |
| IndicTTS | Model card says CC BY 4.0. Official AI4Bharat IndicTTS page fetched but returned navigation, not dataset terms. | Original dataset/version/attribution linkage and output applicability need confirmation; do not call this independently verified CC BY. |
| LIMMITS | Model card says CC BY 4.0. Official `https://ee.iisc.ac.in/limmitsdataset/` identifies IISc LIMMITS'25 and a terms link; no form submitted. Direct follow-up fetch returned 403. | Exact historical training version and original terms not established; third-party mirrors are not proof. |
| Rasa | Official API `https://huggingface.co/api/datasets/ai4bharat/Rasa` at `632f55c7ac590219d41cd7adffce5b440e4604f5` declares **CC BY 4.0**, AI4Bharat; description credits Bhashini/MeitY funding and EkStep/Nilekani support. | README file fetch returned 401 (gated). No new gated conditions accepted; exact historical subset/voice consent/output applicability not independently verified. |

Model-card citation requests retained: Sankar, Lacombe, Thomas, Srinivasa
Varadhan, Gandhi and Khapra, *Rasmalai* (Interspeech 2025), DOI
`10.21437/Interspeech.2025-2758`; Lacombe, Srivastav and Gandhi, *Parler-TTS*
(2024); Lyth and King, *Natural language guidance of high-fidelity text-to-speech
with synthetic annotations* (2024), arXiv:2402.01912.

## Publication actions that remain human decisions

- Confirm the working title and intended publication context.
- Resolve the exact IndicTTS/LIMMITS/annotated-GLOBE training/voice/output
  attribution ambiguity with model/dataset publishers if required for that
  context. Keep the user's gated acceptance record privately, without tokens.
- English listening and native Hindi pronunciation/meaning review remain
  **not performed**. Agent-checked text/audio may pass the revised technical
  gate with loud per-string warnings, never with a fabricated `reviewed` flag.
- Review host logging/privacy, real-device assistive technology and actual
  pilot consent before recruiting people. These are not settled by npm audit,
  model metadata, a successful bundle build, or an automated speech gate.
