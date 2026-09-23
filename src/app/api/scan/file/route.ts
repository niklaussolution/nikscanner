import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { fileScanRequestSchema } from "@/lib/validation/scan";
import { rateLimit, clientKeyFromRequest } from "@/lib/security/rate-limit";
import { providersFor } from "@/lib/providers";
import { computeRisk, buildEvidence } from "@/lib/risk-engine";
import { scoreToThreatLevel } from "@/types/scan";
import type { ScanResultPayload, EngineResult } from "@/types/scan";

export const runtime = "nodejs";

// The browser hashes the file locally (Web Crypto SHA-256) and only ever
// sends us that digest plus metadata — the raw file bytes never leave the
// client, matching the "NO FILE STORAGE" / "LOCAL SHA-256" trust promises
// on /scanner/file.
export async function POST(req: Request) {
  const clientKey = clientKeyFromRequest(req);
  const limit = rateLimit(`scan:file:${clientKey}`, 20, 60_000);
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

  const parsed = fileScanRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid file scan request.", issues: parsed.error.issues }, { status: 400 });
  }

  const { sha256, localSignatureVerdict, localSignatureDetail, mlVerdict, mlProbability } = parsed.data;

  const providers = providersFor("file");
  const engines: EngineResult[] = await Promise.all(
    providers.map((p) => p.run({ targetType: "file", target: sha256 })),
  );

  // The client-side signature scan (byte-pattern + zip-entry walk, see src/lib/file-scan) and,
  // for APK/PDF, the real EMBER2024 ML classifier both fold in as ordinary engines — a genuine
  // signature hit or ML "malicious" verdict corroborates with the mocked reputation engines the
  // same way any other engine's "detected" verdict would.
  if (localSignatureVerdict) {
    engines.unshift({
      id: "local-signature-scan",
      name: "Local Signature Scan",
      verdict: localSignatureVerdict === "detected" ? "detected" : "clean",
      detail: localSignatureDetail,
      configured: true,
    });
  }
  if (mlVerdict) {
    engines.unshift({
      id: "ember-ml-classifier",
      name: "ML Classifier (EMBER2024)",
      verdict: mlVerdict === "malicious" ? "detected" : mlVerdict === "suspicious" ? "suspicious" : "clean",
      detail: typeof mlProbability === "number" ? `Malicious probability: ${(mlProbability * 100).toFixed(1)}%` : undefined,
      configured: true,
    });
  }

  const risk = computeRisk(engines);

  // The mocked reputation providers require corroboration to reach a high score by design (no
  // single demo engine should dominate). A real, on-device signal shouldn't be diluted the same
  // way: an actual byte-pattern signature match is a certain detection (matches the mobile app's
  // "instant MALICIOUS" behavior), and a confident ML probability should floor the score at
  // least that high rather than getting averaged down by inconclusive demo engines.
  let score = risk.score;
  if (localSignatureVerdict === "detected") {
    score = Math.max(score, 100);
  }
  if (mlVerdict && typeof mlProbability === "number") {
    if (mlVerdict === "malicious") score = Math.max(score, Math.round(mlProbability * 100));
    else if (mlVerdict === "suspicious") score = Math.max(score, 45);
  }
  score = Math.max(0, Math.min(100, score));
  const threatLevel = scoreToThreatLevel(score);
  const confidence = risk.confidence;

  const externalProviders = providers.filter((p) => !["internal-engine", "community-reports"].includes(p.id));
  const isDemo = externalProviders.every((p) => !p.isConfigured());

  const payload: ScanResultPayload = {
    id: randomUUID(),
    targetType: "file",
    target: sha256,
    score,
    threatLevel,
    confidence,
    engines,
    evidence: buildEvidence(engines),
    createdAt: new Date().toISOString(),
    demo: isDemo,
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
