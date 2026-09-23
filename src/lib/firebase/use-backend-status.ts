"use client";

import { useEffect, useState } from "react";

const NIKSCANNER_API_BASE_URL = process.env.NEXT_PUBLIC_NIKSCANNER_API_BASE_URL || "";
const POLL_INTERVAL_MS = 30_000;
const TIMEOUT_MS = 5_000;

export type BackendStatus = "checking" | "online" | "offline";

/** Polls the real NIKSCANNER backend's own health endpoint (GET /health — same backend the
 *  mobile app and every scanner on this site call) so an "engine online" indicator reflects
 *  whether the scanning backend is actually reachable, not a hardcoded always-on assumption.
 *  Starts as "checking" rather than assuming either state, and never claims "online" without a
 *  successful response. */
export function useBackendStatus(): BackendStatus {
  const [status, setStatus] = useState<BackendStatus>(() => (NIKSCANNER_API_BASE_URL ? "checking" : "offline"));

  useEffect(() => {
    if (!NIKSCANNER_API_BASE_URL) return;

    let cancelled = false;

    async function check() {
      try {
        const res = await fetch(`${NIKSCANNER_API_BASE_URL.replace(/\/+$/, "")}/health`, {
          cache: "no-store",
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        if (!cancelled) setStatus(res.ok ? "online" : "offline");
      } catch {
        if (!cancelled) setStatus("offline");
      }
    }

    check();
    const interval = setInterval(check, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return status;
}
