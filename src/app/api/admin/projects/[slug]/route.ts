import { NextRequest, NextResponse } from "next/server";
import { getProjects, saveProjects } from "@/lib/projects";
import { revalidatePath } from "next/cache";
import { serviceSlugs } from "@/lib/site-config";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const projects = await getProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const body = await req.json();

  const projects = await getProjects();
  const idx = projects.findIndex((p) => p.slug === slug);
  if (idx === -1) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  if (
    typeof body.nameEs !== "string" || !body.nameEs.trim() ||
    typeof body.nameCa !== "string" || !body.nameCa.trim() ||
    typeof body.category !== "string" || !(serviceSlugs as readonly string[]).includes(body.category) ||
    !Array.isArray(body.images) || body.images.length === 0
  ) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  projects[idx] = {
    ...projects[idx],
    nameEs: body.nameEs.trim(),
    nameCa: body.nameCa.trim(),
    nameEn: (body.nameEn ?? body.nameEs).trim(),
    category: body.category,
    images: body.images,
    descriptionEs: body.descriptionEs?.trim() ?? "",
    descriptionCa: body.descriptionCa?.trim() ?? "",
    descriptionEn: body.descriptionEn?.trim() ?? "",
    featured: Boolean(body.featured),
    address: typeof body.address === "string" ? body.address.trim() : "",
    neighborhood: typeof body.neighborhood === "string" ? body.neighborhood.trim() : "",
    lat: typeof body.lat === "number" ? body.lat : null,
    lng: typeof body.lng === "number" ? body.lng : null,
  };

  await saveProjects(projects);
  revalidateAll(slug);

  return NextResponse.json(projects[idx]);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const projects = await getProjects();
  const filtered = projects.filter((p) => p.slug !== slug);
  if (filtered.length === projects.length) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  await saveProjects(filtered.map((p, i) => ({ ...p, order: i })));
  revalidateAll(slug);
  return NextResponse.json({ ok: true });
}

function revalidateAll(slug?: string) {
  for (const locale of ["es", "ca", "en"]) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/portfolio`);
    if (slug) revalidatePath(`/${locale}/portfolio/${slug}`);
  }
}
