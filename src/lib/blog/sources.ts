import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { readBlobJson, writeBlobJson } from "../blob-json";

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
const BLOB_PREFIX = "blog-sources";
const LOCAL_DIR = join(process.cwd(), "data");
const LOCAL_FILE = join(LOCAL_DIR, "blog-sources.json");

export async function getSources(): Promise<BlogSource[]> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return readBlobJson<BlogSource[]>(BLOB_PREFIX, []);
  }
  if (!existsSync(LOCAL_FILE)) return [];
  try {
    return JSON.parse(readFileSync(LOCAL_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export async function saveSources(sources: BlogSource[]): Promise<void> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await writeBlobJson(BLOB_PREFIX, BLOB_KEY, sources);
  } else {
    if (!existsSync(LOCAL_DIR)) mkdirSync(LOCAL_DIR, { recursive: true });
    writeFileSync(LOCAL_FILE, JSON.stringify(sources, null, 2));
  }
}

export function generateSourceId(): string {
  return `src_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
