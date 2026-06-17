"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { QueueItem, QueueStatus } from "@/lib/blog/queue";

const STATUS_BADGE: Record<QueueStatus, { label: string; cls: string }> = {
  pending: { label: "Pendiente", cls: "bg-gray-200 text-gray-700" },
  rewriting: { label: "Reescribiendo…", cls: "bg-amber-100 text-amber-800" },
  ready: { label: "Listo para revisar", cls: "bg-blue-100 text-blue-800" },
  failed: { label: "Fallo IA", cls: "bg-red-100 text-red-700" },
  approved: { label: "Publicado", cls: "bg-green-100 text-green-800" },
};

const FILTERS: { value: QueueStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendientes" },
  { value: "ready", label: "Listos para revisar" },
  { value: "failed", label: "Fallos" },
  { value: "approved", label: "Publicados" },
];

function relativeDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function QueueManager({ initial }: { initial: QueueItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<QueueStatus | "all">("all");
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);

  async function refreshOne(id: string) {
    const res = await fetch(`/api/admin/blog-queue/${id}`);
    if (res.ok) {
      const fresh = await res.json();
      setItems((prev) => prev.map((i) => (i.id === id ? fresh : i)));
    }
  }

  async function handleRewrite(id: string) {
    setBusy(id);
    // Marca optimistamente
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "rewriting", errorMessage: null } : i)),
    );
    try {
      const res = await fetch(`/api/admin/blog-queue/${id}/rewrite`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(`Error de Claude: ${data.error ?? "desconocido"}`);
      }
      await refreshOne(id);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function handleApprove(id: string, publish: boolean) {
    if (!confirm(publish ? "¿Publicar este post inmediatamente?" : "¿Crear borrador desde este artículo?")) {
      return;
    }
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/blog-queue/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(`Error al aprobar: ${data.error ?? "desconocido"}`);
      } else {
        await refreshOne(id);
        router.refresh();
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`¿Descartar "${title.slice(0, 50)}…" de la cola?`)) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/blog-queue/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        router.refresh();
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const count =
            f.value === "all" ? items.length : items.filter((i) => i.status === f.value).length;
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition flex items-center gap-2 ${
                active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f.label}
              <span className={`text-[10px] ${active ? "text-white/70" : "text-gray-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">
            {items.length === 0
              ? "La cola está vacía"
              : `Sin items en "${FILTERS.find((f) => f.value === filter)?.label}"`}
          </p>
          {items.length === 0 && (
            <p className="text-sm mt-1">
              Ve a{" "}
              <Link className="underline" href="/admin/blog/sources">
                Fuentes RSS
              </Link>{" "}
              y haz "Ingerir todas ahora" para empezar.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const badge = STATUS_BADGE[item.status];
            const isBusy = busy === item.id;
            return (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {item.sourceImage && (
                      <img src={item.sourceImage} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-xs text-gray-500">{item.sourceName}</span>
                      <span className="text-xs text-gray-400">
                        · {relativeDate(item.sourcePublishedAt || item.ingestedAt)}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 truncate">
                      {item.aiTitleEs || item.sourceTitle}
                    </p>
                    {item.aiTitleEs && item.aiTitleEs !== item.sourceTitle && (
                      <p className="text-xs text-gray-400 truncate">
                        Original: {item.sourceTitle}
                      </p>
                    )}
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-500 hover:text-gray-900 underline mt-1 inline-block"
                    >
                      Ver fuente original ↗
                    </a>
                    {item.errorMessage && (
                      <p className="text-xs text-red-600 mt-1 break-words">
                        ⚠ {item.errorMessage}
                      </p>
                    )}
                    {item.status === "approved" && item.blogPostSlug && (
                      <p className="text-xs text-green-700 mt-1">
                        ✓ Publicado como{" "}
                        <Link
                          className="underline"
                          href={`/admin/blog/${item.blogPostSlug}/edit`}
                        >
                          {item.blogPostSlug}
                        </Link>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 flex-wrap pl-[6.5rem]">
                  {(item.status === "pending" || item.status === "failed") && (
                    <button
                      onClick={() => handleRewrite(item.id)}
                      disabled={isBusy}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                    >
                      {isBusy ? "Reescribiendo…" : "Reescribir con Claude"}
                    </button>
                  )}
                  {item.status === "ready" && (
                    <>
                      <Link
                        href={`/admin/blog/queue/${item.id}`}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                      >
                        Revisar y editar
                      </Link>
                      <button
                        onClick={() => handleApprove(item.id, false)}
                        disabled={isBusy}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition"
                      >
                        Aprobar como borrador
                      </button>
                      <button
                        onClick={() => handleApprove(item.id, true)}
                        disabled={isBusy}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                      >
                        Publicar ahora
                      </button>
                      <button
                        onClick={() => handleRewrite(item.id)}
                        disabled={isBusy}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition"
                      >
                        Regenerar
                      </button>
                    </>
                  )}
                  {item.status !== "approved" && (
                    <button
                      onClick={() => handleDelete(item.id, item.sourceTitle)}
                      disabled={isBusy}
                      className="ml-auto px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition"
                    >
                      Descartar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
