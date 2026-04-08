import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const MAX_REQUESTS = 3;
const requests = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = requests.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  requests.set(ip, recent);
  if (recent.length >= MAX_REQUESTS) return true;
  recent.push(now);
  return false;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { nombre, email, telefono, mensaje } = body;

    // Validation
    if (
      !nombre ||
      typeof nombre !== "string" ||
      nombre.length > 200 ||
      !email ||
      typeof email !== "string" ||
      email.length > 200 ||
      !mensaje ||
      typeof mensaje !== "string" ||
      mensaje.length > 5000
    ) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email" },
        { status: 400 }
      );
    }

    // Sanitize telefono
    const cleanTelefono =
      telefono && typeof telefono === "string"
        ? telefono.replace(/[^\d\s+\-()]/g, "").slice(0, 20)
        : "";

    // TODO: Send email via your preferred service (Resend, SendGrid, etc.)
    // For now, log the submission
    console.log("Contact form submission:", {
      nombre: nombre.trim(),
      email: email.trim(),
      telefono: cleanTelefono,
      mensaje: mensaje.trim(),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
