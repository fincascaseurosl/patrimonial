import { NextRequest, NextResponse } from "next/server";
import { getCategories, saveCategories } from "@/lib/categories";
import { getPosts } from "@/lib/posts";
import { revalidatePath } from "next/cache";

type Params = { params: Promise<{ slug: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const body = await req.json();

  if (typeof body.nameEs !== "string" || !body.nameEs.trim()) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }

  const cats = await getCategories();
  const idx = cats.findIndex((c) => c.slug === slug);
  if (idx === -1) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  cats[idx] = {
    slug,
    nameEs: body.nameEs.trim(),
    nameCa: (body.nameCa ?? body.nameEs).trim(),
    nameEn: (body.nameEn ?? body.nameEs).trim(),
  };

  await saveCategories(cats);
  revalidate();
  return NextResponse.json(cats[idx]);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { slug } = await params;

  // Bloquear si hay posts en esta categoría
  const posts = await getPosts();
  const inUse = posts.filter((p) => p.categorySlug === slug);
  if (inUse.length > 0) {
    return NextResponse.json(
      { error: `No se puede eliminar: hay ${inUse.length} post(s) en esta categoría` },
      { status: 409 },
    );
  }

  const cats = await getCategories();
  const filtered = cats.filter((c) => c.slug !== slug);
  if (filtered.length === cats.length) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  await saveCategories(filtered);
  revalidate();
  return NextResponse.json({ ok: true });
}

function revalidate() {
  for (const locale of ["es", "ca", "en"]) {
    revalidatePath(`/${locale}/blog`);
  }
}
