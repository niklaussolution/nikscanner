import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { scanRequestSchema, extractHostname, isPlausibleTarget } from "@/lib/validation/scan";
import { assertPublicHostname } from "@/lib/security/ssrf";
import { rateLimit, clientKeyFromRequest } from "@/lib/security/rate-limit";
import { providersFor } from "@/lib/providers";
import { computeRisk, buildEvidence } from "@/lib/risk-engine";
import { runUrlScanPipeline } from "@/lib/url-scan/pipeline";
import type { ScanResultPayload, EngineResult, ScanEvidence, ThreatLevel } from "@/types/scan";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const clientKey = clientKeyFromRequest(req);
  const limit = rateLimit(`scan:${clientKey}`, 20, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.resetMs / 1000)) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = scanRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid scan request.", issues: parsed.error.issues }, { status: 400 });
  }

  const { targetType, target } = parsed.data;

  if (!isPlausibleTarget(targetType, target)) {
    return NextResponse.json({ error: `Target does not look like a valid ${targetType}.` }, { status: 422 });
  }

  const hostname = extractHostname(targetType, target);

  // SSRF guard: refuse to let the scan workers touch private/internal network space. A URL
  // target whose host simply doesn't resolve is let through — the link pipeline scores that
  // as a finding (dead/throwaway phishing infra) instead of failing the scan outright.
  const ssrfCheck = await assertPublicHostname(hostname);
  const entryUnresolvable = !ssrfCheck.allowed && ssrfCheck.code === "unresolvable";
  if (!ssrfCheck.allowed && !(targetType === "url" && entryUnresolvable)) {
    return NextResponse.json({ error: `Target rejected: ${ssrfCheck.reason}` }, { status: 422 });
  }

  const providers = providersFor(targetType);
  const normalizedUrl = target.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//) ? target : `https://${target}`;

  const [engines, pipeline] = await Promise.all([
    Promise.all(providers.map((p) => p.run({ targetType, target, hostname }))),
    targetType === "url" ? runUrlScanPipeline(normalizedUrl) : Promise.resolve(null),
  ]);

  // Demo mode unless at least one external threat-intel provider has a real API key configured.
  const externalProviders = providers.filter((p) => !["internal-engine", "community-reports"].includes(p.id));
  const isDemo = externalProviders.every((p) => !p.isConfigured());

  let score: number;
  let threatLevel: ThreatLevel;
  let confidence: number;
  let evidence: ScanEvidence[];
  let allEngines: EngineResult[] = engines;

  if (pipeline) {
    // For URL targets, the link-analysis pipeline (unmask -> blocklist -> heuristics ->
    // redirect-follow -> re-check final destination) is the authoritative score — the mocked
    // threat-intel providers still run alongside it for the reputation card's engine tally.
    score = pipeline.score;
    threatLevel = pipeline.verdict === "CLEAN" ? "SAFE" : pipeline.verdict;
    confidence = 100;
    const pipelineEngine: EngineResult = {
      id: "link-pipeline",
      name: "Link Analysis Pipeline",
      verdict: pipeline.verdict === "MALICIOUS" ? "detected" : pipeline.verdict === "SUSPICIOUS" ? "suspicious" : "clean",
      detail: pipeline.evidence[0]?.value,
      configured: true,
    };
    allEngines = [pipelineEngine, ...engines];
    const seenValues = new Set<string>();
    evidence = [...pipeline.evidence, ...buildEvidence(engines)].filter((e) => {
      if (seenValues.has(e.value)) return false;
      seenValues.add(e.value);
      return true;
    });
  } else {
    const risk = computeRisk(engines);
    score = risk.score;
    threatLevel = risk.threatLevel;
    confidence = risk.confidence;
    evidence = buildEvidence(engines);
  }

  const payload: ScanResultPayload = {
    id: randomUUID(),
    targetType,
    target,
    score,
    threatLevel,
    confidence,
    engines: allEngines,
    evidence,
    createdAt: new Date().toISOString(),
    demo: isDemo,
    ...(pipeline
      ? {
          redirectChain: pipeline.redirectChain.map((h) => ({ url: h.url, status: h.status })),
          finalUrl: pipeline.finalUrl,
          unmasked: pipeline.unmasked,
          shouldAutoReport: pipeline.autoReportCategory !== null,
          ...(pipeline.autoReportCategory ? { autoReportCategory: pipeline.autoReportCategory } : {}),
          blocklistHit: pipeline.blocklistHit,
          ...(pipeline.blockedBy ? { blockedBy: pipeline.blockedBy } : {}),
        }
      : {}),
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
