/**
 * Real hosting-org/geolocation lookup for an IP, via ipwho.is (free, no API
 * key, HTTPS). Used to populate the "DNS & Hosting" org/country line —
 * genuinely resolved from the domain's own A record, not guessed.
 */
export interface IpInfo {
  org: string | null;
  country: string | null;
}

interface IpWhoIsResponse {
  success?: boolean;
  country?: string;
  connection?: { org?: string; isp?: string };
}

export async function lookupIpInfo(ip: string, timeoutMs = 5000): Promise<IpInfo | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, { signal: controller.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as IpWhoIsResponse;
    if (data.success === false) return null;
    const org = data.connection?.org ?? data.connection?.isp ?? null;
    const country = data.country ?? null;
    if (!org && !country) return null;
    return { org, country };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
