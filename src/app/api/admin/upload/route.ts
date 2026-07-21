import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { requireAdmin } from "@/lib/admin-auth";
import { sniffImageType } from "@/lib/sniff-image-type";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "El archivo supera el límite de 10 MB" }, { status: 400 });
  }

  // No basta con confiar en el Content-Type que declara el navegador (falsificable):
  // se comprueban los primeros bytes del propio archivo (firma/magic bytes).
  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffImageType(buffer);
  if (!sniffed || !ALLOWED_TYPES.includes(sniffed)) {
    return NextResponse.json(
      { error: "El contenido del archivo no coincide con un formato de imagen permitido" },
      { status: 400 },
    );
  }

  const safeName = `portfolio/${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, "_")}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(safeName, buffer, { access: "public", contentType: sniffed });
    return NextResponse.json({ url: blob.url });
  }

  // Local dev: save to /public
  const dir = join(process.cwd(), "public", "images", "portfolio");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, "_")}`;
  writeFileSync(join(dir, filename), buffer);
  return NextResponse.json({ url: `/images/portfolio/${filename}` });
}
