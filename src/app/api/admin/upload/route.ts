import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
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

  const safeName = `portfolio/${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, "_")}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(safeName, file, { access: "public" });
    return NextResponse.json({ url: blob.url });
  }

  // Local dev: save to /public
  const buffer = Buffer.from(await file.arrayBuffer());
  const dir = join(process.cwd(), "public", "images", "portfolio");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, "_")}`;
  writeFileSync(join(dir, filename), buffer);
  return NextResponse.json({ url: `/images/portfolio/${filename}` });
}
