import type { SimEventId } from './types';

/**
 * Every event fires at most once per run, in bar order, using the global
 * precedence in simulate.ts (MARGIN_WARNING before FORCED_EXIT on one bar).
 */
export const EVENT_IDS: readonly SimEventId[] = ['ENTRY', 'DRAWDOWN_5', 'DRAWDOWN_10', 'DRAWDOWN_20', 'MARGIN_WARNING', 'FORCED_EXIT', 'USER_EXIT', 'EPISODE_END', 'UNLEVERAGED_SURVIVED'];
