# Limitations and non-claims

- Phase 2 connects the journey UI to deterministic teaching playback, charts, replay, result, reveal, debrief, and post-check screens; this is still not a production simulator.
- Charts are plain educational SVG views of the loaded episode and are not market-analysis tools.
- The seeded `mulberry32` geometric path is synthetic test input, not market data, history, a forecast, or a representative distribution.
- The equity and forced-exit math is an educational simplification, not a broker, exchange, lender, tax, or jurisdictional rule.
- No margin call, liquidation, slippage, fees, funding, spread, taxes, corporate actions, liquidity, gaps, or execution uncertainty is modeled.
- The runtime still imports only synthetic crash/choppy fixtures. Downloaded candidates, source pointers, datasets, and licence evidence remain outside the app until human review; see `docs/DATA_SOURCES.md` and any candidate review log.
- No audio is generated or played. No model or voice dataset is bundled.
- No offline behavior is supported, even though the future stack includes a PWA plugin.
- Daily data may understate forced exits; the engine can use an intrabar low only when the supplied episode contains one.
- No pilot UI, participant database, outcome analysis, or research claim exists.
- Performance targets are unmeasured. Accessibility requires manual testing and human review.
- Draft Hindi and analogy copy may be inaccurate or culturally unclear until reviewed.
- A small pilot, if later run, cannot establish effectiveness, safety, causality, or population-level behavior.

Whenever a limitation changes, update this file and the relevant release gate. Use `TODO(human)` for unresolved evidence, not invented confidence.
