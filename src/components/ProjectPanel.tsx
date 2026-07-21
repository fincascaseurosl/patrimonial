"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Project } from "@/lib/projects";
import { getProjectName, getProjectDescription } from "@/lib/project-helpers";
import { locationFor, formatMonths } from "@/lib/project-location";

export type ProjectPanelStrings = {
  fichaBarrio: string;
  fichaAno: string;
  fichaCategoria: string;
  fichaSuperficie: string;
  fichaDuracion: string;
  fichaDireccion: string;
  abrirFicha: string;
  cerrarPanel: string;
  imagenNoDisponible: string;
};

type Props = {
  project: Project | null;
  open: boolean;
  locale: string;
  categoryLabels: Record<string, string>;
  strings: ProjectPanelStrings;
  onClose: () => void;
};

/**
 * Ficha lateral deslizante de un proyecto. Se usa tanto en el mapa del
 * portfolio como en la galería de "Construye tu casa": mismo componente, mismo
 * comportamiento al hacer clic. Se mantiene el último proyecto renderizado
 * mientras el panel se cierra para que la animación de salida muestre contenido
 * en lugar de un panel en blanco. Funciona aunque el proyecto no tenga
 * ubicación en el mapa (los campos de ubicación se omiten si faltan).
 */
export function ProjectPanel({
  project,
  open,
  locale,
  categoryLabels,
  strings,
  onClose,
}: Props) {
  // Conserva el último proyecto mostrado para que la animación de cierre no
  // muestre un panel en blanco. Patrón de React de "ajustar estado durante el
  // render": cuando llega un proyecto nuevo se guarda; cuando `project` pasa a
  // null (cierre) se mantiene el anterior visible mientras el panel se desliza.
  const [shown, setShown] = useState<Project | null>(project);
  if (project && project !== shown) setShown(project);

  // ESC para cerrar + bloqueo de scroll del body mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // Seguridad: restaura el overflow si el componente se desmonta con el panel
  // abierto (p. ej. navegación a otra página).
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const loc = shown ? locationFor(shown) : null;
  const eyebrow = shown
    ? [loc?.neighborhood, loc?.year].filter(Boolean).join(" · ") ||
      categoryLabels[shown.category] ||
      shown.category
    : "";

  return (
    <>
      {/* Fondo */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-[var(--ink)]/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
      />
      <aside
        className={`fixed top-0 right-0 z-50 h-screen w-full sm:w-[480px] md:w-[560px] bg-[var(--paper)] shadow-2xl overflow-y-auto transition-transform duration-500 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        {shown && (
          <div className="flex flex-col min-h-full">
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-[var(--line)]">
              <p className="text-[var(--brand-red)] text-[10px] font-semibold tracking-[0.32em] uppercase">
                {eyebrow}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="cursor-grow text-[var(--ink)] hover:text-[var(--brand-red)] transition-colors p-2 -m-2 flex items-center gap-2 text-[10px] font-semibold tracking-[0.28em] uppercase"
                aria-label={strings.cerrarPanel}
              >
                <span>{strings.cerrarPanel}</span>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {shown.images?.[0] && (
              <div className="relative aspect-[4/3] bg-[var(--bone-deep)] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shown.images[0]}
                  alt={getProjectName(shown, locale)}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector("[data-img-fallback]")) {
                      const fb = document.createElement("div");
                      fb.setAttribute("data-img-fallback", "");
                      fb.className =
                        "absolute inset-0 flex items-center justify-center text-[var(--mute)] text-[10px] font-semibold tracking-[0.32em] uppercase";
                      fb.textContent = strings.imagenNoDisponible;
                      parent.appendChild(fb);
                    }
                  }}
                />
              </div>
            )}

            <div className="p-6 md:p-10 flex-1">
              <h2 className="font-display text-[var(--ink)] text-3xl md:text-4xl font-bold tracking-[-0.025em] leading-[1.05] mb-8">
                {getProjectName(shown, locale)}
              </h2>

              <dl className="grid grid-cols-2 gap-y-6 gap-x-8 mb-10 pb-10 border-b border-[var(--line)]">
                <div>
                  <dt className="text-[var(--mute)] text-[10px] font-semibold tracking-[0.32em] uppercase mb-2">
                    {strings.fichaCategoria}
                  </dt>
                  <dd className="text-[var(--ink)] text-sm">
                    {categoryLabels[shown.category] ?? shown.category}
                  </dd>
                </div>
                {loc?.neighborhood && (
                  <div>
                    <dt className="text-[var(--mute)] text-[10px] font-semibold tracking-[0.32em] uppercase mb-2">
                      {strings.fichaBarrio}
                    </dt>
                    <dd className="text-[var(--ink)] text-sm">{loc.neighborhood}</dd>
                  </div>
                )}
                {loc?.address && (
                  <div>
                    <dt className="text-[var(--mute)] text-[10px] font-semibold tracking-[0.32em] uppercase mb-2">
                      {strings.fichaDireccion}
                    </dt>
                    <dd className="text-[var(--ink)] text-sm">{loc.address}</dd>
                  </div>
                )}
                {loc?.year && (
                  <div>
                    <dt className="text-[var(--mute)] text-[10px] font-semibold tracking-[0.32em] uppercase mb-2">
                      {strings.fichaAno}
                    </dt>
                    <dd className="text-[var(--ink)] text-sm tabular-nums">{loc.year}</dd>
                  </div>
                )}
                {loc?.area && (
                  <div>
                    <dt className="text-[var(--mute)] text-[10px] font-semibold tracking-[0.32em] uppercase mb-2">
                      {strings.fichaSuperficie}
                    </dt>
                    <dd className="text-[var(--ink)] text-sm tabular-nums">{loc.area}</dd>
                  </div>
                )}
                {loc?.durationMonths != null && (
                  <div>
                    <dt className="text-[var(--mute)] text-[10px] font-semibold tracking-[0.32em] uppercase mb-2">
                      {strings.fichaDuracion}
                    </dt>
                    <dd className="text-[var(--ink)] text-sm">{formatMonths(loc.durationMonths, locale)}</dd>
                  </div>
                )}
              </dl>

              {getProjectDescription(shown, locale) && (
                <p className="text-[var(--ink-soft)] text-base leading-relaxed mb-10">
                  {getProjectDescription(shown, locale)}
                </p>
              )}

              <Link
                href={{ pathname: "/portfolio/[slug]", params: { slug: shown.slug } }}
                onClick={() => {
                  document.body.style.overflow = "";
                  onClose();
                }}
                className="cursor-grow inline-flex items-center gap-3 text-[12px] font-semibold tracking-[0.18em] uppercase text-[var(--ink)] hover:text-[var(--brand-red)] transition-colors duration-300 group"
              >
                <span>{strings.abrirFicha}</span>
                <svg
                  className="w-4 h-4 -rotate-45 transition-transform duration-300 group-hover:rotate-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
