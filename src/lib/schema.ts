import { siteConfig } from "./site-config";

// Geocodificado una única vez (OpenStreetMap Nominatim) para la sede real en
// C/ de Lepant, 286-288, 08013 Barcelona — no recalcular en cada request.
const OFFICE_GEO = { lat: 41.4050317, lng: 2.1760581 };

export function getLocalBusinessSchema(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.nombre,
    description:
      locale === "ca"
        ? "Empresa de construcció, reformes integrals i rehabilitació d'edificis a Barcelona amb més de 20 anys d'experiència."
        : locale === "en"
        ? "Construction, full renovations and building refurbishment in Barcelona with over 20 years of experience."
        : "Empresa de construcción, reformas integrales y rehabilitación de edificios en Barcelona con más de 20 años de experiencia.",
    foundingDate: "2006",
    url: siteConfig.url,
    telephone: siteConfig.telefonoFijoHref.replace("tel:", ""),
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.direccion,
      addressLocality: siteConfig.ciudad,
      postalCode: siteConfig.cp,
      addressCountry: "ES",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: OFFICE_GEO.lat,
      longitude: OFFICE_GEO.lng,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    areaServed: {
      "@type": "City",
      name: "Barcelona",
    },
    image: `${siteConfig.url}/images/logo/logo.png`,
    logo: `${siteConfig.url}/images/logo/logo.png`,
    priceRange: "$$",
    serviceType:
      locale === "ca"
        ? [
            "Construcció",
            "Reformes integrals",
            "Rehabilitació d'edificis",
            "Instal·lacions",
            "Retirada d'amiant",
            "Treballs verticals",
            "Reforços estructurals",
            "Impermeabilització",
          ]
        : locale === "en"
        ? [
            "Construction",
            "Full renovations",
            "Building refurbishment",
            "Installations",
            "Asbestos removal",
            "Rope access",
            "Structural reinforcement",
            "Waterproofing",
          ]
        : [
            "Construcción",
            "Reformas integrales",
            "Rehabilitación de edificios",
            "Instalaciones",
            "Retirada de amianto",
            "Trabajos verticales",
            "Refuerzos estructurales",
            "Impermeabilización",
          ],
  };
}

export function getFaqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getServiceSchema(opts: {
  locale: string;
  slug: string;
  name: string;
  description: string;
  /** Ruta relativa al locale, sin barras iniciales/finales. Por defecto "servicios/{slug}". */
  path?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: opts.name,
    name: opts.name,
    description: opts.description,
    provider: { "@id": `${siteConfig.url}/#organization` },
    areaServed: { "@type": "City", name: "Barcelona" },
    url: `${siteConfig.url}/${opts.locale}/${opts.path ?? `servicios/${opts.slug}`}`,
  };
}
