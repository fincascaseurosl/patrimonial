"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import type { Project } from "@/lib/projects";
import { getProjectName } from "@/lib/project-helpers";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Props = {
  projects: Project[];
  locale: string;
  eyebrow: string;
  titulo: string;
  verTodos: string;
  verMas: string;
  desplaza: string;
  finalLabel: string;
  finalTitulo: string;
  categoryLabels: Record<string, string>;
};

export function PortfolioPinned({
  projects,
  locale,
  eyebrow,
  titulo,
  verTodos,
  verMas,
  desplaza,
  finalLabel,
  finalTitulo,
  categoryLabels,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const track = trackRef.current;
      const wrap = wrapRef.current;
      if (!track || !wrap) return;

      const distance = () => track.scrollWidth - window.innerWidth;

      const masterTween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1.2,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const total = projects.length;
            const current = Math.min(Math.floor(self.progress * total) + 1, total);
            if (counterRef.current) {
              counterRef.current.textContent = String(current).padStart(2, "0");
            }
            if (progressRef.current) {
              progressRef.current.style.transform = `scaleX(${self.progress})`;
            }
          },
        },
      });

      const panels = gsap.utils.toArray<HTMLElement>(".pp-panel", wrap);

      panels.forEach((panel) => {
        const number = panel.querySelector(".pp-number");
        const meta = panel.querySelector(".pp-meta");
        const image = panel.querySelector(".pp-image");

        if (number) {
          gsap.fromTo(
            number,
            { xPercent: 40, opacity: 0.35 },
            {
              xPercent: -40,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                containerAnimation: masterTween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            }
          );
        }

        if (meta) {
          gsap.fromTo(
            meta,
            { xPercent: -18, opacity: 0.6 },
            {
              xPercent: 18,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                containerAnimation: masterTween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            }
          );
        }

        if (image) {
          gsap.fromTo(
            image,
            { scale: 1.12 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                containerAnimation: masterTween,
                start: "left right",
                end: "center center",
                scrub: true,
              },
            }
          );
        }
      });

      return () => {
        masterTween.scrollTrigger?.kill();
        masterTween.kill();
      };
    });
  }, { scope: wrapRef, dependencies: [projects.length] });

  const totalLabel = String(projects.length).padStart(2, "0");

  return (
    <>
      {/* Mobile / tablet: vertical stack (< lg) */}
      <section className="lg:hidden py-24 bg-[var(--paper)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-[var(--brand-red)] text-[11px] font-semibold tracking-[0.32em] uppercase mb-4">
              {eyebrow}
            </p>
            <h2 className="font-display text-[var(--ink)] text-3xl md:text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-balance max-w-xl">
              {titulo}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.slice(0, 4).map((project, i) => {
              const name = getProjectName(project, locale);
              return (
                <Link
                  key={project.slug}
                  href={{ pathname: "/portfolio/[slug]", params: { slug: project.slug } }}
                  className="cursor-grow group relative overflow-hidden bg-[var(--ink)] aspect-[4/3]"
                >
                  {project.images[0] && (
                    <Image
                      src={project.images[0]}
                      alt={name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.07]"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/80 via-[var(--ink)]/15 to-transparent" />
                  <div className="absolute top-5 left-5">
                    <span className="text-white/40 text-[10px] font-semibold tracking-[0.3em] tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-[var(--brand-red-soft)] text-[10px] font-semibold tracking-[0.32em] uppercase mb-2">
                      {categoryLabels[project.category] ?? project.category}
                    </p>
                    <h3 className="font-display text-white text-xl font-bold tracking-[-0.02em] leading-tight">
                      {name}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-10">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-3 text-[12px] font-semibold tracking-[0.18em] uppercase text-[var(--ink)] hover:text-[var(--brand-red)] transition-colors duration-300 group"
            >
              <span>{verTodos}</span>
              <span className="w-9 h-[1px] bg-current transition-all duration-300 group-hover:w-12" />
            </Link>
          </div>
        </div>
      </section>

      {/* Desktop: pinned horizontal cinematic (>= lg) */}
      <div className="hidden lg:block bg-[var(--paper)]">
        {/* Title block — scrolls past before pin engages */}
        <div className="pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-end gap-12">
            <div className="max-w-2xl">
              <p className="text-[var(--brand-red)] text-[11px] font-semibold tracking-[0.32em] uppercase mb-5">
                {eyebrow}
              </p>
              <h2 className="font-display text-[var(--ink)] text-4xl xl:text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-balance">
                {titulo}
              </h2>
            </div>
            <Link
              href="/portfolio"
              className="cursor-grow inline-flex items-center gap-3 text-[12px] font-semibold tracking-[0.18em] uppercase text-[var(--ink)] hover:text-[var(--brand-red)] transition-colors duration-300 group whitespace-nowrap pb-2"
            >
              <span>{verTodos}</span>
              <span className="w-9 h-[1px] bg-current transition-all duration-300 group-hover:w-14" />
            </Link>
          </div>
        </div>

        {/* Pinned cinematic horizontal scroll */}
        <section ref={wrapRef} className="relative overflow-hidden">
          {/* Top-right scroll hint */}
          <div className="absolute top-10 right-0 left-0 z-20 pointer-events-none">
            <div className="max-w-7xl mx-auto px-6 flex justify-end">
              <div className="flex items-center gap-3 text-[var(--mute)] text-[10px] font-semibold tracking-[0.32em] uppercase">
                <span className="w-8 h-[1px] bg-current" />
                <span>{desplaza}</span>
              </div>
            </div>
          </div>

          {/* Track */}
          <div className="h-screen flex items-center">
          <div
            ref={trackRef}
            className="flex items-center pl-[10vw] gap-[8vw] pr-[10vw]"
            style={{ willChange: "transform" }}
          >
            {projects.map((project, i) => {
              const name = getProjectName(project, locale);
              return (
                <Link
                  key={project.slug}
                  href={{ pathname: "/portfolio/[slug]", params: { slug: project.slug } }}
                  className="pp-panel relative shrink-0 group block"
                  style={{ width: "60vw", maxWidth: "880px" }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--ink)]">
                    {project.images[0] && (
                      <Image
                        src={project.images[0]}
                        alt={name}
                        fill
                        sizes="(max-width: 880px) 60vw, 880px"
                        className="pp-image object-cover"
                        style={{ willChange: "transform" }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/65 via-[var(--ink)]/10 to-transparent" />
                    <div className="absolute inset-0 bg-[var(--ink)]/0 group-hover:bg-[var(--ink)]/10 transition-colors duration-700" />

                    {/* Big number — parallax slow (lags behind) */}
                    <span
                      className="pp-number pointer-events-none select-none absolute -top-6 -left-2 font-display text-white/15 leading-none tracking-[-0.06em] font-bold"
                      style={{ fontSize: "clamp(7rem,16vw,14rem)", willChange: "transform" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Meta — parallax fast (leads) */}
                    <div
                      className="pp-meta absolute bottom-0 left-0 right-0 p-8 md:p-10"
                      style={{ willChange: "transform" }}
                    >
                      <p className="text-[var(--brand-red-soft)] text-[10px] font-semibold tracking-[0.32em] uppercase mb-3">
                        {categoryLabels[project.category] ?? project.category}
                      </p>
                      <div className="flex items-end justify-between gap-6">
                        <h3 className="font-display text-white text-2xl xl:text-[1.875rem] font-bold tracking-[-0.02em] leading-[1.1] max-w-md">
                          {name}
                        </h3>
                        <span className="shrink-0 w-12 h-12 rounded-full border border-white/30 flex items-center justify-center transition-all duration-500 group-hover:bg-white group-hover:border-white">
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
                      </div>
                    </div>
                  </div>

                  {/* Caption below card */}
                  <div className="mt-5 flex items-center justify-between text-[10px] font-semibold tracking-[0.28em] uppercase text-[var(--mute)] tabular-nums">
                    <span>{verMas}</span>
                    <span>
                      {String(i + 1).padStart(2, "0")} / {totalLabel}
                    </span>
                  </div>
                </Link>
              );
            })}

            {/* End card: CTA */}
            <Link
              href="/portfolio"
              className="shrink-0 group flex flex-col justify-center items-start gap-8 self-stretch"
              style={{ width: "38vw", maxWidth: "480px" }}
            >
              <p className="text-[var(--mute)] text-[10px] font-semibold tracking-[0.32em] uppercase">
                {String(projects.length + 1).padStart(2, "0")} · {finalLabel}
              </p>
              <p className="font-display text-[var(--ink)] text-4xl xl:text-5xl font-bold tracking-[-0.03em] leading-[1.05]">
                {finalTitulo}
              </p>
              <span className="inline-flex items-center gap-3 text-[12px] font-semibold tracking-[0.18em] uppercase text-[var(--brand-red)]">
                <span>{verTodos}</span>
                <span className="w-9 h-[1px] bg-current transition-all duration-300 group-hover:w-14" />
              </span>
            </Link>
          </div>
        </div>

          {/* Bottom progress */}
          <div className="absolute bottom-10 left-0 right-0 z-20">
            <div className="max-w-7xl mx-auto px-6 flex items-center gap-6">
              <span className="text-[var(--ink)] text-[10px] font-semibold tracking-[0.32em] tabular-nums">
                <span ref={counterRef}>01</span> / {totalLabel}
              </span>
              <div className="flex-1 h-[1px] bg-[var(--ink)]/15 relative overflow-hidden">
                <div
                  ref={progressRef}
                  className="absolute left-0 top-0 h-full w-full bg-[var(--brand-red)] origin-left"
                  style={{ transform: "scaleX(0)" }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
