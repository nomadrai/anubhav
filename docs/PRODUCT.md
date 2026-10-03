# Product brief

## Working title and purpose

The code has one working-title constant at `src/config/app.ts`. Keep that value out of documentation and participant-facing copy; use **the app** instead. The app is an investor-protection learning experience: it should help a person notice how leverage, volatility, drawdown, forced exit, and recovery interact before they make a financial decision elsewhere.

This is education and reflection, not financial advice. It must not tell a person what to buy, sell, hold, borrow, or allocate.

## Intended audience

The primary audience is an adult learner who may be unfamiliar with leverage and downside risk. The app supports English/Hindi reading, phone-sized layouts, keyboard controls and text alternatives. Current Hindi is agent-checked with back-translation evidence, not native-reviewed. Human screen-reader, pronunciation and comprehension review remain unperformed and explicitly disclosed.

## User outcome

After a short, guided interaction, a participant should be able to:

1. distinguish capital from exposure and units;
2. identify that a percentage fall can create a larger percentage loss of capital when leverage is used;
3. recognize that a forced-exit simplification can prevent waiting for recovery;
4. explain that recovery from a loss is asymmetric; and
5. state one uncertainty or question they would take to a qualified source.

The outcome is recognition, not prediction skill or a profitable strategy.

## Phase boundaries

The implemented journey combines the pure teaching engine, two provenance/reuse-checked historical windows, bilingual hash-reviewed content, optional gesture-only static narration/glossary audio, warmed-shell offline behavior and memory-only reflection summary. Audio completeness/quality remains strictly gated: see AUDIO_BUILD.md for actual generated assets, not a presumed full set. Real browser/performance evidence is in ACCESSIBILITY_AND_PERFORMANCE.md. No actual pilot, native-speaker/listening review or public deployment is implied.

Every screen must have a keyboard-reachable primary action, a clear synthetic or unavailable state where work is not implemented, and a language label. The journey is:

`language → intro → setup → prediction → run → result → replay → reveal → debrief → postcheck → nextsteps`

The `pilot=1` mode exposes the current session's in-memory pre/post summary and explicit optional clipboard copy; it is not a data-collection system.

## Non-goals

- No recommendations, financial-product/provider promotion, named real instruments in UI/audio, or live market data. Selected historical observations are neutral teaching inputs, never a market forecast.
- No trading, account, order, portfolio, payment, subscription, or monetisation feature.
- No profit leaderboard, streak, confetti, or other gamification of financial outcomes.
- No promise of safety, returns, prediction accuracy, or generalisation to markets.
