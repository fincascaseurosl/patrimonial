import { NextRequest, NextResponse } from "next/server";
import { getProjects, saveProjects } from "@/lib/projects";
import type { Project } from "@/lib/projects";
import { revalidatePath } from "next/cache";
import { serviceSlugs } from "@/lib/site-config";

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!isValidProject(body)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const projects = await getProjects();

  if (projects.find((p) => p.slug === body.slug)) {
    return NextResponse.json({ error: "El slug ya existe" }, { status: 409 });
  }

  const newProject: Project = {
    slug: body.slug,
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
    order: projects.length,
  };

  await saveProjects([...projects, newProject]);
  revalidateAll();

  return NextResponse.json(newProject, { status: 201 });
}

function isValidProject(b: unknown): b is Omit<Project, "order"> {
  if (!b || typeof b !== "object") return false;
  const p = b as Record<string, unknown>;
  return (
    typeof p.slug === "string" && /^[a-z0-9-]+$/.test(p.slug) &&
    typeof p.nameEs === "string" && p.nameEs.trim().length > 0 &&
    typeof p.nameCa === "string" && p.nameCa.trim().length > 0 &&
    typeof p.category === "string" && (serviceSlugs as readonly string[]).includes(p.category) &&
    Array.isArray(p.images) && p.images.length > 0 &&
    (p.images as unknown[]).every((img) => typeof img === "string")
  );
}

function revalidateAll() {
  for (const locale of ["es", "ca", "en"]) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/portfolio`);
  }
}
