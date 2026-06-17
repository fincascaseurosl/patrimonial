import { put, del, list } from "@vercel/blob";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export type BlogSource = {
  id: string;
  name: string;
  feedUrl: string;
  isActive: boolean;
  lastFetchedAt: string | null;
  lastError: string | null;
  totalImported: number;
  createdAt: string;
};

const BLOB_KEY = "blog-sources.json";
const LOCAL_DIR = join(process.cwd(), "data");
const LOCAL_FILE = join(LOCAL_DIR, "blog-sources.json");

export async function getSources(): Promise<BlogSource[]> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: BLOB_KEY });
      const blob = blobs.find((b) => b.pathname === BLOB_KEY);
      if (!blob) return [];
      const res = await fetch(blob.url, {
        next: { revalidate: 30 },
      } as RequestInit);
      return await res.json();
    } catch {
      return [];
    }
  }
  if (!existsSync(LOCAL_FILE)) return [];
  try {
    return JSON.parse(readFileSync(LOCAL_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export async function saveSources(sources: BlogSource[]): Promise<void> {
  const body = JSON.stringify(sources);
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { blobs } = await list({ prefix: BLOB_KEY });
    await Promise.all(blobs.map((b) => del(b.url)));
    await put(BLOB_KEY, body, { access: "public", addRandomSuffix: false });
  } else {
    if (!existsSync(LOCAL_DIR)) mkdirSync(LOCAL_DIR, { recursive: true });
    writeFileSync(LOCAL_FILE, JSON.stringify(sources, null, 2));
  }
}

export function generateSourceId(): string {
  return `src_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
