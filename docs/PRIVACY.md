# Privacy boundary and agent review

## What is retained

- `localStorage.learning.language`: `en` or `hi`.
- `localStorage.learning.text-size`: chosen reading-size preference.
- Public app assets and requested public audio may be held by the service
  worker in Cache Storage. Workbox may keep public-cache expiry metadata in
  IndexedDB. These are **not participant responses**.
- Prediction, virtual amount/exposure, choices, post-check and pilot summary
  live only in React reducer memory. They are not written to localStorage,
  sessionStorage, IndexedDB, a URL, a cookie, an export file, or a server.
  Explicit optional summary copying puts chosen responses on the device
  clipboard; the app neither sends nor retains that copy. Clipboard history
  outside the app can persist it, so it is never automatic.
  Restart/refresh/closing the tab discards in-app answers. Restart preserves preferences;
  clearing this origin's browser site data removes preferences and caches.
- No microphone, contacts, SMS, account, cookie, personal identifier, portfolio,
  payment, analytics, remote logger or telemetry is requested/implemented.

The preference helper is `src/journey/preferences.ts`; storage-denied browsers
fall back to memory. `AudioManager` reads only build-time public narration,
never learner answers. Source maps are not enabled for the production bundle.
The public audio manifest contains fixed content/voice/build hashes/metrics,
not local user paths, credentials, participant inputs or generated private text.

## Network and host scope

All automatic runtime requests are same-origin static JS/CSS/icons/service
worker/manifest/audio. No live market feed, model inference, source acquisition,
third-party font or external API runs in the browser. CSP restricts `connect-src`
and media to the app's origin (media blob also allowed); form submission is
blocked. Production header instructions: [DEPLOYMENT.md](DEPLOYMENT.md).

Verified resources are explicit outbound links, not embedded or prefetched
content. A learner deliberately following one leaves the app; that service may
use accounts, forms, cookies, analytics and its own retention policy. The app
claims neither anonymity nor tracking-free destination behavior. Links use
`noopener noreferrer`; the preview also sets `Referrer-Policy: no-referrer`.

The static **host** necessarily receives ordinary request metadata such as IP
and user agent. No authenticated preview host has been assumed or provisioned.
Host logging/retention is a publication decision, not something browser code or
our same-origin assertion can eliminate. Review it before participant use.

## Offline cache scope

Root-scope app on a dedicated origin. Workbox clears obsolete precaches; the
small app-owned cleanup script removes superseded `learning-audio-*` cache
versions without clearing unrelated caches. Manifest uses NetworkFirst with a
three-second fallback; requested hashed Opus uses CacheFirst. Runtime audio
cache is bounded to 80 entries/30 days, may be evicted, and does not promise a
full language pack. Never persist answers for an offline resume feature.

## Evidence and remaining human action

Agent source/storage/CSP audit: source search found application persistence only
in the preference helper; reducer answers are not serialized. Regression tests
assert memory-only answers and cleared state on reload. Actual browser/offline/
request checks and limitations are in
[ACCESSIBILITY_AND_PERFORMANCE.md](ACCESSIBILITY_AND_PERFORMANCE.md).

The previous implementation-retention TODO is resolved for app behavior:
**no participant-answer retention**. Human action remains for the chosen host
and any facilitator's separately collected notes: disclose purpose, access,
retention/deletion/contact route and obtain appropriate consent. No pilot was
run and no external notes were read or imported. See [PILOT.md](PILOT.md).
