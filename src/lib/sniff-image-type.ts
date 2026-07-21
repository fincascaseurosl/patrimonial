// Detección del tipo real de imagen a partir de sus primeros bytes (firma/magic
// bytes), en vez de confiar en el Content-Type que declara el navegador —
// fácilmente falsificable en una petición hecha a mano contra /api/admin/upload.

export type SniffedImageType = "image/jpeg" | "image/png" | "image/webp" | "image/avif";

export function sniffImageType(buffer: Buffer): SniffedImageType | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (pngSignature.every((byte, i) => buffer[i] === byte)) {
    return "image/png";
  }

  // WEBP: contenedor RIFF con fourCC "WEBP"
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp";
  }

  // AVIF: contenedor ISO BMFF ("ftyp") con marca "avif"/"avis" en la cabecera
  if (buffer.toString("ascii", 4, 8) === "ftyp") {
    const header = buffer.toString("ascii", 8, Math.min(buffer.length, 32));
    if (header.includes("avif") || header.includes("avis")) {
      return "image/avif";
    }
  }

  return null;
}
