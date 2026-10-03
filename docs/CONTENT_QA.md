# Bilingual content QA — agent-checked, not native-reviewed

Date: 2026-10-03. Reviewer: coding agent. Method: read each English/Hindi leaf, independently restate the Hindi meaning in English, compare safety, direction, scope, grammar, glossary and placeholders, then run structural/script/length checks. **No human listened; no native-speaker review occurred.** This is an automated/agent evidence pass, not a claim of natural pronunciation, native fluency, accessibility compliance or participant comprehension. No entry was assigned `reviewed`; inherited English `reviewed` labels were conservatively replaced with `agent-checked` because this pass cannot establish human review.

## UI redesign addendum

The feature-copy table and feature-file hashes below preserve the earlier audit snapshot.
Current feature-copy evidence is [UI_CONTENT_QA.json](UI_CONTENT_QA.json): 49 changed/new bilingual leaf pairs, exact English/Hindi text, independent Hindi back-translations and current file hashes. Unchanged leaves retain the earlier evidence and per-leaf registry hashes. Three obsolete idle/connectivity leaves were removed, with dispositions. The footer refers to in-app choices/answers, not host request metadata or outbound destinations; About preserves the full storage/offline/missing-review disclosures and adds the host-log limitation. The summary is config-derived arithmetic, never advice or a forecast. No narration/glossary text or audio asset changed. All new copy remains agent-checked; no human/native/listening review occurred.

The scoped header/footer follow-up adds Auto-speak, On, Off and Chat labels and
updates the preference-only storage paragraph. All five bilingual pairs have exact
text and Hindi back-translation rows in UI_CONTENT_QA.json, with updated file/leaf
hashes. Narration/glossary text and all generated audio remain unchanged.

## Scope and key fixes

- Every current Hindi leaf in ui, debrief, narration, glossary and features is below, including unchanged strings and technical metadata. The first four tables include English comparators, Hindi and English back-translations; the features table includes exact Hindi and an independent English restatement, compared against the hash-pinned English file. Shared resource labels are also audited below. `Equivalent` means semantic equivalence in this agent pass only, not human sign-off.
- Fixes: current/total reversal; solid line incorrectly described as straight; `did not end below` incorrectly translated as `never went below`; intrabar low incorrectly scoped across the path; stay-in choice incorrectly translated as stop; undefined equity/exposure wording simplified; prior-high drawdown definition no longer requires a subsequent trough.
- Safety corrections in BOTH languages: simulated control no longer says Hold; virtual-money title avoids an unconditional safety claim; answers explicitly in memory, not a blanket claim that no preferences/assets are stored; narration no longer calls real production episodes synthetic; protective resources are checked, not falsely promised a human check.
- Leverage analogy now uses the same tilt, not a push. Forced-exit/deposit analogies no longer imply real lender procedures. Recovery uses a jug whose remainder doubles and explicitly excludes recovery from a zero base.
- Completed the relevant diversification, compounding and fees glossary definitions/analogies. They describe risks/arithmetic/omitted charges, not actions or guaranteed benefits. NAV and nomination are future-only topics, removed from runtime rather than shipping `planned` filler. Their old leaves are audited in the disposition section.
- UI/debrief key shape is unchanged. Exact UTF-8 hashes and statuses for ALL user-facing leaves live in `src/content/review-status.json`, including narration, glossary, features and resource labels. A changed string invalidates prior review evidence. Narration/glossary item statuses and feature metadata must agree with leaf statuses. Features remain T3-owned and were read-only audited below.
- “उधार की ताकत” consistently renders leverage/borrowed exposure, “जमा रकम” margin, “ज़बरन बाहर निकलना” forced exit, “उतार-चढ़ाव” volatility, “गिरावट” drawdown, “वापसी का गणित” recovery. “बची आभासी रकम” explains equity. These are pedagogical descriptions, not real borrowing instructions.
- Numerals/symbols remain only in visual UI copy. Hindi spoken fields contain no Latin letters, digits or mathematical symbols; number words and separate spoken text are retained. Technical IDs/triggers/statuses are not speech.

## Per-file evidence

File hashes below pin this audit to exact final content. Companion registry hashes pin every dictionary leaf individually.

| File | SHA-256 |
|---|---|
| `src/content/en/ui.json` | `d259c2ffc155bb362a11f08c102e777c2ab08bb10e76a5563c657736fa83693c` |
| `src/content/hi/ui.json` | `7ae1de1325342a263a95613bca86ec15d3c8b80cdfcb49578706321c7f3bfda3` |
| `src/content/en/debrief.json` | `89073bf28f22cb359ef0ea1cd32eb3250f884efbf2b20aaf3a599658f40a0de9` |
| `src/content/hi/debrief.json` | `3b20037e2ac6136e392b05cbed30dfb0ae692af317a5bddb6d7f1d1a59f4ef5e` |
| `src/content/en/narration.json` | `e63171c009fe8ec35e788619475fd9d2f6c543493872fbb21f2a271c6df18761` |
| `src/content/hi/narration.json` | `b339fc5326589cd38ca7f3db4cdea770ac8d68796a15cba63f170779c522ae6b` |
| `src/content/en/glossary.json` | `378f68d3201849ac7bf32e1a481ee6a6fc14778ba5197e3854095dad4cd68518` |
| `src/content/hi/glossary.json` | `416592b547eadc06ff6185477ef898c2e7fee31fc934a3e7b2ce32e5c6cd6221` |
| `src/content/en/features.json` | `de4c4f7a60bf1377cc6ab41c85a12cb888d36777adf1f8ea7ed93a201c3db0e9` |
| `src/content/hi/features.json` | `f853aab57de99cc154cb5829c63999993ee3b3271679cc129dd5cd6753b40075` |

## `src/content/hi/ui.json` — 140 string leaves

| Path / ID | English comparator | Hindi audited | Back-translation / metadata check | Agent disposition |
|---|---|---|---|---|
| $.languageSelect.eyebrow | Choose language | भाषा चुनें | Choose a language. | Unchanged; equivalent |
| $.languageSelect.title | Learn with virtual money | आभासी पैसे से सीखें | Learn using virtual money. | Fixed/new; equivalent |
| $.languageSelect.body | Nothing here is real money. Choose the language that feels easiest. | यहाँ असली पैसा नहीं है। वह भाषा चुनें जो आपको आसान लगे। | There is no real money here. Pick the language you find easy. | Unchanged; equivalent |
| $.languageSelect.hindi | हिन्दी | हिन्दी | Hindi (self-name). | Unchanged; equivalent |
| $.languageSelect.english | English | English | English (self-name retained for recognition). | Unchanged; equivalent |
| $.languageSelect.continue | Start practice | अभ्यास शुरू करें | Begin the exercise. | Unchanged; equivalent |
| $.intro.eyebrow | Before we begin | शुरू करने से पहले | Before starting. | Unchanged; equivalent |
| $.intro.title | A practice with virtual money | आभासी पैसे का अभ्यास | An exercise with virtual money. | Unchanged; equivalent |
| $.intro.body | Only virtual money is used. Your answers stay in memory during this journey; they are not saved or sent. | सिर्फ आभासी पैसा इस्तेमाल होता है। आपके जवाब इस अभ्यास के दौरान मेमोरी में रहते हैं; वे सहेजे या भेजे नहीं जाते। | Only virtual money is used. Your answers remain in memory during this exercise; they are not saved or sent. | Fixed/new; equivalent |
| $.intro.continue | Continue | आगे बढ़ें | Go forward. | Unchanged; equivalent |
| $.setup.eyebrow | Set up the practice | अभ्यास तैयार करें | Prepare the exercise. | Unchanged; equivalent |
| $.setup.title | A forwarded message makes a promise | आगे भेजा गया संदेश वादा करता है | A forwarded message makes a promise. | Fixed/new; equivalent |
| $.setup.body | A message says borrowed exposure can double money in a week. This is a teaching example, not advice. | संदेश कहता है कि उधार की ताकत से एक हफ्ते में पैसा दोगुना हो सकता है। यह सीखने का उदाहरण है, सलाह नहीं। | The message says borrowed power can double money in a week. This is a learning example, not advice. | Unchanged; equivalent |
| $.setup.capital | Base virtual money: ₹10,000 | आभासी पैसे का आधार: ₹10,000 | The base of virtual money: ₹10,000. | Unchanged; equivalent |
| $.setup.stake | Choose an amount | रकम चुनें | Choose the amount. | Unchanged; equivalent |
| $.setup.leverage | Choose borrowed exposure | उधार की ताकत चुनें | Choose the borrowed power. | Unchanged; equivalent |
| $.setup.stake25 | 25% | 25% | 25% (visual notation). | Unchanged; equivalent |
| $.setup.stake50 | 50% | 50% | 50% (visual notation). | Unchanged; equivalent |
| $.setup.stake100 | 100% | 100% | 100% (visual notation). | Unchanged; equivalent |
| $.setup.leverage2 | 2 times | 2 गुना | 2 times. | Unchanged; equivalent |
| $.setup.leverage5 | 5 times | 5 गुना | 5 times. | Unchanged; equivalent |
| $.setup.leverage10 | 10 times | 10 गुना | 10 times. | Unchanged; equivalent |
| $.setup.continue | Continue | आगे बढ़ें | Go forward. | Unchanged; equivalent |
| $.prediction.eyebrow | Pause and predict | रुककर अनुमान लगाएँ | Pause and make an estimate. | Unchanged; equivalent |
| $.prediction.title | What do you think will happen? | आपको क्या लगता है, क्या होगा? | What do you think will happen? | Unchanged; equivalent |
| $.prediction.body | There is no right answer. Choose what you expect. | कोई सही जवाब नहीं है। अपनी उम्मीद चुनें। | There is no correct answer. Select your expectation. | Unchanged; equivalent |
| $.prediction.bigGain | A big gain | बहुत लाभ | Much gain. | Unchanged; equivalent |
| $.prediction.smallGain | A small gain | थोड़ा लाभ | A little gain. | Unchanged; equivalent |
| $.prediction.smallLoss | A small loss | थोड़ा नुकसान | A little loss. | Unchanged; equivalent |
| $.prediction.almostEverything | Lose almost everything | लगभग सब खोना | Losing almost everything. | Unchanged; equivalent |
| $.prediction.continue | Continue | आगे बढ़ें | Go forward. | Unchanged; equivalent |
| $.run.eyebrow | The path begins | रास्ता शुरू होता है | The path begins. | Unchanged; equivalent |
| $.run.title | Watch the same path unfold | उसी रास्ते को आगे बढ़ते देखें | Watch that same path move forward. | Fixed/new; equivalent |
| $.run.body | A teaching rule can close the position early. You can exit at any pause. | अभ्यास का नियम स्थिति को समय से पहले बंद कर सकता है। आप हर विराम पर बाहर निकल सकते हैं। | The practice rule can close the position ahead of time. You can exit at every pause. | Fixed/new; equivalent |
| $.run.hold | Continue this run | यह अभ्यास जारी रखें | Continue this exercise. | Fixed/new; equivalent |
| $.run.exit | Exit now | अभी बाहर निकलें | Exit now. | Unchanged; equivalent |
| $.run.decisionPoint | Decision point | निर्णय बिंदु | Decision point. | Unchanged; equivalent |
| $.run.warningPoint | Warning point | चेतावनी बिंदु | Warning point. | Unchanged; equivalent |
| $.run.resume | Continue watching | देखना जारी रखें | Keep watching. | Unchanged; equivalent |
| $.run.playing | The path is moving to the next pause. | रास्ता अगले विराम तक आगे बढ़ रहा है। | The path is advancing to the next pause. | Fixed/new; equivalent |
| $.run.pauseBody | Pause and choose whether to continue or exit this teaching run. | रुककर चुनें कि यह अभ्यास जारी रखना है या बाहर निकलना है। | Pause and choose whether to continue this exercise or exit. | Fixed/new; equivalent |
| $.run.stepStatus | Step {current} of {total} | कुल {total} कदमों में से कदम {current} | Step {current} out of a total of {total} steps. | Fixed/new; equivalent |
| $.run.startingAmount | Starting amount | शुरुआती रकम | Initial amount. | Unchanged; equivalent |
| $.run.indexBase | Values are indexed to the first value. | मान पहले मान को आधार बनाकर दिखाए गए हैं। | Values are displayed using the first value as the base. | Fixed/new; equivalent |
| $.run.lowEquity | Intrabar low would show {amount} equity in this model. | इस मॉडल में इस कदम की सबसे कम कीमत पर बची आभासी रकम {amount} होती। | In this model, the virtual amount remaining at this step's lowest price would be {amount}. | Fixed/new; equivalent |
| $.run.maintenanceLevel | Teaching level: {level} | शिक्षण सीमा: {level} | Teaching boundary: {level}. | Unchanged; equivalent |
| $.run.warningLevel | Warning level: {level} | चेतावनी सीमा: {level} | Warning boundary: {level}. | Unchanged; equivalent |
| $.run.marginLabel | Teaching margin level | शिक्षण जमा सीमा | Teaching deposit boundary. | Unchanged; equivalent |
| $.run.invalid | This episode could not be run. | यह एपिसोड चल नहीं सका। | This episode could not run. | Unchanged; equivalent |
| $.run.exitedChoice | You chose to exit on this bar. | आपने इस कदम पर बाहर निकलने का चुनाव किया। | You chose to exit at this step. | Fixed/new; equivalent |
| $.run.priceLabel | Path | रास्ता | Path. | Unchanged; equivalent |
| $.run.equityLabel | Your virtual money | आपका आभासी पैसा | Your virtual money. | Unchanged; equivalent |
| $.run.statusOpen | Position open | स्थिति खुली है | The position is open. | Unchanged; equivalent |
| $.run.statusWarning | Near the teaching margin level | शिक्षण जमा सीमा के पास | Near the teaching deposit boundary. | Unchanged; equivalent |
| $.run.statusForced | Closed by the teaching rule | शिक्षण नियम से बंद | Closed by the teaching rule. | Unchanged; equivalent |
| $.run.statusExited | Closed by your choice | आपके चुनाव से बंद | Closed by your choice. | Unchanged; equivalent |
| $.run.continue | See result | नतीजा देखें | See the outcome. | Unchanged; equivalent |
| $.result.eyebrow | First view | पहला दृश्य | First view. | Unchanged; equivalent |
| $.result.title | The leveraged position | उधार की ताकत वाली स्थिति | The position with borrowed power. | Unchanged; equivalent |
| $.result.body | These numbers come from the teaching engine on the same hidden path. | ये अंक उसी छिपे रास्ते पर शिक्षण इंजन से आते हैं। | These numbers come from the teaching engine on the same hidden path. | Unchanged; equivalent |
| $.result.finalEquity | Ending amount | अंतिम रकम | Final amount. | Unchanged; equivalent |
| $.result.change | Total change | कुल बदलाव | Overall change. | Unchanged; equivalent |
| $.result.forcedExitLine | The teaching rule closed this position early. | शिक्षण नियम ने इस स्थिति को पहले ही बंद कर दिया। | The teaching rule closed this position early. | Unchanged; equivalent |
| $.result.survivedLine | This position stayed open to the end. | यह स्थिति अंत तक खुली रही। | This position remained open until the end. | Unchanged; equivalent |
| $.result.userExitLine | This position was closed by your choice. | यह स्थिति आपके चुनाव से बंद हुई। | This position closed by your choice. | Unchanged; equivalent |
| $.result.continue | Compare without leverage | बिना उधार तुलना करें | Compare without borrowing. | Unchanged; equivalent |
| $.replay.eyebrow | Same path, different exposure | वही रास्ता, अलग ताकत | The same path, different power. | Unchanged; equivalent |
| $.replay.title | Now see it without leverage | अब इसे बिना उधार देखें | Now see it without borrowing. | Unchanged; equivalent |
| $.replay.body | Both lines replay the identical path. Only the borrowed exposure differs. | दोनों रेखाएँ एक ही रास्ता दोहराती हैं। सिर्फ उधार की ताकत अलग है। | Both lines repeat one identical path. Only borrowed power differs. | Unchanged; equivalent |
| $.replay.leveragedLine | With borrowed exposure | उधार की ताकत के साथ | With borrowed power. | Unchanged; equivalent |
| $.replay.unleveragedLine | Without borrowed exposure | उधार की ताकत के बिना | Without borrowed power. | Unchanged; equivalent |
| $.replay.chartDescription | Dashed line: with borrowed exposure. Solid line: without borrowed exposure. | टूटी रेखा: उधार की ताकत के साथ। बिना टूटे रेखा: उधार की ताकत के बिना। | Broken line: with borrowed power. Unbroken line: without borrowed power. | Fixed/new; equivalent |
| $.replay.closed | Closed | बंद | Closed. | Unchanged; equivalent |
| $.replay.leveragedFinal | With leverage: {amount} | उधार की ताकत के साथ: {amount} | With borrowed power: {amount}. | Fixed/new; equivalent |
| $.replay.unleveragedFinal | Without leverage: {amount} | उधार की ताकत के बिना: {amount} | Without borrowed power: {amount}. | Fixed/new; equivalent |
| $.replay.difference | Difference: {amount} | अंतर: {amount} | Difference: {amount}. | Unchanged; equivalent |
| $.replay.requiredGain | To return to the starting amount after this loss needs a {gain} gain — the maths is not symmetrical. | इस नुकसान के बाद शुरुआत तक लौटने के लिए {gain} लाभ चाहिए — यह गणित दोनों तरफ़ बराबर नहीं है। | Returning to the beginning after this loss needs {gain} gain; the maths is not equal in both directions. | Unchanged; equivalent |
| $.replay.requiredGainNone | This run did not end below its starting amount, so no recovery maths is shown. | यह अभ्यास शुरुआती रकम से नीचे खत्म नहीं हुआ, इसलिए वापसी का गणित नहीं दिखाया गया। | This exercise did not finish below the initial amount, so recovery maths is not displayed. | Fixed/new; equivalent |
| $.replay.continue | Reveal the episode | एपिसोड की जानकारी देखें | See the episode information. | Fixed/new; equivalent |
| $.reveal.eyebrow | What was hidden | जो छिपा था | What was hidden. | Unchanged; equivalent |
| $.reveal.title | The period behind this episode | इस एपिसोड के पीछे की अवधि | The period behind this episode. | Unchanged; equivalent |
| $.reveal.body | One episode never predicts the future. | एक एपिसोड कभी भविष्य नहीं बताता। | One episode never tells the future. | Unchanged; equivalent |
| $.reveal.periodLabel | Period | अवधि | Period. | Unchanged; equivalent |
| $.reveal.whatHappenedLabel | What happened | क्या हुआ | What happened. | Unchanged; equivalent |
| $.reveal.sourceLabel | Data source | आँकड़ों का स्रोत | Source of the data. | Unchanged; equivalent |
| $.reveal.placeholderNote | This episode is a clearly labelled synthetic placeholder. It is not historical data. | यह एपिसोड साफ़ तौर पर चिन्हित कृत्रिम प्लेसहोल्डर है। यह ऐतिहासिक आँकड़ा नहीं है। | This episode is a clearly marked artificial placeholder. It is not historical data. | Fixed/new; equivalent |
| $.reveal.oneEpisode | One episode is a teaching example. It is not a forecast, and it does not describe any real instrument. | एक एपिसोड सीखने का उदाहरण है। यह भविष्यवाणी नहीं है और किसी असली साधन का वर्णन नहीं करता। | One episode is a learning example. It is not a prediction and does not describe any real instrument. | Unchanged; equivalent |
| $.reveal.statsLabel | Measured on this path | इस रास्ते पर मापा गया | Measured on this path. | Unchanged; equivalent |
| $.reveal.statsMaxDrawdown | Largest fall from a high | ऊँचाई से सबसे बड़ी गिरावट | Largest drop from a high. | Unchanged; equivalent |
| $.reveal.statsWorstFall | Worst single step | एक कदम में सबसे बड़ी गिरावट | Largest drop in one step. | Fixed/new; equivalent |
| $.reveal.statsDownCloses | Downward steps | नीचे जाने वाले कदम | Steps going downward. | Unchanged; equivalent |
| $.reveal.statsBarCount | Steps shown | दिखाए गए कदम | Steps displayed. | Unchanged; equivalent |
| $.reveal.continue | See the debrief | समझें | Understand. | Unchanged; equivalent |
| $.debrief.eyebrow | Make sense of it | अर्थ समझें | Understand the meaning. | Unchanged; equivalent |
| $.debrief.title | What the practice explains | अभ्यास क्या समझाता है | What the exercise explains. | Unchanged; equivalent |
| $.debrief.body | Each point below comes from the numbers you just saw. | नीचे का हर बिंदु उन आँकड़ों से जुड़ा है जो आपने अभी देखे। | Each point below relates to the figures you have just seen. | Fixed/new; equivalent |
| $.debrief.leverage | Leverage | उधार की ताकत | Borrowed power. | Unchanged; equivalent |
| $.debrief.margin | Margin | जमा रकम | Deposit amount. | Unchanged; equivalent |
| $.debrief.forcedExit | Forced exit | ज़बरन बाहर निकलना | Forced exit. | Unchanged; equivalent |
| $.debrief.forcedExitBody | The simplified teaching rule stopped this run at its maintenance level. It is not a real-world rule. | अभ्यास के सरल नियम ने इसे अपनी तय जमा सीमा पर रोक दिया। यह वास्तविक दुनिया का नियम नहीं है। | The practice's simplified rule stopped it at its set deposit boundary. This is not a real-world rule. | Fixed/new; equivalent |
| $.debrief.survivedButHurt | Still open, still exposed | खुली रही, असर बना रहा | Remained open; exposure remained. | Unchanged; equivalent |
| $.debrief.survivedButHurtBody | The position stayed open, but ending equity can still be below the starting amount. | स्थिति खुली रही, फिर भी अंत में बची आभासी रकम शुरुआती रकम से कम हो सकती है। | The position remained open, yet the virtual amount left at the end may be below the initial amount. | Fixed/new; equivalent |
| $.debrief.userExitedEarly | Your exit | आपका बाहर निकलना | Your exit. | Unchanged; equivalent |
| $.debrief.userExitedEarlyBody | You chose the exit point. The model does not score that choice. | आपने बाहर निकलने का बिंदु चुना। मॉडल इस चुनाव को अंक नहीं देता। | You chose the exit point. The model gives no score for this choice. | Unchanged; equivalent |
| $.debrief.unleveragedSurvived | Lower exposure replay | कम असर वाली दोहराई गई स्थिति | A repeated position with lower impact. | Fixed/new; equivalent |
| $.debrief.unleveragedSurvivedBody | The same path was replayed with one-times exposure. The path stayed the same; the exposure changed. | उसी रास्ते को बिना उधार की ताकत के दोहराया गया। रास्ता वही रहा; कीमत के बदलाव का असर बदला। | The same path was repeated without borrowed power. The path stayed the same; the effect of price changes changed. | Fixed/new; equivalent |
| $.debrief.recoveryMaths | Recovery maths | वापसी का गणित | Maths of returning. | Unchanged; equivalent |
| $.debrief.recoveryInterpolated | Ending at {finalAmount} after starting from {startAmount} would need a {gain} gain to return to the start. | {startAmount} से शुरू कर {finalAmount} पर पहुँचने के बाद शुरुआत तक लौटने के लिए {gain} लाभ चाहिए। | After starting with {startAmount} and reaching {finalAmount}, {gain} gain is needed to return to the beginning. | Unchanged; equivalent |
| $.debrief.recoveryNone | This run ended at or above its starting amount, so no recovery percentage is shown. | यह अभ्यास शुरुआती रकम पर या उससे ऊपर खत्म हुआ, इसलिए वापसी का प्रतिशत नहीं दिखाया गया। | This exercise finished at or above the initial amount, so the recovery percentage is not shown. | Fixed/new; equivalent |
| $.debrief.volatility | Volatility | उतार-चढ़ाव | Ups and downs. | Unchanged; equivalent |
| $.debrief.drawdown | Drawdown | गिरावट | Decline. | Unchanged; equivalent |
| $.debrief.recovery | Recovery maths | वापसी का गणित | Maths of returning. | Unchanged; equivalent |
| $.debrief.continue | Check your thinking again | अपनी सोच फिर जाँचें | Check your thinking once more. | Unchanged; equivalent |
| $.postCheck.eyebrow | Pause and reflect | रुककर सोचें | Pause and think. | Unchanged; equivalent |
| $.postCheck.title | What do you think now? | अब आपको क्या लगता है? | What do you think now? | Unchanged; equivalent |
| $.postCheck.body | The second answer is for your reflection, not a score. | दूसरा जवाब सोचने के लिए है, अंक देने के लिए नहीं। | The second answer is for thinking, not scoring. | Unchanged; equivalent |
| $.postCheck.same | Choose an answer | एक जवाब चुनें | Select an answer. | Unchanged; equivalent |
| $.postCheck.wouldTake | Would you take this position now? | क्या आप अब यह स्थिति लेते? | Would you take this position now? | Unchanged; equivalent |
| $.postCheck.yes | Yes | हाँ | Yes. | Unchanged; equivalent |
| $.postCheck.no | No | नहीं | No. | Unchanged; equivalent |
| $.postCheck.notSure | Not sure | पक्का नहीं | Not certain. | Unchanged; equivalent |
| $.postCheck.changed | You chose {before} before and {after} now. Noticing a change is the point of this step; there is no score. | आपने पहले {before} और अब {after} चुना। बदलाव देखना ही इस चरण का उद्देश्य है; इसमें कोई अंक नहीं है। | You chose {before} earlier and {after} now. Seeing a change is the purpose of this step; there is no score. | Unchanged; equivalent |
| $.postCheck.unchanged | Your answer stayed the same. That is also worth noticing; there is no score. | आपका जवाब वही रहा। यह भी देखने लायक है; इसमें कोई अंक नहीं है। | Your answer remained the same. That is worth noticing too; there is no score. | Unchanged; equivalent |
| $.postCheck.continue | Continue | आगे बढ़ें | Go forward. | Unchanged; equivalent |
| $.nextSteps.eyebrow | Keep learning safely | सुरक्षित ढंग से सीखते रहें | Continue learning safely. | Unchanged; equivalent |
| $.nextSteps.title | No recommendations here | यहाँ कोई सलाह नहीं है | There is no advice here. | Unchanged; equivalent |
| $.nextSteps.body | Only checked protective resources are shown here. They are for learning, not investment advice. | यहाँ केवल जाँचे गए सुरक्षात्मक संसाधन दिखते हैं। वे सीखने के लिए हैं, निवेश की सलाह नहीं। | Only checked protective resources appear here. They are for learning, not investment advice. | Fixed/new; equivalent |
| $.nextSteps.empty | No checked protective resources are available here. | यहाँ कोई जाँचा हुआ सुरक्षात्मक संसाधन उपलब्ध नहीं है। | No checked protective resource is available here. | Fixed/new; equivalent |
| $.nextSteps.restart | Start again | फिर शुरू करें | Start again. | Unchanged; equivalent |
| $.pilotSummary.eyebrow | Pilot summary | पायलट सारांश | Pilot summary. | Unchanged; equivalent |
| $.pilotSummary.title | A local facilitator view | सुविधादाता के लिए स्थानीय दृश्य | Local view for the facilitator. | Unchanged; equivalent |
| $.pilotSummary.body | This summary stays in memory during this journey. Copying it is your choice; the app does not send it. | यह सारांश अभ्यास के दौरान मेमोरी में रहता है। इसे कॉपी करना आपका चुनाव है; ऐप इसे भेजता नहीं है। | This summary remains in memory during the exercise. Copying it is your choice; the app does not send it. | Fixed/new; equivalent |
| $.pilotSummary.copy | Copy summary | सारांश कॉपी करें | Copy the summary. | Unchanged; equivalent |
| $.pilotSummary.back | Back to journey | यात्रा पर लौटें | Return to the journey. | Unchanged; equivalent |
| $.common.caption | Caption | कैप्शन | Caption. | Unchanged; equivalent |
| $.common.audio | Audio narration | ऑडियो वर्णन | Audio narration. | Unchanged; equivalent |
| $.common.audioUnavailable | Audio is unavailable for this text. You can read the caption. | इस पाठ के लिए ऑडियो उपलब्ध नहीं है। आप कैप्शन पढ़ सकते हैं। | Audio is unavailable for this text. You may read the caption. | Fixed/new; equivalent |
| $.common.chartData | Show data table | आँकड़ों की तालिका दिखाएँ | Show the data table. | Unchanged; equivalent |
| $.common.step | Step | चरण | Step. | Unchanged; equivalent |
| $.common.syntheticLabel | Synthetic teaching path (not real market data) | कृत्रिम शिक्षण रास्ता (असली बाज़ार आँकड़ा नहीं) | Artificial teaching path (not real market data). | Unchanged; equivalent |

## `src/content/hi/debrief.json` — 10 string leaves

| Path / ID | English comparator | Hindi audited | Back-translation / metadata check | Agent disposition |
|---|---|---|---|---|
| $.forcedExit.title | A forced exit | ज़बरन बाहर निकलना | Forced exit. | Unchanged; equivalent |
| $.forcedExit.body | On step {stepNumber}, virtual money reached the teaching maintenance level ({levelAmount}). The rule closed the position at {settledAmount}. Later prices are context only; the closed position cannot benefit from them. | कदम {stepNumber} पर आभासी पैसा अभ्यास की तय जमा सीमा ({levelAmount}) पर पहुँचा। नियम ने स्थिति को {settledAmount} पर बंद कर दिया। बाद की कीमतें सिर्फ संदर्भ हैं; बंद स्थिति को उनसे फायदा नहीं हो सकता। | At step {stepNumber}, virtual money reached the exercise's fixed deposit boundary ({levelAmount}). The rule closed the position at {settledAmount}. Later prices are only context; the closed position cannot benefit from them. | Fixed/new; equivalent |
| $.survivedButHurt.title | The position survived | स्थिति खुली रही | The position remained open. | Unchanged; equivalent |
| $.survivedButHurt.body | The position stayed open to the end. At its worst point, its virtual money was {lossPct} below the starting amount. Staying open did not remove the larger swings caused by borrowed exposure. | स्थिति अंत तक खुली रही। सबसे निचले बिंदु पर उसका आभासी पैसा शुरुआती रकम से {lossPct} कम था। खुली रहने से उधार की ताकत के कारण बढ़े उतार-चढ़ाव खत्म नहीं हुए। | The position remained open to the end. At its lowest point, virtual money was {lossPct} less than the initial amount. Staying open did not end the increased swings caused by borrowed power. | Fixed/new; equivalent |
| $.userExitedEarly.title | You exited | आप बाहर निकले | You exited. | Unchanged; equivalent |
| $.userExitedEarly.body | You closed the position on step {stepNumber} at {finalAmount}. After your exit, later price changes no longer affect this position. It does not make one episode a forecast. | आपने कदम {stepNumber} पर {finalAmount} की रकम पर स्थिति बंद की। इसके बाद कीमत के बदलावों का इस स्थिति पर असर नहीं पड़ता। इससे एक एपिसोड भविष्यवाणी नहीं बनता। | You closed the position at step {stepNumber} with {finalAmount}. Subsequent price changes do not affect this position. This does not turn one episode into a prediction. | Fixed/new; equivalent |
| $.unleveragedSurvived.title | The unleveraged replay stayed open | बिना उधार दोहराई गई स्थिति खुली रही | The position repeated without borrowing remained open. | Fixed/new; equivalent |
| $.unleveragedSurvived.body | Without borrowed exposure the identical path never reached the teaching maintenance level. The position stayed open to the end. | उधार की ताकत के बिना वही रास्ता कभी शिक्षण जमा सीमा तक नहीं पहुँचा। स्थिति अंत तक खुली रही। | Without borrowed power, the same path never reached the teaching deposit boundary. The position stayed open to the end. | Unchanged; equivalent |
| $.recoveryMaths.title | Recovery maths | वापसी का गणित | Maths of returning. | Unchanged; equivalent |
| $.recoveryMaths.body | This run ended at {finalAmount} from {startAmount}. Getting back to the starting amount from here needs a {requiredGainPct} gain, because the gain applies to a smaller base. A {lossPct} loss needs more than a {lossPct} gain. This is arithmetic, not a prediction. | यह अभ्यास {startAmount} से शुरू होकर {finalAmount} पर खत्म हुआ। यहाँ से शुरुआती रकम तक लौटने के लिए {requiredGainPct} लाभ चाहिए, क्योंकि लाभ छोटी रकम पर लगता है। {lossPct} नुकसान के बाद {lossPct} से ज़्यादा लाभ चाहिए। यह गणित है, भविष्यवाणी नहीं। | This exercise began with {startAmount} and ended at {finalAmount}. Returning to the initial amount needs {requiredGainPct} gain, because gain applies to a smaller amount. After {lossPct} loss, more than {lossPct} gain is needed. This is maths, not a prediction. | Fixed/new; equivalent |

## `src/content/hi/narration.json` — 100 string leaves

| Path / ID | English comparator | Hindi audited | Back-translation / metadata check | Agent disposition |
|---|---|---|---|---|
| $[0].id (language.greeting) | language.greeting | language.greeting | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[0].displayText (language.greeting) | Welcome. Choose a language to begin. | स्वागत है। शुरू करने के लिए भाषा चुनें। | Welcome. Select a language to start. | Unchanged; equivalent |
| $[0].spokenText (language.greeting) | Welcome. Choose a language to begin. | स्वागत है। शुरू करने के लिए भाषा चुनें। | Welcome. Select a language to start. | Unchanged; equivalent |
| $[0].trigger (language.greeting) | LanguageSelect | LanguageSelect | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[0].status (language.greeting) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[1].id (intro.main) | intro.main | intro.main | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[1].displayText (intro.main) | This is practice with virtual money. Your answers stay in memory during this journey; they are not saved or sent. | यह आभासी पैसे का अभ्यास है। आपके जवाब इस अभ्यास के दौरान मेमोरी में रहते हैं; वे सहेजे या भेजे नहीं जाते। | This is a virtual-money exercise. Your answers remain in memory during this exercise; they are not saved or sent. | Fixed/new; equivalent |
| $[1].spokenText (intro.main) | This is practice with virtual money. Your answers stay in memory during this journey; they are not saved or sent. | यह आभासी पैसे का अभ्यास है। आपके जवाब इस अभ्यास के दौरान मेमोरी में रहते हैं; वे सहेजे या भेजे नहीं जाते। | This is a virtual-money exercise. Your answers remain in memory during this exercise; they are not saved or sent. | Fixed/new; equivalent |
| $[1].trigger (intro.main) | Intro | Intro | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[1].status (intro.main) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[2].id (setup.main) | setup.main | setup.main | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[2].displayText (setup.main) | A forwarded message promises to double money using borrowed exposure. This is a teaching example, not advice. | आगे भेजा गया संदेश उधार की ताकत से पैसा दोगुना करने का वादा करता है। यह सीखने का उदाहरण है, सलाह नहीं। | A forwarded message promises to double money with borrowed power. This is a learning example, not advice. | Fixed/new; equivalent |
| $[2].spokenText (setup.main) | A forwarded message promises to double money using borrowed exposure. This is a teaching example, not advice. | आगे भेजा गया संदेश उधार की ताकत से पैसा दोगुना करने का वादा करता है। यह सीखने का उदाहरण है, सलाह नहीं। | A forwarded message promises to double money with borrowed power. This is a learning example, not advice. | Fixed/new; equivalent |
| $[2].trigger (setup.main) | Setup | Setup | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[2].status (setup.main) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[3].id (prediction.main) | prediction.main | prediction.main | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[3].displayText (prediction.main) | What do you think will happen? There is no right answer. | आपको क्या लगता है, क्या होगा? कोई सही जवाब नहीं है। | What do you think will happen? There is no correct answer. | Unchanged; equivalent |
| $[3].spokenText (prediction.main) | What do you think will happen? There is no right answer. | आपको क्या लगता है, क्या होगा? कोई सही जवाब नहीं है। | What do you think will happen? There is no correct answer. | Unchanged; equivalent |
| $[3].trigger (prediction.main) | Prediction | Prediction | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[3].status (prediction.main) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[4].id (run.main) | run.main | run.main | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[4].displayText (run.main) | Watch the path. You can continue or exit at each pause. | रास्ता देखें। हर विराम पर आप जारी रख सकते हैं या बाहर निकल सकते हैं। | Watch the path. At each pause you can continue or exit. | Fixed/new; equivalent |
| $[4].spokenText (run.main) | Watch the path. You can continue or exit at each pause. | रास्ता देखें। हर विराम पर आप जारी रख सकते हैं या बाहर निकल सकते हैं। | Watch the path. At each pause you can continue or exit. | Fixed/new; equivalent |
| $[4].trigger (run.main) | Run | Run | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[4].status (run.main) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[5].id (result.main) | result.main | result.main | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[5].displayText (result.main) | Here is how the leveraged position ended. | उधार की ताकत वाली स्थिति इस तरह खत्म हुई। | The position with borrowed power ended this way. | Unchanged; equivalent |
| $[5].spokenText (result.main) | Here is how the leveraged position ended. | उधार की ताकत वाली स्थिति इस तरह खत्म हुई। | The position with borrowed power ended this way. | Unchanged; equivalent |
| $[5].trigger (result.main) | Result | Result | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[5].status (result.main) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[6].id (replay.main) | replay.main | replay.main | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[6].displayText (replay.main) | The same path without leverage shows the contrast plainly. | उधार के बिना वही रास्ता अंतर साफ़ दिखाता है। | Without borrowing, the same path clearly shows the difference. | Unchanged; equivalent |
| $[6].spokenText (replay.main) | The same path without leverage shows the contrast plainly. | उधार के बिना वही रास्ता अंतर साफ़ दिखाता है। | Without borrowing, the same path clearly shows the difference. | Unchanged; equivalent |
| $[6].trigger (replay.main) | Replay | Replay | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[6].status (replay.main) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[7].id (reveal.main) | reveal.main | reveal.main | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[7].displayText (reveal.main) | This episode is a teaching example. One episode does not predict the future. | यह एपिसोड सीखने का उदाहरण है। एक एपिसोड भविष्य नहीं बताता। | This episode is an example for learning. One episode does not tell the future. | Fixed/new; equivalent |
| $[7].spokenText (reveal.main) | This episode is a teaching example. One episode does not predict the future. | यह एपिसोड सीखने का उदाहरण है। एक एपिसोड भविष्य नहीं बताता। | This episode is an example for learning. One episode does not tell the future. | Fixed/new; equivalent |
| $[7].trigger (reveal.main) | Reveal | Reveal | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[7].status (reveal.main) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[8].id (debrief.main) | debrief.main | debrief.main | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[8].displayText (debrief.main) | Leverage makes each price change affect more virtual money. | उधार की ताकत से कीमत का हर बदलाव ज़्यादा आभासी पैसे पर असर डालता है। | Borrowed power makes every price change affect more virtual money. | Fixed/new; equivalent |
| $[8].spokenText (debrief.main) | Leverage makes each price change affect more virtual money. | उधार की ताकत से कीमत का हर बदलाव ज़्यादा आभासी पैसे पर असर डालता है। | Borrowed power makes every price change affect more virtual money. | Fixed/new; equivalent |
| $[8].trigger (debrief.main) | Debrief | Debrief | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[8].status (debrief.main) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[9].id (postcheck.main) | postcheck.main | postcheck.main | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[9].displayText (postcheck.main) | Answer the question again. This is reflection, not a score. | सवाल का फिर जवाब दें। यह सोचने के लिए है, अंक के लिए नहीं। | Answer the question once more. This is for thinking, not a score. | Unchanged; equivalent |
| $[9].spokenText (postcheck.main) | Answer the question again. This is reflection, not a score. | सवाल का फिर जवाब दें। यह सोचने के लिए है, अंक के लिए नहीं। | Answer the question once more. This is for thinking, not a score. | Unchanged; equivalent |
| $[9].trigger (postcheck.main) | PostCheck | PostCheck | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[9].status (postcheck.main) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[10].id (nextsteps.main) | nextsteps.main | nextsteps.main | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[10].displayText (nextsteps.main) | Only checked protective resources are shown. They are for learning, not investment advice. | केवल जाँचे गए सुरक्षात्मक संसाधन दिखाए जाते हैं। वे सीखने के लिए हैं, निवेश की सलाह नहीं। | Only checked protective resources are shown. They are for learning, not investment advice. | Fixed/new; equivalent |
| $[10].spokenText (nextsteps.main) | Only checked protective resources are shown. They are for learning, not investment advice. | केवल जाँचे गए सुरक्षात्मक संसाधन दिखाए जाते हैं। वे सीखने के लिए हैं, निवेश की सलाह नहीं। | Only checked protective resources are shown. They are for learning, not investment advice. | Fixed/new; equivalent |
| $[10].trigger (nextsteps.main) | NextSteps | NextSteps | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[10].status (nextsteps.main) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[11].id (ENTRY) | ENTRY | ENTRY | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[11].displayText (ENTRY) | The practice begins at the first value. | अभ्यास पहले मान से शुरू होता है। | The exercise starts with the first value. | Fixed/new; equivalent |
| $[11].spokenText (ENTRY) | The practice begins at the first value. | अभ्यास पहले मान से शुरू होता है। | The exercise starts with the first value. | Fixed/new; equivalent |
| $[11].trigger (ENTRY) | ENTRY | ENTRY | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[11].status (ENTRY) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[12].id (DRAWDOWN_5) | DRAWDOWN_5 | DRAWDOWN_5 | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[12].displayText (DRAWDOWN_5) | The path is five percent below its start. | रास्ता शुरुआत से पाँच प्रतिशत नीचे है। | The path is five percent below the beginning. | Unchanged; equivalent |
| $[12].spokenText (DRAWDOWN_5) | The path is five percent below its start. | रास्ता शुरुआत से पाँच प्रतिशत नीचे है। | The path is five percent below the beginning. | Unchanged; equivalent |
| $[12].trigger (DRAWDOWN_5) | DRAWDOWN_5 | DRAWDOWN_5 | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[12].status (DRAWDOWN_5) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[13].id (DRAWDOWN_10) | DRAWDOWN_10 | DRAWDOWN_10 | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[13].displayText (DRAWDOWN_10) | The path is ten percent below its start. | रास्ता शुरुआत से दस प्रतिशत नीचे है। | The path is ten percent below the beginning. | Unchanged; equivalent |
| $[13].spokenText (DRAWDOWN_10) | The path is ten percent below its start. | रास्ता शुरुआत से दस प्रतिशत नीचे है। | The path is ten percent below the beginning. | Unchanged; equivalent |
| $[13].trigger (DRAWDOWN_10) | DRAWDOWN_10 | DRAWDOWN_10 | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[13].status (DRAWDOWN_10) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[14].id (DRAWDOWN_20) | DRAWDOWN_20 | DRAWDOWN_20 | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[14].displayText (DRAWDOWN_20) | The path is twenty percent below its start. | रास्ता शुरुआत से बीस प्रतिशत नीचे है। | The path is twenty percent below the beginning. | Unchanged; equivalent |
| $[14].spokenText (DRAWDOWN_20) | The path is twenty percent below its start. | रास्ता शुरुआत से बीस प्रतिशत नीचे है। | The path is twenty percent below the beginning. | Unchanged; equivalent |
| $[14].trigger (DRAWDOWN_20) | DRAWDOWN_20 | DRAWDOWN_20 | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[14].status (DRAWDOWN_20) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[15].id (MARGIN_WARNING) | MARGIN_WARNING | MARGIN_WARNING | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[15].displayText (MARGIN_WARNING) | The virtual position is near its teaching margin level. | आभासी स्थिति अभ्यास की जमा सीमा के पास है। | The virtual position is near the exercise's deposit boundary. | Fixed/new; equivalent |
| $[15].spokenText (MARGIN_WARNING) | The virtual position is near its teaching margin level. | आभासी स्थिति अभ्यास की जमा सीमा के पास है। | The virtual position is near the exercise's deposit boundary. | Fixed/new; equivalent |
| $[15].trigger (MARGIN_WARNING) | MARGIN_WARNING | MARGIN_WARNING | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[15].status (MARGIN_WARNING) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[16].id (FORCED_EXIT) | FORCED_EXIT | FORCED_EXIT | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[16].displayText (FORCED_EXIT) | The teaching rule closes this leveraged position. | अभ्यास का नियम इस उधार की ताकत वाली स्थिति को बंद करता है। | The exercise rule closes this position with borrowed power. | Fixed/new; equivalent |
| $[16].spokenText (FORCED_EXIT) | The teaching rule closes this leveraged position. | अभ्यास का नियम इस उधार की ताकत वाली स्थिति को बंद करता है। | The exercise rule closes this position with borrowed power. | Fixed/new; equivalent |
| $[16].trigger (FORCED_EXIT) | FORCED_EXIT | FORCED_EXIT | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[16].status (FORCED_EXIT) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[17].id (USER_EXIT) | USER_EXIT | USER_EXIT | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[17].displayText (USER_EXIT) | The position was closed by your choice. | स्थिति आपके चुनाव से बंद हुई। | The position closed by your choice. | Fixed/new; equivalent |
| $[17].spokenText (USER_EXIT) | The position was closed by your choice. | स्थिति आपके चुनाव से बंद हुई। | The position closed by your choice. | Fixed/new; equivalent |
| $[17].trigger (USER_EXIT) | USER_EXIT | USER_EXIT | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[17].status (USER_EXIT) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[18].id (EPISODE_END) | EPISODE_END | EPISODE_END | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[18].displayText (EPISODE_END) | The path has reached its end. | रास्ता अपने अंत तक पहुँच गया है। | The path has arrived at its end. | Unchanged; equivalent |
| $[18].spokenText (EPISODE_END) | The path has reached its end. | रास्ता अपने अंत तक पहुँच गया है। | The path has arrived at its end. | Unchanged; equivalent |
| $[18].trigger (EPISODE_END) | EPISODE_END | EPISODE_END | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[18].status (EPISODE_END) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[19].id (UNLEVERAGED_SURVIVED) | UNLEVERAGED_SURVIVED | UNLEVERAGED_SURVIVED | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[19].displayText (UNLEVERAGED_SURVIVED) | Without leverage, the position on this teaching path stayed open. | बिना उधार की ताकत के, इस अभ्यास के रास्ते पर स्थिति खुली रही। | Without borrowed power, the position on this practice path remained open. | Fixed/new; equivalent |
| $[19].spokenText (UNLEVERAGED_SURVIVED) | Without leverage, the position on this teaching path stayed open. | बिना उधार की ताकत के, इस अभ्यास के रास्ते पर स्थिति खुली रही। | Without borrowed power, the position on this practice path remained open. | Fixed/new; equivalent |
| $[19].trigger (UNLEVERAGED_SURVIVED) | UNLEVERAGED_SURVIVED | UNLEVERAGED_SURVIVED | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[19].status (UNLEVERAGED_SURVIVED) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |

## `src/content/hi/glossary.json` — 63 string leaves

| Path / ID | English comparator | Hindi audited | Back-translation / metadata check | Agent disposition |
|---|---|---|---|---|
| $[0].termId (leverage) | leverage | leverage | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[0].term (leverage) | Leverage | उधार की ताकत | Borrowed power. | Unchanged; equivalent |
| $[0].displayText (leverage) | Leverage | उधार की ताकत | Borrowed power. | Unchanged; equivalent |
| $[0].short (leverage) | Using borrowed exposure makes each price change affect more virtual money. | उधार की ताकत से कीमत का हर बदलाव ज़्यादा आभासी पैसे पर असर डालता है। | Borrowed power makes every price change affect more virtual money. | Fixed/new; equivalent |
| $[0].analogy (leverage) | On a longer seesaw arm, the same tilt moves the end farther. | झूले की लंबी बाँह पर उतना ही झुकाव सिरे को ज़्यादा दूर ले जाता है। | On the long arm of a seesaw, the same tilt carries the end farther. | Fixed/new; equivalent |
| $[0].spokenText (leverage) | Leverage uses exposure larger than your own amount. Each price change affects more virtual money. | उधार की ताकत से अपनी रकम से बड़ी राशि पर असर लिया जाता है। कीमत का हर बदलाव ज़्यादा आभासी पैसे पर असर डालता है। | Borrowed power takes exposure on an amount larger than your own. Every price change affects more virtual money. | Fixed/new; equivalent |
| $[0].status (leverage) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[1].termId (margin) | margin | margin | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[1].term (margin) | Margin | जमा रकम | Deposit amount. | Unchanged; equivalent |
| $[1].displayText (margin) | Margin | जमा रकम | Deposit amount. | Unchanged; equivalent |
| $[1].short (margin) | The teaching amount kept aside for a leveraged position. | उधार की ताकत वाली स्थिति के लिए अलग रखी गई अभ्यास की रकम। | The practice amount set aside for a position with borrowed power. | Fixed/new; equivalent |
| $[1].analogy (margin) | Like a reserved cushion, it has a limit; it cannot prevent every loss. | अलग रखे सहारे की तरह इसकी भी सीमा है; यह हर नुकसान नहीं रोक सकता। | Like a support kept aside, it also has a limit; it cannot prevent every loss. | Fixed/new; equivalent |
| $[1].spokenText (margin) | Margin is the teaching amount kept aside for a leveraged position. | जमा रकम उधार की ताकत वाली स्थिति के लिए अलग रखी गई अभ्यास की रकम है। | The deposit amount is the practice amount set aside for a position with borrowed power. | Fixed/new; equivalent |
| $[1].status (margin) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[2].termId (forcedExit) | forcedExit | forcedExit | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[2].term (forcedExit) | Forced exit | ज़बरन बाहर निकलना | Forced exit. | Unchanged; equivalent |
| $[2].displayText (forcedExit) | Forced exit | ज़बरन बाहर निकलना | Forced exit. | Unchanged; equivalent |
| $[2].short (forcedExit) | A teaching rule closes the position when its equity falls to a set level. | जब बची आभासी रकम तय सीमा तक गिरे तो अभ्यास का नियम स्थिति बंद कर देता है। | When remaining virtual money falls to a fixed boundary, the exercise rule closes the position. | Fixed/new; equivalent |
| $[2].analogy (forcedExit) | Like a game ending at a marked boundary, not an undo button. | जैसे तय सीमा पर खेल खत्म हो जाए, न कि सब पहले जैसा करने का बटन मिले। | Like a game ending at a fixed boundary, not receiving a button to restore everything. | Fixed/new; equivalent |
| $[2].spokenText (forcedExit) | A forced exit happens when the teaching rule closes the position at a set level. | ज़बरन बाहर निकलना तब होता है जब अभ्यास का नियम तय सीमा पर स्थिति बंद करता है। | Forced exit happens when the exercise rule closes the position at a fixed boundary. | Fixed/new; equivalent |
| $[2].status (forcedExit) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[3].termId (volatility) | volatility | volatility | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[3].term (volatility) | Volatility | उतार-चढ़ाव | Ups and downs. | Unchanged; equivalent |
| $[3].displayText (volatility) | Volatility | उतार-चढ़ाव | Ups and downs. | Unchanged; equivalent |
| $[3].short (volatility) | How much and how quickly values move up and down. | मूल्य कितना और कितनी जल्दी ऊपर या नीचे बदलता है। | How much and how quickly value changes upward or downward. | Fixed/new; equivalent |
| $[3].analogy (volatility) | Like a bus ride on a bumpy road. | जैसे ऊबड़-खाबड़ सड़क पर बस की सवारी। | Like a bus journey on an uneven road. | Unchanged; equivalent |
| $[3].spokenText (volatility) | Volatility describes how much and how quickly values move up and down. | उतार-चढ़ाव बताता है कि मूल्य कितना और कितनी जल्दी ऊपर या नीचे बदलता है। | Ups and downs describes how much and how quickly value changes upward or downward. | Fixed/new; equivalent |
| $[3].status (volatility) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[4].termId (drawdown) | drawdown | drawdown | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[4].term (drawdown) | Drawdown | गिरावट | Decline. | Unchanged; equivalent |
| $[4].displayText (drawdown) | Drawdown | गिरावट | Decline. | Unchanged; equivalent |
| $[4].short (drawdown) | The fall from a previous high to a later value. | पहले के ऊँचे स्तर से बाद के मूल्य तक की कमी। | The reduction from an earlier high level to a later value. | Fixed/new; equivalent |
| $[4].analogy (drawdown) | Like water level falling from its highest mark. | जैसे पानी अपने सबसे ऊँचे निशान से नीचे आ जाए। | Like water going below its highest mark. | Unchanged; equivalent |
| $[4].spokenText (drawdown) | Drawdown is the fall from a previous high to a later value. | गिरावट पहले के ऊँचे स्तर से बाद के मूल्य तक की कमी है। | Decline is the reduction from an earlier high level to a later value. | Fixed/new; equivalent |
| $[4].status (drawdown) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[5].termId (recovery) | recovery | recovery | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[5].term (recovery) | Recovery maths | वापसी का गणित | Maths of returning. | Unchanged; equivalent |
| $[5].displayText (recovery) | Recovery maths | वापसी का गणित | Maths of returning. | Unchanged; equivalent |
| $[5].short (recovery) | After a loss, a larger percentage gain is needed to return; losing everything leaves no base for recovery. | नुकसान के बाद लौटने के लिए बड़ा प्रतिशत लाभ चाहिए; सब खो जाने पर वापसी का आधार नहीं बचता। | After a loss, returning needs a larger percentage gain; losing all leaves no base to return from. | Fixed/new; equivalent |
| $[5].analogy (recovery) | If half a jug remains, returning to a full jug means doubling what remains. | अगर जग में आधा पानी बचे, तो उसे फिर भरने के लिए बचे पानी को दोगुना करना होगा। | If half the water remains in a jug, filling it again requires doubling the remaining water. | Fixed/new; equivalent |
| $[5].spokenText (recovery) | After a loss, returning to the start needs a larger percentage gain. Losing everything leaves no base for recovery. | नुकसान के बाद शुरुआती रकम तक लौटने के लिए बड़ा प्रतिशत लाभ चाहिए। सब खो जाने पर वापसी का आधार नहीं बचता। | After a loss, returning to the initial amount needs a larger percentage gain. Losing all leaves no base for return. | Fixed/new; equivalent |
| $[5].status (recovery) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[6].termId (diversification) | diversification | diversification | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[6].term (diversification) | Diversification | विविधीकरण | Diversification. | Fixed/new; equivalent |
| $[6].displayText (diversification) | Diversification | विविधीकरण | Diversification. | Fixed/new; equivalent |
| $[6].short (diversification) | Spreading exposure across different sources of risk does not remove all risk. Some can fall together. | अलग स्रोतों में जोखिम बाँटने से सारा जोखिम खत्म नहीं होता। कुछ में एक साथ गिरावट आ सकती है। | Dividing risk among different sources does not end all risk. Some can drop together. | Fixed/new; equivalent |
| $[6].analogy (diversification) | Several baskets can still be shaken by the same bump. | एक ही झटके से कई टोकरियाँ भी हिल सकती हैं। | Several baskets can be shaken by the same jolt. | Fixed/new; equivalent |
| $[6].spokenText (diversification) | Diversification spreads exposure across different sources of risk. It does not remove all risk. Some can fall together. | विविधीकरण में जोखिम अलग स्रोतों में बाँटा जाता है। इससे सारा जोखिम खत्म नहीं होता। कुछ में एक साथ गिरावट आ सकती है। | Diversification divides risk among different sources. It does not end all risk. Some can drop together. | Fixed/new; equivalent |
| $[6].status (diversification) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[7].termId (compounding) | compounding | compounding | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[7].term (compounding) | Compounding | चक्रवृद्धि | Compounding. | Unchanged; equivalent |
| $[7].displayText (compounding) | Compounding | चक्रवृद्धि | Compounding. | Unchanged; equivalent |
| $[7].short (compounding) | Each percentage change applies to the amount left by earlier changes. This works for gains and losses. | हर प्रतिशत बदलाव पहले के बदलावों के बाद बची रकम पर लागू होता है। ऐसा लाभ और नुकसान, दोनों में होता है। | Each percentage change applies to the amount remaining after previous changes. This happens for both gains and losses. | Fixed/new; equivalent |
| $[7].analogy (compounding) | Each step starts where the previous step ended, not at the original starting line. | हर कदम पिछले कदम के अंत से शुरू होता है, मूल शुरुआती रेखा से नहीं। | Every step begins at the end of the previous step, not at the original starting line. | Fixed/new; equivalent |
| $[7].spokenText (compounding) | With compounding, each percentage change applies to the amount left by earlier changes. This works for gains and losses. | चक्रवृद्धि में हर प्रतिशत बदलाव पहले के बदलावों के बाद बची रकम पर लागू होता है। ऐसा लाभ और नुकसान, दोनों में होता है। | In compounding, each percentage change applies to the amount remaining after previous changes. This happens for gains and losses alike. | Fixed/new; equivalent |
| $[7].status (compounding) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |
| $[8].termId (fees) | fees | fees | Technical identifier; unchanged literal, not translated or spoken. | Metadata |
| $[8].term (fees) | Fees | शुल्क | Fees. | Unchanged; equivalent |
| $[8].displayText (fees) | Fees | शुल्क | Fees. | Unchanged; equivalent |
| $[8].short (fees) | Charges reduce the amount left. This simplified teaching model does not include fees. | शुल्क से बची रकम घटती है। अभ्यास के इस सरल मॉडल में शुल्क शामिल नहीं हैं। | Fees reduce the remaining amount. Fees are not included in this simplified practice model. | Fixed/new; equivalent |
| $[8].analogy (fees) | A container has less left after a small amount is taken out. | किसी बर्तन से थोड़ी मात्रा निकालने के बाद उसमें कम बचता है। | After a little is taken out of a container, less remains inside. | Fixed/new; equivalent |
| $[8].spokenText (fees) | Fees are charges that reduce the amount left. This simplified teaching model does not include fees. | शुल्क ऐसी लागत है जिससे बची रकम घटती है। अभ्यास के इस सरल मॉडल में शुल्क शामिल नहीं हैं। | Fees are costs that reduce the remaining amount. This simplified practice model does not include fees. | Fixed/new; equivalent |
| $[8].status (fees) | agent-checked | agent-checked | Agent evidence only; not human/native review. | Metadata |

## `src/content/hi/features.json` — 63 string leaves (read-only product-track review)

All 62 user-facing leaves are hash-bound in each language. `_meta.status` is metadata, not participant text. Equivalence below is linguistic, not evidence that a feature works; product/browser verification owns offline, audio, caching, clipboard, settlement and restart behavior. Product track corrected `historical` to reveal the period, not instrument identity, and tightened `offline`, `online` and `disconnected` to match browser/cache evidence. Those eight changed leaves were re-read and re-registered below after the final product edits. No feature file was edited by this track.

| Path | Hindi audited | Independent English back-translation / disposition |
|---|---|---|
| $._meta.status | agent-checked | Agent-only status; not human/native approval. |
| $.preferences | पढ़ने के विकल्प | Reading choices. Equivalent. |
| $.language | भाषा | Language. Equivalent. |
| $.textSize | अक्षरों का आकार | Size of the letters. Equivalent. |
| $.standardText | सामान्य | Standard/normal. Equivalent. |
| $.largeText | बड़ा | Large. Equivalent. |
| $.skip | मौजूदा चरण पर जाएँ | Go to the current step. Equivalent. |
| $.reviewNotice | अंग्रेज़ी और हिन्दी की जाँच एक स्वचालित एजेंट ने की है, हिन्दी मातृभाषी ने नहीं। आवाज़ उपलब्ध हो तो भी किसी व्यक्ति ने उसे सुनकर जाँचा नहीं है। | An automated agent, not a Hindi native speaker, checked English and Hindi. Even if speech is available, no person checked it by listening. Equivalent; limitation retained. |
| $.privacy | जवाब सिर्फ़ इस खुले पन्ने में रहते हैं। पन्ना दोबारा खोलने या अभ्यास फिर शुरू करने पर मिट जाते हैं। केवल भाषा और अक्षरों का आकार सहेजा जाता है। कोई खाता या ट्रैकिंग नहीं। | Answers remain only in this open page. Reopening the page or restarting the exercise erases them. Only language and letter size are saved. No account or tracking. Equivalent; not a blanket no-storage claim. |
| $.offline | इस ब्राउज़र में ऐप की फ़ाइलें कैश हो जाने के बाद ऐप बिना इंटरनेट फिर खुल सकता है। आवाज़ के केवल वे हिस्से बिना इंटरनेट चलेंगे जो इस डिवाइस पर पहले से कैश में हैं। आधिकारिक लिंक के लिए इंटरनेट चाहिए। | After this browser has cached the app files, the app can reopen without internet. Only speech segments already cached on this device work without internet. Official links need internet. Equivalent; cache completion, not page-load completion, is the precondition. |
| $.online | ब्राउज़र के अनुसार इंटरनेट कनेक्शन उपलब्ध है | According to the browser, an internet connection is available. Equivalent; not an independently tested remote connection. |
| $.disconnected | ब्राउज़र के अनुसार इंटरनेट बंद है: उपलब्ध कैश की फ़ाइलें इस्तेमाल हो रही हैं | According to the browser, internet is off: available cached files are being used. Equivalent; browser-report scope preserved. |
| $.audio | आवाज़ सुनना वैकल्पिक है | Listening to speech is optional. Equivalent. |
| $.listen | सुनें | Listen. Equivalent. |
| $.pauseAudio | आवाज़ रोकें | Stop/pause the speech. In the paired pause/resume context, equivalent. |
| $.resumeAudio | आवाज़ जारी करें | Continue the speech. Equivalent. |
| $.replayAudio | आवाज़ फिर सुनें | Listen to the speech again. Equivalent. |
| $.muteAudio | आवाज़ मूक करें | Mute the speech. Equivalent; naturalness not native-tested. |
| $.unmuteAudio | आवाज़ मूक करना हटाएँ | Remove muting of the speech. Equivalent; naturalness not native-tested. |
| $.audioSpeed | आवाज़ की गति | Speech speed. Equivalent. |
| $.normalSpeed | सामान्य | Normal. Equivalent. |
| $.slowSpeed | धीमी | Slow. Equivalent. |
| $.audioIdle | इस हिस्से की आवाज़ लोड करने के लिए सुनें दबाएँ। उसका पाठ दिखता रहेगा। | Press Listen to load the speech for this part. Its text remains visible. Equivalent. |
| $.audioLoading | इस हिस्से की आवाज़ लोड हो रही है… | Speech for this part is loading. Equivalent. |
| $.audioPlaying | आवाज़ चल रही है। | Speech is playing. Equivalent. |
| $.audioPaused | आवाज़ रुकी हुई है। | Speech is paused. Equivalent. |
| $.audioEnded | आवाज़ पूरी हो गई है। | Speech has finished. Equivalent. |
| $.audioUnavailable | इस हिस्से की आवाज़ नहीं चल सकी। पाठ पढ़ें; आगे बढ़ने के लिए आवाज़ ज़रूरी नहीं है। | Speech for this part could not play. Read the text; sound is not necessary to continue. Equivalent. |
| $.episodeChoice | एक छिपा हुआ उदाहरण चुनें | Choose a hidden example. Equivalent. |
| $.episode | उदाहरण {number} | Example {number}. Equivalent; placeholder preserved. |
| $.historical | दर्ज किए गए मूल्यों का रास्ता; इसकी अवधि खुलासे तक छिपी है। केवल आभासी पैसा और समझाने वाले नियम हैं। | A path of recorded values; its period is hidden until disclosure. Only virtual money and explanatory rules. Equivalent; period, not instrument identity, is revealed. |
| $.introBody | आभासी पैसे से अभ्यास करें, कोई असली सौदा नहीं। पहले अनुमान चुनें, रास्ता देखें, फिर कम एक्सपोज़र के साथ उसी रास्ते की तुलना करें। | Practise with virtual money, not a real trade. First choose an expectation, watch the path, then compare the same path with less exposure. Equivalent; transliterated exposure needs product explanation/glossary support. |
| $.setupTitle | अपना आभासी अभ्यास चुनें | Choose your virtual exercise. Equivalent. |
| $.setupBody | ज़्यादा एक्सपोज़र से हर बदलाव का आभासी पैसे पर असर बदलता है। ये विकल्प कोई सलाह नहीं हैं। | More exposure changes each movement's effect on virtual money. These choices are not advice. Equivalent. |
| $.predictionBody | रास्ता शुरू होने से पहले अपना अनुमान चुनें। तुलना देखने के बाद दोबारा सोच सकते हैं; यह परीक्षा या भविष्यवाणी नहीं है। | Choose your expectation before the path begins. You may think again after the comparison; this is not an examination or prediction. Equivalent. |
| $.postQuestion | क्या आप उधार वाले एक्सपोज़र को और साफ़ समझना चाहेंगे? | Would you like a clearer understanding of borrowed exposure? Equivalent; no position recommendation. |
| $.settlement | समझाने वाला नियम स्थिति बंद कर दे तो उसकी रेखा निपटान की रकम पर खत्म हो जाती है। बाद के बदलाव उस बंद स्थिति का पैसा वापस नहीं ला सकते। | When the explanatory rule closes a position, its line ends at the settlement amount. Later changes cannot bring back that closed position's money. Equivalent. |
| $.comparisonLimit | दोनों अभ्यासों में वही दर्ज रास्ता और शुरुआती रकम है। एक गुना एक्सपोज़र वाला अभ्यास अंत तक चलता है। आपने पहले बाहर निकलना चुना हो तो अवधि भी अलग है; इससे किसी चुनाव को बेहतर नहीं बताया जाता। | Both exercises use the same recorded path and starting amount. The one-times exposure run continues to the end. If you chose an early exit, duration also differs; this does not declare one choice better. Equivalent; honest holding-time limit. |
| $.pausePath | रास्ता रोकें | Pause the path. Equivalent. |
| $.resumePath | रास्ता जारी करें | Continue the path. Equivalent. |
| $.pausedPath | रास्ता रुका हुआ है। आराम से सोचें। | The path is paused. Think at ease. Equivalent. |
| $.glossary | आसान मतलब जानने के लिए शब्द दबाएँ | Press a word to learn its simple meaning. Equivalent. |
| $.glossaryClose | मतलब बंद करें | Close the meaning/explanation. Equivalent in dialog context. |
| $.sourceNote | पूरा स्रोत और दोबारा उपयोग की अनुमति का प्रमाण परियोजना के दस्तावेज़ों में है। इस अभ्यास में किसी असली वित्तीय साधन का नाम नहीं दिखाया जाता। | Full source and proof of reuse permission are in project documents. No real financial instrument's name is shown in this exercise. Equivalent; rights evidence belongs to the data track. |
| $.revealNeutral | ये दर्ज किए गए मूल्य हैं, जिनसे एक सरल अभ्यास बनाया गया है। सिर्फ़ रास्ता यह नहीं बताता कि मूल्य क्यों बदले। एक उदाहरण अगले की भविष्यवाणी नहीं करता। | These are recorded values used to make a simple exercise. The path alone does not say why values changed. One example does not predict the next. Equivalent; no invented causality. |
| $.nextBody | इन आधिकारिक सुरक्षा संसाधनों की जाँच एक स्वचालित एजेंट ने की है। ये कोई सलाह नहीं हैं। लिंक खोलने पर आप ऐप से बाहर जाएँगे और उस वेबसाइट के गोपनीयता नियम लागू होंगे। | An automated agent checked these official protective resources. They are not advice. Opening a link leaves the app and that site's privacy rules apply. Equivalent. |
| $.resourceFallback | लिंक न खुले तो इंटरनेट जोड़कर आधिकारिक संस्था की वेबसाइट पर जाएँ। बिना माँगे आए संदेश के जवाब में पासवर्ड, एक बार इस्तेमाल होने वाला कोड या खाते की जानकारी कभी साझा न करें। | If the link does not open, connect to internet and go to the official organisation's site. Never share passwords, one-use codes or account details in response to an unsolicited message. Equivalent; protective caution, not investment advice. |
| $.noResources | इस संस्करण में कोई सत्यापित लिंक उपलब्ध नहीं है। यहीं दी गई व्याख्याएँ पढ़ सकते हैं; बिना जाँच के किसी संपर्क पर भरोसा न करें। | No verified link is available in this version. You can read these explanations; do not trust an unchecked contact. Equivalent fallback. |
| $.externalLink | बाहरी वेबसाइट नए टैब में खुलेगी | An external site opens in a new tab. Equivalent. |
| $.pilotOpen | इस सत्र का स्थानीय सार देखें | View this session's local summary. Equivalent. |
| $.pilotTitle | आपका विचार, सिर्फ़ इस पन्ने पर | Your reflection, only on this page. Equivalent. |
| $.pilotBody | यह आपके सत्र का सार है, इकट्ठा किया गया शोध या सीखने का प्रमाण नहीं। कॉपी करना आपकी इच्छा है और इससे पाठ आपके डिवाइस के क्लिपबोर्ड पर जाएगा। पन्ना दोबारा खोलने या अभ्यास फिर शुरू करने से जवाब मिट जाते हैं। | This is your session summary, not collected research or proof of learning. Copying is optional and sends text to your device clipboard. Reopening the page or restarting erases the answers. Equivalent; copying deliberately extends data outside page memory. |
| $.pilotBefore | रास्ता देखने से पहले | Before seeing the path. Equivalent. |
| $.pilotAfter | तुलना देखने के बाद | After seeing the comparison. Equivalent. |
| $.pilotExplanation | क्या और साफ़ व्याख्या चाहिए? | Is a clearer explanation wanted? Equivalent. |
| $.pilotExposure | एक्सपोज़र का गुणक | Exposure multiplier. Equivalent. |
| $.pilotOutcome | अभ्यास कैसे खत्म हुआ | How the exercise ended. Equivalent. |
| $.pilotCopy | स्थानीय सार कॉपी करें | Copy the local summary. Equivalent. |
| $.pilotCopied | आपके डिवाइस के क्लिपबोर्ड पर कॉपी हो गया। | Copied to your device clipboard. Equivalent. |
| $.pilotCopyFailed | कॉपी नहीं हो सका। सार यहीं पढ़ सकते हैं या उसका पाठ चुन सकते हैं। | Could not copy. You can read the summary here or select its text. Equivalent. |
| $.pilotBack | संसाधनों पर वापस जाएँ | Return to resources. Equivalent. |
| $.pilotMissing | जवाब नहीं दिया | No answer given. Equivalent. |
| $.restart | फिर शुरू करें और जवाब मिटाएँ | Start again and erase the answers. Equivalent. |

Resolved product-copy finding: the previous `historical` pair incorrectly promised identity disclosure. The product owner changed the pair to “A recorded path; its period stays hidden until the reveal. Virtual money and teaching rules only.” / the corrected Hindi row above. The two exact leaf hashes and file hashes were refreshed after the re-review. No spoken text changed.

## Shared resource labels — four Hindi user-facing leaves

Exact official-page checks and English comparisons are in `docs/RESOURCE_CHECKS.md`; this table covers label meaning only, without claiming a new network verification or human approval. Both language labels are hash-bound in the review registry. Resource titles, evidence quotations and URLs are provenance, not rendered copy; only label fields receive the UI advice/length scan. Unverified resources still block release.

| Resource ID | Hindi label audited | Back-translation |
|---|---|---|
| sebi-scores | सेबी स्कोर्स — शिकायत पोर्टल | SEBI SCORES — complaint portal. Equivalent. |
| sebi-investor-support | सेबी — निवेशक सहायता | SEBI — investor support. Equivalent. |
| sebi-scam-warning-signs | सेबी — ठगी और दबाव की चालें पहचानना | SEBI — identifying fraud and pressure tactics. Equivalent. |
| government-cybercrime-reporting | भारत सरकार — साइबर अपराध रिपोर्टिंग पोर्टल | Government of India — cybercrime reporting portal. Equivalent. |

## Future-only disposition (not shipped content)

The former NAV and nomination entries described no core simulation concept and contained only “planned” / “लिखा जाना बाकी है” in their explanatory fields. They are not approved definitions. They were removed from BOTH runtime glossary arrays; the future scope remains documented here instead of silently converting placeholders into release copy. A future feature must supply contextual definitions, jurisdiction-specific evidence where relevant and a new bilingual QA/audio pass before reintroducing them.

| Former Hindi path / ID | Leaf | Hindi value | Back-translation | Disposition |
|---|---|---|---|---|
| `$[7].termId` (NAV) | termId | NAV | Technical term identifier; unchanged. | Future-only; removed from runtime. |
| `$[7].term` (NAV) | term | एन ए वी | Letters N A V, rendered in Devanagari. | Future-only; removed from runtime. |
| `$[7].displayText` (NAV) | displayText | एन ए वी | Letters N A V, rendered in Devanagari. | Future-only; removed from runtime. |
| `$[7].short` (NAV) | short | लिखा जाना बाकी है | Still to be written. | Future-only; removed from runtime. |
| `$[7].analogy` (NAV) | analogy | लिखा जाना बाकी है | Still to be written. | Future-only; removed from runtime. |
| `$[7].spokenText` (NAV) | spokenText | लिखा जाना बाकी है | Still to be written. | Future-only; removed from runtime. |
| `$[7].status` (NAV) | status | planned | Planned, not reviewed. | Future-only; removed from runtime. |
| `$[10].termId` (nomination) | termId | nomination | Technical term identifier; unchanged. | Future-only; removed from runtime. |
| `$[10].term` (nomination) | term | नामांकन | Nomination. | Future-only; removed from runtime. |
| `$[10].displayText` (nomination) | displayText | नामांकन | Nomination. | Future-only; removed from runtime. |
| `$[10].short` (nomination) | short | लिखा जाना बाकी है | Still to be written. | Future-only; removed from runtime. |
| `$[10].analogy` (nomination) | analogy | लिखा जाना बाकी है | Still to be written. | Future-only; removed from runtime. |
| `$[10].spokenText` (nomination) | spokenText | लिखा जाना बाकी है | Still to be written. | Future-only; removed from runtime. |
| `$[10].status` (nomination) | status | planned | Planned, not reviewed. | Future-only; removed from runtime. |

## Verification and honest remaining limits

Exact-hash/audio structure tests cannot determine whether speech is intelligible or whether a participant understands an analogy. Automated signal/end-token/ASR checks remain distinct from human listening. Missing native review remains an explicit UI/README/limitations disclosure owned by the integration track.

### Resumed T2 verification — 2026-10-03

| Command / check | Observed result |
|---|---|
| `npm run lint` | Passed after fixing Node `Buffer`/`URL` imports in checker/test code. |
| `npm run typecheck` | Passed. |
| `npm run test` | Passed: 12 files, 145 tests at the final T2 checkpoint. |
| Focused content/audio/release suite | 73 tests, included in the full pass; earlier interrupted baseline had two obsolete assumptions, now removed. |
| `npm run build` | Passed with the current shared product track. This is not audio/release approval. |
| `npm run check:bundle` | Passed at this build: JavaScript gzip 108,528 bytes / 153,600 budget; CSS 2,324 / 20,480. Build-specific byte measurement, not a speed/accessibility claim. |
| `node scripts/check-audio.mjs` | Exit 1, correctly: generation still in progress. At the last gate snapshot, 12 of 58 tracks passed integrity; `complete` was false and 46 tracks were absent. |
| `npm run check:content` | Exit 1 for the same 47 audio-only errors. All 602 current user-facing content leaves emitted individual agent-check warnings. |
| `npm run check:release` | Exit 1 for those audio-only errors; no data/content/registry/resource errors remained. Synthetic test-only JSON was not treated as shipped data. |
| Final speech freeze comparison | All 58 exact `spokenText` values matched the resumed-session baseline; all four narration/glossary file hashes still match the pre-interruption QA table. |

The QA regression test now pins all ten localized file hashes and checks that every current Hindi leaf path/value appears in its table. Fixture-only tests prove draft/planned blocking, hypothetical reviewed-clean behavior, every-leaf warnings, changed/missing/stale review hashes, malformed bilingual content, full 58-track coverage, schema-2 integrity, unsafe paths/symlinks, missing/corrupted bytes, bad hashes, failed end-token/quality/ASR results and production-registry isolation. Contract test bytes are explicitly not speech and only exist in temporary test roots.

The final product pass changed four keys in both feature files (`historical`, `offline`, `online`, `disconnected`). The exact-hash gate initially rejected those edits, as intended. After reading/back-translating the new text, T2 updated only those eight registry hashes and the corresponding QA rows/file hashes; the final full suite passed.

### Handoff / actionable remaining disposition

1. Parent finishes real TTS generation and quality evidence, then reruns content/audio/release on the complete schema-2 manifest. Do not remove the missing-audio error or publish fixture bytes. The 12/58 snapshot above is a point-in-time observation, not a final production inventory.
2. Product correction `features.historical` is resolved: only the period is disclosed. No remaining feature-copy correction was found in the hash-pinned version. Any later product copy edit must refresh its QA row and exact leaf/file hashes; the tests intentionally fail stale evidence.
3. No native-speaker or human listening review occurred. Keep that limitation visible in UI, README and limitations; no production status was set to `reviewed`. Final root/audio/guardrail documentation alignment and aggregate release execution remain parent-owned.
4. T2 did not modify product/UI/features/package/data files, resource evidence, TTS scripts/assets, parent-owned root docs or the archived swarm board. No commit, staging, delegation or deployment was performed.
