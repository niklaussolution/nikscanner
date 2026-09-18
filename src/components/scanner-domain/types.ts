export type DomainScanState = "idle" | "validating" | "scanning" | "complete" | "partial" | "error";

export const DOMAIN_STAGES = ["Whois", "DNS", "Email", "Blacklists", "Verdict"] as const;

export interface RecentDomainEntry {
  id: string;
  domain: string;
  verdict: "SAFE" | "LOW RISK" | "SUSPICIOUS" | "HIGH RISK" | "MALICIOUS";
  verdictTone: "safe" | "warning" | "danger";
  time: string;
}
