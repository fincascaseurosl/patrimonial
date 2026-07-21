import { NextRequest, NextResponse } from "next/server";
import { getCasaConfig, saveCasaConfig } from "@/lib/casa-config";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;
  return NextResponse.json(await getCasaConfig());
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  if (
    !body ||
    !Array.isArray(body.procesoImages) ||
    !body.procesoImages.every((s: unknown) => typeof s === "string")
  ) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const procesoImages = (body.procesoImages as string[])
    .map((s) => s.trim())
    .filter(Boolean);

  await saveCasaConfig({ procesoImages });
  revalidate();

  return NextResponse.json({ ok: true, procesoImages });
}

function revalidate() {
  for (const locale of ["es", "ca", "en"]) {
    revalidatePath(`/${locale}/construir-casa-a-medida`);
  }
}
