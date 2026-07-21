import type { Project } from "./projects";
import { projectLocations } from "./site-config";

export type MapLocation = {
  lat: number;
  lng: number;
  neighborhood?: string;
  address?: string;
  year?: number;
  area?: string;
  durationMonths?: number;
};

// Ubicación del proyecto: usa la del propio proyecto (creada en el admin) y, si
// no tiene coordenadas, cae a la hardcodeada de site-config (proyectos semilla).
export function locationFor(p: Project): MapLocation | null {
  if (typeof p.lat === "number" && typeof p.lng === "number") {
    return {
      lat: p.lat,
      lng: p.lng,
      neighborhood: p.neighborhood || undefined,
      address: p.address || undefined,
    };
  }
  return projectLocations[p.slug] ?? null;
}

// Formatea la duración (en meses) según el idioma de la ficha.
export function formatMonths(months: number, locale: string): string {
  if (locale === "en") return `${months} month${months === 1 ? "" : "s"}`;
  if (locale === "ca") return `${months} ${months === 1 ? "mes" : "mesos"}`;
  return `${months} ${months === 1 ? "mes" : "meses"}`;
}
