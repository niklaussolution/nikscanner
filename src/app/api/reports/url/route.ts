import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { reportSchema } from "@/lib/validation/report";
import { enqueueReport, listReports } from "@/lib/moderation/queue";
import { rateLimit, clientKeyFromRequest } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const clientKey = clientKeyFromRequest(req);
  const limit = rateLimit(`report:${clientKey}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again shortly." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid report.", issues: parsed.error.issues }, { status: 400 });
  }

  const report = enqueueReport({
    ...parsed.data,
    id: randomUUID(),
    status: "pending_review",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json(
    { id: report.id, status: report.status, message: "Report submitted for moderation review." },
    { status: 201 },
  );
}

export async function GET() {
  return NextResponse.json({ reports: listReports() });
}
