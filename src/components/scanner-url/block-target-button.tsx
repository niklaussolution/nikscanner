"use client";

import { useState } from "react";
import { Ban, Loader2 } from "lucide-react";
import { authedJson } from "@/lib/firebase/api";
import { cn } from "@/lib/utils";

/** Community-block action for a scan result — shown after a URL or domain scan completes.
 *  Mirrors the mobile app's blockAsSuspicious()/auto-report flow: if the target is already on
 *  the shared community blocklist, shows who reported it first; otherwise offers a one-click
 *  "Block this" that reports it under the current signed-in user via the same /api/report the
 *  mobile app and the URL pipeline's auto-report both use. Domain scans get this too — the
 *  mobile app doesn't have a domain scanner, but the backend's blocklist is just keyed by a
 *  normalized URL, so a domain (as https://<hostname>) fits the exact same mechanism.
 *
 *  Styled to match the featured analysis card it sits next to (same border/padding/icon-badge
 *  weight) in both states — "already blocked" isn't a lesser, throwaway pill next to the big
 *  Phishing Signals card, it's an equally important result. */
export function BlockTargetButton({
  target,
  blocklistHit,
  blockedBy,
  suggestedCategory,
  targetLabel = "URL",
}: {
  target: string;
  blocklistHit?: boolean;
  blockedBy?: string;
  suggestedCategory: "malicious" | "phishing" | "suspicious" | "tracking";
  targetLabel?: string;
}) {
  const [status, setStatus] = useState<"idle" | "blocking" | "blocked" | "error">(blocklistHit ? "blocked" : "idle");
  const [localBlockedBy, setLocalBlockedBy] = useState<string | undefined>(blockedBy);
  const [error, setError] = useState<string | null>(null);

  async function handleBlock() {
    setStatus("blocking");
    setError(null);
    try {
      await authedJson<{ ok: boolean; duplicate: boolean }>("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target, category: suggestedCategory }),
      });
      setLocalBlockedBy("you");
      setStatus("blocked");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : `Could not block this ${targetLabel.toLowerCase()}.`);
    }
  }

  if (status === "blocked") {
    return (
      <div className="flex h-full w-full items-center gap-3 rounded-xl border border-[var(--danger)]/60 bg-[var(--surface-soft)] p-5 shadow-[0_0_0_1px_rgba(239,68,68,0.2),0_8px_24px_-8px_rgba(239,68,68,0.5)]">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 text-[var(--danger)]">
          <Ban className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold uppercase tracking-wide text-[var(--white)]">Community Blocklist</p>
          <p className="mt-0.5 truncate text-lg font-extrabold text-[var(--danger)]">Blocked by {localBlockedBy ?? "you"}</p>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleBlock}
      disabled={status === "blocking"}
      className={cn(
        "flex h-full w-full items-center gap-3 rounded-xl border border-[var(--danger)]/40 bg-[var(--surface-soft)] p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:bg-[var(--danger)]/5 disabled:opacity-60",
      )}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 text-[var(--danger)]">
        {status === "blocking" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Ban className="h-5 w-5" />}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold uppercase tracking-wide text-[var(--white)]">Not yet reported</p>
        <p className="mt-0.5 truncate text-lg font-extrabold text-[var(--danger)]">
          {status === "blocking" ? "Blocking..." : `Block this ${targetLabel}`}
        </p>
        {error && <p className="mt-1 truncate text-xs font-semibold normal-case text-[var(--danger)]">{error}</p>}
      </div>
    </button>
  );
}
