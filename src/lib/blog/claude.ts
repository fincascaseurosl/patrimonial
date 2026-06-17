const API_URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";
const MODEL = "claude-sonnet-4-6";

export interface RewriteInput {
  sourceTitle: string;
  sourceExcerpt?: string | null;
  sourceContent?: string | null;
  sourceUrl?: string | null;
  categories: { slug: string; nameEs: string }[];
}

export interface RewriteOutput {
  titleEs: string;
  titleCa: string;
  titleEn: string;
  excerptEs: string;
  excerptCa: string;
  excerptEn: string;
  bodyEs: string;
  bodyCa: string;
  bodyEn: string;
  metaTitleEs: string;
  metaTitleCa: string;
  metaTitleEn: string;
  metaDescriptionEs: string;
  metaDescriptionCa: string;
  metaDescriptionEn: string;
  slug: string;
  categorySlug: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
}

export class ClaudeError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ClaudeError";
  }
}

function buildSystemPrompt(categories: { slug: string; nameEs: string }[]): string {
  const catList = categories.map((c) => `${c.slug} (${c.nameEs})`).join(", ");
  return `Eres el redactor jefe del blog de Patrimonial Obras Barcelona, una empresa de construcción, reformas integrales y rehabilitación de edificios con más de 25 años de experiencia en Barcelona.

Tu trabajo: leer una noticia del sector y reescribirla COMPLETAMENTE en un artículo nuevo con la voz de Patrimonial, en TRES idiomas (español, catalán e inglés) en la misma respuesta. NUNCA copies frases ni estructura del original.

VOZ DE LA MARCA
- Profesional, clara, cercana. Sin jerga innecesaria.
- Tuteamos al lector en ES/CA; en EN usamos un registro educado y directo ("you").
- Foco: propietarios, comunidades de vecinos, administradores de fincas, arquitectos, inversores en Barcelona y Cataluña.
- Conecta el tema con los servicios de Patrimonial cuando aplique (reformas integrales, obra nueva, rehabilitación de edificios, instalaciones, retirada de amianto, trabajos verticales, refuerzos estructurales, impermeabilización) sin venta agresiva.

REGLAS EDITORIALES OBLIGATORIAS
1. PROHIBIDO el término "garantía por partida" (y sus traducciones). NUNCA lo uses.
2. PROHIBIDO mencionar materiales concretos de impermeabilización (poliuretano, EPDM, telas asfálticas, caucho, etc.). Habla de "soluciones profesionales de impermeabilización" en abstracto.
3. Si describes la fase 01 del método Patrimonial, debe ser "Auditoría del proyecto" con descripción "Permisos y trámites" (ES); "Auditoria del projecte / Permisos i tràmits" (CA); "Project audit / Permits and paperwork" (EN).

REGLAS DURAS
4. NO menciones la fuente original ni a otros medios. NO copies frases textuales.
5. NO inventes datos numéricos. Si no estás 100% seguro, omítelo o usa un rango aproximado claramente marcado como estimación del sector.
6. Extensión del cuerpo: 600-900 palabras en cada idioma.
7. Estructura HTML del cuerpo: 3-5 subtítulos <h2>, párrafos <p>, listas <ul><li> cuando aplique. Sin <h1> (lo pone la web).
8. Termina cada idioma con un párrafo final que invita a contactar con Patrimonial si necesita asesoramiento sobre el tema, sin URLs ni teléfonos.
9. Categoría: elige UNA de la lista por slug exacto: ${catList}.
10. Slug del post: minúsculas, palabras separadas por guión, sin tildes ni caracteres especiales, máximo 70 caracteres. El slug es único y se usa en las tres URLs.
11. Meta title por idioma: máximo 60 caracteres.
12. Meta description por idioma: 140-155 caracteres.
13. Excerpt por idioma: 1-2 frases, máximo 200 caracteres.
14. Las versiones CA y EN deben tener el mismo significado y estructura argumental que la ES, no traducir literalmente palabra por palabra, sino adaptar de forma natural.

DEVUELVE ÚNICAMENTE UN OBJETO JSON VÁLIDO con esta estructura exacta (sin comentarios, sin markdown, sin texto antes ni después):

{
  "slug": "...",
  "categorySlug": "...",
  "titleEs": "...",
  "titleCa": "...",
  "titleEn": "...",
  "excerptEs": "...",
  "excerptCa": "...",
  "excerptEn": "...",
  "bodyEs": "<p>...</p><h2>...</h2>...",
  "bodyCa": "<p>...</p><h2>...</h2>...",
  "bodyEn": "<p>...</p><h2>...</h2>...",
  "metaTitleEs": "...",
  "metaTitleCa": "...",
  "metaTitleEn": "...",
  "metaDescriptionEs": "...",
  "metaDescriptionCa": "...",
  "metaDescriptionEn": "..."
}`;
}

export async function rewriteArticle(input: RewriteInput): Promise<RewriteOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new ClaudeError("ANTHROPIC_API_KEY no configurada en .env.local");
  }
  if (input.categories.length === 0) {
    throw new ClaudeError("No hay categorías disponibles. Crea al menos una desde el admin antes de generar artículos.");
  }

  const userMessage = [
    `TÍTULO ORIGINAL: ${input.sourceTitle}`,
    input.sourceExcerpt ? `\nRESUMEN ORIGINAL:\n${input.sourceExcerpt}` : "",
    input.sourceContent
      ? `\nCUERPO ORIGINAL (solo para extraer datos, NO copies):\n${input.sourceContent.slice(0, 8000)}`
      : "",
    `\nReescribe ahora un artículo COMPLETAMENTE NUEVO en ES, CA y EN con la voz de Patrimonial y devuelve el JSON.`,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": API_VERSION,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8192,
      system: buildSystemPrompt(input.categories),
      messages: [{ role: "user", content: userMessage }],
    }),
    signal: AbortSignal.timeout(120000),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new ClaudeError(`Claude API HTTP ${res.status}: ${err.slice(0, 400)}`, res.status);
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
    usage?: { input_tokens?: number; output_tokens?: number };
    model?: string;
  };

  const text = data.content?.find((c) => c.type === "text")?.text || "";
  if (!text) throw new ClaudeError("Respuesta vacía de Claude");

  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();

  let parsed: Omit<RewriteOutput, "model" | "tokensIn" | "tokensOut">;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new ClaudeError(`Claude no devolvió JSON válido. Respuesta: ${cleaned.slice(0, 400)}`);
  }

  const validSlugs = new Set(input.categories.map((c) => c.slug));
  const categorySlug = validSlugs.has(parsed.categorySlug)
    ? parsed.categorySlug
    : input.categories[0].slug;

  return {
    titleEs: parsed.titleEs ?? "",
    titleCa: parsed.titleCa ?? "",
    titleEn: parsed.titleEn ?? "",
    excerptEs: parsed.excerptEs ?? "",
    excerptCa: parsed.excerptCa ?? "",
    excerptEn: parsed.excerptEn ?? "",
    bodyEs: parsed.bodyEs ?? "",
    bodyCa: parsed.bodyCa ?? "",
    bodyEn: parsed.bodyEn ?? "",
    metaTitleEs: parsed.metaTitleEs ?? "",
    metaTitleCa: parsed.metaTitleCa ?? "",
    metaTitleEn: parsed.metaTitleEn ?? "",
    metaDescriptionEs: parsed.metaDescriptionEs ?? "",
    metaDescriptionCa: parsed.metaDescriptionCa ?? "",
    metaDescriptionEn: parsed.metaDescriptionEn ?? "",
    slug: parsed.slug ?? "",
    categorySlug,
    model: data.model || MODEL,
    tokensIn: data.usage?.input_tokens || 0,
    tokensOut: data.usage?.output_tokens || 0,
  };
}
