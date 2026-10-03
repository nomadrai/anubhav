import { useEffect, useRef, useState, type ReactNode } from 'react';

/** The scroll owner, never the desktop document. Fade appears only below unread content. */
export function Pane({
  children,
  kind,
  label,
}: {
  children: ReactNode;
  kind: 'reading' | 'interaction';
  label: string;
}) {
  const ref = useRef<globalThis.HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || !window.ResizeObserver) return;
    const update = () =>
      setMore(node.scrollHeight - node.clientHeight - node.scrollTop > 3);
    const observer = new window.ResizeObserver(update);
    observer.observe(node);
    if (node.firstElementChild) observer.observe(node.firstElementChild);
    node.addEventListener('scroll', update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      node.removeEventListener('scroll', update);
    };
  }, [children]);
  return (
    <section
      className={`pane pane-${kind}`}
      data-more={more}
      aria-label={label}
    >
      <div className="pane-scroll" ref={ref} tabIndex={0}>
        <div className="pane-content">{children}</div>
      </div>
    </section>
  );
}
