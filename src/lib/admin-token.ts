// Núcleo único de autenticación del panel admin — usado por admin-auth.ts (rutas API),
// proxy.ts (middleware) y api/admin/auth/route.ts (login). Antes esta lógica estaba
// triplicada en los tres archivos, con riesgo de que una corrección se aplicara en
// uno y se olvidara en los otros.

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días — igual que el maxAge de la cookie

// Comparación a tiempo constante (portable a Edge, sin depender de node:crypto).
// Exportada para reutilizarla en otras comprobaciones de secretos (p. ej. CRON_SECRET).
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await globalThis.crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// `VERCEL` está presente ("1") en CUALQUIER entorno gestionado por Vercel —
// Production, Preview y Development remoto —, a diferencia de `VERCEL_ENV`,
// que solo vale "production" en producción. Comprobar solo VERCEL_ENV dejaba
// los despliegues Preview sin exigir ADMIN_PASSWORD/ADMIN_SECRET: si faltaban
// ahí, el token esperado se volvía calculable (HMAC de una contraseña vacía).
function assertSecretsConfigured(): void {
  const managedByVercel = process.env.VERCEL === "1";
  if (managedByVercel && (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SECRET)) {
    throw new Error(
      "ADMIN_PASSWORD y ADMIN_SECRET deben estar configurados en Vercel (Production, Preview y Development), no solo en Production",
    );
  }
}

/** Compara la contraseña recibida con ADMIN_PASSWORD a tiempo constante. */
export async function verifyPassword(password: string): Promise<boolean> {
  assertSecretsConfigured();
  const secret = process.env.ADMIN_SECRET ?? "dev-secret";
  const expected = process.env.ADMIN_PASSWORD ?? "";
  // Se comparan HMACs (longitud fija) en vez de las contraseñas en crudo, para
  // no filtrar la longitud real de ADMIN_PASSWORD a través de la comparación.
  const [a, b] = await Promise.all([hmacHex(secret, password), hmacHex(secret, expected)]);
  return timingSafeEqual(a, b);
}

/** Crea un token de sesión firmado con expiración real embebida (7 días). */
export async function createSessionToken(): Promise<string> {
  assertSecretsConfigured();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SECRET ?? "dev-secret";
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const signature = await hmacHex(secret, `${password}.${expiresAt}`);
  return `${expiresAt}.${signature}`;
}

/**
 * Valida un token de sesión: firma correcta Y no caducado. A diferencia de un
 * HMAC estático, un token capturado deja de ser válido en el servidor pasados
 * 7 días, aunque se reproduzca manualmente (antes la validación era una simple
 * recomputación sin componente temporal, así que un token filtrado servía para
 * siempre mientras no cambiaran los secretos).
 */
export async function isValidSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  assertSecretsConfigured();
  const [expiresAtStr, signature] = token.split(".");
  if (!expiresAtStr || !signature) return false;
  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SECRET ?? "dev-secret";
  const expectedSignature = await hmacHex(secret, `${password}.${expiresAtStr}`);
  return timingSafeEqual(signature, expectedSignature);
}

export const SESSION_COOKIE_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;
