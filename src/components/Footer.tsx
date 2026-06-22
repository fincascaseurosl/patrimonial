import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig, serviceSlugs, serviceKeyMap, getHorario } from "@/lib/site-config";
import { Logo } from "./Logo";

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <footer className="bg-[var(--color-dark)] text-white/40">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">
          {/* Company */}
          <div>
            <div className="mb-6">
              <Logo variant="light" />
            </div>
            <p className="text-sm leading-relaxed mb-6">
              {t("footer.descripcion")}
            </p>
            <div className="flex gap-4 mt-6">
              {/* Insignias de financiación oficiales: se muestran tal cual, sin optimizar. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo/eu.png"
                alt={t("footer.financiadoUE")}
                className="h-8 object-contain opacity-50"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo/prtr.png"
                alt={t("footer.prtr")}
                className="h-8 object-contain opacity-50"
              />
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-6">
              {t("footer.menu")}
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors duration-300">
                  {t("nav.inicio")}
                </Link>
              </li>
              <li>
                <Link href="/sobre-nosotros" className="hover:text-white transition-colors duration-300">
                  {t("nav.sobreNosotros")}
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-white transition-colors duration-300">
                  {t("nav.portfolio")}
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-white transition-colors duration-300">
                  {t("nav.contacto")}
                </Link>
              </li>
              <li>
                <Link href="/politica-de-privacidad" className="hover:text-white transition-colors duration-300">
                  {t("footer.privacidad")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-6">
              {t("footer.serviciosTitle")}
            </p>
            <ul className="space-y-3 text-sm">
              {serviceSlugs.map((slug) => {
                const key = serviceKeyMap[slug];
                return (
                  <li key={slug}>
                    <Link
                      href={{ pathname: "/servicios/[slug]", params: { slug } }}
                      className="hover:text-white transition-colors duration-300"
                    >
                      {t(`servicios.items.${key}.nombre`)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-6">
              {t("footer.contactoTitle")}
            </p>
            <ul className="space-y-4 text-sm">
              <li>
                <span>{siteConfig.direccion}</span>
                <br />
                <span>{siteConfig.cp} {siteConfig.ciudad}</span>
              </li>
              <li>
                <a href={siteConfig.telefonoFijoHref} className="hover:text-white transition-colors duration-300">
                  {siteConfig.telefonoFijo}
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email}`} className="hover:text-white transition-colors duration-300">
                  {siteConfig.email}
                </a>
              </li>
              <li>{getHorario(locale)}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom line */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap justify-between items-center text-[11px] text-white/25 tracking-wider">
          <p>&copy; {new Date().getFullYear()} {siteConfig.nombre}</p>
          <Link href="/politica-de-privacidad" className="hover:text-white/50 transition-colors duration-300">
            {t("footer.privacidad")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
