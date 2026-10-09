import nodeDns, { promises as dnsPromises } from "node:dns";
import type * as dns from "node:dns";
import net from "node:net";

/**
 * Blocks scan targets that resolve into private/internal network space so the
 * scanning subsystem cannot be abused as an SSRF proxy into internal infrastructure.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "ip6-localhost",
  "metadata.google.internal",
]);

// CIDR ranges that must never be reachable from the scan workers.
const BLOCKED_IPV4_RANGES: [string, number][] = [
  ["127.0.0.0", 8], // loopback
  ["10.0.0.0", 8], // private
  ["172.16.0.0", 12], // private
  ["192.168.0.0", 16], // private
  ["169.254.0.0", 16], // link-local / cloud metadata (169.254.169.254)
  ["100.64.0.0", 10], // carrier-grade NAT
  ["0.0.0.0", 8], // "this" network
  ["192.0.0.0", 24], // IETF protocol assignments
  ["198.18.0.0", 15], // benchmarking
  ["192.0.2.0", 24], // documentation (TEST-NET-1)
  ["198.51.100.0", 24], // documentation (TEST-NET-2)
  ["203.0.113.0", 24], // documentation (TEST-NET-3)
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reserved + broadcast (255.255.255.255)
];

function ipToInt(ip: string): number {
  return ip
    .split(".")
    .reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

function isIpv4InRange(ip: string, range: string, bits: number): boolean {
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipToInt(ip) & mask) === (ipToInt(range) & mask);
}

function isBlockedIpv4(ip: string): boolean {
  return BLOCKED_IPV4_RANGES.some(([range, bits]) => isIpv4InRange(ip, range, bits));
}

/** Expands any valid IPv6 literal (compressed, or with a trailing dotted IPv4 part) to its 8
 *  16-bit groups, so every embedded-IPv4 form can be checked numerically — WHATWG URL parsing
 *  rewrites [::ffff:127.0.0.1] to [::ffff:7f00:1], which a string-prefix check would miss. */
function ipv6Groups(ip: string): number[] | null {
  let addr = ip.toLowerCase().split("%")[0];
  const v4 = addr.match(/(\d+\.\d+\.\d+\.\d+)$/);
  if (v4) {
    if (!net.isIPv4(v4[1])) return null;
    const n = ipToInt(v4[1]);
    addr = addr.slice(0, -v4[1].length) + `${(n >>> 16).toString(16)}:${(n & 0xffff).toString(16)}`;
  }
  const halves = addr.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 1 ? missing !== 0 : missing < 0) return null;
  const groups = [...head, ...Array(halves.length === 2 ? missing : 0).fill("0"), ...tail].map((g) => parseInt(g, 16));
  return groups.length === 8 && groups.every((g) => Number.isInteger(g) && g >= 0 && g <= 0xffff) ? groups : null;
}

function groupsToIpv4(hi: number, lo: number): string {
  return [hi >>> 8, hi & 0xff, lo >>> 8, lo & 0xff].join(".");
}

function isBlockedIpv6(ip: string): boolean {
  const g = ipv6Groups(ip);
  if (!g) return true; // unparsable => fail closed
  const zeroUntil = (n: number) => g.slice(0, n).every((x) => x === 0);

  if (zeroUntil(8)) return true; // :: unspecified
  if (zeroUntil(7) && g[7] === 1) return true; // ::1 loopback
  if (zeroUntil(5) && g[5] === 0xffff) return isBlockedIpv4(groupsToIpv4(g[6], g[7])); // ::ffff:a.b.c.d mapped
  if (zeroUntil(6)) return isBlockedIpv4(groupsToIpv4(g[6], g[7])); // ::a.b.c.d (deprecated compatible)
  if (g[0] === 0x64 && g[1] === 0xff9b && g.slice(2, 6).every((x) => x === 0)) {
    return isBlockedIpv4(groupsToIpv4(g[6], g[7])); // 64:ff9b::/96 NAT64
  }
  if (g[0] === 0x2002) return isBlockedIpv4(groupsToIpv4(g[1], g[2])); // 2002::/16 6to4
  if ((g[0] & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
  if ((g[0] & 0xffc0) === 0xfec0) return true; // fec0::/10 site-local (deprecated)
  if ((g[0] & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
  if ((g[0] & 0xff00) === 0xff00) return true; // ff00::/8 multicast
  if (g[0] === 0x2001 && g[1] === 0x0db8) return true; // 2001:db8::/32 documentation
  return false;
}

export function isBlockedIp(ip: string): boolean {
  if (net.isIPv4(ip)) return isBlockedIpv4(ip);
  if (net.isIPv6(ip)) return isBlockedIpv6(ip);
  return true; // unrecognized => fail closed
}

export interface SsrfCheckResult {
  allowed: boolean;
  reason?: string;
  /** "unresolvable" (no DNS records / lookup failure) is a weaker signal than the target
   *  actually pointing at private/internal network space — callers that want to keep scanning
   *  a dead link (e.g. to score it) instead of hard-rejecting can key off this. */
  code?: "blocked_hostname" | "blocked_ip" | "unresolvable";
  resolvedIps?: string[];
}

/**
 * Resolves a hostname and rejects it if any resolved address (or the
 * hostname itself) falls inside private/internal/reserved network space.
 * Call this from server-side scan workers before making any outbound
 * request to a user-supplied target.
 */
export async function assertPublicHostname(hostname: string): Promise<SsrfCheckResult> {
  // URL.hostname keeps the brackets around IPv6 literals ("[::1]").
  const normalized = hostname.trim().toLowerCase().replace(/^\[(.*)\]$/, "$1");

  if (BLOCKED_HOSTNAMES.has(normalized)) {
    return { allowed: false, reason: "Target resolves to a blocked local hostname.", code: "blocked_hostname" };
  }
  if (normalized.endsWith(".local") || normalized.endsWith(".internal")) {
    return { allowed: false, reason: "Target uses a reserved internal TLD.", code: "blocked_hostname" };
  }
  if (net.isIP(normalized)) {
    if (isBlockedIp(normalized)) {
      return { allowed: false, reason: "Target IP is in a private/reserved range.", code: "blocked_ip" };
    }
    return { allowed: true, resolvedIps: [normalized] };
  }

  try {
    const records = await dnsPromises.lookup(normalized, { all: true, verbatim: true });
    const ips = records.map((r) => r.address);
    if (ips.length === 0) {
      return { allowed: false, reason: "Hostname did not resolve.", code: "unresolvable" };
    }
    const blocked = ips.filter(isBlockedIp);
    if (blocked.length > 0) {
      return {
        allowed: false,
        reason: `Target resolves to a blocked internal address (${blocked.join(", ")}).`,
        code: "blocked_ip",
        resolvedIps: ips,
      };
    }
    return { allowed: true, resolvedIps: ips };
  } catch {
    return { allowed: false, reason: "Hostname could not be resolved.", code: "unresolvable" };
  }
}

/** A `lookup` for http/https/tls connections that refuses to connect to any blocked address.
 *  The check happens on the exact addresses the socket is about to use, so a hostname that
 *  re-resolves to an internal IP after assertPublicHostname ran (DNS rebinding) is still refused. */
export function guardedLookup(
  hostname: string,
  options: dns.LookupOptions | number | undefined,
  callback: (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family?: number) => void,
): void {
  const opts: dns.LookupOptions = typeof options === "number" ? { family: options } : { ...(options ?? {}) };
  nodeDns.lookup(hostname, { ...opts, all: true, verbatim: true }, (err, addresses) => {
    if (err) return callback(err, "");
    const list = addresses as dns.LookupAddress[];
    const blocked = list.find((a) => isBlockedIp(a.address));
    if (list.length === 0 || blocked) {
      const e: NodeJS.ErrnoException = new Error(`Blocked internal address for ${hostname}`);
      e.code = "ESSRFBLOCKED";
      return callback(e, "");
    }
    if (opts.all) return callback(null, list);
    callback(null, list[0].address, list[0].family);
  });
}
