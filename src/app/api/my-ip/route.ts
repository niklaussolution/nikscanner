import { NextResponse } from "next/server";
import { rateLimit, clientKeyFromRequest } from "@/lib/security/rate-limit";
import { normalizeAndValidateIp } from "@/lib/validation/ip";

export const runtime = "nodejs";

/**
 * Returns the caller's own public IP as seen by this server, so the
 * browser's "Use my IP" action goes through our own trusted backend
 * instead of calling a third-party IP-echo service directly from the
 * client. Only ever called when the user explicitly clicks that button —
 * never on page load.
 */
export async function GET(req: Request) {
  const limit = rateLimit(`my-ip:${clientKeyFromRequest(req)}`, 20, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again shortly." }, { status: 429 });
  }

  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const candidate = forwarded || req.headers.get("x-real-ip") || null;

  if (!candidate) {
    return NextResponse.json(
      { error: "Couldn't determine your public IP from this connection. Enter it manually." },
      { status: 200 },
    );
  }

  const validation = normalizeAndValidateIp(candidate);
  if (!validation.ok || !validation.address || validation.category !== "public") {
    return NextResponse.json(
      { error: "Couldn't determine your public IP from this connection. Enter it manually." },
      { status: 200 },
    );
  }

  return NextResponse.json({ ip: validation.address }, { headers: { "Cache-Control": "no-store" } });
}
