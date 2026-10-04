import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { handleChat } from '../server/chat.mjs';
import { retrieve } from '../shared/chat-core.mjs';
import { KB_CATEGORIES } from '../shared/chat-config.mjs';
import en from '../src/content/en/chat.json' with { type: 'json' };
import hi from '../src/content/hi/chat.json' with { type: 'json' };
import registry from '../src/content/review-status.json' with { type: 'json' };

const knowledge = (
  await Promise.all(
    KB_CATEGORIES.map((category) =>
      import(`../knowledge/${category}.json`, { with: { type: 'json' } }),
    ),
  )
).flatMap((module) => module.default);
const previous = process.env.GROQ_API_KEY;
process.env.GROQ_API_KEY = 'synthetic-conversation-check-not-a-credential';
let providerCalls = 0;
let caseId = 0;
const ask = async (language, question, provider = 'answer') => {
  const response = await handleChat(
    new globalThis.Request('https://example.invalid/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://example.invalid',
      },
      body: JSON.stringify({ question, language }),
    }),
    {
      ip: `conversation-smoke-${caseId++}`,
      fetchImpl: async (_url, options) => {
        providerCalls++;
        const body = JSON.parse(options.body);
        const data = JSON.parse(body.messages[1].content);
        assert.equal(data.question, question);
        if (data.catalog) {
          assert.equal(body.response_format.type, 'json_schema');
          assert.equal(body.response_format.json_schema.strict, true);
          assert.equal(data.catalog.length, knowledge.length);
          assert.deepEqual(Object.keys(data).sort(), ['catalog', 'question']);
          assert.ok(
            data.catalog.every((entry) =>
              knowledge.some(
                (known) => known.id === entry.id && known.title_en === entry.title,
              ),
            ),
          );
          if (provider === 'fail-selection') throw new Error('Synthetic selection failure');
          const entryIds =
            provider === 'unknown'
              ? []
              : provider === 'invalid-selection'
                ? ['invented-entry-id']
                : provider === 'oversized-selection'
                  ? ['app-leverage', 'app-exposure', 'app-margin', 'app-equity']
                  : ['app-leverage'];
          return globalThis.Response.json({
            choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ entryIds }) } }],
          });
        }
        assert.deepEqual(Object.keys(data).sort(), ['learningEntries', 'question']);
        assert.ok(data.learningEntries.length > 0);
        assert.ok(data.learningEntries.length <= 3);
        assert.ok(
          data.learningEntries.every((entry) =>
            knowledge.some((known) => known.id === entry.id),
          ),
        );
        if (provider === 'fail') throw new Error('Synthetic model failure');
        const content =
          provider === 'unsafe'
            ? 'You should buy a stock.'
            : language === 'hi'
              ? 'उधार की ताकत से कीमत के उसी बदलाव का आभासी रकम पर असर बढ़ता है।'
              : 'Leverage makes the same price change affect more virtual money.';
        return globalThis.Response.json({
          choices: [{ finish_reason: 'stop', message: { content } }],
        });
      },
    },
  );
  assert.equal(response.status, 200);
  return response.json();
};

try {
  const social = [
    ['en', 'hi', 'greeting'],
    ['en', 'Hello there!', 'greeting'],
    ['en', 'Hi, how are you?', 'greeting'],
    ['hi', 'नमस्ते!', 'greeting'],
    ['hi', 'नमस्ते, आप कैसे हैं?', 'greeting'],
    ['en', 'thanks', 'thanks'],
    ['hi', 'धन्यवाद', 'thanks'],
    ['en', 'bye', 'goodbye'],
    ['hi', 'अलविदा', 'goodbye'],
    ['en', 'What can you explain?', 'help'],
    ['en', "I don't understand", 'help'],
    ['hi', 'मुझे समझ नहीं आया', 'help'],
  ];
  for (const [language, question, intent] of social) {
    const result = await ask(language, question);
    assert.equal(result.mode, intent);
    assert.equal(result.answer, (language === 'hi' ? hi : en)[intent]);
  }
  assert.equal(providerCalls, 0);

  for (const [language, question] of [
    ['en', 'Hi, what is leverage?'],
    ['en', 'Hello there, what does leverage mean? Thanks!'],
    ['hi', 'नमस्ते, उधार की ताकत क्या है?'],
    ['hi', 'Hi, leverage kya hai?'],
  ]) {
    const result = await ask(language, question);
    assert.equal(result.mode, 'entry');
    assert.ok(result.entries.length > 0);
  }
  assert.equal(providerCalls, 0);

  const semanticQuestion =
    'Could you explain why amplifying a practice position makes a dip hurt much more?';
  for (const [language, question] of [
    ['en', semanticQuestion],
    ['en', 'Hi, why does magnifying a position make a tiny adverse movement hurt disproportionately?'],
    ['hi', semanticQuestion],
    ['hi', 'thoda niche jaane par udhaar wali practice ki bachi rakam bahut kyon ghat jati hai'],
  ]) {
    assert.equal(retrieve(question, knowledge).length, 0);
    const before = providerCalls;
    const result = await ask(language, question);
    assert.equal(result.mode, 'generated');
    assert.deepEqual(result.entries.map((entry) => entry.id), ['app-leverage']);
    assert.equal(providerCalls - before, 2);
  }

  for (const [language, question, mode] of [
    ['en', 'Hi, which stock should I buy?', 'refusal'],
    ['hi', 'नमस्ते, कौन सा शेयर खरीदूँ?', 'refusal'],
    ['en', 'Hello, my account balance is 50000', 'private'],
    ['hi', 'नमस्ते, मेरा पासवर्ड है 123456', 'private'],
  ]) {
    const before = providerCalls;
    const result = await ask(language, question);
    assert.equal(result.mode, mode);
    assert.equal(providerCalls, before);
  }

  for (const [language, question] of [
    ['en', 'Hi, how do I bake sourdough bread?'],
    ['hi', 'नमस्ते, चॉकलेट केक कैसे पकाएँ?'],
  ]) {
    const before = providerCalls;
    const result = await ask(language, question, 'unknown');
    assert.equal(result.mode, 'unknown');
    assert.equal(result.answer, (language === 'hi' ? hi : en).unknown);
    assert.equal(providerCalls - before, 1);
  }

  for (const provider of ['fail-selection', 'invalid-selection', 'oversized-selection']) {
    const before = providerCalls;
    const result = await ask('en', semanticQuestion, provider);
    assert.equal(result.mode, 'unavailable');
    assert.equal(result.answer, en.unavailable);
    assert.equal(providerCalls - before, 1);
  }

  for (const provider of ['fail', 'unsafe']) {
    const before = providerCalls;
    const result = await ask('en', semanticQuestion, provider);
    assert.equal(result.mode, 'entry');
    assert.equal(result.answer, result.entries[0].text_en);
    assert.equal(providerCalls - before, 2);
  }
  delete process.env.GROQ_API_KEY;
  const before = providerCalls;
  const noKey = await ask('en', 'Hi, what is leverage?');
  assert.equal(noKey.mode, 'entry');
  const noKeySemantic = await ask('en', semanticQuestion);
  assert.equal(noKeySemantic.mode, 'unavailable');
  assert.equal(providerCalls, before);

  let suggestions = 0;
  for (const [language, copy] of Object.entries({ en, hi })) {
    for (const questions of Object.values(copy.stepQuestions))
      for (const question of Object.values(questions)) {
        assert.ok(retrieve(question, knowledge).length > 0);
        suggestions++;
      }
    for (const id of ['greeting', 'thanks', 'goodbye', 'help', 'disclosure', 'unknown', 'unavailable', 'about']) {
      const record = registry.languages[language]['chat.json'][id];
      assert.equal(record.status, 'agent-checked');
      assert.equal(
        record.contentSha256,
        createHash('sha256').update(copy[id]).digest('hex'),
      );
    }
  }
  assert.equal(suggestions, 66);
  console.log(
    `${caseId} bounded conversational/API checks passed; all ${suggestions} suggested questions retrieve KB content. Only synthetic provider calls were used.`,
  );
} finally {
  if (previous === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = previous;
}
