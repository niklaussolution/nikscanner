import { NextResponse } from "next/server";
import { z } from "zod";
import { generateApiKey, listApiKeys, type ApiKeyRecord } from "@/lib/security/api-keys";

export const runtime = "nodejs";

const createSchema = z.object({ name: z.string().min(1).max(60) });

function omitHash(record: ApiKeyRecord) {
  return {
    id: record.id,
    name: record.name,
    keyPrefix: record.keyPrefix,
    createdAt: record.createdAt,
    lastUsedAt: record.lastUsedAt,
    requestCount: record.requestCount,
    revoked: record.revoked,
  };
}

export async function GET() {
  const keys = listApiKeys().map(omitHash);
  return NextResponse.json({ keys });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A key name is required." }, { status: 400 });
  }

  const { record, rawKey } = generateApiKey(parsed.data.name);
  // rawKey is returned exactly once — the client must display and never re-fetch it.
  return NextResponse.json({ key: omitHash(record), rawKey }, { status: 201 });
}
