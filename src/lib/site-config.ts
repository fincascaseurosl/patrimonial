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

// openGraph completo por página. Necesario porque Next sobrescribe (no fusiona)
// el openGraph del layout; sin esto las páginas hijas perderían url/siteName/locale.
export function ogMeta(
  locale: string,
  title: string,
  description: string,
): import("next").Metadata["openGraph"] {
  return {
    title,
    description,
    url: siteConfig.url,
    siteName: siteConfig.nombre,
    locale: locale === "ca" ? "ca_ES" : locale === "en" ? "en_US" : "es_ES",
    type: "website",
  };
}

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
  reformas: "Reformas Integrales",
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
    isCasa: false,
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
    isCasa: false,
  },
  {
    slug: "cesped-artificial-comunidad",
    images: ["/images/portfolio/cesped-artificial.jpg"],
    category: "rehabilitacion",
    isCasa: false,
  },
  {
    slug: "casa-sant-cugat-valles",
    images: [
      "/images/hero/construye-tu-casa-poster.jpg",
      "/images/portfolio/1782386249754-001.jpg",
      "/images/portfolio/1782386250589-017.jpg",
    ],
    category: "obra-nueva",
    isCasa: true,
  },
  {
    slug: "casa-sitges-garraf",
    images: [
      "/images/portfolio/1782386249754-001.jpg",
      "/images/portfolio/reforma-piso-barcelona-2.jpg",
      "/images/portfolio/piso-balmes-3.jpg",
    ],
    category: "obra-nueva",
    isCasa: true,
  },
  {
    slug: "casa-alella-maresme",
    images: [
      "/images/portfolio/reforma-piso-barcelona-1.jpg",
      "/images/portfolio/1782386250589-017.jpg",
      "/images/portfolio/piso-balmes-1.jpg",
    ],
    category: "obra-nueva",
    isCasa: true,
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
  "casa-sant-cugat-valles": {
    es: "Casa unifamiliar en Sant Cugat del Vallès",
    ca: "Casa unifamiliar a Sant Cugat del Vallès",
    en: "Detached house in Sant Cugat del Vallès",
  },
  "casa-sitges-garraf": {
    es: "Casa a medida en Sitges",
    ca: "Casa a mida a Sitges",
    en: "Custom home in Sitges",
  },
  "casa-alella-maresme": {
    es: "Vivienda unifamiliar en Alella",
    ca: "Habitatge unifamiliar a Alella",
    en: "Family home in Alella",
  },
};

// Descripciones de los proyectos semilla (opcional). Los que no aparezcan se
// muestran sin descripción, como hasta ahora.
export const projectDescriptions: Record<string, { es: string; ca: string; en: string }> = {
  "casa-sant-cugat-valles": {
    es: "Vivienda unifamiliar de obra nueva construida de principio a fin: proyecto, licencia, estructura, instalaciones y acabados llave en mano, con un único equipo.",
    ca: "Habitatge unifamiliar d'obra nova construït de principi a fi: projecte, llicència, estructura, instal·lacions i acabats claus en mà, amb un únic equip.",
    en: "New-build detached home delivered end to end: design, permit, structure, services and turnkey finishes, all by a single team.",
  },
  "casa-sitges-garraf": {
    es: "Casa mediterránea diseñada alrededor de la luz y las vistas al mar. Construcción completa con acabados de alta gama y climatización eficiente.",
    ca: "Casa mediterrània dissenyada al voltant de la llum i les vistes al mar. Construcció completa amb acabats d'alta gamma i climatització eficient.",
    en: "Mediterranean home designed around light and sea views. Full build with high-end finishes and efficient climate control.",
  },
  "casa-alella-maresme": {
    es: "Vivienda familiar sobre parcela en pendiente, con estructura a medida y grandes aperturas al jardín. De la escritura del terreno a la entrega de llaves.",
    ca: "Habitatge familiar sobre parcel·la en pendent, amb estructura a mida i grans obertures al jardí. De l'escriptura del terreny al lliurament de claus.",
    en: "Family home on a sloping plot, with bespoke structure and large openings to the garden. From land deed to handover of keys.",
  },
};

export type ProjectLocation = {
  neighborhood: string;
  address?: string;
  year: number;
  area?: string;
  durationMonths?: number;
  lat: number;
  lng: number;
};

export const projectLocations: Record<string, ProjectLocation> = {
  "reforma-rambla": {
    neighborhood: "Ciutat Vella",
    address: "La Rambla",
    year: 2024,
    area: "120 m²",
    durationMonths: 4,
    lat: 41.3823,
    lng: 2.1717,
  },
  "piso-balmes": {
    neighborhood: "Eixample",
    address: "C/ Balmes",
    year: 2024,
    area: "95 m²",
    durationMonths: 3,
    lat: 41.3963,
    lng: 2.1543,
  },
  "cesped-artificial-comunidad": {
    neighborhood: "Sant Andreu",
    year: 2023,
    area: "320 m²",
    durationMonths: 1,
    lat: 41.4341,
    lng: 2.1903,
  },
  "casa-sant-cugat-valles": {
    neighborhood: "Vallès Occidental",
    address: "Sant Cugat del Vallès",
    year: 2024,
    area: "240 m²",
    durationMonths: 14,
    lat: 41.4727,
    lng: 2.0863,
  },
  "casa-sitges-garraf": {
    neighborhood: "Garraf",
    address: "Sitges",
    year: 2023,
    area: "310 m²",
    durationMonths: 16,
    lat: 41.2351,
    lng: 1.8117,
  },
  "casa-alella-maresme": {
    neighborhood: "Maresme",
    address: "Alella",
    year: 2024,
    area: "275 m²",
    durationMonths: 15,
    lat: 41.4954,
    lng: 2.2947,
  },
};
