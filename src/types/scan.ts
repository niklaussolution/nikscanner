export type ScanTargetType = "url" | "file" | "domain" | "ip" | "qr";

export type ThreatLevel = "SAFE" | "LOW_RISK" | "SUSPICIOUS" | "HIGH_RISK" | "MALICIOUS";

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
