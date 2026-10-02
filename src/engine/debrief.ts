import type { DebriefBlockId, SimResult } from './types';

/**
 * Picks which debrief blocks apply. Pure and content-agnostic: it returns block
 * ids; the UI renders the matching text. At most one of forcedExit /
 * survivedButHurt / userExitedEarly is chosen, plus the recovery-maths block.
 */
export function selectDebrief(leveraged: SimResult, unleveraged: SimResult, _prediction: string): DebriefBlockId[] {
  const blocks: DebriefBlockId[] = [];
  if (leveraged.final.outcome === 'forced_exit') blocks.push('forcedExit');
  else if (leveraged.final.outcome === 'user_exit') blocks.push('userExitedEarly');
  else blocks.push('survivedButHurt');
  if (unleveraged.final.outcome !== 'forced_exit') blocks.push('unleveragedSurvived');
  blocks.push('recoveryMaths');
  return blocks;
}
