"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SyncButton() {
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSync() {
    setState("running");
    setMessage("");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const json = await res.json();
      if (json.ok) {
        setState("done");
        setMessage(json.message);
        router.refresh(); // Re-fetch server component data
      } else {
        setState("error");
        setMessage(json.message);
      }
    } catch (e) {
      setState("error");
      setMessage(String(e));
    }
  }

  return (
    <div className="flex items-center gap-3">
      {message && (
        <span className={`text-xs ${state === "error" ? "text-red-600" : "text-green-700"}`}>
          {message}
        </span>
      )}
      <button
        onClick={handleSync}
        disabled={state === "running"}
        className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50 hover:bg-gray-800 transition-colors"
      >
        {state === "running" ? "⏳ Syncing…" : "⚡ Run Sync"}
      </button>
    </div>
  );
}
