import type { Language } from '../config/languages';
import type { DebriefBlockId, RunComparison, SimResult } from '../engine/types';
import { JOURNEY_STEPS, type JourneyStep } from './steps';

export interface JourneyState {
  step: JourneyStep;
  language?: Language;
  prediction?: string;
  postPrediction?: string;
  wouldTake?: string;
  stake?: number;
  leverage?: 1 | 2 | 5 | 10;
  exitAtIndex?: number;
  leveragedRun?: SimResult;
  unleveragedRun?: SimResult;
  comparison?: RunComparison;
  debriefBlocks?: DebriefBlockId[];
}

export type JourneyAction =
  | { type: 'chooseLanguage'; language: Language }
  | { type: 'next' }
  | { type: 'restart' }
  | { type: 'answer'; field: 'prediction' | 'postPrediction' | 'wouldTake'; value: string }
  | { type: 'setup'; stake: number; leverage: 1 | 2 | 5 | 10 }
  | { type: 'recordRun'; exitAtIndex?: number; leveragedRun: SimResult; unleveragedRun: SimResult; comparison: RunComparison; debriefBlocks: DebriefBlockId[] };

export const initialJourneyState: JourneyState = { step: 'LanguageSelect' };

export function journeyReducer(state: JourneyState, action: JourneyAction): JourneyState {
  switch (action.type) {
    case 'chooseLanguage': return { ...state, language: action.language, step: 'Intro' };
    case 'next': {
      const index = JOURNEY_STEPS.indexOf(state.step);
      return index < JOURNEY_STEPS.length - 1 ? { ...state, step: JOURNEY_STEPS[index + 1] } : state;
    }
    case 'restart': return initialJourneyState;
    case 'answer': return { ...state, [action.field]: action.value };
    case 'setup': return { ...state, stake: action.stake, leverage: action.leverage, exitAtIndex: undefined, leveragedRun: undefined, unleveragedRun: undefined, comparison: undefined, debriefBlocks: undefined };
    case 'recordRun':
      return {
        ...state,
        exitAtIndex: action.exitAtIndex,
        leveragedRun: action.leveragedRun,
        unleveragedRun: action.unleveragedRun,
        comparison: action.comparison,
        debriefBlocks: action.debriefBlocks,
      };
  }
}
