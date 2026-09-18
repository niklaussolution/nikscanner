/**
 * Deterministic demo community dataset — generated once at module load
 * (never regenerated per-request or per-render, and never touched by
 * `Math.random()`), since this project has no real user database wired yet
 * (see AGENTS.md). Every number the leaderboard UI shows is computed
 * server-side from this same dataset, so pagination totals, metric cards
 * and rankings all stay internally consistent — and the UI marks this
 * section "Demo Data", matching the convention AGENTS.md sets for exactly
 * this case ("dashboard stats, leaderboard, threat feed").
 */

export interface LeaderboardUser {
  id: string;
  username: string;
  country: string;
  countryCode: string;
  title: string;
  pointsGlobal: number;
  pointsWeekly: number;
  pointsMonthly: number;
  pointsAllTime: number;
  reportsSubmitted: number;
  reportsVerified: number;
  accuracy: number;
  firstAchievementAt: string; // ISO — used only as a final tie-breaker
  joinedAt: string; // ISO
}

export type LeaderboardPeriod = "global" | "weekly" | "monthly" | "alltime";

const COUNTRIES: { name: string; code: string }[] = [
  { name: "Germany", code: "DE" },
  { name: "Brazil", code: "BR" },
  { name: "Japan", code: "JP" },
  { name: "India", code: "IN" },
  { name: "Canada", code: "CA" },
  { name: "France", code: "FR" },
  { name: "Australia", code: "AU" },
  { name: "United Kingdom", code: "GB" },
  { name: "South Korea", code: "KR" },
  { name: "Nigeria", code: "NG" },
  { name: "United States", code: "US" },
  { name: "Netherlands", code: "NL" },
  { name: "Poland", code: "PL" },
  { name: "Spain", code: "ES" },
  { name: "Mexico", code: "MX" },
  { name: "South Africa", code: "ZA" },
  { name: "Sweden", code: "SE" },
  { name: "Singapore", code: "SG" },
  { name: "Italy", code: "IT" },
  { name: "Vietnam", code: "VN" },
];

const TITLES = [
  "Cyber Guardian",
  "Threat Hunter",
  "Security Sentinel",
  "Malware Analyst",
  "Phishing Sleuth",
  "Network Defender",
  "Incident Responder",
  "Vulnerability Scout",
];

const NAME_PREFIX = [
  "cyber", "null", "sentinel", "phish", "vortex", "octo", "redteam", "firewall", "cipher", "threat",
  "shadow", "byte", "ghost", "quantum", "iron", "crypto", "stealth", "vector", "zero", "delta",
  "raven", "flux", "nova", "apex", "onyx", "echo", "glitch", "hex", "storm", "frost",
];
const NAME_SUFFIX = [
  "guardian", "hunter", "watch", "shield", "slayer", "kai", "rae", "finn", "moon", "iris",
  "byte", "wolf", "hawk", "fox", "viper", "strike", "core", "node", "wraith", "sentry",
];

function seededFrac(seed: number): number {
  const n = Math.sin(seed * 12.9898) * 43758.5453;
  return n - Math.floor(n);
}

function buildDataset(count: number): LeaderboardUser[] {
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const users: LeaderboardUser[] = [];

  // The top 3 are hand-set to exactly match the product's reference design;
  // the rest are procedurally generated with a realistic descending curve.
  const seed: Omit<LeaderboardUser, "id" | "firstAchievementAt" | "joinedAt">[] = [
    {
      username: "cyber_guardian",
      country: "Germany",
      countryCode: "DE",
      title: "Cyber Guardian",
      pointsGlobal: 48210,
      pointsWeekly: 3120,
      pointsMonthly: 9840,
      pointsAllTime: 61450,
      reportsSubmitted: 812,
      reportsVerified: 774,
      accuracy: 95,
    },
    {
      username: "nullbyte_hunter",
      country: "Brazil",
      countryCode: "BR",
      title: "Threat Hunter",
      pointsGlobal: 41880,
      pointsWeekly: 2640,
      pointsMonthly: 8210,
      pointsAllTime: 55870,
      reportsSubmitted: 703,
      reportsVerified: 651,
      accuracy: 92,
    },
    {
      username: "sentinel_kai",
      country: "Japan",
      countryCode: "JP",
      title: "Security Sentinel",
      pointsGlobal: 38440,
      pointsWeekly: 2980,
      pointsMonthly: 7650,
      pointsAllTime: 49120,
      reportsSubmitted: 690,
      reportsVerified: 628,
      accuracy: 91,
    },
  ];

  for (let i = 0; i < count; i++) {
    if (i < seed.length) {
      const s = seed[i];
      users.push({
        ...s,
        id: `hunter-${i + 1}`,
        firstAchievementAt: new Date(now - (400 - i) * DAY_MS).toISOString(),
        joinedAt: new Date(now - (900 - i * 3) * DAY_MS).toISOString(),
      });
      continue;
    }

    const prefix = NAME_PREFIX[i % NAME_PREFIX.length];
    const suffix = NAME_SUFFIX[Math.floor(i / NAME_PREFIX.length) % NAME_SUFFIX.length];
    const username = `${prefix}_${suffix}${i > NAME_PREFIX.length * NAME_SUFFIX.length ? i : ""}`;
    const country = COUNTRIES[i % COUNTRIES.length];

    // Smooth descending curve so points/rank order stays monotonic, with
    // per-user jitter so it doesn't look like a straight line.
    const decay = 36000 * Math.exp(-i / 55);
    const jitter = seededFrac(i * 7.13) * 1400;
    const pointsGlobal = Math.max(120, Math.round(decay + jitter));
    const reportsSubmitted = Math.max(4, Math.round(pointsGlobal / 58 + seededFrac(i * 3.7) * 12));
    const verifiedRatio = 0.75 + seededFrac(i * 5.1) * 0.2;
    const reportsVerified = Math.min(reportsSubmitted, Math.round(reportsSubmitted * verifiedRatio));
    const accuracy = Math.min(99, Math.max(55, Math.round(verifiedRatio * 100 - seededFrac(i * 9.3) * 8)));

    users.push({
      id: `hunter-${i + 1}`,
      username,
      country: country.name,
      countryCode: country.code,
      title: TITLES[i % TITLES.length],
      pointsGlobal,
      pointsWeekly: Math.round(pointsGlobal * (0.04 + seededFrac(i * 2.2) * 0.05)),
      pointsMonthly: Math.round(pointsGlobal * (0.15 + seededFrac(i * 4.4) * 0.1)),
      pointsAllTime: Math.round(pointsGlobal * (1.15 + seededFrac(i * 6.6) * 0.4)),
      reportsSubmitted,
      reportsVerified,
      accuracy,
      firstAchievementAt: new Date(now - (700 - i * 2) * DAY_MS).toISOString(),
      joinedAt: new Date(now - (1200 - i * 4) * DAY_MS).toISOString(),
    });
  }

  return users;
}

// Built once at module load — stable across requests within this process.
export const LEADERBOARD_DATASET: LeaderboardUser[] = buildDataset(212);

export const LEADERBOARD_COUNTRIES = COUNTRIES;

export function pointsForPeriod(user: LeaderboardUser, period: LeaderboardPeriod): number {
  switch (period) {
    case "weekly":
      return user.pointsWeekly;
    case "monthly":
      return user.pointsMonthly;
    case "alltime":
      return user.pointsAllTime;
    default:
      return user.pointsGlobal;
  }
}

export const ACHIEVEMENTS = [
  { id: "phishing-hunter", title: "Phishing Hunter", desc: "Verify 25 phishing reports", requirement: 25, metric: "verifiedPhishing" as const },
  { id: "malware-hunter", title: "Malware Hunter", desc: "Verify 25 malware reports", requirement: 25, metric: "verifiedMalware" as const },
  { id: "url-guardian", title: "URL Guardian", desc: "Block 50 malicious URLs", requirement: 50, metric: "blockedUrls" as const },
  { id: "community-defender", title: "Community Defender", desc: "Maintain 90%+ accuracy", requirement: 90, metric: "accuracy" as const },
];

export const SEASON = {
  number: 4,
  endsAt: (() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 12);
    d.setUTCHours(d.getUTCHours() + 6, 0, 0, 0);
    return d.toISOString();
  })(),
  targetVerifiedReports: 25000,
};
