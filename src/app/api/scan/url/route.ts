import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { scanRequestSchema, extractHostname, isPlausibleTarget } from "@/lib/validation/scan";
import { assertPublicHostname } from "@/lib/security/ssrf";
import { rateLimit, clientKeyFromRequest } from "@/lib/security/rate-limit";
import { providersFor } from "@/lib/providers";
import { computeRisk, buildEvidence } from "@/lib/risk-engine";
import type { ScanResultPayload, EngineResult } from "@/types/scan";

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

  // SSRF guard: refuse to let the scan workers touch private/internal network space.
  const ssrfCheck = await assertPublicHostname(hostname);
  if (!ssrfCheck.allowed) {
    return NextResponse.json({ error: `Target rejected: ${ssrfCheck.reason}` }, { status: 422 });
  }

  const providers = providersFor(targetType);
  const engines: EngineResult[] = await Promise.all(
    providers.map((p) => p.run({ targetType, target, hostname })),
  );

  const { score, threatLevel, confidence } = computeRisk(engines);
  // Demo mode unless at least one external threat-intel provider has a real API key configured.
  const externalProviders = providers.filter((p) => !["internal-engine", "community-reports"].includes(p.id));
  const isDemo = externalProviders.every((p) => !p.isConfigured());

  const payload: ScanResultPayload = {
    id: randomUUID(),
    targetType,
    target,
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
