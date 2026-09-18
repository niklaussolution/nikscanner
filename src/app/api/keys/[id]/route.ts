import { NextResponse } from "next/server";
import { revokeApiKey } from "@/lib/security/api-keys";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = revokeApiKey(id);
  if (!ok) return NextResponse.json({ error: "Key not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
