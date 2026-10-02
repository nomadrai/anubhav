import { recoveryGainFraction } from './position';
import { runSimulation } from './simulate';
import type { Bar, RunComparison, SimConfig, SimResult } from './types';

/**
 * Replays the same run with leverage 1 on the identical series object, so the
 * contrast is attributable to exposure alone, not to a different path.
 */
export function replayUnleveraged(series: Bar[], capital: number, config: SimConfig): SimResult {
  return runSimulation({ series, capital, leverage: 1, config });
}

/**
 * Final-equity contrast of the two runs plus the leveraged run's required
 * recovery gain: the gain needed to return to *starting capital*, computed from
 * the leveraged run's own loss fraction (null when none applies).
 */
export function compareRuns(leveraged: SimResult, unleveraged: SimResult): RunComparison {
  const leveragedFinalEquity = leveraged.final.equity;
  const unleveragedFinalEquity = unleveraged.final.equity;
  const lossFraction = 1 - leveraged.final.equity / leveraged.capital;
  const requiredRecoveryGain = recoveryGainFraction(lossFraction);
  return {
    leveragedFinalEquity,
    unleveragedFinalEquity,
    difference: leveragedFinalEquity - unleveragedFinalEquity,
    requiredRecoveryGain: lossFraction <= 0 ? null : requiredRecoveryGain,
  };
}
