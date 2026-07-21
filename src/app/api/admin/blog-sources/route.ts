import { NextRequest, NextResponse } from "next/server";
import {
  getSources,
  saveSources,
  generateSourceId,
} from "@/lib/blog/sources";
import { requireAdmin } from "@/lib/admin-auth";
import { isPubliclyRoutableUrl } from "@/lib/blog/url-safety";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;
  return NextResponse.json(await getSources());
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  if (
    !body ||
    typeof body.name !== "string" ||
    !body.name.trim() ||
    typeof body.feedUrl !== "string" ||
    !/^https?:\/\//i.test(body.feedUrl)
  ) {
    return NextResponse.json(
      { error: "Nombre y feedUrl válidos son obligatorios" },
      { status: 400 },
    );
  }

  if (!(await isPubliclyRoutableUrl(body.feedUrl))) {
    return NextResponse.json(
      { error: "Esa URL de feed no es accesible públicamente (host privado o no resoluble)" },
      { status: 400 },
    );
  }

  const sources = await getSources();
  if (sources.find((s) => s.feedUrl === body.feedUrl)) {
    return NextResponse.json(
      { error: "Esa URL de feed ya está dada de alta" },
      { status: 409 },
    );
  }

  const newSource = {
    id: generateSourceId(),
    name: body.name.trim(),
    feedUrl: body.feedUrl.trim(),
    isActive: body.isActive !== false,
    lastFetchedAt: null,
    lastError: null,
    totalImported: 0,
    createdAt: new Date().toISOString(),
  };

  await saveSources([...sources, newSource]);
  return NextResponse.json(newSource, { status: 201 });
}
