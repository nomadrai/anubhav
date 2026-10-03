# Simulation specification

This document defines the implemented pure TypeScript educational engine. It executes deterministic tests and journey playback without I/O. Charts/meters are teaching views, not market analysis; audio/offline behavior belongs to separate UI/static-asset layers. Real runtime ECB reference observations use internal `close` as a numeric carrier, not a claim of executable market closing prices.

## Model and units

Let:

- `C` = starting capital, in generic currency units;
- `L` = leverage multiplier, dimensionless, with `L > 0`;
- `E` = exposure, `E = C × L`;
- `P0` = entry price, positive generic price units;
- `P` = close price for a step;
- `U` = units, `U = E / P0`;
- `equity(P)` = `C + U × (P - P0)`.

This deliberately keeps price and currency generic. The engine must show the entry and close definitions in its accessible explanation. It must not imply a real instrument.

For an intrabar low `Plow`, use `equityLow = C + U × (Plow - P0)`. Intrabar low is a risk check, not a promise that a participant could have exited at a chosen price.

## Forced exit and warning simplification

For `L > 1`, define maintenance equity `M = 0.25 × C`. If `equityLow ≤ M`, settle the run at `M`. This is an explicit educational simplification, not a broker rule and not a real liquidation model. The engine must record that a forced-exit condition was reached and stop later path values from being presented as recoverable.

For leveraged runs only, a maintenance warning is emitted at most once before exit when close equity `equity ≤ 1.5 × M` (that is, at or below 37.5% of starting capital), using the requested 1.5 maintenance buffer. It is a teaching rule, not a margin requirement. If the same low reaches the forced-exit threshold, event ordering must be tested and reviewed; no repeated warning events are allowed for one run. Warning-once/order/threshold regression tests and bilingual agent QA check this contract. Under ADR-0011, agent-checked copy may pass with explicit warnings; no human review is claimed.

## Seeded synthetic path

The implemented fixture generator uses a documented seed and `mulberry32` pseudo-random generator. A geometric step is:

`P[t+1] = P[t] × exp(drift + volatility × shock[t])`

where `shock[t]` is derived deterministically from the seeded generator and all parameters are explicit. A path is synthetic, reproducible, and not a forecast. Phase 1 exposes the seed only in synthetic fixture metadata/tests; the app must not expose a false market date or present synthetic data as history.

## Recovery

For a loss fraction `x` of starting capital, the gain required to return to the starting amount is:

`recoveryGain = x / (1 - x)`

For example, a 20% loss requires a 25% gain; the formula is not symmetrical because the base changed.

## Required summary statistics

The Phase 1 result summary defines and tests:

- **change:** `(final equity - C) / C`;
- **drawdown:** the largest percentage decline from any running equity peak to a later equity value, using the selected settlement value after forced exit;
- **count:** the number of down-close steps (`P[t] < P[t-1]`), with the exact convention documented;
- **worst fall:** the most negative single close-to-close percentage move;
- forced-exit flag and warning count.

The first entry point is included in `barCount` but contributes no down-close step; equal closes are not down closes; engine values remain exact fractions and display rounding belongs to the UI. No statistic is a recommendation or risk score.

## Worked example: 10× and 7% fall

Use `C = 100`, `L = 10`, `P0 = 100`, and a close of `P = 93`:

- exposure `E = 100 × 10 = 1,000`;
- units `U = 1,000 / 100 = 10`;
- equity `= 100 + 10 × (93 - 100) = 30`;
- capital change `= (30 - 100) / 100 = -70%`;
- recovery fraction `x = 0.70`; required recovery `0.70 / 0.30 = 2.3333…`, or **233.33%**;
- the 25% forced-exit threshold is `25` equity and the 1.5-maintenance warning threshold is `37.5`; the 7% close therefore warns but is not forced out. A low of `92.5` reaches forced exit exactly (`100 + 10 × (92.5 - 100) = 25`), while a deeper intrabar low would settle at `25`.

The example is arithmetic only. It is not an expected outcome, an historical observation, or advice. Runtime chart endpoints display actual settled equity on forced exit rather than the raw below-threshold close; the closed exposure does not recover on later path steps. Unleveraged comparison uses the full identical observed series and starting capital. After an early manual exit, durations differ; UI explicitly discloses that comparison limit.

## Teaching-rule review boundary

The agent checked arithmetic, deterministic event ordering and bilingual meaning; actual human/native review remains distinct. Any future change must check that “capital”, “exposure”, “equity”, “units”, “low”, “warning”, and “settlement” are not conflated; that `L > 1` is explicit; that the 1.5-maintenance buffer is computed from `M = 0.25 × C`; and that the 10× example is reproduced exactly. Do not publish a broker-, exchange-, or jurisdiction-specific margin claim without a verified source and separate approval.
