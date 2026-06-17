export const siteConfig = {
  nombre: "Patrimonial Obras Barcelona",
  dominio: "obrasenbarcelona.es",
  url: "https://obrasenbarcelona.es",
  email: "gestion@obraspatrimonial.es",
  telefonoFijo: "+34 93 531 64 31",
  telefonoMovil: "+34 626 20 53 20",
  telefonoFijoHref: "tel:+34935316431",
  telefonoMovilHref: "tel:+34626205320",
  direccion: "C/ de Lepant, 286-288",
  cp: "08013",
  ciudad: "Barcelona",
  pais: "España",
  horario: "Lun. - Vie. 9:00 - 18:00",
  colorPrimario: "#ffc107",
} as const;

export function getHorario(locale: string): string {
  if (locale === "ca") return "Dl. - Dv. 9:00 - 18:00";
  if (locale === "en") return "Mon - Fri 9:00 - 18:00";
  return siteConfig.horario;
}

export const serviceSlugs = [
  "reformas",
  "obra-nueva",
  "rehabilitacion",
  "instalaciones",
  "amianto",
  "trabajos-verticales",
  "refuerzos",
  "impermeabilizacion",
] as const;

export type ServiceSlug = (typeof serviceSlugs)[number];

export const serviceKeyMap: Record<ServiceSlug, string> = {
  reformas: "reformas",
  "obra-nueva": "obraNueva",
  rehabilitacion: "rehabilitacion",
  instalaciones: "instalaciones",
  amianto: "amianto",
  "trabajos-verticales": "trabajosVerticales",
  refuerzos: "refuerzos",
  impermeabilizacion: "impermeabilizacion",
};

// Etiquetas en español para usar en el panel de admin y notificaciones de email
// (donde no hay contexto next-intl disponible).
export const servicioLabelsEs: Record<string, string> = {
  reformas: "Reformas Barcelona",
  "obra-nueva": "Obra nueva",
  rehabilitacion: "Rehabilitación",
  instalaciones: "Instalaciones de luz, agua y gas",
  amianto: "Retirada de amianto",
  "trabajos-verticales": "Trabajos verticales",
  refuerzos: "Refuerzos estructurales",
  impermeabilizacion: "Impermeabilización de terrados",
  otro: "Otro / no especificado",
};

export function getServicioLabel(slug: string | null | undefined): string {
  if (!slug) return "";
  return servicioLabelsEs[slug] ?? slug;
}

export const serviceIcons: Record<ServiceSlug, string> = {
  reformas: "/images/services/construccion.png",
  "obra-nueva": "/images/services/bosquejo.png",
  rehabilitacion: "/images/services/techo.png",
  instalaciones: "/images/services/relampago.png",
  amianto: "/images/services/amianto.png",
  "trabajos-verticales": "/images/services/escalada-de-roca.png",
  refuerzos: "/images/services/haz.png",
  impermeabilizacion: "/images/services/gota-de-agua.png",
};

export const projects = [
  {
    slug: "reforma-rambla",
    images: [
      "/images/portfolio/reforma-piso-barcelona-1.jpg",
      "/images/portfolio/reforma-piso-barcelona-2.jpg",
      "/images/portfolio/reforma-piso-barcelona-3.jpg",
    ],
    category: "reformas",
  },
  {
    slug: "piso-balmes",
    images: [
      "/images/portfolio/piso-balmes-1.jpg",
      "/images/portfolio/piso-balmes-2.jpg",
      "/images/portfolio/piso-balmes-3.jpg",
      "/images/portfolio/piso-balmes-4.jpg",
    ],
    category: "reformas",
  },
  {
    slug: "cesped-artificial-comunidad",
    images: ["/images/portfolio/cesped-artificial.jpg"],
    category: "rehabilitacion",
  },
] as const;

export const projectNames: Record<string, { es: string; ca: string; en: string }> = {
  "reforma-rambla": {
    es: "Piso en Rambla Barcelona",
    ca: "Pis a la Rambla de Barcelona",
    en: "Apartment on La Rambla, Barcelona",
  },
  "piso-balmes": {
    es: "Piso en C/ Balmes",
    ca: "Pis al C/ Balmes",
    en: "Apartment on Balmes Street",
  },
  "cesped-artificial-comunidad": {
    es: "Colocación del césped artificial en una comunidad",
    ca: "Col·locació de gespa artificial en una comunitat",
    en: "Artificial turf installation in a residential complex",
  },
};

export type ProjectLocation = {
  neighborhood: string;
  address?: string;
  year: number;
  area?: string;
  duration?: string;
  lat: number;
  lng: number;
};

export const projectLocations: Record<string, ProjectLocation> = {
  "reforma-rambla": {
    neighborhood: "Ciutat Vella",
    address: "La Rambla",
    year: 2024,
    area: "120 m²",
    duration: "4 meses",
    lat: 41.3823,
    lng: 2.1717,
  },
  "piso-balmes": {
    neighborhood: "Eixample",
    address: "C/ Balmes",
    year: 2024,
    area: "95 m²",
    duration: "3 meses",
    lat: 41.3963,
    lng: 2.1543,
  },
  "cesped-artificial-comunidad": {
    neighborhood: "Sant Andreu",
    year: 2023,
    area: "320 m²",
    duration: "1 mes",
    lat: 41.4341,
    lng: 2.1903,
  },
};
