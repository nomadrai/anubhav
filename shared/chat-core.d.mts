export interface KnowledgeEntry {
  id: string;
  category: string;
  title_en: string;
  title_hi: string;
  aliases: string[];
  text_en: string;
  text_hi: string;
  related: string[];
  appears_in_steps: string[];
  sources: string[];
  status: string;
  lintAllow?: { pattern: string; reason: string }[];
}
export type ChatMode =
  | 'generated'
  | 'entry'
  | 'refusal'
  | 'unknown'
  | 'private'
  | 'limited'
  | 'disabled';
export interface ChatResult {
  mode: ChatMode;
  answer: string;
  entries: KnowledgeEntry[];
}
export function normalise(text: string): string;
export function tokens(text: string): string[];
export function adviceSeeking(question: string): boolean;
export function personalDetails(question: string): boolean;
export function retrieve(
  question: string,
  entries: KnowledgeEntry[],
  limit?: number,
): { entry: KnowledgeEntry; score: number; coverage: number }[];
export function relatedEntries(
  entries: KnowledgeEntry[],
  ids?: string[],
): KnowledgeEntry[];
export function entryText(entry: KnowledgeEntry, language: 'en' | 'hi'): string;
export function entryTitle(
  entry: KnowledgeEntry,
  language: 'en' | 'hi',
): string;
export function safeAnswer(
  answer: unknown,
  language: 'en' | 'hi',
  entries: KnowledgeEntry[],
): boolean;
export const MIN_RETRIEVAL_SCORE: number;
export const BANNED_PATTERNS: [string, RegExp][];
