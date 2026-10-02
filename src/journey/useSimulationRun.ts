import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Episode } from '../data/episodes/episode.schema';
import { compareRuns, replayUnleveraged, runSimulation, type DebriefBlockId, type SimConfig, type SimResult } from '../engine';
import { selectDebrief } from '../engine/debrief';
import { PLAYBACK_MS_PER_BAR } from '../config/simulation';

export interface SimulationRunState {
  playedCount: number;
  current: SimResult['timeline'][number] | undefined;
  playing: boolean;
  finished: boolean;
  decision: 'none' | 'point' | 'warning';
  firedEvents: SimResult['events'];
  hold: () => void;
  exitNow: () => void;
}

/** Decision pauses: 25/50/75% of bars, or earlier at the first MARGIN_WARNING. */
export function decisionIndexes(totalBars: number): number[] {
  return [0.25, 0.5, 0.75].map((fraction) => Math.round(totalBars * fraction)).filter((index) => index >= 1 && index < totalBars);
}

interface Options {
  episode: Episode;
  capital: number;
  leverage: 1 | 2 | 5 | 10;
  config: SimConfig;
  language: string;
  onFinish: (result: { exitAtIndex?: number; leveragedRun: SimResult; unleveragedRun: SimResult; comparison: ReturnType<typeof compareRuns>; debriefBlocks: DebriefBlockId[] }) => void;
}

export function useSimulationRun({ episode, capital, leverage, config, onFinish }: Options): SimulationRunState {
  const leveraged = useMemo(() => runSimulation({ series: episode.bars, capital, leverage, config }), [episode, capital, leverage, config]);
  const [playedCount, setPlayedCount] = useState(1);
  const [exited, setExited] = useState(false);
  const finishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const warnings = useMemo(() => new Set(leveraged.events.filter((event) => event.id === 'MARGIN_WARNING').map((event) => event.index)), [leveraged]);
  const pauses = useMemo(() => new Set(decisionIndexes(leveraged.timeline.length)), [leveraged]);

  const stopIndex = exited
    ? playedCount - 1
    : leveraged.final.outcome === 'forced_exit'
      ? (leveraged.final.forcedExitIndex ?? leveraged.timeline.length - 1)
      : leveraged.timeline.length - 1;

  useEffect(() => {
    setPlayedCount(1);
    setExited(false);
    finishedRef.current = false;
  }, [episode, capital, leverage]);

  useEffect(() => {
    if (exited) return;
    if (playedCount >= stopIndex + 1) return;
    const timer = window.setTimeout(() => setPlayedCount((count) => Math.min(count + 1, stopIndex + 1)), PLAYBACK_MS_PER_BAR);
    return () => window.clearTimeout(timer);
  }, [playedCount, stopIndex, exited]);

  const played = leveraged.timeline.slice(0, playedCount);
  const current = played[played.length - 1];
  const reachedEnd = playedCount >= stopIndex + 1;
  const warningHere = warnings.has(playedCount - 1);
  const decision: SimulationRunState['decision'] = reachedEnd || exited ? 'none' : warningHere ? 'warning' : pauses.has(playedCount - 1) ? 'point' : 'none';

  const finalize = useCallback((exitIndex: number | undefined) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const leveragedRun = exitIndex === undefined
      ? leveraged
      : runSimulation({ series: episode.bars, capital, leverage, config, exitAtIndex: exitIndex });
    const unleveragedRun = replayUnleveraged(episode.bars, capital, config);
    const comparison = compareRuns(leveragedRun, unleveragedRun);
    const debriefBlocks = selectDebrief(leveragedRun, unleveragedRun, '');
    onFinishRef.current({ exitAtIndex: exitIndex, leveragedRun, unleveragedRun, comparison, debriefBlocks });
  }, [leveraged, episode.bars, capital, leverage, config]);

  const hold = useCallback(() => {
    if (decision === 'none') return;
    const next = playedCount + 1;
    setPlayedCount(Math.min(next, stopIndex + 1));
  }, [decision, playedCount, stopIndex]);

  const exitNow = useCallback(() => {
    if (decision === 'none' || exited) return;
    setExited(true);
    finalize(playedCount - 1);
  }, [decision, exited, finalize, playedCount]);

  useEffect(() => {
    if (reachedEnd && !exited && !finishedRef.current) finalize(undefined);
  }, [reachedEnd, exited, finalize]);

  return { playedCount, current, playing: !reachedEnd && !exited, finished: reachedEnd || exited, decision, firedEvents: leveraged.events.filter((event) => event.index <= playedCount - 1), hold, exitNow };
}
