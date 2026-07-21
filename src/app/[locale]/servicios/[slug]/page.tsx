import { useTranslations, useMessages } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { serviceSlugs, serviceKeyMap, ogMeta, siteConfig, type ServiceSlug } from "@/lib/site-config";
import { getServiceSchema, getBreadcrumbSchema } from "@/lib/schema";
import { getProjects } from "@/lib/projects";
import { getProjectName } from "@/lib/project-helpers";
import type { Project } from "@/lib/projects";
import { notFound } from "next/navigation";
import {
  RevealOnScroll,
  StaggerChildren,
  TextReveal,
  Magnetic,
  SplitText,
} from "@/components/animations";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return serviceSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!serviceSlugs.includes(slug as ServiceSlug)) return {};
  const key = serviceKeyMap[slug as ServiceSlug];
  const t = await getTranslations({ locale, namespace: "servicios" });
  const nombre = t(`items.${key}.nombre`);
  const descripcion = t(`items.${key}.descripcion`);
  // El valor del [slug] NO se traduce (next-intl solo traduce el prefijo /serveis).
  // Las URLs reales usan siempre el slug en español, igual que enlaces y sitemap.
  return {
    title: nombre,
    description: descripcion,
    openGraph: ogMeta(locale, nombre, descripcion),
    alternates: {
      canonical:
        locale === "ca"
          ? `/ca/serveis/${slug}`
          : locale === "en"
          ? `/en/services/${slug}`
          : `/es/servicios/${slug}`,
      languages: {
        es: `/es/servicios/${slug}`,
        ca: `/ca/serveis/${slug}`,
        en: `/en/services/${slug}`,
        "x-default": `/es/servicios/${slug}`,
      },
    },
  };
}

export default async function ServicioDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!serviceSlugs.includes(slug as ServiceSlug)) notFound();
  setRequestLocale(locale);
  const allProjects = await getProjects();
  const serviceProjects = allProjects
    .filter((p) => p.category === slug)
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);
  return <ServicioContent slug={slug as ServiceSlug} locale={locale} projects={serviceProjects} />;
}

type FaseMsg = { n: string; titulo: string; descripcion: string };
type DetailMessages = {
  servicios: { items: Record<string, { destacados: string[]; fases: FaseMsg[] }> };
};

function ServicioContent({
  slug,
  locale,
  projects,
}: {
  slug: ServiceSlug;
  locale: string;
  projects: Project[];
}) {
  const t = useTranslations();
  const messages = useMessages() as unknown as DetailMessages;
  const key = serviceKeyMap[slug];
  const idx = serviceSlugs.indexOf(slug);
  const num = String(idx + 1).padStart(2, "0");
  const otherServices = serviceSlugs.filter((s) => s !== slug);
  const next = serviceSlugs[(idx + 1) % serviceSlugs.length];
  const nextKey = serviceKeyMap[next];
  const destacados = messages.servicios.items[key].destacados;
  const fases = messages.servicios.items[key].fases;
  const nombre = t(`servicios.items.${key}.nombre`);
  const descripcion = t(`servicios.items.${key}.descripcion`);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getServiceSchema({ locale, slug, name: nombre, description: descripcion }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbSchema([
              { name: t("nav.inicio"), url: siteConfig.url },
              { name: t("nav.servicios"), url: `${siteConfig.url}/${locale}/servicios` },
              { name: nombre, url: `${siteConfig.url}/${locale}/servicios/${slug}` },
            ]),
          ),
        }}
      />
      {/* HERO masivo negro */}
      <section className="relative bg-[var(--ink)] text-[var(--paper)] pt-36 pb-24 md:pt-44 md:pb-32 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <RevealOnScroll direction="none">
            <nav className="text-[11px] tracking-[0.25em] uppercase text-white/40 mb-12 flex items-center gap-3">
              <Link href="/" className="hover:text-white/80 transition-colors duration-300 cursor-grow">
                {t("nav.inicio")}
              </Link>
              <span>/</span>
              <Link href="/servicios" className="hover:text-white/80 transition-colors duration-300 cursor-grow">
                {t("nav.servicios")}
              </Link>
              <span>/</span>
              <span className="text-[var(--brand-red-soft)]">
                {t(`servicios.items.${key}.nombre`)}
              </span>
            </nav>
          </RevealOnScroll>

          <div className="grid grid-cols-12 gap-6 items-end">
            <div className="col-span-2 md:col-span-1">
              <RevealOnScroll direction="up" distance={10}>
                <span className="font-display text-[var(--brand-red)] text-3xl md:text-5xl font-light tabular-nums">
                  {num}
                </span>
              </RevealOnScroll>
            </div>
            <div className="col-span-10 md:col-span-11">
              <SplitText
                as="h1"
                by="word"
                className="font-display text-[clamp(2.5rem,7vw,6.5rem)] font-medium leading-[1.02] tracking-[-0.03em]"
              >
                {t(`servicios.items.${key}.nombre`)}
              </SplitText>
            </div>
          </div>

          <RevealOnScroll direction="up" delay={0.3} distance={10}>
            <div className="mt-12 w-16 h-[2px] bg-[var(--brand-red)]" />
          </RevealOnScroll>
        </div>

        <div className="absolute right-0 -bottom-32 md:-bottom-40 opacity-[0.04] pointer-events-none">
          <div className="font-display text-white text-[28rem] md:text-[40rem] leading-none select-none">
            {num}
          </div>
        </div>
      </section>

      {/* CUERPO editorial */}
      <section className="bg-[var(--paper)] py-24 md:py-36">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20">
            <div className="lg:col-span-8">
              <RevealOnScroll direction="up" distance={15}>
                <p className="text-[var(--mute)] text-[11px] tracking-[0.3em] uppercase mb-8">
                  {t("servicios.detailEncargo")}
                </p>
              </RevealOnScroll>
              <TextReveal
                as="p"
                className="font-display text-[var(--ink)] text-[clamp(1.5rem,2.6vw,2.25rem)] font-light leading-[1.35] tracking-[-0.015em] text-balance mb-14 first-letter:font-display first-letter:text-[var(--brand-red)] first-letter:text-[5rem] first-letter:font-medium first-letter:float-left first-letter:mr-4 first-letter:leading-[0.85] first-letter:mt-2"
              >
                {t(`servicios.items.${key}.descripcionLarga`)}
              </TextReveal>

              {/* Destacados — qué incluye, propio de cada servicio */}
              <RevealOnScroll direction="up" distance={15}>
                <div className="border-t border-[var(--line)] pt-12">
                  <p className="text-[var(--brand-red)] text-[11px] font-semibold tracking-[0.3em] uppercase mb-10">
                    {t("servicios.detailDestacados")}
                  </p>
                  <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8" stagger={0.08}>
                    {destacados.map((d, i) => (
                      <div key={i} className="flex gap-4">
                        <span className="font-display text-[var(--brand-red)] text-xl font-medium tabular-nums shrink-0 leading-none mt-0.5">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p className="text-[var(--ink)] text-[15px] leading-[1.5]">{d}</p>
                      </div>
                    ))}
                  </StaggerChildren>
                </div>
              </RevealOnScroll>

              <RevealOnScroll direction="up" distance={20}>
                <div className="border-t border-[var(--line)] pt-12 mt-12">
                  <p className="text-[var(--brand-red)] text-[11px] font-semibold tracking-[0.3em] uppercase mb-10">
                    {t("servicios.detailMetodo")}
                  </p>
                  <ol className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                    {fases.map((f) => (
                      <li key={f.n} className="flex gap-5">
                        <span className="font-display text-[var(--mute-soft)] text-2xl font-light tabular-nums shrink-0 leading-none mt-1">
                          {f.n}
                        </span>
                        <div>
                          <h3 className="font-display text-[var(--ink)] text-xl font-medium tracking-[-0.015em] mb-2">
                            {f.titulo}
                          </h3>
                          <p className="text-[var(--mute)] text-sm leading-[1.6]">{f.descripcion}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </RevealOnScroll>

              <RevealOnScroll direction="up" distance={20}>
                <div className="mt-20 bg-[var(--ink)] text-white p-10 md:p-14">
                  <p className="text-[var(--brand-red-soft)] text-[11px] font-semibold tracking-[0.3em] uppercase mb-6">
                    {t("servicios.detailPresupuestoLabel")}
                  </p>
                  <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-[1.1] tracking-[-0.02em] mb-10 max-w-2xl">
                    {t("cta.presupuesto")}
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Magnetic strength={0.2}>
                      <Link
                        href="/contacto"
                        className="cursor-grow inline-flex items-center gap-3 px-8 py-4 bg-[var(--brand-red)] text-white text-[12px] font-semibold tracking-[0.25em] uppercase hover:bg-[var(--paper)] hover:text-[var(--ink)] transition-colors duration-500"
                      >
                        {t("cta.boton")}
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </Link>
                    </Magnetic>
                    <a
                      href={siteConfig.telefonoFijoHref}
                      className="cursor-grow inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white text-[12px] font-medium tracking-[0.25em] uppercase hover:border-white/60 transition-colors duration-300"
                    >
                      {siteConfig.telefonoFijo}
                    </a>
                  </div>
                </div>
              </RevealOnScroll>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <RevealOnScroll direction="right" distance={20}>
                <div className="sticky top-32">
                  <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[var(--mute)] mb-6">
                    {t("servicios.detailOtrosServicios")}
                  </p>
                  <div className="w-10 h-[1px] bg-[var(--brand-red)] mb-8" />
                  <ul className="space-y-0">
                    {otherServices.map((s) => {
                      const sKey = serviceKeyMap[s];
                      const sIdx = serviceSlugs.indexOf(s);
                      return (
                        <li key={s} className="border-b border-[var(--line)]">
                          <Link
                            href={{ pathname: "/servicios/[slug]", params: { slug: s } }}
                            className="cursor-grow group flex items-baseline gap-4 py-4 text-[var(--ink)] hover:text-[var(--brand-red)] transition-colors duration-300"
                          >
                            <span className="font-display text-[var(--mute-soft)] text-xs tabular-nums shrink-0">
                              {String(sIdx + 1).padStart(2, "0")}
                            </span>
                            <span className="font-display text-base font-medium tracking-[-0.01em] flex-1">
                              {t(`servicios.items.${sKey}.nombre`)}
                            </span>
                            <span aria-hidden className="text-xs opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                              {"\u2192"}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </RevealOnScroll>
            </aside>
          </div>
        </div>
      </section>

      {/* Trabajos realizados — proyectos reales de este servicio, si los hay */}
      {projects.length > 0 && (
        <section className="bg-[var(--ink)] py-24 md:py-32">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
              <div>
                <RevealOnScroll direction="none">
                  <p className="text-[var(--brand-red)] text-[11px] font-semibold tracking-[0.3em] uppercase mb-5">
                    {t("servicios.detailTrabajos")}
                  </p>
                </RevealOnScroll>
                <TextReveal as="h2" className="font-display text-white text-3xl md:text-4xl font-medium leading-[1.1] tracking-[-0.02em] max-w-xl">
                  {t("servicios.detailTrabajosSubtitulo")}
                </TextReveal>
              </div>
              <RevealOnScroll direction="right" delay={0.15}>
                <Link
                  href="/portfolio"
                  className="cursor-grow inline-flex items-center gap-3 text-[12px] font-semibold tracking-[0.18em] uppercase text-white/70 hover:text-white transition-colors duration-300 shrink-0"
                >
                  {t("portfolio.verTodos")}
                  <span className="w-9 h-[1px] bg-current" />
                </Link>
              </RevealOnScroll>
            </div>

            <StaggerChildren
              className={`grid grid-cols-1 gap-8 ${
                projects.length === 1 ? "sm:grid-cols-1 max-w-xl" : projects.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"
              }`}
              stagger={0.1}
            >
              {projects.map((project) => (
                <Link
                  key={project.slug}
                  href={{ pathname: "/portfolio/[slug]", params: { slug: project.slug } }}
                  className="cursor-grow group block"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
                    {project.images[0] && (
                      <Image
                        src={project.images[0]}
                        alt={getProjectName(project, locale)}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <h3 className="font-display text-white text-lg font-medium tracking-[-0.01em] group-hover:text-[var(--brand-red-soft)] transition-colors duration-300">
                      {getProjectName(project, locale)}
                    </h3>
                    <span className="shrink-0 text-white/40 text-[11px] font-semibold tracking-[0.2em] uppercase group-hover:text-white/80 transition-colors duration-300">
                      {t("portfolio.verProyecto")}
                    </span>
                  </div>
                </Link>
              ))}
            </StaggerChildren>
          </div>
        </section>
      )}

      {/* Siguiente servicio */}
      <section className="bg-[var(--bone)] border-t border-[var(--line)]">
        <Link
          href={{ pathname: "/servicios/[slug]", params: { slug: next } }}
          className="group cursor-grow block py-20 md:py-28 px-6 md:px-10 hover:bg-[var(--ink)] transition-colors duration-700"
        >
          <div className="max-w-[1400px] mx-auto">
            <p className="text-[var(--mute)] group-hover:text-[var(--brand-red-soft)] text-[11px] tracking-[0.3em] uppercase mb-6 transition-colors duration-500">
              {t("servicios.detailSiguiente")} {"\u2192"}
            </p>
            <h2 className="font-display text-[var(--ink)] group-hover:text-[var(--paper)] text-[clamp(2.5rem,7vw,6rem)] font-medium leading-[0.98] tracking-[-0.03em] transition-colors duration-500">
              {t(`servicios.items.${nextKey}.nombre`)}
            </h2>
          </div>
        </Link>
      </section>
    </>
  );
}