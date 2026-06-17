import { NextRequest, NextResponse } from "next/server";
import {
  ingestAllActiveSources,
  ingestOneSource,
} from "@/lib/blog/ingest";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => ({}));

  try {
    if (body && typeof body.sourceId === "string" && body.sourceId) {
      const summary = await ingestOneSource(body.sourceId);
      return NextResponse.json({
        totalInserted: summary.inserted,
        totalSources: 1,
        perSource: [summary],
      });
    }
    const result = await ingestAllActiveSources();
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
