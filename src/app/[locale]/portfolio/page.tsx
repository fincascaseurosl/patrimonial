import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getProjects } from "@/lib/projects";
import type { Project } from "@/lib/projects";
import { serviceKeyMap, serviceSlugs, ogMeta } from "@/lib/site-config";
import {
  RevealOnScroll,
  TextReveal,
  Magnetic,
  SplitText,
} from "@/components/animations";
import { PortfolioMap } from "@/components/PortfolioMap";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "portfolio.page" });
  return {
    title: t("titulo"),
    description: t("intro"),
    openGraph: ogMeta(locale, t("titulo"), t("intro")),
    alternates: {
      canonical: `/${locale}/portfolio`,
      languages: {
        es: "/es/portfolio",
        ca: "/ca/portfolio",
        en: "/en/portfolio",
        "x-default": "/es/portfolio",
      },
    },
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

  const categoryLabels: Record<string, string> = Object.fromEntries(
    serviceSlugs.map((slug) => [slug, t(`servicios.items.${serviceKeyMap[slug]}.nombre`)])
  );

  return (
    <>
      {/* Hero — with background photo */}
      <section className="relative bg-[var(--ink)] text-white pt-40 pb-24 md:pt-56 md:pb-32 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/portfolio/hero-bg.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/65 to-[var(--ink)]/25" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <RevealOnScroll direction="none">
            <p className="text-white/70 text-[11px] font-semibold tracking-[0.32em] uppercase mb-8 flex items-center gap-4">
              <span className="w-8 h-[1px] bg-current" />
              {t("portfolio.page.eyebrow")}
            </p>
          </RevealOnScroll>
          <h1 className="font-display text-white text-[clamp(2.5rem,7vw,6rem)] font-bold leading-[1.02] tracking-[-0.035em] max-w-5xl text-balance mb-12">
            <SplitText as="span" by="word" stagger={0.07} duration={1.0} delay={0.1}>
              {t("portfolio.page.titulo")}
            </SplitText>
          </h1>
        </div>
      </section>

      {/* Map + listing + side panel — all in one client component */}
      <PortfolioMap
        projects={projects}
        locale={locale}
        categoryLabels={categoryLabels}
        strings={{
          intro: t("portfolio.page.intro"),
          mapaInstruccion: t("portfolio.page.mapaInstruccion"),
          listadoEyebrow: t("portfolio.page.listadoEyebrow"),
          listadoTitulo: t("portfolio.page.listadoTitulo"),
          statObras: t("portfolio.page.statObras"),
          statBarrios: t("portfolio.page.statBarrios"),
          statSuperficie: t("portfolio.page.statSuperficie"),
          statAnos: t("portfolio.page.statAnos"),
          fichaBarrio: t("portfolio.page.fichaBarrio"),
          fichaAno: t("portfolio.page.fichaAno"),
          fichaCategoria: t("portfolio.page.fichaCategoria"),
          fichaSuperficie: t("portfolio.page.fichaSuperficie"),
          fichaDuracion: t("portfolio.page.fichaDuracion"),
          fichaDireccion: t("portfolio.page.fichaDireccion"),
          abrirFicha: t("portfolio.page.abrirFicha"),
          cerrarPanel: t("portfolio.page.cerrarPanel"),
        }}
      />

      {/* CTA */}
      <section className="relative py-24 md:py-32 bg-[var(--ink)] text-white overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <TextReveal
            as="h2"
            className="font-display text-white text-3xl md:text-[2.5rem] font-bold leading-[1.1] tracking-[-0.025em] mb-6"
          >
            {t("cta.presupuesto")}
          </TextReveal>
          <RevealOnScroll direction="up" delay={0.1} distance={10}>
            <p className="text-white/55 text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto">
              {t("cta.subtexto")}
            </p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={0.2} distance={10}>
            <Magnetic strength={0.2}>
              <Link
                href="/contacto"
                className="cursor-grow inline-flex items-center justify-center px-10 py-5 bg-[var(--brand-red)] text-white text-[12px] font-semibold tracking-[0.18em] uppercase transition-colors duration-300 hover:bg-[var(--brand-red-deep)]"
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
