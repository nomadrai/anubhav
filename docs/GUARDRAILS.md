# Guardrails

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

- The period remains hidden until the reveal step. A participant first records a prediction or expectation, then sees the synthetic result.
- The Phase 2 run, chart, replay, reveal, and debrief are educational engine views, not market views. “Listen”, “download”, and “offline” controls must not imply implementation; unavailable audio remains explicitly disclosed.
- English copy appears first. Draft Hindi is labeled draft until human review. Numbers intended for speech have separate spoken text; do not force a screen reader to pronounce symbols ambiguously.
- The app stores only the selected language and text-size preference locally. It has no accounts, cookies, financial records, or external runtime telemetry.
- Network requests at runtime are same-origin static asset requests only. Production CSP must use `connect-src 'self'` and an equivalent restrictive policy reviewed by a human.

## Release gate

`npm run release` must stop on placeholder copy, draft Hindi or analogy text, unverified candidate resources, missing human sign-off, invalid content limits, unsafe links, or an unresolved release blocker. A green build is not permission to bypass this gate. The release checklist must record who verified safety, Hindi, source, accessibility, licence, CSP, and pilot material.

## Review triggers

Ask for human review when adding a new claim, example number, Hindi translation, resource pointer, storage key, network request, dependency, audio model, or pilot question. Keep rationale and evidence next to the change.
