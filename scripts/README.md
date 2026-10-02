# Phase 0 scripts

## Episode metadata schema

`prepare_episode.py` requires YAML metadata with these fields:

```yaml
# Exactly one of these is required. It is an explicit session list; no
# weekday/weekend or exchange-holiday assumptions are made.
expectedDates:
  - 2024-01-02
# Alternatively:
# calendar:
#   name: a-human-readable-calendar-name
#   dates: [2024-01-02, 2024-01-03]

intradayAvailable: false
isPlaceholder: true
provenance:
  sourceName: Synthetic fixture
  sourceUrl: synthetic://phase0/fixture
  retrievedOn: 2024-01-04
  licenceNote: Synthetic data; not market data.
reveal:
  periodText:
    en: A short synthetic period.
    hi: एक छोटी कृत्रिम अवधि।
  whatHappenedText:
    en: The example moved up and down.
    hi: उदाहरण ऊपर और नीचे चला।
```

`expectedDates` (or `calendar.dates`) must be a non-empty, unique list of
ISO dates. A calendar is never inferred. `sourceName`, `sourceUrl`,
`retrievedOn`, and `licenceNote` are required and are copied without
fabrication. `inputSha256` is always computed from the exact CSV bytes and
replaced in the output provenance. `isPlaceholder` and `intradayAvailable`
must be explicit booleans.

The output shape is:

- `id` (letters, digits, `.`, `_`, and `-`), neutral `label: "Episode A"`, and sorted `bars`.
- Each bar has `date` and `close`, plus any supplied `open`, `high`, and/or
  `low` columns.
- `reveal.periodText` and `reveal.whatHappenedText` each have `en` and `hi`.
- `stats` contains fractional `maxDrawdown`, `totalChange`, and
  `worstSingleDayFall`, plus integer `barCount`.
- `provenance` contains the four supplied fields and computed `inputSha256`.

CSV headers are matched case-insensitively after whitespace/punctuation is
removed. `date` and `close` are required; `open`, `high`, and `low` are
optional. CSV cells cannot be blank, and numeric cells cannot be non-finite or
non-positive. OHLC bounds are checked, duplicate dates are rejected, and every
expected date in the requested range must occur exactly once.

Example:

```sh
python scripts/prepare_episode.py \
  --csv scripts/fixtures/synthetic.csv --id synthetic-a \
  --start 2024-01-02 --end 2024-01-05 \
  --meta scripts/fixtures/synthetic.meta.yaml \
  --output /tmp/synthetic.episode.json
```

## Audio contract (not implemented yet)

`generate_audio.py --provider stub --dry-run --episode EPISODE.json` emits a
JSON **dry-run plan only**. The plan contains spoken text and SHA-256 content
hashes and explicitly has `manifestGenerated: false`; it creates no audio and
no manifest. `indic_parler.py` deliberately raises `NotImplementedError`:
no model, dependency, or provider has been selected.

A future provider must normalize output to mono, 24 kbps Opus via `ffmpeg` and
must document that contract before implementation. This Phase 0 does not
produce silent placeholders or claim manifest coverage.
