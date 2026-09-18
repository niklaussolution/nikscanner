import { z } from "zod";

export const THREAT_CATEGORIES = [
  "Phishing",
  "Malware",
  "Scam",
  "Credential Theft",
  "Spam",
  "Fake Website",
  "Crypto Scam",
  "Impersonation",
  "Suspicious Redirect",
  "Other",
] as const;

export const reportSchema = z.object({
  url: z.string().url().max(2048),
  threatType: z.enum(THREAT_CATEGORIES),
  reason: z.string().min(10).max(2000),
  evidence: z.string().max(2000).optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;
