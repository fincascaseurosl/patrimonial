import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { serviceSlugs, serviceKeyMap, serviceIcons, projects, projectNames } from "@/lib/site-config";
import type { Locale } from "@/i18n/routing";
import Image from "next/image";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeContent locale={locale as Locale} />;
}

function HomeContent({ locale }: { locale: Locale }) {
  const t = useTranslations();

  const mainServices = ["reformas", "obra-nueva", "rehabilitacion"] as const;

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-[var(--color-dark)] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-dark)] to-transparent z-10" />
        <div className="relative z-20 max-w-7xl mx-auto px-4 py-24 md:py-32 lg:py-40">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t("hero.titulo")}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              {t("hero.subtitulo")}
            </p>
            <Link
              href="/contacto"
              className="inline-block px-8 py-4 bg-[var(--color-primary)] text-[var(--color-dark)] font-bold text-lg rounded-md hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              {t("hero.cta")}
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-dark)] mb-4">
              {t("servicios.titulo")}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t("servicios.subtitulo")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mainServices.map((slug) => {
              const key = serviceKeyMap[slug];
              return (
                <Link
                  key={slug}
                  href={{ pathname: "/servicios/[slug]", params: { slug } }}
                  className="group p-8 rounded-xl border border-gray-100 hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-16 h-16 mb-6 flex items-center justify-center bg-amber-50 rounded-lg group-hover:bg-[var(--color-primary)] transition-colors">
                    <img
                      src={serviceIcons[slug]}
                      alt=""
                      className="w-8 h-8"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-dark)] mb-3 group-hover:text-[var(--color-primary)] transition-colors">
                    {t(`servicios.items.${key}.nombre`)}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {t(`servicios.items.${key}.descripcion`)}
                  </p>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/servicios"
              className="inline-block px-6 py-3 border-2 border-[var(--color-primary)] text-[var(--color-dark)] font-semibold rounded-md hover:bg-[var(--color-primary)] transition-colors"
            >
              {t("servicios.verTodos")}
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-[var(--color-gray-light)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-dark)] mb-4">
              {t("porqueElegirnos.titulo")}
            </h2>
            <p className="text-gray-600">{t("porqueElegirnos.subtitulo")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {(["experiencia", "financiacion", "subvencion", "garantia"] as const).map((item) => (
              <div key={item} className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-[var(--color-primary)] rounded-full">
                  <span className="text-2xl font-bold text-[var(--color-dark)]">
                    {item === "experiencia" && "25+"}
                    {item === "financiacion" && "0%"}
                    {item === "subvencion" && "€"}
                    {item === "garantia" && "✓"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-dark)] mb-2">
                  {t(`porqueElegirnos.items.${item}.titulo`)}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t(`porqueElegirnos.items.${item}.texto`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[var(--color-dark)] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t("cta.titulo")}
          </h2>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            {t("cta.texto")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contacto"
              className="px-8 py-4 bg-[var(--color-primary)] text-[var(--color-dark)] font-bold rounded-md hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              {t("cta.boton")}
            </Link>
            <Link
              href="/servicios"
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-md hover:bg-white hover:text-[var(--color-dark)] transition-colors"
            >
              {t("servicios.verTodos")}
            </Link>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-dark)] mb-4">
              {t("portfolio.titulo")}
            </h2>
            <p className="text-gray-600">{t("portfolio.subtitulo")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.map((project) => {
              const name = projectNames[project.slug]?.[locale] ?? project.slug;
              return (
                <Link
                  key={project.slug}
                  href={{ pathname: "/portfolio/[slug]", params: { slug: project.slug } }}
                  className="group relative overflow-hidden rounded-xl aspect-[4/3] bg-gray-200"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10 opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <h3 className="text-white text-lg font-bold mb-1">{name}</h3>
                    <span className="text-[var(--color-primary)] text-sm font-medium">
                      {t("portfolio.verMas")} →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/portfolio"
              className="inline-block px-6 py-3 border-2 border-[var(--color-primary)] text-[var(--color-dark)] font-semibold rounded-md hover:bg-[var(--color-primary)] transition-colors"
            >
              {t("portfolio.verTodos")}
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-[var(--color-gray-light)]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-10">
            {t("testimonios.titulo")}
          </h2>
          <blockquote className="text-xl text-gray-700 italic leading-relaxed mb-6">
            &ldquo;{t("testimonios.items.0.texto")}&rdquo;
          </blockquote>
          <p className="text-[var(--color-primary)] font-bold">
            — {t("testimonios.items.0.autor")}
          </p>
        </div>
      </section>

      {/* Final CTA */}
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
