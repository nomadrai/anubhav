# Content guide

## Voice and order

Write English first, then place the draft Hindi translation immediately below it. Keep sentences plain, calm, non-judgmental, and specific about uncertainty. Each on-screen teaching sentence is at most 25 words; split longer ideas into separate cards. Never promise safety, profit, prediction, or recovery.

Visual notation and spoken notation are separate fields. For example, visual `10×` gets spoken English “ten times” and draft Hindi “दस गुना”. Do not ask a screen reader to infer a symbol, decimal, percentage, or minus sign.

## Core glossary (English, then draft Hindi)

| Term | English | Draft Hindi |
|---|---|---|
| leverage | Using a larger exposure than your capital alone. | अपनी पूँजी से बड़ी राशि पर असर लेने का तरीका। |
| margin | Capital kept against an exposure; this teaching model is simplified. | किसी एक्सपोज़र के सामने रखी पूँजी; यह सीखने वाला मॉडल सरल है। |
| forced exit | A simplified stop after the model’s equity threshold is reached. | मॉडल की इक्विटी सीमा पहुँचने पर होने वाला सरल समापन। |
| volatility | How much a value moves over time; it can move up or down. | समय के साथ मूल्य के ऊपर या नीचे बदलने की मात्रा। |
| drawdown | A fall from a previous running high to a later value. | पिछले चल रहे उच्च स्तर से बाद के मूल्य तक गिरावट। |
| recovery | The gain needed to return after a loss; it is not usually the same percentage. | नुकसान के बाद पहले स्तर तक लौटने के लिए जरूरी बढ़त; प्रतिशत समान नहीं होता। |

Planned later glossary terms: diversification, NAV, compounding, fees, and nomination. They are not release-ready definitions yet: `TODO(human): review each term for jurisdiction, translation, and scope`.

## Screen copy seed (English first, draft Hindi second)

1. **Intro** — “This is a learning exercise, not financial advice.” / “यह सीखने का अभ्यास है, वित्तीय सलाह नहीं है।”
2. **Setup** — “Choose a teaching example; it is not a real instrument.” / “एक सीखने वाला उदाहरण चुनें; यह वास्तविक साधन नहीं है।”
3. **Prediction** — “Before the reveal, record what you expect.” / “दिखाने से पहले लिखें कि आप क्या होने की उम्मीद करते हैं।”
4. **Run** — “Watch the synthetic path. Pause before choosing whether to continue or exit.” / “कृत्रिम रास्ता देखें। जारी रखने या बाहर निकलने का चुनाव करने से पहले रुकें।”
5. **Reveal** — “The period stays hidden until this reveal.” / “इस खुलासे तक अवधि छिपी रहती है।”
6. **Debrief** — “A loss and its recovery percentage use different bases.” / “नुकसान और उसकी भरपाई का प्रतिशत अलग आधार लेते हैं।”
7. **Next steps** — “Write one question for a qualified source.” / “किसी योग्य स्रोत के लिए एक प्रश्न लिखें।”

These are draft strings, not approved claims. Keep visible labels short and explanatory text separate. Every narration and glossary entry keeps `displayText` separate from `spokenText`; Hindi remains draft until native-speaker review.

## Analogy drafts (6–8, all requiring human review)

1. **Small handle, heavy load:** “Leverage is like carrying a heavy load with a small handle: a small movement can strain the handle.” / “लीवरेज छोटे हैंडल से भारी बोझ उठाने जैसा है: छोटा झटका हैंडल पर बड़ा दबाव डाल सकता है।”
2. **Hill descent:** “On a downhill path, a small step can change your distance quickly; leverage can magnify a price move.” / “ढलान पर छोटा कदम दूरी जल्दी बदल सकता है; लीवरेज मूल्य की चाल को बड़ा कर सकता है।”
3. **Full glass:** “A glass near its edge has little room for a spill; low equity leaves less room for a fall.” / “किनारे तक भरे गिलास में छलकने की जगह कम होती है; कम इक्विटी में गिरावट की जगह कम रहती है।”
4. **Longer return road:** “After walking back one part of a journey, the remaining road can be longer than the first step.” / “यात्रा का एक भाग लौटने के बाद बाकी रास्ता पहले कदम से लंबा हो सकता है।”
5. **Seat belt, not shield:** “A warning is a reminder to pause, not a shield against loss.” / “चेतावनी रुककर सोचने का संकेत है, नुकसान से बचाने वाली ढाल नहीं।”
6. **Weather window:** “A calm minute does not describe every kind of weather; one path cannot describe every market.” / “एक शांत मिनट हर मौसम को नहीं बताता; एक पथ हर बाजार को नहीं बता सकता।”
7. **Map and journey:** “A map can explain a route without predicting tomorrow’s traffic.” / “नक्शा रास्ता समझा सकता है, कल का यातायात नहीं बता सकता।”
8. **Undo button:** “A forced exit is not an undo button; the simplified model stops at its rule.” / “बलपूर्वक समापन पहले जैसा करने का बटन नहीं है; सरल मॉडल अपने नियम पर रुकता है।”

`TODO(human)`: test each analogy for cultural clarity, financial misconception, Hindi naturalness, and the 25-word limit before publication. The content checker enforces structural parity, spoken-text hygiene, and the sentence limit; it does not replace human review.

## Numbers and claims

Show formula labels and units next to values. Provide a separate spoken string for `10×`, `7%`, negative values, decimals, and `0.25 × capital`. Never add a date, holiday, source, performance result, or certainty that is not in a verified input. If a claim cannot be evidenced, remove it or mark it `TODO(human)` outside the participant-facing copy.
