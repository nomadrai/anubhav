import en from '../content/en/ui.json';
import hi from '../content/hi/ui.json';
import enFeatures from '../content/en/features.json';
import hiFeatures from '../content/hi/features.json';
import enChat from '../content/en/chat.json';
import hiChat from '../content/hi/chat.json';
import type { Language } from '../config/languages';
export const dictionaries = {
  en: { ...en, features: enFeatures, chat: enChat },
  hi: { ...hi, features: hiFeatures, chat: hiChat },
} as const;
export type UiDictionary = typeof en;
export function t(language: Language, key: string): string {
  const value = key
    .split('.')
    .reduce<unknown>(
      (current, part) =>
        (current as Record<string, unknown> | undefined)?.[part],
      dictionaries[language],
    );
  return typeof value === 'string' ? value : key;
}
export * from './format';
