import { setRequestLocale, getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/site-config";
import ContactForm from "@/components/ContactForm";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contacto" });

  return {
    title: t("titulo"),
    description: t("subtitulo"),
    alternates: {
      languages: {
        es: "/es/contacto",
        ca: "/ca/contacte",
      },
    },
  };
}

export default async function ContactoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contacto" });

  return (
    <>
      {/* Header */}
      <section className="bg-[var(--color-dark)] text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("titulo")}
          </h1>
          <p className="text-gray-300 text-lg">{t("subtitulo")}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <ContactForm />
            </div>

            {/* Contact info sidebar */}
            <aside className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-8">
                <h2 className="text-lg font-bold text-[var(--color-dark)] mb-6 pb-2 border-b-2 border-[var(--color-primary)]">
                  {t("info.direccionLabel")}
                </h2>
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      {t("info.direccionLabel")}
                    </p>
                    <p className="text-gray-700">
                      {siteConfig.direccion}
                      <br />
                      {siteConfig.cp} {siteConfig.ciudad}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      {t("info.telefonoLabel")}
                    </p>
                    <p className="text-gray-700">
                      <a
                        href={siteConfig.telefonoFijoHref}
                        className="hover:text-[var(--color-primary)] transition-colors"
                      >
                        {siteConfig.telefonoFijo}
                      </a>
                    </p>
                    <p className="text-gray-700">
                      <a
                        href={siteConfig.telefonoMovilHref}
                        className="hover:text-[var(--color-primary)] transition-colors"
                      >
                        {siteConfig.telefonoMovil}
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      {t("info.emailLabel")}
                    </p>
                    <p className="text-gray-700">
                      <a
                        href={`mailto:${siteConfig.email}`}
                        className="hover:text-[var(--color-primary)] transition-colors"
                      >
                        {siteConfig.email}
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      {t("info.horarioLabel")}
                    </p>
                    <p className="text-gray-700">{siteConfig.horario}</p>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="rounded-xl overflow-hidden bg-gray-200 aspect-square">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2993.098!2d2.1717!3d41.4043!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a4a2f3e8e0d0e1%3A0x0!2sC%2F%20de%20Lepant%2C%20286-288%2C%2008013%20Barcelona!5e0!3m2!1ses!2ses!4v1700000000000!5m2!1ses!2ses"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa"
                />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
