import type { ReactNode } from 'react';
import { TrendingUp } from 'lucide-react';

interface Tile {
  label: string;
  value: string | number;
  delta?: string;
  icon?: ReactNode;
}

export function StatsTiles({ tiles }: { tiles: Tile[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="bg-white border border-divider rounded-lg p-4 flex flex-col gap-1"
        >
          <div className="text-xs font-medium text-ink-muted">{t.label}</div>
          <div className="text-2xl font-bold text-navy">{t.value}</div>
          {t.delta && (
            <div className="text-xs text-positive flex items-center gap-1">
              <TrendingUp size={12} /> {t.delta}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
