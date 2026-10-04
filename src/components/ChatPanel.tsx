import { useEffect, useRef, useState } from 'react';
import type { Language } from '../config/languages';
import { dictionaries, t } from '../i18n';
import { loadKnowledge } from '../chat/knowledge';
import { CHAT_ENABLED } from '../../shared/chat-config.mjs';
import {
  adviceSeeking,
  personalDetails,
  retrieve,
  relatedEntries,
  entryText,
  entryTitle,
  safeAnswer,
  type KnowledgeEntry,
  type ChatResult,
} from '../../shared/chat-core.mjs';

export default function ChatPanel({
  language,
  onClose,
}: {
  language: Language;
  onClose: () => void;
}) {
  const ref = useRef<globalThis.HTMLDialogElement>(null);
  const pending = useRef<globalThis.AbortController | null>(null);
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [question, setQuestion] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ChatResult | null>(null);
  const copy = dictionaries[language].chat;
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    let cancelled = false;
    loadKnowledge()
      .then((value) => {
        if (!cancelled) setEntries(value);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
      pending.current?.abort();
      dialog?.close();
    };
  }, []);
  const close = () => {
    pending.current?.abort();
    ref.current?.close();
    onClose();
  };
  const showEntry = (entry: KnowledgeEntry) =>
    setResult({
      mode: 'entry',
      answer: entryText(entry, language),
      entries: [entry],
    });
  const ask = async () => {
    const text = question.trim();
    if (!CHAT_ENABLED || busy || !text || !entries.length || !consent) return;
    setQuestion('');
    // Local early gates: prohibited/private questions never even reach the app server.
    if (adviceSeeking(text)) {
      setResult({
        mode: 'refusal',
        answer: copy.refusal,
        entries: relatedEntries(entries),
      });
      return;
    }
    if (personalDetails(text)) {
      setResult({ mode: 'private', answer: copy.private, entries: [] });
      return;
    }
    const matches = retrieve(text, entries).map((item) => item.entry);
    const fallback = (): ChatResult =>
      matches.length
        ? {
            mode: 'entry',
            answer: entryText(matches[0], language),
            entries: [matches[0]],
          }
        : {
            mode: 'unknown',
            answer: copy.unknown,
            entries: relatedEntries(entries),
          };
    const controller = new globalThis.AbortController();
    pending.current = controller;
    const timer = globalThis.setTimeout(() => controller.abort(), 11000);
    setBusy(true);
    try {
      const response = await globalThis.fetch('/api/chat', {
        method: 'POST',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ question: text, language }),
      });
      if (response.status === 429) {
        setResult({
          mode: 'limited',
          answer: copy.limited,
          entries: relatedEntries(entries),
        });
        return;
      }
      if (!response.ok) throw new Error('unavailable');
      const value: ChatResult = await response.json();
      const trusted = Array.isArray(value.entries)
        ? value.entries
            .map((source) => entries.find((entry) => entry.id === source.id))
            .filter((entry): entry is KnowledgeEntry => !!entry)
            .slice(0, 3)
        : [];
      if (
        value.mode === 'generated' &&
        trusted.length &&
        safeAnswer(value.answer, language, trusted)
      )
        setResult({
          mode: 'generated',
          answer: value.answer,
          entries: trusted,
        });
      else if (value.mode === 'entry' && trusted.length) showEntry(trusted[0]);
      else if (
        ['refusal', 'unknown', 'private', 'disabled'].includes(value.mode)
      )
        setResult({
          mode: value.mode,
          answer:
            copy[value.mode as 'refusal' | 'unknown' | 'private' | 'disabled'],
          entries: trusted,
        });
      else setResult(fallback());
    } catch {
      if (ref.current?.open) setResult(fallback());
    } finally {
      globalThis.clearTimeout(timer);
      pending.current = null;
      if (ref.current?.open) setBusy(false);
    }
  };
  const related = result
    ? relatedEntries(
        entries,
        result.entries.flatMap((entry) => entry.related),
      )
    : [];
  return (
    <dialog
      ref={ref}
      className="about-dialog chat-dialog"
      aria-labelledby="chat-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <div className="about-header">
        <h2 id="chat-title">{copy.title}</h2>
        <button autoFocus onClick={close}>
          {copy.close}
        </button>
      </div>
      <div className="chat-content">
        <p className="notice" id="chat-warning">
          {copy.warning}
        </p>
        <p>{copy.disclosure}</p>
        <p className="quiet">{copy.retention}</p>
        <label className="chat-consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
          {copy.consent}
        </label>
        <div className="chat-chips">
          {copy.chips.map((chip) => (
            <button
              key={chip}
              disabled={busy}
              onClick={() => {
                setQuestion(chip);
                document.getElementById('chat-question')?.focus();
              }}
            >
              {chip}
            </button>
          ))}
        </div>
        {loadError && <p role="status">{copy.loadError}</p>}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void ask();
          }}
        >
          <label htmlFor="chat-question">{copy.question}</label>
          <textarea
            id="chat-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            maxLength={600}
            rows={3}
            aria-describedby="chat-warning"
            placeholder={copy.placeholder}
            autoComplete="off"
            spellCheck={false}
            disabled={busy}
          />
          <button
            className="big-button"
            type="submit"
            disabled={
              !CHAT_ENABLED ||
              !consent ||
              !entries.length ||
              !question.trim() ||
              busy
            }
          >
            {busy ? copy.busy : copy.send}
          </button>
        </form>
        <section className="chat-answer" aria-live="polite" aria-busy={busy}>
          {result && (
            <>
              <small>
                {result.mode === 'generated' ? copy.aiLabel : copy.entryLabel}
              </small>
              <p>{result.answer}</p>
              {result.entries.length > 0 && (
                <>
                  <h3>{copy.sources}</h3>
                  <ul>
                    {result.entries.map((entry) => (
                      <li key={entry.id}>
                        <button onClick={() => showEntry(entry)}>
                          {entryTitle(entry, language)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {related.length > 0 && (
                <>
                  <h3>{copy.related}</h3>
                  <div className="chat-chips">
                    {related.map((entry) => (
                      <button key={entry.id} onClick={() => showEntry(entry)}>
                        {entryTitle(entry, language)}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {result.entries.some((entry) => entry.sources.length) && (
                <>
                  <h3>{copy.official}</h3>
                  <ul>
                    {[
                      ...new Set(
                        result.entries.flatMap((entry) => entry.sources),
                      ),
                    ].map((url) => (
                      <li key={url}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          {new globalThis.URL(url).hostname}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </section>
        <p className="quiet">{t(language, 'features.reviewNotice')}</p>
      </div>
    </dialog>
  );
}
