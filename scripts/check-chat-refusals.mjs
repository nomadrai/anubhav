import assert from 'node:assert/strict';
import { handleChat } from '../server/chat.mjs';
const questions = [
  ['en', 'Which stock should I buy?'],
  ['en', 'Should I sell my shares?'],
  ['en', 'Should I hold this investment?'],
  ['en', 'Is this tip good?'],
  ['en', 'Will the market fall?'],
  ['hi', 'कौन सा शेयर खरीदूँ?'],
  ['hi', 'क्या मुझे अपने शेयर बेचने चाहिए?'],
  ['hi', 'क्या यह टिप सही है?'],
  ['hi', 'क्या बाज़ार कल गिरेगा?'],
  ['hi', 'Mujhe kaunsa stock kharidna chahiye?'],
];
let calls = 0;
const previous = process.env.GROQ_API_KEY;
process.env.GROQ_API_KEY = 'synthetic-refusal-check-not-a-credential';
try {
  for (let index = 0; index < questions.length; index++) {
    const [language, question] = questions[index];
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
        ip: `synthetic-${index}`,
        fetchImpl: async () => {
          calls++;
          throw new Error('Model must not be called');
        },
      },
    );
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.mode, 'refusal', `question ${index + 1}`);
    assert.ok(result.answer && result.entries.length > 0);
  }
  assert.equal(calls, 0);
  console.log(
    `${questions.length}/${questions.length} English/Hindi/Hinglish advice questions refused; ${calls} provider calls.`,
  );
} finally {
  if (previous === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = previous;
}
