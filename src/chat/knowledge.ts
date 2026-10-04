import { KB_CATEGORIES } from '../../shared/chat-config.mjs';
import type { KnowledgeEntry } from '../../shared/chat-core.mjs';
// Cache only public library content in memory. No questions or answers enter this module.
let library: Promise<KnowledgeEntry[]> | undefined;
export function loadKnowledge(): Promise<KnowledgeEntry[]> {
  if (!library)
    library = Promise.all(
      KB_CATEGORIES.map(async (category) => {
        const response = await globalThis.fetch(`/knowledge/${category}.json`, {
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
        });
        if (!response.ok) throw new Error('library');
        const entries: KnowledgeEntry[] = await response.json();
        if (
          !Array.isArray(entries) ||
          entries.some(
            (entry) =>
              entry.category !== category || entry.status !== 'agent-checked',
          )
        )
          throw new Error('library');
        return entries;
      }),
    )
      .then((parts) => parts.flat())
      .catch((error) => {
        library = undefined;
        throw error;
      });
  return library;
}
