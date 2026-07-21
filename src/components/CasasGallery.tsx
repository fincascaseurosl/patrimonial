"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Project } from "@/lib/projects";
import { getProjectName } from "@/lib/project-helpers";
import { ProjectPanel, type ProjectPanelStrings } from "@/components/ProjectPanel";

export type CasasGalleryStrings = ProjectPanelStrings & {
  eyebrow: string;
  titulo: string;
  subtitulo: string;
  verProyecto: string;
  anterior: string;
  siguiente: string;
};

type Props = {
  projects: Project[];
  locale: string;
  categoryLabels: Record<string, string>;
  strings: CasasGalleryStrings;
};

/**
 * Galería tipo carrusel de "casas construidas" para la página de "Construye tu
 * casa". Imágenes gigantes con avance automático (pausado al interactuar) y,
 * al hacer clic en una, abre la MISMA ficha lateral (ProjectPanel) que el mapa
 * del portfolio. Se alimenta de los proyectos marcados como casa en el admin.
 */
export function CasasGallery({ projects, locale, categoryLabels, strings }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Project | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const stepSize = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    const first = track.querySelector<HTMLElement>("[data-slide]");
    const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
    return first ? first.offsetWidth + gap : track.clientWidth * 0.8;
  }, []);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const slides = track.querySelectorAll<HTMLElement>("[data-slide]");
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    const target = slides[clamped];
    if (target) track.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  }, []);

  const next = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
    if (atEnd) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      track.scrollBy({ left: stepSize(), behavior: "smooth" });
    }
  }, [stepSize]);

  const prev = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    if (track.scrollLeft <= 8) {
      track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
    } else {
      track.scrollBy({ left: -stepSize(), behavior: "smooth" });
    }
  }, [stepSize]);

  // Índice activo según la posición de scroll (rAF para no saturar).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const step = stepSize();
        if (step > 0) setActive(Math.round(track.scrollLeft / step));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [stepSize]);

  // Avance automático (pausado al pasar el ratón, con la ficha abierta o con
  // reduced-motion).
  useEffect(() => {
    if (reducedMotion || paused || selected || projects.length < 2) return;
    const id = window.setInterval(next, 4800);
    return () => window.clearInterval(id);
  }, [reducedMotion, paused, selected, projects.length, next]);

  if (projects.length === 0) return null;

  return (
    <section
      className="relative bg-[var(--ink)] py-24 md:py-32 overflow-hidden"
      data-nav-dark
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-14 md:mb-16">
        <div className="max-w-2xl">
          <p className="text-[var(--brand-red-soft)] text-[11px] font-semibold tracking-[0.32em] uppercase mb-5">
            {strings.eyebrow}
          </p>
          <h2 className="font-display text-white text-4xl md:text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-balance">
            {strings.titulo}
          </h2>
          <p className="text-white/55 text-base md:text-lg leading-relaxed mt-6 max-w-xl">
            {strings.subtitulo}
          </p>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={prev}
            aria-label={strings.anterior}
            className="cursor-grow w-12 h-12 rounded-full border border-white/25 flex items-center justify-center text-white transition-colors duration-300 hover:border-white hover:bg-white/10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={strings.siguiente}
            className="cursor-grow w-12 h-12 rounded-full border border-white/25 flex items-center justify-center text-white transition-colors duration-300 hover:border-white hover:bg-white/10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Carrusel */}
      <div
        ref={trackRef}
        data-lenis-prevent
        className="flex gap-5 md:gap-7 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 px-6 md:px-[max(1.5rem,calc((100vw-80rem)/2))] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((project, i) => {
          const name = getProjectName(project, locale);
          return (
            <button
              key={project.slug}
              type="button"
              data-slide
              onClick={() => setSelected(project)}
              className="cursor-grow group relative shrink-0 snap-start block text-left w-[86vw] sm:w-[68vw] lg:w-[56vw] max-w-[880px] overflow-hidden bg-white/5"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {project.images[0] && (
                  <Image
                    src={project.images[0]}
                    alt={name}
                    fill
                    sizes="(max-width: 640px) 86vw, (max-width: 1024px) 68vw, 880px"
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/25 to-transparent" />

                <span className="absolute top-6 left-7 font-display text-white/40 text-sm font-semibold tracking-[0.3em] tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="absolute bottom-0 left-0 right-0 p-7 md:p-10">
                  <p className="text-[var(--brand-red-soft)] text-[10px] font-semibold tracking-[0.32em] uppercase mb-3">
                    {categoryLabels[project.category] ?? project.category}
                  </p>
                  <div className="flex items-end justify-between gap-6">
                    <h3 className="font-display text-white text-2xl md:text-4xl font-bold tracking-[-0.02em] leading-[1.05] max-w-lg">
                      {name}
                    </h3>
                    <span className="shrink-0 inline-flex items-center gap-2 text-white/70 text-[11px] font-semibold tracking-[0.2em] uppercase group-hover:text-white transition-colors duration-300">
                      {strings.verProyecto}
                      <span className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center transition-all duration-500 group-hover:bg-white group-hover:border-white">
                        <svg
                          className="w-4 h-4 text-white -rotate-45 group-hover:text-[var(--ink)] transition-colors duration-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Puntos de progreso */}
      {projects.length > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2.5">
          {projects.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "w-8 bg-[var(--brand-red)]" : "w-1.5 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      <ProjectPanel
        project={selected}
        open={!!selected}
        locale={locale}
        categoryLabels={categoryLabels}
        strings={strings}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
