# Privacy

## Phase 2 data boundary

The app may store only:

- selected language; and
- text-size preference.

These values may be held in memory and, if needed for the scaffold, in local storage under documented keys. Do not store names, contact details, account credentials, capital, predictions, financial positions, free-text financial details, pilot responses, or audio input. No cookies, accounts, analytics, advertising identifiers, or financial storage are allowed.

## Network boundary

Runtime requests are same-origin static asset requests only. There are no external API calls, model downloads, source fetches, telemetry, crash reporting, third-party fonts, or remote audio. Production CSP must use `connect-src 'self'`; a human must review the complete CSP before release. Build-time preparation may read a local, human-approved file but must not silently upload it.

## Pilot boundary

Phase 2 has no remote collection or pilot data store. A future pilot must use consent, a local or separately approved collection process, data minimisation, retention/deletion rules, access control, and an approved information sheet. See [`PILOT.md`](PILOT.md). Never describe local browser state as anonymous research evidence without checking the threat model.

## Privacy review checklist

Before release, confirm storage keys and values, clear/reset behavior, browser persistence, service-worker scope (if any), CSP, source maps, build logs, generated manifests, and failure messages. `TODO(human): record the actual review and retention decision.`
