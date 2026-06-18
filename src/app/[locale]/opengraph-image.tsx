import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/lib/site-config";

export const alt =
  "Patrimonial · Construcción, reformas y rehabilitación en Barcelona";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Imagen OG de marca generada en build (logo blanco sobre fondo tinta + acento rojo).
export default async function Image() {
  const logo = await readFile(
    join(process.cwd(), "public/images/logo/logo-white.png"),
  );
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0E0E0E",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} height={84} alt="" />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              width: 88,
              height: 8,
              background: "#B83232",
              marginBottom: 36,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 66,
              fontWeight: 700,
              color: "#F5F2EC",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Construcción, reformas y rehabilitación
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              color: "#9A9A9A",
              marginTop: 24,
            }}
          >
            {siteConfig.nombre} · Barcelona · Equipo propio
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
