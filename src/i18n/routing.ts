import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "ca", "en"],
  defaultLocale: "es",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/servicios": {
      es: "/servicios",
      ca: "/serveis",
      en: "/services",
    },
    "/servicios/[slug]": {
      es: "/servicios/[slug]",
      ca: "/serveis/[slug]",
      en: "/services/[slug]",
    },
    "/portfolio": {
      es: "/portfolio",
      ca: "/portfolio",
      en: "/portfolio",
    },
    "/portfolio/[slug]": {
      es: "/portfolio/[slug]",
      ca: "/portfolio/[slug]",
      en: "/portfolio/[slug]",
    },
    "/sobre-nosotros": {
      es: "/sobre-nosotros",
      ca: "/sobre-nosaltres",
      en: "/about-us",
    },
    "/contacto": {
      es: "/contacto",
      ca: "/contacte",
      en: "/contact",
    },
    "/blog": {
      es: "/blog",
      ca: "/blog",
      en: "/blog",
    },
    "/blog/[slug]": {
      es: "/blog/[slug]",
      ca: "/blog/[slug]",
      en: "/blog/[slug]",
    },
    "/politica-de-privacidad": {
      es: "/politica-de-privacidad",
      ca: "/politica-de-privacitat",
      en: "/privacy-policy",
    },
  },
});

export type Locale = (typeof routing.locales)[number];
export type Pathnames = keyof typeof routing.pathnames;
