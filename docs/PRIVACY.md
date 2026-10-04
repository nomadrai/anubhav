# Privacy boundary: practice versus learning chat

## Practice and local preferences

Prediction, virtual amount/exposure, choices, reflection and pilot answers remain
in React reducer memory. They are never included in chat requests or persisted.
Reload/restart discards these answers. Explicit optional summary copying uses the
local clipboard; clipboard history is outside this app's control.

Only `learning.language` and `learning.auto-speak` preferences use localStorage.
The retired `learning.text-size` key is removed. Public app/audio/knowledge files
may be cached by the service worker; no chat requests or answers are cached.
Auto-speak plays only stored public narration, not questions or answers.
No accounts, cookies, analytics, contact/SMS/microphone access, portfolio import,
financial account connection or payment collection is implemented.

## Authorized chat transport

The user explicitly authorizes a server-backed learning chat. The single flag is
`CHAT_ENABLED` in `shared/chat-config.mjs`. When true,
`capabilities.userDataLeavesDevice` is true and the footer uses its existing,
accurate sending-feature disclosure. When false, the button/panel are hidden,
the server rejects chat and the local-only footer returns. Rebuild/redeploy both
browser and function when changing the flag.

The compact, non-modal chat panel opens below the header Chat button. Its Send
button, Enter key, and question chips explicitly submit a general learning question;
there is no acknowledgement checkbox. Server/provider policies remain disclosed
in About this app and the footer distinguishes chat from local practice. Do not enter
personal or financial details. Greetings and qualifying keyword matches are answered
on-device. On a keyword miss, the browser sends **only** `{question, language}`
as a JSON POST to same-origin `/api/chat`, with cookies omitted and no referrer.
No step, prediction, amount, pilot result, profile or conversation history is sent.
Questions never appear in URLs. Advice/tip/prediction requests receive a fixed
local refusal without transmission; the server repeats this guard for direct API
clients. A limited personal-detail detector blocks common identifiers/secrets,
but is not a comprehensive privacy filter.

On a keyword miss, **Groq**, using **openai/gpt-oss-120b**, first receives the
question and a compact public catalog of the 212 entry IDs and English titles
for semantic retrieval. Only returned IDs that exist in the KB are accepted,
with at most three distinct entries. A second call receives the same question,
selected-language instruction and those entries' original text to explain them.
No matching semantic topic yields a friendly clarification; missing keys or
provider failures are distinguished from unsupported topics. Once entries are
selected, failed or blocked generation uses their original text. There are no live market feeds, tools,
external searches or vector services. The secret `GROQ_API_KEY` is read only by
server code, never from a `VITE_*` variable, public asset or browser storage.
No app code logs or stores questions or provider responses. The panel keeps only
its input and displayed messages in memory; closing it clears them. Requests abort on
close; the two-call provider sequence shares an approximate ten-second timeout.
There is no invented success or second provider.

The server keeps bounded transient **IP/counter/expiry** records for rate limiting,
not analytics. Expired records are pruned on subsequent requests or discarded
when the instance ends. The function also configures Netlify's native per-IP
limiting. Host-native protection depends on deployment support; warm-instance
counters are not a distributed global quota. No IP is forwarded by app code to
Groq as a user identifier. The provider still sees the server connection metadata.

## Provider and host limits

Official Groq data policy fetched 2026-10-04:
https://console.groq.com/docs/your-data . It says usage metadata is retained and
inference content can be retained for reliability/abuse circumstances. Data
Controls offer retention choices. **No zero-retention setting is assumed or
claimed for this account.** Before publication, review provider terms/data
controls and host request-body/APM logging. Do not enable question/body tracing.
The operator must supply its own privacy/contact/retention information as needed;
this code cannot control an external host or provider's storage practices.

CSP remains `connect-src 'self'`: the browser contacts only its own origin.
The server's explicit Groq HTTPS request is the authorized exception to the
previous static-only runtime boundary. Responses have `Cache-Control: no-store`.
The PWA excludes `/api/` from navigation fallback and has no POST caching rule.
Public KB files cache separately; availability is conditional, not permanent.

Official learning resources are explicit `noopener noreferrer` outbound links,
not embedded requests. Their own accounts, tracking and policies can apply.
The host receives normal IP/browser/request metadata. App code neither claims
anonymity nor controls host/provider logging. Practice/pilot answers stay local
regardless of whether chat is enabled. No pilot, human listening or native-Hindi
review is claimed. See `knowledge/` QA notes for agent-only content evidence.

## Current bounded verification

The user explicitly requested real key-backed RAG verification after the earlier
stub-only checks. A fixed general learning paraphrase with zero keyword matches
made two live Groq calls, both HTTP 200; the final answer used the selected
original KB entry fallback. A keyword question made zero provider calls.
No key, question body, provider text, reasoning or headers were logged by app code.
Bounded checks cover synthetic routing/failures/refusals, bilingual copy hashes,
build, lint and typecheck. Earlier broad browser evidence remains historical.
No production deployment, native review or broad audit is claimed.
