import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { isValidSessionToken } from "./lib/admin-token";

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas API de administración: protegidas salvo el endpoint de login.
  if (pathname.startsWith("/api/admin")) {
    if (pathname === "/api/admin/auth") return NextResponse.next();
    const token = request.cookies.get("admin_session")?.value;
    if (!(await isValidSessionToken(token))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();

    const token = request.cookies.get("admin_session")?.value;
    if (!(await isValidSessionToken(token))) {
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
