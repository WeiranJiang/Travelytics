import type { ReactNode } from 'react';

type Tone = 'brand' | 'deal' | 'info' | 'positive' | 'featured' | 'neutral';

const toneStyles: Record<Tone, string> = {
  brand: 'bg-brand-yellow text-navy-ink',
  deal: 'bg-positive text-white',
  info: 'bg-info text-white',
  positive: 'bg-positive text-white',
  featured: 'bg-featured text-navy',
  neutral: 'bg-divider text-navy',
};

export function Badge({
  tone = 'neutral',
  children,
  icon,
}: {
  tone?: Tone;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium ${toneStyles[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}
