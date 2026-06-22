import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

async function expectedToken(): Promise<string> {
  if (
    process.env.VERCEL_ENV === "production" &&
    (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SECRET)
  ) {
    throw new Error(
      "ADMIN_PASSWORD y ADMIN_SECRET deben estar configurados en producción",
    );
  }
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
  const sig = await globalThis.crypto.subtle.sign("HMAC", key, enc.encode(password));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas API de administración: protegidas salvo el endpoint de login.
  if (pathname.startsWith("/api/admin")) {
    if (pathname === "/api/admin/auth") return NextResponse.next();
    const token = request.cookies.get("admin_session")?.value;
    const expected = await expectedToken();
    if (token !== expected) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();

    const token = request.cookies.get("admin_session")?.value;
    const expected = await expectedToken();
    if (token !== expected) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(es|ca|en)/:path*", "/admin", "/admin/:path*", "/api/admin/:path*"],
};
