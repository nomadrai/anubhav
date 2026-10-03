# Product brief

## Working title and purpose

The code has one working-title constant at `src/config/app.ts`. Keep that value out of documentation and participant-facing copy; use **the app** instead. The app is an investor-protection learning experience: it should help a person notice how leverage, volatility, drawdown, forced exit, and recovery interact before they make a financial decision elsewhere.

This is education and reflection, not financial advice. It must not tell a person what to buy, sell, hold, borrow, or allocate.

## Intended audience

The primary audience is an adult learner who may be unfamiliar with leverage and downside risk. Phase 0 assumes bilingual English/Hindi reading support, a phone-sized viewport, keyboard access, and a screen reader. Hindi copy is draft content until a qualified human reviews meaning, tone, and spoken numbers.

## User outcome

After a short, guided interaction, a participant should be able to:

1. distinguish capital from exposure and units;
2. identify that a percentage fall can create a larger percentage loss of capital when leverage is used;
3. recognize that a forced-exit simplification can prevent waiting for recovery;
4. explain that recovery from a loss is asymmetric; and
5. state one uncertainty or question they would take to a qualified source.

The outcome is recognition, not prediction skill or a profitable strategy.

## Phase boundaries

Phase 0 implemented the bilingual clickable skeleton, content/release/bundle contracts, deterministic-path contract, and CLI scaffolds. Phase 1 implements the pure deterministic simulation engine, runtime episode validation, Python CSV preparation, synthetic crash/choppy fixtures, and regression tests. Phase 2 connects those results to playback, educational charts/meters, replay, reveal, debrief, and post-check. Phase 3 adds bilingual display/spoken content contracts, content-limit checks, and an optional local-only audio generation path. Reviewed audio playback, offline behavior, real verified episodes, and a polished pilot flow remain later work.

Every screen must have a keyboard-reachable primary action, a clear synthetic or unavailable state where work is not implemented, and a language label. The journey is:

`language → intro → setup → prediction → run → result → replay → reveal → debrief → postcheck → nextsteps`

The `pilot=1` route/state exposes only a local summary scaffold; it is not a data-collection system.

## Non-goals

- No recommendations, product or company brands, real instruments, or live/prior market data.
- No trading, account, order, portfolio, payment, subscription, or monetisation feature.
- No profit leaderboard, streak, confetti, or other gamification of financial outcomes.
- No promise of safety, returns, prediction accuracy, or generalisation to markets.
