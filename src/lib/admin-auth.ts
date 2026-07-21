import { NextRequest, NextResponse } from "next/server";
import { isValidSessionToken } from "./admin-token";

export type AuthResult =
  | { ok: true }
  | { ok: false; response: NextResponse };

export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  const token = request.cookies.get("admin_session")?.value;
  if (!(await isValidSessionToken(token))) {
    return {
      ok: false,
      response: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }
  return { ok: true };
}
