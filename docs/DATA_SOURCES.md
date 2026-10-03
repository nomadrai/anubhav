# Real data sources and offline preparation

## Current decision — 2026-10-03

Two **real, single-source daily windows** are now the only runtime exports in
`src/data/episodes/index.ts`: `historical-crash` and `historical-choppy`.
The default is `historical-crash`. Both use the **European Central Bank (ECB)**
reference-rate XML, not the earlier EIA/Refinitiv candidates. Source observations
are unchanged. The app computes relative changes and virtual-money outcomes.
Neither observation prices nor episode choice constitute investment advice.

**Deliberate source deviation:** these are ECB-authored reference observations,
not a stock index, equity closes, an Indian-market sample, or executable trading
prices. Clear, explicitly stated reuse terms take priority over an unsupported
stock-index licence. The internal schema calls the numeric field `close`; for
this source it is only the daily reference observation carrier, **not a claim of
market closing price**. `intradayAvailable` is false. No highs/lows are invented.

`status: agent-checked` records numeric/provenance checks and the bilingual
QA/back-translation in [DATA_REVIEW.md](DATA_REVIEW.md), not legal advice,
publisher approval, human review, or native-speaker approval. The current user
authorization permits this evidenced agent check; historical human-only rules
in earlier audits are not retroactively claimed to have been satisfied.

## Exact reuse evidence

Fetched this session on **2026-10-03**, at `2026-10-03T13:06:43Z`:

- Requested official URL:
  <https://www.ecb.europa.eu/services/disclaimer/html/index.en.html>
- Final official URL after redirect (HTTP 200):
  <https://www.ecb.europa.eu/services/using-our-site/disclaimer/html/index.en.html>
- Page title: **Disclaimer & copyright**, section **Copyright**.
- Preserved local body: `data-raw/resources/ecb-terms.html`, 107588 bytes,
  SHA-256 `3785b75bd536340a5cb45bf8afeb525c7c38c9c5406fd3525e3851af090a916c`.

Exact publisher sentences:

> Subject to the exception below, users of this website may make free use of the information obtained directly from it subject to the following conditions:

> When such information is distributed or reproduced, it must appear accurately and the ECB must be cited as the source.

> If the information is modified by the user (e.g. by seasonal adjustment of statistical data or calculation of growth rates) this must be stated explicitly.

The same section also requires free-source disclosure for information incorporated
in sold documents, and full-window (not framed) loading when linking from
business sites or for promotional purposes. Its stated exception concerns
republication of **documents bearing named authors**, such as working and
occasional papers. This app uses the directly published ECB statistical XML,
not such a paper, logo, photo, or third-party market-price feed. This is the ECB's
own copyright/reuse policy, **not a CC licence or public-domain assertion**.
The observations remain accurate, ECB attribution is retained in every episode
and in neutral bilingual `sourceLabel`, and app-calculated relative changes are
explicitly disclosed. No endorsement is implied. The app is not sold; if that
changes the additional disclosure requirement must be re-evaluated.

The source-definition page fetched at `2026-10-03T13:06:44Z` (HTTP 200,
unchanged final URL) is:
<https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html>.
It says:

> They are based on the daily concertation procedure between central banks across Europe, which normally takes place around 14:10 CET.

> The reference rates are published for information purposes only. Using the rates for transaction purposes is strongly discouraged.

It also describes publication around 16:00 CET and TARGET closing days. These
are the **current publisher descriptions**; the historical XML has dates and
values, not per-row timestamps. We do not assert a historical daily publication
time, infer closing days, or assign reasons to absent dates. Definition body:
119322 bytes, SHA-256
`a022db7a19c93523d7b2eafb79d8367e7f35b1f1a6fd0c9fc941dd389a9926c9`.

## Source snapshot and production windows

- Official time-series XML:
  <https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.xml>.
- XML publisher: `European Central Bank`; selected currency attribute `USD`,
  base EUR, units USD per EUR; series identity `EXR.D.USD.EUR.SP00.A`.
- Retrieved: `2026-10-03T13:06:45Z`, HTTP 200, unchanged final URL,
  `Content-Type: text/xml`, 8191474 bytes.
- Local original: `data-raw/ecb/eurofxref-hist.xml`; receipt:
  `data-raw/ecb/acquisition.json`.
- Raw SHA-256:
  `807ad53568c849e894f9ea496c91684f530f23f60afc564d96f46702be494ceb`.
- The full historical snapshot contains other dates/currencies; only the exact
  two requested windows and one currency are selected. No mixing, inversion,
  normalization of observations, imputation, or synthetic extension occurs.

| Production ID | Inclusive observed bounds | Rows | First → last | Total change | Max drawdown | Worst observed step |
|---|---|---:|---|---:|---:|---:|
| `historical-crash` | 2008-07-15 → 2008-10-28 | 76 | 1.599 → 1.2526 | -21.6635397123% | -22.0762976861% | -2.5864684466% |
| `historical-choppy` | 2019-01-02 → 2019-02-28 | 42 | 1.1397 → 1.1416 | +0.1667105379% | -2.3840485479% | -0.5722708749% |

Percentages above are measured, not forecasts. Machine values in `stats` are
fractions. The second path has 21 upward and 20 downward steps with a small
endpoint change; this supports its internal **choppy teaching label**, not a
claim that it is representative of an ordinary market. The first has 23 upward
and 52 downward steps. Both labels were assigned retrospectively by the app,
not by the publisher. No causal event story is supplied.

Normalized CSV hashes (the exact `inputSha256` used by the offline CLI):

- `historical-crash.csv`:
  `05e30c8bee116ef67cdf136dacf45cabddd1a65c90ca422ac05d005667743633`.
- `historical-choppy.csv`:
  `e9c5ebc2423bd5f31783930f62170f3f05f2f3539fae84b1f9b5003bde0a0195`.

Both windows have zero missing/nonfinite/nonpositive selected values, zero
duplicate dates, and exact requested boundary observations. There are 30 and
16 calendar dates, respectively, without source observations. Those date lists
are retained in each episode's `provenance.validation.absentCalendarDates`.
They are **not classified as holidays/weekends/missing trading sessions**; no
calendar was guessed. Complete checks and limitations: [DATA_REVIEW.md](DATA_REVIEW.md).

## Reproduce with a preserved snapshot (no network)

```sh
python3 scripts/data_ecb.py --output-root /tmp/ecb-rebuilt
cmp src/data/episodes/historical-crash.json /tmp/ecb-rebuilt/historical-crash.json
cmp src/data/episodes/historical-choppy.json /tmp/ecb-rebuilt/historical-choppy.json
```

To **explicitly** fetch a fresh source snapshot before preparing (source may
revise; do not casually overwrite evidence while investigating a difference):

```sh
python3 scripts/data_ecb.py --fetch --raw-root /tmp/ecb-fresh --output-root /tmp/ecb-fresh/episodes
```

`scripts/data_ecb.py` verifies publisher, bounds, unique dates, currency presence,
positive finite values, response identity, raw hash/length and independent
statistics. It writes original observation strings as `date,close`, supplies
exact observed `expectedDates`, then invokes the existing network-free
`scripts/prepare_episode.py`. The CLI output is compared to every source row
and statistic; additional provenance, neutral labels and review evidence are
then attached. No new dependency was added (existing PyYAML plus standard
library). Original XML/receipts/CSV/YAML are local under `data-raw/`; production
JSON preserves full receipt, source/terms, original date keys, stats and hashes.

Example direct offline preparation of a preserved window:

```sh
python3 scripts/prepare_episode.py \
  --csv data-raw/ecb/historical-crash.csv --id historical-crash \
  --start 2008-07-15 --end 2008-10-28 \
  --meta data-raw/ecb/historical-crash.meta.yaml \
  --output /tmp/historical-crash.base.json
```

This direct command emits the base schema; `data_ecb.py` adds the documented
provenance/review fields. CLI contract and synthetic fixtures remain in
[scripts/README.md](../scripts/README.md). Synthetic JSON stays at its existing
fixture paths to preserve regression tests but is **not imported or exported
by the production episode entry point**.

## Alternatives and retained blocked research

1. **EIA WTI/Refinitiv: still not approved.** The previous RWTC candidates have
   unresolved third-party redistribution rights. EIA's general public-data
   statement does not erase its third-party exception or the Refinitiv/LSEG
   attribution on the exact definitions page. They remain outside runtime with
   `humanApproved: false`; no import or rights flag was changed. Existing
   `data/candidates/` artifacts and [SOURCE_AUDIT.md](SOURCE_AUDIT.md) preserve
   exact prior URLs, hashes, counts and audit findings. 2018 candidate: 40
   rows, 2018-01-02..2018-02-28; 2020 candidate: 41 rows,
   2020-02-20..2020-04-17. Resolve dataset-specific rights with its holders
   before any later use; it is unnecessary for this ECB-based preview.
2. **Federal Reserve Board:** fetched
   <https://www.federalreserve.gov/disclaimer.htm> this session, 2026-10-03.
   It states: “Unless otherwise indicated, information on Board's website is
   in the public domain and may be copied and distributed without permission.”
   It also requires attribution and excludes identified non-Board materials.
   This was a plausible alternative, not a dataset-specific approval; no
   Federal Reserve data was shipped because directly available ECB-authored
   observations and explicit ECB terms met the current need.
3. **ECB API:** a bounded request for
   `EXR/D.USD.EUR.SP00.A?startPeriod=2008-07-15&endPeriod=2008-10-28&format=csvdata`
   at `https://data-api.ecb.europa.eu/service/data/` timed out after 30 seconds.
   No API response is claimed. The official ECB XML download succeeded and is
   the actual production source; its bytes, not an API assumption, were checked.

Protective links are independently documented in
[RESOURCE_CHECKS.md](RESOURCE_CHECKS.md). Data rights do not establish link
endorsement or native-speaker approval, and a green numeric check does not
establish user-learning efficacy or representative financial outcomes.
