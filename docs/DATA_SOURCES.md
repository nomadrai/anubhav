# Data sources and preparation

## Status

Phase 1 preparation remains an offline validator and is exercised by the
synthetic fixtures in `scripts/fixtures/`. It does not fetch, infer a calendar,
backfill a missing observation, or transform a source into a prediction.

Two historical **candidate** snapshots have now been acquired by the separate
network-capable `scripts/acquire_eia_candidates.py` script. They are kept under
`data/candidates/`, are not imported by `src/data/episodes/` or runtime config,
and have `humanApproved: false`. The scenario words below are teaching labels
for review, not market classifications or forecasts.

Candidate resources are false/hidden by default. The UI may show a resource only when its exact pointer has been verified by a human, its relevance is recorded, and its licence and attribution requirements are known. Do not invent a holiday calendar, trading session, observation, or date range.

## Acquired candidate snapshots

Both candidates use the U.S. Energy Information Administration (EIA)
Petroleum Spot Prices API, dataset `petroleum/pri/spt`, series `RWTC`. The EIA
response identifies the series as `Cushing, OK WTI Spot Price FOB (Dollars per
Barrel)` and its definitions page names Refinitiv, an LSEG business, as the
upstream source. The candidate normalization keeps only `period` as `date` and
`value` as `close`; it does not create open/high/low fields. Dates are exactly
the rows returned by EIA, not an inferred weekday or holiday calendar. Because
this upstream attribution creates a redistribution question, raw and derived
downloaded raw snapshots and normalized price inputs are local-only and git-ignored. The candidate episode JSON is retained as a non-runtime research artifact with the unresolved rights note below; it is not imported into the app.

The API request is HTTPS and includes `DEMO_KEY` only as the public EIA demo
credential used for acquisition; no private credential is stored. The raw JSON
response is preserved so the downloaded evidence can be checked independently
of the derived CSV and episode JSON.

### Choppy teaching candidate

- Candidate: `candidate-rwtc-2018-choppy` (`scenario: choppy`).
- Request URL:
  `https://api.eia.gov/v2/petroleum/pri/spt/data/?api_key=DEMO_KEY&frequency=daily&data%5B0%5D=value&facets%5Bseries%5D%5B%5D=RWTC&start=2018-01-02&end=2018-02-28&sort%5B0%5D%5Bcolumn%5D=period&sort%5B0%5D%5Bdirection%5D=asc`.
- Retrieved: `2026-10-03T06:11:09Z` (date `2026-10-03`); HTTP `200`, final URL unchanged.
- Evidence: 40 source rows; observed date range `2018-01-02` to
  `2018-02-28`; raw JSON `data/candidates/raw/candidate-rwtc-2018-choppy.source.json`, SHA-256
  `2df91d3d6fcdc5e0e79de95ba8909b861945289669da6ba2d1041747e3ad554b`;
  normalized CSV `data/candidates/inputs/candidate-rwtc-2018-choppy.csv`, SHA-256
  `22e4e67d35ca84e76946a8221272c7284f3bacb6df4b28c7ee4c3528ba1dfa91`.
- Prepared candidate: `data/candidates/episodes/candidate-rwtc-2018-choppy.episode.json`;
  `stats.barCount` is `40`, `totalChange` is `0.017558389928772566`, and
  `maxDrawdown` is `-0.10668477440772584`.

### Crash teaching candidate

- Candidate: `candidate-rwtc-2020-crash` (`scenario: crash`).
- Request URL:
  `https://api.eia.gov/v2/petroleum/pri/spt/data/?api_key=DEMO_KEY&frequency=daily&data%5B0%5D=value&facets%5Bseries%5D%5B%5D=RWTC&start=2020-02-20&end=2020-04-17&sort%5B0%5D%5Bcolumn%5D=period&sort%5B0%5D%5Bdirection%5D=asc`.
- Retrieved: `2026-10-03T06:11:11Z` (date `2026-10-03`); HTTP `200`, final URL unchanged.
- Evidence: 41 source rows; observed date range `2020-02-20` to
  `2020-04-17`; raw JSON `data/candidates/raw/candidate-rwtc-2020-crash.source.json`, SHA-256
  `3f3504fd9b0420c9b46b5042dd9f9a20b80608e801c824165bc06958ae50e773`;
  normalized CSV `data/candidates/inputs/candidate-rwtc-2020-crash.csv`, SHA-256
  `7d03d12147b53fc2a6939be270f7d1c23e76aaf714860ddeec3a507784812a2b`.
- Prepared candidate: `data/candidates/episodes/candidate-rwtc-2020-crash.episode.json`;
  `stats.barCount` is `41`, `totalChange` is `-0.6594755439836341`, and
  `maxDrawdown` is `-0.7377719918169984`.

### Licence and redistribution status

EIA's [copyright and reuse page](https://www.eia.gov/about/copyrights_reuse.php)
and [spot-price definitions page](https://www.eia.gov/dnav/pet/TblDefs/pet_pri_spt_tbldef2.asp)
were fetched during this task. The general reuse page says U.S. government
data files and databases may be used or distributed and asks for an
acknowledgment. It also warns that contributed materials may be protected. The
spot-price definitions page identifies Refinitiv, an LSEG business, under
Sources. Therefore redistribution is unresolved even though the EIA government
data statement is permissive: dataset-specific upstream rights, attribution,
and any restrictions on derived redistribution still need human confirmation.

Each episode preserves `provenance.acquisition.licenceNote`, the terms and
definitions URLs, upstream identifier, raw and prepared hashes, and
`humanApproved: false`. Before import into the runtime app, a human must
confirm current rights, attribution wording, source definitions/units,
observation time zone, whether the close-only series fits the lesson, and the
intended transformation. No candidate sets human approval true. Raw snapshots
and normalized CSV inputs are local-only under the candidate `.gitignore`;
metadata, candidate episode JSON, and non-price acquisition receipts keep
hashes and provenance available for review. The episode JSON is still a
non-runtime research artifact, not permission to redistribute or ship it.

## Acquisition and reproduction

The acquisition step may fetch only when explicitly run:

```sh
python3 scripts/acquire_eia_candidates.py --output-root data/candidates
```

For the preserved snapshots, reproduction is offline and uses the raw
responses plus their acquisition receipts; the original retrieval timestamp is
read from each receipt rather than guessed:

```sh
python3 scripts/acquire_eia_candidates.py \
  --offline --output-root data/candidates
```

The acquisition script then invokes the existing preparation CLI. That CLI
itself remains network-free:

```sh
python3 scripts/prepare_episode.py \
  --csv data/candidates/inputs/candidate-rwtc-2018-choppy.csv \
  --id candidate-rwtc-2018-choppy --start 2018-01-02 --end 2018-02-28 \
  --meta data/candidates/metadata/candidate-rwtc-2018-choppy.meta.yaml
```

The same command shape applies to the crash candidate. The raw snapshots and
candidate documents are evidence for review only; they must not be copied into
`src/data/episodes/` without a separate human decision.

## Source licence checklist

For each future source, record:

- exact publisher and official URL;
- dataset/document title, version, retrieval date, and date coverage;
- licence or terms, commercial/redistribution status, attribution text, and restrictions;
- schema, units, timezone, adjustment/corporate-action treatment, and missing-value rules;
- whether dates are observed dates or an explicit calendar, and who verified holidays;
- reviewer name, review date, evidence link, and expiry/recheck date.

A missing answer blocks release. Use `TODO(human)` rather than a plausible-looking value.

## Mandatory scenario coverage

Any future prepared fixture must include a crash and a choppy scenario. A rally must be paired with a shakeout so the lesson does not imply that upward movement is a safe or universal outcome. Scenario labels are teaching labels, not market classifications. Human review must check that ordering, dates, and semantics are not fabricated.

## CSV preparation CLI contract

The available Python 3.10+ preparation CLI accepts:

```sh
python scripts/prepare_episode.py \
  --csv scripts/fixtures/crash-synthetic.csv --id crash-synthetic \
  --start 2024-01-02 --end 2024-01-11 \
  --meta scripts/fixtures/crash-synthetic.meta.yaml \
  --output /tmp/crash-synthetic.episode.json
```

The command and metadata shape are documented in `scripts/README.md`. Required flags are `--csv`, `--id`, `--start`, `--end`, and `--meta` (YAML); `--output` is optional and otherwise JSON is written to stdout. The Phase 1 CLI must:

1. reject missing, reversed, or impossible dates;
2. require `expectedDates` or an explicit `calendar.dates` list rather than inventing holidays;
3. validate a stable identifier, numeric fields (including NaN, infinity, and non-positive values), OHLC coherence, duplicates, units, and missing values;
4. keep complete source provenance, licence note, `isPlaceholder`, and `intradayAvailable` in YAML metadata, with English and Hindi text for every reveal field;
5. require at least two bars, require `intradayAvailable` to match low-column presence, and emit deterministic episode JSON with an input SHA-256 and summary stats;
6. fail closed if the source metadata is incomplete or the requested dates are absent. The output label is neutral (`Episode A`); no metadata label or source claim is invented. The current script validates one episode; mandatory crash/choppy/rally-shakeout scenario coverage remains a release/content responsibility.

The CLI must not fetch the web, backfill missing observations with guesses, or transform real data into a claim of prediction. Its output is test input, not investment information. The fixture regression tests write regenerated JSON only to temporary directories; they do not overwrite committed app data. Real-data preparation and licence review remain blocked on `TODO(human)` evidence.
