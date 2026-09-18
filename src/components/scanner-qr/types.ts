export type QrScanState = "idle" | "decoding" | "scanning" | "complete" | "partial" | "error";

export const QR_STAGES = ["Upload", "Decode", "Resolve", "Reputation", "Verdict"] as const;
