import { NextResponse } from "next/server";
import { z } from "zod";
import { assertPublicHostname } from "@/lib/security/ssrf";
import { rateLimit, clientKeyFromRequest } from "@/lib/security/rate-limit";
import { inspectTls } from "@/lib/domain-intel/tls";

export const runtime = "nodejs";

const requestSchema = z.object({ hostname: z.string().min(1).max(253) });

/**
 * Lightweight TLS check for a resolved URL hostname — reuses the same
 * `inspectTls` module the domain scanner already ships, so the QR page's
 * "Connection" card reflects a real handshake instead of a fabricated
 * "HTTPS Valid" placeholder.
 */
export async function POST(req: Request) {
  const limit = rateLimit(`scan:connection:${clientKeyFromRequest(req)}`, 30, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const ssrfCheck = await assertPublicHostname(parsed.data.hostname);
  if (!ssrfCheck.allowed) {
    return NextResponse.json({ error: `Target rejected: ${ssrfCheck.reason}` }, { status: 422 });
  }

  const tls = await inspectTls(parsed.data.hostname);
  return NextResponse.json({ tls }, { headers: { "Cache-Control": "no-store" } });
}
