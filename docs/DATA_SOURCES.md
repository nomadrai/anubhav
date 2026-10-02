# Data sources and preparation

## Status

No real data has been selected for Phase 0. The path used by tests is seeded synthetic data and must never be labeled historical, live, representative, or predictive.

Named candidate organisations belong in this document only and are not approved sources: Securities and Exchange Board of India (SEBI), Reserve Bank of India (RBI), National Stock Exchange of India (NSE), BSE, and Association of Mutual Funds in India (AMFI). `TODO(human): verify an exact official pointer, permitted use, date coverage, definitions, and licence before selecting any source.`

Candidate resources are false/hidden by default. The UI may show a resource only when its exact pointer has been verified by a human, its relevance is recorded, and its licence and attribution requirements are known. Do not invent a holiday calendar, trading session, observation, or date range.

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
  --csv scripts/fixtures/synthetic.csv --id synthetic-a \
  --start 2024-01-02 --end 2024-01-05 \
  --meta scripts/fixtures/synthetic.meta.yaml \
  --output /tmp/synthetic.episode.json
```

The command and metadata shape are documented in `scripts/README.md`. Required flags are `--csv`, `--id`, `--start`, `--end`, and `--meta` (YAML); `--output` is optional and otherwise JSON is written to stdout. The CLI must:

1. reject missing, reversed, or impossible dates;
2. require `expectedDates` or an explicit `calendar.dates` list rather than inventing holidays;
3. validate a stable identifier, numeric fields, OHLC bounds, ordering, duplicates, units, and missing values;
4. keep source provenance, licence note, `isPlaceholder`, and `intradayAvailable` in YAML metadata;
5. emit deterministic episode JSON with an input SHA-256 and summary stats;
6. fail closed if the source metadata is incomplete or the requested dates are absent. The current script validates one episode; mandatory crash/choppy/rally-shakeout scenario coverage remains a release/content responsibility.

The CLI must not fetch the web, backfill missing observations with guesses, or transform real data into a claim of prediction. Its output is test input, not investment information.
