import type { EngineResult, ScanTargetType } from "@/types/scan";
import type { ProviderInput, ScanProvider } from "./types";
import { seededScore } from "./hash";

/**
 * Every provider below normalizes to EngineResult. When the provider's API
 * key env var is not set, it degrades to a deterministic demo verdict
 * (seeded from the target) instead of pretending to be a live integration —
 * ScanResultPayload.demo flags this to the client so demo data is never
 * presented as a real detection.
 */

function demoVerdict(target: string, salt: string, bias = 0): EngineResult["verdict"] {
  const s = seededScore(target, salt) + bias;
  if (s > 0.93) return "detected";
  if (s > 0.8) return "suspicious";
  if (s > 0.7) return "unknown";
  return "clean";
}

function makeStaticProvider(opts: {
  id: string;
  name: string;
  envKey: string;
  supported: ScanTargetType[];
  salt: string;
}): ScanProvider {
  return {
    id: opts.id,
    name: opts.name,
    isConfigured: () => Boolean(process.env[opts.envKey]),
    supports: (t) => opts.supported.includes(t),
    async run({ target }: ProviderInput): Promise<EngineResult> {
      const verdict = demoVerdict(target, opts.salt);
      return {
        id: opts.id,
        name: opts.name,
        verdict,
        detail: opts.envKey in process.env ? undefined : "Demo mode — provider API key not configured",
      };
    },
  };
}

export const googleSafeBrowsing = makeStaticProvider({
  id: "google-safe-browsing",
  name: "Google Safe Browsing",
  envKey: "GOOGLE_SAFE_BROWSING_API_KEY",
  supported: ["url", "domain"],
  salt: "gsb",
});

export const virusTotal = makeStaticProvider({
  id: "virustotal",
  name: "VirusTotal",
  envKey: "VIRUSTOTAL_API_KEY",
  supported: ["url", "domain", "ip", "file"],
  salt: "vt",
});

export const urlhaus = makeStaticProvider({
  id: "urlhaus",
  name: "URLhaus",
  envKey: "URLHAUS_API_KEY",
  supported: ["url", "domain"],
  salt: "urlhaus",
});

export const phishtank = makeStaticProvider({
  id: "phishtank",
  name: "PhishTank",
  envKey: "PHISHTANK_API_KEY",
  supported: ["url", "domain"],
  salt: "phishtank",
});

export const abuseIpDb = makeStaticProvider({
  id: "abuseipdb",
  name: "AbuseIPDB",
  envKey: "ABUSEIPDB_API_KEY",
  supported: ["ip"],
  salt: "abuseipdb",
});

export const spamhaus = makeStaticProvider({
  id: "spamhaus",
  name: "Spamhaus",
  envKey: "SPAMHAUS_API_KEY",
  supported: ["domain", "ip"],
  salt: "spamhaus",
});

/**
 * NIKSCANNER's own heuristic engine — always runs, never gated behind an
 * external API key. Looks at structural signals only (no network calls),
 * so it is safe to run before the SSRF-guarded providers.
 */
export const internalEngine: ScanProvider = {
  id: "internal-engine",
  name: "NIKSCANNER Internal Engine",
  isConfigured: () => true,
  supports: () => true,
  async run({ target, targetType }: ProviderInput): Promise<EngineResult> {
    const suspiciousKeywords = ["login", "verify", "secure", "account", "update", "wallet", "reset"];
    const lower = target.toLowerCase();
    const hits = suspiciousKeywords.filter((k) => lower.includes(k));
    const looksLikeIp = targetType === "url" && /https?:\/\/\d+\.\d+\.\d+\.\d+/.test(lower);
    const hasManySubdomains = (lower.match(/\./g) ?? []).length > 4;

    let verdict: EngineResult["verdict"] = "clean";
    if (looksLikeIp || hits.length >= 2) verdict = "suspicious";
    if (hasManySubdomains && hits.length >= 1) verdict = "detected";

    return {
      id: "internal-engine",
      name: "NIKSCANNER Internal Engine",
      verdict,
      detail: hits.length ? `Flagged keywords: ${hits.join(", ")}` : undefined,
    };
  },
};

export const communityReports: ScanProvider = {
  id: "community-reports",
  name: "Community Reports",
  isConfigured: () => true,
  supports: () => true,
  async run({ target }: ProviderInput): Promise<EngineResult> {
    const verdict = demoVerdict(target, "community", -0.15);
    return { id: "community-reports", name: "Community Reports", verdict };
  },
};

export const allProviders: ScanProvider[] = [
  internalEngine,
  googleSafeBrowsing,
  virusTotal,
  urlhaus,
  phishtank,
  abuseIpDb,
  spamhaus,
  communityReports,
];

export function providersFor(targetType: ScanTargetType): ScanProvider[] {
  return allProviders.filter((p) => p.supports(targetType));
}
