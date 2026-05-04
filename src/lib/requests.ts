import { put, del, list } from "@vercel/blob";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

export type RequestStatus = "new" | "read" | "replied" | "archived";

export type ContactRequest = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
  status: RequestStatus;
  receivedAt: string;
  readAt?: string;
  repliedAt?: string;
  internalNotes: string;
  sourcePath?: string;
  ip?: string;
  userAgent?: string;
};

const BLOB_KEY = "requests.json";
const LOCAL_DIR = join(process.cwd(), "data");
const LOCAL_FILE = join(LOCAL_DIR, "requests.json");

export async function getRequests(): Promise<ContactRequest[]> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: BLOB_KEY });
      const blob = blobs.find((b) => b.pathname === BLOB_KEY);
      if (!blob) return [];
      // Sin caché aquí: queremos los datos siempre frescos en admin
      const res = await fetch(blob.url, { cache: "no-store" });
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

export async function saveRequests(requests: ContactRequest[]): Promise<void> {
  const body = JSON.stringify(requests);
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { blobs } = await list({ prefix: BLOB_KEY });
    await Promise.all(blobs.map((b) => del(b.url)));
    await put(BLOB_KEY, body, { access: "public", addRandomSuffix: false });
  } else {
    if (!existsSync(LOCAL_DIR)) mkdirSync(LOCAL_DIR, { recursive: true });
    writeFileSync(LOCAL_FILE, JSON.stringify(requests, null, 2));
  }
}

export async function addRequest(
  data: Omit<ContactRequest, "id" | "status" | "receivedAt" | "internalNotes">,
): Promise<ContactRequest> {
  const requests = await getRequests();
  const newReq: ContactRequest = {
    ...data,
    id: randomUUID(),
    status: "new",
    receivedAt: new Date().toISOString(),
    internalNotes: "",
  };
  await saveRequests([newReq, ...requests]);
  return newReq;
}

export function countNewRequests(requests: ContactRequest[]): number {
  return requests.filter((r) => r.status === "new").length;
}
