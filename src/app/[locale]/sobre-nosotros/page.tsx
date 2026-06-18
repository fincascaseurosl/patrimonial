import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { siteConfig, ogMeta } from "@/lib/site-config";
import {
  RevealOnScroll,
  StaggerChildren,
  TextReveal,
  Magnetic,
  ImageReveal,
  Counter,
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

  const contenido = t("contenido").split("\n\n");

  return (
    <>
      {/* Hero */}
      <section className="relative bg-[var(--color-dark)] text-white pt-32 pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <RevealOnScroll direction="none">
            <p className="text-[var(--color-primary)] text-[12px] font-semibold tracking-[0.3em] uppercase mb-4">
              {t("titulo")}
            </p>
          </RevealOnScroll>
          <TextReveal
            as="h1"
            className="text-white text-4xl md:text-5xl font-bold leading-[1.1] tracking-[-0.02em] mb-4 max-w-2xl"
          >
            {t("subtitulo")}
          </TextReveal>
          <RevealOnScroll direction="up" delay={0.2} distance={10}>
            <div className="w-12 h-[2px] bg-[var(--color-primary)]" />
          </RevealOnScroll>
        </div>
      </section>

      {/* Image + intro */}
      <section className="bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <ImageReveal
            src="/images/hero/hero.jpg"
            alt={t("subtitulo")}
            className="aspect-[4/3] lg:aspect-auto lg:min-h-[500px]"
            direction="left"
          />
          <div className="flex items-center py-16 md:py-24 px-6 md:px-16 lg:px-20">
            <div>
              <RevealOnScroll direction="up" distance={20}>
                <p className="text-lg text-[var(--color-text)] leading-[1.8] font-medium mb-8">
                  {t("descripcion")}
                </p>
              </RevealOnScroll>

              {/* Quick stats */}
              <StaggerChildren className="grid grid-cols-3 gap-6 pt-8 border-t border-[var(--color-border)]" stagger={0.1}>
                <div>
                  <div className="text-[var(--color-dark)] text-2xl font-bold mb-1">
                    <Counter end={25} suffix="+" />
                  </div>
                  <p className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider">{t("stats.anos")}</p>
                </div>
                <div>
                  <div className="text-[var(--color-dark)] text-2xl font-bold mb-1">
                    <Counter end={480} suffix="+" />
                  </div>
                  <p className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider">{t("stats.proyectos")}</p>
                </div>
                <div>
                  <div className="text-[var(--color-dark)] text-2xl font-bold mb-1">100%</div>
                  <p className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider">{t("stats.garantia")}</p>
                </div>
              </StaggerChildren>
            </div>
          </div>
        </div>
      </section>

      {/* Content + Values */}
      <section className="py-20 md:py-28 bg-[var(--color-gray-light)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">
            {/* Main */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {contenido.map((parrafo, i) => (
                  <RevealOnScroll key={i} direction="up" delay={i * 0.05} distance={15}>
                    <p className="text-[var(--color-text)] leading-[1.8]">
                      {parrafo}
                    </p>
                  </RevealOnScroll>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside>
              <RevealOnScroll direction="right" distance={20}>
                <div className="sticky top-28">
                  <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-[var(--color-text-muted)] mb-5">
                    {t("valores.titulo")}
                  </p>
                  <div className="w-8 h-[1px] bg-[var(--color-primary)] mb-8" />
                  <ul className="space-y-5">
                    {(t.raw("valores.items") as string[]).map((valor, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full" />
                        <span className="text-[var(--color-text)] text-sm leading-relaxed">
                          {valor}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Contact card */}
                  <div className="mt-10 bg-[var(--color-dark)] text-white p-8">
                    <h3 className="font-semibold text-sm tracking-wider uppercase mb-5">
                      {siteConfig.nombre}
                    </h3>
                    <div className="space-y-3 text-sm text-white/50">
                      <p>{siteConfig.direccion}, {siteConfig.cp} {siteConfig.ciudad}</p>
                      <p>
                        <a href={siteConfig.telefonoFijoHref} className="hover:text-white transition-colors duration-300">
                          {siteConfig.telefonoFijo}
                        </a>
                      </p>
                      <p>
                        <a href={`mailto:${siteConfig.email}`} className="hover:text-white transition-colors duration-300">
                          {siteConfig.email}
                        </a>
                      </p>
                    </div>
                    <Magnetic strength={0.15}>
                      <Link
                        href="/contacto"
                        className="inline-flex items-center justify-center mt-7 px-6 py-3 bg-[var(--color-accent)] text-white text-[12px] font-semibold tracking-wider uppercase transition-all duration-300 hover:bg-[var(--color-accent-hover)] btn-press"
                      >
                        {t("contactar")}
                      </Link>
                    </Magnetic>
                  </div>
                </div>
              </RevealOnScroll>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
