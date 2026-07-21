import { put, del, list } from "@vercel/blob";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

// Configuración editable de la página "Construye tu casa". De momento, las
// fotos del proceso (una por fase). Mismo patrón blob + fallback local que
// projects.ts / categories.ts.

export type CasaConfig = {
  procesoImages: string[];
};

const BLOB_KEY = "casa-config.json";
const LOCAL_DIR = join(process.cwd(), "data");
const LOCAL_FILE = join(LOCAL_DIR, "casa-config.json");

// Fotos por defecto del proceso (las mismas que había fijadas en la página).
export const DEFAULT_PROCESO_IMAGES = [
  "/images/hero/blueprint.jpg",
  "/images/hero/hero.jpg",
  "/images/portfolio/reforma-piso-barcelona-1.jpg",
  "/images/portfolio/reforma-piso-barcelona-2.jpg",
  "/images/portfolio/reforma-piso-barcelona-3.jpg",
];

const DEFAULTS: CasaConfig = { procesoImages: DEFAULT_PROCESO_IMAGES };

function normalize(raw: unknown): CasaConfig {
  const cfg = (raw ?? {}) as Partial<CasaConfig>;
  const imgs = Array.isArray(cfg.procesoImages)
    ? cfg.procesoImages.filter((s): s is string => typeof s === "string" && s.length > 0)
    : [];
  return { procesoImages: imgs.length ? imgs : DEFAULT_PROCESO_IMAGES };
}

export async function getCasaConfig(): Promise<CasaConfig> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: BLOB_KEY });
      const blob = blobs.find((b) => b.pathname === BLOB_KEY);
      if (!blob) return DEFAULTS;
      const res = await fetch(blob.url, { next: { revalidate: 60 } } as RequestInit);
      return normalize(await res.json());
    } catch {
      return DEFAULTS;
    }
  }
  if (!existsSync(LOCAL_FILE)) return DEFAULTS;
  try {
    return normalize(JSON.parse(readFileSync(LOCAL_FILE, "utf-8")));
  } catch {
    return DEFAULTS;
  }
}

export async function saveCasaConfig(config: CasaConfig): Promise<void> {
  const body = JSON.stringify(normalize(config));
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { blobs } = await list({ prefix: BLOB_KEY });
    await Promise.all(blobs.map((b) => del(b.url)));
    await put(BLOB_KEY, body, { access: "public", addRandomSuffix: false });
  } else {
    if (!existsSync(LOCAL_DIR)) mkdirSync(LOCAL_DIR, { recursive: true });
    writeFileSync(LOCAL_FILE, body);
  }
}
