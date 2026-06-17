"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { QueueItem } from "@/lib/blog/queue";
import type { Category } from "@/lib/categories";

type Lang = "es" | "ca" | "en";

const LANG_LABELS: Record<Lang, string> = {
  es: "Español",
  ca: "Català",
  en: "English",
};

export function QueueDraftEditor({
  initial,
  categories,
}: {
  initial: QueueItem;
  categories: Category[];
}) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("es");

  const [slug, setSlug] = useState(initial.aiSlug ?? "");
  const [categorySlug, setCategorySlug] = useState(initial.aiCategorySlug ?? "");

  const [titleEs, setTitleEs] = useState(initial.aiTitleEs ?? "");
  const [titleCa, setTitleCa] = useState(initial.aiTitleCa ?? "");
  const [titleEn, setTitleEn] = useState(initial.aiTitleEn ?? "");
  const [excerptEs, setExcerptEs] = useState(initial.aiExcerptEs ?? "");
  const [excerptCa, setExcerptCa] = useState(initial.aiExcerptCa ?? "");
  const [excerptEn, setExcerptEn] = useState(initial.aiExcerptEn ?? "");
  const [bodyEs, setBodyEs] = useState(initial.aiBodyEs ?? "");
  const [bodyCa, setBodyCa] = useState(initial.aiBodyCa ?? "");
  const [bodyEn, setBodyEn] = useState(initial.aiBodyEn ?? "");
  const [metaTitleEs, setMetaTitleEs] = useState(initial.aiMetaTitleEs ?? "");
  const [metaTitleCa, setMetaTitleCa] = useState(initial.aiMetaTitleCa ?? "");
  const [metaTitleEn, setMetaTitleEn] = useState(initial.aiMetaTitleEn ?? "");
  const [metaDescEs, setMetaDescEs] = useState(initial.aiMetaDescriptionEs ?? "");
  const [metaDescCa, setMetaDescCa] = useState(initial.aiMetaDescriptionCa ?? "");
  const [metaDescEn, setMetaDescEn] = useState(initial.aiMetaDescriptionEn ?? "");

  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");

  const current = {
    title: lang === "es" ? titleEs : lang === "ca" ? titleCa : titleEn,
    setTitle: lang === "es" ? setTitleEs : lang === "ca" ? setTitleCa : setTitleEn,
    excerpt: lang === "es" ? excerptEs : lang === "ca" ? excerptCa : excerptEn,
    setExcerpt: lang === "es" ? setExcerptEs : lang === "ca" ? setExcerptCa : setExcerptEn,
    body: lang === "es" ? bodyEs : lang === "ca" ? bodyCa : bodyEn,
    setBody: lang === "es" ? setBodyEs : lang === "ca" ? setBodyCa : setBodyEn,
    metaTitle:
      lang === "es" ? metaTitleEs : lang === "ca" ? metaTitleCa : metaTitleEn,
    setMetaTitle:
      lang === "es" ? setMetaTitleEs : lang === "ca" ? setMetaTitleCa : setMetaTitleEn,
    metaDesc: lang === "es" ? metaDescEs : lang === "ca" ? metaDescCa : metaDescEn,
    setMetaDesc:
      lang === "es" ? setMetaDescEs : lang === "ca" ? setMetaDescCa : setMetaDescEn,
  };

  function payload() {
    return {
      aiSlug: slug,
      aiCategorySlug: categorySlug,
      aiTitleEs: titleEs,
      aiTitleCa: titleCa,
      aiTitleEn: titleEn,
      aiExcerptEs: excerptEs,
      aiExcerptCa: excerptCa,
      aiExcerptEn: excerptEn,
      aiBodyEs: bodyEs,
      aiBodyCa: bodyCa,
      aiBodyEn: bodyEn,
      aiMetaTitleEs: metaTitleEs,
      aiMetaTitleCa: metaTitleCa,
      aiMetaTitleEn: metaTitleEn,
      aiMetaDescriptionEs: metaDescEs,
      aiMetaDescriptionCa: metaDescCa,
      aiMetaDescriptionEn: metaDescEn,
    };
  }

  async function saveDraft() {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/blog-queue/${initial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload()),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Error al guardar");
      }
    } finally {
      setSaving(false);
    }
  }

  async function approve(publish: boolean) {
    if (!titleEs.trim() || !bodyEs.trim() || !slug.trim() || !categorySlug) {
      setError("Faltan datos obligatorios: título ES, cuerpo ES, slug y categoría.");
      return;
    }
    if (!confirm(publish ? "¿Publicar este post inmediatamente?" : "¿Crear borrador en el blog?")) return;
    setError("");
    setApproving(true);
    try {
      // Primero guarda cualquier cambio pendiente
      const saveRes = await fetch(`/api/admin/blog-queue/${initial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload()),
      });
      if (!saveRes.ok) {
        setError("No se pudo guardar antes de aprobar");
        return;
      }
      const res = await fetch(`/api/admin/blog-queue/${initial.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish }),
      });
      if (res.ok) {
        router.push("/admin/blog/queue");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Error al aprobar");
      }
    } finally {
      setApproving(false);
    }
  }

  async function regenerate() {
    if (!confirm("¿Regenerar el borrador con Claude? Se sobrescribirán los textos actuales.")) return;
    setError("");
    setRegenerating(true);
    try {
      const res = await fetch(`/api/admin/blog-queue/${initial.id}/rewrite`, {
        method: "POST",
      });
      if (res.ok) {
        const fresh = await res.json();
        setSlug(fresh.aiSlug ?? "");
        setCategorySlug(fresh.aiCategorySlug ?? "");
        setTitleEs(fresh.aiTitleEs ?? "");
        setTitleCa(fresh.aiTitleCa ?? "");
        setTitleEn(fresh.aiTitleEn ?? "");
        setExcerptEs(fresh.aiExcerptEs ?? "");
        setExcerptCa(fresh.aiExcerptCa ?? "");
        setExcerptEn(fresh.aiExcerptEn ?? "");
        setBodyEs(fresh.aiBodyEs ?? "");
        setBodyCa(fresh.aiBodyCa ?? "");
        setBodyEn(fresh.aiBodyEn ?? "");
        setMetaTitleEs(fresh.aiMetaTitleEs ?? "");
        setMetaTitleCa(fresh.aiMetaTitleCa ?? "");
        setMetaTitleEn(fresh.aiMetaTitleEn ?? "");
        setMetaDescEs(fresh.aiMetaDescriptionEs ?? "");
        setMetaDescCa(fresh.aiMetaDescriptionCa ?? "");
        setMetaDescEn(fresh.aiMetaDescriptionEn ?? "");
      } else {
        const data = await res.json();
        setError(`Claude falló: ${data.error ?? "desconocido"}`);
      }
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200">
        {(["es", "ca", "en"] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              lang === l
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {LANG_LABELS[l]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-gray-200 rounded-xl p-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            URL (slug)
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            pattern="[a-z0-9-]+"
            className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Categoría
          </label>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">— Selecciona —</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nameEs}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={regenerate}
            disabled={regenerating}
            className="w-full px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 transition"
          >
            {regenerating ? "Regenerando…" : "Regenerar con Claude"}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Título ({LANG_LABELS[lang]})
        </label>
        <input
          type="text"
          value={current.title}
          onChange={(e) => current.setTitle(e.target.value)}
          className="w-full px-3.5 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Resumen ({LANG_LABELS[lang]})
        </label>
        <textarea
          value={current.excerpt}
          onChange={(e) => current.setExcerpt(e.target.value)}
          rows={2}
          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Contenido HTML ({LANG_LABELS[lang]})
          <span className="text-gray-400 font-normal ml-2 text-xs">
            Generado por Claude — edita libremente
          </span>
        </label>
        <textarea
          value={current.body}
          onChange={(e) => current.setBody(e.target.value)}
          rows={20}
          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        <details className="mt-2">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-900">
            Vista previa
          </summary>
          <div
            className="mt-3 prose prose-sm max-w-none p-4 bg-white border border-gray-200 rounded-lg"
            dangerouslySetInnerHTML={{ __html: current.body }}
          />
        </details>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">
          SEO ({LANG_LABELS[lang]})
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Meta título
          </label>
          <input
            type="text"
            value={current.metaTitle}
            onChange={(e) => current.setMetaTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Meta descripción
          </label>
          <textarea
            value={current.metaDesc}
            onChange={(e) => current.setMetaDesc(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={saveDraft}
          disabled={saving || approving}
          className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-60 transition"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={() => approve(false)}
          disabled={saving || approving}
          className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 disabled:opacity-60 transition"
        >
          {approving ? "Procesando…" : "Aprobar como borrador"}
        </button>
        <button
          type="button"
          onClick={() => approve(true)}
          disabled={saving || approving}
          className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60 transition"
        >
          {approving ? "Publicando…" : "Publicar ahora"}
        </button>
      </div>
    </div>
  );
}
