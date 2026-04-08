import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site-config";
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
    alternates: {
      languages: {
        es: "/es/sobre-nosotros",
        ca: "/ca/sobre-nosaltres",
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
      {/* Header */}
      <section className="bg-[var(--color-dark)] text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("titulo")}
          </h1>
          <p className="text-xl text-[var(--color-primary)]">
            {t("subtitulo")}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main */}
            <div className="lg:col-span-2">
              <p className="text-xl text-gray-700 font-medium mb-8 leading-relaxed">
                {t("descripcion")}
              </p>
              <div className="space-y-5">
                {contenido.map((parrafo, i) => (
                  <p
                    key={i}
                    className="text-gray-600 leading-relaxed"
                  >
                    {parrafo}
                  </p>
                ))}
              </div>
            </div>

            {/* Sidebar - valores */}
            <aside>
              <div className="bg-gray-50 rounded-xl p-8">
                <h2 className="text-lg font-bold text-[var(--color-dark)] mb-6 pb-2 border-b-2 border-[var(--color-primary)]">
                  {t("valores.titulo")}
                </h2>
                <ul className="space-y-4">
                  {(
                    t.raw("valores.items") as string[]
                  ).map((valor, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 flex-shrink-0 w-5 h-5 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-xs font-bold text-[var(--color-dark)]">
                        ✓
                      </span>
                      <span className="text-gray-700 text-sm">
                        {valor}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact card */}
              <div className="mt-8 bg-[var(--color-dark)] text-white rounded-xl p-8">
                <h3 className="font-bold text-lg mb-4">
                  {siteConfig.nombre}
                </h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <p>📍 {siteConfig.direccion}, {siteConfig.cp} {siteConfig.ciudad}</p>
                  <p>📞 <a href={siteConfig.telefonoFijoHref} className="hover:text-[var(--color-primary)] transition-colors">{siteConfig.telefonoFijo}</a></p>
                  <p>📧 <a href={`mailto:${siteConfig.email}`} className="hover:text-[var(--color-primary)] transition-colors">{siteConfig.email}</a></p>
                </div>
                <Link
                  href="/contacto"
                  className="inline-block mt-6 px-6 py-3 bg-[var(--color-primary)] text-[var(--color-dark)] font-bold rounded-md hover:bg-amber-400 transition-colors text-sm"
                >
                  Contactar
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
