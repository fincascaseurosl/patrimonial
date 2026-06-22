import { NextRequest, NextResponse } from "next/server";

async function makeToken(password: string): Promise<string> {
  if (
    process.env.VERCEL_ENV === "production" &&
    (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SECRET)
  ) {
    throw new Error(
      "ADMIN_PASSWORD y ADMIN_SECRET deben estar configurados en producción",
    );
  }
  const secret = process.env.ADMIN_SECRET ?? "dev-secret";
  const enc = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await globalThis.crypto.subtle.sign("HMAC", key, enc.encode(password));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Contraseña requerida" }, { status: 400 });
  }

  const expected = await makeToken(process.env.ADMIN_PASSWORD ?? "");
  const provided = await makeToken(password);

  if (provided !== expected) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", "", { maxAge: 0, path: "/" });
  return res;
}
