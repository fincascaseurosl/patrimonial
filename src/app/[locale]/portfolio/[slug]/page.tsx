import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { getProjects, getProjectName, getProjectDescription } from "@/lib/projects";
import type { Project } from "@/lib/projects";
import { serviceKeyMap, ogMeta, siteConfig } from "@/lib/site-config";
import { getBreadcrumbSchema } from "@/lib/schema";
import { notFound } from "next/navigation";
import {
  RevealOnScroll,
  StaggerChildren,
  TextReveal,
  Magnetic,
} from "@/components/animations";
import type { Metadata } from "next";

export const revalidate = 60;
export const dynamicParams = true;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const projects = await getProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  const name = getProjectName(project, locale);
  const description =
    locale === "ca"
      ? `Projecte: ${name}. Veure les fotos del treball realitzat a Barcelona.`
      : locale === "en"
      ? `Project: ${name}. See photos of the work completed in Barcelona.`
      : `Proyecto: ${name}. Ver las fotos del trabajo realizado en Barcelona.`;
  return {
    title: name,
    description,
    openGraph: ogMeta(locale, name, description),
    alternates: {
      canonical: `/${locale}/portfolio/${slug}`,
      languages: {
        es: `/es/portfolio/${slug}`,
        ca: `/ca/portfolio/${slug}`,
        en: `/en/portfolio/${slug}`,
        "x-default": `/es/portfolio/${slug}`,
      },
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const projects = await getProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  setRequestLocale(locale);
  return <ProjectContent project={project} locale={locale} />;
}

function ProjectContent({ project, locale }: { project: Project; locale: string }) {
  const t = useTranslations();
  const name = getProjectName(project, locale);
  const description = getProjectDescription(project, locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbSchema([
              { name: t("nav.inicio"), url: siteConfig.url },
              { name: t("nav.portfolio"), url: `${siteConfig.url}/${locale}/portfolio` },
              { name, url: `${siteConfig.url}/${locale}/portfolio/${project.slug}` },
            ]),
          ),
        }}
      />
      {/* Hero */}
      <section className="relative bg-[var(--color-dark)] text-white pt-32 pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <RevealOnScroll direction="none">
            <nav className="text-[12px] tracking-wider uppercase text-white/40 mb-8">
              <Link href="/" className="hover:text-white/70 transition-colors duration-300">
                {t("nav.inicio")}
              </Link>
              <span className="mx-2">/</span>
              <Link href="/portfolio" className="hover:text-white/70 transition-colors duration-300">
                {t("nav.portfolio")}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-[var(--color-primary)]">{name}</span>
            </nav>
          </RevealOnScroll>
          <RevealOnScroll direction="none" delay={0.05}>
            <p className="text-[var(--color-primary)] text-[11px] font-semibold tracking-[0.2em] uppercase mb-3">
              {t(`servicios.items.${serviceKeyMap[project.category] ?? project.category}.nombre`)}
            </p>
          </RevealOnScroll>
          <TextReveal as="h1" className="text-3xl md:text-5xl font-bold tracking-[-0.02em] mb-4">
            {name}
          </TextReveal>
          {description && (
            <RevealOnScroll direction="up" delay={0.15} distance={10}>
              <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-2xl mt-4">
                {description}
              </p>
            </RevealOnScroll>
          )}
          <RevealOnScroll direction="up" delay={0.2} distance={10}>
            <div className="w-12 h-[2px] bg-[var(--color-primary)] mt-6" />
          </RevealOnScroll>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 md:py-28 bg-[var(--paper)]">
        <div className="max-w-7xl mx-auto px-6">
          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5" stagger={0.12}>
            {project.images.map((img, i) => (
              <div
                key={i}
                className={`relative overflow-hidden bg-[var(--bone-deep)] ${
                  i === 0 && project.images.length > 2 ? "sm:col-span-2 aspect-[16/9]" : "aspect-[4/3]"
                }`}
              >
                <Image
                  src={img}
                  alt={`${name} – ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </StaggerChildren>

          <RevealOnScroll direction="up" delay={0.1} distance={15}>
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-[var(--line)]">
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 text-[13px] font-medium tracking-wider uppercase text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors duration-300 group"
              >
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                <span>{t("portfolio.volver")}</span>
              </Link>
              <Magnetic strength={0.15}>
                <Link
                  href="/contacto"
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-[var(--ink)] text-white text-[12px] font-semibold tracking-wider uppercase transition-all duration-300 hover:bg-[var(--color-dark-lighter)] btn-press"
                >
                  {t("cta.boton")}
                </Link>
              </Magnetic>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}
