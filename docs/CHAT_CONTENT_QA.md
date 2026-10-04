# Chat UI and KB integration — agent-checked

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
