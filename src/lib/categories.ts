import { put, del, list } from "@vercel/blob";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export type Category = {
  slug: string;
  nameEs: string;
  nameCa: string;
  nameEn: string;
};

const BLOB_KEY = "categories.json";
const LOCAL_DIR = join(process.cwd(), "data");
const LOCAL_FILE = join(LOCAL_DIR, "categories.json");

const DEFAULTS: Category[] = [
  { slug: "amianto", nameEs: "Amianto", nameCa: "Amiant", nameEn: "Asbestos" },
  { slug: "reformas", nameEs: "Reformas", nameCa: "Reformes", nameEn: "Renovations" },
  { slug: "consejos", nameEs: "Consejos", nameCa: "Consells", nameEn: "Advice" },
];

export async function getCategories(): Promise<Category[]> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: BLOB_KEY });
      const blob = blobs.find((b) => b.pathname === BLOB_KEY);
      if (!blob) return DEFAULTS;
      const res = await fetch(blob.url, { next: { revalidate: 60 } } as RequestInit);
      return await res.json();
    } catch {
      return DEFAULTS;
    }
  }
  if (!existsSync(LOCAL_FILE)) return DEFAULTS;
  try {
    return JSON.parse(readFileSync(LOCAL_FILE, "utf-8"));
  } catch {
    return DEFAULTS;
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  const body = JSON.stringify(categories);
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { blobs } = await list({ prefix: BLOB_KEY });
    await Promise.all(blobs.map((b) => del(b.url)));
    await put(BLOB_KEY, body, { access: "public", addRandomSuffix: false });
  } else {
    if (!existsSync(LOCAL_DIR)) mkdirSync(LOCAL_DIR, { recursive: true });
    writeFileSync(LOCAL_FILE, JSON.stringify(categories, null, 2));
  }
}

export function getCategoryName(category: Category, locale: string): string {
  if (locale === "ca") return category.nameCa || category.nameEs;
  if (locale === "en") return category.nameEn || category.nameEs;
  return category.nameEs;
}
