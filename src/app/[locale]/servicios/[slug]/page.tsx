import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { serviceSlugs, serviceKeyMap, serviceIcons, type ServiceSlug } from "@/lib/site-config";
import { notFound } from "next/navigation";
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

  const slugCa: Record<string, string> = {
    reformas: "reformes",
    "obra-nueva": "obra-nova",
    rehabilitacion: "rehabilitacio",
    instalaciones: "instal-lacions",
    amianto: "amiant",
    "trabajos-verticales": "treballs-verticals",
    refuerzos: "reforcos",
    impermeabilizacion: "impermeabilitzacio",
  };

  return {
    title: nombre,
    description: t(`items.${key}.descripcion`),
    alternates: {
      languages: {
        es: `/es/servicios/${slug}`,
        ca: `/ca/serveis/${slugCa[slug] || slug}`,
      },
    },
  };
}

export default async function ServicioDetailPage({ params }: Props) {
  const { locale, slug } = await params;

  if (!serviceSlugs.includes(slug as ServiceSlug)) {
    notFound();
  }

  setRequestLocale(locale);

  return <ServicioContent slug={slug as ServiceSlug} />;
}

function ServicioContent({ slug }: { slug: ServiceSlug }) {
  const t = useTranslations();
  const key = serviceKeyMap[slug];

  const otherServices = serviceSlugs.filter((s) => s !== slug);

  return (
    <>
      {/* Hero */}
      <section className="bg-[var(--color-dark)] text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 flex items-center justify-center bg-[var(--color-primary)] rounded-xl">
              <img src={serviceIcons[slug]} alt="" className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              {t(`servicios.items.${key}.nombre`)}
            </h1>
          </div>
          <nav className="text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">
              {t("nav.inicio")}
            </Link>
            <span className="mx-2">/</span>
            <Link
              href="/servicios"
              className="hover:text-white transition-colors"
            >
              {t("nav.servicios")}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--color-primary)]">
              {t(`servicios.items.${key}.nombre`)}
            </span>
          </nav>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2">
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                {t(`servicios.items.${key}.descripcionLarga`)}
              </p>

              {/* CTA inline */}
              <div className="bg-gray-50 rounded-xl p-8">
                <h2 className="text-xl font-bold text-[var(--color-dark)] mb-3">
                  {t("cta.presupuesto")}
                </h2>
                <p className="text-gray-600 mb-6">
                  {t("cta.subtexto")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/contacto"
                    className="inline-flex items-center justify-center px-6 py-3 bg-[var(--color-primary)] text-[var(--color-dark)] font-bold rounded-md hover:bg-amber-400 transition-colors"
                  >
                    {t("cta.boton")}
                  </Link>
                  <a
                    href="tel:+34935316431"
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-[var(--color-dark)] text-[var(--color-dark)] font-bold rounded-md hover:bg-[var(--color-dark)] hover:text-white transition-colors"
                  >
                    📞 93 531 64 31
                  </a>
                </div>
              </div>
            </div>

            {/* Sidebar - other services */}
            <aside>
              <h3 className="text-lg font-bold text-[var(--color-dark)] mb-4 pb-2 border-b-2 border-[var(--color-primary)]">
                {t("servicios.titulo")}
              </h3>
              <ul className="space-y-1">
                {otherServices.map((s) => {
                  const sKey = serviceKeyMap[s];
                  return (
                    <li key={s}>
                      <Link
                        href={{
                          pathname: "/servicios/[slug]",
                          params: { slug: s },
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-[var(--color-dark)] transition-colors"
                      >
                        <img
                          src={serviceIcons[s]}
                          alt=""
                          className="w-5 h-5 opacity-60"
                        />
                        {t(`servicios.items.${sKey}.nombre`)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
