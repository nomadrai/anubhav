# Protective resource and candidate-source audit

**Scope:** commit `36bcb51753be56f73f8de364efb75750459568a5` (short `36bcb51`).
**Audit window:** `2026-10-03T08:54:42Z` through `2026-10-03T09:05:46Z` UTC. The
first fetch command recorded its start timestamp; individual request timestamps
were not emitted for every URL. The later SEBI/EIA Open Data checks recorded
individual command timestamps below.

This is a technical provenance and suitability audit, **not legal advice, a
licence grant, publisher approval, native-speaker approval, or a release
approval**. I did not change any `verified`, `humanApproved`, or candidate-status
field, import data into runtime, add a dependency, create an account, or send
private/contact data. After this audit, the documented acquisition command was
corrected to omit the unsupported `--api-key` option; the script continues to
use its public `DEMO_KEY` request construction and no private credential is stored.

## Decision summary

| Item | Technical result | Decision now | Blocking unresolved work |
| --- | --- | --- | --- |
| `https://investor.sebi.gov.in/iematerial.html` | Exact URL reached HTTP 200, unchanged final URL; the SEBI Investor page is an investor-education gateway with selected language choices. | **Do not verify or publish yet.** Keep `verified: false` and `humanApproved: false` (the existing values). | Human relevance, accessibility, language quality, endorsement/linking treatment, and publisher terms/rights for linked documents. |
| `https://investor.sebi.gov.in/personalsecurities.html` | Exact URL reached HTTP 200, unchanged final URL; page is a general securities-market primer and includes product and investment-review language. | **Do not verify or publish yet.** Keep existing false flags. | Human protective-copy review must confirm it will not look like advice or a recommendation; same publisher/linking, accessibility, language, and terms review. |
| `candidate-rwtc-2018-choppy` | Preserved raw response, normalized CSV, episode bars, hashes, counts, dates, and summary statistics are internally consistent. | **Candidate only; do not import or approve.** | Dataset-specific redistribution/attribution permission, observation semantics/timezone, suitability, selection-bias and safety review, and native Hindi review. |
| `candidate-rwtc-2020-crash` | Preserved artifacts are internally consistent; a current direct API request was rate-limited (HTTP 429), while a separate fetch returned the expected 41-row JSON body without exposing its HTTP status. | **Candidate only; do not import or approve.** | Same rights, semantics, suitability, safety, and Hindi blockers; re-establish a reproducible current fetch when the API permits it. |

The repository's own release rules require unverified pointers to remain hidden
and require human review for source, licence, safety, Hindi, accessibility, and
CSP evidence (`docs/RESOURCE_REVIEW.md:5-15,63-78`, `docs/GUARDRAILS.md:12-14,20-26`).
The candidate artifacts already correctly say `candidate-not-approved`,
`humanApproved: false`, and `hindiStatus: draft` (for example,
`data/candidates/episodes/candidate-rwtc-2018-choppy.episode.json:231-242` and
`data/candidates/episodes/candidate-rwtc-2020-crash.episode.json:235-246`).

## Exact URL checks and publisher-policy evidence

All direct checks used `curl --http1.1 --fail --location --silent --show-error
--max-time 30`, with response headers captured outside the repository. “Final
URL unchanged” means the curl effective URL exactly equalled the requested URL.
SHA-256 values below are hashes of the downloaded response body, not legal or
semantic identities.

### SEBI resource pointers

1. **Investor Education Reading Material**

   Requested and final URL (unchanged):
   `https://investor.sebi.gov.in/iematerial.html`

   Direct re-fetch: HTTP `200`; `145812` bytes; `content-type:
   text/html; charset=UTF-8`; body SHA-256
   `091ae2a3af292b764a92d5373a90fc08d1e9bd3a4110dfeb4ff322afac2cb5df`.
   This matches the previously recorded automated check at
   `src/content/resources.json:12-18` and the prior record at
   `docs/RESOURCE_REVIEW.md:19-34`; the current check was a separate fetch in
the audit window.

   The visible text lists safe-investing and financial-education material,
   complaints/fraud awareness, and multiple language choices for selected
   material. It is relevant as a possible gateway, but that observation does
   not establish suitability for this app or permission to reproduce any
   linked PDF/document.

2. **Personal Finance and Investment: Securities Market Investments**

   Requested and final URL (unchanged):
   `https://investor.sebi.gov.in/personalsecurities.html`

   Direct re-fetch: HTTP `200`; `9691` bytes; `content-type:
   text/html; charset=UTF-8`; body SHA-256
   `604f8436733d04a15186fc98ace13997c305bc7bf467ca07d5c298ff9780135d`.
   This matches `src/content/resources.json:35-41` and the previous record at
   `docs/RESOURCE_REVIEW.md:36-47`.

   The page says it is for everyone, particularly people looking to invest in
   the securities market, and covers investment products, reviewing investments
   against goals/risk tolerance, do-and-don't guidance, and disputes. That is
   not itself a recommendation, but the wording requires a human safety review
   before a learner-facing pointer is approved; the app must not present the
   page as personal advice or endorsement.

### SEBI linking/rights policy evidence

These official-site pages were fetched to look for linking, copyright, terms,
and attribution instructions:

- `https://investor.sebi.gov.in/disclaimer.html`: HTTP `200`, final URL
  unchanged, `7882` bytes, body SHA-256
  `e30ade0b7c8a7dd6874af8f3614fd3e3a0af0cd9f0866b88de89faeb060b537`, checked
  at `2026-10-03T09:01:41Z`. The disclaimer says the site is intended to be
  authentic but directs readers to print/notified versions for authoritative use
  and disclaims responsibility for shortcomings or inaccuracies. It does **not**
  provide an open reuse licence or a clear hyperlink/attribution permission.
- `https://investor.sebi.gov.in/assets/footer.js`: HTTP `200`, final URL
  unchanged, `2654` bytes, `content-type: application/javascript`, body
  SHA-256 `177161c6206e49509d172826e5e15b0d2a3bbe573b04eede6f0ccaa7aba816b8`,
  checked at `2026-10-03T09:01:40Z`. The footer states “All Rights Reserved” and
  links to the SEBI website, sitemap, glossary, contact page, and disclaimer.
  It does not state a linking/reuse grant. It also injects a Google tag
  (`gtag.js`), a Corover chatbot, and Microsoft Clarity scripts into the
  destination page; this is a reason to perform the app's external-destination privacy review,
  not a claim that a user is tracked in every browser configuration.
- `https://investor.sebi.gov.in/policy-documents.html`: HTTP `200`, final URL
  unchanged, `11056` bytes, body SHA-256
  `96fee7c3ea4f8d2276157645857b681e030c0c41abb2fe69802fa2f2894c07db`, checked
  at `2026-10-03T09:01:41Z`. It lists financial-strategy documents; it did not
  supply a hyperlink or content-reuse policy.

**Finding R1 — release blocker for resource verification (publisher terms and
human suitability unresolved).** The exact pages are reachable, but the fetched
SEBI materials expose “All Rights Reserved” and a disclaimer without an
explicit open licence or hyperlink policy. I found no basis to claim permission
to copy page text, linked PDFs, screenshots, or translations. A static link to
the exact page is technically different from copying its content, but the
repository's own checklist still requires a human to confirm linking treatment,
terms, accessibility, languages, attribution, and non-endorsement
(`docs/RESOURCE_REVIEW.md:63-75`). Do not set either resource's flags true based
on this audit.

**Next step for R1:** a human reviewer should inspect the exact pages in a
normal browser, record the publisher's current linking/attribution position and
whether only a URL pointer is acceptable, review the linked-document rights,
check keyboard/reading order/low-bandwidth behavior and English/Hindi coverage,
and record reviewer/date/evidence/recheck date. Record the external-page
tracking observation in the privacy decision; do not claim the app itself makes
external runtime requests merely because the destination page has scripts.

## EIA API and official policy checks

Both candidates use the exact EIA API URLs recorded in their receipts and
metadata (`data/candidates/candidate-rwtc-2018-choppy.acquisition.json:4-35`,
`data/candidates/candidate-rwtc-2020-crash.acquisition.json:4-35`; source
construction is `scripts/acquire_eia_candidates.py:24-29,52-58`).

### Exact candidate request URLs and current results

- 2018 request:
  `https://api.eia.gov/v2/petroleum/pri/spt/data/?api_key=DEMO_KEY&frequency=daily&data%5B0%5D=value&facets%5Bseries%5D%5B%5D=RWTC&start=2018-01-02&end=2018-02-28&sort%5B0%5D%5Bcolumn%5D=period&sort%5B0%5D%5Bdirection%5D=asc`

  Direct re-fetch during the `2026-10-03T08:54:42Z` audit command: HTTP
  `200`, final URL unchanged, `11589` bytes, `content-type:
  application/json`, body SHA-256
  `2df91d3d6fcdc5e0e79de95ba8909b861945289669da6ba2d1041747e3ad554b`.
  This is byte-for-byte the preserved raw snapshot hash in the receipt.

- 2020 request:
  `https://api.eia.gov/v2/petroleum/pri/spt/data/?api_key=DEMO_KEY&frequency=daily&data%5B0%5D=value&facets%5Bseries%5D%5B%5D=RWTC&start=2020-02-20&end=2020-04-17&sort%5B0%5D%5Bcolumn%5D=period&sort%5B0%5D%5Bdirection%5D=asc`

  Direct re-fetch in the same audit command: HTTP `429` (rate limited), final
  URL unchanged, zero downloaded bytes, and no body hash. A separate exact URL
  fetch through the text-fetch service returned a complete JSON object with
  `response.total: "41"`, `frequency: "daily"`, first period `2020-02-20`,
  last period `2020-04-17`, and the expected values; that service does not
  expose its HTTP status, so it is not recorded as a second HTTP-200 result.
  The preserved receipt remains the historical evidence of HTTP 200 at
  `2026-10-03T06:11:11Z` (`data/candidates/candidate-rwtc-2020-crash.acquisition.json:5-12`).

The transient 429 is not evidence that the preserved snapshot is corrupt. It is
an independent reproducibility/availability limitation: a later reviewer
should retry under the API's permitted limits and record the new status/body
hash without replacing the original evidence casually.

**Finding C2 — corrected documentation mismatch.** The audit found that the
online acquisition command documented `--api-key` although the parser exposes
only `--output-root` and `--offline`. The command documentation has since been
corrected to `python3 scripts/acquire_eia_candidates.py --output-root data/candidates`.
The script still uses the public `DEMO_KEY` request construction and does not
accept or store private credentials. Re-run the command only under the source
provider's permitted request limits.

### Official EIA policy/definition fetches

- Reuse policy:
  `https://www.eia.gov/about/copyrights_reuse.php` — direct HTTP `200`, final
  URL unchanged, `52512` bytes, body SHA-256
  `7f25492108c0654a2c4b9b7ec1593dcfa84ea934eb8a333fdc49b99fd5883af`, checked
  during the `2026-10-03T08:54:42Z` audit command. The page says U.S. government
  publications/data/files/databases may be used or distributed and asks for an
  acknowledgment including publication date. It separately says contributed
  or licensed private materials may be protected and that reproduction beyond
  fair use requires written permission; it also restricts EIA marks and some
  photographs.
- Spot-price definitions:
  `https://www.eia.gov/dnav/pet/TblDefs/pet_pri_spt_tbldef2.asp` — direct HTTP
  `200`, final URL unchanged, `12453` bytes, body SHA-256
  `afe161077442b488b7382cf856f192528f7b741d0f97b8096ed14a6676f4c6a1`, checked
  during the same audit command. It defines a spot price as a one-time
  open-market transaction for immediate delivery of a specified quantity at a
  specified location; defines WTI-Cushing; identifies “Refinitiv, an LSEG
  business” under Sources; and says EIA calculates weekly/monthly/annual prices
  from daily closing spot prices.
- EIA open-data page:
  `https://www.eia.gov/opendata/` — direct HTTP `200`, final URL unchanged,
  `72064` bytes, body SHA-256
  `9327e3cb720c3e420c76d027e6d74c9a26666915f3ff205304e7c068752790c7`, checked
  at `2026-10-03T09:05:45Z`. It describes the API as free/open data and says
  API use is subject to API terms and the Copyrights and Reuse Policy.
- EIA API documentation:
  `https://www.eia.gov/opendata/documentation.php` — direct HTTP `200`, final
  URL unchanged, `127365` bytes, body SHA-256
  `0a591dde22f929994d42007cca1fbe6dbaeec8043067b4db3668d16826dbd07c`, checked
  at `2026-10-03T09:05:46Z`. It says an API key is required, warns that API
  keys/requests are throttled, and again directs users to API Terms and the
  Copyrights and Reuse Policy. The acquisition's `DEMO_KEY` is the public demo
  credential already described in `scripts/acquire_eia_candidates.py:52-58`; no
  private key was used or stored.

**Finding C1 — blocker for redistributing/importing either candidate (rights
not established).** EIA's general statement is permissive for EIA material,
but the exact spot-price definitions name Refinitiv/LSEG as the upstream source,
and the same EIA reuse page excludes protected third-party material. The
candidate receipts correctly retain this unresolved note
(`data/candidates/candidate-rwtc-2018-choppy.acquisition.json:33-46` and
`data/candidates/candidate-rwtc-2020-crash.acquisition.json:33-46`). This audit
cannot infer that a raw snapshot, normalized CSV, episode JSON, or derived
lesson path may be redistributed. Obtain dataset-specific written/authorized
confirmation and approved attribution wording from the responsible rights
holders, or use data with a clear redistribution licence. Until then, do not
copy these candidates into `src/data/episodes/`.

## Candidate artifact verification

I independently parsed each local raw JSON, recomputed SHA-256 values, parsed
the CSV and episode JSON, compared every date/value through all three stages,
and recomputed the episode statistics with the same formulas used by
`prepare_episode.py`. The acquisition validator's relevant fail-closed checks
are visible at `scripts/acquire_eia_candidates.py:61-93`; its receipt/hash and
provenance construction is at `:105-130,174-207`.

### `candidate-rwtc-2018-choppy`

- Raw: `data/candidates/raw/candidate-rwtc-2018-choppy.source.json:1`,
  11,589 bytes; SHA-256
  `2df91d3d6fcdc5e0e79de95ba8909b861945289669da6ba2d1041747e3ad554b`.
- Source response: `total=40`, `frequency=daily`; 40 rows; observed range
  `2018-01-02` through `2018-02-28`; all rows have the expected `RWTC`,
  `$ / BBL`, `EPCWTI`, `YCUOK`, and `PF4` identifiers.
- Prepared CSV: `data/candidates/inputs/candidate-rwtc-2018-choppy.csv:1-41`,
  686 bytes; SHA-256
  `22e4e67d35ca84e76946a8221272c7284f3bacb6df4b28c7ee4c3528ba1dfa91`.
  All 40 dates and numeric values exactly match the raw response.
- Episode: `data/candidates/episodes/candidate-rwtc-2018-choppy.episode.json:177-181`
  reports `barCount=40`, `totalChange=0.017558389928772566`,
  `maxDrawdown=-0.10668477440772584`, and
  `worstSingleDayFall=-0.03425774877650889`; recomputation matched all four
  values exactly. Episode bars exactly match the CSV.
- Missing/nonpositive checks: no blank/missing `value`, non-finite value,
  non-positive value, duplicate date, out-of-order date, or missing requested
  boundary was found. `expectedDates` and the actual returned dates match.

### `candidate-rwtc-2020-crash`

- Raw: `data/candidates/raw/candidate-rwtc-2020-crash.source.json:1`,
  11,871 bytes; SHA-256
  `3f3504fd9b0420c9b46b5042dd9f9a20b80608e801c824165bc06958ae50e773`.
- Source response: `total=41`, `frequency=daily`; 41 rows; observed range
  `2020-02-20` through `2020-04-17`; all rows have the expected `RWTC`,
  `$ / BBL`, `EPCWTI`, `YCUOK`, and `PF4` identifiers.
- Prepared CSV: `data/candidates/inputs/candidate-rwtc-2020-crash.csv:1-42`,
  704 bytes; SHA-256
  `7d03d12147b53fc2a6939be270f7d1c23e76aaf714860ddeec3a507784812a2b`.
  All 41 dates and numeric values exactly match the raw response.
- Episode: `data/candidates/episodes/candidate-rwtc-2020-crash.episode.json:181-185`
  reports `barCount=41`, `totalChange=-0.6594755439836341`,
  `maxDrawdown=-0.7377719918169984`, and
  `worstSingleDayFall=-0.24526008750607675`; recomputation matched all four
  values exactly. Episode bars exactly match the CSV.
- Missing/nonpositive checks: no blank/missing `value`, non-finite value,
  non-positive value, duplicate date, out-of-order date, or missing requested
  boundary was found. `expectedDates` and the actual returned dates match.

The stored receipt fields agree with these independent results: raw/prepared
hashes, byte counts, row counts, requested/observed ranges, and identifiers are
present at `data/candidates/candidate-rwtc-2018-choppy.acquisition.json:9-31`
and `data/candidates/candidate-rwtc-2020-crash.acquisition.json:9-31`. One
minor provenance gap remains: both stored receipts have `contentType: null`
(`data/candidates/candidate-rwtc-2018-choppy.acquisition.json:8` and
`data/candidates/candidate-rwtc-2020-crash.acquisition.json:8`), while the
independent 2018 response reported `application/json` and the 2020 rate-limit
response reported `application/json`. This does not change the hashes, but a future receipt should
preserve the actual response content type rather than null.

## Limitations, selection bias, and suitability

1. **Observed rows are not a verified calendar.** Each window has 58 inclusive
   calendar dates but only 40 or 41 returned observations; the missing calendar
   dates are not classified here as holidays, weekends, or missing source data.
   The metadata intentionally uses returned observations and says the list is
   not an independently verified session calendar
   (`data/candidates/episodes/candidate-rwtc-2018-choppy.episode.json:224-229`,
   `data/candidates/episodes/candidate-rwtc-2020-crash.episode.json:228-233`).
   Do not fill, infer, or label the
   absent dates without an authoritative calendar/timezone decision.
2. **Close-only spot series is not a learner's traded instrument.** The raw
   source has `period` and `value`; preparation maps only those to `date` and
   `close`, with `intradayAvailable: false`
   (`data/candidates/episodes/candidate-rwtc-2018-choppy.episode.json:166-181`,
   `data/candidates/episodes/candidate-rwtc-2020-crash.episode.json:170-185`).
   It has no intraday path, open/high/low, spread, fees,
   financing, liquidity, slippage, margin-call/liquidation mechanics, contract
   terms, roll treatment, or local-currency context. The EIA definition is a
   spot transaction at a specific location, not a recommendation or a
   representative retail product.
3. **Retrospective outcome selection is material.** The acquisition script
   chooses exactly two windows and assigns the teaching labels `choppy` and
   `crash` (`scripts/acquire_eia_candidates.py:27-30`); the API does not supply
   those labels. The chosen windows are therefore not a random or representative
   sample and cannot support claims about typical volatility, frequency, likely
   outcomes, or strategy performance. The metadata itself still requires review
   of “historical path” and “selection bias”
   (`data/candidates/metadata/candidate-rwtc-2018-choppy.meta.yaml:58-59` and
   `data/candidates/metadata/candidate-rwtc-2020-crash.meta.yaml:59-60`).
4. **Real-source safety boundary remains unresolved.** Although the episode
   display label is neutral (`Episode A`), its provenance identifies a real
   WTI-Cushing spot series. Importing it would require a human decision that the
   learner UI/audio never names a real instrument, presents a historical period
   as a forecast, or implies that the selected crash/choppy outcomes are normal
   or predictive (`docs/GUARDRAILS.md:7-14,18-22`). A synthetic, clearly seeded
   fixture remains the safer runtime choice until that review is complete.
5. **Language and reveal copy are not ready.** Both episodes contain
   `TODO(human)` Hindi text and an English TODO for neutral path/selection-bias
   copy (`data/candidates/episodes/candidate-rwtc-2018-choppy.episode.json:168-175`
   and `data/candidates/episodes/candidate-rwtc-2020-crash.episode.json:172-179`).
   `hindiStatus` is still draft. Native-speaker review
   and protective-copy review are blockers, not fields to be marked complete by
   this audit.
6. **Publisher-page suitability is not the same as source-data suitability.**
   A reachable SEBI page may be useful as a pointer, but its exact language,
   linked-document rights, accessibility, permanence, endorsement implication,
   and external-page privacy behavior still require human review. Do not use
   the HTTP hashes as evidence of any of those properties.

## Actionable approval gates and next steps

1. **EIA rights:** obtain dataset-specific written/authorized confirmation for
   the EIA/API data that identifies the Refinitiv/LSEG upstream source. Confirm
   whether raw snapshots, normalized price inputs, derived episode JSON, and
   learner redistribution are each permitted; record exact attribution,
   restrictions, version, and recheck date. If not clear, replace the source
   with data whose redistribution terms are explicit. This is the primary
   candidate blocker.
2. **EIA semantics:** have a source/data reviewer confirm units, spot-vs-product
   meaning, observation timestamp/timezone, revision policy, calendar semantics,
   and whether close-only data fits the lesson. Decide whether the 2020 API
   429 needs a later fresh receipt; preserve the current snapshot as evidence.
3. **Protective suitability:** have a safety reviewer write neutral English
   reveal/debrief copy that identifies these as selected teaching paths, not
   forecasts or typical outcomes; ensure no real instrument name appears in
   learner-visible UI/audio if a real episode is ever considered. Keep
   candidate JSON out of runtime until this review.
4. **Hindi and accessibility:** obtain native-speaker review of every Hindi
   string and browser/manual accessibility review of both exact resource URLs,
   including reading order, keyboard behavior, language availability, linked
   documents, and low-bandwidth behavior. Record reviewer identity/date and
   recheck/expiry date.
5. **SEBI linking/privacy:** confirm that a static pointer to each exact page is
   acceptable and does not imply SEBI endorsement of the app. Record whether
   any linked PDF/text may be copied or translated. Retain the fact that the
   destination footer currently injects third-party analytics/chat scripts; do
   not claim the destination is tracking-free.
6. **Release gate:** only after the above evidence exists may a human decide
   whether to change flags or import data. Until then, leave every resource and
   candidate unverified/unapproved, as required by `docs/DATA_SOURCES.md:76-85`
   and `docs/GUARDRAILS.md:24-30`.

## Checks run

- Read the repository instructions and the requested source/resource/data files.
- Re-fetched every exact resource URL, the SEBI disclaimer/footer/policy pages,
  EIA reuse/definitions/Open Data/API documentation pages, and both exact EIA
  API query URLs; recorded status, final URL, byte counts, and hashes where a
  body was received.
- Independently recomputed raw and prepared SHA-256 values, row counts/date
  ranges, field identity, missing/nonpositive/duplicate/order/boundary checks,
  CSV-to-raw equality, episode-to-CSV equality, and all four episode stats for
  both candidates.
- Ran the documented offline acquisition against a copied temporary snapshot
  under `/tmp/anubhav-offline-repro`; both regenerated episode JSON files were
  byte-identical to the checked-in candidate episode files.
- Checked the documented online acquisition command against `--help`; the
  documentation was then corrected to match the parser. Temporary downloaded
  bodies and command artifacts were kept under `/tmp/anubhav-source-audit`,
  outside the repository.
