import { useMemo } from 'react';
import type { Language } from '../config/languages';
import { AudioManager } from './AudioManager';
export function useNarration(language: Language) { return useMemo(() => new AudioManager(language), [language]); }
