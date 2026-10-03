import en from '../content/en/ui.json';
import hi from '../content/hi/ui.json';
import enFeatures from '../content/en/features.json';
import hiFeatures from '../content/hi/features.json';
import type { Language } from '../config/languages';
export const dictionaries = {
  en: { ...en, features: enFeatures },
  hi: { ...hi, features: hiFeatures },
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
