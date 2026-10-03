# Honest 3–5 minute walkthrough

This walkthrough describes the implemented educational journey. It is not a forecasting, trading or recommendation tool. Use `npm run build && npm run preview` for the production PWA; `npm run dev` is not evidence of offline behavior.

## 0:00–0:30 — Language and reading options

Choose Hindi or English. The footer states that an automated agent checked the text, not a Hindi native speaker, and that generated voice has no human listening review. Open **Reading options** to change language or select larger text. Only those two preferences persist. Answers remain in the current page's memory.

Keyboard users can activate the skip link, use native buttons/selects, and open glossary/table disclosures with Enter or Space. Focus moves to the heading after a screen transition. Automated checks are recorded separately; do not present them as a human screen-reader review.

## 0:30–1:15 — Setup and prediction before the path

Choose a neutrally labelled hidden episode, a virtual-money amount, and borrowed exposure. No real instrument, account or broker is selected. These choices are not recommendations. Dates and the neutral source attribution are absent from the UI until Reveal.

Record an expectation before playback. Continue is disabled until an answer is chosen. There is no score and no prediction of a future market outcome.

## 1:15–2:10 — Watch, pause and finish

The recorded path advances one observation at a time. Use **Pause the path** to stop it for as long as needed. Decision points and teaching-margin warnings also stop the timer; choose to continue the exercise or exit it. Chart text/data tables, virtual equity and the teaching margin labels remain available without narration.

The high-exposure first episode demonstrates the simplified forced-exit rule. With the default 25% stake and ten-times exposure, the settled amount is ₹625: this is a consequence of the configured teaching model, not a real-world liquidation rule. A voluntary exit is not scored as right or wrong.

## 2:10–3:10 — Same-path comparison, then reveal

Compare against one-times exposure on the identical full recorded path and starting amount. If the learner exited early, the holding time differs too; the UI states this explicitly. A closed comparison line ends at its settlement, never continuing into a later recovery.

Only now reveal the recorded period, computed path statistics and neutral publisher attribution. Raw source URLs and instrument-bearing source names are not rendered. The source/reuse evidence remains in the project documentation. The path alone does not establish a causal explanation, and one episode does not predict another.

Read the result-specific debrief and recovery calculation. Open the glossary's nine simple explanations as needed; diversification, compounding and fees are explanations here, not recommendations or additional engine mechanics.

## 3:10–4:10 — Reflection, resources and local summary

Choose a second expectation and whether a clearer explanation would help. Both answers are needed to continue. Before/after reflection is displayed without scoring.

Only verified official resource records render, using their checked bilingual labels. Links open an external site in a new tab; the app visibly explains that the destination has its own privacy rules. It does not fetch or embed the resource pages.

Open the local session summary (also selected at journey end by `?pilot=1`). This is not a research pilot or evidence of learning. Optional Copy puts the visible reflection summary on the device clipboard. It does not send it anywhere. Restart erases all journey answers; reload also starts a new journey while retaining language/text-size preferences.

## 4:10–5:00 — Optional audio and offline boundary

No narration is requested or played automatically. **Listen** is an explicit gesture; a valid complete schema-2 manifest and hash-checked local audio are required. If a clip cannot play, captions remain visible and the learner can continue without sound. Do not narrate a partial generation set as available complete audio. Pause/resume/replay/mute and slower narration controls appear only when playback is available.

After a successful online service-worker cache fill, reload the production app offline. The shell and teaching content work from cache. Only previously requested/cached clips can play offline, and official external links still need internet. Browser eviction or unsupported service workers can remove/prevent this capability. The status notice reports what the browser says about connectivity; it does not verify a connection.

See [ACCESSIBILITY_AND_PERFORMANCE.md](ACCESSIBILITY_AND_PERFORMANCE.md) for actual automated browser and throttled-navigation measurements, and [PRODUCT_IMPLEMENTATION.md](PRODUCT_IMPLEMENTATION.md) for feature QA, dependencies and explicit remaining checks. No human listening, native-language, screen-reader, participant or efficacy review is claimed.
