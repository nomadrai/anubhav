import { useEffect, useMemo, useRef, useState } from 'react';
import type { Episode } from '../data/episodes/episode.schema';
import { compareRuns, replayUnleveraged, runSimulation, type DebriefBlockId, type SimConfig, type SimResult } from '../engine';
import { selectDebrief } from '../engine/debrief';
import { PLAYBACK_MS_PER_BAR } from '../config/simulation';

export interface SimulationFinish {
  exitAtIndex?: number;
  leveragedRun: SimResult;
  unleveragedRun: SimResult;
  comparison: ReturnType<typeof compareRuns>;
  debriefBlocks: DebriefBlockId[];
}

/** Independent of the future forced-exit time, which the learner has not seen. */
export function decisionIndexes(totalBars: number): number[] {
  return [...new Set([0.25, 0.5, 0.75].map((fraction) => Math.round((totalBars - 1) * fraction)))]
    .filter((index) => index >= 1 && index < totalBars - 1);
}

interface Options {
  episode: Episode;
  capital: number;
  leverage: 1 | 2 | 5 | 10;
  config: SimConfig;
  onFinish: (result: SimulationFinish) => void;
}

/** Mount a fresh instance (or change the component key) for a new setup. */
export function useSimulationRun({ episode, capital, leverage, config, onFinish }: Options) {
  const [playedCount, setPlayedCount] = useState(1);
  const [exitAtIndex, setExitAtIndex] = useState<number>();
  const delivered = useRef(false);
  const run = useMemo(() => runSimulation({ series: episode.bars, capital, leverage, config, exitAtIndex }), [episode, capital, leverage, config, exitAtIndex]);
  const currentIndex = playedCount - 1;
  const finished = exitAtIndex !== undefined || playedCount >= run.timeline.length;
  const warningHere = run.events.some((event) => event.id === 'MARGIN_WARNING' && event.index === currentIndex);
  const decision = finished ? 'none' : warningHere ? 'warning' : decisionIndexes(episode.bars.length).includes(currentIndex) ? 'point' : 'none';
  const playing = !finished && decision === 'none';
  const rawCurrent = run.timeline[currentIndex];
  // The engine keeps raw close-equity for arithmetic. Display the settlement at closure.
  const current = rawCurrent && finished
    ? { ...rawCurrent, equity: run.final.equity, status: run.final.outcome === 'user_exit' ? 'exited' as const : rawCurrent.status }
    : rawCurrent;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setPlayedCount((count) => count + 1), PLAYBACK_MS_PER_BAR);
    return () => window.clearTimeout(timer);
  }, [playing, playedCount]);

  useEffect(() => {
    if (!finished || delivered.current) return;
    delivered.current = true;
    // Replay the full identical path at one-times exposure; a leveraged user exit does not shorten the contrast path.
    const unleveragedRun = replayUnleveraged(episode.bars, capital, config);
    onFinish({ exitAtIndex, leveragedRun: run, unleveragedRun, comparison: compareRuns(run, unleveragedRun), debriefBlocks: selectDebrief(run, unleveragedRun, '') });
  }, [finished, run, episode, capital, config, exitAtIndex, onFinish]);

  return {
    playedCount, current, playing, finished, decision,
    firedEvents: run.events.filter((event) => event.index <= currentIndex),
    hold: () => { if (decision !== 'none') setPlayedCount((count) => count + 1); },
    exitNow: () => { if (decision !== 'none') setExitAtIndex(currentIndex); },
  };
}
