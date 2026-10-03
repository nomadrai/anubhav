# Protective resource checks — 2026-10-03

## Decision and scope

The current user authorization in `AGENTS.md` permits **agent verification of
exact official pages with session evidence**. Four direct pointers in
`src/content/resources.json` now have `verified: true` and
`status: agent-checked`. Every `humanReview.humanApproved` and
`humanReview.nativeSpeakerReviewed` remains false. This is not a claim of
publisher approval, human/native review, tested service completion, destination
accessibility, privacy compliance, or a guaranteed outcome.

This current record supersedes only the earlier *human-only resource-publishing
workflow* described in [RESOURCE_REVIEW.md](RESOURCE_REVIEW.md) and
[SOURCE_AUDIT.md](SOURCE_AUDIT.md). Those documents remain historical evidence;
their EIA/Refinitiv rights concerns are **not** resolved by this authorization.

The earlier general education-list and personal-finance primers were replaced
with more directly protective grievance, support, scam/pressure and cybercrime
pointers. They were not silently declared approved. Their old observations and
unresolved document-reproduction permissions remain in the historical audits.
No official text/PDF, screenshot, logo, form, or translated page is bundled.
Labels below are short original navigational descriptions, not publisher text
translations or recommendations. A URL pointer is not a content-reuse grant.

## Method and common limitations

- Each exact URL was fetched through the text tool this session and its official
  publisher identity, heading and relevant content inspected.
- An independent local `curl --http1.1 --fail --location --silent --show-error
  --max-time 45` fetch preserved the response body and receipt under ignored
  `data-raw/resources/`. All four final URLs exactly matched their requests;
  all returned HTTP 200 at `2026-10-03T13:06:41Z`.
- No account was created, form completed, report submitted, phone number called,
  or personal/financial information supplied. HTTP success does not measure
  low-bandwidth usability or interactive service availability.
- The app publishes **only explicit direct links**, not runtime requests or
  embeds. Destination pages are outside this app and may use accounts, cookies,
  scripts, analytics and personal-data forms. Their current instructions and
  privacy policies apply after leaving the app. Prior SEBI footer evidence
  includes external analytics/chat scripts; no tracking-free destination claim
  is made. The app must provide its external-link/privacy disclosure and must
  not frame, prefetch or scrape these destinations at runtime.
- No helpline number, opening hours, deadline, step-by-step grievance procedure,
  jurisdiction promise or money-recovery promise is copied into learner labels.
  Follow current official destination guidance, which can change.
- Recheck exact URL/label relevance before a subsequent publication or when
  notified of a change. The check date is evidence, not a promise of permanence
  or an invented publisher expiry date.

## sebi-scores

- **Label:** SEBI SCORES — complaint portal
- **Hindi:** सेबी स्कोर्स — शिकायत पोर्टल
- **Exact URL:** <https://scores.sebi.gov.in/>
- **Observed identity/content:** page says **SEBI Complaint Redressal System**
  and identifies an online grievance redressal facilitation platform provided
  by SEBI. It describes securities-market complaints against SEBI-regulated
  entities. It explicitly distinguishes this portal from the closed old
  `scores.gov.in` site; only the current exact URL is published here.
- **Decision:** appropriate grievance gateway, not a promise that any particular
  complaint is eligible or will succeed. We do not repeat the site's procedure
  or deadlines, or offer to submit a complaint.
- **Local response:** `data-raw/resources/scores.html`, 120689 bytes,
  content type `text/html;charset=UTF-8`.
- **SHA-256:** `8b6814764defb9a2d772ab2d0bbe845093835bfdb0347fc68feb4d4f12a362f2`.

## sebi-investor-support

- **Label:** SEBI — investor support
- **Hindi:** सेबी — निवेशक सहायता
- **Exact URL:** <https://investor.sebi.gov.in/Investor-support.html>
- **Observed identity/content:** **Investor Support** contains Ask SEBI,
  investor helpline information, complaint support and investor alerts. The
  page states that the helpline does not offer legal opinion or investment
  advice. We observed the page, not an actual contact interaction.
- **Decision:** appropriate official support gateway. The broader page also
  links market intermediaries/apps and other materials; the app does not
  reproduce, rank, recommend or endorse any of those destinations. Only the
  support-page pointer is shown, without a phone number or contact procedure.
- **Local response:** `data-raw/resources/support.html`, 36786 bytes,
  content type `text/html; charset=UTF-8`.
- **SHA-256:** `c87186bae92789915971958755913bcf09f25a7ffdd99c82034343e176a3cc6e`.

## sebi-scam-warning-signs

- **Label:** SEBI — spotting scams and pressure tactics
- **Hindi:** सेबी — ठगी और दबाव की चालें पहचानना
- **Exact URL:** <https://investor.sebi.gov.in/spot-any-scam.html>
- **Observed identity/content:** title **How to Spot a Scam**; section
  **Guidelines for Spotting a Scam** includes guaranteed-return claims,
  unregistered entities and **Pushy Salesperson**, warning about high-pressure
  tactics and demands to act immediately.
- **Decision:** directly relevant to the lesson's pressure/uncertainty safeguard.
  A link to the official guidance is not our diagnosis that a specific offer is
  a scam. The page's questionnaire or result is not embedded or reproduced.
- **Local response:** `data-raw/resources/scam.html`, 34373 bytes,
  content type `text/html; charset=UTF-8`.
- **SHA-256:** `0ca9f7166eddf7ff1ba3b70556c7c879de9ed20b4f86cdf20e49f5d47f760352`.

## government-cybercrime-reporting

- **Label:** Government of India — cybercrime reporting portal
- **Hindi:** भारत सरकार — साइबर अपराध रिपोर्टिंग पोर्टल
- **Exact URL:** <https://cybercrime.gov.in/>
- **Observed identity/content:** **National Cyber Crime Reporting Portal**,
  Ministry of Home Affairs, Government of India. Navigation includes
  **FINANCIAL FRAUD**, other cybercrime reporting and **CYBER SAFETY TIPS**.
  The page identifies ministry-managed content. Its displayed update date is
  `31/08/2026`; our independent check date remains `2026-10-03`.
- **Decision:** relevant official reporting gateway for cybercrime/financial
  fraud, distinct from investor grievance redressal. No eligibility, report
  outcome or money recovery is promised; the app accepts no report or evidence.
- **Local response:** `data-raw/resources/cybercrime.html`, 79313 bytes,
  content type `text/html; charset=utf-8`.
- **SHA-256:** `9fb8cd264fd1413bc5f3b5abd9730d28e5e3704ab380e1d8f266adb8878b2d89`.

## Bilingual label QA (agent, not native review)

| Hindi label | Agent back-translation | Parity/safety result |
|---|---|---|
| सेबी स्कोर्स — शिकायत पोर्टल | SEBI SCORES — complaint portal | Names destination, no promised resolution or personal advice. |
| सेबी — निवेशक सहायता | SEBI — investor assistance | Equivalent neutral support gateway, no contact-service guarantee. |
| सेबी — ठगी और दबाव की चालें पहचानना | SEBI — recognizing scams and pressure tactics | Matches the page's scam and pushy-salesperson sections; not a personal fraud diagnosis. |
| भारत सरकार — साइबर अपराध रिपोर्टिंग पोर्टल | Government of India — cybercrime reporting portal | Official gateway, no implied completed report or recovery. |

All eight language-label leaves were checked against destination content and
for equivalent scope, proper institutional transliteration, absence of phone
numbers/procedures, absence of advice/urgency/profit promises, and absence of
publisher-endorsement claims. Result: **agent-checked** only. No native-speaker
review or listening pass occurred. Manual accessibility and native review
remain useful follow-up work, not falsely completed conditions.

## Failed exploratory URLs

`https://investor.sebi.gov.in/contact.html` and
`https://investor.sebi.gov.in/financialfraud.html` returned HTTP 404 through the
text-fetch service. They were exploratory paths, are not published, and were
replaced by the exact official URLs discovered on the official site/search and
successfully fetched above. No guessed path is marked verified.
