import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig, serviceSlugs, serviceKeyMap } from "@/lib/site-config";

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-[var(--color-dark)] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">
              <span className="text-[var(--color-primary)]">PATRIMONIAL</span>
            </h3>
            <p className="text-sm leading-relaxed mb-4">
              {t("footer.descripcion")}
            </p>
            <div className="flex gap-3 mt-4">
              <img
                src="/images/logo/eu.png"
                alt={t("footer.financiadoUE")}
                className="h-10 object-contain"
              />
              <img
                src="/images/logo/prtr.png"
                alt={t("footer.prtr")}
                className="h-10 object-contain"
              />
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t("footer.menu")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">
                  {t("nav.inicio")}
                </Link>
              </li>
              <li>
                <Link href="/sobre-nosotros" className="hover:text-[var(--color-primary)] transition-colors">
                  {t("nav.sobreNosotros")}
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-[var(--color-primary)] transition-colors">
                  {t("nav.portfolio")}
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-[var(--color-primary)] transition-colors">
                  {t("nav.contacto")}
                </Link>
              </li>
              <li>
                <Link href="/politica-de-privacidad" className="hover:text-[var(--color-primary)] transition-colors">
                  {t("footer.privacidad")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t("footer.serviciosTitle")}</h4>
            <ul className="space-y-2 text-sm">
              {serviceSlugs.map((slug) => {
                const key = serviceKeyMap[slug];
                return (
                  <li key={slug}>
                    <Link
                      href={{ pathname: "/servicios/[slug]", params: { slug } }}
                      className="hover:text-[var(--color-primary)] transition-colors"
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
            <h4 className="text-white font-semibold mb-4">{t("footer.contactoTitle")}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 text-[var(--color-primary)] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{siteConfig.direccion}<br />{siteConfig.cp} {siteConfig.ciudad}</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--color-primary)] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <a href={siteConfig.telefonoFijoHref} className="hover:text-[var(--color-primary)]">
                  {siteConfig.telefonoFijo}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--color-primary)] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <a href={`mailto:${siteConfig.email}`} className="hover:text-[var(--color-primary)]">
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--color-primary)] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>{siteConfig.horario}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} {siteConfig.nombre}. {t("footer.legal")}</p>
          <Link href="/politica-de-privacidad" className="hover:text-gray-300">
            {t("footer.privacidad")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
