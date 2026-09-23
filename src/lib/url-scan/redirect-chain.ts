import { assertPublicHostname } from "@/lib/security/ssrf";

// Mirrors RedirectChainResolver.kt: follows the redirect chain manually (redirects disabled
// on the fetch itself) so every hop can be inspected — status code, Location header, loops,
// timeouts, and DNS failures — instead of only seeing the final destination.

const MAX_HOPS = 12;
const HOP_TIMEOUT_MS = 5000;

export interface RedirectHop {
  url: string;
  status: number | null;
  error?: string;
}

export interface RedirectChainResult {
  hops: RedirectHop[];
  finalUrl: string;
  looped: boolean;
  timedOut: boolean;
  blockedBySsrf: boolean;
  dnsFailed: boolean;
  fetchFailed: boolean;
  hopCount: number;
}

export async function resolveRedirectChain(startUrl: string): Promise<RedirectChainResult> {
  const hops: RedirectHop[] = [];
  const visited = new Set<string>();
  let current = startUrl;
  let looped = false;
  let timedOut = false;
  let blockedBySsrf = false;
  let dnsFailed = false;
  let fetchFailed = false;

  for (let i = 0; i < MAX_HOPS; i++) {
    if (visited.has(current)) {
      looped = true;
      break;
    }
    visited.add(current);

    let hostname: string;
    try {
      hostname = new URL(current).hostname;
    } catch {
      hops.push({ url: current, status: null, error: "Malformed URL" });
      break;
    }

    // Re-checked on every hop, not just the entry URL — a redirect can point anywhere,
    // including internal network space (DNS-rebinding-style evasion).
    const ssrf = await assertPublicHostname(hostname);
    if (!ssrf.allowed) {
      if (ssrf.code === "unresolvable") {
        // A dead/never-registered host is a weaker signal than actually targeting internal
        // network space — record it as a scan finding and stop, rather than treating this
        // hop (or the whole scan) as blocked.
        dnsFailed = true;
        hops.push({ url: current, status: null, error: "DNS lookup failed — hostname does not resolve" });
      } else {
        blockedBySsrf = true;
        hops.push({ url: current, status: null, error: `Blocked: ${ssrf.reason}` });
      }
      break;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HOP_TIMEOUT_MS);
    try {
      const res = await fetch(current, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": "NikScannerBot/1.0 (+https://niklaussolution.com)" },
      });
      hops.push({ url: current, status: res.status });

      const isRedirect = res.status >= 300 && res.status < 400;
      const location = res.headers.get("location");
      if (!isRedirect || !location) break;

      current = new URL(location, current).toString();
    } catch (e) {
      const isAbort = e instanceof Error && e.name === "AbortError";
      timedOut = timedOut || isAbort;
      fetchFailed = fetchFailed || !isAbort;
      hops.push({ url: current, status: null, error: isAbort ? "Timed out" : "DNS/network failure" });
      break;
    } finally {
      clearTimeout(timer);
    }
  }

  return { hops, finalUrl: current, looped, timedOut, blockedBySsrf, dnsFailed, fetchFailed, hopCount: hops.length };
}
