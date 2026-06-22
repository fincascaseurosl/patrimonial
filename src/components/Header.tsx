"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { serviceSlugs, serviceKeyMap } from "@/lib/site-config";
import { useLocale } from "next-intl";
import { useState, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Logo } from "./Logo";

export function Header() {
  const t = useTranslations("nav");
  const tServices = useTranslations("servicios");
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const allLocales = ["es", "ca", "en"] as const;
  const localeLabels: Record<(typeof allLocales)[number], string> = {
    es: "Español",
    ca: "Català",
    en: "English",
  };
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const servicesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const langTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Animate nav items on mount
  useGSAP(() => {
    if (!navRef.current) return;
    const children = Array.from(navRef.current.children);
    gsap.fromTo(
      children,
      { y: -8, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.06,
        ease: "power3.out",
        delay: 0.2,
        immediateRender: false,
      }
    );
  }, { scope: navRef });

  // Animate mobile menu
  useGSAP(() => {
    if (!mobileMenuRef.current || !mobileMenuOpen) return;
    gsap.fromTo(
      mobileMenuRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power3.out", immediateRender: false }
    );
    const items = Array.from(mobileMenuRef.current.querySelectorAll("a, button, .mobile-services-group"));
    gsap.fromTo(
      items,
      { y: 12, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.35,
        stagger: 0.05,
        ease: "power3.out",
        delay: 0.1,
        immediateRender: false,
      }
    );
  }, { dependencies: [mobileMenuOpen] });

  const navItems = [
    { href: "/" as const, label: t("inicio"), hasDropdown: false },
    { href: "/servicios" as const, label: t("servicios"), hasDropdown: true },
    { href: "/portfolio" as const, label: t("portfolio"), hasDropdown: false },
    { href: "/sobre-nosotros" as const, label: t("sobreNosotros"), hasDropdown: false },
    { href: "/contacto" as const, label: t("contacto"), hasDropdown: false },
  ];

  const handleServicesEnter = () => {
    if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current);
    setServicesOpen(true);
  };

  const handleServicesLeave = () => {
    servicesTimeoutRef.current = setTimeout(() => setServicesOpen(false), 150);
  };

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50">
      {/* Main nav */}
      <nav
        className={`transition-all duration-500 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.06)]"
            : "bg-gradient-to-b from-black/40 to-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-[72px]">
          <Link
            href="/"
            className={`relative flex items-center h-[72px] px-1 transition-all duration-500 cursor-grow`}
            aria-label={`Patrimonial — ${t("inicio")}`}
          >
            <Logo variant={scrolled ? "dark" : "light"} />
          </Link>

          {/* Desktop nav */}
          <div ref={navRef} className="hidden lg:flex items-center gap-1">
            {navItems.map((item) =>
              item.hasDropdown ? (
                /* Servicios with dropdown */
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={handleServicesEnter}
                  onMouseLeave={handleServicesLeave}
                  onFocus={handleServicesEnter}
                  onBlur={handleServicesLeave}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setServicesOpen(false);
                  }}
                >
                  <Link
                    href={item.href}
                    aria-haspopup="menu"
                    aria-expanded={servicesOpen}
                    aria-controls="servicios-menu"
                    className={`relative flex items-center gap-1 px-4 py-2 text-[13px] font-medium tracking-wide uppercase transition-all duration-300 ${
                      pathname.startsWith("/servicios")
                        ? scrolled
                          ? "text-[var(--color-dark)]"
                          : "text-white"
                        : scrolled
                        ? "text-[var(--color-text-light)] hover:text-[var(--color-dark)]"
                        : "text-white/90 hover:text-white"
                    }`}
                  >
                    {item.label}
                    <svg
                      className={`w-3 h-3 transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                    {pathname.startsWith("/servicios") && (
                      <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[var(--color-primary)]" />
                    )}
                  </Link>

                  {/* Dropdown panel */}
                  <div
                    id="servicios-menu"
                    role="menu"
                    className={`absolute top-full left-0 pt-2 transition-all duration-200 ${
                      servicesOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"
                    }`}
                  >
                    <div className="bg-white shadow-lg border border-gray-100 py-3 min-w-[280px]">
                      {serviceSlugs.map((slug) => {
                        const key = serviceKeyMap[slug];
                        return (
                          <Link
                            key={slug}
                            href={{ pathname: "/servicios/[slug]", params: { slug } }}
                            className="flex items-center gap-3 px-5 py-2.5 text-[13px] text-[var(--color-text-light)] hover:text-[var(--color-dark)] hover:bg-[var(--color-gray-light)] transition-all duration-200"
                          >
                            {tServices(`items.${key}.nombre`)}
                          </Link>
                        );
                      })}
                      <div className="border-t border-gray-100 mt-2 pt-2 px-5">
                        <Link
                          href="/servicios"
                          className="flex items-center gap-2 py-2 text-[12px] font-semibold tracking-wider uppercase text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors duration-200"
                        >
                          {t("verTodos") || "Ver todos"}
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 text-[13px] font-medium tracking-wide uppercase transition-all duration-300 ${
                    pathname === item.href
                      ? scrolled
                        ? "text-[var(--color-dark)]"
                        : "text-white"
                      : scrolled
                      ? "text-[var(--color-text-light)] hover:text-[var(--color-dark)]"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  {item.label}
                  {pathname === item.href && (
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[var(--color-primary)]" />
                  )}
                </Link>
              )
            )}

            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-current/10">
              {/* Language dropdown */}
              <div
                className="relative"
                onMouseEnter={() => {
                  if (langTimeoutRef.current) clearTimeout(langTimeoutRef.current);
                  setLangOpen(true);
                }}
                onMouseLeave={() => {
                  langTimeoutRef.current = setTimeout(() => setLangOpen(false), 150);
                }}
              >
                <button
                  type="button"
                  onClick={() => setLangOpen((v) => !v)}
                  className={`flex items-center gap-1 text-[12px] font-medium tracking-wider uppercase transition-colors duration-300 ${
                    scrolled
                      ? "text-[var(--color-text-muted)] hover:text-[var(--color-dark)]"
                      : "text-white/80 hover:text-white"
                  }`}
                  aria-haspopup="menu"
                  aria-expanded={langOpen}
                >
                  {locale.toUpperCase()}
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div
                  className={`absolute top-full right-0 pt-2 transition-all duration-200 ${
                    langOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"
                  }`}
                  role="menu"
                >
                  <div className="bg-white shadow-lg border border-gray-100 py-2 min-w-[140px]">
                    {allLocales.map((l) => {
                      const active = l === locale;
                      return (
                        <button
                          key={l}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            router.replace(pathname as "/", { locale: l });
                            setLangOpen(false);
                          }}
                          className={`flex items-center justify-between w-full px-4 py-2 text-[12px] tracking-wider uppercase transition-colors duration-200 ${
                            active
                              ? "text-[var(--color-primary)] font-semibold"
                              : "text-[var(--color-text-light)] hover:text-[var(--color-dark)] hover:bg-[var(--color-gray-light)]"
                          }`}
                        >
                          <span>{l.toUpperCase()}</span>
                          <span className="text-[10px] normal-case tracking-normal text-[var(--color-text-muted)]">
                            {localeLabels[l]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Link
                href="/contacto"
                className={`px-5 py-2 text-[12px] font-semibold tracking-wider uppercase transition-all duration-300 btn-press ${
                  scrolled
                    ? "bg-[var(--color-dark)] text-white hover:bg-[var(--color-dark-lighter)]"
                    : "bg-white text-[var(--color-dark)] hover:bg-white/90"
                }`}
              >
                {t("presupuesto")}
              </Link>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className={`lg:hidden p-2 transition-colors duration-300 ${
              scrolled ? "text-[var(--color-dark)]" : "text-white"
            }`}
            aria-label={
              locale === "ca"
                ? "Obrir menú"
                : locale === "en"
                ? "Open menu"
                : "Abrir menú"
            }
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={`block h-[1.5px] bg-current transition-all duration-300 origin-center ${
                  mobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] bg-current transition-all duration-300 ${
                  mobileMenuOpen ? "opacity-0 scale-x-0" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] bg-current transition-all duration-300 origin-center ${
                  mobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            id="mobile-menu"
            className="lg:hidden bg-white border-t border-gray-100"
          >
            <div className="px-6 py-6 space-y-1">
              {navItems.map((item) =>
                item.hasDropdown ? (
                  <div key={item.href} className="mobile-services-group">
                    <button
                      onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                      aria-expanded={mobileServicesOpen}
                      className={`flex items-center justify-between w-full px-3 py-3 text-[14px] font-medium tracking-wide uppercase transition-colors duration-300 ${
                        pathname.startsWith("/servicios")
                          ? "text-[var(--color-dark)] border-l-2 border-[var(--color-primary)] pl-4"
                          : "text-[var(--color-text-light)]"
                      }`}
                    >
                      {item.label}
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${mobileServicesOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {mobileServicesOpen && (
                      <div className="pl-5 pb-2 space-y-0.5">
                        {serviceSlugs.map((slug) => {
                          const key = serviceKeyMap[slug];
                          return (
                            <Link
                              key={slug}
                              href={{ pathname: "/servicios/[slug]", params: { slug } }}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block px-3 py-2 text-[13px] text-[var(--color-text-light)] hover:text-[var(--color-dark)] transition-colors duration-200"
                            >
                              {tServices(`items.${key}.nombre`)}
                            </Link>
                          );
                        })}
                        <Link
                          href="/servicios"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 text-[12px] font-semibold tracking-wider uppercase text-[var(--color-primary)]"
                        >
                          {t("verTodos") || "Ver todos"}
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-3 text-[14px] font-medium tracking-wide uppercase transition-colors duration-300 ${
                      pathname === item.href
                        ? "text-[var(--color-dark)] border-l-2 border-[var(--color-primary)] pl-4"
                        : "text-[var(--color-text-light)] hover:text-[var(--color-dark)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              )}
              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1">
                  {allLocales.map((l) => {
                    const active = l === locale;
                    return (
                      <button
                        key={l}
                        type="button"
                        onClick={() => {
                          router.replace(pathname as "/", { locale: l });
                          setMobileMenuOpen(false);
                        }}
                        className={`px-3 py-1.5 text-[12px] font-medium tracking-wider uppercase transition-colors duration-200 ${
                          active
                            ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                            : "text-[var(--color-text-muted)] hover:text-[var(--color-dark)]"
                        }`}
                        aria-current={active ? "true" : undefined}
                      >
                        {l.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
                <Link
                  href="/contacto"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-2.5 bg-[var(--color-dark)] text-white text-[12px] font-semibold tracking-wider uppercase btn-press"
                >
                  {t("presupuesto")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
