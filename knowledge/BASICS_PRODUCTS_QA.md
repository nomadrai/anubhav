# Basics and products knowledge QA

## Scope and review status

Agent check date: **2026-10-04**, from the session's UTC environment clock.

- `knowledge/basics.json`: **33** original bilingual entries.
- `knowledge/products.json`: **40** original bilingual entries.
- Total: **73** entries, each with English/Hindi titles, explanatory texts,
  English/Hindi/romanised search aliases, related IDs and explicit step metadata.
- Every entry is **`agent-checked`, not `reviewed`**. **No native Hindi speaker
  reviewed this content. No human listening, participant comprehension,
  accessibility or efficacy review occurred.**
- These are standalone knowledge files, not a claim that their UI, retrieval,
  narration, audio generation or offline delivery is implemented. Only these
  two JSON files and this QA document were authored in this task.
- Original explanations were written in English, then expressed in Hindi.
  Official text, examples, diagrams, branding and procedures were not copied.
  Source pointers support limited concepts, not publisher endorsement or a
  blanket claim that every sentence on a source page is correct.

Audited UTF-8 file hashes (whole files, including formatting):

| File | SHA-256 |
|---|---|
| `knowledge/basics.json` | `08b713acfc347e1e2028d6558bbaf2960c8fca30a8c1ab91a57a036c8f35a9cd` |
| `knowledge/products.json` | `4c5c5fdbd6c955dcf068aee15a9e47ffec50e828f67def299dafb1581d61978c` |

## Coverage and teaching boundaries

Basics cover trading versus investing, shares, exchanges, indices, brokers,
account-role distinctions, depositories, KYC, orders, market/limit orders,
quotes, supply/demand, company changes, economy, news/rumours, uncertainty, IPO,
dividends, risk/return, liquidity, interest, debt/equity, inflation, settlement,
bid/ask/spread, volume, ownership versus exposure, and general SEBI/RBI roles.

Products cover mutual funds, NAV, SIP, ETF, index funds, portfolios,
diversification, compounding, fees, brokerage, expense ratio, exit load, general
taxes, derivatives, futures, options, calls/puts, premium, expiry/exercise, the
app's simplified futures-style model, leverage, margin, maintenance margin,
margin call, forced exit/liquidation, volatility, drawdown, recovery, stop-loss
limits, short-selling risks, unrealised/realised loss, nomination/nominee,
unclaimed money, bonds, credit risk, slippage/gaps, and tracking difference/error.

No requested topic is omitted. Adjacent topics are intentionally introductory:
there is no account-opening, order-entry, tax-filing, contract-exercise,
nomination or claims procedure. There are no official rates, fees, minimums,
dates, deadlines, numerical rules or performance figures in learner text.
There are no recommendations, forecasts, named stocks, financial-service
brands, broker endorsements, personal assessments or guaranteed outcomes.

`appears_in_steps` names an existing teaching context, not a new implementation:

- **58** concepts have `[]`; broker/order/IPO, mutual-fund transactions, actual
  F&O trading, KYC, nomination and claims are not implied to be implemented.
- App-context tags are confined to uncertainty, virtual equity,
  ownership/exposure and the existing leverage/loss/debrief concepts.
- Margin-call and maintenance-margin context is the **teaching warning/level**,
  not a real margin service. The text explicitly separates them.
- The app-model explanation describes a position sized at the start, not a
  continuously constant real-market notional amount. No option-pricing, expiry,
  short-selling, stop-order or real settlement process is claimed.
- Real losses can exceed initial support in some arrangements. The app's
  simplified forced-exit level must never be treated as a real loss cap.
- Closed virtual exposure does not resume or recover from later path values.

App scope was checked against `README.md`, `docs/CONTENT_GUIDE.md`, the shipped
English glossary, and `docs/SIMULATION_SPEC.md`; these were not edited. Step tags
are contextual metadata only, not claims that every paragraph is already taught.

## Official source checks performed this session

All **18 cited exact URLs** below were fetched with `web_fetch` and their
readable official page bodies inspected on **2026-10-04**. None relies only on a
search snippet or a prior session's resource log. Fetching supports the limited
observations below; it does not prove a service transaction works or establish
reuse rights. No account, form, credential or personal data was supplied.

| Exact official URL | Observed heading/content and supported scope |
|---|---|
| https://www.sebi.gov.in/about-sebi.html | **About SEBI**, preamble: securities-market regulation, development and investor-interest protection. Only these broad roles are used; establishment dates are omitted. |
| https://www.rbi.org.in/commonperson/English/Scripts/Organisation.aspx | **Organisation and Functions**, **Main Functions**: monetary policy, banking supervision, currency work and payment-system oversight. No officers, counts, fees or procedural details are used. |
| https://investor.sebi.gov.in/miis.html | **Market Infrastructure Institutions**: exchanges provide an organised trading platform; depositories maintain electronic holdings and support transfers; trading, clearing and settlement are distinct functions. Only these role distinctions are used. |
| https://investor.sebi.gov.in/securities-trading.html | **What You Need to Start Investing** distinguishes demat holdings, trading/broking instructions and bank payments, and describes depository participants. No account-opening instructions or named providers are reproduced. |
| https://investor.sebi.gov.in/kyc.html | **Know Your Customer (KYC)** defines identity/address checking and compliance/anti-misuse purposes. No document list, legal dates, verification timing or activation promise is used. |
| https://investor.sebi.gov.in/understandings_shares.html | **Understanding Shares**: a share represents company ownership; dividend amount and frequency are not guaranteed. These are the supported claims, not its suggested benefits or irrelevant risk-section text. |
| https://investor.sebi.gov.in/marketindex.html | **Market Index** describes a grouped market measure and warns against guaranteed future performance. No named index, constituent count or categorical sentiment/economy inference is reproduced. |
| https://investor.sebi.gov.in/securities-risks_trade_derivatives.html | Despite its filename, the fetched heading is **Key Risks in Investing in Securities Market**. It describes inflation/purchasing-power, liquidity, business, market and volatility risks, and spreading investments to mitigate some risks. No advice or promise of risk elimination is copied. |
| https://investor.sebi.gov.in/understanding_mf.html | **Understanding Mutual Funds**: pooled money, scheme objectives, management, costs and systematic investment facilities. Used for mutual-fund/SIP concepts and ongoing expenses, not promotional claims or numeric rules. |
| https://investor.sebi.gov.in/securities-mf-investments.html | **Net Asset Value**: asset value less liabilities, allocated per unit; fund expenses affect assets/NAV. No analogy, fund ranking, accounting schedule or procedural transaction claim is reproduced. |
| https://investor.sebi.gov.in/exchange_traded_fund.html | **Understanding Exchange Traded Fund**: fund units trade on an exchange, with index-tracking objectives and costs. No named underlying index, generalised low-fee promise or guaranteed liquidity claim is used. |
| https://investor.sebi.gov.in/index_mutual_fund.html | **Index Mutual Funds**: a portfolio aims to replicate a selected index; costs affect alignment. No beginner recommendation, steady-growth claim or promise of lower risk is copied. |
| https://investor.sebi.gov.in/exit_load.html | **Exit Load**: a redemption charge can depend on scheme conditions and reduces proceeds. All example rates, periods, dates and asserted category exemptions are omitted. |
| https://investor.sebi.gov.in/understanding_derivatives.html | **Understanding derivatives** defines underlying-dependent value, futures obligations, option rights, call/put direction and buyer premium. It also describes amplified outcomes. No loss statistic, trade strategy, named asset, or real contract procedure is copied. |
| https://investor.sebi.gov.in/understanding_bonds.html | **Understanding bonds**: lending to an issuer with payment terms; market value changes; payment default can cause loss. No yield prediction, recommendation or blanket rating rule is copied. |
| https://investor.sebi.gov.in/understanding_Tracking_error.html | **Understanding Tracking Error**, **Meaning** identifies variability of portfolio-minus-benchmark returns. That meaning supports the distinction from a single return gap. No numerical example or conflicting simple-difference formula is copied. |
| https://investor.sebi.gov.in/market-nomination.html | **Nomination** describes naming a person who may claim demat securities or mutual-fund redemption proceeds after the investor's death. Only this basic facility is used, not deadlines, freezing claims or inheritance outcomes. |
| https://www.rbi.org.in/Commonman/English/Scripts/FAQs.aspx?Id=3579 | **UDGAM Portal**, answers 1/3/5: search of covered unclaimed bank deposits/accounts; searching is not claiming, and claims belong with the respective bank. No bank count, coverage percentage, registration inputs or claim procedure is reproduced. |

### Source caution and non-adoption

Some official educational pages contain overbroad, outdated or internally
inconsistent statements. These were not converted into learner facts:

- The nomination page still displays historical deadlines and freezing wording.
  It is evidence for the general facility **only**, not a current procedural
  rule. The nominee entry makes no inheritance determination; that would need
  product-specific current legal evidence.
- The MII page has an inappropriate commodities description in its BSE section.
  The KB uses no named-exchange descriptions from that section.
- The shares risk section contains unrelated portfolio-management wording.
  It is not used. Dividends/ownership come from the earlier relevant sections.
- The tracking-error page mixes a single return difference with variability and
  gives inconsistent example wording. The KB explicitly keeps tracking
  difference and tracking error separate; its **Meaning** section supports the
  variability definition.
- ETF/index-fund and other pages contain promotional or categorical cost,
  liquidity and growth claims. The KB keeps uncertainty, cost and concentration
  caveats instead of adopting those claims.
- Generic concepts and basic arithmetic with `sources: []` are original
  explanations, not claims of official verification. In particular no actual
  margin level, short-selling permission, stop-order specification, tax
  liability or settlement timetable is asserted.

Additional pages were fetched for discovery/context: the investor homepage,
`personalsecurities.html`, `Campaign.html`, and `ipo_through_asba.html`. The IPO
procedural page and campaign links did not justify reproducing procedures and
are not cited as evidence for instructions. The KB keeps IPO at a general
conceptual level. No linked PDF or page text is bundled.

## Bilingual semantic QA

Method: for **every entry**, compare English and Hindi titles and definitions,
then back-translate the Hindi meaning to English and check direction, time,
actor, rights versus obligations, uncertainty and app-versus-real scope. Also
check search aliases and relation targets. The concise back-translations below
record the core checked meanings; they are not full independent human
translations. **All rows passed this agent-only semantic check.**

Search aliases are retrieval vocabulary, not alternative promises or formal
legal definitions. In particular, "paper loss" is immediately explained as a
real reduction in current value. The misleading literal Hindi alias
"अवास्तविक नुकसान" was replaced with "अनरियलाइज़्ड नुकसान". App Hindi uses
उधार की ताकत, जमा रकम, बची आभासी रकम, ज़बरन बाहर निकलना, उतार-चढ़ाव,
गिरावट and वापसी का गणित consistently where relevant.

### Basics: every ID checked

| ID | Hindi meaning back-translated / parity and safety check |
|---|---|
| `basics-trading` | Shorter price focus versus longer asset holding; the boundary is not exact, both can lose, repeated trades cost, and the app does no real trading. |
| `basics-investing` | Money in an asset with expected income/value growth; expectation can fail, time guarantees nothing, and access may be difficult. |
| `basics-share` | Small company ownership, not a loan or daily management; price can fall and dividend is uncertain. |
| `basics-exchange` | Organised order-matching venue distinct from a broker; surveillance does not remove price risk or assure a match. Hindi briefly explains securities. |
| `basics-index` | Selected-group measure, not the entire economy or everyone's return; a rising index does not mean all shares rise or predict the future. |
| `basics-broker` | Intermediary for exchange trading, not exchange operator or all-records keeper; charges and oversight imply no guaranteed returns. |
| `basics-demat` | Electronic holding through a participant differs from trading instructions and bank money; the app opens or connects no accounts. |
| `basics-depository` | Electronic ownership records and transfers, with a participant connecting users; paperwork reduction does not prevent falling market value. |
| `basics-kyc` | Institution checks identity/address for compliance and anti-misuse; not risk removal or proof of returns; the app requests no documents. |
| `basics-order` | Request differs from completed matched trade; an order may fail or partly fill; learning choices never go to a market. |
| `basics-market-order` | Requests available prices without a personal price limit; multiple or changed prices are possible, and execution/loss limits are not guaranteed. |
| `basics-limit-order` | Purchase maximum and sale minimum preserved in Hindi; limits acceptable price, not whether a trade occurs. |
| `basics-price` | Momentary transaction/quote, not necessarily the next available price or certain worth/future direction. |
| `basics-supply-demand` | Willingness at prices on both sides; price/quantity matter, not just number of people. |
| `basics-company` | Company conditions and expectations affect valuation; good results do not automatically raise prices or let a chart identify causes. |
| `basics-economy` | Borrowing/spending/jobs/production affect businesses differently; expectations precede figures, and headlines give no certain price direction. |
| `basics-news` | News, incomplete reports and rumours can change expectations; information may already be priced, and sequence alone proves no cause. |
| `basics-uncertainty` | Future not confidently known; missing information and one episode do not establish a forecast, complete cause or recovery guarantee. |
| `basics-ipo` | First public share offering may use new/existing shares; offer price, attention and demand guarantee neither allocation nor gain. |
| `basics-dividend` | Possible company distribution distinct from price appreciation; payment amount/time can change and does not establish total return. |
| `basics-risk` | Outcome can differ from hopes, including loss or inaccessible money; price is only one risk and more risk earns no promised reward. |
| `basics-return` | Period gain/loss plus relevant income/value change, reduced by costs/tax; comparison needs matching basis and past results promise nothing. |
| `basics-liquidity` | Ease of turning an asset into money without large price impact/delay; quotes prove no quantity, stress can worsen it, and liquidity is not profit. |
| `basics-interest` | Payment for use of borrowed money; borrower cost/lender income, varying terms, payment failure and added loss burden all retained. |
| `basics-debt` | Repayment obligation possibly with interest/costs; claim not ownership, repayment can fail and risk-free outcome is not implied. |
| `basics-equity` | Ownership in company context, remaining value in position context; in-app equity is virtual money, not real shares/account. |
| `basics-inflation` | General price-level rise, not one item's rise; nominal growth can still buy less, and household spending differs. |
| `basics-settlement` | Money/securities transfer completion differs from order matching; clearing determines obligations, timing varies, and app transfers nothing. |
| `basics-bid-ask` | Buyer offer versus seller request, best-price gap called spread; not necessarily a fee but can increase entry/exit costs. |
| `basics-volume` | Quantity traded in a period, not interest or waiting orders; high volume proves neither future rise nor ease. |
| `basics-ownership-exposure` | Asset rights differ from strength of price impact; contracts/leverage can create larger exposure without ownership; app gives no real rights. |
| `basics-sebi` | Securities regulation/development/investor interests, not investment selection or guaranteed returns; no claimed app approval. |
| `basics-rbi` | Central bank with monetary, currency, banking and payment roles distinct from SEBI; policy influence is not a personal outcome guarantee. |

### Products: every ID checked

| ID | Hindi meaning back-translated / parity and safety check |
|---|---|
| `products-mutual-fund` | Pooled scheme with managed holdings; units rather than choosing every holding, management guarantees no gain and schemes differ. Hindi defines a unit. |
| `products-nav` | Assets less liabilities divided over units; changing NAV is no cheapness, lower-risk or better-return signal. |
| `products-sip` | Repeated mutual-fund investment/payment method, not a separate guaranteed asset; unit values vary and regularity removes no loss risk. |
| `products-etf` | Exchange-traded fund units, often index-following; traded price can differ from NAV, baskets remove no universal risk and costs/liquidity matter. |
| `products-index-fund` | Portfolio aims to follow an index, not avoid its fall or match exactly; costs/timing/holdings matter, with risk from constituents. |
| `products-portfolio` | Holdings considered together, weighted behaviour not just count; shared risks and ownership/debt/contracts can change the total value. |
| `products-diversification` | Exposure spread across different holdings/risks; one problem may have less effect, but common risks, all losses and recovery remain uncertain. |
| `products-compounding` | Next percentage applies to changed remaining base including gains/losses; steady growth is not promised and equal opposite percentages do not cancel. |
| `products-fees` | Direct/indirect service or transaction costs can apply during losses; pre-cost result differs, and simplified app omits real charges. |
| `products-brokerage` | Broker service charge is only one possible cost; low/absent brokerage is not no-cost/no-risk, and no service tariff is given. |
| `products-expense-ratio` | Ongoing fund cost relative to assets, usually annual basis; reduces unit-holder value, differs from brokerage and proves no better outcome. |
| `products-exit-load` | Conditional redemption charge reduces received money and differs from ongoing expenses; no rate/period/exemption, and market loss remains possible. |
| `products-taxes` | Government amount under law; product/circumstance/current-rule dependent, with no rate, filing advice or personal liability decision. |
| `products-derivatives` | Contract value depends on underlying; futures/options differ, ownership not automatic, risks differ and app offers no real trading. |
| `products-futures` | Future-transaction obligation with standard exchange terms, not option buyer's optional right; loss/margin can arise before end, not an instruction guide. |
| `products-options` | Buyer's right not obligation, premium paid; seller has corresponding obligation, risks differ and app does not price/model options. |
| `products-call-option` | Buyer has purchase right at stated strike under conditions; call is not underlying ownership and an underlying rise assures no net gain. |
| `products-put-option` | Buyer has sale right at stated strike, distinct from direct sale/short-selling; underlying fall assures no net gain and seller risks differ. |
| `products-premium` | Price of option right, not strike or margin; value changes and buyer may lose entire premium, with different seller risk. |
| `products-expiry` | End of contract life versus use of option right; contract governs settlement, option may end valueless, and app gives no timetable or process. |
| `products-simplified-model` | Start-sized virtual position with teaching warning/exit, not real futures/live quote/trading; omitted costs/rules prevent real-outcome inference. |
| `products-leverage` | Exposure greater than committed money, from borrowing or contracts not necessarily a cash loan; magnifies both directions, with potentially larger real obligations. |
| `products-margin` | Money/eligible collateral for obligations, not a fee or full exposure; no loss cap, and app deposit is a teaching simplification. |
| `products-maintenance-margin` | Ongoing minimum support; loss/conditions can create shortfall, while app level is not an exchange rule or real calculation. |
| `products-margin-call` | Demand to address support shortfall; terms vary and warning assures no action window; app event demands no real money or extra-time promise. |
| `products-forced-exit` | Rule-driven closure not freely timed; real price/loss varies, app uses teaching level, and later path cannot revive closed exposure. |
| `products-volatility` | Amount of ups/downs, not certain direction or all-risk measure; large swings can end near start, but leverage may close exposure earlier. |
| `products-drawdown` | Earlier-high-to-later-value decline; largest in measured path, not only start/end change, and neither future loss cap nor recovery proof. |
| `products-recovery` | Loss shrinks base, so larger percentage rise needed if money remains; arithmetic not promise, equal percentages fail and zero needs more than percentage growth. |
| `products-stop-loss` | Condition triggers an order, not guaranteed execution/price; gaps/liquidity/system issues matter, a limit may fail and app implements no stop order. |
| `products-short-selling` | Sale without ownership entails obtain/return obligation; rise/costs/closure add risk and rise has no fixed ceiling; no app feature or procedure. |
| `products-unrealised-loss` | Held value below cost is not a completed sale but still reduces current value; paper-loss label makes no safety/recovery promise and contracts may demand payment. |
| `products-realised-loss` | Disposal/settlement establishes loss; costs alter result, later recovery does not undo completed deal and tax is separate. |
| `products-nomination` | Named person may claim after death under arrangement; no immediate-payment promise, standardised deadline/process, or app claim handling. |
| `products-nominee` | Named claim-role person, not free lifetime trading permission; legal heir is a separate term and legal entitlement is not decided here. |
| `products-unclaimed-money` | Unclaimed under account/product rules; different routes, bank-deposit search not universal claim service or completed/guaranteed payment; no claimant data collected. |
| `products-bond` | Borrowing/payment terms create claim not ownership; issuer must fulfil obligations, market value varies and interest is no risk-free promise. |
| `products-credit-risk` | Payment obligation can fail, delay or partly pay; distinct from price swings and stated interest/ratings give no payment guarantee. |
| `products-slippage` | Expected versus actual price gap due to speed/quantity; discontinuous quotes can worsen exit and old quote assures no execution price. |
| `products-tracking-difference` | Fund-minus-index return gap differs from variability of gaps; costs/holdings/timing matter and following is an objective not identical-results promise. |

## Validation actually run

An inline Python validator parsed both arrays and asserted:

- Exact required schema keys, correct categories/ID prefixes and `agent-checked`.
- **73 unique IDs**, including required `basics-trading`, `products-leverage`,
  `products-margin`, `products-drawdown` and `products-recovery`.
- Nonempty bilingual titles/text, nonempty string list members, unique list
  values and Hindi plus English/romanised aliases.
- All `related` targets in these two files or the four explicitly allowed
  cross-category IDs; valid existing journey-step identifiers only.
- Each language explanation within **40–120 whitespace-separated words**.
  Actual basics: English **51–55**, Hindi **55–73**. Actual products: English
  **52–60**, Hindi **57–71**. English sentences have at most **25** words.
- No digits in learner explanations; cited source domains restricted to the
  official SEBI/RBI domains; no `lintAllow` exceptions needed or added.
- **18** unique cited official URLs and **58** empty step arrays.

A manual semantic/safety pass covered all rows above, including text polarity,
actor, transaction stage, base change, zero recovery and uncertainty caveats.
Schema and length checks are not proof of cultural naturalness or factual
perfection.

Repository regression command completed with exit **0**:

```sh
npm run lint && npm run typecheck && npm run test && npm run check:content && npm run build && npm run check:bundle
```

The existing content check prints its expected loud agent-checked text/audio
warnings; the build also prints the existing Vite configuration warning about
a future native config-loader import requirement. Neither was suppressed.
These checks protect the existing app; its current content gate targets
`src/content/`, **not standalone knowledge files**, so the focused KB checks
above are separately necessary. No release/deploy, audio regeneration, browser
feature integration or claim submission was performed in this task.

## Remaining work and deliberately absent claims

- Native Hindi review and beginner comprehension testing have **not** occurred.
  A future reviewer should inspect every row, especially loan versus exposure,
  optional rights versus obligations, nomination versus inheritance, and the
  unrealised-loss distinction. Keep status `agent-checked` until real evidence.
- Retrieval/UI integration and any audio/release-registry integration belong to
  separate work. The existing app's shipped glossary/audio are not altered.
- No requested concept is missing, but jurisdiction-specific procedures,
  rates, fees, thresholds, tax outcomes, current nomination requirements and
  claim documentation are deliberately absent. Add them only with fresh exact
  official evidence and a separate bilingual QA pass.
- Re-fetch official source pointers before later publication if their scope or
  wording changes. In particular, do not reuse the nomination page's displayed
  historical deadlines as current guidance. No assurance of link permanence,
  interactive availability, publisher approval or recovery is made.
