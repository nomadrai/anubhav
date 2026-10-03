# Reproducible static build and deployment

## Toolchain and committed inputs

Observed locally: **Node 24.16.0, npm 12.0.2**. Use `npm ci` with the committed
`package-lock.json`; do not resolve floating package.json ranges with a fresh
unlocked install. Python/model packages are **not required to serve the web app**.
Episode JSON and passed compact audio/manifest are static committed inputs.
Raw source downloads, model weights, HF caches, audition/rejected WAVs, browser
reports and credentials are excluded.

```sh
git clone <YOUR_REPOSITORY_URL> app
cd app
git checkout <THE_RECORDED_LOCAL_MILESTONE_COMMIT>
npm ci
npm run release
npm run test:browser
npm run check:performance
```

Replace placeholders deliberately; no repository URL/account is invented.
Browser commands use installed `/usr/bin/google-chrome` or `CHROME_PATH`.
A red content/audio gate means stop; do not omit it for a publishable build.
To reproduce numerical/source checks additionally install Python 3.10+/PyYAML
and run the commands in scripts/README. Rebuilding speech requires the separately
documented gated-access local model/ASR environment, not a browser dependency.

**Executed clean-checkout evidence:** cloned the local repository with
`git clone --no-hardlinks --no-checkout`, checked out `2390e00` in a fresh
`/tmp/anubhav-clean-*` directory, then ran `npm ci --no-fund --no-audit`
(612 packages), `npm run build` (13 precache entries), and `npm run check:bundle`
successfully. `npm run release` passed lint/types/151 tests, then correctly
failed on the incomplete manifest and missing `hi:DRAWDOWN_5`. No model/raw
cache/venv was copied or needed. Full disposition is in FINISH_REPORT.md.
The temporary checkout was removed after verification to recover disk space.
The clean install emitted the upstream glob@11.1.0 deprecation warning; no
unreviewed dependency upgrade was made. The separate npm advisory audit
reported zero known advisories, not blanket security clearance.

## Static host configuration

- Serve **only `dist/`**, never the repository, source data, artifacts, venv or
  model/cache directories. No server-side app/API or secrets are needed.
- Use HTTPS (localhost permitted for local tests), a **dedicated origin** and
  root path `/`; the current manifest/service-worker scope and audio paths are
  root-relative. Subpath hosting requires a reviewed base/scope/path change.
- Enable gzip/Brotli for JS/CSS/JSON; local gzip budgets do not configure host
  compression. Audio is Opus/Ogg and should use `Content-Type: audio/ogg`.
- Serve `/audio/manifest.json` and `/sw.js` with revalidation/no-cache; hashed
  assets may use long-lived immutable caching. Do not use a fallback page for
  missing `/audio/*` files; return 404. Do not rewrite every asset error as HTML.
- Static navigation may fall back to `/index.html`; the app's journey is in
  memory, not independent deep-link routes. Reload intentionally loses answers.
- `public/_headers` is copied into dist for compatible hosts. Other hosts must
  explicitly set equivalent response headers; a file sitting on disk is not
  evidence the server applied it. Header CSP includes `frame-ancestors 'none'`,
  which a meta tag cannot enforce. Verify with a real HTTPS response.

Required policy (see current `_headers` for authoritative deployed value):

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; media-src 'self' blob:; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff
```

Inline styles remain allowed for React meter widths; no inline script or eval
permission is added. The production HTML also carries a restrictive meta CSP,
but deployment headers remain necessary for frame protection. Confirm host
access-log/privacy/retention settings before participants use the origin.

## Preview and smoke test

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
# In another terminal, use the recorded browser checks; stop preview afterwards.
```

Verify both languages/episodes, required prediction/reflection, same-series
comparison, hidden period/source, captions/glossary, Listen/pause/replay and
text fallback. Warm shell + at least one clip, disable networking, reload and
confirm cached playback. A never-requested clip should visibly fall back.
Verify no automatic external traffic, no answer persistence, and restrictive
headers. Installability/OS prompts vary; no platform-specific install promise.

## Deployment disposition

`command -v vercel netlify wrangler firebase` found **no CLI** in this environment
on 2026-10-03. No existing authenticated static-host CLI was available; no new
account, credentials search, CLI login, upload, preview URL, paid tier, push or
production-domain deployment was attempted. **There is no deployed preview URL.**
The user must choose/authenticate a host before that step can be completed.
A local preview is not a public deployment. After authentication, publish a
preview only, inspect actual HTTPS headers/logging and rerun browser/network
checks there before any separate production decision.
