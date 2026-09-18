import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientKeyFromRequest } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().email().max(254) });

/**
 * In-memory for local development — a real deployment should persist this
 * to a table and wire an actual notification provider. Never claims
 * success without actually recording the address here first.
 */
const subscribers = new Set<string>();

export async function POST(req: Request) {
  const limit = rateLimit(`status-subscribe:${clientKeyFromRequest(req)}`, 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 422 });
  }

  const email = parsed.data.email.toLowerCase();
  const alreadySubscribed = subscribers.has(email);
  subscribers.add(email);

  return NextResponse.json({ subscribed: true, alreadySubscribed }, { headers: { "Cache-Control": "no-store" } });
}
