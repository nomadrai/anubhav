# Simulation specification

This document defines the future educational engine contract. Phase 0 does not execute an actual simulation and does not display charts. Any stub result must say “not implemented”.

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

A maintenance warning is emitted at most once before exit when `equityLow ≤ 1.5 × M` (that is, at or below 37.5% of starting capital), using the requested 1.5 maintenance buffer. It is a teaching rule, not a margin requirement. If the same low reaches the forced-exit threshold, event ordering must be tested and reviewed; no repeated warning events are allowed for one run. Human review must approve the warning wording and ordering before release (`TODO(human)`).

## Seeded synthetic path

The fixture generator uses a documented seed and `mulberry32` pseudo-random generator. A geometric step is conceptually:

`P[t+1] = P[t] × exp(drift + volatility × shock[t])`

where `shock[t]` is derived deterministically from the seeded generator and all parameters are explicit. A path is synthetic, reproducible, and not a forecast. Phase 0 may expose the seed in a test fixture but must not expose a false market date or chart.

## Recovery

For a loss fraction `x` of starting capital, the gain required to return to the starting amount is:

`recoveryGain = x / (1 - x)`

For example, a 20% loss requires a 25% gain; the formula is not symmetrical because the base changed.

## Required summary statistics

A future result summary must define and test:

- **change:** `(final equity - C) / C`;
- **drawdown:** the largest percentage decline from any running equity peak to a later equity value, using the selected settlement value after forced exit;
- **count:** the number of down-close steps (`P[t] < P[t-1]`), with the exact convention documented;
- **worst fall:** the most negative single close-to-close percentage move;
- forced-exit flag and warning count.

It must state whether the first entry point is included, how ties are treated, and how decimals are rounded. No statistic is a recommendation or risk score.

## Worked example: 10× and 7% fall

Use `C = 100`, `L = 10`, `P0 = 100`, and a close of `P = 93`:

- exposure `E = 100 × 10 = 1,000`;
- units `U = 1,000 / 100 = 10`;
- equity `= 100 + 10 × (93 - 100) = 30`;
- capital change `= (30 - 100) / 100 = -70%`;
- recovery fraction `x = 0.70`; required recovery `0.70 / 0.30 = 2.3333…`, or **233.33%**;
- the 25% forced-exit threshold is `25` equity and the 1.5-maintenance warning threshold is `37.5`; the 7% close therefore warns but is not forced out. A low of `92.5` reaches forced exit exactly (`100 + 10 × (92.5 - 100) = 25`), while a deeper intrabar low would settle at `25`.

The example is arithmetic only. It is not an expected outcome, an historical observation, or advice.

## Human review margin rule

Any displayed margin, threshold, or forced-exit explanation requires human review before release. A reviewer must check that “capital”, “exposure”, “equity”, “units”, “low”, “warning”, and “settlement” are not conflated; that `L > 1` is explicit; that the 1.5-maintenance buffer is computed from `M = 0.25 × C`; and that the 10× example is reproduced exactly. Do not publish a broker-, exchange-, or jurisdiction-specific margin claim without a verified source and separate approval.
