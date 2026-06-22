import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import { readBlobJson, writeBlobJson } from "./blob-json";

export type RequestStatus = "new" | "read" | "replied" | "archived";

export type ContactRequest = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  servicio?: string;
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
const BLOB_PREFIX = "requests";
const LOCAL_DIR = join(process.cwd(), "data");
const LOCAL_FILE = join(LOCAL_DIR, "requests.json");

export async function getRequests(): Promise<ContactRequest[]> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return readBlobJson<ContactRequest[]>(BLOB_PREFIX, []);
  }
  if (!existsSync(LOCAL_FILE)) return [];
  try {
    return JSON.parse(readFileSync(LOCAL_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export async function saveRequests(requests: ContactRequest[]): Promise<void> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await writeBlobJson(BLOB_PREFIX, BLOB_KEY, requests);
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
