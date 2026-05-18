"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ContactRequest, RequestStatus } from "@/lib/requests";
import { getServicioLabel } from "@/lib/site-config";

const STATUS_LABELS: Record<RequestStatus, string> = {
  new: "Nueva",
  read: "Leída",
  replied: "Respondida",
  archived: "Archivada",
};

const STATUS_COLOR: Record<RequestStatus, string> = {
  new: "bg-red-100 text-red-700",
  read: "bg-blue-100 text-blue-700",
  replied: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-600",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RequestDetail({ initial }: { initial: ContactRequest }) {
  const router = useRouter();
  const [req, setReq] = useState(initial);
  const [notes, setNotes] = useState(initial.internalNotes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  // Marcar como leída automáticamente al abrir si era "new"
  useEffect(() => {
    if (req.status === "new") {
      updateStatus("read", { silent: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateStatus(status: RequestStatus, opts?: { silent?: boolean }) {
    const res = await fetch(`/api/admin/requests/${req.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setReq(updated);
      if (!opts?.silent) router.refresh();
    }
  }

  async function saveNotes() {
    setSavingNotes(true);
    setNotesSaved(false);
    const res = await fetch(`/api/admin/requests/${req.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ internalNotes: notes }),
    });
    if (res.ok) {
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    }
    setSavingNotes(false);
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar la solicitud de ${req.nombre}? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/admin/requests/${req.id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/requests");
  }

  const replySubject = encodeURIComponent(`Re: tu solicitud en obraspatrimonial.es`);
  const replyBody = encodeURIComponent(
    `Hola ${req.nombre},\n\nGracias por contactar con Patrimonial Obras Barcelona.\n\n\n---\nTu mensaje original:\n${req.mensaje}\n`,
  );
  const replyMailto = `mailto:${req.email}?subject=${replySubject}&body=${replyBody}`;

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-2 ${STATUS_COLOR[req.status]}`}>
              {STATUS_LABELS[req.status]}
            </span>
            <h1 className="text-2xl font-bold text-gray-900">{req.nombre}</h1>
            <p className="text-xs text-gray-500 mt-1 capitalize">{formatDate(req.receivedAt)}</p>
          </div>
        </div>

        {/* Datos de contacto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <a
            href={`mailto:${req.email}`}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition group"
          >
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-base group-hover:bg-white">✉️</div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Email</p>
              <p className="text-sm text-gray-900 font-medium truncate">{req.email}</p>
            </div>
          </a>
          {req.telefono && (
            <a
              href={`tel:${req.telefono.replace(/\s/g, "")}`}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition group"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-base group-hover:bg-white">📞</div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Teléfono</p>
                <p className="text-sm text-gray-900 font-medium truncate">{req.telefono}</p>
              </div>
            </a>
          )}
        </div>

        {/* Servicio solicitado */}
        {req.servicio && (
          <div className="mb-5">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">Servicio solicitado</p>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span className="text-sm font-semibold text-red-900">{getServicioLabel(req.servicio)}</span>
            </div>
          </div>
        )}

        {/* Mensaje */}
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">Mensaje</p>
          <div className="bg-gray-50 rounded-lg p-4 text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
            {req.mensaje}
          </div>
        </div>

        {req.sourcePath && (
          <p className="text-xs text-gray-400 mt-4">
            Enviado desde: <span className="font-mono">{req.sourcePath}</span>
          </p>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-3">Acciones</p>
        <div className="flex flex-wrap gap-2">
          <a
            href={replyMailto}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
          >
            ✉️ Responder por email
          </a>
          {req.telefono && (
            <a
              href={`tel:${req.telefono.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              📞 Llamar
            </a>
          )}
          {req.status !== "replied" && (
            <button
              onClick={() => updateStatus("replied")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              ✓ Marcar como respondida
            </button>
          )}
          {req.status !== "archived" ? (
            <button
              onClick={() => updateStatus("archived")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              🗂 Archivar
            </button>
          ) : (
            <button
              onClick={() => updateStatus("read")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              ↩ Desarchivar
            </button>
          )}
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition ml-auto"
          >
            🗑 Eliminar
          </button>
        </div>
      </div>

      {/* Notas internas */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
            Notas internas
            <span className="ml-2 text-gray-400 normal-case font-normal">Solo visibles para vosotros</span>
          </p>
          {notesSaved && (
            <span className="text-xs text-green-600 font-medium">✓ Guardado</span>
          )}
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Ej: Llamé el lunes, dejé mensaje. Volver a llamar el miércoles."
          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
        />
        <button
          onClick={saveNotes}
          disabled={savingNotes || notes === (req.internalNotes ?? "")}
          className="mt-3 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {savingNotes ? "Guardando…" : "Guardar notas"}
        </button>
      </div>
    </div>
  );
}
