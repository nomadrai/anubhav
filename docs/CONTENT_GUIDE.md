# Content guide

## Voice, scope and sources of truth

Write English first, then Hindi. Keep sentences plain, calm, non-judgmental and specific about uncertainty. Each teaching sentence is at most 25 words; split longer ideas. Never promise safety, profit, prediction or recovery. No recommendations, real instrument names, promotion or profit scoring.

Runtime copy lives in `src/content/en/` and `src/content/hi/`, not in this guide. Both languages must have matching keys, entry IDs and interpolation placeholders, including repeated placeholders. `features.json` contains the newer product/audio/offline/pilot copy; it follows the same review and length rules as the older dictionaries. Only implemented and tested behavior may be described as available.

Production episodes are `historical-crash` and `historical-choppy`, with neutral observed-path language. Keep their period hidden until reveal and real instrument identity hidden throughout. The preserved synthetic JSON files are regression fixtures, not exported production content. Never infer a cause from a path alone or treat one episode as a forecast.

## Review states and evidence

The 2026-10-03 finish authorization in `AGENTS.md` supersedes the earlier requirement that Hindi always remain draft until human review:

- `draft`: incomplete or unchecked; blocks content and release checks in either language.
- `agent-checked`: permitted only after a recorded leaf-by-leaf bilingual QA/back-translation pass. Both checkers emit a loud warning naming **every** such user-facing leaf by file, path/ID and language. This is not human or native-speaker approval.
- `reviewed`: reserved for actual authorized human evidence. Agents must never assign it to production content. Tests may construct hypothetical reviewed fixtures in temporary directories to verify clean policy behavior.
- `planned`: retained only as a type for future scope; runtime entries with this status are not shippable. Document future work outside the runtime JSON instead.

The per-leaf registry is `src/content/review-status.json` (`schemaVersion: 1`). Under `languages.<en|hi>.<filename>`, each key has `status` and `contentSha256`. Hash the **exact** UTF-8 leaf string (do not trim it). Dictionary keys are dotted paths, narration/glossary keys are `<id>.<field>`, and shared resource labels use `<resource-id>.label` under `resources.json`. Metadata IDs/triggers/statuses are not user-facing leaves. Narration/glossary item status, resource status and feature `_meta.status` must agree with their leaf registry entries. Missing, changed, deleted or stale registry leaves fail closed.

Changing text requires an updated back-translation/evidence row and a new hash, not a blind mass reapproval. The current evidence is in [`CONTENT_QA.md`](CONTENT_QA.md). Its per-file hashes pin the audited versions; per-leaf hashes prevent a later edit from silently inheriting old review. Hashes detect change, not correctness or native fluency. The UI, README and limitations must continue disclosing absent native-speaker and listening review.

## Glossary and analogy scope

The nine implemented terms are leverage, margin, forced exit, volatility, drawdown, recovery maths, diversification, compounding and fees. Their final bilingual definitions, analogies and spoken forms live in `glossary.json` and are audited individually in `CONTENT_QA.md`.

Use these Hindi meanings consistently:

| Concept | Plain Hindi |
|---|---|
| Leverage / borrowed exposure | उधार की ताकत |
| Margin | जमा रकम |
| Equity in this virtual exercise | बची आभासी रकम |
| Forced exit | ज़बरन बाहर निकलना |
| Volatility | उतार-चढ़ाव |
| Drawdown | गिरावट |
| Recovery maths | वापसी का गणित |

Analogy constraints: the seesaw uses the **same tilt**, not a claimed equal push; a teaching deposit/forced-exit rule is not a description of real lender procedures; recovery uses the smaller remaining base and excludes recovery from zero. Diversification does not remove all risk; compounding works for losses too; fees are explicitly omitted from this simplified model. Analogy naturalness and comprehension have not been human-tested.

NAV and nomination remain future-only scope. Their earlier “planned” filler was removed from both runtime arrays, not converted into approved definitions. Reintroduction needs contextual definitions, any jurisdiction-specific evidence, bilingual QA and new audio. Their exact removed leaves are retained in the QA disposition table.

## Safety-sensitive translations

Preserve direction, time and scope, not just terminology:

- `{current}` is the current step out of `{total}`, never the reverse.
- A solid chart line is unbroken; it need not be straight.
- “Did not **end** below the start” does not mean “never went below”.
- An intrabar low applies to that step, not to the lowest value of the entire path. Production daily reference observations have no intraday data.
- Continue and exit are simulated choices, not recommendations to hold or stop a real position.
- Answers remain in memory and clear on reload/restart. Do not claim that nothing is stored: language/text-size preferences and cached static assets have separate contracts.
- Official resources were agent-verified with exact-page evidence in `RESOURCE_CHECKS.md`; do not falsely call that human review. External links leave the app and have destination privacy rules.

## Speech and audio contract

Visual and spoken notation are separate fields. Visual `10×` becomes spoken “ten times” / “दस गुना”. Hindi `spokenText` cannot contain Latin letters, digits or mathematical notation; English speech has only the documented Latin-script exemption. Do not reuse a broad advice exemption to permit notation or prohibited claims.

The finalized set is 20 narration IDs plus 9 glossary IDs in each language: **58 tracks**. `glossary.<termId>` distinguishes glossary audio from narration IDs. Narration/glossary speech must not change during generation without reporting the exact affected IDs and regenerating those assets.

`public/audio/manifest.json` uses schema version 2: complete manifest, accepted review status, bilingual voices, nonempty provenance and all current tracks. Each track carries exact trimmed speech, content/input/asset SHA-256 hashes, a strictly same-origin `/audio/<en|hi>/<64-lowercase-hex>.opus` path, positive duration/byte count, status and successful `quality.passed` plus end-token `quality.eos`. Optional ASR evidence requires finite nonnegative CER and a passed status. Do not invent ASR or human listening when absent. The content hash uses UTF-8 `spokenText.trim()`; the review leaf hash uses the untrimmed string.

The audio gate checks shape, current speech, coverage, safe paths, symlink containment and asset bytes/hashes. It does **not** decode speech, measure intelligibility, validate a voice by listening, or recompute a producer's signal/ASR verdict. Those generation gates/evidence are separately required. An integrity-valid manifest is not permission to substitute silence for speech.

Missing, incomplete, failed, stale or corrupted audio is a **content/release error**, not a warning. A text-only build may still compile and display its explicit fallback; compilation does not make it release-ready. Only tests may use clearly labelled contract-only bytes, always in temporary roots and never copied into `public/`.

## Checks and remaining evidence

Run `npm run lint`, `npm run typecheck`, `npm run test`, `npm run check:content`, `npm run build`, `npm run check:bundle` and `npm run check:release`. Focused policy tests are:

```sh
npx vitest run scripts/check-content.test.mjs scripts/check-audio.test.mjs scripts/check-release.test.mjs
```

Do not add dates, sources, licences, measurements or procedural claims without evidence. Keep unresolved work with an actionable disposition outside participant copy. Content checks cannot establish publisher rights, human review, cultural clarity or participant efficacy. Production resource/episode evidence and parent-owned audio/integration docs remain separate from this bilingual review.
