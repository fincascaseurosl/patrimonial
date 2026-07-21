import { useTranslations, useMessages } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { serviceKeyMap, serviceSlugs } from "@/lib/site-config";
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
import { ServiceMethod, type MethodService } from "@/components/ServiceMethod";
import { getFaqSchema } from "@/lib/schema";

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
  const featuredProjects = projects.filter((p) => p.featured);
  const messages = useMessages() as unknown as {
    home: {
      cifras: Cifra[];
      proceso: Paso[];
      faq: FAQ[];
      marqueeItems: string[];
      certItems: string[];
    };
    servicios: {
      items: Record<string, { fases: { n: string; titulo: string; descripcion: string }[] }>;
    };
  };

  const cifras = messages.home.cifras;
  const faqItems = messages.home.faq;
  const marqueeItems = messages.home.marqueeItems;
  const certItems = messages.home.certItems;
  const mainServices = ["reformas", "obra-nueva", "rehabilitacion"] as const;
  const categoryLabels: Record<string, string> = Object.fromEntries(
    serviceSlugs.map((slug) => [slug, t(`servicios.items.${serviceKeyMap[slug]}.nombre`)])
  );

  // Imagen representativa de cada servicio: primero una foto real de un proyecto
  // de esa categoría; si no hay, una imagen de reserva.
  const serviceImageFallback: Record<string, string> = {
    reformas: "/images/portfolio/reforma-piso-barcelona-1.jpg",
    "obra-nueva": "/images/hero/construye-tu-casa-poster.jpg",
    rehabilitacion: "/images/portfolio/reforma-piso-barcelona-3.jpg",
  };
  const imageForService = (slug: string): string => {
    const proj = projects.find((p) => p.category === slug && p.images[0]);
    return proj?.images[0] ?? serviceImageFallback[slug] ?? "/images/hero/hero.jpg";
  };

  // Método por servicio: cada servicio muestra sus propias fases.
  const methodServices: MethodService[] = serviceSlugs.map((slug) => ({
    slug,
    nombre: t(`servicios.items.${serviceKeyMap[slug]}.nombre`),
    fases: messages.servicios.items[serviceKeyMap[slug]].fases,
  }));

  return (
    <>
      {/* 1 · HERO — composición centrada */}
      <section className="relative h-screen min-h-[680px] flex flex-col justify-center items-center text-center overflow-hidden bg-[var(--ink)]">
        <HeroVideo poster="/images/hero/home-hero.jpg" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6">
          <RevealOnScroll direction="none" duration={0.8}>
            <p className="text-white/70 text-[11px] font-semibold tracking-[0.32em] uppercase mb-8">
              {t("home.heroEyebrow")}
            </p>
          </RevealOnScroll>

          <h1 className="font-display text-white text-[clamp(2.5rem,8vw,7rem)] font-bold leading-[1.0] tracking-[-0.035em]">
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

          <RevealOnScroll direction="up" delay={0.7} distance={20}>
            <p className="mx-auto mt-10 max-w-2xl text-white/75 text-base md:text-lg leading-relaxed">
              {t("home.heroSub")}
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={0.85} distance={15}>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
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

        <div className="absolute bottom-6 left-6 right-6 z-10 flex items-end justify-between text-white/50 text-[10px] font-medium tracking-[0.32em] uppercase">
          <span>{t("home.heroScroll")}</span>
          <span>BCN · 41.40°N · 2.17°E</span>
        </div>
      </section>

      {/* 2 · MARQUEE SERVICIOS */}
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

      {/* 3 · MANIFIESTO */}
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

      {/* 4 · CIFRAS */}
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

      {/* 5 · SERVICIOS DESTACADOS */}
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

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 md:auto-rows-[330px] gap-4" stagger={0.1}>
            {mainServices.map((slug, i) => {
              const key = serviceKeyMap[slug];
              const big = i === 0;
              return (
                <Link
                  key={slug}
                  href={{ pathname: "/servicios/[slug]", params: { slug } }}
                  className={`cursor-grow group relative block overflow-hidden bg-[var(--ink)] ${
                    big
                      ? "md:col-span-2 md:row-span-2 min-h-[520px] md:min-h-0"
                      : "min-h-[340px] md:min-h-0"
                  }`}
                >
                  <Image
                    src={imageForService(slug)}
                    alt={t(`servicios.items.${key}.nombre`)}
                    fill
                    sizes={big ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                    className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/45 to-[var(--ink)]/5" />
                  <div className="absolute inset-0 bg-[var(--brand-red)]/0 group-hover:bg-[var(--brand-red)]/15 transition-colors duration-500" />

                  <div className="relative z-10 flex h-full flex-col p-8 md:p-10">
                    <span className="font-display text-white/60 text-[11px] font-semibold tracking-[0.32em] uppercase">
                      0{i + 1}
                    </span>
                    <div className="mt-auto">
                      <h3
                        className={`font-display text-white font-bold leading-[1.03] tracking-[-0.025em] ${
                          big ? "text-4xl md:text-6xl" : "text-2xl md:text-3xl"
                        }`}
                      >
                        {t(`servicios.items.${key}.nombre`)}
                      </h3>
                      <p
                        className={`mt-4 text-white/80 leading-relaxed ${
                          big ? "text-base md:text-lg max-w-xl" : "text-sm max-w-xs"
                        }`}
                      >
                        {t(`home.serviciosCards.${key}`)}
                      </p>
                      <div className="mt-6 inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--brand-red-soft)] group-hover:text-white transition-colors duration-300">
                        <span>{t("portfolio.verMas")}</span>
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* 5.5 · CONSTRUYE TU CASA — bloque cinematográfico */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-[var(--ink)]">
        <Image
          src="/images/hero/construye-tu-casa-poster.jpg"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover select-none pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--ink)] via-[var(--ink)]/75 to-[var(--ink)]/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/70 via-transparent to-transparent" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <RevealOnScroll direction="none">
              <p className="text-[var(--brand-red-soft)] text-[11px] font-semibold tracking-[0.32em] uppercase mb-7 flex items-center gap-4">
                <span className="w-8 h-[1px] bg-current" />
                {t("home.casaHomeEyebrow")}
              </p>
            </RevealOnScroll>
            <TextReveal
              as="h2"
              className="font-display text-white text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.02] tracking-[-0.035em] text-balance"
            >
              {t("casa.heroTitulo")}
            </TextReveal>
            <RevealOnScroll direction="up" delay={0.2} distance={15}>
              <p className="mt-8 text-white/75 text-base md:text-lg leading-relaxed max-w-xl">
                {t("casa.heroSub")}
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={0.35} distance={10}>
              <div className="mt-10">
                <Magnetic strength={0.18}>
                  <Link
                    href="/construir-casa-a-medida"
                    className="cursor-grow inline-flex items-center gap-3 px-9 py-5 bg-white text-[var(--ink)] text-[12px] font-semibold tracking-[0.18em] uppercase transition-colors duration-300 hover:bg-[var(--brand-red)] hover:text-white"
                  >
                    <span>{t("home.casaHomeBoton")}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </Magnetic>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* 6 · PROCESO — método interactivo que cambia según el servicio elegido */}
      <ServiceMethod
        eyebrow={t("home.procesoEyebrow")}
        titulo={t("home.procesoTitulo")}
        intro={t("home.procesoIntro")}
        services={methodServices}
        verServicio={t("home.procesoVerServicio")}
      />

      {/* 7 · PORTFOLIO — pinned horizontal cinematic */}
      {featuredProjects.length > 0 && (
        <PortfolioPinned
          projects={featuredProjects}
          locale={locale}
          eyebrow={t("home.portfolioEyebrow")}
          titulo={t("home.portfolioTitulo")}
          verTodos={t("portfolio.verTodos")}
          verMas={t("portfolio.verMas")}
          desplaza={t("home.portfolioDesplaza")}
          finalLabel={t("home.portfolioFinalLabel")}
          finalTitulo={t("home.portfolioFinalTitulo")}
          categoryLabels={categoryLabels}
        />
      )}

      {/* 8 · CERTIFICACIONES */}
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

      {/* 9 · MAPA */}
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

      {/* 10 · TESTIMONIO */}
      <section className="py-32 md:py-44 bg-[var(--ink)] text-white">
        <div className="max-w-6xl mx-auto px-6">
          <RevealOnScroll direction="none">
            <p className="text-white/40 text-[11px] font-semibold tracking-[0.32em] uppercase mb-12 flex items-center gap-4">
              <span className="w-8 h-[1px] bg-white/40" />
              {t("home.testimonioEyebrow")}
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

      {/* 11 · FAQ */}
      <section className="py-24 md:py-36 bg-[var(--paper)]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getFaqSchema(faqItems)) }}
        />
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

      {/* 12 · CTA FINAL */}
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
    <div className="relative aspect-[3/2] w-full scale-[1.15] origin-center">
      <Image
        src="/images/catalunya-map.png"
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 600px"
        className="object-contain select-none pointer-events-none"
        draggable={false}
      />
    </div>
  );
}
