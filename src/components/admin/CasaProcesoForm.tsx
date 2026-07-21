"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Etiquetas de las fases (coinciden con casa.proceso en messages/es.json).
const FASE_LABELS = [
  "Auditoría del proyecto",
  "Anteproyecto y diseño",
  "Proyecto ejecutivo y licencias",
  "Cimentación y estructura",
  "Acabados y entrega",
];

type Props = {
  initialImages: string[];
  defaults: string[];
};

export function CasaProcesoForm({ initialImages, defaults }: Props) {
  const router = useRouter();
  // Un slot por fase; se rellena con la imagen guardada o la de reserva.
  const [images, setImages] = useState<string[]>(() =>
    FASE_LABELS.map((_, i) => initialImages[i] ?? defaults[i % defaults.length] ?? ""),
  );
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function uploadFor(idx: number, file: File) {
    setError("");
    setUploadingIdx(idx);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Error al subir la imagen");
        return;
      }
      const { url } = await res.json();
      setImages((prev) => prev.map((img, i) => (i === idx ? url : img)));
      setSaved(false);
    } finally {
      setUploadingIdx(null);
    }
  }

  function resetSlot(idx: number) {
    setImages((prev) =>
      prev.map((img, i) => (i === idx ? defaults[i % defaults.length] ?? "" : img)),
    );
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/casa-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ procesoImages: images }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Error al guardar");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FASE_LABELS.map((label, idx) => (
          <div
            key={idx}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            <div className="relative aspect-[4/5] bg-gray-100">
              {images[idx] ? (
                /* eslint-disable-next-line @next/next/no-img-element -- preview interno de admin */
                <img
                  src={images[idx]}
                  alt={label}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                  Sin imagen
                </div>
              )}
              <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[11px] font-bold text-white">
                Fase {String(idx + 1).padStart(2, "0")}
              </span>
              {uploadingIdx === idx && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-medium text-white">
                  Subiendo…
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="mb-2 truncate text-sm font-medium text-gray-800" title={label}>
                {label}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRefs.current[idx]?.click()}
                  disabled={uploadingIdx !== null}
                  className="flex-1 rounded-lg bg-[var(--brand-red)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--brand-red-deep)] disabled:opacity-50"
                >
                  Cambiar foto
                </button>
                <button
                  type="button"
                  onClick={() => resetSlot(idx)}
                  disabled={uploadingIdx !== null}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-200 disabled:opacity-50"
                  title="Restaurar la imagen por defecto"
                >
                  Restaurar
                </button>
              </div>
              <input
                ref={(el) => {
                  fileRefs.current[idx] = el;
                }}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadFor(idx, f);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploadingIdx !== null}
          className="rounded-lg bg-[var(--brand-red)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-red-deep)] disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        {saved && <span className="text-sm font-medium text-green-600">✓ Guardado</span>}
      </div>
    </div>
  );
}
