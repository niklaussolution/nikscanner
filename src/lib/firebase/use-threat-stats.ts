"use client";

import { useEffect, useState } from "react";
import { publicJson } from "@/lib/firebase/api";
import type { ScanCategory } from "@/lib/scan/categorize";

export interface ThreatStatsDay {
  /** UTC day, YYYY-MM-DD. */
  date: string;
  url: number;
  file: number;
  domain: number;
  ip: number;
  qr: number;
  total: number;
}

export interface ThreatStats {
  category_window_days: number;
  categories: { category: ScanCategory; count: number }[];
  timeline: ThreatStatsDay[];
  updated_at: number;
}

type State = { data: ThreatStats | null; error: string | null };

// Both Threat Intelligence charts read the same response — share one request between them.
let pending: Promise<ThreatStats> | null = null;

function load(): Promise<ThreatStats> {
  pending ??= publicJson<ThreatStats>("/api/stats/threats").catch((e) => {
    pending = null; // let a later mount retry
    throw e;
  });
  return pending;
}

/** Real cross-user scan stats from GET /api/stats/threats (backend caches it for a minute). */
export function useThreatStats(): State {
  const [state, setState] = useState<State>({ data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    load()
      .then((data) => !cancelled && setState({ data, error: null }))
      .catch((e) => !cancelled && setState({ data: null, error: e instanceof Error ? e.message : "Failed to load stats." }));
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
