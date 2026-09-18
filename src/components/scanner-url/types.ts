export type ScanState = "idle" | "scanning" | "complete" | "error";

export const STAGES = ["Reputation", "SSL", "Redirects", "Content", "Verdict"] as const;
export type StageId = (typeof STAGES)[number];

export interface AnalysisCardData {
  id: string;
  icon: import("lucide-react").LucideIcon;
  title: string;
  value: string;
  tone: "neutral" | "safe" | "danger";
}
