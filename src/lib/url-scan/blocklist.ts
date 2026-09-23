// Checks the shared community blocklist that already exists on the NIKSCANNER backend (the
// same backend the mobile app uses — see BlocklistDb in the mobile app, and /api/blocklist in
// F:\c\nikscanner-rebuild\backend\server.js). There's no per-URL lookup endpoint, only a bulk
// listing, so this fetches the full list and caches it briefly in-process to avoid re-fetching
// on every scan.

const NIKSCANNER_API_BASE_URL = process.env.NEXT_PUBLIC_NIKSCANNER_API_BASE_URL || "";
const CACHE_TTL_MS = 60_000;
const FETCH_TIMEOUT_MS = 4000;

interface BlocklistDetails {
  category: string;
  blockedBy: string;
}

let cache: { at: number; urls: Map<string, BlocklistDetails> } | null = null;

/** Same normalization the backend applies before storing a report, so lookups here match
 *  entries written by /api/report (forces https, strips to origin+pathname+search). */
function normalizeUrl(raw: string): string | null {
  let url = raw.trim();
  if (!url || url.length > 2048) return null;
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    const u = new URL(url);
    if (!u.hostname) return null;
    return u.origin + u.pathname + u.search;
  } catch {
    return null;
  }
}

async function getBlocklistMap(): Promise<Map<string, BlocklistDetails> | null> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.urls;
  if (!NIKSCANNER_API_BASE_URL) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${NIKSCANNER_API_BASE_URL.replace(/\/+$/, "")}/api/blocklist?limit=20000`, {
      signal: controller.signal,
    });
    if (!res.ok) return cache?.urls ?? null;
    const data = (await res.json()) as { entries?: { url: string; category: string; blocked_by?: string }[] };
    const urls = new Map<string, BlocklistDetails>();
    for (const entry of data.entries ?? []) urls.set(entry.url, { category: entry.category, blockedBy: entry.blocked_by || "a community member" });
    cache = { at: Date.now(), urls };
    return urls;
  } catch {
    // Unreachable backend degrades to "no blocklist data" rather than failing the scan —
    // matches how the rest of this pipeline treats infrastructure it doesn't control.
    return cache?.urls ?? null;
  } finally {
    clearTimeout(timer);
  }
}

export interface BlocklistHit {
  hit: boolean;
  category?: string;
  blockedBy?: string;
}

/** Returns null when the blocklist itself is unavailable (unset/unreachable backend) —
 *  distinct from `{hit: false}`, which means the blocklist was checked and had no match. */
export async function checkBlocklist(rawUrl: string): Promise<BlocklistHit | null> {
  const normalized = normalizeUrl(rawUrl);
  if (!normalized) return null;
  const map = await getBlocklistMap();
  if (!map) return null;
  const details = map.get(normalized);
  return details ? { hit: true, category: details.category, blockedBy: details.blockedBy } : { hit: false };
}
