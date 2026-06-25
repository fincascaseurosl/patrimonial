"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { serviceSlugs } from "@/lib/site-config";
import type { Project } from "@/lib/projects";
import { LocationPicker } from "./LocationPicker";

type Props = {
  initial?: Partial<Project>;
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

export function ProjectForm({ initial, mode }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [nameEs, setNameEs] = useState(initial?.nameEs ?? "");
  const [nameCa, setNameCa] = useState(initial?.nameCa ?? "");
  const [nameEn, setNameEn] = useState(initial?.nameEn ?? "");
  const [category, setCategory] = useState<string>(initial?.category ?? serviceSlugs[0]);
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [descriptionEs, setDescriptionEs] = useState(initial?.descriptionEs ?? "");
  const [descriptionCa, setDescriptionCa] = useState(initial?.descriptionCa ?? "");
  const [descriptionEn, setDescriptionEn] = useState(initial?.descriptionEn ?? "");
  const [featured, setFeatured] = useState<boolean>(initial?.featured ?? false);
  const [address, setAddress] = useState(initial?.address ?? "");
  const [neighborhood, setNeighborhood] = useState(initial?.neighborhood ?? "");
  const [lat, setLat] = useState<number | null>(initial?.lat ?? null);
  const [lng, setLng] = useState<number | null>(initial?.lng ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleNameEsChange(val: string) {
    setNameEs(val);
    if (mode === "new") setSlug(slugify(val));
  }

  async function uploadFiles(files: FileList) {
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      if (res.ok) {
        const { url } = await res.json();
        urls.push(url);
      }
    }
    setImages((prev) => [...prev, ...urls]);
    setUploading(false);
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function moveImage(from: number, to: number) {
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (images.length === 0) { setError("Añade al menos una imagen"); return; }
    setError("");
    setSaving(true);

    const payload = {
      slug,
      nameEs,
      nameCa,
      nameEn,
      category,
      images,
      descriptionEs,
      descriptionCa,
      descriptionEn,
      featured,
      address,
      neighborhood,
      lat,
      lng,
    };
    const url = mode === "new" ? "/api/admin/projects" : `/api/admin/projects/${initial?.slug}`;
    const method = mode === "new" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        router.push("/admin/projects");
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Nombres */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900">Información básica</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre (Español) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nameEs}
              onChange={(e) => handleNameEsChange(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Reforma piso en Barcelona"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom (Català) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nameCa}
              onChange={(e) => setNameCa(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Reforma pis a Barcelona"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Name (English)
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Apartment renovation in Barcelona"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug (URL)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              disabled={mode === "edit"}
              pattern="[a-z0-9-]+"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 font-mono"
              placeholder="reforma-piso-barcelona"
            />
            <p className="text-xs text-gray-400 mt-1">Solo letras minúsculas, números y guiones</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
            >
              {serviceSlugs.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3 pt-1">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 accent-[var(--brand-red)]"
          />
          <span className="text-sm font-medium text-gray-700">
            Destacar en «Trabajos recientes» (portada)
          </span>
        </label>
      </section>

      {/* Descripciones */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900">Descripción <span className="text-gray-400 font-normal text-sm">(opcional)</span></h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción (Español)</label>
            <textarea
              value={descriptionEs}
              onChange={(e) => setDescriptionEs(e.target.value)}
              rows={4}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              placeholder="Reforma completa de un piso de 90m²…"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripció (Català)</label>
            <textarea
              value={descriptionCa}
              onChange={(e) => setDescriptionCa(e.target.value)}
              rows={4}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              placeholder="Reforma completa d'un pis de 90m²…"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (English)</label>
            <textarea
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              rows={4}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              placeholder="Full renovation of a 90 m² apartment…"
            />
          </div>
        </div>
      </section>

      {/* Ubicación en el mapa */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900">
            Ubicación en el mapa{" "}
            <span className="text-gray-400 font-normal text-sm">(opcional)</span>
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Escribe la dirección y pulsa «Localizar»; ajusta el pin si hace falta.
            Si la colocas, el proyecto aparecerá en el mapa del portfolio.
          </p>
        </div>
        <LocationPicker
          address={address}
          lat={lat}
          lng={lng}
          onAddressChange={setAddress}
          onCoords={({ lat: la, lng: ln, neighborhood: nb }) => {
            setLat(la);
            setLng(ln);
            if (nb !== undefined) setNeighborhood(nb);
          }}
        />
      </section>

      {/* Imágenes */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">
          Imágenes <span className="text-red-500">*</span>
          <span className="text-gray-400 font-normal text-sm ml-2">La primera imagen es la portada</span>
        </h2>

        {/* Upload zone */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl py-8 flex flex-col items-center gap-2 text-gray-500 hover:border-red-400 hover:text-red-500 transition disabled:opacity-50"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <span className="text-sm font-medium">{uploading ? "Subiendo…" : "Haz clic para subir imágenes"}</span>
          <span className="text-xs text-gray-400">JPG, PNG, WebP · Máx. 10 MB por imagen</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />

        {/* Preview grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((url, idx) => (
              <div key={url} className="relative group aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                <img src={url} alt="" className="w-full h-full object-cover" />
                {idx === 0 && (
                  <span className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Portada
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(idx, idx - 1)}
                      className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 text-xs font-bold"
                      title="Mover izquierda"
                    >←</button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 text-xs font-bold"
                    title="Eliminar"
                  >✕</button>
                  {idx < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(idx, idx + 1)}
                      className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 text-xs font-bold"
                      title="Mover derecha"
                    >→</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => router.push("/admin/projects")}
          className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving || uploading}
          className="px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60 transition"
        >
          {saving ? "Guardando…" : mode === "new" ? "Crear proyecto" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
