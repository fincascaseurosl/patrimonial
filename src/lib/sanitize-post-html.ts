import sanitizeHtml from "sanitize-html";

// Lista blanca alineada con lo que el editor TipTap (RichTextEditor.tsx) puede
// producir: negrita, cursiva, H2/H3, listas, cita, enlace, imagen y separador.
// Se aplica tanto al guardar (posts creados a mano o aprobados desde la cola de
// IA/RSS) como al renderizar en la página pública del blog (defensa en profundidad).
const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "s", "strike", "u",
  "h2", "h3", "ul", "ol", "li", "blockquote", "hr",
  "a", "img", "code", "pre",
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "class", "target", "rel"],
  img: ["src", "alt", "class", "width", "height"],
  "*": ["class"],
};

export function sanitizePostHtml(html: string): string {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
    },
  });
}
