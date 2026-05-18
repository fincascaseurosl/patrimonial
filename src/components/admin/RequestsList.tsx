"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { ContactRequest, RequestStatus } from "@/lib/requests";
import { getServicioLabel } from "@/lib/site-config";

const STATUS_LABELS: Record<RequestStatus, string> = {
  new: "Nuevas",
  read: "Leídas",
  replied: "Respondidas",
  archived: "Archivadas",
};

const STATUS_BADGE: Record<RequestStatus, string> = {
  new: "bg-red-100 text-red-700",
  read: "bg-blue-100 text-blue-700",
  replied: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-600",
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;
  return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

export function RequestsList({ initial }: { initial: ContactRequest[] }) {
  const [filter, setFilter] = useState<RequestStatus | "all">("all");

  const counts = useMemo(() => {
    return {
      all: initial.length,
      new: initial.filter((r) => r.status === "new").length,
      read: initial.filter((r) => r.status === "read").length,
      replied: initial.filter((r) => r.status === "replied").length,
      archived: initial.filter((r) => r.status === "archived").length,
    };
  }, [initial]);

  const filtered = filter === "all" ? initial : initial.filter((r) => r.status === filter);
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
  );

  return (
    <>
      {/* Filtros */}
      <div className="flex gap-1 mb-6 overflow-x-auto bg-white border border-gray-200 rounded-lg p-1 w-fit">
        <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>
          Todas <span className="text-xs opacity-60">{counts.all}</span>
        </FilterBtn>
        {(Object.keys(STATUS_LABELS) as RequestStatus[]).map((s) => (
          <FilterBtn key={s} active={filter === s} onClick={() => setFilter(s)}>
            {STATUS_LABELS[s]} <span className="text-xs opacity-60">{counts[s]}</span>
          </FilterBtn>
        ))}
      </div>

      {/* Lista */}
      {sorted.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-gray-200">
          <p className="text-base font-medium">
            {initial.length === 0
              ? "Aún no hay solicitudes"
              : `No hay solicitudes ${STATUS_LABELS[filter as RequestStatus]?.toLowerCase() ?? ""}`}
          </p>
          <p className="text-sm mt-1">
            {initial.length === 0 && "Las solicitudes del formulario web aparecerán aquí"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((req) => (
            <Link
              key={req.id}
              href={`/admin/requests/${req.id}`}
              className={`block bg-white rounded-xl border p-4 hover:shadow-md transition ${
                req.status === "new" ? "border-red-200" : "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${STATUS_BADGE[req.status]}`}>
                      {STATUS_LABELS[req.status].slice(0, -1) /* Singular */}
                    </span>
                    {req.servicio && (
                      <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {getServicioLabel(req.servicio)}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{relativeTime(req.receivedAt)}</span>
                  </div>
                  <p className="font-semibold text-gray-900 truncate">{req.nombre}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 flex-wrap">
                    <span>{req.email}</span>
                    {req.telefono && <span>· {req.telefono}</span>}
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{req.mensaje}</p>
                </div>
                <svg className="w-4 h-4 text-gray-300 shrink-0 mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

function FilterBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
        active ? "bg-red-600 text-white" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}
