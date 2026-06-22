import { put, del, list } from "@vercel/blob";

// Almacén JSON sobre Vercel Blob para datos sensibles/internos (solicitudes de
// contacto, cola y fuentes del blog IA).
//
// - URL NO adivinable (addRandomSuffix): evita que el JSON sea descargable por
//   una URL predecible aunque el store sea público.
// - Lectura sin caché (cache: "no-store"): siempre datos frescos, imprescindible
//   en flujos admin que leen justo después de escribir.
// - put ANTES de del: nunca queda una ventana sin el blob (evita lecturas vacías
//   transitorias bajo concurrencia, p. ej. cron + edición admin).
//
// Para auth-grade real (access: "private" + get()) habría que verificar en
// producción la lectura autenticada; este enfoque es el mínimo seguro desplegable.

export async function readBlobJson<T>(prefix: string, fallback: T): Promise<T> {
  try {
    const { blobs } = await list({ prefix });
    if (!blobs.length) return fallback;
    const latest = blobs.reduce((a, b) => (a.uploadedAt > b.uploadedAt ? a : b));
    const res = await fetch(latest.url, { cache: "no-store" });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function writeBlobJson(
  prefix: string,
  key: string,
  data: unknown,
): Promise<void> {
  const created = await put(key, JSON.stringify(data), {
    access: "public",
    addRandomSuffix: true,
  });
  // Limpia versiones anteriores (incluida la antigua de nombre fijo), nunca la recién creada.
  const { blobs } = await list({ prefix });
  await Promise.all(
    blobs.filter((b) => b.url !== created.url).map((b) => del(b.url)),
  );
}
