import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { projects, projectNames } from "@/lib/site-config";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "portfolio" });

  return {
    title: t("titulo"),
    description:
      locale === "ca"
        ? "Descobreix els nostres projectes de reformes i construcció a Barcelona. Fotografies reals dels nostres treballs."
        : "Descubre nuestros proyectos de reformas y construcción en Barcelona. Fotografías reales de nuestros trabajos.",
    alternates: {
      languages: {
        es: "/es/portfolio",
        ca: "/ca/portfolio",
      },
    },
  };
}

export default async function PortfolioPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PortfolioContent locale={locale} />;
}

function PortfolioContent({ locale }: { locale: string }) {
  const t = useTranslations();

  return (
    <>
      {/* Header */}
      <section className="bg-[var(--color-dark)] text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("portfolio.titulo")}
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            {t("portfolio.subtitulo")}
          </p>
        </div>
      </section>

      {/* Projects grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => {
              const name =
                projectNames[project.slug]?.[
                  locale as "es" | "ca"
                ] || project.slug;
              return (
                <Link
                  key={project.slug}
                  href={{
                    pathname: "/portfolio/[slug]",
                    params: { slug: project.slug },
                  }}
                  className="group overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-shadow bg-white"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-gray-200">
                    <img
                      src={project.images[0]}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                      {t(`servicios.items.${project.category}.nombre`)}
                    </span>
                    <h2 className="text-lg font-bold text-[var(--color-dark)] mt-1 group-hover:text-[var(--color-primary)] transition-colors">
                      {name}
                    </h2>
                    <span className="inline-flex items-center mt-3 text-sm text-gray-500 group-hover:text-[var(--color-primary)] transition-colors">
                      {t("portfolio.verProyecto")} →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-dark)] mb-4">
            {t("cta.presupuesto")}
          </h2>
          <p className="text-gray-600 mb-6">{t("cta.subtexto")}</p>
          <Link
            href="/contacto"
            className="inline-block px-8 py-4 bg-[var(--color-primary)] text-[var(--color-dark)] font-bold rounded-md hover:bg-amber-400 transition-colors"
          >
            {t("cta.boton")}
          </Link>
        </div>
      </section>
    </>
  );
}
