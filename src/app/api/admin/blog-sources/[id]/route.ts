import { NextRequest, NextResponse } from "next/server";
import { getSources, saveSources } from "@/lib/blog/sources";
import { requireAdmin } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const sources = await getSources();
  const idx = sources.findIndex((s) => s.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  sources[idx] = {
    ...sources[idx],
    name:
      typeof body.name === "string" && body.name.trim()
        ? body.name.trim()
        : sources[idx].name,
    feedUrl:
      typeof body.feedUrl === "string" && /^https?:\/\//i.test(body.feedUrl)
        ? body.feedUrl.trim()
        : sources[idx].feedUrl,
    isActive:
      typeof body.isActive === "boolean"
        ? body.isActive
        : sources[idx].isActive,
  };

  await saveSources(sources);
  return NextResponse.json(sources[idx]);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const sources = await getSources();
  const filtered = sources.filter((s) => s.id !== id);
  if (filtered.length === sources.length) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }
  await saveSources(filtered);
  return NextResponse.json({ ok: true });
}
