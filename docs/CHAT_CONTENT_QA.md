# Chat UI and KB integration — agent-checked

## Compact popup and step questions (2026-10-04)

The chat-only redesign uses a 400px, header-anchored non-modal panel, near
full-width on phones. X, Escape and the Chat toggle close it; messages scroll
above three step-specific chips and an Enter/Send composer. Chips appear only
before the first submitted question, disappear immediately on Send/Enter or a
chip tap, and return when the panel is reopened. Answers render as
text only. Phone height reserves room for the journey's sticky action area.
The existing About/footer retain provider and missing-native-review
disclosures. Messages exist only while the panel is open; only the explicitly
submitted question and language are sent. Retrieval, server code, safety gates,
knowledge entries, and original-entry fallbacks are unchanged.

`src/content/{en,hi}/chat.json` stores exactly three `stepQuestions` for each of
the eleven steps. Each object's key is its existing KB entry ID. The following
agent-only QA pass compares the question to that entry in both languages and
independently restates its Hindi meaning in English. All retain learning-question
scope, with no advice request, future claim, period disclosure or new fact.
Hindi remains `agent-checked`, never human/native-reviewed.

| Step | KB entry ID | Hindi → English back-translation | Coverage / disposition |
|---|---|---|---|
| LanguageSelect | app-step-language | Why choose a language? | Language-choice purpose; equivalent |
| LanguageSelect | app-language | Can the language be changed later? | Header language switch; equivalent |
| LanguageSelect | app-manual-audio | How does the Listen button work? | Stored playback controls; equivalent |
| Intro | app-virtual-money | Is this real money? | Practice numbers, no real funds; equivalent |
| Intro | app-step-intro | What is there to do here? | Predict, watch, compare, reflect; equivalent |
| Intro | app-privacy | Are practice answers saved? | Journey memory versus preferences; equivalent |
| Setup | app-stake | What is the virtual-amount choice? | Selected share of base amount; equivalent |
| Setup | app-leverage | What is borrowed power? | Established plain-language leverage term; equivalent |
| Setup | app-exposure | What is exposure? | Amount affected by path changes; equivalent |
| Prediction | app-step-prediction | Why choose an expectation before watching? | Before/after reflection; equivalent |
| Prediction | app-hidden-period | Why is the period hidden? | Reveal boundary, no actual date; equivalent |
| Prediction | app-uncertainty | What does uncertainty mean here? | Limits of this exercise; equivalent |
| Run | app-warning | What is a warning point? | Teaching signal near maintenance; equivalent |
| Run | app-forced-exit | What is forced exit? | Model closure, not a real procedure; equivalent |
| Run | app-equity | What is the remaining virtual amount? | Equity within this exercise; equivalent |
| Result | app-step-result | What does the result show? | Ending amount, change and closure reason; equivalent |
| Result | app-gains-losses | What does total change mean? | Starting-to-ending percentage; equivalent |
| Result | app-position-status | Is there no loss in an open position? | Questions the misconception, no promise; equivalent |
| Replay | app-same-path | Why is the same path used? | Identical observations for contrast; equivalent |
| Replay | app-comparison-chart | What do both lines mean? | Dashed versus unbroken lines; equivalent |
| Replay | app-comparison-limit | Why can the practice durations differ? | Early closure versus full replay; equivalent |
| Reveal | app-data-source | What is the source of the data? | Attribution, not endorsement; equivalent |
| Reveal | app-path-statistics | What do these measurements mean? | Path measurements, not a decision score; equivalent |
| Reveal | app-uncertainty | Why is one example not a forecast? | Episode cannot establish future outcomes; equivalent |
| Debrief | app-recovery | How does recovery maths work? | Smaller base and asymmetric percentages; equivalent |
| Debrief | app-drawdown | What is a fall from a high? | Established plain-language drawdown meaning; equivalent |
| Debrief | app-volatility | What are ups and downs? | Established plain-language volatility term; equivalent |
| PostCheck | app-step-postcheck | Why answer again? | Reflection after comparison; equivalent |
| PostCheck | app-step-prediction | Are points awarded for the expectation? | No prediction score; equivalent |
| PostCheck | app-privacy | Are the later answers saved? | Reflection remains in memory; equivalent |
| NextSteps | app-step-nextsteps | What are resources for? | Further protective learning; equivalent |
| NextSteps | app-restart | What is erased by starting again? | Journey answers versus preferences/cache; equivalent |
| NextSteps | app-pilot-summary | What is the local summary? | In-page summary, no collected research; equivalent |

Changed controls: Ask/पूछें = ask; Send/भेजें = send; Messages/संदेश = messages;
Ask a question…/सवाल लिखें… = write a question (appropriate input instruction).
Exact current question/control strings are pinned by the review registry hashes.
The earlier chat-copy pass and integrated file hashes below are historical.

The reported development/preview startup crash was a Vite adapter registration
bug: its installer returned Connect's middleware function, which Vite treated as
a post-install callback. The installer now returns void; request handling is unchanged.

Verification: build, lint and typecheck passed. A bounded Chrome popup check at
1440×900 English and 360×640 Hindi verified anchoring, internal message scrolling,
three chips, live step changes, Enter/Send, usable journey actions and all three
close controls, using a local API stub. Dev and preview both started successfully.
All 66 questions map to existing KB entries and their review hashes match.
No live model call, broad test suite or native-speaker review was performed.

The 212 entries are original bilingual content: app 70, basics 33, products 40,
behaviour 16, fraud 22, doubts 31. App coverage, official fact receipts and semantic
checks are in `knowledge/APP_COVERAGE.md`, `BASICS_PRODUCTS_QA.md` and
`PROTECTION_QA.md`. No human/native/listening review or formal style compliance is
claimed. Registry hashes for new `chat.json` leaves are tied to their exact strings.
Current feature privacy/host-log pairs and back-translations are in UI_CONTENT_QA.json.

Chat UI back-translation pass: title = learning chat; question = your learning
question; placeholder = ask about a term/practice/protection; Ask/Close retain
imperative controls. Warning = do not write private or financial information,
including account, balance, passwords or identity documents. Disclosure = submitted
question/language reach this server, then eligible questions reach Groq. Retention =
app does not log/save questions; host/provider policies are distinct; history is
not sent. Acknowledgement = understand disclosure and want to send a general
question, not accept investment advice or waive privacy rights. AI label = generated
answer may be wrong; local label = agent-checked library, not human-reviewed.

Refusal = no investment advice or judgement of market messages; uncertain prices
and differing personal needs; risk/leverage/protection learning is available.
Unknown = these entries do not answer, try related topics/different words. Private =
remove private details. Limit = wait/read entries, not pay or open an account.
Unavailable = show closest entry only when the library is available. Load failure =
reconnect/reopen; practice can continue. Chips ask leverage, replay reason, fraud
recognition and virtual-money truth. About/vendor retain the practice/chat distinction
and explicitly avoid assuming provider retention is disabled. Both languages retain
these scopes, uncertainty and negatives; no additional Hindi promises are inserted.

Only requested checks apply: build/lint/typecheck, ten guarded advice questions and
exact official-source facts. No live model, new full unit/browser/release/bundle or
performance audit is claimed. Existing Chat-stub assertions were updated, not newly
run as a broad suite. Model failures/timeout/unsafe text return full entry content;
KB text was not shortened for speed or bundle size. The supplied server adapter is
not a deployment and does not configure a key or host account.

## Final integrated file hashes

These supersede pre-integration file hashes in the category receipts: the new
entry-specific lintAllow metadata does not change the independently checked prose.

| File | SHA-256 |
|---|---|
| knowledge/app.json | 733537c2b33d71b162f22fb1aeeb2e2ec94b1c3fdfe427c4cec22e49c097e48b |
| knowledge/basics.json | 44c6c628bb9e64e315f4d37bd2a7db00a1b02a545f8916898d5e850563271dd5 |
| knowledge/products.json | b828c7cb32efe619bdb796317e19aa2c8d5c954ea296995de86af1cb6ba321a5 |
| knowledge/behaviour.json | 6c57f0e3b410ff1da12306f6580d8a086955b7e64e58164cb83ec0d76f019a42 |
| knowledge/fraud.json | 31ea0459701c5d0e3a1d641d16e937077bcfb9d5d95715c801468cf19a9bcbc1 |
| knowledge/doubts.json | 065c8bbadd9e90decf1ee6d28068eac56885a3a9f85458e4c1a48e8a639c15a1 |
| src/content/en/chat.json | 3665bcfcae6c6007fc35afe8f729b94c14060e7774d07dfe72669e59c0782313 |
| src/content/hi/chat.json | aca41e3b531d037e3926c623a94f189d91414e46e486e5cf3fb0216f3f777200 |
