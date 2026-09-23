export type IpScanState = "idle" | "validating" | "scanning" | "complete" | "partial" | "error";

export const IP_STAGES = ["Geolocation", "ASN", "Privacy", "Abuse", "Verdict"] as const;
