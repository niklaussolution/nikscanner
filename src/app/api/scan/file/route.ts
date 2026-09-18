import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { fileScanRequestSchema } from "@/lib/validation/scan";
import { rateLimit, clientKeyFromRequest } from "@/lib/security/rate-limit";
import { providersFor } from "@/lib/providers";
import { computeRisk, buildEvidence } from "@/lib/risk-engine";
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

  const { sha256 } = parsed.data;

  const providers = providersFor("file");
  const engines: EngineResult[] = await Promise.all(
    providers.map((p) => p.run({ targetType: "file", target: sha256 })),
  );

  const { score, threatLevel, confidence } = computeRisk(engines);
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
