"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BlogSource } from "@/lib/blog/sources";

type IngestSummary = {
  sourceId: string;
  sourceName: string;
  totalInFeed: number;
  inserted: number;
  duplicated: number;
  error?: string;
};

export function SourcesManager({ initial }: { initial: BlogSource[] }) {
  const router = useRouter();
  const [sources, setSources] = useState(initial);
  const [name, setName] = useState("");
  const [feedUrl, setFeedUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [ingesting, setIngesting] = useState<string | "all" | null>(null);
  const [lastResult, setLastResult] = useState<IngestSummary[] | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAdding(true);
    try {
      const res = await fetch("/api/admin/blog-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, feedUrl, isActive: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Error al crear");
        return;
      }
      const created = await res.json();
      setSources([...sources, created]);
      setName("");
      setFeedUrl("");
      router.refresh();
    } finally {
      setAdding(false);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    const res = await fetch(`/api/admin/blog-sources/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSources(sources.map((s) => (s.id === id ? updated : s)));
    }
  }

  async function handleDelete(id: string, sourceName: string) {
    if (!confirm(`¿Eliminar la fuente "${sourceName}"? Los items ya ingeridos no se borran.`)) return;
    const res = await fetch(`/api/admin/blog-sources/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSources(sources.filter((s) => s.id !== id));
    } else {
      alert("Error al eliminar");
    }
  }

  async function handleIngest(sourceId: string | null) {
    setIngesting(sourceId ?? "all");
    setLastResult(null);
    try {
      const res = await fetch("/api/admin/blog-queue/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sourceId ? { sourceId } : {}),
      });
      if (res.ok) {
        const data = await res.json();
        setLastResult(data.perSource ?? []);
        // Recarga la página para actualizar lastFetchedAt/totalImported
        router.refresh();
        // Refresca la lista local: vuelve a pedirlas
        const sourcesRes = await fetch("/api/admin/blog-sources");
        if (sourcesRes.ok) setSources(await sourcesRes.json());
      } else {
        const data = await res.json();
        alert(data.error ?? "Error al ingerir");
      }
    } finally {
      setIngesting(null);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Nueva fuente</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Nombre de la fuente"
            placeholder="Nombre (ej. Idealista News)"
            required
            className="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <input
            type="url"
            value={feedUrl}
            onChange={(e) => setFeedUrl(e.target.value)}
            aria-label="URL del feed RSS"
            placeholder="https://...feed.xml"
            required
            className="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={adding}
            className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60 transition"
          >
            {adding ? "Creando…" : "Añadir fuente"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </form>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {sources.length} fuente{sources.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => handleIngest(null)}
          disabled={ingesting !== null || sources.filter((s) => s.isActive).length === 0}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 disabled:opacity-50 transition"
        >
          {ingesting === "all" ? "Ingiriendo…" : "Ingerir todas ahora"}
        </button>
      </div>

      {lastResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <p className="font-semibold text-blue-900 mb-2">Resultado ingestión:</p>
          <ul className="space-y-1 text-blue-800">
            {lastResult.map((s) => (
              <li key={s.sourceId}>
                <strong>{s.sourceName}</strong>:{" "}
                {s.error ? (
                  <span className="text-red-700">error — {s.error}</span>
                ) : (
                  <span>
                    {s.inserted} nuevos, {s.duplicated} duplicados, {s.totalInFeed} en el feed
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {sources.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-base font-medium">Aún no hay fuentes RSS</p>
          <p className="text-sm mt-1">Añade la primera con el formulario de arriba</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {sources.map((s) => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900 truncate">{s.name}</p>
                  {s.isActive ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-800 px-2 py-0.5 rounded">Activa</span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Pausada</span>
                  )}
                </div>
                <a
                  href={s.feedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 truncate block hover:text-gray-900"
                >
                  {s.feedUrl}
                </a>
                <p className="text-xs text-gray-400 mt-1">
                  {s.totalImported} importados ·{" "}
                  {s.lastFetchedAt ? (
                    `última: ${new Date(s.lastFetchedAt).toLocaleString("es-ES")}`
                  ) : (
                    "nunca ejecutada"
                  )}
                  {s.lastError && (
                    <span className="text-red-600 ml-2">· error: {s.lastError}</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleIngest(s.id)}
                  disabled={ingesting !== null}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition"
                >
                  {ingesting === s.id ? "Ingiriendo…" : "Ingerir ahora"}
                </button>
                <button
                  onClick={() => toggleActive(s.id, !s.isActive)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  {s.isActive ? "Pausar" : "Activar"}
                </button>
                <button
                  onClick={() => handleDelete(s.id, s.name)}
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
