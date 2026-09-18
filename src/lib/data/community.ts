/**
 * Stable, clearly-labeled ("Demo Data") baseline for the /community page.
 * Real submissions made through /api/reports/url are layered on top of this
 * baseline (see /api/community/pulse and RecentReports), so the page is
 * never a pure fabrication — it's a fixed reference point plus genuine
 * live activity from this server's moderation queue.
 */

export const REPORT_CATEGORIES = [
  "Phishing",
  "Malware",
  "Credential Theft",
  "Crypto Scam",
  "Scam",
  "Suspicious Redirect",
  "Other",
] as const;

export const BASE_PULSE = {
  contributors: 12480,
  verifiedReports: 186250,
  accuracyPct: 94.2,
};

export type DemoReportStatus = "Verified" | "Under Review";

export interface DemoReport {
  id: string;
  domain: string;
  category: string;
  time: string;
  status: DemoReportStatus;
}

export const DEMO_REPORTS: DemoReport[] = [
  { id: "demo-1", domain: "secure-login-verify.xyz", category: "Phishing", time: "2 minutes ago", status: "Verified" },
  { id: "demo-2", domain: "free-crypto-airdrop.io", category: "Crypto Scam", time: "14 minutes ago", status: "Under Review" },
  { id: "demo-3", domain: "update-your-billing.net", category: "Credential Theft", time: "27 minutes ago", status: "Verified" },
  { id: "demo-4", domain: "download-cracked-app.ru", category: "Malware", time: "1 hour ago", status: "Verified" },
  { id: "demo-5", domain: "win-a-free-iphone-today.com", category: "Scam", time: "2 hours ago", status: "Under Review" },
];

export type ActivityKind = "verified" | "phishing" | "malware" | "reported";

export interface ActivityTickerItem {
  id: string;
  kind: ActivityKind;
  text: string;
  time: string;
}

export const ACTIVITY_TICKER_ITEMS: ActivityTickerItem[] = [
  { id: "a1", kind: "verified", text: "Threat verified in Germany", time: "2 minutes ago" },
  { id: "a2", kind: "phishing", text: "Phishing domain reported in India", time: "8 minutes ago" },
  { id: "a3", kind: "malware", text: "Malware link blocked in Brazil", time: "15 minutes ago" },
  { id: "a4", kind: "reported", text: "Suspicious site reported in Canada", time: "23 minutes ago" },
];

export const REWARD_PROGRESS = {
  currentXp: 680,
  targetXp: 1000,
};
