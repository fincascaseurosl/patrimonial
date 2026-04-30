"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteButton({ slug, name }: { slug: string; name: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`¿Eliminar el proyecto "${name}"? Esta acción no se puede deshacer.`)) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/projects/${slug}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition"
    >
      {loading ? "…" : "Eliminar"}
    </button>
  );
}
