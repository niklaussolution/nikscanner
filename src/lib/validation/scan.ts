import { z } from "zod";

export const scanRequestSchema = z.object({
  targetType: z.enum(["url", "domain", "ip"]),
  target: z.string().min(1).max(2048),
});

export type ScanRequest = z.infer<typeof scanRequestSchema>;

const IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/;

export function extractHostname(targetType: ScanRequest["targetType"], target: string): string {
  if (targetType === "ip") return target.trim();
  if (targetType === "domain") return target.trim().toLowerCase();
  try {
    const url = target.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//) ? target : `https://${target}`;
    return new URL(url).hostname.toLowerCase();
  } catch {
    return target;
  }
}

export const fileScanRequestSchema = z.object({
  targetType: z.literal("file"),
  sha256: z.string().regex(/^[a-f0-9]{64}$/i, "sha256 must be a 64-character hex digest"),
  fileName: z.string().min(1).max(255),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(32 * 1024 * 1024),
});

export type FileScanRequest = z.infer<typeof fileScanRequestSchema>;

export function isPlausibleTarget(targetType: ScanRequest["targetType"], target: string): boolean {
  const trimmed = target.trim();
  if (!trimmed) return false;
  if (targetType === "ip") return IPV4.test(trimmed) || trimmed.includes(":");
  if (targetType === "domain") return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(trimmed);
  try {
    const url = trimmed.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}
