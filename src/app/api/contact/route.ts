import { NextRequest, NextResponse } from "next/server";
import { addRequest } from "@/lib/requests";
import { Resend } from "resend";
import { siteConfig, serviceSlugs, getServicioLabel } from "@/lib/site-config";

const VALID_SERVICIOS = new Set<string>([...serviceSlugs, "otro"]);

const RATE_LIMIT_WINDOW = 60_000;
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

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function sendNotificationEmail(data: {
  nombre: string;
  email: string;
  telefono: string;
  servicio: string;
  mensaje: string;
  receivedAt: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFICATION_EMAIL ?? siteConfig.email;
  const from = process.env.RESEND_FROM ?? "Patrimonial Obras <noreply@obraspatrimonial.es>";

  if (!apiKey) return; // No configurado todavía: no falla el formulario

  try {
    const resend = new Resend(apiKey);
    const formattedDate = new Date(data.receivedAt).toLocaleString("es-ES", {
      timeZone: "Europe/Madrid",
    });

    await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject: `Nueva solicitud de ${data.nombre}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; color: #0E0E0E;">
          <div style="background: #B83232; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 20px;">Nueva solicitud del formulario web</h1>
            <p style="margin: 4px 0 0; opacity: 0.85; font-size: 13px;">${formattedDate}</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e5e5e5; border-top: 0; padding: 24px; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 13px; width: 100px;">Nombre</td>
                <td style="padding: 8px 0; font-weight: 600;">${escapeHtml(data.nombre)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 13px;">Email</td>
                <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(data.email)}" style="color: #B83232;">${escapeHtml(data.email)}</a></td>
              </tr>
              ${data.telefono ? `
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 13px;">Teléfono</td>
                <td style="padding: 8px 0;"><a href="tel:${escapeHtml(data.telefono)}" style="color: #B83232;">${escapeHtml(data.telefono)}</a></td>
              </tr>` : ""}
              ${data.servicio ? `
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 13px;">Servicio</td>
                <td style="padding: 8px 0; font-weight: 600;">${escapeHtml(getServicioLabel(data.servicio))}</td>
              </tr>` : ""}
            </table>
            <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 20px 0;">
            <p style="color: #666; font-size: 13px; margin: 0 0 8px;">Mensaje</p>
            <p style="white-space: pre-wrap; line-height: 1.6; margin: 0;">${escapeHtml(data.mensaje)}</p>
            <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; margin: 0;">
              Responde directamente a este email para contactar con el cliente, o
              <a href="${siteConfig.url}/admin/requests" style="color: #B83232;">entra al panel</a>
              para gestionar todas las solicitudes.
            </p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    // No bloqueamos el guardado si falla el email
    console.error("Error enviando email:", err);
  }
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { nombre, email, telefono, servicio, mensaje, website } = body;

    // Honeypot: los bots suelen rellenar todos los campos, incluido este que
    // para una persona es invisible. Si viene relleno, fingimos éxito sin
    // guardar ni notificar, para no darle pistas al bot de que fue detectado.
    if (typeof website === "string" && website.trim() !== "") {
      return NextResponse.json({ success: true });
    }

    if (
      !nombre || typeof nombre !== "string" || nombre.length > 200 ||
      !email || typeof email !== "string" || email.length > 200 ||
      !mensaje || typeof mensaje !== "string" || mensaje.length > 5000
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const cleanServicio =
      typeof servicio === "string" && VALID_SERVICIOS.has(servicio) ? servicio : "";

    const cleanTelefono =
      telefono && typeof telefono === "string"
        ? telefono.replace(/[^\d\s+\-()]/g, "").slice(0, 20)
        : "";

    const referer = req.headers.get("referer") ?? "";
    const sourcePath = referer ? new URL(referer).pathname : undefined;

    // Guardar siempre (aunque falle el email)
    const newReq = await addRequest({
      nombre: nombre.trim(),
      email: email.trim(),
      telefono: cleanTelefono,
      servicio: cleanServicio || undefined,
      mensaje: mensaje.trim(),
      sourcePath,
      ip,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    // Notificar por email (no bloquea si falla)
    await sendNotificationEmail({
      nombre: newReq.nombre,
      email: newReq.email,
      telefono: newReq.telefono,
      servicio: newReq.servicio ?? "",
      mensaje: newReq.mensaje,
      receivedAt: newReq.receivedAt,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
