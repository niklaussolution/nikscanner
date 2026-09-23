import type { ScanTargetType, ThreatLevel } from "@/types/scan";

/** Response/request shapes for the NIKSCANNER backend (same backend the mobile app uses,
 *  see F:\c\nikscanner-rebuild\backend\server.js) — called directly from the browser. */

export interface UserInitResult {
  ok: true;
  created: boolean;
  credits: number;
  file_scans_allowed: number;
  file_scans_used: number;
  pro_unlimited_url: boolean;
}

export interface PointsResult {
  uid: string;
  points: number;
}

export interface RankResult {
  rank: number | null;
  name: string;
  count: number;
}

export interface LeaderboardEntry {
  name: string;
  count: number;
  country: string | null;
}

export interface LeaderboardResult {
  leaders: LeaderboardEntry[];
}

export interface ProfileResult {
  country: string | null;
  deactivated: boolean;
}

export interface ProfileUpdateResult {
  ok: true;
  country: string | null;
}

export interface CreditsBalanceResult {
  credits: number;
  file_scans_allowed: number;
  file_scans_used: number;
  pro_unlimited_url: boolean;
  plan_key: string;
  plan_label: string;
}

export interface BlocklistEntry {
  url: string;
  category: string;
  reported_at: number;
}

export interface UserBlocklistResult {
  count: number;
  entries: BlocklistEntry[];
}

export interface LogScanInput {
  target: string;
  targetType: ScanTargetType;
  threatLevel: ThreatLevel;
  score: number;
}

export interface ScanHistoryEntry {
  id: string;
  target: string;
  target_type: ScanTargetType;
  threat_level: ThreatLevel;
  score: number;
  created_at: number;
}

export interface ScanHistoryResult {
  scans: ScanHistoryEntry[];
}

export interface BackendPlan {
  key: string;
  label: string;
  amount_rupees: number;
  credits: number;
  files: number;
  unlimited_url: boolean;
}

export interface PaymentPlansResult {
  plans: BackendPlan[];
}

export interface ConsumeCreditResult {
  ok: true;
  allowed: boolean;
  credits: number;
  file_scans_allowed: number;
  file_scans_used: number;
  pro_unlimited_url: boolean;
  plan_key: string;
  plan_label: string;
}

export interface CreateOrderResult {
  ok: true;
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  plan: string;
}

export interface CreditedAccountResult {
  ok: true;
  already_processed: boolean;
  credits: number;
  file_scans_allowed: number;
  pro_unlimited_url: boolean;
  plan_key: string;
  plan_label: string;
}

export interface PaymentStatusResult {
  ok: true;
  captured: boolean;
  already_processed?: boolean;
  credits?: number;
  file_scans_allowed?: number;
  pro_unlimited_url?: boolean;
  plan_key?: string;
  plan_label?: string;
}
