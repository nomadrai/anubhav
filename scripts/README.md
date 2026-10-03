# Phase 1 preparation scripts

## Episode metadata schema

`prepare_episode.py` is the Phase 1 offline preparation path. It requires YAML metadata with these fields:

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
ISO dates. A calendar is never inferred. The requested range must contain the
explicit sessions represented by the CSV; missing or extra dates fail closed.
`sourceName`, `sourceUrl`, `retrievedOn`, and `licenceNote` are required and
are copied without fabrication. `retrievedOn` must itself be a valid ISO date.
`inputSha256` is always computed from the exact CSV bytes and replaced in the
output provenance. `isPlaceholder` and `intradayAvailable` must be explicit
booleans. The stable `id` is validated by the CLI and builder, while the
output label is always the neutral `Episode A`.

The output shape is deterministic for identical CSV bytes and metadata; no
network access, holiday inference, backfilling, or source transformation is
performed.

The output shape is:

- `id` (letters, digits, `.`, `_`, and `-`), neutral `label: "Episode A"`, and sorted `bars`.
- Each bar has `date` and `close`, plus any supplied `open`, `high`, and/or
  `low` columns.
- `reveal.periodText` and `reveal.whatHappenedText` each have `en` and `hi`.
- `stats` contains fractional `maxDrawdown`, `totalChange`, and
  `worstSingleDayFall`, plus integer `barCount`. Drawdown and the worst fall
  are non-positive fractions; `totalChange` is `last / first - 1`.
- `provenance` contains the four supplied fields and computed `inputSha256`.

CSV headers are matched case-insensitively after whitespace/punctuation is
removed. `date` and `close` are required; `open`, `high`, and `low` are
optional. CSV cells cannot be blank, and numeric cells cannot be NaN, infinite,
or non-positive. OHLC bounds are checked, duplicate dates are rejected, and
every expected date in the requested range must occur exactly once. An episode
has at least two bars. `intradayAvailable: true` requires a positive `low` on
every bar; `false` rejects any low column/value, so metadata cannot overclaim
intraday coverage.

Example:

```sh
python scripts/prepare_episode.py \
  --csv scripts/fixtures/crash-synthetic.csv --id crash-synthetic \
  --start 2024-01-02 --end 2024-01-11 \
  --meta scripts/fixtures/crash-synthetic.meta.yaml \
  --output /tmp/crash-synthetic.episode.json
```

## Optional historical candidate acquisition (not runtime)

`scripts/acquire_eia_candidates.py` is the only explicitly network-capable data script. It fetches two EIA candidate windows into `data/candidates/`, preserves raw-response hashes and retrieval receipts, and invokes the offline preparation CLI. It does not import data into `src/data/episodes/`, set human approval, or infer a calendar. Reproduction of the checked-in receipts is network-free:

```sh
python3 scripts/acquire_eia_candidates.py --offline --output-root data/candidates
```

The candidate source, row counts, date ranges, licence uncertainty, and resource checks are recorded in `docs/DATA_SOURCES.md` and `docs/RESOURCE_REVIEW.md`. Raw snapshots and normalized price inputs are git-ignored pending human rights review.

## Audio contract (optional offline build)

`generate_audio.py --provider stub --dry-run --episode EPISODE.json` emits a
JSON **dry-run plan only**. The plan contains spoken text and SHA-256 content
hashes and explicitly has `manifestGenerated: false`; it creates no audio and
no manifest.

The optional `indic_parler` provider targets the documented
`ai4bharat/indic-parler-tts` candidate. It requires a caller-supplied local
checkpoint, an explicit model revision, locally installed optional TTS
packages, and `ffmpeg`; it never downloads a model or makes a runtime request.
Use `--check` for fail-closed prerequisite checks and see
[`docs/AUDIO_PIPELINE.md`](../docs/AUDIO_PIPELINE.md) for the manifest hashes,
safe output rules, and review boundary. Missing dependencies/model access or
conversion failure produces no approved asset. We do not commit model weights,
WAV/Opus output, or manifests, and the app keeps audio unavailable until
human/native-speaker review is complete.
