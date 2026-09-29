import { THREAT_SEVERITY_LEVELS, type ScanResultPayload } from "@/types/scan";

export type ScanCategory = "botnet" | "malware" | "phishing" | "scam" | "spam" | "other";

export const SCAN_CATEGORY_LABEL: Record<ScanCategory, string> = {
  phishing: "Phishing",
  malware: "Malware",
  scam: "Scam",
  botnet: "Botnet",
  spam: "Spam",
  other: "Other",
};

/** Community blocklist categories (backend ALLOWED_CATEGORIES) → chart category. */
const BLOCKLIST_CATEGORY: Record<string, ScanCategory> = {
  phishing: "phishing",
  malicious: "malware",
  tracking: "spam",
  suspicious: "other",
};

/** Heuristic findings that are specifically phishing signals (src/lib/url-scan/heuristics.ts). */
const PHISHING_EVIDENCE = new Set([
  "Brand impersonation",
  "Homograph domain",
  "Phishing template",
  "Credentials in URL",
  "Compound risk",
  "Path signals",
]);

/** Which threat each live (API-key configured) provider specialises in. Demo-mode providers
 *  are ignored — their verdicts are seeded placeholders, not real detections. */
const ENGINE_CATEGORY: Record<string, ScanCategory> = {
  phishtank: "phishing",
  "google-safe-browsing": "phishing",
  urlhaus: "malware",
  virustotal: "malware",
  spamhaus: "spam",
  abuseipdb: "botnet",
};

type Categorizable = Pick<ScanResultPayload, "targetType" | "threatLevel" | "engines" | "evidence"> &
  Partial<Pick<ScanResultPayload, "autoReportCategory">>;

/** Threat category for a finished scan, derived only from what the scan actually found —
 *  strongest evidence first. Returns null for scans that weren't flagged (Safe / Low Risk),
 *  and "other" when something was flagged but nothing points to a specific category. */
export function categorizeScan(result: Categorizable): ScanCategory | null {
  if (!THREAT_SEVERITY_LEVELS.has(result.threatLevel)) return null;

  // 1. A community blocklist hit carries an explicit category ("... reported ... as phishing").
  for (const e of result.evidence) {
    const m = /reported by .+ as (\w+)$/.exec(e.value);
    if (m && BLOCKLIST_CATEGORY[m[1].toLowerCase()]) return BLOCKLIST_CATEGORY[m[1].toLowerCase()];
  }
  if (result.autoReportCategory && BLOCKLIST_CATEGORY[result.autoReportCategory]) {
    return BLOCKLIST_CATEGORY[result.autoReportCategory];
  }

  // 2. A flagged file is malware.
  if (result.targetType === "file") return "malware";

  // 3. Phishing heuristics on the link or, after redirects, its final destination.
  if (result.evidence.some((e) => PHISHING_EVIDENCE.has(e.label.replace(/^Destination: /, "")))) return "phishing";

  // 4. A live threat-intel provider that flagged it.
  for (const engine of result.engines) {
    if (engine.configured && !engine.unavailable && engine.verdict === "detected" && ENGINE_CATEGORY[engine.id]) {
      return ENGINE_CATEGORY[engine.id];
    }
  }

  return "other";
}
