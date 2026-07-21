import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { readBlobJson, writeBlobJson } from "./blob-json";

// Límite de intentos fallidos de login del panel admin, por IP. Sigue el mismo
// patrón dual Blob/filesystem que requests.ts, categories.ts, etc.: en producción
// (BLOB_READ_WRITE_TOKEN configurado) persiste en Vercel Blob, que ya está
// desplegado en este proyecto — así el bloqueo sobrevive entre invocaciones de
// funciones serverless sin depender de un Map en memoria (que no se comparte
// entre instancias) ni de añadir infraestructura nueva (Redis/KV).

const WINDOW_MS = 15 * 60 * 1000; // ventana en la que se cuentan intentos
const LOCKOUT_MS = 15 * 60 * 1000; // duración del bloqueo tras superar el límite
const MAX_ATTEMPTS = 5;

type Attempt = { count: number; firstAttemptAt: string; lockedUntil?: string };
type AttemptsStore = Record<string, Attempt>;

const BLOB_KEY = "admin-login-attempts.json";
const BLOB_PREFIX = "admin-login-attempts";
const LOCAL_DIR = join(process.cwd(), "data");
const LOCAL_FILE = join(LOCAL_DIR, "admin-login-attempts.json");

async function readStore(): Promise<AttemptsStore> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return readBlobJson<AttemptsStore>(BLOB_PREFIX, {});
  }
  if (!existsSync(LOCAL_FILE)) return {};
  try {
    return JSON.parse(readFileSync(LOCAL_FILE, "utf-8"));
  } catch {
    return {};
  }
}

async function writeStore(store: AttemptsStore): Promise<void> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await writeBlobJson(BLOB_PREFIX, BLOB_KEY, store);
    return;
  }
  if (!existsSync(LOCAL_DIR)) mkdirSync(LOCAL_DIR, { recursive: true });
  writeFileSync(LOCAL_FILE, JSON.stringify(store, null, 2));
}

function prune(store: AttemptsStore, now: number): AttemptsStore {
  const next: AttemptsStore = {};
  for (const [ip, a] of Object.entries(store)) {
    const stillLocked = !!a.lockedUntil && Date.parse(a.lockedUntil) > now;
    const withinWindow = now - Date.parse(a.firstAttemptAt) < WINDOW_MS;
    if (stillLocked || withinWindow) next[ip] = a;
  }
  return next;
}

export type LockoutStatus = { locked: boolean; retryAfterSeconds: number };

export async function checkLockout(ip: string): Promise<LockoutStatus> {
  const store = await readStore();
  const a = store[ip];
  const lockedUntil = a?.lockedUntil ? Date.parse(a.lockedUntil) : 0;
  const now = Date.now();
  if (lockedUntil > now) {
    return { locked: true, retryAfterSeconds: Math.ceil((lockedUntil - now) / 1000) };
  }
  return { locked: false, retryAfterSeconds: 0 };
}

export async function recordFailedAttempt(ip: string): Promise<LockoutStatus> {
  const now = Date.now();
  const store = prune(await readStore(), now);
  const existing = store[ip];
  const withinWindow = !!existing && now - Date.parse(existing.firstAttemptAt) < WINDOW_MS;
  const count = withinWindow ? existing.count + 1 : 1;
  const firstAttemptAt = withinWindow ? existing.firstAttemptAt : new Date(now).toISOString();

  const locked = count >= MAX_ATTEMPTS;
  store[ip] = {
    count,
    firstAttemptAt,
    lockedUntil: locked ? new Date(now + LOCKOUT_MS).toISOString() : existing?.lockedUntil,
  };
  await writeStore(store);

  return locked
    ? { locked: true, retryAfterSeconds: Math.ceil(LOCKOUT_MS / 1000) }
    : { locked: false, retryAfterSeconds: 0 };
}

export async function clearAttempts(ip: string): Promise<void> {
  const store = await readStore();
  if (!(ip in store)) return;
  delete store[ip];
  await writeStore(store);
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
