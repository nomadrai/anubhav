import en from '../content/en/ui.json';
import hi from '../content/hi/ui.json';
import type { Language } from '../config/languages';
export const dictionaries = { en, hi } as const;
export type UiDictionary = typeof en;
export function t(language: Language, key: string): string {
  const value = key.split('.').reduce<unknown>((current, part) => (current as Record<string, unknown> | undefined)?.[part], dictionaries[language]);
  return typeof value === 'string' ? value : key;
}
export * from './format';
