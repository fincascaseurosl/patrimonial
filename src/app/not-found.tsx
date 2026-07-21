import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: false },
};

// Fallback para URLs que no encajan en ningún locale (/es, /ca, /en).
// No pasa por [locale]/layout.tsx, así que aquí no hay next-intl ni Header/Footer:
// debe ser un documento HTML autocontenido.
export default function RootNotFound() {
  return (
    <html lang="es">
      <body className="min-h-screen flex items-center justify-center bg-[var(--paper,#fff)] text-[var(--ink,#0E0E0E)] antialiased">
        <div className="max-w-xl mx-auto px-6 py-32 text-center">
          <p className="text-[#B83232] text-[11px] font-semibold tracking-[0.32em] uppercase mb-6">
            Error 404
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-[1.05] tracking-[-0.03em] mb-6">
            Esta página no existe.
          </h1>
          <p className="text-base leading-relaxed opacity-70 mb-12">
            Elige un idioma para volver al inicio.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/es"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#B83232] text-white text-[12px] font-semibold tracking-[0.18em] uppercase"
            >
              Español
            </Link>
            <Link
              href="/ca"
              className="inline-flex items-center justify-center px-8 py-4 border border-current text-[12px] font-medium tracking-[0.18em] uppercase"
            >
              Català
            </Link>
            <Link
              href="/en"
              className="inline-flex items-center justify-center px-8 py-4 border border-current text-[12px] font-medium tracking-[0.18em] uppercase"
            >
              English
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
