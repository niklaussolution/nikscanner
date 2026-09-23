export type ScanState = "idle" | "scanning" | "complete" | "error";

export const STAGES = ["Reputation", "SSL", "Redirects", "Content", "Verdict"] as const;
export type StageId = (typeof STAGES)[number];

export interface AnalysisCardData {
  id: string;
  icon: import("lucide-react").LucideIcon;
  title: string;
  value: string;
  tone: "neutral" | "safe" | "danger";
  /** Renders larger and visually distinct (spans two columns, highlighted border/glow) — for
   *  the one or two cards that matter most for a given scan type (e.g. Phishing Signals on the
   *  URL scanner, Behavior Analysis / ML Classifier on the file scanner). */
  featured?: boolean;
}
