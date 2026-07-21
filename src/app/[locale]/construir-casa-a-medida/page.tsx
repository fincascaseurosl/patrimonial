import { useTranslations, useMessages } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { siteConfig, ogMeta, serviceSlugs, serviceKeyMap } from "@/lib/site-config";
import { getServiceSchema, getBreadcrumbSchema, getFaqSchema } from "@/lib/schema";
import { getProjects } from "@/lib/projects";
import type { Project } from "@/lib/projects";
import {
  RevealOnScroll,
  StaggerChildren,
  TextReveal,
  Counter,
  Magnetic,
  HorizontalScroll,
  ParallaxImage,
} from "@/components/animations";
import { ConstruyeCasaHero } from "@/components/ConstruyeCasaHero";
import { CasasGallery, type CasasGalleryStrings } from "@/components/CasasGallery";
import { HomeFAQ } from "@/components/HomeFAQ";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = {
  params: Promise<{ locale: string }>;
};

function casaPath(locale: string): string {
  if (locale === "ca") return "/ca/construir-casa-a-mida";
  if (locale === "en") return "/en/build-a-custom-home";
  return "/es/construir-casa-a-medida";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "casa" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title,
    description,
    openGraph: ogMeta(locale, title, description),
    alternates: {
      canonical: casaPath(locale),
      languages: {
        es: "/es/construir-casa-a-medida",
        ca: "/ca/construir-casa-a-mida",
        en: "/en/build-a-custom-home",
        "x-default": "/es/construir-casa-a-medida",
      },
    },
  };
}

export default async function CasaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const projects = await getProjects();
  const casas = projects
    .filter((p) => p.isCasa)
    .sort((a, b) => a.order - b.order);
  return <CasaContent locale={locale} casas={casas} />;
}

type Fase = { n: string; titulo: string; texto: string };
type Faq = { q: string; a: string };
type CasaMessages = { casa: { proceso: Fase[]; faq: Faq[] } };

const PROCESO_IMAGES = [
  "/images/hero/blueprint.jpg",
  "/images/hero/hero.jpg",
  "/images/portfolio/reforma-piso-barcelona-1.jpg",
  "/images/portfolio/reforma-piso-barcelona-2.jpg",
  "/images/portfolio/reforma-piso-barcelona-3.jpg",
];

function CasaContent({ locale, casas }: { locale: string; casas: Project[] }) {
  const t = useTranslations("casa");
  const tNav = useTranslations("nav");
  const tr = useTranslations();
  const navLabel = t("navLabel");
  const messages = useMessages() as unknown as CasaMessages;
  const proceso = messages.casa.proceso;
  const faq = messages.casa.faq;
  const nombre = t("metaTitle");
  const descripcion = t("metaDescription");

  const categoryLabels: Record<string, string> = Object.fromEntries(
    serviceSlugs.map((slug) => [slug, tr(`servicios.items.${serviceKeyMap[slug]}.nombre`)]),
  );

  const galleryStrings: CasasGalleryStrings = {
    fichaBarrio: tr("portfolio.page.fichaBarrio"),
    fichaAno: tr("portfolio.page.fichaAno"),
    fichaCategoria: tr("portfolio.page.fichaCategoria"),
    fichaSuperficie: tr("portfolio.page.fichaSuperficie"),
    fichaDuracion: tr("portfolio.page.fichaDuracion"),
    fichaDireccion: tr("portfolio.page.fichaDireccion"),
    abrirFicha: tr("portfolio.page.abrirFicha"),
    cerrarPanel: tr("portfolio.page.cerrarPanel"),
    imagenNoDisponible: tr("portfolio.page.imagenNoDisponible"),
    eyebrow: t("galeria.eyebrow"),
    titulo: t("galeria.titulo"),
    subtitulo: t("galeria.subtitulo"),
    verProyecto: tr("portfolio.verProyecto"),
    anterior: t("galeria.anterior"),
    siguiente: t("galeria.siguiente"),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getServiceSchema({
              locale,
              slug: "construir-casa-a-medida",
              name: nombre,
              description: descripcion,
              path: casaPath(locale).replace(`/${locale}/`, ""),
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbSchema([
              { name: tNav("inicio"), url: siteConfig.url },
              { name: navLabel, url: `${siteConfig.url}${casaPath(locale)}` },
            ]),
          ),
        }}
      />

      {/* 1 · HERO — vídeo cinematográfico atado al scroll */}
      <ConstruyeCasaHero />

      {/* 2 · MANIFIESTO */}
      <section className="py-32 md:py-44 bg-[var(--paper)]">
        <div className="max-w-6xl mx-auto px-6">
          <RevealOnScroll direction="none">
            <p className="text-[var(--mute)] text-[11px] font-semibold tracking-[0.32em] uppercase mb-12 flex items-center gap-4">
              <span className="w-8 h-[1px] bg-[var(--mute)]" />
              {t("manifiestoEyebrow")}
            </p>
          </RevealOnScroll>
          <TextReveal as="p" className="font-display text-[var(--ink)] text-[clamp(1.75rem,4.2vw,3.75rem)] font-medium leading-[1.15] tracking-[-0.02em] text-balance">
            {t("manifiestoTexto")}
          </TextReveal>
        </div>
      </section>

      {/* 3 · POR QUÉ CONSTRUIR CON NOSOTROS */}
      <section className="py-24 md:py-36 bg-[var(--bone)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-16 md:mb-20">
            <RevealOnScroll direction="none">
              <p className="text-[var(--brand-red)] text-[11px] font-semibold tracking-[0.32em] uppercase mb-5">
                {t("porqueEyebrow")}
              </p>
            </RevealOnScroll>
            <TextReveal as="h2" className="font-display text-[var(--ink)] text-4xl md:text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-balance">
              {t("porqueTitulo")}
            </TextReveal>
          </div>

          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-12" stagger={0.1}>
            {(t.raw("destacados") as string[]).map((d, i) => (
              <div key={i} className="flex gap-5">
                <span className="font-display text-[var(--brand-red)] text-3xl font-light tabular-nums shrink-0 leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-display text-[var(--ink)] text-xl leading-[1.4] tracking-[-0.01em] mt-0.5">{d}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* 4 · PROCESO — pinned horizontal cinematic */}
      <div className="bg-[var(--ink)]" data-nav-dark>
        <div className="pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-[var(--brand-red-soft)] text-[11px] font-semibold tracking-[0.32em] uppercase mb-5">
              {t("procesoEyebrow")}
            </p>
            <h2 className="font-display text-white text-4xl md:text-5xl font-bold leading-[1.05] tracking-[-0.03em] max-w-2xl text-balance">
              {t("procesoTitulo")}
            </h2>
          </div>
        </div>

        <HorizontalScroll>
          <div className="absolute top-10 right-0 left-0 z-20 pointer-events-none">
            <div className="max-w-7xl mx-auto px-6 flex justify-end">
              <div className="flex items-center gap-3 text-white/40 text-[10px] font-semibold tracking-[0.32em] uppercase">
                <span className="w-8 h-[1px] bg-current" />
                <span>{t("procesoScroll")}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center pl-[6vw] gap-[4vw] pr-[10vw]">
            {proceso.map((fase, i) => (
              <div
                key={fase.n}
                className="relative shrink-0 overflow-hidden bg-[var(--ink)]"
                style={{ width: "62vw", maxWidth: "760px", aspectRatio: "4 / 5" }}
              >
                <Image
                  src={PROCESO_IMAGES[i % PROCESO_IMAGES.length]}
                  alt={fase.titulo}
                  fill
                  sizes="(max-width: 760px) 62vw, 760px"
                  className="object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/40 to-[var(--ink)]/10" />
                <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between">
                  <span className="font-display text-white/25 text-[7rem] md:text-[9rem] font-bold leading-none tracking-[-0.05em]">
                    {fase.n}
                  </span>
                  <div>
                    <h3 className="font-display text-white text-2xl md:text-3xl font-semibold tracking-[-0.02em] mb-3 max-w-sm">
                      {fase.titulo}
                    </h3>
                    <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-sm">{fase.texto}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </HorizontalScroll>
      </div>

      {/* 5 · CASAS CONSTRUIDAS — galería carrusel (proyectos marcados en admin).
             Si aún no hay ninguna casa marcada, cae a una imagen de impacto. */}
      {casas.length > 0 ? (
        <CasasGallery
          projects={casas}
          locale={locale}
          categoryLabels={categoryLabels}
          strings={galleryStrings}
        />
      ) : (
        <section className="relative h-[70vh] min-h-[420px] overflow-hidden bg-[var(--ink)]" data-nav-dark>
          <ParallaxImage
            src="/images/portfolio/reforma-piso-barcelona-3.jpg"
            alt={t("porqueTitulo")}
            className="absolute inset-0 w-full h-full"
            intensity={60}
          />
          <div className="absolute inset-0 bg-[var(--ink)]/25" />
        </section>
      )}

      {/* 6 · CIFRAS */}
      <section className="py-24 md:py-32 bg-[var(--ink)] text-white border-t border-white/10" data-nav-dark>
        <div className="max-w-5xl mx-auto px-6">
          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-12" stagger={0.12}>
            <div className="text-center sm:text-left border-l border-white/15 pl-2 sm:pl-6">
              <div className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-none tracking-[-0.04em] text-white">
                <Counter end={20} suffix="+" duration={2.2} />
              </div>
              <p className="text-white/55 text-sm mt-4">{t("statAnos")}</p>
            </div>
            <div className="text-center sm:text-left border-l border-white/15 pl-2 sm:pl-6">
              <div className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-none tracking-[-0.04em] text-white">
                <Counter end={480} suffix="+" duration={2.2} />
              </div>
              <p className="text-white/55 text-sm mt-4">{t("statProyectos")}</p>
            </div>
            <div className="text-center sm:text-left border-l border-white/15 pl-2 sm:pl-6">
              <div className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-none tracking-[-0.04em] text-white">
                <Counter end={38} duration={2.2} />
              </div>
              <p className="text-white/55 text-sm mt-4">{t("statProfesionales")}</p>
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* 7 · FAQ */}
      <section className="py-24 md:py-36 bg-[var(--paper)]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getFaqSchema(faq)) }}
        />
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-4">
            <RevealOnScroll direction="none">
              <p className="text-[var(--brand-red)] text-[11px] font-semibold tracking-[0.32em] uppercase mb-5">
                {t("faqEyebrow")}
              </p>
            </RevealOnScroll>
            <TextReveal as="h2" className="font-display text-[var(--ink)] text-3xl md:text-4xl font-bold leading-[1.1] tracking-[-0.025em]">
              {t("faqTitulo")}
            </TextReveal>
          </div>
          <div className="lg:col-span-8">
            <HomeFAQ items={faq} />
          </div>
        </div>
      </section>

      {/* 8 · CTA FINAL */}
      <section className="relative py-32 md:py-48 bg-[var(--brand-red)] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <RevealOnScroll direction="none">
            <p className="text-white/70 text-[11px] font-semibold tracking-[0.32em] uppercase mb-10">
              {t("ctaEyebrow")}
            </p>
          </RevealOnScroll>
          <TextReveal as="h2" className="font-display text-white text-[clamp(2.5rem,8vw,7rem)] font-bold leading-[0.95] tracking-[-0.035em] mb-12 max-w-5xl text-balance">
            {t("ctaTitulo")}
          </TextReveal>
          <RevealOnScroll direction="up" delay={0.2}>
            <p className="text-white/80 text-lg md:text-xl leading-relaxed max-w-xl mb-12">{t("ctaSub")}</p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={0.35}>
            <div className="flex flex-col sm:flex-row gap-4">
              <Magnetic strength={0.18}>
                <Link
                  href="/contacto"
                  className="cursor-grow inline-flex items-center justify-center px-10 py-5 bg-white text-[var(--ink)] text-[12px] font-semibold tracking-[0.18em] uppercase transition-colors duration-300 hover:bg-[var(--ink)] hover:text-white"
                >
                  {t("ctaBoton")}
                </Link>
              </Magnetic>
              <Magnetic strength={0.15}>
                <Link
                  href={{ pathname: "/servicios/[slug]", params: { slug: "obra-nueva" } }}
                  className="cursor-grow inline-flex items-center justify-center px-10 py-5 border border-white/40 text-white text-[12px] font-medium tracking-[0.18em] uppercase transition-all duration-300 hover:border-white hover:bg-white/5"
                >
                  {t("ctaSecundario")}
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

