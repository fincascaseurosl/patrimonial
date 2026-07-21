import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isDev = process.env.NODE_ENV !== "production";

// Content-Security-Policy explícita según lo que la web realmente carga:
// - Leaflet (PortfolioMap/LocationPicker) pide teselas a basemaps.cartocdn.com
//   y geocodifica direcciones contra nominatim.openstreetmap.org.
// - Las imágenes de proyectos/blog vienen de Vercel Blob.
// - La página de Contacto embebe un iframe de Google Maps.
// - Tailwind + estilos inline de React necesitan 'unsafe-inline' en style-src.
// - script-src necesita 'unsafe-inline': Next.js App Router inyecta scripts
//   inline propios para la hidratación/streaming de RSC en TODAS las páginas
//   (no solo los <script type="application/ld+json"> del schema.org, que en
//   sí mismos son datos inertes). La alternativa "correcta" — nonces por
//   request vía proxy.ts — obliga a renderizado dinámico en todas las
//   páginas (Next.js lo documenta explícitamente) y aquí tiraría por tierra
//   el SSG/ISR de todo el sitio. Con el contenido ya saneado en el pipeline
//   del blog (sanitize-html) antes de guardar y al renderizar, el riesgo
//   residual de admitir 'unsafe-inline' es bajo comparado con ese coste.
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: https://*.public.blob.vercel-storage.com https://*.basemaps.cartocdn.com`,
  `font-src 'self' data:`,
  `connect-src 'self' https://nominatim.openstreetmap.org${isDev ? " ws:" : ""}`,
  `frame-src 'self' https://www.google.com`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ...(isDev
    ? []
    : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

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
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
