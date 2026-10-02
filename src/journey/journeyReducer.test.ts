import { describe, expect, it } from 'vitest';
import { initialJourneyState, journeyReducer } from './journeyReducer';

describe('Phase 0 journey', () => {
  it('can move from language choice through every stub step', () => {
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
});
