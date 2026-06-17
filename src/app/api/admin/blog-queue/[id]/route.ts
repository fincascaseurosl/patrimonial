import { NextRequest, NextResponse } from "next/server";
import { getQueue, saveQueue, type QueueItem } from "@/lib/blog/queue";
import { requireAdmin } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

const EDITABLE_FIELDS: (keyof QueueItem)[] = [
  "aiSlug",
  "aiCategorySlug",
  "aiTitleEs",
  "aiTitleCa",
  "aiTitleEn",
  "aiExcerptEs",
  "aiExcerptCa",
  "aiExcerptEn",
  "aiBodyEs",
  "aiBodyCa",
  "aiBodyEn",
  "aiMetaTitleEs",
  "aiMetaTitleCa",
  "aiMetaTitleEn",
  "aiMetaDescriptionEs",
  "aiMetaDescriptionCa",
  "aiMetaDescriptionEn",
  "status",
];

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const queue = await getQueue();
  const item = queue.find((q) => q.id === id);
  if (!item) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const queue = await getQueue();
  const idx = queue.findIndex((q) => q.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const updates: Partial<QueueItem> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) {
      (updates as Record<string, unknown>)[field] = body[field];
    }
  }

  queue[idx] = { ...queue[idx], ...updates };
  await saveQueue(queue);
  return NextResponse.json(queue[idx]);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const queue = await getQueue();
  const filtered = queue.filter((q) => q.id !== id);
  if (filtered.length === queue.length) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  await saveQueue(filtered);
  return NextResponse.json({ ok: true });
}
