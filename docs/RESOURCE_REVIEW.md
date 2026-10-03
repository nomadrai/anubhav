# Protective-resource URL review

## Scope and decision

This is an automated acquisition/review record, not human approval. The URLs
below are official investor-education pages selected for protective, neutral
learning context. They are stored in `src/content/resources.json` with the
existing runtime shape, plus audit fields. Every entry remains
`verified: false` and `humanReview.humanApproved: false`, so the current app
filter keeps them hidden.

An HTTP success and a text inspection show only that a page was reachable at a
particular time. They do not establish safety, accessibility, language
quality, licensing/attribution permission, permanence, or suitability for this
app. A human must review those points before any entry can become verified.

## Successful automated checks

Checks used `curl --fail --location --silent --show-error --max-time 30` and
then inspected the downloaded HTML. Both responses ended at the requested
URL and returned HTTP 200 on `2026-10-03T06:19:11Z`.

### SEBI Investor — Investor Education Reading Material

- URL: `https://investor.sebi.gov.in/iematerial.html`
- Status: HTTP `200`; final URL unchanged; `145812` bytes.
- Download SHA-256: `091ae2a3af292b764a92d5373a90fc08d1e9bd3a4110dfeb4ff322afac2cb5df`.
- Retrieved content summary: the page lists Securities Market and Safe
  Investing, financial education and planning material, introductions to
  securities-market topics, complaint redressal, fraud awareness, and modules
  covering market segments. It also exposes several Indian-language choices
  for selected material.
- Relevance decision: useful as a gateway to official safety and education
  material, but not yet approved as a learner-facing link.

### SEBI Investor — Personal Finance and Investment

- URL: `https://investor.sebi.gov.in/personalsecurities.html`
- Status: HTTP `200`; final URL unchanged; `9691` bytes.
- Download SHA-256: `604f8436733d04a15186fc98ace13997c305bc7bf467ca07d5c298ff9780135d`.
- Retrieved content summary: the page describes a general audience primer on
  securities-market basics, product features, do-and-don't guidance, reviewing
  investments against goals and risk tolerance, and resolving disputes with a
  financial service provider.
- Relevance decision: useful for general protection and grievance context;
  it must not be presented as a recommendation or as a substitute for
  personal advice.

## Fetches not promoted to candidate resources

- `https://www.nism.ac.in/investor-education/`: the text-fetch service
  returned an investor-education page containing sections such as
  Understanding Investment Risks and Financial Concepts for Households.
  However, the local automated `curl` check returned status `000` because the
  HTTP/2 stream failed and a retry with HTTP/1.1 returned an empty reply. It is
  therefore not recorded in `resources.json` until a stable automated fetch
  and human review are available.
- `https://www.investor.gov/introduction-investing/investing-basics`: the
  automated fetch returned HTTP `403 Forbidden`; it was not added.

## Human review checklist

Before changing either resource to `verified: true`, a human reviewer must:

- open the exact URL in a normal browser and confirm the page is still the
  same official resource;
- confirm relevance to neutral investor protection and that the link does
  not promote a product, provider, or action;
- check English/Hindi and other language availability, reading order,
  keyboard/accessibility behavior, and low-bandwidth usability;
- review the page's terms, linking/hyperlink policy, attribution, and any
  downloadable document rights;
- record reviewer identity, review date, evidence, and a recheck/expiry date;
- confirm that the page can be shipped as a static pointer without adding a
  runtime external request or implying endorsement.

No human approval, licence conclusion, or runtime publication is claimed by
this file or by the automated fields in `resources.json`.
