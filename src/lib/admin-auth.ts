import { NextRequest, NextResponse } from "next/server";

async function expectedToken(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SECRET ?? "dev-secret";
  const enc = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(password),
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type AuthResult =
  | { ok: true }
  | { ok: false; response: NextResponse };

export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  const token = request.cookies.get("admin_session")?.value;
  const expected = await expectedToken();
  if (!token || token !== expected) {
    return {
      ok: false,
      response: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }
  return { ok: true };
}
