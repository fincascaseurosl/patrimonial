import { siteConfig } from "./site-config";

export function getLocalBusinessSchema(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.nombre,
    description:
      locale === "ca"
        ? "Empresa de construcció, reformes integrals i rehabilitació d'edificis a Barcelona amb més de 25 anys d'experiència."
        : locale === "en"
        ? "Construction, full renovations and building refurbishment in Barcelona with over 25 years of experience."
        : "Empresa de construcción, reformas integrales y rehabilitación de edificios en Barcelona con más de 25 años de experiencia.",
    url: siteConfig.url,
    telephone: siteConfig.telefonoFijo,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.direccion,
      addressLocality: siteConfig.ciudad,
      postalCode: siteConfig.cp,
      addressCountry: "ES",
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
    image: `${siteConfig.url}/images/logos/patrimonial-logo.png`,
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
