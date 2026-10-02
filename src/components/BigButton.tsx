import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
export function BigButton({ children, ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) { return <button className="big-button" {...props}>{children}</button>; }
