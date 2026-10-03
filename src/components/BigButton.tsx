import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
export function BigButton({ children, className = '', ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) { return <button className={`big-button ${className}`} {...props}>{children}</button>; }
