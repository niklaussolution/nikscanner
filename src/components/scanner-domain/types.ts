export type DomainScanState = "idle" | "validating" | "scanning" | "complete" | "partial" | "error";

export const DOMAIN_STAGES = ["Whois", "DNS", "Email", "Blacklists", "Verdict"] as const;
