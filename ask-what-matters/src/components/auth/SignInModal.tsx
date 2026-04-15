import { useState } from 'react';
import { X, UserCircle2 } from 'lucide-react';
import type { User } from '@/api/types';
import { signIn } from '@/api/client';
import { Button } from '@/components/ui/Button';

export function SignInModal({
  open,
  onClose,
  onSignedIn,
}: {
  open: boolean;
  onClose: () => void;
  onSignedIn: (user: User) => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn({ username, password });
    setLoading(false);
    if (res.ok) {
      onSignedIn(res.data.user);
      setUsername('');
      setPassword('');
    } else {
      setError(res.error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-float max-w-md w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-surface-contrast"
        >
          <X size={20} className="text-ink-muted" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center">
            <UserCircle2 size={22} className="text-navy" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-navy">Sign in</h2>
            <p className="text-sm text-ink-muted">Welcome back to Expedia</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              placeholder="e.g. sarahc"
              className="w-full rounded-md border border-divider px-3 py-2 text-navy placeholder:text-ink-muted focus:border-action focus:ring-1 focus:ring-action focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="w-full rounded-md border border-divider px-3 py-2 text-navy placeholder:text-ink-muted focus:border-action focus:ring-1 focus:ring-action focus:outline-none"
            />
          </div>
          {error && (
            <div className="rounded-md bg-negative/10 border border-negative/30 px-3 py-2 text-sm text-negative">
              {error}
            </div>
          )}
          <Button type="submit" fullWidth disabled={loading || !username || !password}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>

          <details className="text-xs text-ink-muted border-t border-divider pt-3">
            <summary className="cursor-pointer hover:text-navy">
              Demo credentials (click to show)
            </summary>
            <div className="mt-2 space-y-0.5 font-mono">
              <div>sarahc · travel2026</div>
              <div>marcusj · travel2026</div>
              <div>priyap · travel2026</div>
              <div>diegor · travel2026</div>
              <div>emmaw · travel2026</div>
              <div className="italic pt-1">…and 5 more (see TEST_USERS.md)</div>
            </div>
          </details>
        </form>
      </div>
    </div>
  );
}
