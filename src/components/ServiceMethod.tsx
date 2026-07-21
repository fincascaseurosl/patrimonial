"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import type { ServiceSlug } from "@/lib/site-config";

type Fase = { n: string; titulo: string; descripcion: string };

export type MethodService = {
  slug: ServiceSlug;
  nombre: string;
  fases: Fase[];
};

type Props = {
  eyebrow: string;
  titulo: string;
  intro: string;
  services: MethodService[];
  verServicio: string;
};

/**
 * Sección "Cómo trabajamos": layout de dos columnas 20/80. A la izquierda, una
 * lista vertical de servicios (selector); a la derecha, las fases propias del
 * servicio elegido, con una transición animada al cambiar.
 */
export function ServiceMethod({ eyebrow, titulo, intro, services, verServicio }: Props) {
  const [active, setActive] = useState<string>(services[0]?.slug ?? "");
  const current = services.find((s) => s.slug === active) ?? services[0];
  if (!current) return null;

  return (
    <section className="py-24 md:py-36 bg-[var(--bone)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-12 md:mb-16">
          <p className="text-[var(--brand-red)] text-[11px] font-semibold tracking-[0.32em] uppercase mb-5">
            {eyebrow}
          </p>
          <h2 className="font-display text-[var(--ink)] text-4xl md:text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-balance">
            {titulo}
          </h2>
          <p className="text-[var(--ink-soft)] text-base md:text-lg leading-relaxed mt-6">
            {intro}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 lg:gap-12">
          {/* 20% · lista vertical de servicios */}
          <div
            className="lg:col-span-2 flex flex-col border-t border-[var(--line)]"
            role="tablist"
            aria-label={eyebrow}
          >
            {services.map((s) => {
              const isActive = s.slug === active;
              return (
                <button
                  key={s.slug}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(s.slug)}
                  className={`cursor-grow group w-full border-b border-[var(--line)] py-4 pl-4 pr-2 text-left transition-colors duration-300 ${
                    isActive
                      ? "border-l-2 border-l-[var(--brand-red)] bg-[var(--paper)] text-[var(--ink)]"
                      : "border-l-2 border-l-transparent text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--paper)]/60"
                  }`}
                >
                  <span
                    className={`font-display text-[15px] font-semibold leading-tight tracking-[-0.01em] ${
                      isActive ? "text-[var(--ink)]" : ""
                    }`}
                  >
                    {s.nombre}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 80% · fases del servicio activo */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <ol className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[var(--line)]">
                  {current.fases.map((fase, i) => (
                    <motion.li
                      key={fase.n}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      className="group relative flex min-h-[240px] flex-col bg-[var(--bone)] p-8 md:p-10 transition-colors duration-500 hover:bg-[var(--paper)]"
                    >
                      <span className="font-display text-[var(--brand-red)] text-5xl md:text-6xl font-bold tracking-[-0.04em] leading-none">
                        {fase.n}
                      </span>
                      <h3 className="mt-auto font-display text-[var(--ink)] text-xl md:text-2xl font-semibold tracking-[-0.015em]">
                        {fase.titulo}
                      </h3>
                      <p className="mt-3 text-[var(--ink-soft)] text-sm md:text-[15px] leading-relaxed">
                        {fase.descripcion}
                      </p>
                    </motion.li>
                  ))}
                </ol>

                <div className="mt-10">
                  <Link
                    href={{ pathname: "/servicios/[slug]", params: { slug: current.slug } }}
                    className="cursor-grow inline-flex items-center gap-3 text-[12px] font-semibold tracking-[0.18em] uppercase text-[var(--ink)] hover:text-[var(--brand-red)] transition-colors duration-300 group"
                  >
                    <span>
                      {verServicio}: {current.nombre}
                    </span>
                    <span className="w-9 h-[1px] bg-current transition-all duration-300 group-hover:w-12" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
