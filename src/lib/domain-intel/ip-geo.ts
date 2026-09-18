/**
 * Real IP geolocation, ASN/ISP, reverse DNS, and proxy/hosting signal via
 * ip-api.com's free keyless tier (server-side only — their free tier is
 * HTTP-only, which is fine called from this Next.js API route but not
 * something to call directly from the browser).
 */
import { promises as dns } from "node:dns";

export interface IpGeoInfo {
  city: string | null;
  region: string | null;
  country: string | null;
  asn: string | null;
  asName: string | null;
  isp: string | null;
  org: string | null;
  hosting: boolean | null;
  proxy: boolean | null;
  mobile: boolean | null;
  reverseDns: string | null;
}

interface IpApiResponse {
  status: string;
  message?: string;
  country?: string;
  regionName?: string;
  city?: string;
  isp?: string;
  org?: string;
  as?: string;
  asname?: string;
  reverse?: string;
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
}

const FIELDS = "status,message,country,regionName,city,isp,org,as,asname,proxy,hosting,mobile,reverse,query";

export async function lookupIpGeo(ip: string, timeoutMs = 6000): Promise<IpGeoInfo | null> {
  try {
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=${FIELDS}`, {
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as IpApiResponse;
    if (data.status !== "success") return null;

    let reverseDns = data.reverse || null;
    try {
      const names = await dns.reverse(ip);
      if (names[0]) reverseDns = names[0];
    } catch {
      // fall back to ip-api's bundled reverse field, already assigned above
    }

    return {
      city: data.city ?? null,
      region: data.regionName ?? null,
      country: data.country ?? null,
      asn: data.as?.split(" ")[0] ?? null,
      asName: data.asname ?? null,
      isp: data.isp ?? null,
      org: data.org ?? null,
      hosting: data.hosting ?? null,
      proxy: data.proxy ?? null,
      mobile: data.mobile ?? null,
      reverseDns,
    };
  } catch {
    return null;
  }
}
