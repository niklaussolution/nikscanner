export type ScanTargetType = "url" | "file" | "domain" | "ip" | "qr";

export type ThreatLevel = "SAFE" | "LOW_RISK" | "SUSPICIOUS" | "HIGH_RISK" | "MALICIOUS";

/** Threat levels severe enough to count as "a threat found" in dashboard stats/charts. */
export const THREAT_SEVERITY_LEVELS = new Set<ThreatLevel>(["SUSPICIOUS", "HIGH_RISK", "MALICIOUS"]);

export type EngineVerdict = "clean" | "detected" | "suspicious" | "unknown";

export interface EngineResult {
  id: string;
  name: string;
  verdict: EngineVerdict;
  detail?: string;
  /** Whether this provider has a real API key configured (vs. demo mode). */
  configured?: boolean;
  /** True when the provider's request itself failed (timeout/network error), distinct from a demo/"unknown" verdict. */
  unavailable?: boolean;
}

export interface ScanEvidence {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "bad" | "warn";
}

export interface RedirectHopSummary {
  url: string;
  status: number | null;
}

export interface ScanResultPayload {
  id: string;
  targetType: ScanTargetType;
  target: string;
  score: number;
  threatLevel: ThreatLevel;
  confidence: number;
  engines: EngineResult[];
  evidence: ScanEvidence[];
  createdAt: string;
  demo: boolean;
  /** Present only for targetType "url": populated by the link-analysis pipeline
   *  (unmasking, redirect-following, community blocklist, phishing heuristics). */
  redirectChain?: RedirectHopSummary[];
  finalUrl?: string;
  unmasked?: boolean;
  shouldAutoReport?: boolean;
  autoReportCategory?: string;
  /** Community blocklist status — present for "url", "domain" and "ip" targets. `blockedBy` is the
   *  display name of whoever first reported it; absent/undefined when not blocklisted, so the
   *  UI can offer a "Block this" action instead. */
  blocklistHit?: boolean;
  blockedBy?: string;
}

export function scoreToThreatLevel(score: number): ThreatLevel {
  if (score <= 20) return "SAFE";
  if (score <= 40) return "LOW_RISK";
  if (score <= 60) return "SUSPICIOUS";
  if (score <= 80) return "HIGH_RISK";
  return "MALICIOUS";
}

export const THREAT_LEVEL_LABEL: Record<ThreatLevel, string> = {
  SAFE: "Safe",
  LOW_RISK: "Low Risk",
  SUSPICIOUS: "Suspicious",
  HIGH_RISK: "High Risk",
  MALICIOUS: "Malicious",
};

export interface DomainScanPayload extends ScanResultPayload {
  whois: {
    registrar: string | null;
    registrantOrg: string | null;
    createdDate: string | null;
  } | null;
  dns: {
    a: string[] | null;
    mx: { exchange: string; priority: number }[] | null;
    ns: string[] | null;
    spf: string | null;
    dmarc: string | null;
    dnssecSigned: boolean | null;
  };
  tls: {
    valid: boolean;
    protocol: string | null;
    validTo: string | null;
  } | null;
  ipInfo: {
    org: string | null;
    country: string | null;
  } | null;
  providerCount: number;
  partial: boolean;
}

export interface IpScanPayload extends ScanResultPayload {
  family: 4 | 6;
  geo: {
    city: string | null;
    region: string | null;
    country: string | null;
  } | null;
  network: {
    asn: string | null;
    asName: string | null;
    isp: string | null;
    org: string | null;
    hosting: boolean | null;
  } | null;
  reverseDns: string | null;
  privacy: {
    proxy: boolean | null;
    tor: boolean | null;
  };
  providerCount: number;
  partial: boolean;
}
