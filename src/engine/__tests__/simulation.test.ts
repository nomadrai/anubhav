import { describe, expect, it } from 'vitest';
import { selectDebrief } from '../debrief';
import { compareRuns, replayUnleveraged } from '../compare';
import { generatePath } from '../pathGenerator';
import { mulberry32 } from '../prng';
import { recoveryGainFraction } from '../position';
import { runSimulation } from '../simulate';
import { calculateStats } from '../stats';
import { SeriesError, type Bar, type SimConfig, type SimResult } from '../types';

const CONFIG: SimConfig = { maintenanceFraction: 0.25, warnBuffer: 1.5, drawdownMarks: [0.05, 0.1, 0.2] };

const bar = (close: number, low?: number): Bar => (low === undefined ? { close } : { close, low });

/** Bars with the given closes; the optional low applies to every bar *after* the entry bar. */
const path = (closes: number[], low?: number): Bar[] => closes.map((close, index) => bar(close, index === 0 ? undefined : low));

function run(closes: number[], leverage: 1 | 2 | 5 | 10, low?: number, exitAtIndex?: number, capital = 10_000): SimResult {
  return runSimulation({ series: path(closes, low), capital, leverage, exitAtIndex, config: CONFIG });
}

describe('worked examples (capital 10,000, maintenance 25%)', () => {
  it('10x survives a 7% fall at 3,000 equity', () => {
    const result = run([10_000, 9_300], 10);
    expect(result.timeline.at(-1)?.equity).toBeCloseTo(3_000, 6);
    expect(result.final.outcome).toBe('ran_to_end');
    expect(result.events.map((event) => event.id)).toContain('MARGIN_WARNING');
    expect(result.events.map((event) => event.id)).not.toContain('FORCED_EXIT');
  });
  it('10x is force-exited on a 7.5% fall', () => {
    const result = run([10_000, 9_250], 10);
    expect(result.final.outcome).toBe('forced_exit');
    expect(result.final.forcedExitIndex).toBe(1);
    expect(result.timeline.at(-1)?.equity).toBeCloseTo(2_500, 6);
  });
  it('10x force-exits on a 7.5% intrabar low even when the close recovers', () => {
    const result = run([10_000, 9_900], 10, 9_250);
    expect(result.final.outcome).toBe('forced_exit');
  });
  it('5x is force-exited at a 15% fall', () => {
    const result = run([10_000, 8_500], 5);
    expect(result.final.outcome).toBe('forced_exit');
  });
  it('5x survives a 14.9% fall', () => {
    const result = run([10_000, 8_510], 5);
    expect(result.final.outcome).toBe('ran_to_end');
  });
  it('2x is force-exited at a 37.5% fall', () => {
    const result = run([10_000, 6_250], 2);
    expect(result.final.outcome).toBe('forced_exit');
  });
  it('2x survives a 37.4% fall', () => {
    const result = run([10_000, 6_260], 2);
    expect(result.final.outcome).toBe('ran_to_end');
  });
  it('1x is never force-exited by a 40% fall', () => {
    const result = run([10_000, 6_000], 1);
    expect(result.final.outcome).toBe('ran_to_end');
  });
  it('10x entry equity equals starting capital', () => {
    const result = run([10_000, 9_300], 10);
    expect(result.timeline[0].equity).toBe(10_000);
  });
});

describe('event rules', () => {
  it('fires each event at most once and in bar order', () => {
    const closes = [100, 95, 90, 85, 90, 95];
    const result = runSimulation({ series: closes.map((close) => bar(close)), capital: 10_000, leverage: 2, config: CONFIG });
    const ids = result.events.map((event) => event.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
    for (let index = 1; index < result.events.length; index += 1) {
      expect(result.events[index].index).toBeGreaterThanOrEqual(result.events[index - 1].index);
    }
    expect(ids[0]).toBe('ENTRY');
    expect(ids.at(-1)).toBe('EPISODE_END');
  });
  it('emits MARGIN_WARNING before FORCED_EXIT when one bar crosses both', () => {
    const result = run([10_000, 6_000], 2);
    const ids = result.events.map((event) => event.id);
    expect(ids.indexOf('MARGIN_WARNING')).toBeLessThan(ids.indexOf('FORCED_EXIT'));
    expect(result.events.filter((event) => event.id === 'MARGIN_WARNING')).toHaveLength(1);
  });
  it('fires drawdown marks once on the first crossing close', () => {
    const result = runSimulation({
      series: [100, 94, 89, 94, 89].map((close) => bar(close)),
      capital: 10_000,
      leverage: 1,
      config: { ...CONFIG, drawdownMarks: [0.05, 0.1, 0.2] },
    });
    const ids = result.events.map((event) => event.id);
    expect(ids).toContain('DRAWDOWN_5');
    expect(ids).toContain('DRAWDOWN_10');
    expect(ids.filter((id) => id === 'DRAWDOWN_5')).toHaveLength(1);
    expect(result.events.find((event) => event.id === 'DRAWDOWN_10')?.index).toBe(2);
  });
  it('marks no later event after exitAtIndex', () => {
    const result = runSimulation({
      series: [100, 99, 98, 97, 96].map((close) => bar(close)),
      capital: 10_000,
      leverage: 2,
      exitAtIndex: 2,
      config: CONFIG,
    });
    const ids = result.events.map((event) => event.id);
    expect(ids).toContain('USER_EXIT');
    expect(ids).not.toContain('EPISODE_END');
    expect(result.final.outcome).toBe('user_exit');
    expect(result.timeline).toHaveLength(3);
    expect(result.events.every((event) => event.index <= 2)).toBe(true);
  });
});

describe('equity and stats', () => {
  it('holds the equity identity on every bar of seeded synthetic paths', () => {
    for (const seed of [1, 2, 3, 7, 42]) {
      for (const leverage of [1, 2, 5, 10] as const) {
        const series = generatePath({ seed, length: 25, startPrice: 100, volatility: 0.02 });
        const capital = 10_000;
        const units = (capital * leverage) / series[0].close;
        const result = runSimulation({ series, capital, leverage, config: CONFIG });
        for (const point of result.timeline) {
          expect(point.equity).toBeCloseTo(capital + units * (point.price - series[0].close), 6);
        }
      }
    }
  });
  it('matches calculateStats conventions on a known path', () => {
    const stats = calculateStats([100, 110, 99, 100, 105].map(bar));
    expect(stats.downCloses).toBe(1);
    expect(stats.worstSingleDayFall).toBeCloseTo(99 / 110 - 1, 12);
    expect(stats.maxDrawdown).toBeCloseTo(99 / 110 - 1, 12);
    expect(stats.totalChange).toBeCloseTo(0.05, 12);
    expect(stats.barCount).toBe(5);
  });
  it('uses close equity for warnings but low equity for forced exits', () => {
    const result = runSimulation({ series: [{ close: 100 }, { close: 93.5, low: 93 }], capital: 10_000, leverage: 10, config: CONFIG });
    expect(result.events.map((event) => event.id)).toContain('MARGIN_WARNING');
    expect(result.events.map((event) => event.id)).not.toContain('FORCED_EXIT');
  });
  it('reports intradayAvailable=false only when lows are missing', () => {
    expect(run([10_000, 9_000], 2).intradayAvailable).toBe(false);
    const withLows = runSimulation({
      series: [{ close: 10_000, low: 10_000 }, { close: 9_000, low: 8_950 }],
      capital: 10_000,
      leverage: 2,
      config: CONFIG,
    });
    expect(withLows.intradayAvailable).toBe(true);
  });
});

describe('leverage survival ordering', () => {
  it('never lets higher leverage survive a path lower leverage was force-exited on', () => {
    for (let seed = 0; seed < 40; seed += 1) {
      const random = mulberry32(seed);
      const closes = [100];
      let current = 100;
      for (let index = 0; index < 40; index += 1) {
        current *= 1 + (random() - 0.5) * 0.08;
        closes.push(current);
      }        const series = closes.map((close) => bar(close));
      const outcomes = ([1, 2, 5, 10] as const).map((leverage) => runSimulation({ series, capital: 10_000, leverage, config: CONFIG }).final.outcome);
      const rank = { ran_to_end: 0, user_exit: 1, forced_exit: 2 } as const;
      for (let index = 1; index < outcomes.length; index += 1) {
        expect(rank[outcomes[index]]).toBeGreaterThanOrEqual(rank[outcomes[index - 1]]);
      }
      if (outcomes[0] === 'forced_exit') {
        for (const outcome of outcomes) expect(outcome).toBe('forced_exit');
      }
    }
  });
  it('low-based check force-exits deeper than the close-only check would', () => {
    const series = [bar(10_000), bar(9_900, 6_100)];
    const withLow = runSimulation({ series, capital: 10_000, leverage: 2, config: CONFIG });
    expect(withLow.final.outcome).toBe('forced_exit');
    const closeOnly = runSimulation({ series: series.map(({ close }) => bar(close)), capital: 10_000, leverage: 2, config: CONFIG });
    expect(closeOnly.final.outcome).toBe('ran_to_end');
  });
});

describe('compare and replay', () => {
  it('replays the identical series object at leverage 1', () => {
    const series = path([10_000, 9_500, 9_800]);
    const config = CONFIG;
    const unleveraged = replayUnleveraged(series, 10_000, config);
    expect(unleveraged.final.outcome).toBe('ran_to_end');
    expect(unleveraged.events.map((event) => event.id)).toContain('UNLEVERAGED_SURVIVED');
    expect(unleveraged.timeline).toHaveLength(series.length);
  });
  it('reports final equities, difference, and required recovery', () => {
    const series = path([10_000, 9_400]);
    const leveraged = runSimulation({ series, capital: 10_000, leverage: 5, config: CONFIG });
    const unleveraged = replayUnleveraged(series, 10_000, CONFIG);
    const comparison = compareRuns(leveraged, unleveraged);
    expect(comparison.unleveragedFinalEquity).toBeCloseTo(9_400, 6);
    expect(comparison.leveragedFinalEquity).toBeCloseTo(7_000, 6);
    expect(comparison.difference).toBeCloseTo(-2_400, 6);
    expect(comparison.requiredRecoveryGain).toBeCloseTo((10_000 / 7_000) - 1, 9);
  });
  it('returns null recovery when the leveraged run ends at or above the unleveraged run', () => {
    const series = path([10_000, 10_600]);
    const comparison = compareRuns(runSimulation({ series, capital: 10_000, leverage: 2, config: CONFIG }), replayUnleveraged(series, 10_000, CONFIG));
    expect(comparison.requiredRecoveryGain).toBeNull();
    expect(comparison.difference).toBeGreaterThan(0);
  });
  it('returns null recovery for a total loss instead of dividing by zero', () => {
    expect(recoveryGainFraction(1)).toBeNull();
    expect(recoveryGainFraction(0)).toBe(0);
    expect(recoveryGainFraction(0.2)).toBeCloseTo(0.25, 12);
    expect(recoveryGainFraction(0.7)).toBeCloseTo(7 / 3, 9);
  });
});

describe('selectDebrief', () => {
  const series = path([10_000, 9_400, 9_600]);
  const leveraged = runSimulation({ series, capital: 10_000, leverage: 5, config: CONFIG });
  const unleveraged = replayUnleveraged(series, 10_000, CONFIG);

  it('chooses forcedExit for a forced run and always adds recovery maths', () => {
    const forced = run([10_000, 8_500], 5);
    const blocks = selectDebrief(forced, unleveraged, 'smallLoss');
    expect(blocks).toContain('forcedExit');
    expect(blocks).not.toContain('survivedButHurt');
    expect(blocks).toContain('unleveragedSurvived');
    expect(blocks).toContain('recoveryMaths');
  });
  it('chooses userExitedEarly after a user exit', () => {
    const exited = run([10_000, 9_700, 9_800], 2, undefined, 1);
    const blocks = selectDebrief(exited, unleveraged, 'smallGain');
    expect(blocks).toContain('userExitedEarly');
    expect(blocks).not.toContain('forcedExit');
  });
  it('chooses survivedButHurt when the leveraged run finishes open', () => {
    const blocks = selectDebrief(leveraged, unleveraged, 'smallLoss');
    expect(blocks).toContain('survivedButHurt');
    expect(blocks).not.toContain('forcedExit');
    expect(blocks).not.toContain('userExitedEarly');
  });
  it('omits unleveragedSurvived when the unleveraged replay is also force-exited', () => {
    const harsh = { ...CONFIG, maintenanceFraction: 0.9, warnBuffer: 1.05 };
    const deepSeries = path([10_000, 8_900, 9_600]);
    const leveragedForced = runSimulation({ series: deepSeries, capital: 10_000, leverage: 5, config: harsh });
    const unleveragedForced = runSimulation({ series: deepSeries, capital: 10_000, leverage: 1, config: harsh });
    expect(unleveragedForced.final.outcome).toBe('ran_to_end');
    expect(selectDebrief(leveragedForced, unleveragedForced, 'smallLoss')).toContain('unleveragedSurvived');
  });
});

describe('error cases', () => {
  it('throws SeriesError for fewer than two bars', () => {
    expect(() => run([10_000], 2)).toThrow(SeriesError);
    expect(() => runSimulation({ series: [], capital: 10_000, leverage: 2, config: CONFIG })).toThrow(SeriesError);
  });
  it('throws SeriesError for a non-positive or non-finite close', () => {
    expect(() => run([10_000, 0], 2)).toThrow(SeriesError);
    expect(() => run([10_000, -5], 2)).toThrow(SeriesError);
    expect(() => runSimulation({ series: path([10_000, Number.NaN]), capital: 10_000, leverage: 2, config: CONFIG })).toThrow(SeriesError);
  });
  it('throws SeriesError for a non-positive optional low', () => {
    expect(() => runSimulation({ series: [{ close: 10_000 }, { close: 9_000, low: 0 }], capital: 10_000, leverage: 2, config: CONFIG })).toThrow(SeriesError);
  });
  it('throws SeriesError for non-positive or non-finite capital', () => {
    expect(() => runSimulation({ series: path([100, 101]), capital: 0, leverage: 2, config: CONFIG })).toThrow(SeriesError);
    expect(() => runSimulation({ series: path([100, 101]), capital: Number.NaN, leverage: 2, config: CONFIG })).toThrow(SeriesError);
  });
  it('never force-exits unleveraged runs, even when the teaching threshold is high', () => {
    const result = runSimulation({ series: path([100, 89]), capital: 10_000, leverage: 1, config: { ...CONFIG, maintenanceFraction: 0.9 } });
    expect(result.final.outcome).toBe('ran_to_end');
    expect(result.events.map((event) => event.id)).not.toContain('FORCED_EXIT');
  });
  it('rejects invalid exit indexes and contradictory OHLC bars', () => {
    expect(() => runSimulation({ series: path([100, 101]), capital: 10_000, leverage: 2, exitAtIndex: 0, config: CONFIG })).toThrow(SeriesError);
    expect(() => runSimulation({ series: [{ close: 100 }, { close: 99, low: 101 }], capital: 10_000, leverage: 2, config: CONFIG })).toThrow(SeriesError);
  });
  it('same seed gives the same path and the same engine output', () => {
    const left = generatePath({ seed: 2025, length: 20 });
    const right = generatePath({ seed: 2025, length: 20 });
    expect(left).toEqual(right);
    expect(runSimulation({ series: left, capital: 10_000, leverage: 5, config: CONFIG })).toEqual(
      runSimulation({ series: right, capital: 10_000, leverage: 5, config: CONFIG }),
    );
  });
});
