import { useState } from 'react';
import type { JourneyState } from '../journey/journeyReducer';
import {
  JourneyFrame,
  type JourneyFrameProps,
} from '../components/JourneyFrame';
import { BigButton } from '../components/BigButton';
import { CompareChart } from '../components/CompareChart';
import { GlossaryCard } from '../components/GlossaryCard';
import { glossaryTerms } from '../i18n/glossary';
import { displayEquity } from '../journey/displayEquity';
import {
  formatNumber,
  formatPercent,
  formatRupees,
  interpolate,
  t,
} from '../i18n';

export function DebriefLessons({
  frame,
  state,
  onContinue,
}: {
  frame: Omit<JourneyFrameProps, 'children'>;
  state: JourneyState;
  onContinue: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [termId, setTermId] = useState<string>();
  const { language } = frame;
  const text = (key: string) => t(language, key);
  const blocks = state.debriefBlocks ?? [];
  const block = blocks[index];
  const run = state.leveragedRun;
  const unleveraged = state.unleveragedRun;
  if (!block || !run || !unleveraged) return null;
  const lessonBody =
    block === 'recoveryMaths'
      ? state.comparison?.requiredRecoveryGain === null
        ? text('debrief.recoveryNone')
        : interpolate(text('debrief.recoveryInterpolated'), {
            finalAmount: formatRupees(run.final.equity, language),
            startAmount: formatRupees(run.capital, language),
            gain: formatPercent(
              state.comparison?.requiredRecoveryGain ?? 0,
              language,
            ),
          })
      : text(`debrief.${block}Body`);
  return (
    <JourneyFrame
      {...frame}
      focusKey={`lesson-${index}`}
      reading={
        <>
          <div
            className="lesson-navigation"
            aria-label={text('features.lessonProgress')
              .replace('{current}', formatNumber(index + 1, language))
              .replace('{total}', formatNumber(blocks.length, language))}
          >
            {blocks.map((item, n) => (
              <button
                key={item}
                className="lesson-dot"
                aria-label={text(`debrief.${item}`)}
                aria-pressed={n === index}
                onClick={() => {
                  setIndex(n);
                  setTermId(undefined);
                }}
              >
                <span aria-hidden="true" />
              </button>
            ))}
            <span className="quiet">
              {interpolate(text('features.lessonProgress'), {
                current: formatNumber(index + 1, language),
                total: formatNumber(blocks.length, language),
              })}
            </span>
          </div>
          <article className="debrief-block">
            <h2>{text(`debrief.${block}`)}</h2>
            <p>{lessonBody}</p>
          </article>
          <div className="glossary">
            <h2>{text('features.glossary')}</h2>
            <div className="term-chips">
              {glossaryTerms(language).map((term) => (
                <button
                  key={term.termId}
                  aria-pressed={termId === term.termId}
                  onClick={() =>
                    setTermId(termId === term.termId ? undefined : term.termId)
                  }
                >
                  {term.term}
                </button>
              ))}
            </div>
          </div>
        </>
      }
      actions={
        <>
          {index > 0 && (
            <button
              className="secondary-action"
              onClick={() => {
                setIndex(index - 1);
                setTermId(undefined);
              }}
            >
              {text('features.previousLesson')}
            </button>
          )}
          <BigButton
            onClick={() => {
              if (index < blocks.length - 1) {
                setIndex(index + 1);
                setTermId(undefined);
              } else onContinue();
            }}
          >
            {text(
              index < blocks.length - 1
                ? 'features.nextLesson'
                : 'debrief.continue',
            )}
          </BigButton>
        </>
      }
    >
      {termId ? (
        <GlossaryCard
          key={termId}
          language={language}
          termId={termId}
          onClose={() => setTermId(undefined)}
        />
      ) : block === 'recoveryMaths' ? (
        <section
          className="recovery-visual"
          aria-label={text('debrief.recoveryMaths')}
        >
          <h2>{text('debrief.recoveryMaths')}</h2>
          <div className="recovery-bar-row">
            <span>{text('features.startingAmount')}</span>
            <strong>{formatRupees(run.capital, language)}</strong>
            <div className="math-track">
              <div
                style={{
                  width: `${(run.capital / Math.max(run.capital, run.final.equity)) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="recovery-bar-row">
            <span>{text('features.remainingAmount')}</span>
            <strong>{formatRupees(run.final.equity, language)}</strong>
            <div className="math-track">
              <div
                className="ending-bar"
                style={{
                  width: `${(Math.max(0, run.final.equity) / Math.max(run.capital, run.final.equity)) * 100}%`,
                }}
              />
            </div>
          </div>
          <p className="notice">{lessonBody}</p>
        </section>
      ) : (
        <>
          <h2>{text('features.lessonVisual')}</h2>
          <CompareChart
            leveraged={displayEquity(run)}
            unleveraged={displayEquity(unleveraged)}
            leveragedLabel={text('replay.leveragedLine')}
            unleveragedLabel={text('replay.unleveragedLine')}
            language={language}
          />
          <p className="quiet">{text('features.settlement')}</p>
        </>
      )}
    </JourneyFrame>
  );
}
