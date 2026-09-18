/**
 * IP-address validation, dependency-free and isomorphic (usable client and
 * server side). IPv4 is checked with strict octet parsing (no leading
 * zeros, which some parsers misread as octal); IPv6 literals are validated
 * by handing them to the WHATWG URL constructor's own bracket-literal
 * parser (`new URL("http://[...]")`) rather than hand-rolling a parser for
 * every compressed/mixed representation.
 */

export type IpCategory = "public" | "private" | "loopback" | "link-local" | "multicast" | "documentation" | "unspecified" | "reserved";

export interface IpValidationResult {
  ok: boolean;
  address?: string;
  family?: 4 | 6;
  category?: IpCategory;
  error?: string;
}

const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

function parseIpv4Octets(input: string): number[] | null {
  const m = input.match(IPV4_RE);
  if (!m) return null;
  const octets: number[] = [];
  for (let i = 1; i <= 4; i++) {
    const raw = m[i];
    if (raw.length > 1 && raw.startsWith("0")) return null; // ambiguous leading zero
    const value = Number(raw);
    if (value < 0 || value > 255) return null;
    octets.push(value);
  }
  return octets;
}

function classifyIpv4(octets: number[]): IpCategory {
  const [a, b, c, d] = octets;
  if (a === 0) return "unspecified";
  if (a === 127) return "loopback";
  if (a === 10) return "private";
  if (a === 172 && b >= 16 && b <= 31) return "private";
  if (a === 192 && b === 168) return "private";
  if (a === 169 && b === 254) return "link-local";
  if (a === 100 && b >= 64 && b <= 127) return "reserved"; // carrier-grade NAT
  if (a === 192 && b === 0 && c === 2) return "documentation"; // TEST-NET-1
  if (a === 198 && b === 51 && c === 100) return "documentation"; // TEST-NET-2
  if (a === 203 && b === 0 && c === 113) return "documentation"; // TEST-NET-3
  if (a === 198 && (b === 18 || b === 19)) return "reserved"; // benchmarking
  if (a >= 224 && a <= 239) return "multicast";
  if (a === 255 && b === 255 && c === 255 && d === 255) return "reserved"; // limited broadcast
  return "public";
}

function classifyIpv6(addr: string): IpCategory {
  const lower = addr.toLowerCase();
  if (lower === "::") return "unspecified";
  if (lower === "::1") return "loopback";
  if (lower.startsWith("fe80:")) return "link-local";
  if (lower.startsWith("ff")) return "multicast"; // ff00::/8
  if (lower.startsWith("fc") || lower.startsWith("fd")) return "private"; // unique local fc00::/7
  if (lower.startsWith("2001:db8")) return "documentation";
  if (lower.startsWith("::ffff:")) {
    const mapped = lower.split(":").pop();
    if (mapped) {
      const octets = parseIpv4Octets(mapped);
      if (octets) return classifyIpv4(octets);
    }
  }
  return "public";
}

export function normalizeAndValidateIp(input: string): IpValidationResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "Enter an IP address to scan." };
  if (/\s/.test(trimmed)) return { ok: false, error: "IP address cannot contain spaces." };
  if (/[<>"'`]/.test(trimmed)) return { ok: false, error: "IP address contains invalid characters." };
  if (trimmed.includes("/")) return { ok: false, error: "CIDR ranges aren't supported — enter a single IP address." };
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) return { ok: false, error: "Enter an IP address, not a URL." };

  // Port suffixes are rejected outright rather than silently stripped —
  // "8.8.8.8:443" or "[::1]:443" is ambiguous input, not a normalization case.
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(trimmed)) {
    return { ok: false, error: "Enter just the IP address, without a port." };
  }
  if (/^\[.+\]:\d+$/.test(trimmed)) {
    return { ok: false, error: "Enter just the IP address, without a port." };
  }

  let candidate = trimmed;
  const bracketMatch = candidate.match(/^\[(.+)\]$/);
  if (bracketMatch) candidate = bracketMatch[1];

  const ipv4Octets = parseIpv4Octets(candidate);
  if (ipv4Octets) {
    return { ok: true, address: candidate, family: 4, category: classifyIpv4(ipv4Octets) };
  }

  if (candidate.includes(":")) {
    try {
      const url = new URL(`http://[${candidate}]`);
      const normalized = url.hostname.replace(/^\[|\]$/g, "");
      return { ok: true, address: normalized, family: 6, category: classifyIpv6(normalized) };
    } catch {
      return { ok: false, error: "Enter a valid IPv6 address." };
    }
  }

  if (/[a-zA-Z]/.test(trimmed)) {
    return { ok: false, error: "Enter an IP address, not a domain name." };
  }

  return { ok: false, error: "Enter a valid IPv4 or IPv6 address." };
}
