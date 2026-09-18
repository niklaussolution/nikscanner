/**
 * Real Tor exit-node detection via the Tor Project's own published bulk
 * exit list (the same list https://check.torproject.org itself is backed
 * by). Fetched once and cached in-memory with a TTL — this is a ~1300-line
 * plaintext list, not something to re-fetch on every scan.
 */
const TOR_EXIT_LIST_URL = "https://check.torproject.org/torbulkexitlist";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let cache: { ips: Set<string>; fetchedAt: number } | null = null;
let inFlight: Promise<Set<string>> | null = null;

async function fetchExitList(): Promise<Set<string>> {
  const res = await fetch(TOR_EXIT_LIST_URL, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Tor exit list fetch failed: ${res.status}`);
  const text = await res.text();
  return new Set(text.split("\n").map((l) => l.trim()).filter(Boolean));
}

async function getExitList(): Promise<Set<string> | null> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) return cache.ips;

  if (!inFlight) {
    inFlight = fetchExitList().finally(() => {
      inFlight = null;
    });
  }

  try {
    const ips = await inFlight;
    cache = { ips, fetchedAt: now };
    return ips;
  } catch {
    // Serve a stale cache rather than failing the whole scan over a
    // transient fetch error, if we have one.
    return cache?.ips ?? null;
  }
}

/** Returns null when the exit list itself couldn't be obtained (unknown, not "not a Tor exit node"). */
export async function isTorExitNode(ip: string): Promise<boolean | null> {
  const list = await getExitList();
  if (!list) return null;
  return list.has(ip);
}
