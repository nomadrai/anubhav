export type ContentStatus = 'draft' | 'agent-checked' | 'reviewed' | 'planned';

/** Every user-facing leaf is tied to its exact UTF-8 text, not just its key.
 * Dictionary keys use dotted paths; entry keys use <id>.<field>.
 * resources.json keys use <resource-id>.label in each language.
 */
export interface DictionaryLeafReview {
  status: Exclude<ContentStatus, 'planned'>;
  contentSha256: string;
}

export interface DictionaryReviewRegistry {
  schemaVersion: 1;
  languages: Record<'en' | 'hi', Record<string, Record<string, DictionaryLeafReview>>>;
}

/** Every spoken-capable entry keeps visual copy separate from speech copy. */
export interface SpokenContent { displayText: string; spokenText: string; }

export interface NarrationEntry extends SpokenContent {
  id: string;
  trigger: string;
  status: ContentStatus;
}

/** `displayText` is the visible term label; short and analogy are visible card copy. */
export interface GlossaryEntry extends SpokenContent {
  termId: string;
  term: string;
  short: string;
  analogy: string;
  status: ContentStatus;
}

export interface Resource { id: string; labelKey: string; url: string; kind: string; verified: boolean; checkedOn: string; }
