"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Link } from "@/i18n/navigation";
import type { Project } from "@/lib/projects";
import { projectLocations } from "@/lib/site-config";
import { Counter } from "@/components/animations";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

type Strings = {
  intro: string;
  mapaInstruccion: string;
  listadoEyebrow: string;
  listadoTitulo: string;
  statObras: string;
  statBarrios: string;
  statSuperficie: string;
  statAnos: string;
  fichaBarrio: string;
  fichaAno: string;
  fichaCategoria: string;
  fichaSuperficie: string;
  fichaDuracion: string;
  fichaDireccion: string;
  abrirFicha: string;
  cerrarPanel: string;
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
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);

  const stats = useMemo(() => {
    const located = projects.filter((p) => projectLocations[p.slug]);
    const districts = new Set(located.map((p) => projectLocations[p.slug].neighborhood));
    const totalArea = located.reduce((sum, p) => {
      const a = projectLocations[p.slug].area;
      if (!a) return sum;
      const n = Number(a.replace(/[^\d]/g, ""));
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
    const years = located.map((p) => projectLocations[p.slug].year).filter(Boolean);
    const yearsActive = years.length ? Math.max(...years) - Math.min(...years) + 1 : 0;
    return {
      total: projects.length,
      districts: districts.size,
      area: totalArea,
      years: yearsActive,
    };
  }, [projects]);

  const sortedByYear = useMemo(() => {
    return [...projects].sort((a, b) => {
      const ya = projectLocations[a.slug]?.year ?? 0;
      const yb = projectLocations[b.slug]?.year ?? 0;
      return yb - ya;
    });
  }, [projects]);

  const selectedProject = selectedSlug ? projects.find((p) => p.slug === selectedSlug) ?? null : null;
  const selectedLocation = selectedSlug ? projectLocations[selectedSlug] : null;

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
        const loc = projectLocations[p.slug];
        if (!loc) return;
        const name = locale === "ca" ? p.nameCa : p.nameEs;

        const icon = L.divIcon({
          className: "pp-marker",
          html: `<div class="pp-marker-pulse"></div><div class="pp-marker-dot"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(map);
        marker.bindTooltip(
          `<strong>${name}</strong><span>${loc.neighborhood.toUpperCase()} · ${loc.year}</span>`,
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

  // Side panel slide animation
  useGSAP(() => {
    if (!panelRef.current || !backdropRef.current) return;

    if (selectedProject) {
      gsap.set(backdropRef.current, { display: "block" });
      gsap.to(backdropRef.current, { opacity: 1, duration: 0.4, ease: "power2.out" });
      gsap.fromTo(
        panelRef.current,
        { xPercent: 100 },
        { xPercent: 0, duration: 0.65, ease: "power3.out" }
      );
    } else {
      gsap.to(panelRef.current, {
        xPercent: 100,
        duration: 0.45,
        ease: "power3.in",
      });
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
          if (backdropRef.current) gsap.set(backdropRef.current, { display: "none" });
        },
      });
    }
  }, { dependencies: [selectedSlug] });

  // ESC to close + body scroll lock
  useEffect(() => {
    if (!selectedSlug) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedSlug(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selectedSlug]);

  // Safety: ensure body overflow is reset if the component unmounts mid-navigation
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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
              const name = locale === "ca" ? project.nameCa : project.nameEs;
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

      {/* Side panel + backdrop */}
      <div
        ref={backdropRef}
        onClick={() => setSelectedSlug(null)}
        className="fixed inset-0 z-40 bg-[var(--ink)]/60 backdrop-blur-sm"
        style={{ opacity: 0, display: "none" }}
        aria-hidden={!selectedSlug}
      />
      <aside
        ref={panelRef}
        className="fixed top-0 right-0 z-50 h-screen w-full sm:w-[480px] md:w-[560px] bg-[var(--paper)] shadow-2xl overflow-y-auto"
        style={{ transform: "translateX(100%)" }}
        aria-hidden={!selectedSlug}
      >
        {selectedProject && selectedLocation && (
          <div className="flex flex-col min-h-full">
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-[var(--line)]">
              <p className="text-[var(--brand-red)] text-[10px] font-semibold tracking-[0.32em] uppercase">
                {selectedLocation.neighborhood} · {selectedLocation.year}
              </p>
              <button
                type="button"
                onClick={() => setSelectedSlug(null)}
                className="cursor-grow text-[var(--ink)] hover:text-[var(--brand-red)] transition-colors p-2 -m-2 flex items-center gap-2 text-[10px] font-semibold tracking-[0.28em] uppercase"
                aria-label={strings.cerrarPanel}
              >
                <span>{strings.cerrarPanel}</span>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {selectedProject.images?.[0] && (
              <div className="relative aspect-[4/3] bg-[var(--ink)] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedProject.images[0]}
                  alt={locale === "ca" ? selectedProject.nameCa : selectedProject.nameEs}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6 md:p-10 flex-1">
              <h2 className="font-display text-[var(--ink)] text-3xl md:text-4xl font-bold tracking-[-0.025em] leading-[1.05] mb-8">
                {locale === "ca" ? selectedProject.nameCa : selectedProject.nameEs}
              </h2>

              <dl className="grid grid-cols-2 gap-y-6 gap-x-8 mb-10 pb-10 border-b border-[var(--line)]">
                <div>
                  <dt className="text-[var(--mute)] text-[10px] font-semibold tracking-[0.32em] uppercase mb-2">
                    {strings.fichaCategoria}
                  </dt>
                  <dd className="text-[var(--ink)] text-sm">
                    {categoryLabels[selectedProject.category] ?? selectedProject.category}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--mute)] text-[10px] font-semibold tracking-[0.32em] uppercase mb-2">
                    {strings.fichaBarrio}
                  </dt>
                  <dd className="text-[var(--ink)] text-sm">{selectedLocation.neighborhood}</dd>
                </div>
                {selectedLocation.address && (
                  <div>
                    <dt className="text-[var(--mute)] text-[10px] font-semibold tracking-[0.32em] uppercase mb-2">
                      {strings.fichaDireccion}
                    </dt>
                    <dd className="text-[var(--ink)] text-sm">{selectedLocation.address}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-[var(--mute)] text-[10px] font-semibold tracking-[0.32em] uppercase mb-2">
                    {strings.fichaAno}
                  </dt>
                  <dd className="text-[var(--ink)] text-sm tabular-nums">{selectedLocation.year}</dd>
                </div>
                {selectedLocation.area && (
                  <div>
                    <dt className="text-[var(--mute)] text-[10px] font-semibold tracking-[0.32em] uppercase mb-2">
                      {strings.fichaSuperficie}
                    </dt>
                    <dd className="text-[var(--ink)] text-sm tabular-nums">{selectedLocation.area}</dd>
                  </div>
                )}
                {selectedLocation.duration && (
                  <div>
                    <dt className="text-[var(--mute)] text-[10px] font-semibold tracking-[0.32em] uppercase mb-2">
                      {strings.fichaDuracion}
                    </dt>
                    <dd className="text-[var(--ink)] text-sm">{selectedLocation.duration}</dd>
                  </div>
                )}
              </dl>

              {(locale === "ca" ? selectedProject.descriptionCa : selectedProject.descriptionEs) && (
                <p className="text-[var(--ink-soft)] text-base leading-relaxed mb-10">
                  {locale === "ca" ? selectedProject.descriptionCa : selectedProject.descriptionEs}
                </p>
              )}

              <Link
                href={{ pathname: "/portfolio/[slug]", params: { slug: selectedProject.slug } }}
                onClick={() => {
                  document.body.style.overflow = "";
                  setSelectedSlug(null);
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
