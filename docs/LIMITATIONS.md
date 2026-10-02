# Limitations and non-claims

- Phase 1 has a deterministic teaching engine, but the journey UI does not yet connect to its playback, chart, replay, or result screens; this is not a production simulator.
- No production chart is implemented; any journey “result” is still a labeled placeholder.
- The seeded `mulberry32` geometric path is synthetic test input, not market data, history, a forecast, or a representative distribution.
- The equity and forced-exit math is an educational simplification, not a broker, exchange, lender, tax, or jurisdictional rule.
- No margin call, liquidation, slippage, fees, funding, spread, taxes, corporate actions, liquidity, gaps, or execution uncertainty is modeled.
- Only synthetic crash/choppy fixtures exist; no real data, holiday calendar, source pointer, dataset, model, or licence has been selected or verified.
- No audio is generated or played. No model or voice dataset is bundled.
- No offline behavior is supported, even though the future stack includes a PWA plugin.
- Daily data may understate forced exits; the engine can use an intrabar low only when the supplied episode contains one.
- No pilot UI, participant database, outcome analysis, or research claim exists.
- Performance targets are unmeasured. Accessibility requires manual testing and human review.
- Draft Hindi and analogy copy may be inaccurate or culturally unclear until reviewed.
- A small pilot, if later run, cannot establish effectiveness, safety, causality, or population-level behavior.

Whenever a limitation changes, update this file and the relevant release gate. Use `TODO(human)` for unresolved evidence, not invented confidence.
