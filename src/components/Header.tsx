"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site-config";
import { useLocale } from "next-intl";
import { useState } from "react";

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const otherLocale = locale === "es" ? "ca" : "es";

  const navItems = [
    { href: "/" as const, label: t("inicio") },
    { href: "/servicios" as const, label: t("servicios") },
    { href: "/portfolio" as const, label: t("portfolio") },
    { href: "/sobre-nosotros" as const, label: t("sobreNosotros") },
    { href: "/contacto" as const, label: t("contacto") },
  ];

  return (
    <header className="w-full">
      {/* Top bar */}
      <div className="bg-[var(--color-dark)] text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-6">
            <a href={siteConfig.telefonoFijoHref} className="hover:text-[var(--color-primary)] transition-colors">
              {siteConfig.telefonoFijo}
            </a>
            <span className="hidden sm:inline text-gray-400">{siteConfig.direccion}</span>
          </div>
          <a href={`mailto:${siteConfig.email}`} className="hover:text-[var(--color-primary)] transition-colors">
            {siteConfig.email}
          </a>
        </div>
      </div>

      {/* Main nav */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[var(--color-dark)]">
            <span className="text-[var(--color-primary)]">PATRIMONIAL</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "text-[var(--color-primary)] bg-amber-50"
                    : "text-gray-700 hover:text-[var(--color-primary)] hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Language switcher */}
            <button
              onClick={() => router.replace(pathname as "/", { locale: otherLocale })}
              className="ml-2 px-3 py-1 border border-gray-300 rounded text-xs font-semibold text-gray-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
            >
              {otherLocale.toUpperCase()}
            </button>

            <Link
              href="/contacto"
              className="ml-3 px-5 py-2 bg-[var(--color-primary)] text-[var(--color-dark)] rounded-md text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              {t("presupuesto")}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-md text-sm font-medium ${
                    pathname === item.href
                      ? "text-[var(--color-primary)] bg-amber-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  router.replace(pathname as "/", { locale: otherLocale });
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 rounded-md text-sm font-medium text-gray-500"
              >
                {otherLocale === "ca" ? "Català" : "Español"}
              </button>
              <Link
                href="/contacto"
                onClick={() => setMobileMenuOpen(false)}
                className="block mt-2 px-4 py-2 bg-[var(--color-primary)] text-center text-[var(--color-dark)] rounded-md text-sm font-bold"
              >
                {t("presupuesto")}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
