import { useTranslations, useMessages } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { serviceSlugs, serviceKeyMap } from "@/lib/site-config";
import {
  RevealOnScroll,
  TextReveal,
  Magnetic,
  SplitText,
  MarqueeText,
} from "@/components/animations";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servicios" });
  return {
    title: t("titulo"),
    description:
      locale === "ca"
        ? "Tots els serveis de construccio, reformes i rehabilitacio a Barcelona. Pressupost sense compromis."
        : locale === "en"
        ? "All our construction, renovation and refurbishment services in Barcelona. No-obligation quote."
        : "Todos los servicios de construccion, reformas y rehabilitacion en Barcelona. Presupuesto sin compromiso.",
    alternates: {
      canonical:
        locale === "ca" ? "/ca/serveis" : locale === "en" ? "/en/services" : "/es/servicios",
      languages: {
        es: "/es/servicios",
        ca: "/ca/serveis",
        en: "/en/services",
        "x-default": "/es/servicios",
      },
    },
  };
}

export default async function ServiciosPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ServiciosContent />;
}

type MarqueeMessages = { servicios: { marqueeServiciosItems: string[] } };

function ServiciosContent() {
  const t = useTranslations();
  const messages = useMessages() as unknown as MarqueeMessages;
  const marqueeItems = messages.servicios.marqueeServiciosItems;

  return (
    <>
      {/* HERO editorial */}
      <section className="relative bg-[var(--paper)] pt-40 pb-24 md:pt-48 md:pb-32 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <RevealOnScroll direction="up" distance={10}>
            <p className="text-[var(--brand-red)] text-[11px] font-semibold tracking-[0.32em] uppercase mb-10">
              {t("servicios.heroEyebrow")}
            </p>
          </RevealOnScroll>

          <h1 className="font-display text-[var(--ink)] text-[clamp(3.5rem,9vw,8rem)] font-medium leading-[0.95] tracking-[-0.035em]">
            <SplitText as="span" by="word" className="block">
              {t("servicios.heroLine1")}
            </SplitText>
            <SplitText as="span" by="word" delay={0.15} className="block italic font-light text-[var(--brand-red)]">
              {t("servicios.heroLine2")}
            </SplitText>
            <SplitText as="span" by="word" delay={0.3} className="block">
              {t("servicios.heroLine3")}
            </SplitText>
          </h1>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-5 md:col-start-7">
              <RevealOnScroll direction="up" delay={0.2} distance={15}>
                <p className="text-[var(--ink-soft)] text-lg md:text-xl leading-[1.55] tracking-[-0.005em]">
                  {t("servicios.subtitulo")}
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={0.3} distance={10}>
                <div className="mt-10 flex items-center gap-4 text-[var(--mute)] text-[11px] tracking-[0.3em] uppercase">
                  <span className="w-12 h-[1px] bg-[var(--brand-red)]" />
                  <span>{t("servicios.heroDisciplines")}</span>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* LISTA editorial */}
      <section className="bg-[var(--paper)] border-t border-[var(--line)]">
        <ul className="max-w-[1400px] mx-auto">
          {serviceSlugs.map((slug, i) => {
            const key = serviceKeyMap[slug];
            const num = String(i + 1).padStart(2, "0");
            return (
              <li
                key={slug}
                className="group border-b border-[var(--line)] hover:bg-[var(--ink)] transition-colors duration-500"
              >
                <Link
                  href={{ pathname: "/servicios/[slug]", params: { slug } }}
                  className="cursor-grow block px-6 md:px-10 py-10 md:py-14"
                >
                  <div className="grid grid-cols-12 gap-6 items-center">
                    <div className="col-span-2 md:col-span-1">
                      <span className="font-display text-[var(--mute-soft)] group-hover:text-[var(--brand-red)] text-2xl md:text-3xl font-light tabular-nums transition-colors duration-500">
                        {num}
                      </span>
                    </div>
                    <div className="col-span-10 md:col-span-7">
                      <h2 className="font-display text-[var(--ink)] group-hover:text-[var(--paper)] text-[clamp(1.75rem,4vw,3.25rem)] font-medium tracking-[-0.025em] leading-[1.05] transition-colors duration-500">
                        {t(`servicios.items.${key}.nombre`)}
                      </h2>
                    </div>
                    <div className="hidden md:block col-span-3">
                      <p className="text-[var(--mute)] group-hover:text-[var(--paper)]/60 text-sm leading-[1.55] line-clamp-2 transition-colors duration-500">
                        {t(`servicios.items.${key}.descripcion`)}
                      </p>
                    </div>
                    <div className="col-span-12 md:col-span-1 flex md:justify-end mt-4 md:mt-0">
                      <span
                        aria-hidden
                        className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[var(--line)] group-hover:border-[var(--brand-red)] group-hover:bg-[var(--brand-red)] transition-all duration-500"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          className="w-5 h-5 text-[var(--ink)] group-hover:text-[var(--paper)] -rotate-45 group-hover:rotate-0 transition-all duration-500"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* MANIFIESTO negro */}
      <section className="bg-[var(--ink)] text-[var(--paper)] py-32 md:py-44 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <RevealOnScroll direction="up" distance={10}>
            <p className="text-[var(--brand-red-soft)] text-[11px] font-semibold tracking-[0.32em] uppercase mb-10">
              {t("servicios.manifiestoEyebrow")}
            </p>
          </RevealOnScroll>
          <TextReveal
            as="p"
            className="font-display text-[clamp(1.75rem,4.5vw,4rem)] font-light leading-[1.2] tracking-[-0.02em] text-balance max-w-5xl"
          >
            {t("servicios.manifiestoTexto")}
          </TextReveal>
        </div>
        <div className="mt-24">
          <MarqueeText speed={50} className="border-y border-white/10 py-7">
            {marqueeItems.map((w) => (
              <span key={w} className="inline-flex items-center">
                <span className="font-display text-[clamp(2rem,5vw,4.5rem)] font-light tracking-[-0.02em] text-white/30 mx-10">
                  {w}
                </span>
                <span className="font-display text-[clamp(2rem,5vw,4.5rem)] font-light tracking-[-0.02em] text-[var(--brand-red)] mx-2">
                  {"\u00b7"}
                </span>
              </span>
            ))}
          </MarqueeText>
        </div>
      </section>

      {/* CTA rojo */}
      <section className="relative bg-[var(--brand-red)] py-28 md:py-36 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <div className="font-display text-white text-[40rem] leading-none -mt-32 -ml-20 select-none">
            P
          </div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <TextReveal
            as="h2"
            className="font-display text-white text-[clamp(2.25rem,6vw,5rem)] font-medium leading-[1.05] tracking-[-0.03em] mb-12"
          >
            {t("cta.presupuesto")}
          </TextReveal>
          <RevealOnScroll direction="up" delay={0.15} distance={10}>
            <Magnetic strength={0.25}>
              <Link
                href="/contacto"
                className="cursor-grow inline-flex items-center gap-3 px-12 py-5 bg-[var(--ink)] text-white text-[12px] font-semibold tracking-[0.25em] uppercase hover:bg-[var(--paper)] hover:text-[var(--ink)] transition-colors duration-500"
              >
                {t("cta.boton")}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </Magnetic>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}