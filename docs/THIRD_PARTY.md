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
| Indic Parler model/voice | not selected | TODO(human) | future `scripts/providers/indic_parler.py` | no | do not add until terms reviewed |
| EIA RWTC candidate snapshots | EIA reuse statement; upstream rights pending | TODO(human) | non-runtime `data/candidates/`; see `docs/DATA_SOURCES.md` | no | human redistribution review required |

For every transitive dependency, future models, voices, datasets, icons, and fonts record direct/transitive status, licence source, notice obligations, security status, bundle contribution, runtime request, redistribution, attribution, privacy, and language restrictions.

No runtime model, dataset, external font, remote icon, analytics library, or telemetry provider is approved for Phase 2. The EIA candidates are not imported into `src/data/episodes/`. Future audio-model investigation is described in [`AUDIO_PIPELINE.md`](AUDIO_PIPELINE.md) and is not a selection.

## Release evidence

Store a human-reviewed inventory with the release artifacts, not private credentials or downloaded assets. The release gate must fail for missing notices, incompatible terms, unknown provenance, or an unreviewed external request. A passing typecheck or bundle build does not prove licence compliance.
