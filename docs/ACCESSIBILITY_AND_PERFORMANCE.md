# Accessibility and performance

## Targets

These are targets, not measurements. The repository was empty when this document was written; measured fields remain blank.

| Metric | Target | Measured | Method/date |
|---|---:|---:|---|
| JavaScript transfer | ≤150 KiB | — | `TODO(human)` |
| CSS transfer | ≤20 KiB | — | `TODO(human)` |
| first usable interaction | record actual result | — | `TODO(human)` |
| offline behavior | no Phase 0 claim | not supported | verify scaffold says unavailable |

Do not claim the budgets are met until production build output is measured, compressed transfer sizes are recorded, and `npm run check:bundle` passes. A PWA plugin does not by itself mean offline support exists.

## Required manual matrix

Test the clickable scaffold at 360×640 CSS pixels and on a desktop keyboard flow. Test Slow 3G and 4× CPU slowdown in a real browser profile. Record browser, build commit, transfer sizes, largest contentful/interactive observations, and failures.

Keyboard checks: logical tab order; visible focus; no keyboard trap; Enter/Space activation; skip/restart behavior; error and placeholder announcement; reveal cannot occur accidentally; language and text-size controls have names.

Screen-reader checks: landmarks and one page heading; accessible names for every control; live-region status for transitions; formula and percentage spoken text; draft-Hindi label; hidden period remains hidden in DOM semantics until reveal; no information conveyed by color alone.

Viewport checks: no horizontal scrolling at 360×640; readable line length; target size; zoom to 200% without loss of function; reduced-motion preference; touch and keyboard equivalence.

## Offline and failure disclosure

Phase 0 does not support offline use. If the browser loses the static asset request, show a plain failure message rather than implying the app continues offline. Do not add a service-worker cache claim until an offline test and privacy review pass.

## Performance boundaries

Keep the synthetic fixture small and deterministic. Do not preload models, audio, real datasets, or external fonts. Bundle and content checks must fail on budget regressions or oversized generated artifacts once scripts exist. A performance result without the method and build identifier is not evidence.
