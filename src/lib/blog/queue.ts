import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { readBlobJson, writeBlobJson } from "../blob-json";

export type QueueStatus =
  | "pending"
  | "rewriting"
  | "ready"
  | "failed"
  | "approved";

export type QueueItem = {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceExcerpt: string | null;
  sourceContent: string | null;
  sourceImage: string | null;
  sourcePublishedAt: string | null;
  ingestedAt: string;

  status: QueueStatus;
  errorMessage: string | null;

  // Borrador IA (multi-idioma)
  aiSlug: string | null;
  aiCategorySlug: string | null;
  aiTitleEs: string | null;
  aiTitleCa: string | null;
  aiTitleEn: string | null;
  aiExcerptEs: string | null;
  aiExcerptCa: string | null;
  aiExcerptEn: string | null;
  aiBodyEs: string | null;
  aiBodyCa: string | null;
  aiBodyEn: string | null;
  aiMetaTitleEs: string | null;
  aiMetaTitleCa: string | null;
  aiMetaTitleEn: string | null;
  aiMetaDescriptionEs: string | null;
  aiMetaDescriptionCa: string | null;
  aiMetaDescriptionEn: string | null;

  aiModel: string | null;
  aiTokensIn: number | null;
  aiTokensOut: number | null;
  rewrittenAt: string | null;
  reviewedAt: string | null;
  blogPostSlug: string | null;
};

const BLOB_KEY = "blog-queue.json";
const BLOB_PREFIX = "blog-queue";
const LOCAL_DIR = join(process.cwd(), "data");
const LOCAL_FILE = join(LOCAL_DIR, "blog-queue.json");

export async function getQueue(): Promise<QueueItem[]> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return readBlobJson<QueueItem[]>(BLOB_PREFIX, []);
  }
  if (!existsSync(LOCAL_FILE)) return [];
  try {
    return JSON.parse(readFileSync(LOCAL_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export async function saveQueue(queue: QueueItem[]): Promise<void> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await writeBlobJson(BLOB_PREFIX, BLOB_KEY, queue);
  } else {
    if (!existsSync(LOCAL_DIR)) mkdirSync(LOCAL_DIR, { recursive: true });
    writeFileSync(LOCAL_FILE, JSON.stringify(queue, null, 2));
  }
}

export function generateQueueId(): string {
  return `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyDraft(): Pick<
  QueueItem,
  | "aiSlug"
  | "aiCategorySlug"
  | "aiTitleEs"
  | "aiTitleCa"
  | "aiTitleEn"
  | "aiExcerptEs"
  | "aiExcerptCa"
  | "aiExcerptEn"
  | "aiBodyEs"
  | "aiBodyCa"
  | "aiBodyEn"
  | "aiMetaTitleEs"
  | "aiMetaTitleCa"
  | "aiMetaTitleEn"
  | "aiMetaDescriptionEs"
  | "aiMetaDescriptionCa"
  | "aiMetaDescriptionEn"
  | "aiModel"
  | "aiTokensIn"
  | "aiTokensOut"
  | "rewrittenAt"
  | "reviewedAt"
  | "blogPostSlug"
> {
  return {
    aiSlug: null,
    aiCategorySlug: null,
    aiTitleEs: null,
    aiTitleCa: null,
    aiTitleEn: null,
    aiExcerptEs: null,
    aiExcerptCa: null,
    aiExcerptEn: null,
    aiBodyEs: null,
    aiBodyCa: null,
    aiBodyEn: null,
    aiMetaTitleEs: null,
    aiMetaTitleCa: null,
    aiMetaTitleEn: null,
    aiMetaDescriptionEs: null,
    aiMetaDescriptionCa: null,
    aiMetaDescriptionEn: null,
    aiModel: null,
    aiTokensIn: null,
    aiTokensOut: null,
    rewrittenAt: null,
    reviewedAt: null,
    blogPostSlug: null,
  };
}
