"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import type { Project } from "@/lib/projects";
import { getProjectName } from "@/lib/project-helpers";
import { projectLocations } from "@/lib/site-config";
import { locationFor, type MapLocation } from "@/lib/project-location";
import { ProjectPanel, type ProjectPanelStrings } from "@/components/ProjectPanel";
import { Counter } from "@/components/animations";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

type Strings = ProjectPanelStrings & {
  intro: string;
  mapaInstruccion: string;
  listadoEyebrow: string;
  listadoTitulo: string;
  statObras: string;
  statBarrios: string;
  statSuperficie: string;
  statAnos: string;
};

type CategoryLabels = Record<string, string>;

type Props = {
  projects: Project[];
  locale: string;
  strings: Strings;
  categoryLabels: CategoryLabels;
};

export function PortfolioMap({ projects, locale, strings, categoryLabels }: Props) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const closePanel = useCallback(() => setSelectedSlug(null), []);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);

  const stats = useMemo(() => {
    const locs = projects
      .map(locationFor)
      .filter((l): l is MapLocation => l !== null);
    const districts = new Set(
      locs.map((l) => l.neighborhood).filter((n): n is string => Boolean(n)),
    );
    const totalArea = locs.reduce((sum, l) => {
      if (!l.area) return sum;
      const n = Number(l.area.replace(/[^\d]/g, ""));
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
    const years = locs
      .map((l) => l.year)
      .filter((y): y is number => typeof y === "number");
    const yearsActive = years.length ? Math.max(...years) - Math.min(...years) + 1 : 0;
    return {
      total: projects.length,
      districts: districts.size,
      area: totalArea,
      years: yearsActive,
    };
  }, [projects]);

  const sortedByYear = useMemo(() => {
    return [...projects].sort(
      (a, b) => (locationFor(b)?.year ?? 0) - (locationFor(a)?.year ?? 0),
    );
  }, [projects]);

  const selectedProject = selectedSlug
    ? projects.find((p) => p.slug === selectedSlug) ?? null
    : null;

  // Init Leaflet map (client-only via dynamic import)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false,
      }).setView([41.405, 2.175], 13);

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      projects.forEach((p) => {
        const loc = locationFor(p);
        if (!loc) return;
        const name = getProjectName(p, locale);

        const icon = L.divIcon({
          className: "pp-marker",
          html: `<div class="pp-marker-pulse"></div><div class="pp-marker-dot"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const sub = [loc.neighborhood?.toUpperCase(), loc.year]
          .filter(Boolean)
          .join(" · ");
        const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(map);
        marker.bindTooltip(
          `<strong>${name}</strong>${sub ? `<span>${sub}</span>` : ""}`,
          {
            direction: "top",
            offset: [0, -10],
            className: "pp-tooltip",
          }
        );
        marker.on("click", () => setSelectedSlug(p.slug));
        markersRef.current.push(marker);
      });

      // Fit bounds to all markers with padding
      if (markersRef.current.length > 0) {
        const group = L.featureGroup(markersRef.current);
        map.fitBounds(group.getBounds().pad(0.5));
      }

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [projects, locale]);

  return (
    <>
      {/* Stats bar */}
      <section className="border-y border-[var(--line)] bg-[var(--bone)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--line)]">
            {[
              { v: stats.total, suf: "", label: strings.statObras },
              { v: stats.districts, suf: "", label: strings.statBarrios },
              { v: stats.area, suf: " m²", label: strings.statSuperficie },
              { v: stats.years, suf: "", label: strings.statAnos },
            ].map((s, i) => (
              <div key={i} className="px-6 md:px-8 py-10 first:pl-0 md:first:pl-0">
                <p className="font-display text-[var(--ink)] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-none tracking-[-0.03em] mb-3">
                  <Counter end={s.v} suffix={s.suf} duration={2.2} />
                </p>
                <p className="text-[var(--mute)] text-[10px] font-semibold tracking-[0.32em] uppercase">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map full-bleed with floating intro card */}
      <section className="relative bg-[var(--bone)]">
        <div
          ref={mapContainerRef}
          className="relative w-full h-[85vh] min-h-[560px]"
          style={{ zIndex: 0 }}
        />
        {/* Floating intro card (top-left) */}
        <div className="absolute top-6 left-6 md:top-10 md:left-10 z-10 max-w-sm bg-[var(--paper)] p-7 md:p-9 shadow-xl border border-[var(--line)]">
          <p className="text-[var(--ink-soft)] text-base md:text-lg leading-relaxed mb-7">
            {strings.intro}
          </p>
          <div className="flex items-center gap-3 text-[var(--mute)] text-[10px] font-semibold tracking-[0.32em] uppercase">
            <span className="w-8 h-[1px] bg-current" />
            <span>{strings.mapaInstruccion}</span>
          </div>
        </div>
      </section>

      {/* Listado */}
      <section className="bg-[var(--paper)] pt-24 md:pt-36 pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 md:mb-20 flex items-end justify-between gap-8">
            <div>
              <p className="text-[var(--brand-red)] text-[11px] font-semibold tracking-[0.32em] uppercase mb-4">
                {strings.listadoEyebrow}
              </p>
              <h2 className="font-display text-[var(--ink)] text-3xl md:text-4xl font-bold leading-[1.05] tracking-[-0.025em]">
                {strings.listadoTitulo}
              </h2>
            </div>
          </div>

          <ul className="border-t border-[var(--line)]">
            {sortedByYear.map((project, i) => {
              const loc = projectLocations[project.slug];
              const name = getProjectName(project, locale);
              const cat = categoryLabels[project.category] ?? project.category;
              return (
                <li key={project.slug} className="border-b border-[var(--line)] group">
                  <button
                    type="button"
                    onClick={() => setSelectedSlug(project.slug)}
                    className="w-full text-left py-8 md:py-10 grid grid-cols-12 gap-4 md:gap-8 items-center cursor-grow transition-colors duration-300 hover:bg-[var(--bone)]"
                  >
                    <span className="col-span-1 text-[var(--mute)] text-[11px] font-semibold tracking-[0.32em] tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="col-span-11 md:col-span-5">
                      <h3 className="font-display text-[var(--ink)] text-xl md:text-3xl font-bold tracking-[-0.025em] leading-tight group-hover:text-[var(--brand-red)] transition-colors duration-300">
                        {name}
                      </h3>
                    </div>
                    <div className="hidden md:block md:col-span-2 text-[var(--ink-soft)] text-sm">
                      {cat}
                    </div>
                    <div className="hidden md:block md:col-span-2 text-[var(--ink-soft)] text-sm">
                      {loc?.neighborhood ?? "—"}
                    </div>
                    <div className="hidden md:block md:col-span-1 text-[var(--ink-soft)] text-sm tabular-nums">
                      {loc?.year ?? ""}
                    </div>
                    <div className="col-span-12 md:col-span-1 flex justify-end">
                      <span className="w-10 h-10 rounded-full border border-[var(--ink)]/20 flex items-center justify-center transition-all duration-300 group-hover:border-[var(--brand-red)] group-hover:bg-[var(--brand-red)]">
                        <svg
                          className="w-3.5 h-3.5 text-[var(--ink)] -rotate-45 group-hover:text-white transition-colors duration-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Ficha lateral — mismo componente que la galería de "Construye tu casa" */}
      <ProjectPanel
        project={selectedProject}
        open={!!selectedSlug}
        locale={locale}
        categoryLabels={categoryLabels}
        strings={strings}
        onClose={closePanel}
      />
    </>
  );
}
