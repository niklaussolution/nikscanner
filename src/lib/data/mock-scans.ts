import type { ThreatLevel } from "@/types/scan";

export interface MockScan {
  id: string;
  target: string;
  type: "URL" | "File" | "Domain" | "IP";
  threatLevel: ThreatLevel;
  score: number;
  date: string;
}

export const MOCK_RECENT_SCANS: MockScan[] = [
  { id: "1", target: "invoice-payment-portal.net", type: "URL", threatLevel: "MALICIOUS", score: 91, date: "2026-09-15 09:12" },
  { id: "2", target: "github.com/vercel/next.js", type: "URL", threatLevel: "SAFE", score: 4, date: "2026-09-15 08:47" },
  { id: "3", target: "invoice_2024.pdf.exe", type: "File", threatLevel: "MALICIOUS", score: 97, date: "2026-09-14 22:03" },
  { id: "4", target: "198.51.100.24", type: "IP", threatLevel: "SUSPICIOUS", score: 54, date: "2026-09-14 19:31" },
  { id: "5", target: "cloudflare.com", type: "Domain", threatLevel: "SAFE", score: 2, date: "2026-09-14 14:12" },
  { id: "6", target: "free-gift-card-claim.info", type: "URL", threatLevel: "HIGH_RISK", score: 78, date: "2026-09-13 11:05" },
];
