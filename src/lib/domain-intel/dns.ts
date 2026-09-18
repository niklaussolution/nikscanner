/**
 * Real DNS lookups via Cloudflare's DNS-over-HTTPS JSON API. Chosen over
 * Node's built-in `dns` module for two reasons: it works from any outbound-
 * HTTPS-capable environment, and the response's `AD` (Authenticated Data)
 * flag is a genuine DNSSEC-validation signal — Node's `dns` module only
 * returns resolved records, never the resolver's own validation flags, and
 * doesn't support querying DNSKEY directly.
 */

const DOH_ENDPOINT = "https://cloudflare-dns.com/dns-query";

interface DohAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface DohResponse {
  Status: number;
  AD?: boolean;
  Answer?: DohAnswer[];
}

const RR_TYPE = { A: 1, NS: 2, MX: 15, TXT: 16 } as const;

async function dohQuery(name: string, type: keyof typeof RR_TYPE, signal: AbortSignal): Promise<DohResponse | null> {
  try {
    const res = await fetch(`${DOH_ENDPOINT}?name=${encodeURIComponent(name)}&type=${type}`, {
      headers: { accept: "application/dns-json" },
      signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as DohResponse;
  } catch {
    return null;
  }
}

function stripQuotes(txt: string): string {
  return txt.replace(/^"|"$/g, "");
}

export interface DnsRecords {
  a: string[] | null;
  mx: { exchange: string; priority: number }[] | null;
  ns: string[] | null;
  spf: string | null;
  dmarc: string | null;
  dnssecSigned: boolean | null;
}

export async function lookupDnsRecords(hostname: string, timeoutMs = 6000): Promise<DnsRecords> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const [aRes, nsRes, mxRes, txtRes, dmarcRes] = await Promise.all([
      dohQuery(hostname, "A", controller.signal),
      dohQuery(hostname, "NS", controller.signal),
      dohQuery(hostname, "MX", controller.signal),
      dohQuery(hostname, "TXT", controller.signal),
      dohQuery(`_dmarc.${hostname}`, "TXT", controller.signal),
    ]);

    const a = aRes?.Answer?.filter((r) => r.type === RR_TYPE.A).map((r) => r.data) ?? null;
    const ns = nsRes?.Answer?.filter((r) => r.type === RR_TYPE.NS).map((r) => r.data.replace(/\.$/, "")) ?? null;
    const mx =
      mxRes?.Answer?.filter((r) => r.type === RR_TYPE.MX).map((r) => {
        const [priority, ...rest] = r.data.split(" ");
        return { priority: Number(priority) || 0, exchange: rest.join(" ").replace(/\.$/, "") };
      }) ?? null;

    const txtValues = txtRes?.Answer?.filter((r) => r.type === RR_TYPE.TXT).map((r) => stripQuotes(r.data)) ?? [];
    const spf = txtValues.find((v) => v.toLowerCase().startsWith("v=spf1")) ?? null;

    const dmarcValues = dmarcRes?.Answer?.filter((r) => r.type === RR_TYPE.TXT).map((r) => stripQuotes(r.data)) ?? [];
    const dmarc = dmarcValues.find((v) => v.toLowerCase().startsWith("v=dmarc1")) ?? null;

    // AD is only meaningful when at least one query actually resolved something to validate.
    const dnssecSigned = aRes && aRes.Status === 0 ? Boolean(aRes.AD) : null;

    return { a: a && a.length > 0 ? a : null, mx: mx && mx.length > 0 ? mx : null, ns: ns && ns.length > 0 ? ns : null, spf, dmarc, dnssecSigned };
  } finally {
    clearTimeout(timer);
  }
}
