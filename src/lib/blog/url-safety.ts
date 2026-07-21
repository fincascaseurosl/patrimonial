import { promises as dns } from "dns";
import { isIP } from "net";

// Evita SSRF a través de las fuentes RSS del blog con IA: sin esto, un admin
// (o una sesión admin comprometida) podría dar de alta como "fuente" cualquier
// URL http(s), incluida una que apunte a la red interna del propio servidor
// (localhost, IP de metadata de la nube, rangos privados...), y el cron de
// ingesta la solicitaría igual que un feed RSS normal.

const BLOCKED_IPV4_RANGES: Array<[string, number]> = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16], // incluye 169.254.169.254 (metadata AWS/GCP/Azure)
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

function ipv4ToInt(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

function isBlockedIPv4(ip: string): boolean {
  const ipInt = ipv4ToInt(ip);
  return BLOCKED_IPV4_RANGES.some(([base, bits]) => {
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (ipInt & mask) === (ipv4ToInt(base) & mask);
  });
}

function isBlockedIPv6(ip: string): boolean {
  const n = ip.toLowerCase();
  if (n === "::1" || n === "::") return true;
  if (n.startsWith("fc") || n.startsWith("fd")) return true; // fc00::/7 (unique local)
  if (/^fe[89ab]/.test(n)) return true; // fe80::/10 (link-local)
  const mapped = n.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isBlockedIPv4(mapped[1]);
  return false;
}

/** true si la URL es http(s) y apunta a un host público (no localhost/privado/metadata). */
export async function isPubliclyRoutableUrl(rawUrl: string): Promise<boolean> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return false;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;

  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost")) return false;

  const version = isIP(hostname);
  if (version === 4) return !isBlockedIPv4(hostname);
  if (version === 6) return !isBlockedIPv6(hostname);

  // Hostname normal: resuelve TODAS las IPs asociadas y rechaza si alguna es
  // privada (evita DNS rebinding entre el alta de la fuente y su uso posterior).
  try {
    const records = await dns.lookup(hostname, { all: true, verbatim: true });
    if (records.length === 0) return false;
    return records.every((r) =>
      r.family === 6 ? !isBlockedIPv6(r.address) : !isBlockedIPv4(r.address),
    );
  } catch {
    return false;
  }
}
