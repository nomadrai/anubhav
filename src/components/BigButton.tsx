import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;
export function BigButton({ children, className = '', ...props }: Props) {
  const option = props['aria-pressed'] !== undefined;
  return (
    <button
      className={`big-button ${option ? 'option-card' : ''} ${className}`}
      {...props}
      aria-label={
        props['aria-label'] ??
        (option && typeof children === 'string' ? children : undefined)
      }
    >
      {option && (
        <svg
          className="option-icon"
          viewBox="0 0 20 20"
          aria-hidden="true"
          focusable="false"
        >
          <rect
            x="3"
            y="3"
            width="14"
            height="14"
            rx="4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="10" cy="10" r="2" fill="currentColor" />
        </svg>
      )}
      {children}
    </button>
  );
}
