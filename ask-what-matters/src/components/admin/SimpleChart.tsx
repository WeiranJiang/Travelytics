import type { AnalyticsPoint } from '@/api/data-admin';

/** Dependency-free horizontal bar chart. */
export function HorizontalBars({
  title,
  points,
  accentClass = 'bg-action',
  unit = '',
}: {
  title: string;
  points: AnalyticsPoint[];
  accentClass?: string;
  unit?: string;
}) {
  const max = Math.max(...points.map((p) => p.value), 1);
  return (
    <div className="bg-white border border-divider rounded-lg p-5">
      <h3 className="font-semibold text-navy mb-4">{title}</h3>
      <div className="space-y-2">
        {points.map((p) => (
          <div key={p.label} className="flex items-center gap-3">
            <div className="w-32 text-sm text-ink-muted truncate">{p.label}</div>
            <div className="flex-1 h-6 bg-surface-contrast rounded-sm overflow-hidden">
              <div
                className={`h-full ${accentClass}`}
                style={{ width: `${(p.value / max) * 100}%` }}
              />
            </div>
            <div className="w-14 text-right text-sm font-semibold text-navy">
              {p.value}
              {unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Dependency-free line/area chart for time-series. */
export function LineChart({
  title,
  points,
}: {
  title: string;
  points: AnalyticsPoint[];
}) {
  const W = 600;
  const H = 160;
  const PAD = 24;
  const max = Math.max(...points.map((p) => p.value), 1);
  const stepX = (W - PAD * 2) / Math.max(points.length - 1, 1);
  const coord = (i: number, v: number) => ({
    x: PAD + i * stepX,
    y: H - PAD - (v / max) * (H - PAD * 2),
  });
  const path = points
    .map((p, i) => {
      const { x, y } = coord(i, p.value);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const areaPath =
    path +
    ` L${(PAD + (points.length - 1) * stepX).toFixed(1)},${H - PAD} L${PAD},${H - PAD} Z`;

  return (
    <div className="bg-white border border-divider rounded-lg p-5">
      <h3 className="font-semibold text-navy mb-4">{title}</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
        <path d={areaPath} fill="#1668E3" opacity="0.1" />
        <path d={path} fill="none" stroke="#1668E3" strokeWidth="2" />
        {points.map((p, i) => {
          const { x, y } = coord(i, p.value);
          return (
            <g key={p.label}>
              <circle cx={x} cy={y} r="4" fill="#1668E3" />
              <text
                x={x}
                y={H - 6}
                textAnchor="middle"
                className="text-[10px] fill-current"
                fill="#676A7D"
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Simple donut / horizontal stacked bar for a two-value split. */
export function StackedBar({
  title,
  points,
}: {
  title: string;
  points: AnalyticsPoint[];
}) {
  const total = points.reduce((s, p) => s + p.value, 0) || 1;
  const colors = ['bg-action', 'bg-brand-gold', 'bg-positive', 'bg-info'];
  return (
    <div className="bg-white border border-divider rounded-lg p-5">
      <h3 className="font-semibold text-navy mb-4">{title}</h3>
      <div className="flex h-4 rounded-full overflow-hidden bg-surface-contrast">
        {points.map((p, i) => (
          <div
            key={p.label}
            className={colors[i % colors.length]}
            style={{ width: `${(p.value / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-3 space-y-1 text-sm">
        {points.map((p, i) => (
          <div key={p.label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[i % colors.length]}`} />
              <span className="text-navy">{p.label}</span>
            </div>
            <span className="text-ink-muted">
              {p.value}% ({Math.round((p.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
