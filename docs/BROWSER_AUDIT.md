# Browser and accessibility audit

**Scope:** Phase 3 implementation at commit `36bcb51`, plus the current local documentation-only acquisition-command correction.
**Audit date:** 2026-10-03.

This is an automated/local engineering audit. It is not a screen-reader, native-speaker, colour-vision, or human accessibility sign-off.

## Evidence completed

- `npm run build` completed successfully.
- `npm run test` completed with 63 tests, including jsdom journey tests for decision pauses, hidden period/source before Reveal, forced settlement, user exit, replay, and restart.
- `npm run check:content` passed; it warns that no reviewed audio manifest exists.
- `npm run check:bundle` passed.
- A production build was served from localhost with Python's static server and inspected with Google Chrome headless at `360x640`:
  - Chrome returned exit code `0`.
  - The initial page contained one `h1`, language buttons, a visible English page title, and `lang="en"` on the document.
  - Production CSP was present: `default-src 'self'; connect-src 'self'`.
  - Evidence was kept temporarily at `/tmp/anubhav-dom.html`; no participant data or screenshots were retained in the repository.
- Static source audit found no runtime `fetch`, XHR, analytics, cookie, `localStorage`, `sessionStorage`, or `sendBeacon` use. Build-time source/resource acquisition remains separate from the browser.

## Findings

### B1 — full manual accessibility matrix remains open — release blocker

The repository has not demonstrated, with a real assistive technology or manual browser session:

- complete keyboard traversal through English and Hindi journeys;
- screen-reader announcements for live status changes and decision pauses;
- 200% zoom and no horizontal scroll at 360x640;
- reduced-motion behavior during the full journey;
- colour-vision/non-colour status comprehension;
- actual Slow 3G and 4x CPU observations;
- native-speaker Hindi meaning and pronunciation.

The jsdom tests are useful regression evidence but cannot provide those human observations. Keep the release gate blocked until a reviewer records browser, assistive technology, build commit, viewport, and failures.

### B2 — text-size control is not implemented — product/accessibility gap

`src/components/TextSizeControl.tsx` still returns `null`, and the current app does not render a text-size control. The accessibility checklist and older walkthrough language refer to a text-size control. Either implement and test the control or remove/update those claims and checklist rows before release. Do not claim text-size support based on CSS alone.

### B3 — audio playback remains intentionally unavailable

`src/audio/AudioManager.ts` is still a contract stub and `src/components/AudioControls.tsx` renders an unavailable-audio status. This is correct while the gated model, generated assets, manifest, pronunciation review, and accessibility transcript review are absent. Do not enable a Listen control based on the fake backend tests or a dry-run plan.

## Privacy and network result

The production build's CSP is same-origin for connections, and static source inspection found no runtime external request or local financial/personal storage. This does not replace a human CSP review in a deployed browser, nor does it make external pages linked from a future verified-resource list part of the app's same-origin runtime boundary.

## Manual sign-off required

A human reviewer must run the journey in a normal browser at 360x640 and desktop sizes, with keyboard and screen reader, test 200% zoom/reduced motion, inspect language/draft labels, and record the exact build commit. Native Hindi review and audio pronunciation review are separate approvals. Until those records exist, `npm run release` must remain red.
