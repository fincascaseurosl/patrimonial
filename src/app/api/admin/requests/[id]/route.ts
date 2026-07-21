import { NextRequest, NextResponse } from "next/server";
import { getRequests, saveRequests } from "@/lib/requests";
import type { RequestStatus } from "@/lib/requests";
import { requireAdmin } from "@/lib/admin-auth";

const VALID_STATUS: RequestStatus[] = ["new", "read", "replied", "archived"];

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const requests = await getRequests();
  const r = requests.find((x) => x.id === id);
  if (!r) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json(r);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = await req.json();
  const requests = await getRequests();
  const idx = requests.findIndex((x) => x.id === id);
  if (idx === -1) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  const now = new Date().toISOString();
  const current = requests[idx];

  if (typeof body.status === "string" && VALID_STATUS.includes(body.status)) {
    current.status = body.status;
    if (body.status === "read" && !current.readAt) current.readAt = now;
    if (body.status === "replied" && !current.repliedAt) current.repliedAt = now;
  }

  if (typeof body.internalNotes === "string") {
    current.internalNotes = body.internalNotes;
  }

  await saveRequests(requests);
  return NextResponse.json(current);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const requests = await getRequests();
  const filtered = requests.filter((x) => x.id !== id);
  if (filtered.length === requests.length) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }
  await saveRequests(filtered);
  return NextResponse.json({ ok: true });
}
