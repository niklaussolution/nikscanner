import { promises as dns } from "node:dns";
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

function isBlockedIpv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1") return true; // loopback
  if (lower.startsWith("fe80:")) return true; // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local
  if (lower.startsWith("::ffff:")) {
    const mapped = lower.split(":").pop();
    if (mapped && net.isIPv4(mapped)) return isBlockedIpv4(mapped);
  }
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
  const normalized = hostname.trim().toLowerCase();

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
    const records = await dns.lookup(normalized, { all: true, verbatim: true });
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
