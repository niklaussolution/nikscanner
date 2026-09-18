import type { LeaderboardPeriod } from "@/lib/data/leaderboard";

export type { LeaderboardPeriod };

export interface RankedHunter {
  id: string;
  rank: number;
  trend: number | null; // rank change vs. the previous period snapshot; null = no prior data
  username: string;
  country: string;
  countryCode: string;
  title: string;
  points: number;
  reportsSubmitted: number;
  reportsVerified: number;
  accuracy: number;
}

export interface LeaderboardResponse {
  state: "ready" | "empty";
  period: LeaderboardPeriod;
  country: string;
  search: string;
  users: RankedHunter[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  metrics: {
    activeHunters: number;
    verifiedReports: number;
    countries: number;
    avgAccuracy: number;
  };
  season: {
    number: number;
    endsAt: string;
    targetVerifiedReports: number;
    verifiedReports: number;
  };
  countries: string[];
  demo: true;
}
