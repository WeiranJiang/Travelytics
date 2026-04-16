"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const json = await res.json();
      if (!json.ok) { setError(json.error); return; }
      // Route based on role
      router.push(json.user.role === "admin" ? "/admin" : "/");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#001b37] flex flex-col items-center justify-center px-4">
      {/* Expedia-style logo */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
          <span className="text-[#001b37] font-bold text-lg">e</span>
        </div>
        <span className="text-white text-2xl font-bold">Travelytics</span>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-[#001b37] mb-1">Sign in</h1>
        <p className="text-sm text-gray-500 mb-6">Welcome back to Travelytics</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#001b37] mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              placeholder="e.g. sarahc"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-[#001b37] placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#001b37] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-[#001b37] placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full rounded-full bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Demo credentials */}
        <details className="mt-5 text-xs text-gray-400 border-t border-gray-100 pt-4">
          <summary className="cursor-pointer hover:text-[#001b37] font-medium select-none">
            Demo credentials (click to show)
          </summary>
          <div className="mt-3 space-y-2">
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="font-semibold text-amber-800 text-xs mb-1">⚡ Admin account</p>
              <p className="font-mono text-amber-900">admin · admin2026</p>
              <p className="text-amber-700 mt-0.5">→ Goes to the Gap Intelligence Dashboard</p>
            </div>
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
              <p className="font-semibold text-gray-700 text-xs mb-1">🧳 Guest accounts (any of these)</p>
              <div className="font-mono space-y-0.5 text-gray-600">
                <div>sarahc · travel2026</div>
                <div>marcusj · travel2026</div>
                <div>priyap · travel2026</div>
                <div className="italic text-gray-400">…and 7 more</div>
              </div>
              <p className="text-gray-500 mt-1">→ Goes to the hotel search</p>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
