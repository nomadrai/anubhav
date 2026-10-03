// @vitest-environment jsdom
import { StrictMode, act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { JourneyProvider } from './journey/JourneyContext';
import { PLAYBACK_MS_PER_BAR } from './config/simulation';

// eslint-disable-next-line no-undef
let container: HTMLDivElement;
let root: Root;

function button(label: string): HTMLButtonElement {
  const found = [...container.querySelectorAll('button')].find((item) => item.textContent === label);
  if (!found) throw new Error(`Missing button: ${label}`);
  return found;
}
function click(label: string) { act(() => button(label).click()); }
function tick() { act(() => vi.advanceTimersByTime(PLAYBACK_MS_PER_BAR)); }
function begin(leverage = '2 times') {
  click('English'); click('Continue'); click(leverage); click('Continue');
  expect(button('Continue').disabled).toBe(true);
  click('A small loss'); click('Continue');
}
function finish() {
  for (let step = 0; step < 40; step += 1) {
    const result = [...container.querySelectorAll('button')].find((item) => item.textContent === 'Compare without leverage' && !item.disabled);
    if (result) return;
    const resume = [...container.querySelectorAll('button')].find((item) => item.textContent === 'Continue watching');
    if (resume) click('Continue watching'); else tick();
  }
  throw new Error('Run never completed');
}
function hiddenPeriod() {
  expect(container.innerHTML).not.toContain('2024-01');
  expect(container.innerHTML).not.toContain('synthetic://');
}

beforeEach(() => {
  vi.useFakeTimers();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(<StrictMode><JourneyProvider><App /></JourneyProvider></StrictMode>));
});
afterEach(() => { act(() => root.unmount()); container.remove(); vi.useRealTimers(); vi.restoreAllMocks(); });

describe('Phase 2 learner journey', () => {
  it('pauses indefinitely, finishes, compares, reveals only afterwards, and clears answers on restart', () => {
    begin(); hiddenPeriod();
    for (let step = 0; step < 3; step += 1) tick();
    expect(container.textContent).toContain('Decision point');
    const paused = container.innerHTML;
    act(() => vi.advanceTimersByTime(60_000));
    expect(container.innerHTML).toBe(paused);
    finish(); hiddenPeriod();
    expect(container.textContent).toContain('This position stayed open to the end.');
    hiddenPeriod(); click('Compare without leverage'); hiddenPeriod();
    expect(container.querySelectorAll('polyline').length).toBe(2);
    click('Reveal the episode');
    expect(container.textContent).toContain('2024-01-02');
    expect(container.textContent).toContain('synthetic://');
    click('See the debrief');
    expect(container.textContent).toContain('Recovery maths');
    click('Check your thinking again');
    expect(button('Continue').disabled).toBe(true);
    click('A small loss'); click('Not sure'); click('Continue');
    expect(container.querySelectorAll('a').length).toBe(0);
    click('Start again'); click('English'); click('Continue'); click('Continue');
    expect(button('Continue').disabled).toBe(true);
    expect(container.querySelector('[aria-pressed="true"]')).toBeNull();
  });

  it('uses the teaching settlement for forced-exit amounts and the comparison line', () => {
    begin('10 times'); finish();
    expect(container.textContent).toContain('₹625');
    expect(container.textContent).toContain('₹625');
    expect(container.textContent).toContain('-75%');
    click('Compare without leverage');
    expect(container.textContent).toContain('₹625');
    expect(container.textContent).toContain('300%');
  });

  it('lets the learner exit at a pause and does not advance a stopped run', () => {
    begin();
    for (let step = 0; step < 3; step += 1) tick();
    click('Exit now');
    const stopped = container.innerHTML;
    act(() => vi.advanceTimersByTime(60_000));
    expect(container.innerHTML).toBe(stopped);
    expect(container.textContent).toContain('This position was closed by your choice.');
  });
});
