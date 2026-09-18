import type { EngineResult, ScanEvidence } from "@/types/scan";
import { scoreToThreatLevel } from "@/types/scan";

const VERDICT_WEIGHT: Record<EngineResult["verdict"], number> = {
  clean: 0,
  unknown: 8,
  suspicious: 22,
  detected: 34,
};

export interface RiskAssessment {
  score: number;
  threatLevel: ReturnType<typeof scoreToThreatLevel>;
  confidence: number;
}

/**
 * Combines every engine's independent verdict into a single 0-100 score.
 * No single provider can push the score to MALICIOUS alone — corroboration
 * across engines is required, which keeps one noisy provider from dominating
 * the verdict.
 */
export function computeRisk(engines: EngineResult[]): RiskAssessment {
  const detected = engines.filter((e) => e.verdict === "detected").length;
  const suspicious = engines.filter((e) => e.verdict === "suspicious").length;

  let raw = engines.reduce((sum, e) => sum + VERDICT_WEIGHT[e.verdict], 0);

  // Corroboration bonus: multiple independent engines agreeing raises confidence
  // in the score disproportionately versus a single outlier.
  if (detected >= 2) raw += 15;
  if (detected >= 1 && suspicious >= 2) raw += 10;

  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const respondingEngines = engines.filter((e) => e.verdict !== "unknown").length;
  const confidence = Math.round(
    Math.min(100, (respondingEngines / Math.max(engines.length, 1)) * 100),
  );

  return { score, threatLevel: scoreToThreatLevel(score), confidence };
}

export function buildEvidence(engines: EngineResult[]): ScanEvidence[] {
  return engines
    .filter((e) => e.detail)
    .map((e) => ({ label: e.name, value: e.detail as string, tone: "warn" as const }));
}
