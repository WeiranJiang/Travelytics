import { Heart, Globe, UserCircle2, LogOut } from 'lucide-react';
import type { User } from '@/api/types';

export function Header({
  onHomeClick,
  user,
  onSignInClick,
  onSignOut,
}: {
  onHomeClick?: () => void;
  user: User | null;
  onSignInClick: () => void;
  onSignOut: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-divider">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button onClick={onHomeClick} className="focus:outline-none">
            <Logo />
          </button>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-navy">
            <button onClick={onHomeClick} className="hover:text-action">Stays</button>
            <button className="hover:text-action">Flights</button>
            <button className="hover:text-action">Cars</button>
            <button className="hover:text-action">Packages</button>
            <button className="hover:text-action">Things to do</button>
          </nav>
        </div>
        <div className="flex items-center gap-2 text-navy">
          <button className="p-2 rounded-full hover:bg-action-subtle" aria-label="Language">
            <Globe size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-action-subtle" aria-label="Saved">
            <Heart size={20} />
          </button>
          {user ? (
            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-divider">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-navy text-white text-sm font-semibold flex items-center justify-center">
                  {user.initial}
                </div>
                <div className="hidden sm:block text-sm">
                  <div className="font-semibold text-navy leading-tight">{user.full_name}</div>
                  <div className="text-xs text-ink-muted leading-tight">@{user.username}</div>
                </div>
              </div>
              <button
                onClick={onSignOut}
                className="p-2 rounded-full hover:bg-action-subtle"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignInClick}
              className="flex items-center gap-2 text-sm font-medium hover:text-action px-3 py-2 rounded-full"
            >
              <UserCircle2 size={22} />
              <span className="hidden sm:inline">Sign in</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-1.5 font-bold text-2xl text-navy">
      <div className="relative w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center">
        <span className="text-navy text-lg font-bold">e</span>
      </div>
      <span className="tracking-tight">expedia</span>
    </div>
  );
}
