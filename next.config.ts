import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Las funciones (p. ej. /api/admin/upload) no necesitan los assets de public/.
  // En producción las subidas van a Vercel Blob; evitamos empaquetar public/ en
  // el bundle de las funciones (si no, public/images/portfolio infla el tamaño).
  outputFileTracingExcludes: {
    "/api/**": ["public/**"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
