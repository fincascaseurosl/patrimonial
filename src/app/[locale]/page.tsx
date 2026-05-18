import { useTranslations, useMessages } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { serviceKeyMap } from "@/lib/site-config";
import { getProjects } from "@/lib/projects";
import type { Project } from "@/lib/projects";
import type { Locale } from "@/i18n/routing";
import {
  RevealOnScroll,
  StaggerChildren,
  TextReveal,
  Counter,
  Magnetic,
  MarqueeText,
  SplitText,
} from "@/components/animations";
import { HomeFAQ } from "@/components/HomeFAQ";
import { HeroVideo } from "@/components/HeroVideo";
import { PortfolioPinned } from "@/components/PortfolioPinned";

type Props = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 60;

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const projects = await getProjects();
  const sorted = [...projects].sort((a, b) => a.order - b.order);
  return <HomeContent locale={locale as Locale} projects={sorted} />;
}

type Cifra = { num: number; suffix: string; label: string };
type Paso = { num: string; titulo: string; texto: string };
type FAQ = { q: string; a: string };

function HomeContent({ locale, projects }: { locale: Locale; projects: Project[] }) {
  const t = useTranslations();
  const messages = useMessages() as unknown as {
    home: {
      cifras: Cifra[];
      proceso: Paso[];
      faq: FAQ[];
      marqueeItems: string[];
      certItems: string[];
    };
  };

  const cifras = messages.home.cifras;
  const procesoPasos = messages.home.proceso;
  const faqItems = messages.home.faq;
  const marqueeItems = messages.home.marqueeItems;
  const certItems = messages.home.certItems;
  const mainServices = ["reformas", "obra-nueva", "rehabilitacion"] as const;

  return (
    <>
      {/* 1 Â· HERO */}
      <section className="relative h-screen min-h-[680px] flex flex-col justify-end overflow-hidden bg-[var(--ink)]">
        <HeroVideo poster="/images/hero/hero.jpg" />

        <div className="absolute top-28 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-6">
            <RevealOnScroll direction="none" duration={0.8}>
              <p className="text-white/70 text-[11px] font-semibold tracking-[0.32em] uppercase">
                {t("home.heroEyebrow")}
              </p>
            </RevealOnScroll>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-28 md:pb-36">
          <h1 className="font-display text-white text-[clamp(3rem,10vw,9rem)] font-bold leading-[1.02] tracking-[-0.035em] mb-10">
            <SplitText as="span" className="block" by="word" stagger={0.08} duration={1.0} delay={0.1}>
              {t("home.heroLine1")}
            </SplitText>
            <SplitText as="span" className="block italic font-medium" by="word" stagger={0.08} duration={1.0} delay={0.25}>
              {t("home.heroLine2")}
            </SplitText>
            <SplitText as="span" className="block" by="word" stagger={0.08} duration={1.0} delay={0.4}>
              {t("home.heroLine3")}
            </SplitText>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <RevealOnScroll direction="up" delay={0.7} distance={20} className="md:col-span-6 lg:col-span-5">
              <p className="text-white/75 text-base md:text-lg leading-relaxed">{t("home.heroSub")}</p>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={0.85} distance={15} className="md:col-span-6 lg:col-span-7 md:flex md:justify-end gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Magnetic strength={0.18}>
                  <Link
                    href="/contacto"
                    className="cursor-grow inline-flex items-center justify-center px-9 py-5 bg-[var(--brand-red)] text-white text-[12px] font-semibold tracking-[0.18em] uppercase transition-colors duration-300 hover:bg-[var(--brand-red-deep)]"
                  >
                    {t("hero.cta")}
                  </Link>
                </Magnetic>
                <Magnetic strength={0.15}>
                  <Link
                    href="/portfolio"
                    className="cursor-grow inline-flex items-center justify-center px-9 py-5 border border-white/30 text-white text-[12px] font-medium tracking-[0.18em] uppercase transition-all duration-300 hover:border-white hover:bg-white/5"
                  >
                    {t("portfolio.verTodos")}
                  </Link>
                </Magnetic>
              </div>
            </RevealOnScroll>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6 z-10 flex items-end justify-between text-white/50 text-[10px] font-medium tracking-[0.32em] uppercase">
          <span>{t("home.heroScroll")}</span>
          <span>BCN Â· 41.40Â°N Â· 2.17Â°E</span>
        </div>
      </section>

      {/* 2 Â· MARQUEE SERVICIOS */}
      <section className="bg-[var(--ink)] border-t border-white/10 py-6">
        <MarqueeText speed={45}>
          {marqueeItems.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-10 px-10 font-display text-white text-2xl md:text-3xl font-semibold uppercase tracking-tight">
              {item}
              <span className="w-2 h-2 bg-[var(--brand-red)] inline-block" />
            </span>
          ))}
        </MarqueeText>
      </section>

      {/* 3 Â· MANIFIESTO */}
      <section className="py-32 md:py-44 bg-[var(--paper)]">
        <div className="max-w-6xl mx-auto px-6">
          <RevealOnScroll direction="none">
            <p className="text-[var(--mute)] text-[11px] font-semibold tracking-[0.32em] uppercase mb-12 flex items-center gap-4">
              <span className="w-8 h-[1px] bg-[var(--mute)]" />
              {t("home.manifiestoEyebrow")}
            </p>
          </RevealOnScroll>
          <TextReveal as="p" className="font-display text-[var(--ink)] text-[clamp(1.75rem,4.2vw,3.75rem)] font-medium leading-[1.15] tracking-[-0.02em] text-balance">
            {t("home.manifiestoText")}
          </TextReveal>
        </div>
      </section>

      {/* 4 Â· CIFRAS */}
      <section className="py-24 md:py-32 bg-[var(--ink)] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <RevealOnScroll direction="none">
            <p className="text-white/40 text-[11px] font-semibold tracking-[0.32em] uppercase mb-14">
              {t("home.cifrasEyebrow")}
            </p>
          </RevealOnScroll>

          <StaggerChildren className="grid grid-cols-4 gap-x-3 sm:gap-x-6 md:gap-x-8" stagger={0.12}>
            {cifras.map((c, i) => (
              <div key={i} className="border-l border-white/15 pl-2 sm:pl-4 md:pl-6">
                <div className="font-display text-[clamp(1.25rem,3.6vw,3.25rem)] font-bold leading-none tracking-[-0.04em] text-white whitespace-nowrap">
                  <Counter end={c.num} suffix={c.suffix} duration={2.4} />
                </div>
                <p className="text-white/55 text-[11px] sm:text-sm mt-3 sm:mt-4 max-w-[180px] leading-snug">{c.label}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* 5 Â· SERVICIOS DESTACADOS */}
      <section className="py-24 md:py-36 bg-[var(--paper)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 md:mb-20 gap-8">
            <div className="max-w-xl">
              <RevealOnScroll direction="none">
                <p className="text-[var(--brand-red)] text-[11px] font-semibold tracking-[0.32em] uppercase mb-5">
                  {t("home.serviciosEyebrow")}
                </p>
              </RevealOnScroll>
              <TextReveal as="h2" className="font-display text-[var(--ink)] text-4xl md:text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-balance">
                {t("home.serviciosTitulo")}
              </TextReveal>
            </div>
            <RevealOnScroll direction="right" delay={0.2}>
              <Link
                href="/servicios"
                className="cursor-grow inline-flex items-center gap-3 text-[12px] font-semibold tracking-[0.18em] uppercase text-[var(--ink)] hover:text-[var(--brand-red)] transition-colors duration-300 group"
              >
                <span>{t("servicios.verTodos")}</span>
                <span className="w-9 h-[1px] bg-current transition-all duration-300 group-hover:w-12" />
              </Link>
            </RevealOnScroll>
          </div>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--line)]" stagger={0.1}>
            {mainServices.map((slug, i) => {
              const key = serviceKeyMap[slug];
              return (
                <Link
                  key={slug}
                  href={{ pathname: "/servicios/[slug]", params: { slug } }}
                  className="cursor-grow group relative bg-[var(--paper)] p-10 md:p-12 transition-colors duration-500 hover:bg-[var(--ink)] flex flex-col min-h-[420px]"
                >
                  <span className="font-display text-[var(--mute-soft)] group-hover:text-[var(--brand-red)] text-[11px] font-semibold tracking-[0.32em] uppercase transition-colors duration-500">
                    0{i + 1}
                  </span>

                  <h3 className="mt-auto font-display text-[var(--ink)] group-hover:text-white text-3xl md:text-4xl font-bold leading-[1.05] tracking-[-0.025em] transition-colors duration-500">
                    {t(`servicios.items.${key}.nombre`)}
                  </h3>
                  <p className="mt-5 text-[var(--ink-soft)] group-hover:text-white/65 text-sm leading-relaxed transition-colors duration-500 max-w-sm">
                    {t(`servicios.items.${key}.descripcion`)}
                  </p>

                  <div className="mt-8 inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--brand-red)] group-hover:text-white">
                    <span>{t("portfolio.verMas")}</span>
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* 6 Â· PROCESO */}
      <section className="py-24 md:py-36 bg-[var(--bone)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-20">
            <RevealOnScroll direction="none">
              <p className="text-[var(--brand-red)] text-[11px] font-semibold tracking-[0.32em] uppercase mb-5">
                {t("home.procesoEyebrow")}
              </p>
            </RevealOnScroll>
            <TextReveal as="h2" className="font-display text-[var(--ink)] text-4xl md:text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-balance">
              {t("home.procesoTitulo")}
            </TextReveal>
          </div>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-px bg-[var(--line)]" stagger={0.08}>
            {procesoPasos.map((paso) => (
              <div key={paso.num} className="bg-[var(--bone)] p-8 md:p-10 flex flex-col min-h-[300px] relative group hover:bg-[var(--paper)] transition-colors duration-500">
                <span className="font-display text-[var(--brand-red)] text-5xl md:text-6xl font-bold tracking-[-0.04em]">
                  {paso.num}
                </span>
                <h3 className="mt-auto font-display text-[var(--ink)] text-xl md:text-2xl font-semibold tracking-[-0.015em]">
                  {paso.titulo}
                </h3>
                <p className="mt-4 text-[var(--ink-soft)] text-sm leading-relaxed">{paso.texto}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* 7 Â· PORTFOLIO — pinned horizontal cinematic */}
      <PortfolioPinned
        projects={projects}
        locale={locale}
        eyebrow={t("home.portfolioEyebrow")}
        titulo={t("home.portfolioTitulo")}
        verTodos={t("portfolio.verTodos")}
        verMas={t("portfolio.verMas")}
      />

      {/* 8 Â· CERTIFICACIONES */}
      <section className="py-16 bg-[var(--bone-deep)] border-y border-[var(--line)]">
        <p className="text-center text-[var(--mute)] text-[11px] font-semibold tracking-[0.32em] uppercase mb-8">
          {t("home.certEyebrow")}
        </p>
        <MarqueeText speed={55} reverse>
          {certItems.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-8 px-8 text-[var(--ink-soft)] text-base md:text-lg font-medium uppercase tracking-[0.15em]">
              {item}
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-red)] inline-block" />
            </span>
          ))}
        </MarqueeText>
      </section>

      {/* 9 Â· MAPA */}
      <section className="py-24 md:py-36 bg-[var(--paper)]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5">
            <RevealOnScroll direction="none">
              <p className="text-[var(--brand-red)] text-[11px] font-semibold tracking-[0.32em] uppercase mb-5">
                {t("home.mapaEyebrow")}
              </p>
            </RevealOnScroll>
            <TextReveal as="h2" className="font-display text-[var(--ink)] text-3xl md:text-4xl font-bold leading-[1.1] tracking-[-0.025em] mb-8">
              {t("home.mapaTitulo")}
            </TextReveal>
            <RevealOnScroll direction="up" delay={0.2}>
              <p className="text-[var(--ink-soft)] text-base md:text-lg leading-relaxed max-w-md">{t("home.mapaTexto")}</p>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={0.35}>
              <ul className="mt-10 grid grid-cols-2 gap-y-3 gap-x-6 max-w-sm">
                {["Barcelonès", "Vallès", "Maresme", "Baix Llobregat", "Tarragona", "Girona", "Lleida", "Penedès"].map((zona) => (
                  <li key={zona} className="flex items-center gap-2 text-[var(--ink)] text-sm">
                    <span className="w-1.5 h-1.5 bg-[var(--brand-red)]" />
                    {zona}
                  </li>
                ))}
              </ul>
            </RevealOnScroll>
          </div>

          <div className="lg:col-span-7">
            <RevealOnScroll direction="left" delay={0.2}>
              <CatalunyaMap />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* 10 Â· TESTIMONIO */}
      <section className="py-32 md:py-44 bg-[var(--ink)] text-white">
        <div className="max-w-6xl mx-auto px-6">
          <RevealOnScroll direction="none">
            <p className="text-white/40 text-[11px] font-semibold tracking-[0.32em] uppercase mb-12 flex items-center gap-4">
              <span className="w-8 h-[1px] bg-white/40" />
              Testimonio
            </p>
          </RevealOnScroll>
          <TextReveal as="p" className="font-display text-white text-[clamp(1.75rem,4vw,3.5rem)] font-medium leading-[1.18] tracking-[-0.02em] text-balance">
            {t("home.testimonioMega")}
          </TextReveal>
          <RevealOnScroll direction="up" delay={0.3}>
            <footer className="mt-12 flex items-center gap-4">
              <span className="w-12 h-[1px] bg-[var(--brand-red)]" />
              <cite className="not-italic text-white/60 text-sm font-medium tracking-[0.15em] uppercase">{t("home.testimonioAutor")}</cite>
            </footer>
          </RevealOnScroll>
        </div>
      </section>

      {/* 11 Â· FAQ */}
      <section className="py-24 md:py-36 bg-[var(--paper)]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-4">
            <RevealOnScroll direction="none">
              <p className="text-[var(--brand-red)] text-[11px] font-semibold tracking-[0.32em] uppercase mb-5">
                {t("home.faqEyebrow")}
              </p>
            </RevealOnScroll>
            <TextReveal as="h2" className="font-display text-[var(--ink)] text-3xl md:text-4xl font-bold leading-[1.1] tracking-[-0.025em]">
              {t("home.faqTitulo")}
            </TextReveal>
          </div>
          <div className="lg:col-span-8">
            <HomeFAQ items={faqItems} />
          </div>
        </div>
      </section>

      {/* 12 Â· CTA FINAL */}
      <section className="relative py-32 md:py-48 bg-[var(--brand-red)] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <RevealOnScroll direction="none">
            <p className="text-white/70 text-[11px] font-semibold tracking-[0.32em] uppercase mb-10">
              {t("home.ctaFinalEyebrow")}
            </p>
          </RevealOnScroll>
          <TextReveal as="h2" className="font-display text-white text-[clamp(2.5rem,8vw,7rem)] font-bold leading-[0.95] tracking-[-0.035em] mb-12 max-w-5xl text-balance">
            {t("home.ctaFinalTitulo")}
          </TextReveal>
          <RevealOnScroll direction="up" delay={0.2}>
            <p className="text-white/80 text-lg md:text-xl leading-relaxed max-w-xl mb-12">{t("home.ctaFinalSub")}</p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={0.35}>
            <div className="flex flex-col sm:flex-row gap-4">
              <Magnetic strength={0.18}>
                <Link
                  href="/contacto"
                  className="cursor-grow inline-flex items-center justify-center px-10 py-5 bg-white text-[var(--ink)] text-[12px] font-semibold tracking-[0.18em] uppercase transition-colors duration-300 hover:bg-[var(--ink)] hover:text-white"
                >
                  {t("home.ctaFinalBoton")}
                </Link>
              </Magnetic>
              <Magnetic strength={0.15}>
                <Link
                  href="/servicios"
                  className="cursor-grow inline-flex items-center justify-center px-10 py-5 border border-white/40 text-white text-[12px] font-medium tracking-[0.18em] uppercase transition-all duration-300 hover:border-white hover:bg-white/5"
                >
                  {t("home.ctaFinalSecundario")}
                </Link>
              </Magnetic>
            </div>
          </RevealOnScroll>
        </div>

        <div
          aria-hidden="true"
          className="absolute -bottom-20 -right-10 font-display font-bold text-white/10 leading-none tracking-[-0.05em] select-none pointer-events-none hidden lg:block"
          style={{ fontSize: "28rem" }}
        >
          P
        </div>
      </section>
    </>
  );
}

function CatalunyaMap() {
  return (
    <div className="relative aspect-[3/2] w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/catalunya-map.png"
        alt="Mapa de Catalunya"
        className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
        draggable={false}
      />
    </div>
  );
}
