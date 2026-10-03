# Production episode review — 2026-10-03

## Scope and decision

Agent review of `src/data/episodes/historical-crash.json` and
`historical-choppy.json`, prepared from one directly downloaded ECB reference
series using the exact terms/evidence in [DATA_SOURCES.md](DATA_SOURCES.md).
These are the only entries exported by `src/data/episodes/index.ts`.
`src/config/episodes.ts` defaults to `historical-crash`. The synthetic files
remain regression fixtures at their original paths, not runtime entries.

Outcome: **agent-checked** provenance, numeric validation, neutral reveal copy
and bilingual QA. `isPlaceholder: false` means genuine source observations,
not that every human review, usability test or learning claim is complete.
`humanApproved: false` and `nativeSpeakerReviewed: false` remain explicit.

## Observed counts, values, ranges and changes

| Check | Historical crash teaching window | Historical choppy teaching window |
|---|---:|---:|
| First date | 2008-07-15 | 2019-01-02 |
| Last date | 2008-10-28 | 2019-02-28 |
| Observations | 76 | 42 |
| First value | 1.599 | 1.1397 |
| Last value | 1.2526 | 1.1416 |
| Minimum | 1.246 | 1.126 |
| Maximum | 1.599 | 1.1535 |
| Total change (fraction) | -0.216635397123202 | 0.001667105378608369 |
| Maximum drawdown (fraction) | -0.2207629768605378 | -0.023840485478977103 |
| Worst observed step (fraction) | -0.025864684466019416 | -0.005722708748807759 |
| Up/down/unchanged steps | 23 / 52 / 0 | 21 / 20 / 0 |
| Missing selected currency/value on a returned date | 0 | 0 |
| Nonfinite/nonpositive values | 0 | 0 |
| Duplicate returned date | 0 | 0 |
| Requested boundary observations absent | 0 | 0 |
| Calendar dates without source observations | 30 | 16 |

The acquisition reader visits every source day in each window and fails on a
missing/duplicate USD observation, duplicate date, invalid date/value, wrong
publisher, missing requested boundary, malformed XML or unexpected XML entity
markup. It orders observed keys chronologically. The publisher XML itself is
reverse chronological; sorting is documented, not an anomaly or missing data.
No values were imputed, inverted, rescaled, rounded or otherwise modified in
the bars. Raw decimal strings are preserved in the local normalized CSV before
the offline preparation CLI parses numbers. UI percentages alone are rounded
to two decimals in the neutral reveal text.

The expected-date lists are exactly the observed source dates, not a separate
calendar. Therefore the checks establish **no missing values within returned
observations**, not independent completeness of every historical session. The
unobserved date lists are kept in each JSON's
`provenance.validation.absentCalendarDates`, with an explicit prohibition on
holiday/weekend/session classification. No date is guessed or backfilled.

Numeric definitions are `last / first - 1`, worst `current / previous - 1`
clamped at zero, and minimum `current / runningHigh - 1`. The importer computes
these independently from raw XML-selected values and compares the offline
preparation result. The existing TypeScript parity test recomputes the stored
stats from runtime bars. Every prepared date/value is also compared to XML.

## Reproduction evidence and anomaly disposition

- XML: 8191474 bytes, HTTP 200, unchanged official URL, fetched
  `2026-10-03T13:06:45Z`; SHA-256
  `807ad53568c849e894f9ea496c91684f530f23f60afc564d96f46702be494ceb`.
- `historical-crash` CSV SHA-256:
  `05e30c8bee116ef67cdf136dacf45cabddd1a65c90ca422ac05d005667743633`.
- `historical-choppy` CSV SHA-256:
  `e9c5ebc2423bd5f31783930f62170f3f05f2f3539fae84b1f9b5003bde0a0195`.
- Full receipt, source definitions/terms, explicit observed date lists, timing
  caveat, selection caveat, checks and review status are in production JSON
  provenance. Source values/names belong there, not in learner UI/audio.
- Data API request timed out after 30 seconds; successful official XML was used
  instead. No API success or unseen row was inferred.
- No invalid selected values, duplicate dates or boundary mismatch was found.
  Absent calendar dates and lack of historical timestamps/intraday data remain
  explicit limitations, not repaired anomalies.

## Neutral copy and Hindi QA/back-translation

The review checked **every** period, what-happened and source-label string for
numeric parity, signs, dates/counts, scope, no real series/instrument names,
no cause inference, no recommendations, no future prediction, and no outcome
celebration. The visible publisher reference is the institution only; the
series identifier and denomination remain in machine provenance.

| Key | English meaning and source check | Hindi agent back-translation / result |
|---|---|---|
| crash `reveal.periodText` | 2008-07-15 to 2008-10-28; 76 daily observations, exact source bounds/count. | “From 2008-07-15 to 2008-10-28: 76 daily recorded values.” Dates and count match. |
| choppy `reveal.periodText` | 2019-01-02 to 2019-02-28; 42 daily observations, exact source bounds/count. | “From 2019-01-02 to 2019-02-28: 42 daily recorded values.” Dates and count match. |
| crash `reveal.whatHappenedText` | Last 21.66% below first; largest fall from an earlier high 22.08%; selected past path, not forecast. | “The final recorded value was 21.66% below the first. The biggest fall from a previous high value was 22.08%. This chosen old path is not an estimate of the future.” Direction, denominator and nonforecast meaning match. |
| choppy `reveal.whatHappenedText` | Last 0.17% above first; largest fall from an earlier high 2.38%; selected past path, not forecast. | “The final recorded value was 0.17% above the first. The biggest fall from a previous high value was 2.38%. This chosen old path is not an estimate of the future.” The small positive endpoint is not described as a reward or safe result. |
| Both `sourceLabel.en/hi` | Source: European Central Bank. Relative changes calculated for this lesson. | “Source: European Central Bank. Relative change has been calculated for this lesson.” Institution attribution and modification disclosure retained, no instrument identity. |

Result for these leaves: **agent-checked**, not `reviewed`. ISO date digits and
percentages are identical across the languages. `दैनिक दर्ज मान` is used for
recorded observations rather than asserting executable prices. No audio was
created or listened to in this data task; no native speaker or human listening
review is claimed. Episode labels A/B are neutral identifiers; product UI uses
its bilingual labels rather than exposing the internal crash/choppy identifiers.

## Suitability and remaining limitations

- The real source is a reference-rate series, not equities, intraday prices or
  actual execution. It omits spreads, fees, financing, liquidity and trading
  rules. App leverage/margin is a teaching model, not a historical trade.
- The windows are retrospectively selected. “Crash” and “choppy” are internal
  teaching roles, not publisher classifications, likely outcomes, a random
  sample or evidence that the second path represents all ordinary markets.
- One historical source/path cannot establish how an Indian household,
  particular investment or future market will behave. The source deliberately
  deviates from stock-index data to use explicit reuse terms.
- No event name or causal explanation is inferred from the dates. Reveal copy
  contains only source-observed counts/bounds and calculated changes, plus the
  nonforecast caveat.
- The UI must render `episode.sourceLabel[language]` to retain ECB attribution
  and calculation disclosure, but must not render raw `sourceName`, `sourceUrl`,
  series IDs or units. Source URLs may reveal instrument identity. The period
  must remain hidden until reveal; data provenance being in a client bundle is
  not encryption or protection against deliberate developer-tool inspection.
- EIA/Refinitiv rights are still unresolved; those candidates remain unapproved
  and outside runtime. This ECB decision does not establish their reuse rights.
- The absence of native review must remain visible in the app and parent-owned
  README/limitations. Dataset correctness is not evidence of pilot efficacy.

## Verification commands

```sh
python3 scripts/data_ecb.py --fetch
python3 scripts/data_ecb.py --output-root /tmp/ecb-rebuilt
cmp src/data/episodes/historical-crash.json /tmp/ecb-rebuilt/historical-crash.json
cmp src/data/episodes/historical-choppy.json /tmp/ecb-rebuilt/historical-choppy.json
python3 -m unittest scripts.data_ecb_test scripts.data_resources_test scripts.tests.test_prepare_episode
npx vitest run src/data/episodes/episode.schema.test.ts src/engine/__tests__/episodeParity.test.ts
```

Final command outcomes and the wider lint/typecheck/build/content integration
status are reported in the task handoff; a command listed here is not itself a
claim that unrelated integration checks passed. An earlier combined Python run
also included `scripts.tests.test_acquire_eia_candidates`: its only failure was
the superseded assertion that **all** resources must remain unverified. That
test is parent-owned; verified resources now require the session evidence above,
while EIA candidate nonapproval must remain asserted.
