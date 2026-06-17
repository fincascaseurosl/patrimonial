import { put, del, list } from "@vercel/blob";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { projects as defaultRaw, projectNames } from "./site-config";
import type { ServiceSlug } from "./site-config";

export type Project = {
  slug: string;
  nameEs: string;
  nameCa: string;
  nameEn: string;
  category: ServiceSlug;
  images: string[];
  descriptionEs: string;
  descriptionCa: string;
  descriptionEn: string;
  order: number;
};

const BLOB_KEY = "projects.json";
const LOCAL_DIR = join(process.cwd(), "data");
const LOCAL_FILE = join(LOCAL_DIR, "projects.json");

function defaults(): Project[] {
  return defaultRaw.map((p, i) => ({
    slug: p.slug,
    nameEs: projectNames[p.slug]?.es ?? p.slug,
    nameCa: projectNames[p.slug]?.ca ?? p.slug,
    nameEn: projectNames[p.slug]?.en ?? projectNames[p.slug]?.es ?? p.slug,
    category: p.category as ServiceSlug,
    images: [...p.images],
    descriptionEs: "",
    descriptionCa: "",
    descriptionEn: "",
    order: i,
  }));
}

export async function getProjects(): Promise<Project[]> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: BLOB_KEY });
      const blob = blobs.find((b) => b.pathname === BLOB_KEY);
      if (!blob) return defaults();
      const res = await fetch(blob.url, { next: { revalidate: 60 } } as RequestInit);
      return await res.json();
    } catch {
      return defaults();
    }
  }
  // Local dev fallback
  if (!existsSync(LOCAL_FILE)) return defaults();
  try {
    return JSON.parse(readFileSync(LOCAL_FILE, "utf-8"));
  } catch {
    return defaults();
  }
}

export async function saveProjects(projects: Project[]): Promise<void> {
  const body = JSON.stringify(projects);
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { blobs } = await list({ prefix: BLOB_KEY });
    await Promise.all(blobs.map((b) => del(b.url)));
    await put(BLOB_KEY, body, { access: "public", addRandomSuffix: false });
  } else {
    if (!existsSync(LOCAL_DIR)) mkdirSync(LOCAL_DIR, { recursive: true });
    writeFileSync(LOCAL_FILE, JSON.stringify(projects, null, 2));
  }
}

export { getProjectName, getProjectDescription } from "./project-helpers";
