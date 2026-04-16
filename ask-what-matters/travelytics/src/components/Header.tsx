"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SessionUser {
  username: string;
  full_name: string;
  initial: string;
  role: "admin" | "user";
}

function parseSession(): SessionUser | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/awm_session=([^;]+)/);
  if (!match) return null;
  try { return JSON.parse(decodeURIComponent(match[1])); } catch { return null; }
}

export function Header() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => { setUser(parseSession()); }, []);

  if (pathname === "/login") return null;

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  }

  return (
    <header className="border-b bg-white px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
            <span className="text-[#001b37] font-bold text-sm">e</span>
          </div>
          <span className="font-bold text-[#001b37] text-lg">Travelytics</span>
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm text-gray-600">
          <Link href="/" className="hover:text-[#001b37] font-medium border-b-2 border-blue-600 pb-0.5 text-[#001b37]">Stays</Link>
          <span className="cursor-default">Flights</span>
          <span className="cursor-default">Cars</span>
          <span className="cursor-default">Packages</span>
          <span className="cursor-default">Things to do</span>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {user?.role === "admin" && (
          <Link href="/admin" className="text-xs font-medium text-blue-700 border border-blue-200 bg-blue-50 rounded-full px-3 py-1 hover:bg-blue-100">
            ⚡ Admin
          </Link>
        )}
        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/favorites" className="text-gray-500 hover:text-red-500 transition-colors" title="Favorites">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#191E3B] flex items-center justify-center text-white text-sm font-bold">
                {user.initial}
              </div>
            <span className="text-sm text-gray-700 hidden md:block">{user.full_name}</span>
            <button
              onClick={handleSignOut}
              className="text-xs text-gray-500 hover:text-red-600 border border-gray-200 rounded-full px-3 py-1"
            >
              Sign out
            </button>
            </div>
          </div>
        ) : (
          <Link href="/login" className="text-sm font-medium text-[#001b37] border border-gray-300 rounded-full px-4 py-1.5 hover:bg-gray-50">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
