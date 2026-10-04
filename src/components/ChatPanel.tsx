import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Language } from '../config/languages';
import type { JourneyStep } from '../journey/steps';
import { dictionaries } from '../i18n';
import { loadKnowledge } from '../chat/knowledge';
import { CHAT_ENABLED } from '../../shared/chat-config.mjs';
import {
  adviceSeeking,
  personalDetails,
  conversationIntent,
  retrieve,
  relatedEntries,
  entryText,
  safeAnswer,
  type KnowledgeEntry,
  type ChatResult,
} from '../../shared/chat-core.mjs';

export default function ChatPanel({
  language,
  step,
  onClose,
}: {
  language: Language;
  step: JourneyStep;
  onClose: () => void;
}) {
  const ref = useRef<globalThis.HTMLElement>(null);
  const input = useRef<globalThis.HTMLTextAreaElement>(null);
  const messageList = useRef<globalThis.HTMLDivElement>(null);
  const active = useRef(true);
  const pending = useRef<globalThis.AbortController | null>(null);
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string }[]
  >([]);
  const copy = dictionaries[language].chat;
  const suggestions = copy.stepQuestions[step];
  useLayoutEffect(() => {
    const panel = ref.current;
    const header = panel?.parentElement;
    if (!panel || !header) return;
    const actions = header.parentElement?.querySelector('.shell-bottom');
    const viewport = window.visualViewport;
    const resize = () => {
      const bottom =
        (viewport?.height ?? window.innerHeight) + (viewport?.offsetTop ?? 0);
      const actionSpace =
        window.innerWidth < 1024
          ? (actions?.getBoundingClientRect().height ?? 0)
          : 0;
      panel.style.setProperty(
        '--chat-available-height',
        `${Math.max(0, bottom - header.getBoundingClientRect().bottom - actionSpace - 16)}px`,
      );
    };
    resize();
    const observer = globalThis.ResizeObserver
      ? new globalThis.ResizeObserver(resize)
      : null;
    observer?.observe(header);
    if (actions) observer?.observe(actions);
    window.addEventListener('resize', resize);
    viewport?.addEventListener('resize', resize);
    viewport?.addEventListener('scroll', resize);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', resize);
      viewport?.removeEventListener('resize', resize);
      viewport?.removeEventListener('scroll', resize);
    };
  }, []);
  useEffect(() => {
    active.current = true;
    // Avoid opening the phone keyboard until the learner taps the text box.
    if (window.matchMedia?.('(min-width: 768px)').matches)
      input.current?.focus({ preventScroll: true });
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
      active.current = false;
      pending.current?.abort();
    };
  }, []);
  useEffect(() => {
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape' || document.querySelector('dialog[open]'))
        return;
      event.preventDefault();
      active.current = false;
      pending.current?.abort();
      onClose();
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [onClose]);
  useEffect(() => {
    const list = messageList.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, busy, loadError]);
  const close = () => {
    active.current = false;
    pending.current?.abort();
    onClose();
  };
  const reply = (result: ChatResult) => {
    if (active.current)
      setMessages((previous) => [
        ...previous,
        { role: 'assistant', text: result.answer },
      ]);
  };
  const showEntry = (entry: KnowledgeEntry) =>
    reply({
      mode: 'entry',
      answer: entryText(entry, language),
      entries: [entry],
    });
  const ask = async (submitted = question) => {
    const text = submitted.trim();
    if (!CHAT_ENABLED || busy || !text || !entries.length) return;
    setQuestion('');
    setMessages((previous) => [...previous, { role: 'user', text }]);
    // Local early gates: prohibited/private questions never even reach the app server.
    if (adviceSeeking(text)) {
      reply({
        mode: 'refusal',
        answer: copy.refusal,
        entries: relatedEntries(entries),
      });
      return;
    }
    if (personalDetails(text)) {
      reply({ mode: 'private', answer: copy.private, entries: [] });
      return;
    }
    const intent = conversationIntent(text);
    if (intent) {
      reply({ mode: intent, answer: copy[intent], entries: [] });
      return;
    }
    const matches = retrieve(text, entries).map((item) => item.entry);
    if (matches.length) {
      showEntry(matches[0]);
      return;
    }
    const fallback = (): ChatResult => ({
      mode: 'unavailable',
      answer: copy.unavailable,
      entries: [],
    });
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
        reply({
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
        reply({
          mode: 'generated',
          answer: value.answer,
          entries: trusted,
        });
      else if (['entry', 'generated'].includes(value.mode) && trusted.length)
        showEntry(trusted[0]);
      else if (
        [
          'refusal',
          'unknown',
          'private',
          'disabled',
          'unavailable',
          'greeting',
          'thanks',
          'goodbye',
          'help',
        ].includes(value.mode)
      )
        reply({
          mode: value.mode,
          answer:
            copy[
              value.mode as
                | 'refusal'
                | 'unknown'
                | 'private'
                | 'disabled'
                | 'unavailable'
                | 'greeting'
                | 'thanks'
                | 'goodbye'
                | 'help'
            ],
          entries: trusted,
        });
      else reply(fallback());
    } catch {
      if (active.current) reply(fallback());
    } finally {
      globalThis.clearTimeout(timer);
      pending.current = null;
      if (active.current) setBusy(false);
    }
  };
  return (
    <section
      id="chat-panel"
      ref={ref}
      className="chat-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="chat-title"
    >
      <div className="chat-header">
        <h2 id="chat-title">{copy.title}</h2>
        <button
          className="chat-close"
          aria-label={copy.close}
          onClick={close}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      <div
        ref={messageList}
        className="chat-messages"
        role="log"
        aria-label={copy.messages}
        aria-live="polite"
        aria-relevant="additions text"
        aria-busy={busy}
        tabIndex={0}
      >
        {messages.map((message, index) => (
          <p
            key={index}
            className={`chat-message chat-message-${message.role}`}
          >
            {message.text}
          </p>
        ))}
        {loadError && (
          <p className="chat-message" role="status">
            {copy.loadError}
          </p>
        )}
        {busy && (
          <p className="chat-pending" role="status">
            {copy.busy}
          </p>
        )}
      </div>
      {messages.length === 0 && (
        <div className="chat-chips">
          {Object.entries(suggestions).map(([entryId, text]) => (
            <button
              key={entryId}
              data-entry-id={entryId}
              disabled={busy || !entries.length}
              onClick={() => void ask(text)}
            >
              {text}
            </button>
          ))}
        </div>
      )}
      <form
        className="chat-composer"
        onSubmit={(event) => {
          event.preventDefault();
          void ask();
        }}
      >
        <textarea
          ref={input}
          id="chat-question"
          aria-label={copy.question}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={600}
          rows={1}
          placeholder={copy.placeholder}
          autoComplete="off"
          spellCheck={false}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              void ask();
            }
          }}
        />
        <button
          className="chat-send"
          type="submit"
          disabled={
            !CHAT_ENABLED || !entries.length || !question.trim() || busy
          }
        >
          {copy.send}
        </button>
      </form>
    </section>
  );
}
