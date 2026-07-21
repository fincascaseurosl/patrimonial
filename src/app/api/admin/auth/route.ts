import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createSessionToken, SESSION_COOKIE_MAX_AGE_SECONDS } from "@/lib/admin-token";
import { checkLockout, recordFailedAttempt, clearAttempts, getClientIp } from "@/lib/admin-login-attempts";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  const lockout = await checkLockout(ip);
  if (lockout.locked) {
    return NextResponse.json(
      { error: "Demasiados intentos. Inténtalo de nuevo más tarde." },
      { status: 429, headers: { "Retry-After": String(lockout.retryAfterSeconds) } },
    );
  }

  const { password } = await req.json();
  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Contraseña requerida" }, { status: 400 });
  }

  if (!(await verifyPassword(password))) {
    const result = await recordFailedAttempt(ip);
    if (result.locked) {
      return NextResponse.json(
        { error: "Demasiados intentos. Inténtalo de nuevo más tarde." },
        { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } },
      );
    }
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  await clearAttempts(ip);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", "", { maxAge: 0, path: "/" });
  return res;
}
