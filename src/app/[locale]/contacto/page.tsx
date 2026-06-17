import { setRequestLocale, getTranslations } from "next-intl/server";
import { siteConfig, getHorario } from "@/lib/site-config";
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
        en: "/en/contact",
        "x-default": "/es/contacto",
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
      {/* Hero */}
      <section className="relative bg-[var(--color-dark)] text-white pt-32 pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[var(--color-primary)] text-[12px] font-semibold tracking-[0.3em] uppercase mb-4">
            {t("titulo")}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-[-0.02em] mb-4 max-w-2xl">
            {t("subtitulo")}
          </h1>
          <div className="w-12 h-[2px] bg-[var(--color-primary)]" />
        </div>
      </section>

      {/* Content */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">
            {/* Form */}
            <div className="lg:col-span-2">
              <ContactForm />
            </div>

            {/* Contact info sidebar */}
            <aside>
              <div className="sticky top-28 space-y-8">
                <div className="bg-[var(--color-gray-light)] p-8">
                  <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-[var(--color-text-muted)] mb-6">
                    {t("info.direccionLabel")}
                  </p>
                  <div className="w-8 h-[1px] bg-[var(--color-primary)] mb-8" />

                  <div className="space-y-7">
                    <div>
                      <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                        {t("info.direccionLabel")}
                      </p>
                      <p className="text-[var(--color-text)] text-sm leading-relaxed">
                        {siteConfig.direccion}
                        <br />
                        {siteConfig.cp} {siteConfig.ciudad}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                        {t("info.telefonoLabel")}
                      </p>
                      <p className="text-[var(--color-text)] text-sm">
                        <a
                          href={siteConfig.telefonoFijoHref}
                          className="hover:text-[var(--color-primary)] transition-colors duration-300"
                        >
                          {siteConfig.telefonoFijo}
                        </a>
                      </p>
                      <p className="text-[var(--color-text)] text-sm mt-1">
                        <a
                          href={siteConfig.telefonoMovilHref}
                          className="hover:text-[var(--color-primary)] transition-colors duration-300"
                        >
                          {siteConfig.telefonoMovil}
                        </a>
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                        {t("info.emailLabel")}
                      </p>
                      <p className="text-[var(--color-text)] text-sm">
                        <a
                          href={`mailto:${siteConfig.email}`}
                          className="hover:text-[var(--color-primary)] transition-colors duration-300"
                        >
                          {siteConfig.email}
                        </a>
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                        {t("info.horarioLabel")}
                      </p>
                      <p className="text-[var(--color-text)] text-sm">{getHorario(locale)}</p>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="overflow-hidden aspect-square bg-[var(--color-gray-light)]">
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
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
