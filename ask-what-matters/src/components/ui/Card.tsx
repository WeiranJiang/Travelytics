import type { HTMLAttributes } from 'react';

export function Card({
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-surface-base border border-divider rounded-lg p-4 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
