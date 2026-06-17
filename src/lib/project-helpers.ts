import type { Project } from "./projects";

export function getProjectName(project: Project, locale: string): string {
  if (locale === "ca") return project.nameCa || project.nameEs;
  if (locale === "en") return project.nameEn || project.nameEs;
  return project.nameEs;
}

export function getProjectDescription(project: Project, locale: string): string {
  if (locale === "ca")
    return project.descriptionCa || project.descriptionEs || project.descriptionEn;
  if (locale === "en")
    return project.descriptionEn || project.descriptionEs || project.descriptionCa;
  return project.descriptionEs || project.descriptionCa || project.descriptionEn;
}
