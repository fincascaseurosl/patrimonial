import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "ca"],
  defaultLocale: "es",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/servicios": {
      es: "/servicios",
      ca: "/serveis",
    },
    "/servicios/[slug]": {
      es: "/servicios/[slug]",
      ca: "/serveis/[slug]",
    },
    "/portfolio": {
      es: "/portfolio",
      ca: "/portfolio",
    },
    "/portfolio/[slug]": {
      es: "/portfolio/[slug]",
      ca: "/portfolio/[slug]",
    },
    "/sobre-nosotros": {
      es: "/sobre-nosotros",
      ca: "/sobre-nosaltres",
    },
    "/contacto": {
      es: "/contacto",
      ca: "/contacte",
    },
    "/blog": {
      es: "/blog",
      ca: "/blog",
    },
    "/blog/[slug]": {
      es: "/blog/[slug]",
      ca: "/blog/[slug]",
    },
    "/politica-de-privacidad": {
      es: "/politica-de-privacidad",
      ca: "/politica-de-privacitat",
    },
  },
});

export type Locale = (typeof routing.locales)[number];
export type Pathnames = keyof typeof routing.pathnames;
