// @vitest-environment jsdom
import { StrictMode, act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './JourneyExperience';
import { JourneyProvider } from './journey/JourneyContext';
import {
  PLAYBACK_MS_PER_BAR,
  DEFAULT_SIMULATION_CONFIG,
} from './config/simulation';
import { episodes } from './data/episodes';
import { decisionIndexes } from './journey/useSimulationRun';
import { runSimulation } from './engine';
import { formatRupees } from './i18n';
import { capabilities } from './config/capabilities';
import features from './content/en/features.json';

let container: ReturnType<typeof document.createElement>;
let root: Root;
const episode = episodes[0];
function button(label: string): HTMLButtonElement {
  const found = [...container.querySelectorAll('button')].find(
    (item) => item.textContent === label,
  );
  if (!found) throw new Error(`Missing button: ${label}`);
  return found;
}
function click(label: string) {
  act(() => button(label).click());
}
function tick() {
  act(() => vi.advanceTimersByTime(PLAYBACK_MS_PER_BAR));
}
function begin(leverage = '2 times') {
  click('English');
  click('Continue');
  click(leverage);
  click('Continue');
  expect(button('Continue').disabled).toBe(true);
  click('A small loss');
  click('Continue');
}
function firstDecision() {
  for (
    let index = 0;
    index < decisionIndexes(episode.bars.length)[0];
    index += 1
  )
    tick();
}
function finish() {
  for (let step = 0; step <= episode.bars.length + 8; step += 1) {
    if (
      [...container.querySelectorAll('button')].some(
        (item) => item.textContent === 'Compare without leverage',
      )
    )
      return;
    const resume = [...container.querySelectorAll('button')].find(
      (item) => item.textContent === 'Continue watching',
    );
    if (resume) click('Continue watching');
    else tick();
  }
  throw new Error('Run never completed');
}
function hiddenPeriod() {
  expect(container.innerHTML).not.toContain(episode.bars[0].date);
  expect(container.innerHTML).not.toContain(episode.provenance.sourceUrl);
  expect(container.innerHTML).not.toContain(episode.sourceLabel?.en);
}
function render() {
  act(() =>
    root.render(
      <StrictMode>
        <JourneyProvider>
          <App />
        </JourneyProvider>
      </StrictMode>,
    ),
  );
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  window.localStorage.clear();
  window.sessionStorage.clear();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  render();
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  capabilities.userDataLeavesDevice = false;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('protective learner journey', () => {
  it('uses the capability flag for privacy copy and keeps the toolbar directly reachable', () => {
    expect(container.querySelector('.app-footer')?.textContent).toContain(
      features.localNotice,
    );
    expect(container.textContent).not.toContain(features.reviewNotice);
    expect(container.querySelector('.text-size-control')).not.toBeNull();
    expect(container.querySelector('.preferences')).toBeNull();
    capabilities.userDataLeavesDevice = true;
    render();
    expect(container.querySelector('.app-footer')?.textContent).toContain(
      features.dataSentNotice,
    );
    expect(container.querySelector('.app-footer')?.textContent).not.toContain(
      features.localNotice,
    );
  });

  it('revisits setup without advancing playback and updates the live summary from configuration', () => {
    click('English');
    click('Continue');
    click('Continue');
    click('A small loss');
    click('Back');
    expect(container.querySelector('h1')?.textContent).toBe(
      features.setupTitle,
    );
    click('100%');
    click('10 times');
    expect(container.querySelector('.summary-tile')?.textContent).toContain(
      '₹1,00,000',
    );
    click('Continue');
    expect(container.querySelector('h1')?.textContent).toBe(
      'What do you think will happen?',
    );
    expect(button('Continue').disabled).toBe(true);
    expect(container.querySelector('.run-panel')).toBeNull();
  });
  it('pauses indefinitely, compares the identical full path, reveals afterwards and clears answers on restart', () => {
    begin();
    hiddenPeriod();
    firstDecision();
    expect(container.textContent).toContain('Decision point');
    const paused = container.innerHTML;
    act(() => vi.advanceTimersByTime(60_000));
    expect(container.innerHTML).toBe(paused);
    finish();
    hiddenPeriod();
    expect(container.textContent).toContain(
      'This position stayed open to the end.',
    );
    click('Compare without leverage');
    hiddenPeriod();
    const expected = runSimulation({
      series: episode.bars,
      capital: 2500,
      leverage: 1,
      config: DEFAULT_SIMULATION_CONFIG,
    });
    expect(container.textContent).toContain(
      formatRupees(expected.final.equity, 'en'),
    );
    expect(container.querySelectorAll('polyline')).toHaveLength(2);
    click('Reveal the episode');
    expect(container.textContent).toContain(episode.bars[0].date);
    expect(container.textContent).toContain(episode.sourceLabel?.en);
    expect(container.innerHTML).not.toContain(episode.provenance.sourceUrl);
    click('See the debrief');
    expect(container.querySelectorAll('.term-chips button')).toHaveLength(9);
    click('Leverage');
    expect(
      container.querySelector('.pane-interaction .glossary-card'),
    ).not.toBeNull();
    click('Close explanation');
    while (
      [...container.querySelectorAll('button')].some(
        (item) => item.textContent === 'Next lesson',
      )
    )
      click('Next lesson');
    expect(container.textContent).toContain('Recovery maths');
    click('Check your thinking again');
    expect(button('Continue').disabled).toBe(true);
    click('A big gain');
    expect(button('Continue').disabled).toBe(true);
    click('Not sure');
    click('Continue');
    const links = [...container.querySelectorAll('.resource-list a')];
    expect(links).toHaveLength(4);
    expect(
      links.every(
        (link) =>
          link.textContent &&
          link.getAttribute('rel') === 'noopener noreferrer',
      ),
    ).toBe(true);
    click("View this session's local summary");
    expect(container.querySelector('.pilot-summary')?.textContent).toContain(
      'A small loss',
    );
    expect(container.querySelector('.pilot-summary')?.textContent).toContain(
      'A big gain',
    );
    expect(Object.keys(window.localStorage)).toEqual(['learning.language']);
    expect(window.sessionStorage.length).toBe(0);
    click('Start again and clear answers');
    click('English');
    click('Continue');
    click('Continue');
    expect(button('Continue').disabled).toBe(true);
    expect(
      container.querySelector('.prediction-grid [aria-pressed="true"]'),
    ).toBeNull();
  });

  it('uses settlement for the forced-exit result and the exact last comparison point', () => {
    begin('10 times');
    finish();
    expect(container.textContent).toContain('₹625');
    expect(container.textContent).toContain('-75%');
    click('Compare without leverage');
    expect(container.textContent).toContain('₹625');
    expect(container.textContent).toContain('300%');
    const rows = [...container.querySelectorAll('tbody tr')];
    const leveraged = runSimulation({
      series: episode.bars,
      capital: 2500,
      leverage: 10,
      config: DEFAULT_SIMULATION_CONFIG,
    });
    expect(
      rows[leveraged.timeline.length - 1].querySelector('td')?.textContent,
    ).toBe('₹625');
    expect(rows.at(-1)?.querySelector('td')?.textContent).not.toBe('₹625');
    expect(rows).toHaveLength(episode.bars.length);
  });

  it('has a true manual pause and allows an early exit without truncating the one-times replay', () => {
    begin();
    click('Pause the path');
    const paused = container.innerHTML;
    act(() => vi.advanceTimersByTime(60_000));
    expect(container.innerHTML).toBe(paused);
    click('Resume the path');
    firstDecision();
    click('Exit now');
    const stopped = container.innerHTML;
    act(() => vi.advanceTimersByTime(60_000));
    expect(container.innerHTML).toBe(stopped);
    expect(container.textContent).toContain(
      'This position was closed by your choice.',
    );
    click('Compare without leverage');
    expect(container.querySelectorAll('tbody tr')).toHaveLength(
      episode.bars.length,
    );
  });

  it('does not restore a prediction after an application remount', () => {
    begin();
    act(() => root.unmount());
    root = createRoot(container);
    render();
    expect(container.querySelector('h1')?.textContent).toContain(
      'Learn with virtual money',
    );
    click('English');
    click('Continue');
    click('Continue');
    expect(button('Continue').disabled).toBe(true);
    expect(Object.keys(window.localStorage)).toEqual(['learning.language']);
  });
});
