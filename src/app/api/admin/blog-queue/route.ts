import { NextRequest, NextResponse } from "next/server";
import { getQueue } from "@/lib/blog/queue";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const sourceId = url.searchParams.get("sourceId");

  const queue = await getQueue();
  let filtered = queue;
  if (status) filtered = filtered.filter((q) => q.status === status);
  if (sourceId) filtered = filtered.filter((q) => q.sourceId === sourceId);

  filtered.sort((a, b) => {
    const ap = a.sourcePublishedAt || a.ingestedAt;
    const bp = b.sourcePublishedAt || b.ingestedAt;
    return bp.localeCompare(ap);
  });

  return NextResponse.json({ data: filtered, total: filtered.length });
}
