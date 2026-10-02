# Third-party dependencies and licences

## Current status

The repository declares the fixed stack—Vite, React, strict TypeScript, Tailwind, Vitest, ESLint, Prettier, `vite-plugin-pwa`, and Python 3.10+ scripts—but `node_modules` is not present and installed package metadata has not been inspected. No model, dataset, font, audio asset, or licence has been approved. Stack names describe the requested dependencies, not licence conclusions.

Before release, inspect installed package metadata and lockfiles, including transitive dependencies, and record exact versions and licence evidence. Mark every unknown as **pending**; do not infer a licence from a package name or a registry summary. `TODO(human): complete package metadata review after installation.`

## Required inventory

For every runtime and build dependency, record package/version, direct or transitive status, licence identifier and source, copyright/notice obligations, security review status, bundle contribution, and whether it creates a runtime request. For future models, voices, datasets, icons, and fonts also record weights/assets, training or source-data terms where available, redistribution, attribution, privacy, and language restrictions.

No runtime model, dataset, external font, remote icon, analytics library, or telemetry provider is approved for Phase 0. Future audio-model investigation is described in [`AUDIO_PIPELINE.md`](AUDIO_PIPELINE.md) and is not a selection.

## Release evidence

Store a human-reviewed inventory with the release artifacts, not private credentials or downloaded assets. The release gate must fail for missing notices, incompatible terms, unknown provenance, or an unreviewed external request. A passing typecheck or bundle build does not prove licence compliance.
