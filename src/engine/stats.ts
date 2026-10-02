import type { Bar } from './types';
export interface PathStats { maxDrawdown: number; barCount: number; totalChange: number; worstSingleDayFall: number; }
/** Phase 0 shape only; episode preparation computes these in Python for now. */
export function calculateStats(_series: Bar[]): PathStats { throw new Error('Stats implementation is scheduled for Phase 1.'); }
