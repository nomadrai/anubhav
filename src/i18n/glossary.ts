import type { Language } from '../config/languages';
import en from '../content/en/glossary.json';
import hi from '../content/hi/glossary.json';

export const glossaryTerms = (language: Language) =>
  (language === 'hi' ? hi : en).filter((term) => term.status !== 'planned');
