import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ogMeta } from "@/lib/site-config";
import {
  RevealOnScroll,
  StaggerChildren,
  TextReveal,
  Magnetic,
  ImageReveal,
  ParallaxImage,
  Counter,
  SplitText,
} from "@/components/animations";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sobreNosotros" });

  return {
    title: t("titulo"),
    description: t("descripcion"),
    openGraph: ogMeta(locale, t("titulo"), t("descripcion")),
    alternates: {
      canonical:
        locale === "ca"
          ? "/ca/sobre-nosaltres"
          : locale === "en"
          ? "/en/about-us"
          : "/es/sobre-nosotros",
      languages: {
        es: "/es/sobre-nosotros",
        ca: "/ca/sobre-nosaltres",
        en: "/en/about-us",
        "x-default": "/es/sobre-nosotros",
      },
    },
  };
}

export default async function SobreNosotrosPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SobreNosotrosContent />;
}

function SobreNosotrosContent() {
  const t = useTranslations("sobreNosotros");
  const tr = useTranslations();

  const contenido = t("contenido").split("\n\n");
  const valores = t.raw("valores.items") as string[];

  return (
    <>
      {/* 1 · HERO visual con imagen de fondo */}
      <section className="relative flex min-h-[72vh] items-end overflow-hidden bg-[var(--ink)] pt-40 pb-16 md:pb-24">
        <Image
          src="/images/portfolio/1782386249754-001.jpg"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover select-none pointer-events-none opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/70 to-[var(--ink)]/30" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
          <RevealOnScroll direction="none">
            <p className="text-[var(--brand-red-soft)] text-[11px] font-semibold tracking-[0.32em] uppercase mb-6 flex items-center gap-4">
              <span className="w-8 h-[1px] bg-current" />
              {t("eyebrow")}
            </p>
          </RevealOnScroll>
          <h1 className="font-display text-white text-[clamp(2.5rem,7vw,6rem)] font-bold leading-[1.02] tracking-[-0.035em] max-w-4xl text-balance">
            <SplitText as="span" by="word" stagger={0.08} duration={1.0} delay={0.1}>
              {t("subtitulo")}
            </SplitText>
          </h1>
          <RevealOnScroll direction="up" delay={0.5} distance={15}>
            <p className="mt-8 text-white/75 text-lg md:text-xl leading-relaxed max-w-2xl">
              {t("descripcion")}
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* 2 · CIFRAS */}
      <section className="bg-[var(--ink)] border-t border-white/10 py-16 md:py-20 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10" stagger={0.12}>
            {[
              { n: 20, s: "+", label: t("stats.anos") },
              { n: 480, s: "+", label: t("stats.proyectos") },
              { n: 38, s: "", label: t("stats.profesionales") },
              { n: 100, s: "%", label: t("stats.garantia") },
            ].map((c, i) => (
              <div key={i} className="border-l border-white/15 pl-4 md:pl-6">
                <div className="font-display text-[clamp(1.75rem,4vw,3.25rem)] font-bold leading-none tracking-[-0.04em]">
                  <Counter end={c.n} suffix={c.s} duration={2.2} />
                </div>
                <p className="text-white/55 text-[11px] sm:text-sm mt-3">{c.label}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* 3 · RELATO — imagen + texto */}
      <section className="py-24 md:py-32 bg-[var(--paper)]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <ImageReveal
              src="/images/portfolio/1782386250589-017.jpg"
              alt={t("subtitulo")}
              className="aspect-[4/5] w-full"
              direction="left"
            />
          </div>
          <div className="lg:col-span-7">
            <RevealOnScroll direction="none">
              <p className="text-[var(--brand-red)] text-[11px] font-semibold tracking-[0.32em] uppercase mb-8 flex items-center gap-4">
                <span className="w-8 h-[1px] bg-current" />
                {t("titulo")}
              </p>
            </RevealOnScroll>
            <TextReveal
              as="p"
              className="font-display text-[var(--ink)] text-[clamp(1.5rem,2.6vw,2.25rem)] font-medium leading-[1.3] tracking-[-0.015em] text-balance mb-8"
            >
              {contenido[0]}
            </TextReveal>
            <div className="space-y-6">
              {contenido.slice(1).map((parrafo, i) => (
                <RevealOnScroll key={i} direction="up" delay={i * 0.05} distance={12}>
                  <p className="text-[var(--ink-soft)] text-base md:text-lg leading-relaxed">
                    {parrafo}
                  </p>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4 · VALORES — rejilla visual numerada */}
      <section className="py-24 md:py-32 bg-[var(--bone)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-14 md:mb-16">
            <RevealOnScroll direction="none">
              <p className="text-[var(--brand-red)] text-[11px] font-semibold tracking-[0.32em] uppercase mb-5">
                {t("valores.titulo")}
              </p>
            </RevealOnScroll>
            <TextReveal
              as="h2"
              className="font-display text-[var(--ink)] text-4xl md:text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-balance"
            >
              {t("valores.subtitulo")}
            </TextReveal>
          </div>

          <StaggerChildren
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--line)]"
            stagger={0.08}
          >
            {valores.map((valor, i) => (
              <div
                key={i}
                className="group flex min-h-[220px] flex-col bg-[var(--bone)] p-8 md:p-10 transition-colors duration-500 hover:bg-[var(--paper)]"
              >
                <span className="font-display text-[var(--brand-red)] text-4xl md:text-5xl font-bold leading-none tracking-[-0.04em]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-auto font-display text-[var(--ink)] text-lg md:text-xl font-medium leading-[1.35] tracking-[-0.01em]">
                  {valor}
                </p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* 5 · IMAGEN DE IMPACTO */}
      <section className="relative h-[60vh] min-h-[380px] overflow-hidden bg-[var(--ink)]">
        <ParallaxImage
          src="/images/portfolio/reforma-piso-barcelona-2.jpg"
          alt={t("subtitulo")}
          className="absolute inset-0 w-full h-full"
          intensity={60}
        />
        <div className="absolute inset-0 bg-[var(--ink)]/25" />
      </section>

      {/* 6 · CTA */}
      <section className="relative overflow-hidden bg-[var(--brand-red)] py-28 md:py-40 text-white">
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <TextReveal
            as="h2"
            className="font-display text-white text-[clamp(2rem,6vw,4.5rem)] font-bold leading-[1.0] tracking-[-0.03em] mb-10"
          >
            {tr("cta.presupuesto")}
          </TextReveal>
          <RevealOnScroll direction="up" delay={0.15} distance={10}>
            <Magnetic strength={0.2}>
              <Link
                href="/contacto"
                className="cursor-grow inline-flex items-center justify-center px-10 py-5 bg-white text-[var(--ink)] text-[12px] font-semibold tracking-[0.18em] uppercase transition-colors duration-300 hover:bg-[var(--ink)] hover:text-white"
              >
                {t("contactar")}
              </Link>
            </Magnetic>
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
