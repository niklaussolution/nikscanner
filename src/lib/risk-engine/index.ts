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

/** Several demo/mock providers frequently share the exact same detail text (e.g. "Demo mode —
 *  provider API key not configured"), which would otherwise repeat near-verbatim in the
 *  evidence list under a different engine name each time. Deduplicated by value text so the
 *  displayed evidence — and the phishing-signal summary built from it — only shows each
 *  distinct signal once. */
export function buildEvidence(engines: EngineResult[]): ScanEvidence[] {
  const seen = new Set<string>();
  const evidence: ScanEvidence[] = [];
  for (const e of engines) {
    if (!e.detail || seen.has(e.detail)) continue;
    seen.add(e.detail);
    evidence.push({ label: e.name, value: e.detail, tone: "warn" });
  }
  return evidence;
}
