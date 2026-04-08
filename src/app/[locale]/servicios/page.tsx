import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { serviceSlugs, serviceKeyMap, serviceIcons } from "@/lib/site-config";
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
        ? "Tots els serveis de construcció, reformes i rehabilitació a Barcelona. Pressupost sense compromís."
        : "Todos los servicios de construcción, reformas y rehabilitación en Barcelona. Presupuesto sin compromiso.",
    alternates: {
      languages: {
        es: "/es/servicios",
        ca: "/ca/serveis",
      },
    },
  };
}

export default async function ServiciosPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ServiciosContent />;
}

function ServiciosContent() {
  const t = useTranslations();

  return (
    <>
      {/* Page header */}
      <section className="bg-[var(--color-dark)] text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("servicios.titulo")}
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            {t("servicios.subtitulo")}
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceSlugs.map((slug) => {
              const key = serviceKeyMap[slug];
              return (
                <Link
                  key={slug}
                  href={{ pathname: "/servicios/[slug]", params: { slug } }}
                  className="group p-8 rounded-xl border border-gray-100 hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-300 bg-white"
                >
                  <div className="w-14 h-14 mb-5 flex items-center justify-center bg-amber-50 rounded-lg group-hover:bg-[var(--color-primary)] transition-colors">
                    <img src={serviceIcons[slug]} alt="" className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--color-dark)] mb-3 group-hover:text-[var(--color-primary)] transition-colors">
                    {t(`servicios.items.${key}.nombre`)}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {t(`servicios.items.${key}.descripcion`)}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[var(--color-primary)]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-dark)] mb-6">
            {t("cta.presupuesto")}
          </h2>
          <Link
            href="/contacto"
            className="inline-block px-8 py-4 bg-[var(--color-dark)] text-white font-bold rounded-md hover:bg-[var(--color-dark-lighter)] transition-colors"
          >
            {t("cta.boton")}
          </Link>
        </div>
      </section>
    </>
  );
}
