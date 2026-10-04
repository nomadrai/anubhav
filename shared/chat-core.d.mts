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
export type ConversationIntent = 'greeting' | 'thanks' | 'goodbye' | 'help';
export type ChatMode =
  | ConversationIntent
  | 'generated'
  | 'entry'
  | 'refusal'
  | 'unknown'
  | 'private'
  | 'limited'
  | 'unavailable'
  | 'disabled';
export interface ChatResult {
  mode: ChatMode;
  answer: string;
  entries: KnowledgeEntry[];
}
export function normalise(text: string): string;
export function tokens(text: string): string[];
export function conversationIntent(question: string): ConversationIntent | null;
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
