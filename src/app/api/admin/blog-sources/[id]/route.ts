import { NextRequest, NextResponse } from "next/server";
import { getSources, saveSources } from "@/lib/blog/sources";
import { requireAdmin } from "@/lib/admin-auth";
import { isPubliclyRoutableUrl } from "@/lib/blog/url-safety";

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

  let feedUrl = sources[idx].feedUrl;
  if (typeof body.feedUrl === "string" && /^https?:\/\//i.test(body.feedUrl)) {
    if (!(await isPubliclyRoutableUrl(body.feedUrl))) {
      return NextResponse.json(
        { error: "Esa URL de feed no es accesible públicamente (host privado o no resoluble)" },
        { status: 400 },
      );
    }
    feedUrl = body.feedUrl.trim();
  }

  sources[idx] = {
    ...sources[idx],
    name:
      typeof body.name === "string" && body.name.trim()
        ? body.name.trim()
        : sources[idx].name,
    feedUrl,
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
