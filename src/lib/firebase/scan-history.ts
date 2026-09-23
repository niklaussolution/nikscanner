import { authedJson } from "@/lib/firebase/api";
import type { ScanHistoryEntry, ScanHistoryResult } from "@/lib/firebase/nikscanner-types";
import type { ScanTargetType } from "@/types/scan";

/** Fetches this signed-in user's own recent scans for one target type — replaces each scanner
 *  page's old hardcoded demo "recent scans" widget with real, per-user, per-type history.
 *  There's no server-side type filter on /api/scan/history, so this fetches a larger recent
 *  batch and filters client-side; fine at this scale, and avoids a backend change for what's
 *  purely a display concern. Returns [] (not a thrown error) when signed out or on failure —
 *  callers show an empty-state, not an error banner, for what's a non-critical widget. */
export async function fetchRecentScans(targetType: ScanTargetType, limit = 3): Promise<ScanHistoryEntry[]> {
  try {
    const res = await authedJson<ScanHistoryResult>("/api/scan/history?limit=50");
    return res.scans.filter((s) => s.target_type === targetType).slice(0, limit);
  } catch {
    return [];
  }
}
