import { NextRequest, NextResponse } from "next/server";
import { getCategories, saveCategories } from "@/lib/categories";
import { revalidatePath } from "next/cache";

export async function GET() {
  return NextResponse.json(await getCategories());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (
    typeof body.slug !== "string" || !/^[a-z0-9-]+$/.test(body.slug) ||
    typeof body.nameEs !== "string" || !body.nameEs.trim()
  ) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const cats = await getCategories();
  if (cats.find((c) => c.slug === body.slug)) {
    return NextResponse.json({ error: "Ese slug ya existe" }, { status: 409 });
  }

  const newCat = {
    slug: body.slug,
    nameEs: body.nameEs.trim(),
    nameCa: (body.nameCa ?? body.nameEs).trim(),
  };

  await saveCategories([...cats, newCat]);
  revalidate();
  return NextResponse.json(newCat, { status: 201 });
}

function revalidate() {
  for (const locale of ["es", "ca"]) {
    revalidatePath(`/${locale}/blog`);
  }
}
