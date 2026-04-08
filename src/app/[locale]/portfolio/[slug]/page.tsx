import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { projects, projectNames } from "@/lib/site-config";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};

  const name =
    projectNames[slug]?.[locale as "es" | "ca"] || slug;

  return {
    title: name,
    description:
      locale === "ca"
        ? `Projecte: ${name}. Veure les fotos del treball realitzat a Barcelona.`
        : `Proyecto: ${name}. Ver las fotos del trabajo realizado en Barcelona.`,
    alternates: {
      languages: {
        es: `/es/portfolio/${slug}`,
        ca: `/ca/portfolio/${slug}`,
      },
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  setRequestLocale(locale);

  return <ProjectContent slug={slug} locale={locale} />;
}

function ProjectContent({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}) {
  const t = useTranslations();
  const project = projects.find((p) => p.slug === slug)!;
  const name =
    projectNames[slug]?.[locale as "es" | "ca"] || slug;

  return (
    <>
      {/* Header */}
      <section className="bg-[var(--color-dark)] text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)] mb-2 block">
            {t(`servicios.items.${project.category}.nombre`)}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{name}</h1>
          <nav className="text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">
              {t("nav.inicio")}
            </Link>
            <span className="mx-2">/</span>
            <Link
              href="/portfolio"
              className="hover:text-white transition-colors"
            >
              {t("nav.portfolio")}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--color-primary)]">{name}</span>
          </nav>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.images.map((img, i) => (
              <div
                key={i}
                className={`rounded-xl overflow-hidden bg-gray-200 ${
                  i === 0 && project.images.length > 2
                    ? "md:col-span-2"
                    : ""
                }`}
              >
                <img
                  src={img}
                  alt={`${name} - ${i + 1}`}
                  className="w-full h-auto"
                />
              </div>
            ))}
          </div>

          {/* Back + CTA */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t">
            <Link
              href="/portfolio"
              className="text-gray-600 hover:text-[var(--color-dark)] transition-colors font-medium"
            >
              ← {t("portfolio.volver")}
            </Link>
            <Link
              href="/contacto"
              className="inline-block px-8 py-3 bg-[var(--color-primary)] text-[var(--color-dark)] font-bold rounded-md hover:bg-amber-400 transition-colors"
            >
              {t("cta.boton")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
