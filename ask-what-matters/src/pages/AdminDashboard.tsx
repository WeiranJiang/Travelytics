import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  FileEdit,
  Sparkles,
  Send,
  ArrowRight,
  Mic,
  Filter,
  Download,
  Activity,
  Users as UsersIcon,
  CalendarClock,
  GitCompareArrows,
} from 'lucide-react';
import { SMART_QUESTIONS } from '@/api/data-smart-questions';
import type { User } from '@/api/types';
import {
  ANSWERS_PER_DAY,
  GAP_CATEGORIES,
  OVERVIEW_STATS,
  PROPERTY_FRESHNESS,
  PROPERTY_UPDATES,
  QUALIFIED_USERS,
  RESPONSE_CHANNEL,
  SENT_QUESTIONS,
  UNCERTAIN_QUESTIONS,
} from '@/api/data-admin';
import { AdminSidebar, type AdminView } from '@/components/admin/AdminSidebar';
import { StatsTiles } from '@/components/admin/StatsTiles';
import {
  HorizontalBars,
  LineChart,
  StackedBar,
} from '@/components/admin/SimpleChart';
import { AssistantChatbot } from '@/components/admin/AssistantChatbot';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function AdminDashboard({ user }: { user: User }) {
  const [view, setView] = useState<AdminView>('overview');

  return (
    <div className="flex bg-surface-contrast/50 min-h-[calc(100vh-4rem)]">
      <AdminSidebar current={view} onChange={setView} />
      <div className="flex-1 p-6 lg:p-8 max-w-[1400px]">
        {view === 'overview' && <Overview />}
        {view === 'uncertain' && <UncertainTab />}
        {view === 'qualified' && <QualifiedTab />}
        {view === 'sent' && <SentTab />}
        {view === 'responses' && <ResponsesTab />}
        {view === 'updates' && <UpdatesTab />}
        {view === 'analytics' && <AnalyticsTab />}
      </div>
      <AssistantChatbot />
      <div className="fixed bottom-6 left-6 bg-white border border-divider rounded-full px-3 py-1.5 text-xs text-ink-muted shadow-sm">
        Signed in as <span className="font-semibold text-navy">{user.full_name}</span>
      </div>
    </div>
  );
}

/* ---------- Overview ---------- */

function Overview() {
  const tiles = [
    { label: 'Active gaps', value: OVERVIEW_STATS.active_gaps, delta: '+3 this week' },
    { label: 'Questions queued', value: OVERVIEW_STATS.questions_queued },
    { label: 'Answers today', value: OVERVIEW_STATS.answers_today, delta: '+21%' },
    {
      label: 'Properties refreshed (7d)',
      value: OVERVIEW_STATS.properties_refreshed_7d,
    },
    { label: 'Response rate', value: `${OVERVIEW_STATS.avg_response_rate_pct}%`, delta: '+11pts' },
    {
      label: 'Avg time to answer',
      value: `${OVERVIEW_STATS.avg_time_to_answer_sec}s`,
    },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy">Overview</h1>
          <p className="text-ink-muted mt-1">
            How the Ask What Matters pipeline is performing across the portfolio.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" leadingIcon={<Filter size={14} />}>
            Last 7 days
          </Button>
          <Button variant="secondary" size="sm" leadingIcon={<Download size={14} />}>
            Export
          </Button>
        </div>
      </div>
      <StatsTiles tiles={tiles} />

      <div className="grid lg:grid-cols-2 gap-4">
        <LineChart title="Answers collected per day" points={ANSWERS_PER_DAY} />
        <HorizontalBars title="Active gaps by category" points={GAP_CATEGORIES} />
      </div>

      <div className="bg-white border border-divider rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-navy">Pipeline at a glance</h3>
          <div className="text-xs text-ink-muted">
            Uncertain → Targeted → Sent → Answered → Applied
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          {[
            { icon: <Sparkles size={16} />, label: 'Uncertain', value: 6, tint: 'bg-action-subtle text-action' },
            { icon: <FileEdit size={16} />, label: 'Targeted', value: 18, tint: 'bg-action-subtle text-action' },
            { icon: <Send size={16} />, label: 'Sent', value: 11, tint: 'bg-action-subtle text-action' },
            { icon: <CheckCircle2 size={16} />, label: 'Answered', value: 47, tint: 'bg-positive/10 text-positive' },
            { icon: <FileEdit size={16} />, label: 'Applied', value: 6, tint: 'bg-positive/10 text-positive' },
          ].map((s, i, arr) => (
            <div key={s.label} className="flex items-center gap-3 flex-1">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${s.tint} font-medium`}>
                {s.icon}
                <span>{s.label}</span>
                <span className="ml-1 font-bold">{s.value}</span>
              </div>
              {i < arr.length - 1 && <ArrowRight size={14} className="text-ink-muted" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Uncertain questions ---------- */

function SignalChip({
  icon,
  label,
  value,
  tone = 'neutral',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: 'neutral' | 'warn' | 'ok';
}) {
  const toneStyle =
    tone === 'warn'
      ? 'bg-negative/10 text-negative border-negative/20'
      : tone === 'ok'
        ? 'bg-positive/10 text-positive border-positive/20'
        : 'bg-surface-contrast text-navy border-divider';
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border text-xs ${toneStyle}`}
      title={label}
    >
      {icon}
      <span className="text-ink-muted">{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function UncertainTab() {
  // Pull live smart questions from the same source the review UI uses,
  // so admin + reviewer see consistent data.
  const allLiveQuestions = Object.values(SMART_QUESTIONS).flat();
  const liveRows = allLiveQuestions.map((q) => ({
    id: q.id,
    text: q.text,
    reason: q.reason,
    property_id: q.target_gap,
    property_name:
      Object.entries(SMART_QUESTIONS).find(([, list]) => list.includes(q))?.[0] ?? '',
    gap_category: q.category,
    confidence: q.confidence ?? 0,
    signals: q.signals,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-navy">Uncertain questions</h1>
        <p className="text-ink-muted mt-1">
          Draft questions generated by the gap-detection pipeline, with the numerical
          signals that triggered them. Review before sending.
        </p>
      </div>

      {/* Static pipeline-stage examples (from data-admin.ts) */}
      <div className="bg-white border border-divider rounded-lg divide-y divide-divider overflow-hidden">
        {UNCERTAIN_QUESTIONS.map((q) => (
          <div key={q.id} className="p-5 hover:bg-surface-contrast/40 transition-colors">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2 text-xs">
                <Badge
                  tone={
                    q.status === 'approved'
                      ? 'positive'
                      : q.status === 'pending_review'
                        ? 'brand'
                        : 'neutral'
                  }
                >
                  {q.status.replace('_', ' ')}
                </Badge>
                <span className="text-ink-muted">{q.gap_category}</span>
                <span className="text-ink-muted">·</span>
                <span className="text-ink-muted">
                  Confidence {(q.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-xs text-ink-muted">
                {new Date(q.created_at).toLocaleString()}
              </div>
            </div>
            <p className="text-navy font-semibold">{q.text}</p>
            <p className="mt-1 text-sm text-ink-muted italic">{q.reason}</p>
            <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
              <div className="text-sm text-navy">
                <span className="font-semibold">{q.property_name}</span>
                <span className="text-ink-muted"> · {q.qualified_user_count} qualified users</span>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  Edit
                </Button>
                <Button size="sm" leadingIcon={<Send size={14} />}>
                  Send to users
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live questions with full signal breakdown */}
      <div className="pt-2">
        <h2 className="text-xl font-bold text-navy mb-1">Signal-level view</h2>
        <p className="text-ink-muted text-sm mb-4">
          Each question is backed by numerical evidence. These signals come straight from
          the backend gap-detection pipeline (or the mock, during development).
        </p>
        <div className="grid gap-3">
          {liveRows.map((q) => {
            const s = q.signals ?? {};
            const freshTone =
              (s.staleness_ratio ?? 0) > 1.5
                ? 'warn'
                : (s.staleness_ratio ?? 0) > 1
                  ? 'neutral'
                  : 'ok';
            return (
              <div
                key={q.id}
                className="bg-white border border-divider rounded-lg p-4"
              >
                <div className="flex items-center gap-2 text-xs mb-2">
                  <Badge tone="brand">{q.gap_category}</Badge>
                  <span className="font-mono text-ink-muted">{q.id}</span>
                  <span className="text-ink-muted">·</span>
                  <span className="text-ink-muted">
                    Confidence {(q.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="font-semibold text-navy">{q.text}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {s.freshness_days !== undefined && (
                    <SignalChip
                      icon={<CalendarClock size={12} />}
                      label="Last mention"
                      value={`${s.freshness_days}d ago`}
                      tone={freshTone}
                    />
                  )}
                  {s.staleness_ratio !== undefined && (
                    <SignalChip
                      icon={<Activity size={12} />}
                      label="Staleness"
                      value={`${s.staleness_ratio.toFixed(2)}×`}
                      tone={freshTone}
                    />
                  )}
                  {s.coverage_count !== undefined && (
                    <SignalChip
                      icon={<FileEdit size={12} />}
                      label="Coverage"
                      value={`${s.coverage_count} mentions`}
                    />
                  )}
                  {s.contradiction_score !== undefined && (
                    <SignalChip
                      icon={<GitCompareArrows size={12} />}
                      label="Contradiction"
                      value={s.contradiction_score.toFixed(2)}
                      tone={s.contradiction_score > 0.4 ? 'warn' : 'neutral'}
                    />
                  )}
                  {s.qualified_user_count !== undefined && (
                    <SignalChip
                      icon={<UsersIcon size={12} />}
                      label="Qualified"
                      value={`${s.qualified_user_count} users`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- Qualified users ---------- */

function QualifiedTab() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-navy">Qualified users</h1>
        <p className="text-ink-muted mt-1">
          Recent travelers matched to open gaps — likeliest to provide fresh, targeted input.
        </p>
      </div>
      <div className="bg-white border border-divider rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-contrast text-ink-muted text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Stayed at</th>
              <th className="text-left px-4 py-3">Stayed on</th>
              <th className="text-left px-4 py-3">Match reason</th>
              <th className="text-right px-4 py-3">Score</th>
              <th className="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider">
            {QUALIFIED_USERS.map((u) => (
              <tr key={u.id} className="hover:bg-surface-contrast/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-xs font-semibold">
                      {u.initial}
                    </div>
                    <div>
                      <div className="font-semibold text-navy">{u.full_name}</div>
                      <div className="text-xs text-ink-muted">@{u.username} · {u.home_city}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-navy">{u.property_name}</td>
                <td className="px-4 py-3 text-ink-muted">{u.stayed_on}</td>
                <td className="px-4 py-3 text-ink-muted">{u.match_reason}</td>
                <td className="px-4 py-3 text-right">
                  <span className="font-semibold text-navy">
                    {(u.match_score * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="secondary">
                    Contact
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Sent questions ---------- */

function SentTab() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-navy">Sent questions</h1>
        <p className="text-ink-muted mt-1">Questions currently in the wild, waiting on user input.</p>
      </div>
      <div className="space-y-3">
        {SENT_QUESTIONS.map((s) => (
          <div
            key={s.id}
            className="bg-white border border-divider rounded-lg p-4 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-semibold shrink-0">
              {s.sent_to_initial}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-ink-muted mb-1">
                <Clock size={12} />
                {new Date(s.sent_at).toLocaleString()}
                <span>·</span>
                <span>Sent to @{s.sent_to}</span>
                <span>·</span>
                <span>{s.property_name}</span>
              </div>
              <p className="font-semibold text-navy">{s.question_text}</p>
              <div className="mt-2">
                {s.responded ? (
                  <Badge tone="positive" icon={<CheckCircle2 size={12} />}>
                    Answered
                  </Badge>
                ) : (
                  <Badge tone="info" icon={<Clock size={12} />}>
                    Awaiting response
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Responses ---------- */

function ResponsesTab() {
  const responded = SENT_QUESTIONS.filter((s) => s.responded);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-navy">User responses</h1>
        <p className="text-ink-muted mt-1">
          Raw user answers, ready for aggregation or LLM-driven summarization.
        </p>
      </div>
      <div className="space-y-3">
        {responded.map((s) => (
          <div key={s.id} className="bg-white border border-divider rounded-lg p-5">
            <div className="flex items-center gap-2 text-xs text-ink-muted mb-2">
              <span>@{s.sent_to}</span>
              <span>·</span>
              <span>{s.property_name}</span>
              <span>·</span>
              <span>{new Date(s.sent_at).toLocaleDateString()}</span>
              <span>·</span>
              <Badge tone="neutral" icon={<Mic size={10} />}>Voice</Badge>
            </div>
            <div className="text-sm text-ink-muted italic mb-2">Q: {s.question_text}</div>
            <div className="text-navy leading-relaxed border-l-2 border-action pl-3">
              {s.response_snippet}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Property updates ---------- */

function UpdatesTab() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-navy">Property updates</h1>
        <p className="text-ink-muted mt-1">
          The output: listing fields refreshed as a result of recent user answers.
        </p>
      </div>
      <div className="space-y-4">
        {PROPERTY_UPDATES.map((u) => (
          <div key={u.id} className="bg-white border border-divider rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-navy">{u.property_name}</div>
                <div className="text-xs text-ink-muted">
                  Field <code className="px-1 py-0.5 rounded bg-surface-contrast">{u.field}</code>
                  {' · '}
                  Updated {new Date(u.applied_at).toLocaleString()}
                  {' · '}
                  Source @{u.source_user}
                </div>
              </div>
              <Badge
                tone={
                  u.confidence === 'high'
                    ? 'positive'
                    : u.confidence === 'medium'
                      ? 'brand'
                      : 'neutral'
                }
              >
                {u.confidence} confidence
              </Badge>
            </div>
            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
              <div className="rounded-md bg-surface-contrast p-3 text-sm">
                <div className="text-xs uppercase tracking-wide text-ink-muted mb-1">Before</div>
                <div className="text-navy">{u.before}</div>
              </div>
              <div className="hidden md:flex items-center justify-center text-action">
                <ArrowRight size={20} />
              </div>
              <div className="rounded-md border-2 border-positive bg-white p-3 text-sm">
                <div className="text-xs uppercase tracking-wide text-positive mb-1">After</div>
                <div className="text-navy font-medium">{u.after}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Analytics ---------- */

function AnalyticsTab() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-navy">Analytics</h1>
        <p className="text-ink-muted mt-1">Portfolio-level signals to inform next actions.</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <LineChart title="Answers per day (7-day rolling)" points={ANSWERS_PER_DAY} />
        <StackedBar title="Response channel (voice vs text)" points={RESPONSE_CHANNEL} />
        <HorizontalBars title="Gaps by category" points={GAP_CATEGORIES} />
        <HorizontalBars
          title="Listing freshness index"
          points={PROPERTY_FRESHNESS}
          unit="%"
          accentClass="bg-positive"
        />
      </div>
    </div>
  );
}
