"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/categories";

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CategoriesManager({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [newNameEs, setNewNameEs] = useState("");
  const [newNameCa, setNewNameCa] = useState("");
  const [newNameEn, setNewNameEn] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newNameEs.trim()) return;
    setError("");
    setAdding(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slugify(newNameEs),
          nameEs: newNameEs,
          nameCa: newNameCa || newNameEs,
          nameEn: newNameEn || newNameEs,
        }),
      });
      if (res.ok) {
        const cat = await res.json();
        setCategories([...categories, cat]);
        setNewNameEs("");
        setNewNameCa("");
        setNewNameEn("");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Error al crear");
      }
    } finally {
      setAdding(false);
    }
  }

  async function handleEdit(slug: string, nameEs: string, nameCa: string, nameEn: string) {
    const editedEs = prompt("Nombre en español:", nameEs);
    if (!editedEs?.trim()) return;
    const editedCa = prompt("Nom en català:", nameCa) ?? editedEs;
    const editedEn = prompt("Name (English):", nameEn) ?? editedEs;

    const res = await fetch(`/api/admin/categories/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameEs: editedEs, nameCa: editedCa, nameEn: editedEn }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCategories(categories.map((c) => c.slug === slug ? updated : c));
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Error al editar");
    }
  }

  async function handleDelete(slug: string, name: string) {
    if (!confirm(`¿Eliminar la categoría "${name}"?`)) return;
    const res = await fetch(`/api/admin/categories/${slug}`, { method: "DELETE" });
    if (res.ok) {
      setCategories(categories.filter((c) => c.slug !== slug));
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Error al eliminar");
    }
  }

  return (
    <div className="space-y-6">
      {/* Form alta rápida */}
      <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Nueva categoría</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            value={newNameEs}
            onChange={(e) => setNewNameEs(e.target.value)}
            aria-label="Nombre en español"
            placeholder="Nombre en español"
            required
            className="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <input
            type="text"
            value={newNameCa}
            onChange={(e) => setNewNameCa(e.target.value)}
            aria-label="Nom en català"
            placeholder="Nom en català (opcional)"
            className="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <input
            type="text"
            value={newNameEn}
            onChange={(e) => setNewNameEn(e.target.value)}
            aria-label="Name in English"
            placeholder="Name in English (optional)"
            className="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={adding || !newNameEs.trim()}
            className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60 transition"
          >
            {adding ? "Creando…" : "Crear"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {newNameEs && (
          <p className="mt-2 text-xs text-gray-500">URL: <span className="font-mono">/blog?cat={slugify(newNameEs)}</span></p>
        )}
      </form>

      {/* Lista */}
      {categories.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-base font-medium">Aún no hay categorías</p>
          <p className="text-sm mt-1">Crea la primera con el formulario de arriba</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {categories.map((cat) => (
            <div key={cat.slug} className="flex items-center gap-4 px-5 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{cat.nameEs}</p>
                <p className="text-xs text-gray-500 truncate">
                  <span className="text-gray-400">CA:</span> {cat.nameCa} · <span className="text-gray-400">EN:</span> {cat.nameEn || cat.nameEs} · <span className="font-mono">{cat.slug}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleEdit(cat.slug, cat.nameEs, cat.nameCa, cat.nameEn ?? "")}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(cat.slug, cat.nameEs)}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
