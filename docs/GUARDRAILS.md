# Guardrails

## Current user-authorized chat exception

KB covers generic terms and protection in original bilingual agent-checked text.
Entry-specific lintAllow reasons permit explained/warned terms, not advice or
promotion. No named stock, intermediary, investment app or influencer suggestions.
Chat sends only a disclosed, expressly submitted question and language via the
same-origin server to Groq. It never sends practice/pilot state. Server-only key;
no question logs/storage; IP counters only for limiting. Advice/prediction/tip
assessment bypasses the model; unsafe/failed answers use original entry text.
No provider-zero-retention claim. Footer capability follows CHAT_ENABLED.
This explicitly supersedes earlier static-only/stub wording, not other guardrails.

These are product requirements, not suggestions. A release must fail or hide content when a guardrail cannot be demonstrated.

## Prohibited behavior and claims

- Do not give a recommendation, target, signal, ranking, or call to buy, sell, hold, borrow, or leverage.
- Do not show a brand, named financial product, real instrument, ticker, account balance, order, or monetisation prompt.
- Do not reward profit, a larger exposure, more risk, speed, or repeated play. No leaderboards, streaks, or celebratory profit language.
- Do not call a synthetic path “the market”, “historical”, “likely”, or “predicted”. Label it synthetic and seeded.
- Do not imply that the engine forecasts prices, estimates a person’s risk tolerance, or validates a strategy.
- Do not present a placeholder resource as verified. A false or unverified pointer must be hidden.
- Do not claim accessibility, performance, offline, licence, pilot, or statistical findings without evidence.
- Do not fabricate a source, price, holiday, date, participant response, model result, or licence. Use `TODO(human)`.

## Interaction constraints

- The period remains hidden until the reveal step. A participant first records a prediction or expectation, then sees the virtual-money result. Real historical observations must have evidenced reuse/provenance and remain distinct from synthetic test fixtures.
- Run, chart, replay, reveal and debrief are educational engine views, not market-analysis tools. Manual Listen starts on a gesture; user-authorized, locally remembered auto-speak may play stored narration automatically. Browser-blocked autoplay stays quiet and all errors preserve visible text. Offline promises are limited to the measured warmed/cached behavior.
- English/Hindi copy has hash-bound review evidence. Draft blocks release; agent-checked content passes only with individual loud warnings and an explicit lack-of-native-review disclosure. Only actual human evidence may set reviewed. Numbers intended for speech have separate spoken text; do not force a screen reader to pronounce symbols ambiguously.
- The app stores only the selected language and auto-speak preference locally. Text uses the fixed former A+ size; the retired text-size key is removed. It has no accounts, cookies, financial records, or external runtime telemetry.
- Network requests at runtime are same-origin static asset requests only. Production CSP must use `connect-src 'self'` and an equivalent restrictive policy reviewed by a human.

## Release gate

`npm run release` must stop on shipped placeholders, draft/planned copy, unverified resources, missing/stale/failed audio, invalid content limits, unsafe links, or unresolved shipped TODOs. The user-authorized `agent-checked` status is allowed with every affected string individually warned; agents must never set `reviewed`. Preserve non-shipped research/test blockers rather than falsely approving them. A green technical gate is not human listening, legal publication approval, assistive-technology conformance or pilot consent. Keep exact remaining publication decisions in TODO_DISPOSITION.md.

## Review triggers

Use verifiable evidence for new claims, calculations, translations, official resource pointers, storage/network behavior, dependencies and model configuration; keep rationale next to the change. Agent checks do not establish native/listening review, licence rights absent publisher evidence, participant consent or outcomes. Park those decisions and batch the exact human actions at the end. AGENTS.md and ADR-0011 record the current authorization.
