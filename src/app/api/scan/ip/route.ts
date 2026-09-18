import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { normalizeAndValidateIp } from "@/lib/validation/ip";
import { isBlockedIp } from "@/lib/security/ssrf";
import { rateLimit, clientKeyFromRequest } from "@/lib/security/rate-limit";
import { providersFor } from "@/lib/providers";
import { computeRisk, buildEvidence } from "@/lib/risk-engine";
import { lookupIpGeo } from "@/lib/domain-intel/ip-geo";
import { isTorExitNode } from "@/lib/domain-intel/tor-exit-list";
import type { IpScanPayload, EngineResult } from "@/types/scan";

export const runtime = "nodejs";

const requestSchema = z.object({
  targetType: z.literal("ip"),
  target: z.string().min(1).max(64),
});

const CATEGORY_LABEL: Record<string, string> = {
  private: "a private (RFC 1918) address",
  loopback: "a loopback address",
  "link-local": "a link-local address",
  multicast: "a multicast address",
  documentation: "a documentation/example address",
  unspecified: "an unspecified address",
  reserved: "a reserved address",
};

export async function POST(req: Request) {
  const clientKey = clientKeyFromRequest(req);
  const limit = rateLimit(`scan:ip:${clientKey}`, 20, 60_000);
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

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid IP scan request.", issues: parsed.error.issues }, { status: 400 });
  }

  const validation = normalizeAndValidateIp(parsed.data.target);
  if (!validation.ok || !validation.address || !validation.family || !validation.category) {
    return NextResponse.json({ error: validation.error ?? "Invalid IP address." }, { status: 422 });
  }
  const { address, family, category } = validation;

  if (category !== "public" || isBlockedIp(address)) {
    return NextResponse.json(
      { error: `This is ${CATEGORY_LABEL[category] ?? "a reserved address"} — external reputation lookups are skipped for private/reserved ranges.` },
      { status: 422 },
    );
  }

  const providers = providersFor("ip");

  const [settledEngines, geo, tor] = await Promise.all([
    Promise.allSettled(providers.map((p) => p.run({ targetType: "ip", target: address }))),
    lookupIpGeo(address),
    isTorExitNode(address),
  ]);

  // A provider's own run() throwing (network timeout, etc.) marks just that
  // provider unavailable rather than failing the whole scan — real API
  // integrations can fail independently of one another.
  const engines: EngineResult[] = settledEngines.map((result, i) => {
    const provider = providers[i];
    if (result.status === "fulfilled") {
      return { ...result.value, configured: provider.isConfigured() };
    }
    return { id: provider.id, name: provider.name, verdict: "unknown", unavailable: true, configured: provider.isConfigured() };
  });

  const anyProviderUnavailable = engines.some((e) => e.unavailable);

  const { score, threatLevel, confidence } = computeRisk(engines);
  const externalProviders = providers.filter((p) => !["internal-engine", "community-reports"].includes(p.id));
  const isDemo = externalProviders.every((p) => !p.isConfigured());

  const partial = !geo || tor === null || anyProviderUnavailable;

  const payload: IpScanPayload = {
    id: randomUUID(),
    targetType: "ip",
    target: address,
    family,
    score,
    threatLevel,
    confidence,
    engines,
    evidence: buildEvidence(engines),
    createdAt: new Date().toISOString(),
    demo: isDemo,
    geo: geo ? { city: geo.city, region: geo.region, country: geo.country } : null,
    network: geo ? { asn: geo.asn, asName: geo.asName, isp: geo.isp, org: geo.org, hosting: geo.hosting } : null,
    reverseDns: geo?.reverseDns ?? null,
    privacy: { proxy: geo?.proxy ?? null, tor },
    providerCount: providers.length,
    partial,
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
