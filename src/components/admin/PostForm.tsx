"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "./RichTextEditor";
import type { Post } from "@/lib/posts";
import type { Category } from "@/lib/categories";

type Props = {
  initial?: Partial<Post>;
  categories: Category[];
  mode: "new" | "edit";
};

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toLocalInput(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PostForm({ initial, categories, mode }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [lang, setLang] = useState<"es" | "ca" | "en">("es");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [titleEs, setTitleEs] = useState(initial?.titleEs ?? "");
  const [titleCa, setTitleCa] = useState(initial?.titleCa ?? "");
  const [titleEn, setTitleEn] = useState(initial?.titleEn ?? "");
  const [excerptEs, setExcerptEs] = useState(initial?.excerptEs ?? "");
  const [excerptCa, setExcerptCa] = useState(initial?.excerptCa ?? "");
  const [excerptEn, setExcerptEn] = useState(initial?.excerptEn ?? "");
  const [bodyEs, setBodyEs] = useState(initial?.bodyEs ?? "");
  const [bodyCa, setBodyCa] = useState(initial?.bodyCa ?? "");
  const [bodyEn, setBodyEn] = useState(initial?.bodyEn ?? "");
  const [featuredImage, setFeaturedImage] = useState(initial?.featuredImage ?? "");
  const [categorySlug, setCategorySlug] = useState(initial?.categorySlug ?? categories[0]?.slug ?? "");
  const [status, setStatus] = useState<"draft" | "published">(initial?.status ?? "draft");
  const [publishedAt, setPublishedAt] = useState(toLocalInput(initial?.publishedAt ?? new Date().toISOString()));
  const [metaTitleEs, setMetaTitleEs] = useState(initial?.metaTitleEs ?? "");
  const [metaTitleCa, setMetaTitleCa] = useState(initial?.metaTitleCa ?? "");
  const [metaTitleEn, setMetaTitleEn] = useState(initial?.metaTitleEn ?? "");
  const [metaDescriptionEs, setMetaDescriptionEs] = useState(initial?.metaDescriptionEs ?? "");
  const [metaDescriptionCa, setMetaDescriptionCa] = useState(initial?.metaDescriptionCa ?? "");
  const [metaDescriptionEn, setMetaDescriptionEn] = useState(initial?.metaDescriptionEn ?? "");
  const [showSeo, setShowSeo] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleTitleChange(val: string) {
    if (lang === "es") setTitleEs(val);
    else if (lang === "ca") setTitleCa(val);
    else setTitleEn(val);
    if (mode === "new" && lang === "es") setSlug(slugify(val));
  }

  function handleExcerptChange(val: string) {
    if (lang === "es") setExcerptEs(val);
    else if (lang === "ca") setExcerptCa(val);
    else setExcerptEn(val);
  }

  function handleBodyChange(html: string) {
    if (lang === "es") setBodyEs(html);
    else if (lang === "ca") setBodyCa(html);
    else setBodyEn(html);
  }

  function handleMetaTitleChange(val: string) {
    if (lang === "es") setMetaTitleEs(val);
    else if (lang === "ca") setMetaTitleCa(val);
    else setMetaTitleEn(val);
  }

  function handleMetaDescriptionChange(val: string) {
    if (lang === "es") setMetaDescriptionEs(val);
    else if (lang === "ca") setMetaDescriptionCa(val);
    else setMetaDescriptionEn(val);
  }

  async function handleFeaturedUpload(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    if (res.ok) {
      const { url } = await res.json();
      setFeaturedImage(url);
    }
    setUploading(false);
  }

  async function submit(targetStatus: "draft" | "published") {
    if (!titleEs.trim()) {
      setError("El título en español es obligatorio");
      return;
    }
    if (!slug) {
      setError("El slug es obligatorio");
      return;
    }
    setError("");
    setSaving(true);

    const payload = {
      slug,
      titleEs, titleCa, titleEn,
      excerptEs, excerptCa, excerptEn,
      bodyEs, bodyCa, bodyEn,
      featuredImage,
      categorySlug,
      status: targetStatus,
      publishedAt: new Date(publishedAt).toISOString(),
      metaTitleEs, metaTitleCa, metaTitleEn,
      metaDescriptionEs, metaDescriptionCa, metaDescriptionEn,
    };

    const url = mode === "new" ? "/api/admin/posts" : `/api/admin/posts/${initial?.slug}`;
    const method = mode === "new" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        router.push("/admin/blog");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Error al guardar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  const currentTitle = lang === "es" ? titleEs : lang === "ca" ? titleCa : titleEn;
  const currentExcerpt = lang === "es" ? excerptEs : lang === "ca" ? excerptCa : excerptEn;
  const currentBody = lang === "es" ? bodyEs : lang === "ca" ? bodyCa : bodyEn;
  const currentMetaTitle = lang === "es" ? metaTitleEs : lang === "ca" ? metaTitleCa : metaTitleEn;
  const currentMetaDescription = lang === "es" ? metaDescriptionEs : lang === "ca" ? metaDescriptionCa : metaDescriptionEn;
  const langCode = lang.toUpperCase();

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">

      {/* Tabs idioma */}
      <div className="flex border-b border-gray-200">
        {(["es", "ca", "en"] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              lang === l ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {l === "es" ? "Español" : l === "ca" ? "Català" : "English"}
          </button>
        ))}
      </div>

      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Título {lang === "es" && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          value={currentTitle}
          onChange={(e) => handleTitleChange(e.target.value)}
          required={lang === "es"}
          className="w-full px-3.5 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder={
            lang === "es"
              ? "Cómo elegir empresa de reformas en Barcelona"
              : lang === "ca"
              ? "Com triar empresa de reformes a Barcelona"
              : "How to choose a renovation firm in Barcelona"
          }
        />
      </div>

      {/* Meta de fila: Slug, Categoría, Fecha */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-gray-200 rounded-xl p-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">URL</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={mode === "edit"}
            pattern="[a-z0-9-]+"
            className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
            placeholder="mi-articulo"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Categoría</label>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {categories.length === 0 && <option value="">(crea una primero)</option>}
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.nameEs}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Fecha publicación
          </label>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Imagen destacada */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Imagen destacada
          <span className="text-gray-400 font-normal ml-2">Aparece en el listado y al compartir</span>
        </label>
        {featuredImage ? (
          <div className="relative group rounded-lg overflow-hidden border border-gray-200">
            <img src={featuredImage} alt="" className="w-full max-h-64 object-cover" />
            <button
              type="button"
              onClick={() => setFeaturedImage("")}
              className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold opacity-0 group-hover:opacity-100 transition"
            >
              Cambiar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl py-10 flex flex-col items-center gap-2 text-gray-500 hover:border-red-400 hover:text-red-500 transition disabled:opacity-50"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-sm font-medium">{uploading ? "Subiendo…" : "Sube una imagen"}</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFeaturedUpload(f); e.target.value = ""; }}
        />
      </div>

      {/* Resumen */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Resumen corto
          <span className="text-gray-400 font-normal ml-2">Sale en el listado del blog (1-2 frases)</span>
        </label>
        <textarea
          value={currentExcerpt}
          onChange={(e) => handleExcerptChange(e.target.value)}
          rows={2}
          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          placeholder="Una frase que invite a leer el artículo completo…"
        />
      </div>

      {/* Editor cuerpo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Contenido
        </label>
        <RichTextEditor
          key={lang}
          value={currentBody}
          onChange={handleBodyChange}
          placeholder={
            lang === "es"
              ? "Empieza a escribir tu artículo aquí…"
              : lang === "ca"
              ? "Comença a escriure el teu article aquí…"
              : "Start writing your article here…"
          }
        />
      </div>

      {/* SEO avanzado */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <button
          type="button"
          onClick={() => setShowSeo(!showSeo)}
          className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            SEO avanzado (opcional)
          </span>
          <svg className={`w-4 h-4 text-gray-400 transition ${showSeo ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showSeo && (
          <div className="border-t border-gray-200 p-5 space-y-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              Si dejas estos campos vacíos, se usa el título y resumen de arriba. Solo rellénalos si quieres que en Google aparezca un texto distinto.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Meta título ({langCode})
              </label>
              <input
                type="text"
                value={currentMetaTitle}
                onChange={(e) => handleMetaTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="50-60 caracteres recomendado"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Meta descripción ({langCode})
              </label>
              <textarea
                value={currentMetaDescription}
                onChange={(e) => handleMetaDescriptionChange(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="150-160 caracteres recomendado"
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
      )}

      {/* Botones de acción */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => router.push("/admin/blog")}
          className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
        >
          Cancelar
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => submit("draft")}
            disabled={saving || uploading}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-60 transition"
          >
            Guardar borrador
          </button>
          <button
            type="button"
            onClick={() => submit("published")}
            disabled={saving || uploading}
            className="px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60 transition"
          >
            {saving ? "Publicando…" : status === "published" ? "Actualizar publicado" : "Publicar"}
          </button>
        </div>
      </div>
    </form>
  );
}
