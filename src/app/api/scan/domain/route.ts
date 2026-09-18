import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { normalizeAndValidateDomain } from "@/lib/validation/domain";
import { assertPublicHostname } from "@/lib/security/ssrf";
import { rateLimit, clientKeyFromRequest } from "@/lib/security/rate-limit";
import { providersFor } from "@/lib/providers";
import { computeRisk, buildEvidence } from "@/lib/risk-engine";
import { lookupDnsRecords } from "@/lib/domain-intel/dns";
import { lookupWhois } from "@/lib/domain-intel/whois";
import { inspectTls } from "@/lib/domain-intel/tls";
import { lookupIpInfo } from "@/lib/domain-intel/ip-info";
import type { DomainScanPayload, EngineResult } from "@/types/scan";

export const runtime = "nodejs";

const requestSchema = z.object({
  targetType: z.literal("domain"),
  target: z.string().min(1).max(253),
});

export async function POST(req: Request) {
  const clientKey = clientKeyFromRequest(req);
  const limit = rateLimit(`scan:domain:${clientKey}`, 20, 60_000);
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
    return NextResponse.json({ error: "Invalid domain scan request.", issues: parsed.error.issues }, { status: 400 });
  }

  const validation = normalizeAndValidateDomain(parsed.data.target);
  if (!validation.ok || !validation.hostname) {
    return NextResponse.json({ error: validation.error ?? "Invalid domain." }, { status: 422 });
  }
  const hostname = validation.hostname;

  const ssrfCheck = await assertPublicHostname(hostname);
  if (!ssrfCheck.allowed) {
    return NextResponse.json({ error: `Target rejected: ${ssrfCheck.reason}` }, { status: 422 });
  }

  const providers = providersFor("domain");

  const [engines, dns, whois, tlsInfo] = await Promise.all([
    Promise.all(providers.map((p) => p.run({ targetType: "domain", target: hostname, hostname }))),
    lookupDnsRecords(hostname),
    lookupWhois(hostname),
    inspectTls(hostname),
  ]);

  const ipInfo = dns.a && dns.a[0] ? await lookupIpInfo(dns.a[0]) : null;

  const { score, threatLevel, confidence } = computeRisk(engines as EngineResult[]);
  const externalProviders = providers.filter((p) => !["internal-engine", "community-reports"].includes(p.id));
  const isDemo = externalProviders.every((p) => !p.isConfigured());

  const partial = !whois || !dns.a || !tlsInfo || !ipInfo;

  const payload: DomainScanPayload = {
    id: randomUUID(),
    targetType: "domain",
    target: hostname,
    score,
    threatLevel,
    confidence,
    engines: engines as EngineResult[],
    evidence: buildEvidence(engines as EngineResult[]),
    createdAt: new Date().toISOString(),
    demo: isDemo,
    whois,
    dns,
    tls: tlsInfo,
    ipInfo,
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
