// Pure shared retrieval/guard logic: no key, network, storage, or question logging.
export function normalise(text) {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u200b-\u200f\ufeff]/gu, '')
    .replace(/[\p{P}\p{S}]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}
const stop = new Set(
  'a an the is are was were am i me my you your we our do does did what why how can could would please tell explain about of in on to for and or with this that it hai hain kya ka ki ke ko se mein mujhe batao samjhao है हैं क्या का की के को से में मुझे बताओ समझाओ यह ये वह और या तो'.split(
    ' ',
  ),
);
export function tokens(text) {
  return normalise(text)
    .split(' ')
    .filter((t) => t.length > 1 && !stop.has(t));
}
export function adviceSeeking(question) {
  const q = normalise(question);
  const future =
    /\b(?:will|would|going to|predict|prediction|forecast|target price|tomorrow|next week)\b.*\b(?:price|market|stock|share|rise|fall|up|down|crash|gain|return)\b|\b(?:price|market|stock|share)\b.*\b(?:will|tomorrow|target|prediction|forecast)\b|(?:बाज़ार|बाजार|मार्केट|दाम|कीमत|शेयर).*(?:गिरेगा|गिरेगी|बढ़ेगा|बढ़ेगी|कल|भविष्य|अनुमान)|(?:कल|भविष्य).*(?:बढ़|गिर|बाजार|बाज़ार|दाम)|\b(?:market|bazar|bazaar|share|price|daam)\b.*\b(?:girega|giregi|badhega|badhegi|kal|hoga|prediction)\b/u.test(
      q,
    );
  const action =
    /\b(?:buy|sell|hold|purchase|invest|investing|trade|trading)\b|खरीद|बेच|निवेश|रखूँ|रखूं|होल्ड|\b(?:kharid\w*|kharidu\w*|bech\w*|rakhun|rakhu|nivesh)\b/u.test(
      q,
    );
  const choice =
    /\b(?:should|which|when|where|best|suggest|recommend|good|right|safe|suitable|worth|pick|choose)\b|(?:कौन|कहाँ|कहां|कब|चाहिए|करूँ|करूं|सही|अच्छा|अच्छी|बताओ|मुझे)|\b(?:kaun\w*|konsa|kaunsa|kab|kahan|chahiye|karu\w*|sahi|acch\w*|acha|achha|batao)\b/u.test(
      q,
    );
  const personalAction =
    /\b(?:i|my|me)\b.*\b(?:buy|sell|hold|invest|trade)\b/u.test(q);
  const tip = /\b(?:tips?|signals?|calls?)\b|टिप|सिग्नल/u.test(q);
  const evaluation =
    /\b(?:good|bad|right|safe|true|trust|follow|worth|take|act|work|legit)\b|सही|अच्छ|मानूँ|मानूं|भरोसा|लेना|चलूँ|चलूं|\b(?:sahi|acch\w*|acha|achha|manu|maanun|bharosa)\b/u.test(
      q,
    );
  const instruction =
    /^(?:buy|sell|hold|invest|purchase|trade|kharido|becho|खरीदो|बेचो)\s/u.test(
      q,
    );
  const namedDecision =
    /\b(?:stock|share|investment|fund|option|future|trade)\b.*\b(?:recommend|best|suggest|pick|choose)\b|\b(?:recommend|suggest|best|pick|choose)\b.*\b(?:stock|share|investment|fund|option|trade)\b/u.test(
      q,
    );
  const productChoice =
    /\b(?:stocks?|shares?|funds?|brokers?|investments?|options?|futures?|etfs?|sips?|ipos?|bonds?|mfs?)\b|शेयर|स्टॉक|फंड|ब्रोकर|निवेश|ईटीएफ|सिप|आईपीओ|ऑप्शन/u.test(
      q,
    ) &&
    choice &&
    !/^(?:what is|what are|define|explain the meaning)/u.test(q);
  return (
    future ||
    (action && (choice || personalAction)) ||
    (tip && evaluation) ||
    instruction ||
    namedDecision ||
    productChoice
  );
}
export function personalDetails(question) {
  return (
    /[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?\d[\s-]*){8,}|\b[A-Z]{5}\d{4}[A-Z]\b/iu.test(
      question,
    ) ||
    /(?:otp|password|pin|पासवर्ड|ओटीपी|पिन)\s*(?:[:=]\s*[\w\d]{3,}|(?:is|है)\s+[\w\d]{3,}|\d{3,})/iu.test(
      question,
    ) ||
    /(?:salary|balance|account|portfolio|income|वेतन|खाता|आय|बैलेंस).*\d/iu.test(
      question,
    )
  );
}
export const MIN_RETRIEVAL_SCORE = 2;
export function retrieve(question, entries, limit = 3) {
  const query = [...new Set(tokens(question))];
  if (!query.length) return [];
  const documents = entries
    .filter((e) => e.status === 'agent-checked' || e.status === 'reviewed')
    .map((entry) => {
      const title = tokens(
        `${entry.title_en} ${entry.title_hi} ${entry.aliases.join(' ')}`,
      );
      const body = tokens(`${entry.text_en} ${entry.text_hi}`);
      const set = new Set([...title, ...body]);
      return { entry, title, body, set };
    });
  const avg =
    documents.reduce((n, d) => n + d.body.length, 0) / (documents.length || 1);
  return documents
    .map((d) => {
      let score = 0,
        matched = 0;
      for (const term of query) {
        if (!d.set.has(term)) continue;
        matched++;
        const df = documents.filter((doc) => doc.set.has(term)).length;
        const idf = Math.log(1 + (documents.length - df + 0.5) / (df + 0.5));
        const tf = d.body.filter((t) => t === term).length;
        score +=
          idf *
            ((tf * 2.2) /
              (tf + 1.2 * (0.35 + (0.65 * d.body.length) / (avg || 1)))) +
          (d.title.includes(term) ? 4 * idf : 0);
      }
      const nq = normalise(question);
      if (
        [d.entry.title_en, d.entry.title_hi, ...d.entry.aliases].some(
          (a) => normalise(a) === nq,
        )
      )
        score += 8;
      return { entry: d.entry, score, coverage: matched / query.length };
    })
    .filter((d) => d.score >= MIN_RETRIEVAL_SCORE && d.coverage >= 0.4)
    .sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id))
    .slice(0, limit);
}
export function relatedEntries(
  entries,
  ids = ['doubts-advice', 'products-leverage', 'fraud-registration'],
) {
  return ids
    .map((id) => entries.find((e) => e.id === id))
    .filter(Boolean)
    .slice(0, 3);
}
export function entryText(entry, language) {
  return language === 'hi' ? entry.text_hi : entry.text_en;
}
export function entryTitle(entry, language) {
  return language === 'hi' ? entry.title_hi : entry.title_en;
}
// Strict for novel model text. KB exemptions never apply to this output check.
export const BANNED_PATTERNS = [
  ['buy', /\bbuy\b/i],
  ['sell', /\bsell\b/i],
  ['hold', /\bhold\b/i],
  ['target price', /target\s+price/i],
  ['tip', /\btip\b/i],
  [
    'recommendation',
    /\b(?:recommend(?:ation|ed)?|you\s+should|advised\s+to|consider)\b/i,
  ],
  ['sure-shot', /sure[- ]?shot/i],
  ['guaranteed', /guarantee[ds]?|guaranteed/i],
  ['risk-free', /risk[- ]free/i],
  ['will rise/fall', /\bwill\s+(?:rise|fall)\b/i],
  [
    'broker/app promotion',
    /\b(?:broker|premium|affiliate|sign[- ]?up|subscribe|referral|cashback|bonus)\b/i,
  ],
  [
    'profit promotion',
    /\b(?:easy|quick|guaranteed|sure[- ]?shot)\s+(?:profit|return|returns|money)\b/i,
  ],
  [
    'Hindi advice',
    /खरीदें|बेचें|खरीदना\s+चाहिए|बेचना\s+चाहिए|निवेश\s+करें|निवेश\s+करना\s+चाहिए|सलाह\s+(?:ले|लें|मानें)|गारंटी|पक्का\s*मुनाफ़ा|पक्का\s*मुनाफा|सिफारिश/,
  ],
];
export function safeAnswer(answer, language, entries) {
  if (typeof answer !== 'string' || !answer.trim() || answer.length > 1800)
    return false;
  if (
    answer.trim().split(/\s+/u).length > 85 ||
    /<[^>]*>|https?:|www\.|<\||(?:^|\n)\s*(?:analysis|reasoning|thinking)\s*:/iu.test(
      answer,
    )
  )
    return false;
  if (
    /(?:^|[.!?]\s+)(?:invest|choose|purchase|trade|put money|take a position)\b|\b(?:best|suitable|right)\s+(?:stock|fund|broker|investment|trade)\b|\bfor you\b|\b(?:likely|certainly|definitely|expected to)\s+(?:rise|fall|gain|crash)\b/iu.test(
      answer,
    )
  )
    return false;
  if (BANNED_PATTERNS.some(([, pattern]) => pattern.test(answer))) return false;
  if (language === 'hi' && !/[\u0900-\u097f]/u.test(answer)) return false;
  if (language === 'en' && /[\u0900-\u097f]/u.test(answer)) return false;
  const context = entries
    .map((e) => entryText(e, language))
    .join(' ')
    .toLowerCase();
  if (
    (answer.match(/\d+(?:[.,]\d+)?/gu) || []).some((n) => !context.includes(n))
  )
    return false;
  // Reject new internal acronyms/tickers/named proper-noun sequences not present in the library context.
  const names = answer.match(/\b[A-Z][a-zA-Z0-9]+\b/gu) || [];
  const grammar = new Set(
    'A An The It They You Your This That If But No In On Do Some For With I We Our Its Each Only Not'
      .toLowerCase()
      .split(' '),
  );
  return names.every(
    (name) =>
      grammar.has(name.toLowerCase()) || context.includes(name.toLowerCase()),
  );
}
