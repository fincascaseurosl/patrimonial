import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getProjects, getProjectName } from "@/lib/projects";
import type { Project } from "@/lib/projects";
import {
  RevealOnScroll,
  StaggerChildren,
  TextReveal,
  Magnetic,
} from "@/components/animations";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "portfolio" });
  return {
    title: t("titulo"),
    description:
      locale === "ca"
        ? "Descobreix els nostres projectes de reformes i construcció a Barcelona. Fotografies reals dels nostres treballs."
        : "Descubre nuestros proyectos de reformas y construcción en Barcelona. Fotografías reales de nuestros trabajos.",
    alternates: { languages: { es: "/es/portfolio", ca: "/ca/portfolio" } },
  };
}

export default async function PortfolioPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const projects = await getProjects();
  const sorted = [...projects].sort((a, b) => a.order - b.order);
  return <PortfolioContent locale={locale} projects={sorted} />;
}

function PortfolioContent({ locale, projects }: { locale: string; projects: Project[] }) {
  const t = useTranslations();

  return (
    <>
      {/* Hero */}
      <section className="relative bg-[var(--color-dark)] text-white pt-32 pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <RevealOnScroll direction="none">
            <p className="text-[var(--color-primary)] text-[12px] font-semibold tracking-[0.3em] uppercase mb-4">
              {t("portfolio.titulo")}
            </p>
          </RevealOnScroll>
          <TextReveal
            as="h1"
            className="text-white text-4xl md:text-5xl font-bold leading-[1.1] tracking-[-0.02em] mb-4 max-w-2xl"
          >
            {t("portfolio.subtitulo")}
          </TextReveal>
          <RevealOnScroll direction="up" delay={0.2} distance={10}>
            <div className="w-12 h-[2px] bg-[var(--color-primary)]" />
          </RevealOnScroll>
        </div>
      </section>

      {/* Projects grid */}
      <section className="py-24 md:py-32 bg-[var(--paper)]">
        <div className="max-w-7xl mx-auto px-6">
          <StaggerChildren
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5"
            stagger={0.1}
          >
            {projects.map((project, i) => {
              const name = getProjectName(project, locale);
              return (
                <Link
                  key={project.slug}
                  href={{ pathname: "/portfolio/[slug]", params: { slug: project.slug } }}
                  className="cursor-grow group relative overflow-hidden bg-[var(--ink)] aspect-[4/3]"
                >
                  <img
                    src={project.images[0]}
                    alt={name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.07]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/80 via-[var(--ink)]/20 to-transparent" />
                  <div className="absolute inset-0 bg-[var(--ink)]/0 group-hover:bg-[var(--ink)]/15 transition-colors duration-700" />
                  <div className="absolute top-6 left-6">
                    <span className="text-white/40 text-[10px] font-semibold tracking-[0.3em] tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-7 md:p-8">
                    <p className="text-[var(--brand-red-soft)] text-[10px] font-semibold tracking-[0.32em] uppercase mb-2">
                      {t(`servicios.items.${project.category}.nombre`)}
                    </p>
                    <div className="flex items-end justify-between gap-4">
                      <h2 className="font-display text-white text-xl md:text-2xl font-bold tracking-[-0.02em] leading-tight">
                        {name}
                      </h2>
                      <span className="shrink-0 w-8 h-8 rounded-full border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                        <svg className="w-3.5 h-3.5 text-white -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 md:py-28 bg-[var(--color-dark)] overflow-hidden grain">
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <TextReveal
            as="h2"
            className="text-white text-2xl md:text-[2.25rem] font-bold leading-[1.15] tracking-[-0.02em] mb-4"
          >
            {t("cta.presupuesto")}
          </TextReveal>
          <RevealOnScroll direction="up" delay={0.1} distance={10}>
            <p className="text-white/40 text-sm leading-relaxed mb-8">{t("cta.subtexto")}</p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={0.2} distance={10}>
            <Magnetic strength={0.2}>
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center px-10 py-4 bg-[var(--color-accent)] text-white text-[13px] font-semibold tracking-wider uppercase transition-all duration-300 hover:bg-[var(--color-accent-hover)] btn-press"
              >
                {t("cta.boton")}
              </Link>
            </Magnetic>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}
