export type IpScanState = "idle" | "validating" | "scanning" | "complete" | "partial" | "error";

export const IP_STAGES = ["Geolocation", "ASN", "Privacy", "Abuse", "Verdict"] as const;

export interface RecentIpEntry {
  id: string;
  ip: string;
  label: string;
  verdict: "SAFE" | "LOW RISK" | "SUSPICIOUS" | "HIGH RISK" | "MALICIOUS";
  verdictTone: "safe" | "warning" | "danger";
  time: string;
}
