// Explicitly invoked only: uses the local server key for one general learning
// question (semantic selection + grounded explanation). No credentials or
// provider text/metadata are printed or persisted.
import assert from 'node:assert/strict';
import { chatPlugin } from '../server/vite-chat.mjs';
import { handleChat } from '../server/chat.mjs';
import { retrieve } from '../shared/chat-core.mjs';
import { KB_CATEGORIES } from '../shared/chat-config.mjs';

chatPlugin().configureServer({
  config: { mode: 'development', envDir: process.cwd() },
  middlewares: { use() {} },
});
if (!process.env.GROQ_API_KEY) {
  console.error('Live RAG check: no server key loaded from the environment or .env.local.');
  process.exit(1);
}
const knowledge = (
  await Promise.all(
    KB_CATEGORIES.map((category) =>
      import(`../knowledge/${category}.json`, { with: { type: 'json' } }),
    ),
  )
).flatMap((module) => module.default);
let providerCalls = 0;
const statuses = [];
const ask = async (question, ip) => {
  const response = await handleChat(
    new globalThis.Request('https://example.invalid/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, language: 'en' }),
    }),
    {
      ip,
      fetchImpl: async (url, options) => {
        providerCalls++;
        const response = await globalThis.fetch(url, options);
        statuses.push(response.status);
        return response;
      },
    },
  );
  assert.equal(response.status, 200);
  return response.json();
};

try {
  const local = await ask('What is leverage?', 'explicit-live-local');
  assert.equal(local.mode, 'entry');
  assert.equal(providerCalls, 0);
  const question =
    'Could you explain why amplifying a practice position makes a dip hurt much more?';
  assert.equal(retrieve(question, knowledge).length, 0);
  const result = await ask(question, 'explicit-live-semantic');
  console.log(
    `Live Groq check: ${providerCalls} provider calls; HTTP ${statuses.join(', ') || 'no response'}; final mode ${result.mode}.`,
  );
  assert.equal(providerCalls, 2);
  assert.ok(statuses.every((status) => status === 200));
  assert.ok(['generated', 'entry'].includes(result.mode));
  assert.ok(result.answer.trim() && result.entries.length > 0);
  console.log('Real-key semantic RAG answered a keyword miss; a keyword match made zero provider calls.');
} catch {
  console.error('Live RAG verification failed. The key and provider response were not printed.');
  process.exitCode = 1;
}
