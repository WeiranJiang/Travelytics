import {
  LayoutDashboard,
  Sparkles,
  Users,
  Send,
  MessageSquareText,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import type { ReactNode } from 'react';

export type AdminView =
  | 'overview'
  | 'uncertain'
  | 'qualified'
  | 'sent'
  | 'responses'
  | 'updates'
  | 'analytics';

const ITEMS: { id: AdminView; label: string; icon: ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { id: 'uncertain', label: 'Uncertain questions', icon: <Sparkles size={16} /> },
  { id: 'qualified', label: 'Qualified users', icon: <Users size={16} /> },
  { id: 'sent', label: 'Sent questions', icon: <Send size={16} /> },
  { id: 'responses', label: 'User responses', icon: <MessageSquareText size={16} /> },
  { id: 'updates', label: 'Property updates', icon: <RefreshCw size={16} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> },
];

export function AdminSidebar({
  current,
  onChange,
}: {
  current: AdminView;
  onChange: (v: AdminView) => void;
}) {
  return (
    <aside className="w-60 shrink-0 border-r border-divider bg-white min-h-[calc(100vh-4rem)] py-6">
      <div className="px-4 mb-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Admin console
        </div>
        <div className="mt-1 text-sm font-medium text-navy">Ask What Matters</div>
      </div>
      <nav className="space-y-1 px-2">
        {ITEMS.map((it) => (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            className={
              current === it.id
                ? 'w-full text-left flex items-center gap-2 px-3 py-2 rounded-md bg-action-subtle text-action font-medium'
                : 'w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-navy hover:bg-surface-contrast'
            }
          >
            {it.icon}
            {it.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
