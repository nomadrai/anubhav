export function CaptionBar({ text }: { text: string }) { return <div className="caption" aria-live="polite"><span aria-hidden="true">◌</span> {text}</div>; }
