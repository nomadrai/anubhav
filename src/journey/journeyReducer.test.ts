import { describe, expect, it } from 'vitest';
import { initialJourneyState, journeyReducer, type JourneyState } from './journeyReducer';

const runResult = (equity: number): JourneyState['leveragedRun'] => ({
  timeline: [],
  events: [],
  capital: 10_000,
  final: { equity, pnl: equity - 10_000, pnlPct: equity / 10_000 - 1, outcome: 'ran_to_end' },
  intradayAvailable: false,
  maxDrawdown: 0,
  worstSingleDayFall: 0,
  downCloses: 0,
});

describe('journey steps', () => {
  it('can move from language choice through every step', () => {
    let state = journeyReducer(initialJourneyState, { type: 'chooseLanguage', language: 'hi' });
    for (let index = 0; index < 10; index += 1) state = journeyReducer(state, { type: 'next' });
    expect(state.step).toBe('NextSteps');
    expect(state.language).toBe('hi');
  });
  it('keeps language choice independent for English', () => {
    const state = journeyReducer(initialJourneyState, { type: 'chooseLanguage', language: 'en' });
    expect(state.step).toBe('Intro');
    expect(state.language).toBe('en');
  });
  it('setup stores stake and leverage', () => {
    let state = journeyReducer(initialJourneyState, { type: 'chooseLanguage', language: 'en' });
    state = journeyReducer(state, { type: 'next' });
    state = journeyReducer(state, { type: 'setup', stake: 50, leverage: 5 });
    expect(state.stake).toBe(50);
    expect(state.leverage).toBe(5);
  });
  it('recordRun stores runs and comparison, and setup clears them again', () => {
    let state = journeyReducer(initialJourneyState, { type: 'chooseLanguage', language: 'en' });
    state = journeyReducer(state, { type: 'setup', stake: 100, leverage: 10 });
    state = journeyReducer(state, {
      type: 'recordRun',
      exitAtIndex: 2,
      leveragedRun: runResult(7_000) as NonNullable<JourneyState['leveragedRun']>,
      unleveragedRun: runResult(9_400) as NonNullable<JourneyState['leveragedRun']>,
      comparison: { leveragedFinalEquity: 7_000, unleveragedFinalEquity: 9_400, difference: -2_400, requiredRecoveryGain: 0.4285714 },
      debriefBlocks: ['userExitedEarly', 'unleveragedSurvived', 'recoveryMaths'],
    });
    expect(state.step).toBe('Result');
    expect(state.exitAtIndex).toBe(2);
    expect(state.comparison?.difference).toBe(-2_400);
    expect(state.debriefBlocks).toContain('recoveryMaths');
    state = journeyReducer(state, { type: 'setup', stake: 25, leverage: 2 });
    expect(state.leveragedRun).toBeUndefined();
    expect(state.exitAtIndex).toBeUndefined();
  });
});
